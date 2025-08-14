import React from 'react';
import { useDashboardTesting } from '../../hooks/useDashboardTesting';

interface DashboardTestingPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export const DashboardTestingPanel: React.FC<DashboardTestingPanelProps> = ({
  isVisible,
  onClose
}) => {
  const {
    dashboardData,
    dashboardLoading,
    dashboardError,
    refreshInterval,
    loadDashboardData,
    generateTestData,
    resetData,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    toggleDataMode,
    simulateError,
    simulateLoading,
    validateDataStructure,
    testResponsiveness,
    testPerformance
  } = useDashboardTesting();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Panel de Testing - Dashboard</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Estado actual */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Estado Actual:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Loading: <span className={dashboardLoading ? 'text-red-600' : 'text-green-600'}>{dashboardLoading ? 'Sí' : 'No'}</span></div>
            <div>Error: <span className={dashboardError ? 'text-red-600' : 'text-green-600'}>{dashboardError ? 'Sí' : 'No'}</span></div>
            <div>Datos: <span className={dashboardData ? 'text-green-600' : 'text-red-600'}>{dashboardData ? 'Cargados' : 'No cargados'}</span></div>
            <div>Actualizaciones: <span className={refreshInterval ? 'text-green-600' : 'text-gray-600'}>{refreshInterval ? 'Activas' : 'Inactivas'}</span></div>
          </div>
        </div>

        {/* Funciones de testing */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Datos:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => loadDashboardData()}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Cargar Datos
              </button>
              <button
                onClick={generateTestData}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                Generar Datos Test
              </button>
              <button
                onClick={resetData}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                Resetear
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Modo de Datos:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleDataMode(true)}
                className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
              >
                Usar Mock Data
              </button>
              <button
                onClick={() => toggleDataMode(false)}
                className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
              >
                Usar Datos Reales
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Actualizaciones en Tiempo Real:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => startRealTimeUpdates(3000)}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                Iniciar (3s)
              </button>
              <button
                onClick={() => startRealTimeUpdates(1000)}
                className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
              >
                Iniciar (1s)
              </button>
              <button
                onClick={stopRealTimeUpdates}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Detener
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Simulaciones:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={simulateLoading}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Simular Loading
              </button>
              <button
                onClick={simulateError}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Simular Error
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Validaciones:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => dashboardData && validateDataStructure(dashboardData)}
                className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600"
              >
                Validar Estructura
              </button>
              <button
                onClick={testResponsiveness}
                className="px-3 py-1 bg-teal-500 text-white rounded text-sm hover:bg-teal-600"
              >
                Test Responsividad
              </button>
              <button
                onClick={testPerformance}
                className="px-3 py-1 bg-pink-500 text-white rounded text-sm hover:bg-pink-600"
              >
                Test Rendimiento
              </button>
            </div>
          </div>
        </div>

        {/* Información de debug */}
        {dashboardError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <h4 className="font-semibold text-red-800">Error:</h4>
            <p className="text-red-700 text-sm">{dashboardError}</p>
          </div>
        )}

        {dashboardData && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-semibold text-green-800">Datos Cargados:</h4>
            <p className="text-green-700 text-sm">
              Última actualización: {dashboardData.lastUpdated}
            </p>
            <p className="text-green-700 text-sm">
              Métricas: {dashboardData.metrics.globalSentiment.value}% sentimiento
            </p>
          </div>
        )}

        {/* Instrucciones */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold text-blue-800 mb-2">Instrucciones:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Usa "Cargar Datos" para obtener datos del servicio</li>
            <li>• "Generar Datos Test" crea datos dinámicos para testing</li>
            <li>• "Iniciar Actualizaciones" simula datos en tiempo real</li>
            <li>• "Validar Estructura" verifica que los datos sean correctos</li>
            <li>• Revisa la consola del navegador para logs detallados</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 