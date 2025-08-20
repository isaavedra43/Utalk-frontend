import { useEffect, useState, useCallback, memo } from 'react';
import { 
  DashboardHeader, 
  KPICards, 
  DailyActivity, 
  AgentRanking,
  SentimentAnalysis,
  TopicsAndAlerts,
  ActivityCalendar,
  AIInsights,
  DailyMessages
} from '../../components/dashboard';

import { ErrorBoundary } from '../../components/dashboard/ErrorBoundary';
import { SectionLoading } from '../../components/dashboard/LoadingSpinner';
import { useDebouncedCallback } from '../../hooks/useDebounce';

import { useDashboardStore } from '../../stores/useDashboardStore';
import type { DashboardData } from '../../types/dashboard';

const DashboardModule = memo(() => {
  const { dashboardData, loading: dashboardLoading, error: dashboardError, setDashboardData, setLoading: setDashboardLoading, setError: setDashboardError } = useDashboardStore();
  const [aiViewEnabled, setAiViewEnabled] = useState(false);


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
      // Dashboard service eliminado - usar datos del store
      setDashboardData({} as DashboardData);
    } catch (error) {
      setDashboardError('Error al cargar los datos del dashboard');
      console.error('Error loading dashboard data:', error);
    }
  }, [setDashboardData, setDashboardLoading, setDashboardError]);

  const handleSearch = useCallback((query: string) => {
    debouncedSearch(query);
  }, [debouncedSearch]);

  const handleRefresh = useCallback(() => {
    console.log('Refrescar dashboard');
    loadDashboardData();
  }, [loadDashboardData]);

  const handleAIToggle = useCallback(() => {
    setAiViewEnabled(prev => !prev);
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
      <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
        {/* Header del Dashboard */}
        <DashboardHeader
          header={{
            greeting: "Buenas noches, Israel",
            currentTime: "11 de agosto, 20:58",
            lastUpdated: "hace 2 minutos",
            searchPlaceholder: "Buscar en dashboard...",
            actions: {
              aiView: aiViewEnabled,
              refresh: dashboardLoading,
              notifications: 0
            },
            user: {
              name: "Israel",
              avatar: ""
            }
          }}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          onAIToggle={handleAIToggle}
        />

        {/* Contenido principal */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto min-h-0 no-scrollbar">
          {/* Tarjetas de métricas principales */}
          <ErrorBoundary>
            <KPICards metrics={dashboardData.metrics} />
          </ErrorBoundary>

          {/* Vista de IA o Dashboard tradicional */}
          {aiViewEnabled ? (
            <ErrorBoundary>
              <AIInsights
                dailySummary="Hoy recibiste 347 mensajes con un 78% de sentimiento positivo. Ana García fue la agente más rápida con 1.8 min de respuesta promedio. Hubo un pico de mensajes a las 14:00 debido a consultas sobre la nueva promoción."
                summaryConfidence={95}
                summaryTimestamp="hace menos de un minuto"
                insights={[
                  {
                    id: '1',
                    type: 'alert',
                    priority: 'critical',
                    title: 'Cliente en riesgo crítico',
                    description: 'Elena Torres (VIP, €15K valor) no ha tenido contacto en 7 días tras múltiples quejas sin resolver. Riesgo de cancelación: 85%. Acción inmediata requerida.',
                    confidence: 92,
                    timestamp: 'hace 30 minutos',
                    tags: ['vip-customer', 'churn-risk', 'urgent']
                  },
                  {
                    id: '2',
                    type: 'recommendation',
                    priority: 'high',
                    title: 'Optimización recomendada',
                    description: 'Se detectaron 23 casos de "problemas de entrega" con tendencia al alza. Recomiendo crear una plantilla de respuesta automática y formar al equipo en gestión de expectativas de envío.',
                    confidence: 87,
                    timestamp: 'hace alrededor de 2 horas',
                    tags: ['delivery', 'optimization', 'training']
                  }
                ]}
              />
            </ErrorBoundary>
          ) : (
            <>
              {/* Gráficos y análisis */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ErrorBoundary>
                  <SentimentAnalysis
                    sentimentData={{
                      positive: { count: 301, percentage: 58.9 },
                      neutral: { count: 157, percentage: 30.7 },
                      negative: { count: 53, percentage: 10.4 }
                    }}
                    channelData={[
                      { name: 'WhatsApp', messages: 246, percentage: 58.9, trend: 'up' },
                      { name: 'Facebook', messages: 152, percentage: 58.6, trend: 'up' },
                      { name: 'Web Chat', messages: 113, percentage: 59.3, trend: 'up' }
                    ]}
                  />
                </ErrorBoundary>
                
                <ErrorBoundary>
                  <TopicsAndAlerts
                    topics={[
                      {
                        id: '1',
                        title: 'Problemas de facturación',
                        type: 'complaint',
                        priority: 'critical',
                        keywords: ['factura', 'cobro', 'cargo'],
                        trend: { direction: 'up', value: 12 },
                        newKeywords: ['cargo']
                      },
                      {
                        id: '2',
                        title: 'Consultas sobre envíos',
                        type: 'question',
                        priority: 'medium',
                        keywords: ['envío', 'entrega', 'tracking'],
                        trend: { direction: 'up', value: 8 },
                        newKeywords: ['tracking']
                      },
                      {
                        id: '3',
                        title: 'Soporte técnico',
                        type: 'question',
                        priority: 'high',
                        keywords: ['error', 'problema', 'ayuda'],
                        trend: { direction: 'down', value: 5 },
                        newKeywords: ['disponibilidad']
                      },
                      {
                        id: '4',
                        title: 'Felicitaciones por servicio',
                        type: 'compliment',
                        priority: 'low',
                        keywords: ['excelente', 'gracias', 'satisfecho'],
                        trend: { direction: 'down', value: 18 },
                        newKeywords: ['satisfecho']
                      }
                    ]}
                  />
                </ErrorBoundary>
                
                <ErrorBoundary>
                  <ActivityCalendar
                    data={[
                      { date: new Date(2025, 7, 28), count: 45 },
                      { date: new Date(2025, 7, 30), count: 67 },
                      { date: new Date(2025, 7, 31), count: 89 },
                      { date: new Date(2025, 8, 1), count: 78 },
                      { date: new Date(2025, 8, 4), count: 92 },
                      { date: new Date(2025, 8, 7), count: 56 },
                      { date: new Date(2025, 8, 8), count: 73 },
                      { date: new Date(2025, 8, 9), count: 34, hasAlert: true },
                      { date: new Date(2025, 8, 11), count: 81 },
                      { date: new Date(2025, 8, 12), count: 95 },
                      { date: new Date(2025, 8, 13), count: 42, hasAlert: true },
                      { date: new Date(2025, 8, 14), count: 88 }
                    ]}
                    month={new Date(2025, 7, 1)}
                    totalMessages={798}
                  />
                </ErrorBoundary>
              </div>

              {/* Gráficos y rankings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lado izquierdo - Dos gráficas */}
                <div className="space-y-6">
                  <ErrorBoundary>
                    <DailyActivity data={dashboardData.dailyActivity} />
                  </ErrorBoundary>
                  <ErrorBoundary>
                    <DailyMessages
                      data={[
                        { hour: '01:00', messages: 5, isPeak: false, color: '#3b82f6' },
                        { hour: '02:00', messages: 3, isPeak: false, color: '#3b82f6' },
                        { hour: '03:00', messages: 2, isPeak: false, color: '#3b82f6' },
                        { hour: '04:00', messages: 1, isPeak: false, color: '#3b82f6' },
                        { hour: '05:00', messages: 4, isPeak: false, color: '#3b82f6' },
                        { hour: '06:00', messages: 8, isPeak: false, color: '#3b82f6' },
                        { hour: '07:00', messages: 15, isPeak: false, color: '#3b82f6' },
                        { hour: '08:00', messages: 25, isPeak: false, color: '#3b82f6' },
                        { hour: '09:00', messages: 45, isPeak: false, color: '#3b82f6' },
                        { hour: '10:00', messages: 67, isPeak: false, color: '#3b82f6' },
                        { hour: '11:00', messages: 78, isPeak: false, color: '#3b82f6' },
                        { hour: '12:00', messages: 89, isPeak: true, color: '#1d4ed8' },
                        { hour: '13:00', messages: 82, isPeak: true, color: '#1d4ed8' },
                        { hour: '14:00', messages: 76, isPeak: false, color: '#3b82f6' },
                        { hour: '15:00', messages: 68, isPeak: false, color: '#3b82f6' },
                        { hour: '16:00', messages: 71, isPeak: false, color: '#3b82f6' },
                        { hour: '17:00', messages: 85, isPeak: true, color: '#1d4ed8' },
                        { hour: '18:00', messages: 62, isPeak: false, color: '#3b82f6' },
                        { hour: '19:00', messages: 48, isPeak: false, color: '#3b82f6' },
                        { hour: '20:00', messages: 35, isPeak: false, color: '#3b82f6' },
                        { hour: '21:00', messages: 28, isPeak: false, color: '#3b82f6' },
                        { hour: '22:00', messages: 19, isPeak: false, color: '#3b82f6' },
                        { hour: '23:00', messages: 12, isPeak: false, color: '#3b82f6' }
                      ]}
                      totalMessages={892}
                      comparison="vs ayer +28.5%"
                      peakHour="12:00"
                    />
                  </ErrorBoundary>
                </div>
                
                {/* Lado derecho - Ranking de agentes */}
                <ErrorBoundary>
                  <AgentRanking data={dashboardData.agentRanking} />
                </ErrorBoundary>
              </div>
            </>
          )}
        </div>


      </div>
    </ErrorBoundary>
  );
});

DashboardModule.displayName = 'DashboardModule';

export { DashboardModule }; 