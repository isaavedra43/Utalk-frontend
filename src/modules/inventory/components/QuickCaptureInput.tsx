import React, { useState, useRef, useEffect } from 'react';
import { Plus, Zap, Settings, Layers } from 'lucide-react';
import { validateLength, validateStandardWidth, calculateLinearMeters } from '../utils/calculations';

interface QuickCaptureInputProps {
  standardWidth: number;
  onAddPiece: (length: number) => boolean;
  onAddMultiplePieces: (lengths: number[]) => void;
  onChangeWidth: (width: number) => void;
}

export const QuickCaptureInput: React.FC<QuickCaptureInputProps> = ({
  standardWidth,
  onAddPiece,
  onAddMultiplePieces,
  onChangeWidth
}) => {
  const [length, setLength] = useState('');
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempWidth, setTempWidth] = useState(standardWidth.toString());
  const [showBatchMode, setShowBatchMode] = useState(false);
  const [batchData, setBatchData] = useState({ count: '', length: '' });
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus en el input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Calcular preview de metros lineales
  const previewMeters = length ? calculateLinearMeters(parseFloat(length) || 0, standardWidth) : 0;

  // Manejar agregar pieza
  const handleAdd = () => {
    const lengthValue = parseFloat(length);
    
    if (!length.trim()) {
      setError('Ingresa una longitud');
      return;
    }

    const validation = validateLength(lengthValue);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    const success = onAddPiece(lengthValue);
    if (success) {
      setLength('');
      setError('');
      inputRef.current?.focus();
    }
  };

  // Manejar Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      setLength('');
      setError('');
    }
  };

  // Manejar cambio de ancho
  const handleChangeWidth = () => {
    const newWidth = parseFloat(tempWidth);
    const validation = validateStandardWidth(newWidth);
    
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    onChangeWidth(newWidth);
    setShowSettings(false);
    setError('');
  };

  // Manejar modo por lotes
  const handleBatchAdd = () => {
    const count = parseInt(batchData.count);
    const lengthValue = parseFloat(batchData.length);

    if (!count || count <= 0) {
      setError('Ingresa cantidad válida');
      return;
    }

    const validation = validateLength(lengthValue);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    const lengths = Array(count).fill(lengthValue);
    onAddMultiplePieces(lengths);
    
    setBatchData({ count: '', length: '' });
    setShowBatchMode(false);
    setError('');
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Captura Rápida
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ancho Estándar (m)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={tempWidth}
              onChange={(e) => setTempWidth(e.target.value)}
              step="0.01"
              min="0.01"
              max="5"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleChangeWidth}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aplicar
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Cambiará el ancho para todas las piezas futuras
          </p>
        </div>
      )}

      {/* Main Capture */}
      <div className="p-6">
        {!showBatchMode ? (
          <>
            {/* Standard Width Display */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600 font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Ancho Estándar
                </span>
                <span className="text-2xl font-bold text-blue-900">{standardWidth.toFixed(2)} m</span>
              </div>
            </div>

            {/* Length Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitud de la Pieza (metros)
              </label>
              <input
                ref={inputRef}
                type="number"
                value={length}
                onChange={(e) => {
                  setLength(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                step="0.01"
                min="0.01"
                max="10"
                placeholder="Ej: 2.15"
                className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
            </div>

            {/* Preview */}
            {length && !error && (
              <div className="bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600 font-medium">Metros Lineales</span>
                  <span className="text-2xl font-bold text-green-900">{previewMeters.toFixed(3)}</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {length} m × {standardWidth.toFixed(2)} m
                </p>
              </div>
            )}

            {/* Add Button */}
            <button
              onClick={handleAdd}
              disabled={!length || !!error}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl"
            >
              <Plus className="h-6 w-6" />
              Agregar Pieza
            </button>

            {/* Keyboard Shortcuts */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-medium mb-2">Atajos de Teclado:</p>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Agregar pieza:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded">Enter</span>
                </div>
                <div className="flex justify-between">
                  <span>Limpiar campo:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded">Esc</span>
                </div>
              </div>
            </div>

            {/* Batch Mode Button */}
            <button
              onClick={() => setShowBatchMode(true)}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <Layers className="h-4 w-4" />
              Modo Por Lotes
            </button>
          </>
        ) : (
          <>
            {/* Batch Mode */}
            <h4 className="font-bold text-gray-900 mb-4">Agregar Múltiples Piezas</h4>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad de Piezas
                </label>
                <input
                  type="number"
                  value={batchData.count}
                  onChange={(e) => setBatchData({ ...batchData, count: e.target.value })}
                  min="1"
                  max="100"
                  placeholder="Ej: 10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitud de Cada Pieza (m)
                </label>
                <input
                  type="number"
                  value={batchData.length}
                  onChange={(e) => setBatchData({ ...batchData, length: e.target.value })}
                  step="0.01"
                  min="0.01"
                  placeholder="Ej: 2.15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {batchData.count && batchData.length && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                  Se agregarán <strong>{batchData.count} piezas</strong> de <strong>{parseFloat(batchData.length).toFixed(2)}m</strong> cada una
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 mb-3">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowBatchMode(false);
                  setBatchData({ count: '', length: '' });
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleBatchAdd}
                disabled={!batchData.count || !batchData.length}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Agregar Lote
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

