import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, CheckCircle, AlertCircle, Loader2, Edit2, Trash2, Save } from 'lucide-react';
import { callOpenAI } from '../../../config/ai';
import { useNotifications } from '../../../contexts/NotificationContext';
import { SpeechNotSupported } from './SpeechNotSupported';

interface VoiceDictationModalProps {
  isOpen: boolean;
  onClose: () => void;
  platformId: string;
  standardWidth: number;
  availableMaterials: string[];
  onAddPieces: (pieces: { length: number; material: string }[]) => void;
}

interface DictatedPiece {
  id: string;
  length: number;
  material: string;
  confidence: number;
  isEditing?: boolean;
}

export const VoiceDictationModal: React.FC<VoiceDictationModalProps> = ({
  isOpen,
  onClose,
  platformId,
  standardWidth,
  availableMaterials,
  onAddPieces
}) => {
  const { showSuccess } = useNotifications();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedPieces, setProcessedPieces] = useState<DictatedPiece[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [error, setError] = useState('');
  const [editingPiece, setEditingPiece] = useState<DictatedPiece | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef('');

  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsSpeechSupported(true);
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            transcriptRef.current += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(transcriptRef.current + interimTranscript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Error de reconocimiento de voz:', event.error);
        setError(`Error de reconocimiento: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Procesar transcripción con IA
  const processTranscriptWithAI = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setError('');

    try {
      const prompt = `
Analiza el siguiente texto dictado y extrae las longitudes de piezas de materiales de construcción.
El texto puede contener números como "2.5", "tres punto cinco", "dos metros y medio", etc.
Devuelve únicamente un JSON válido con un array de objetos con formato:
[{"length": 2.5, "confidence": 0.9}, {"length": 3.2, "confidence": 0.8}]

Texto a analizar: "${text}"

Solo devuelve el JSON, sin texto adicional. Si no encuentras longitudes válidas, devuelve un array vacío [].
      `;

      const response = await callOpenAI(prompt, '', {
        temperature: 0.1,
        max_tokens: 1000
      });

      const cleanedResponse = response.trim();
      const pieces = JSON.parse(cleanedResponse);

      if (Array.isArray(pieces)) {
        const newPieces = pieces.map((piece: any, index: number) => ({
          id: `piece-${Date.now()}-${index}`,
          ...piece,
          material: selectedMaterial || 'Sin especificar'
        }));
        addNewPieces(newPieces);
      }

    } catch (error) {
      console.error('Error procesando con IA:', error);
      setError('Error procesando el texto con IA. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Iniciar/detener reconocimiento de voz
  const toggleListening = async () => {
    if (!isSpeechSupported) {
      setError('El reconocimiento de voz no está disponible en este navegador');
      return;
    }

    if (!recognitionRef.current) {
      setError('Error interno: reconocimiento de voz no inicializado');
      return;
    }

    try {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        // Limpiar solo el transcript, mantener las piezas procesadas
        transcriptRef.current = '';
        setTranscript('');
        setError('');
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error con reconocimiento de voz:', error);
      setError('Error iniciando reconocimiento de voz');
    }
  };

  // Función para agregar nuevas piezas sin limpiar las existentes
  const addNewPieces = (newPieces: DictatedPiece[]) => {
    setProcessedPieces(prev => [...prev, ...newPieces]);
  };

  // Procesar transcripción cuando el usuario deja de hablar
  useEffect(() => {
    if (!isListening && transcript.trim()) {
      const timer = setTimeout(() => {
        processTranscriptWithAI(transcript);
      }, 1000); // Esperar 1 segundo después de dejar de hablar

      return () => clearTimeout(timer);
    }
  }, [isListening, transcript]);

  // Funciones para editar piezas individuales
  const startEditingPiece = (piece: DictatedPiece) => {
    setEditingPiece({ ...piece });
  };

  const saveEditedPiece = () => {
    if (!editingPiece) return;

    setProcessedPieces(prev => 
      prev.map(piece => 
        piece.id === editingPiece.id ? editingPiece : piece
      )
    );
    setEditingPiece(null);
  };

  const cancelEditingPiece = () => {
    setEditingPiece(null);
  };

  const deletePiece = (pieceId: string) => {
    setProcessedPieces(prev => prev.filter(piece => piece.id !== pieceId));
  };

  const updateEditingPiece = (field: 'length' | 'material', value: string | number) => {
    if (!editingPiece) return;
    
    setEditingPiece(prev => prev ? {
      ...prev,
      [field]: field === 'length' ? parseFloat(value.toString()) || 0 : value
    } : null);
  };

  // Guardar piezas procesadas
  const handleSavePieces = () => {
    if (processedPieces.length === 0) return;

    const piecesToAdd = processedPieces
      .filter(piece => piece.length > 0) // Solo validar que tenga longitud válida
      .map(piece => ({
        length: piece.length,
        material: piece.material || 'Sin especificar'
      }));

    if (piecesToAdd.length > 0) {
      onAddPieces(piecesToAdd);
      showSuccess('Dictado completado', `Se agregaron ${piecesToAdd.length} piezas desde el dictado`);
      onClose();
    }
  };

  // Limpiar al cerrar
  useEffect(() => {
    if (!isOpen) {
      setTranscript('');
      setProcessedPieces([]);
      setError('');
      setIsListening(false);
      setEditingPiece(null);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Dictar Longitudes</h2>
              <p className="text-sm text-gray-600 mt-1">
                Di las longitudes de las piezas (ej: "dos punto cinco, tres punto dos")
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Speech Not Supported Warning */}
            {!isSpeechSupported && (
              <div className="mb-4">
                <SpeechNotSupported />
              </div>
            )}

            {/* Material Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material por defecto (opcional)
              </label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sin material por defecto</option>
                {availableMaterials.map((material) => (
                  <option key={material} value={material}>
                    {material}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Puedes editar el material de cada pieza individualmente después del dictado
              </p>
            </div>

            {/* Voice Input */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Dictado de voz
                </label>
                <button
                  onClick={toggleListening}
                  disabled={isProcessing}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isListening
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      Detener
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      {isProcessing ? 'Procesando...' : 'Iniciar Dictado'}
                    </>
                  )}
                </button>
              </div>

              {isListening && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Escuchando... Di las longitudes ahora
                </div>
              )}

              {transcript && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600">
                    <strong>Texto reconocido:</strong>
                  </p>
                  <p className="text-sm text-gray-800 mt-1">{transcript}</p>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Processed Pieces */}
            {processedPieces.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Piezas procesadas ({processedPieces.length})
                  </h3>
                  <button
                    onClick={() => setProcessedPieces([])}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Limpiar todo
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {processedPieces.map((piece) => (
                    <div
                      key={piece.id}
                      className="p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      {editingPiece?.id === piece.id ? (
                        // Modo edición
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editingPiece.length}
                              onChange={(e) => updateEditingPiece('length', e.target.value)}
                              step="0.01"
                              min="0.01"
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              placeholder="Longitud"
                            />
                            <span className="text-sm text-gray-600">m</span>
                          </div>
                          <select
                            value={editingPiece.material}
                            onChange={(e) => updateEditingPiece('material', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Sin especificar">Sin especificar</option>
                            {availableMaterials.map((material) => (
                              <option key={material} value={material}>
                                {material}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={saveEditedPiece}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              <Save className="w-3 h-3" />
                              Guardar
                            </button>
                            <button
                              onClick={cancelEditingPiece}
                              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Modo visualización
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-800 font-medium">
                              {piece.length.toFixed(2)}m
                            </span>
                            <span className="text-xs text-gray-500">
                              ({Math.round(piece.confidence * 100)}% confianza)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {piece.material}
                            </span>
                            <button
                              onClick={() => startEditingPiece(piece)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Editar pieza"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deletePiece(piece.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Eliminar pieza"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="mb-4 flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Procesando con IA...</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSavePieces}
              disabled={processedPieces.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Agregar {processedPieces.length} piezas
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
