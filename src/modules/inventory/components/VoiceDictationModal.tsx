import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, CheckCircle, AlertCircle, Loader2, Edit, Trash2, Save } from 'lucide-react';
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
  platformId: _platformId,
  standardWidth: _standardWidth,
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
  const processingRef = useRef<boolean>(false);

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

        const fullTranscript = transcriptRef.current + interimTranscript;
        console.log('🎤 Transcripción actualizada:', fullTranscript);
        setTranscript(fullTranscript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('❌ Error de reconocimiento de voz:', event.error);
        
        let errorMessage = 'Error de reconocimiento de voz';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No se detectó habla. Intenta hablar más fuerte.';
            break;
          case 'audio-capture':
            errorMessage = 'Error accediendo al micrófono. Verifica los permisos.';
            break;
          case 'not-allowed':
            errorMessage = 'Permiso denegado para usar el micrófono.';
            break;
          case 'network':
            errorMessage = 'Error de red. Verifica tu conexión.';
            break;
          case 'aborted':
            errorMessage = 'Reconocimiento interrumpido.';
            break;
          default:
            errorMessage = `Error de reconocimiento: ${event.error}`;
        }
        
        setError(errorMessage);
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
    if (!text.trim() || processingRef.current) {
      console.log('⚠️ Procesamiento omitido:', { text: text.trim(), isProcessing: processingRef.current });
      return;
    }

    console.log('🔄 Iniciando procesamiento de transcripción:', text);
    processingRef.current = true;
    setIsProcessing(true);
    setError('');

    try {
      const prompt = `
Analiza el siguiente texto dictado y extrae las longitudes de líneas de materiales de construcción.
El texto puede contener números como "2.5", "tres punto cinco", "dos metros y medio", etc.
Devuelve únicamente un JSON válido con un array de objetos con formato:
[{"length": 2.5, "confidence": 0.9}, {"length": 3.2, "confidence": 0.8}]

Texto a analizar: "${text}"

Solo devuelve el JSON, sin texto adicional. Si no encuentras longitudes válidas, devuelve un array vacío [].
      `;

      console.log('📝 Enviando prompt a OpenAI para procesar:', text);
      const response = await callOpenAI(prompt, '', {
        temperature: 0.1,
        max_tokens: 1000
      });

      console.log('✅ Respuesta recibida de OpenAI:', response);
      const cleanedResponse = String(response).trim();
      const pieces = JSON.parse(cleanedResponse);

      console.log('📊 Piezas extraídas:', pieces);
      if (Array.isArray(pieces) && pieces.length > 0) {
        const newPieces = pieces.map((piece: { length: number; confidence: number }, index: number) => ({
          id: `piece-${Date.now()}-${index}`,
          ...piece,
          material: selectedMaterial || 'Sin especificar'
        }));
        console.log('✅ Agregando nuevas piezas:', newPieces);
        addNewPieces(newPieces);
      } else {
        console.log('⚠️ No se encontraron longitudes válidas en el texto');
        setError('No se detectaron longitudes válidas en el dictado. Intenta hablar más claro.');
      }

    } catch (error) {
      console.error('❌ Error procesando con IA:', error);
      let errorMessage = 'Error procesando el texto con IA. Inténtalo de nuevo.';
      
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          errorMessage = 'Error interpretando la respuesta de IA. Intenta dictar más claramente.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Error de conexión con IA. Verifica tu internet.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
      console.log('✅ Procesamiento completado');
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
        console.log('🛑 Deteniendo reconocimiento de voz');
        recognitionRef.current.stop();
      } else {
        // Limpiar solo el transcript, mantener las líneas procesadas
        console.log('🎤 Iniciando reconocimiento de voz');
        transcriptRef.current = '';
        setTranscript('');
        setError('');
        
        // Verificar que no esté procesando antes de iniciar
        if (processingRef.current) {
          console.log('⚠️ No se puede iniciar reconocimiento: ya hay un procesamiento en curso');
          setError('Espera a que termine el procesamiento actual');
          return;
        }
        
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('❌ Error con reconocimiento de voz:', error);
      let errorMessage = 'Error iniciando reconocimiento de voz';
      
      if (error instanceof Error) {
        if (error.message.includes('already started')) {
          errorMessage = 'El reconocimiento ya está activo';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Permiso denegado para usar el micrófono';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
    }
  };

  // Función para agregar nuevas líneas sin limpiar las existentes
  const addNewPieces = (newPieces: DictatedPiece[]) => {
    setProcessedPieces((prev: DictatedPiece[]) => [...prev, ...newPieces]);
  };

  // Procesar transcripción cuando el usuario deja de hablar
  useEffect(() => {
    if (!isListening && transcript.trim() && !processingRef.current) {
      console.log('⏰ Programando procesamiento de transcripción:', transcript);
      const timer = setTimeout(() => {
        // Verificar nuevamente que no esté procesando antes de ejecutar
        if (!processingRef.current) {
          processTranscriptWithAI(transcript);
        }
      }, 1500); // Aumentar a 1.5 segundos para dar más tiempo

      return () => {
        console.log('🧹 Limpiando timer de procesamiento');
        clearTimeout(timer);
      };
    }
  }, [isListening, transcript]);

  // Funciones para editar líneas individuales
  const startEditingPiece = (piece: DictatedPiece) => {
    setEditingPiece({ ...piece });
  };

  const saveEditedPiece = () => {
    if (!editingPiece) return;

    setProcessedPieces((prev: DictatedPiece[]) => 
      prev.map((piece: DictatedPiece) => 
        piece.id === editingPiece.id ? editingPiece : piece
      )
    );
    setEditingPiece(null);
  };

  const cancelEditingPiece = () => {
    setEditingPiece(null);
  };

  const deletePiece = (pieceId: string) => {
    setProcessedPieces((prev: DictatedPiece[]) => prev.filter((piece: DictatedPiece) => piece.id !== pieceId));
  };

  const updateEditingPiece = (field: 'length' | 'material', value: string | number) => {
    if (!editingPiece) return;
    
    setEditingPiece((prev: DictatedPiece | null) => prev ? {
      ...prev,
      [field]: field === 'length' ? parseFloat(value.toString()) || 0 : value
    } : null);
  };

  // Guardar líneas procesadas
  const handleSavePieces = () => {
    if (processedPieces.length === 0) return;

    const piecesToAdd = processedPieces
      .filter((piece: DictatedPiece) => piece.length > 0) // Solo validar que tenga longitud válida
      .map((piece: DictatedPiece) => ({
        length: piece.length,
        material: piece.material || 'Sin especificar'
      }));

    if (piecesToAdd.length > 0) {
      onAddPieces(piecesToAdd);
      showSuccess('Dictado completado', `Se agregaron ${piecesToAdd.length} líneas desde el dictado`);
      onClose();
    }
  };

  // Limpiar al cerrar
  useEffect(() => {
    if (!isOpen) {
      console.log('🧹 Limpiando estado del modal de dictado');
      setTranscript('');
      setProcessedPieces([]);
      setError('');
      setIsListening(false);
      setEditingPiece(null);
      processingRef.current = false; // Resetear flag de procesamiento
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.warn('⚠️ Error deteniendo reconocimiento al cerrar:', error);
        }
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
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Dictar Longitudes</h2>
              <p className="text-sm text-gray-600 mt-1">
                Di las longitudes de las líneas (ej: "dos punto cinco, tres punto dos")
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
          <div className="flex-1 overflow-y-auto p-6">
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
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMaterial(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sin material por defecto</option>
                {availableMaterials.map((material: string) => (
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
                    Líneas procesadas ({processedPieces.length})
                  </h3>
                  <button
                    onClick={() => setProcessedPieces([])}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Limpiar todo
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {processedPieces.map((piece: DictatedPiece) => (
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
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEditingPiece('length', e.target.value)}
                              step="0.01"
                              min="0.01"
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              placeholder="Longitud"
                            />
                            <span className="text-sm text-gray-600">m</span>
                          </div>
                          <select
                            value={editingPiece.material}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateEditingPiece('material', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Sin especificar">Sin especificar</option>
                            {availableMaterials.map((material: string) => (
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
                              <Edit className="w-3 h-3" />
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
          <div className="flex-shrink-0 flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white">
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
              Agregar {processedPieces.length} líneas
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
