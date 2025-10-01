import React, { useState } from 'react';
import { X, Settings, Users, Package, Sliders, Download, Upload, RotateCcw, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { useConfiguration } from '../hooks/useConfiguration';
import { ProviderManager } from './ProviderManager';
import { MaterialManager } from './MaterialManager';
import { SettingsManager } from './SettingsManager';

interface ConfigurationModalProps {
  onClose: () => void;
}

type TabType = 'providers' | 'materials' | 'settings' | 'export';

export const ConfigurationModal: React.FC<ConfigurationModalProps> = ({ onClose }) => {
  const {
    configuration,
    loading,
    error,
    resetConfiguration,
    clearLocalConfiguration, // ✅ Cambio: Ya no se inicializan datos falsos
    exportConfiguration,
    importConfiguration,
    getConfigurationStats,
    refreshFromBackend // ✅ NUEVO: Función para refrescar desde backend
  } = useConfiguration();

  const [activeTab, setActiveTab] = useState<TabType>('providers');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const stats = getConfigurationStats();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleResetConfiguration = async () => {
    try {
      resetConfiguration();
      showNotification('success', 'Configuración restablecida a valores por defecto');
      setShowResetConfirm(false);
    } catch (error) {
      showNotification('error', 'Error al restablecer configuración');
    }
  };

  // ✅ NUEVO: Función para refrescar datos desde el backend
  const handleRefreshFromBackend = async () => {
    try {
      await refreshFromBackend();
      showNotification('success', 'Datos actualizados desde el backend');
    } catch (error) {
      showNotification('error', 'Error al actualizar datos desde el backend');
    }
  };

  // ✅ ELIMINADO: Ya no se crean datos falsos
  // Ahora solo se puede limpiar la configuración local
  const handleClearLocalConfiguration = async () => {
    try {
      clearLocalConfiguration();
      showNotification('success', 'Configuración local limpiada - Use datos del backend');
    } catch (error) {
      showNotification('error', 'Error al limpiar configuración local');
    }
  };

  const handleExportConfiguration = () => {
    try {
      const configJson = exportConfiguration();
      const blob = new Blob([configJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('success', 'Configuración exportada exitosamente');
    } catch (error) {
      showNotification('error', 'Error al exportar configuración');
    }
  };

  const handleImportConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importConfiguration(content);
        showNotification('success', 'Configuración importada exitosamente');
        event.target.value = ''; // Limpiar input
      } catch (error) {
        showNotification('error', 'Error al importar configuración');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'providers' as TabType, label: 'Proveedores', icon: Users },
    { id: 'materials' as TabType, label: 'Materiales', icon: Package },
    { id: 'settings' as TabType, label: 'Configuración', icon: Sliders },
    { id: 'export' as TabType, label: 'Exportar/Importar', icon: Download }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Cargando configuración...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-white" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Configuración del Módulo</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span><strong>{stats.totalProviders}</strong> Proveedores</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-green-600" />
                  <span><strong>{stats.activeMaterials}</strong> Materiales Activos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sliders className="h-4 w-4 text-purple-600" />
                  <span><strong>{stats.materialCategories}</strong> Categorías</span>
                </div>
                <div className="text-xs text-gray-500">
                  Última actualización: {stats.lastUpdated.toLocaleDateString('es-MX')}
                </div>
              </div>
              
              {/* ✅ NUEVO: Botón para refrescar desde backend */}
              <button
                onClick={handleRefreshFromBackend}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                title="Actualizar datos desde el backend"
              >
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'providers' && <ProviderManager />}
          {activeTab === 'materials' && <MaterialManager />}
          {activeTab === 'settings' && <SettingsManager />}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar Configuración</h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800 mb-3">
                    Exporta toda la configuración del módulo (proveedores, materiales y configuraciones) a un archivo JSON.
                  </p>
                  <button
                    onClick={handleExportConfiguration}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors active:scale-95"
                  >
                    <Download className="h-4 w-4" />
                    Exportar Configuración
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Importar Configuración</h3>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-800 mb-3">
                    Importa una configuración desde un archivo JSON. Esto reemplazará la configuración actual.
                  </p>
                  <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors active:scale-95 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Importar Configuración
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportConfiguration}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inicializar Configuración</h3>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-purple-800 mb-3">
                    Inicializa la configuración por defecto si no se han cargado los materiales o proveedores. Esto agregará los materiales y proveedores predeterminados.
                  </p>
                  <button
                    onClick={handleInitializeDefaultConfiguration}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors active:scale-95"
                  >
                    <Settings className="h-4 w-4" />
                    Inicializar Configuración por Defecto
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Restablecer Configuración</h3>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-800 mb-3">
                    Restablece toda la configuración a los valores por defecto. Esta acción no se puede deshacer.
                  </p>
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors active:scale-95"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restablecer a Valores por Defecto
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors active:scale-95"
          >
            Cerrar
          </button>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <RotateCcw className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">Restablecer Configuración</h3>
                    <p className="text-sm text-gray-500 mt-1">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-700">
                    ¿Estás seguro de que quieres restablecer toda la configuración a los valores por defecto?
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Se eliminarán todos los proveedores y materiales personalizados, y se restaurarán las configuraciones predeterminadas.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleResetConfiguration}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors active:scale-95"
                  >
                    Restablecer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
};
