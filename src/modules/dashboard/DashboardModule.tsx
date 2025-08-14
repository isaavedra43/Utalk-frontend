import { useEffect, useState, useCallback, memo } from 'react';
import { DashboardHeader, KPICards, DailyActivity, AgentRanking } from '../../components/dashboard';
import { DashboardTestingPanel } from '../../components/dashboard/DashboardTestingPanel';
import { ErrorBoundary } from '../../components/dashboard/ErrorBoundary';
import { SectionLoading } from '../../components/dashboard/LoadingSpinner';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import { dashboardService } from '../../services/dashboard';
import { useAppStore } from '../../stores/useAppStore';

const DashboardModule = memo(() => {
  const { dashboardData, dashboardLoading, dashboardError, setDashboardData, setDashboardLoading, setDashboardError } = useAppStore();
  const [aiViewEnabled, setAiViewEnabled] = useState(false);
  const [showTestingPanel, setShowTestingPanel] = useState(false);

  // Debounce para la búsqueda
  const debouncedSearch = useDebouncedCallback((...args: unknown[]) => {
    const query = args[0] as string;
    console.log('Búsqueda en dashboard:', query);
    // Implementar búsqueda en dashboard
  }, 300);

  const loadDashboardData = useCallback(async () => {
    try {
      setDashboardLoading(true);
      setDashboardError(null);
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      setDashboardError('Error al cargar los datos del dashboard');
      console.error('Error loading dashboard data:', error);
    }
  }, [setDashboardData, setDashboardLoading, setDashboardError]);

  const handleSearch = useCallback((query: string) => {
    debouncedSearch(query);
  }, [debouncedSearch]);

  const handleRefresh = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleAIToggle = useCallback(() => {
    setAiViewEnabled(prev => !prev);
  }, []);

  const handleTestingToggle = useCallback(() => {
    setShowTestingPanel(prev => !prev);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Estados de carga y error
  if (dashboardLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <SectionLoading text="Cargando dashboard..." />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar el dashboard</h3>
          <p className="text-gray-600 mb-4">{dashboardError}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
          <p className="text-gray-600 mb-4">No se pudieron cargar los datos del dashboard</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Cargar Datos
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Botón de testing (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleTestingToggle}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 shadow-lg transition-colors"
              title="Panel de Testing"
            >
              🧪 Testing
            </button>
          </div>
        )}

        {/* Header del Dashboard */}
        <ErrorBoundary>
          <DashboardHeader
            header={dashboardData.header}
            onSearch={handleSearch}
            onRefresh={handleRefresh}
            onAIToggle={handleAIToggle}
          />
        </ErrorBoundary>

        {/* Contenido principal */}
        <div className="flex-1 p-6 space-y-6">
          {/* Tarjetas de métricas principales */}
          <ErrorBoundary>
            <KPICards metrics={dashboardData.metrics} />
          </ErrorBoundary>

          {/* Gráficos y rankings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ErrorBoundary>
              <DailyActivity data={dashboardData.dailyActivity} />
            </ErrorBoundary>
            <ErrorBoundary>
              <AgentRanking data={dashboardData.agentRanking} />
            </ErrorBoundary>
          </div>

          {/* Sección de análisis de sentimiento */}
          {aiViewEnabled && (
            <ErrorBoundary>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Aquí irían los componentes de análisis de sentimiento */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Sentimiento</h3>
                  <p className="text-gray-600">Vista de IA habilitada</p>
                </div>
              </div>
            </ErrorBoundary>
          )}
        </div>

        {/* Panel de testing */}
        <DashboardTestingPanel
          isVisible={showTestingPanel}
          onClose={() => setShowTestingPanel(false)}
        />
      </div>
    </ErrorBoundary>
  );
});

DashboardModule.displayName = 'DashboardModule';

export { DashboardModule }; 