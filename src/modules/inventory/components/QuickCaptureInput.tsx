import React, { useState, useRef, useEffect } from 'react';
import { Plus, Zap, Settings, Layers, Search, Check, Eye, EyeOff } from 'lucide-react';
import { validateLength, validateStandardWidth, calculateLinearMeters } from '../utils/calculations';
import { useConfiguration } from '../hooks/useConfiguration';
import type { MaterialOption } from '../types';

interface QuickCaptureInputProps {
  standardWidth: number;
  availableMaterials: string[]; // Materiales disponibles en la plataforma
  onAddPiece: (length: number, material: string) => boolean;
  onAddMultiplePieces: (pieces: { length: number; material: string }[]) => void;
  onChangeWidth: (width: number) => void;
}

export const QuickCaptureInput: React.FC<QuickCaptureInputProps> = ({
  standardWidth,
  availableMaterials,
  onAddPiece,
  onAddMultiplePieces,
  onChangeWidth
}) => {
  const { activeMaterials } = useConfiguration();
  
  const [length, setLength] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(availableMaterials[0] || '');
  const [materialSearch, setMaterialSearch] = useState('');
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempWidth, setTempWidth] = useState(standardWidth.toString());
  const [showBatchMode, setShowBatchMode] = useState(false);
  const [batchData, setBatchData] = useState({ count: '', length: '', material: availableMaterials[0] || '' });
  const [showMaterialInput, setShowMaterialInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar materiales disponibles - MOSTRAR TODOS LOS MATERIALES (no solo los de la plataforma)
  const filteredMaterials = activeMaterials.filter(material =>
    material.name.toLowerCase().includes(materialSearch.toLowerCase())
  );

  // Autofocus en el input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ✅ ELIMINADO: Ya NO se crean datos falsos automáticamente
  // Si no hay materiales, el usuario debe crear proveedores y materiales primero
  useEffect(() => {
    if (activeMaterials.length === 0) {
      console.log('ℹ️ No hay materiales configurados - El usuario debe crear proveedores y materiales en la configuración');
    }
  }, [activeMaterials.length]);

  // ✅ LIMPIAR ERRORES AUTOMÁTICAMENTE - Material es opcional
  useEffect(() => {
    if (error && error.includes('material')) {
      setError('');
    }
  }, [error]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMaterialDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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

    // ✅ MATERIAL ES OPCIONAL - usar material seleccionado o "Sin especificar"
    const materialToUse = selectedMaterial || materialSearch || 'Sin especificar';

    const validation = validateLength(lengthValue);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    // ✅ LIMPIAR CUALQUIER ERROR DE MATERIAL
    setError('');

    const success = onAddPiece(lengthValue, materialToUse);
    if (success) {
      setLength('');
      setMaterialSearch('');
      setSelectedMaterial('');
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

    // ✅ MATERIAL ES OPCIONAL EN MODO LOTE TAMBIÉN
    const materialToUse = batchData.material || 'Sin especificar';

    const validation = validateLength(lengthValue);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    const pieces = Array(count).fill({ length: lengthValue, material: materialToUse });
    onAddMultiplePieces(pieces);
    
    setBatchData({ count: '', length: '', material: availableMaterials[0] || '' });
    setShowBatchMode(false);
    setError('');
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="truncate">Captura Rápida</span>
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowMaterialInput(!showMaterialInput)}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors active:scale-95 flex-shrink-0"
            title={showMaterialInput ? "Ocultar material" : "Mostrar material"}
          >
            {showMaterialInput ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors active:scale-95 flex-shrink-0"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 border-b border-gray-200 p-3 sm:p-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
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
              className="flex-1 px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleChangeWidth}
              className="px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium active:scale-95"
            >
              Aplicar
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Cambiará el ancho para todas las líneas futuras
          </p>
        </div>
      )}

      {/* Main Capture */}
      <div className="p-4 sm:p-6">
        {!showBatchMode ? (
          <>
            {/* Standard Width Display */}
            <div className="bg-blue-50 rounded-lg p-3 mb-3 sm:mb-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-blue-600 font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Ancho Estándar</span>
                </span>
                <span className="text-xl sm:text-2xl font-bold text-blue-900">{standardWidth.toFixed(2)} m</span>
              </div>
            </div>

            {/* Length Input - OPTIMIZADO PARA MÓVIL */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitud de la Pieza (metros)
              </label>
              <input
                ref={inputRef}
                type="number"
                inputMode="decimal"
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
                className={`w-full px-4 py-4 sm:py-3 text-xl sm:text-lg border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
            </div>

            {/* Material Selector - Solo se muestra si showMaterialInput es true */}
            {showMaterialInput && (
              <div className="mb-3 sm:mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material de la Pieza <span className="text-gray-500">(Opcional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={materialSearch}
                    onChange={(e) => {
                      setMaterialSearch(e.target.value);
                      setShowMaterialDropdown(true);
                    }}
                    onFocus={() => setShowMaterialDropdown(true)}
                    placeholder="Escribir material o buscar en la lista..."
                    className="w-full px-4 py-4 sm:py-3 text-xl sm:text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  
                  {/* Dropdown de materiales */}
                  {showMaterialDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredMaterials.map((material) => (
                        <button
                          key={material.id}
                          type="button"
                          onClick={() => {
                            setSelectedMaterial(material.name);
                            setMaterialSearch(material.name);
                            setShowMaterialDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-sm">{material.name}</div>
                            <div className="text-xs text-gray-500">{material.category}</div>
                          </div>
                          {selectedMaterial === material.name && (
                            <Check className="h-4 w-4 text-blue-600" />
                          )}
                        </button>
                      ))}
                      {filteredMaterials.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          {materialSearch ? 'No se encontraron materiales con ese nombre' : 'Escribe el nombre del material o selecciona uno de la lista'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preview */}
            {length && !error && (
              <div className="bg-green-50 rounded-lg p-3 mb-3 sm:mb-4 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-green-600 font-medium">Metros Lineales</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-900">{previewMeters.toFixed(3)}</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {length} m × {standardWidth.toFixed(2)} m
                </p>
              </div>
            )}

            {/* Add Button - GRANDE Y TÁCTIL PARA MÓVIL */}
            <button
              onClick={handleAdd}
              disabled={!length || !!error}
              className="w-full flex items-center justify-center gap-2 px-6 py-5 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl sm:text-lg shadow-lg hover:shadow-xl active:scale-98"
            >
              <Plus className="h-7 w-7 sm:h-6 sm:w-6" />
              <span>Agregar Pieza</span>
            </button>

            {/* Keyboard Shortcuts - Oculto en móvil */}
            <div className="mt-3 sm:mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hidden sm:block">
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
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 sm:py-2 border-2 border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm sm:text-base active:scale-95"
            >
              <Layers className="h-4 w-4" />
              Modo Por Lotes
            </button>
          </>
        ) : (
          <>
            {/* Batch Mode */}
            <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">Agregar Múltiples Líneas</h4>
            
            <div className="space-y-3 mb-3 sm:mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad de Líneas
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={batchData.count}
                  onChange={(e) => setBatchData({ ...batchData, count: e.target.value })}
                  min="1"
                  max="100"
                  placeholder="Ej: 10"
                  className="w-full px-3 py-3 sm:py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitud de Cada Pieza (m)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={batchData.length}
                  onChange={(e) => setBatchData({ ...batchData, length: e.target.value })}
                  step="0.01"
                  min="0.01"
                  placeholder="Ej: 2.15"
                  className="w-full px-3 py-3 sm:py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material de las Líneas
                </label>
                <select
                  value={batchData.material}
                  onChange={(e) => setBatchData({ ...batchData, material: e.target.value })}
                  className="w-full px-3 py-3 sm:py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sin especificar</option>
                  {activeMaterials.map((material) => (
                    <option key={material.id} value={material.name}>
                      {material.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {batchData.count && batchData.length && (
              <div className="bg-blue-50 rounded-lg p-3 mb-3 sm:mb-4 border border-blue-200">
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
                className="flex-1 px-4 py-3 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={handleBatchAdd}
                disabled={!batchData.count || !batchData.length}
                className="flex-1 px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base active:scale-95"
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

