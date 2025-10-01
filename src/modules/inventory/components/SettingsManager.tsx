import React, { useState } from 'react';
import { Save, RotateCcw, AlertCircle, Check, Info } from 'lucide-react';
import { useConfiguration } from '../hooks/useConfiguration';

export const SettingsManager: React.FC = () => {
  const { settings, updateSettings } = useConfiguration();
  const [localSettings, setLocalSettings] = useState({
    defaultStandardWidth: settings?.defaultStandardWidth || 0.3,
    autoSaveEnabled: settings?.autoSaveEnabled !== false,
    showPieceNumbers: settings?.showPieceNumbers !== false,
    allowMultipleMaterials: settings?.allowMultipleMaterials !== false,
    requireMaterialSelection: settings?.requireMaterialSelection !== false,
    defaultMaterialCategories: settings?.defaultMaterialCategories || []
  });

  const [newCategory, setNewCategory] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = () => {
    try {
      updateSettings(localSettings);
      showNotification('success', 'Configuración guardada exitosamente');
    } catch (error) {
      showNotification('error', 'Error al guardar configuración');
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de restablecer todas las configuraciones a los valores por defecto?')) {
      setLocalSettings({
        defaultStandardWidth: 0.3,
        autoSaveEnabled: true,
        showPieceNumbers: true,
        allowMultipleMaterials: true,
        requireMaterialSelection: true,
        defaultMaterialCategories: ['Mármol', 'Granito', 'Cuarzo', 'Piedra Natural', 'Otros']
      });
      showNotification('success', 'Configuración restablecida');
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && !localSettings.defaultMaterialCategories.includes(newCategory.trim())) {
      setLocalSettings({
        ...localSettings,
        defaultMaterialCategories: [...localSettings.defaultMaterialCategories, newCategory.trim()]
      });
      setNewCategory('');
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    if (window.confirm(`¿Eliminar la categoría "${categoryToRemove}"?`)) {
      setLocalSettings({
        ...localSettings,
        defaultMaterialCategories: localSettings.defaultMaterialCategories.filter(cat => cat !== categoryToRemove)
      });
    }
  };

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify({
    defaultStandardWidth: settings?.defaultStandardWidth || 0.3,
    autoSaveEnabled: settings?.autoSaveEnabled !== false,
    showPieceNumbers: settings?.showPieceNumbers !== false,
    allowMultipleMaterials: settings?.allowMultipleMaterials !== false,
    requireMaterialSelection: settings?.requireMaterialSelection !== false,
    defaultMaterialCategories: settings?.defaultMaterialCategories || []
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configuración General</h3>
          <p className="text-sm text-gray-600">Ajusta las configuraciones del módulo de inventario</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            Guardar Cambios
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Tienes cambios sin guardar</span>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <div className="space-y-6">
        {/* Default Standard Width */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Medidas</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ancho Estándar por Defecto (metros)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="5"
              value={localSettings.defaultStandardWidth}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                defaultStandardWidth: parseFloat(e.target.value) || 0.3
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Este será el ancho estándar que se aplicará a todas las nuevas piezas
            </p>
          </div>
        </div>

        {/* General Options */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Opciones Generales</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Guardado Automático</label>
                <p className="text-xs text-gray-500">Guardar automáticamente los cambios en localStorage</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.autoSaveEnabled}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  autoSaveEnabled: e.target.checked
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Mostrar Números de Pieza</label>
                <p className="text-xs text-gray-500">Mostrar numeración automática en las piezas</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.showPieceNumbers}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  showPieceNumbers: e.target.checked
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Permitir Múltiples Materiales</label>
                <p className="text-xs text-gray-500">Permitir seleccionar múltiples tipos de material en una plataforma</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.allowMultipleMaterials}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  allowMultipleMaterials: e.target.checked
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Requerir Selección de Material</label>
                <p className="text-xs text-gray-500">Hacer obligatorio especificar el material para cada pieza</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.requireMaterialSelection}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  requireMaterialSelection: e.target.checked
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Material Categories */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Categorías de Materiales</h4>
          <p className="text-sm text-gray-600 mb-4">
            Administra las categorías disponibles para organizar los materiales
          </p>
          
          {/* Add Category */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nueva categoría"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCategory();
                }
              }}
            />
            <button
              onClick={addCategory}
              disabled={!newCategory.trim() || localSettings.defaultMaterialCategories.includes(newCategory.trim())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar
            </button>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            {localSettings.defaultMaterialCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-900">{category}</span>
                <button
                  onClick={() => removeCategory(category)}
                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors active:scale-95"
                  title="Eliminar categoría"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {localSettings.defaultMaterialCategories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No hay categorías configuradas</p>
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <Check className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}
    </div>
  );
};
