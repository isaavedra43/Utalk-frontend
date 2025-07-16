import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { logger } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";

// Tipos específicos para dashboard
interface DashboardKPIs {
  totalConversations: number;
  activeConversations: number;
  responseTime: number;
  resolutionRate: number;
  customerSatisfaction: number;
  conversionRate: number;
  totalContacts: number;
  totalMessages: number;
  teamEfficiency: number;
}

interface ConversationStats {
  daily: Array<{ date: string; count: number; resolved: number }>;
  weekly: Array<{ week: string; count: number; resolved: number }>;
  monthly: Array<{ month: string; count: number; resolved: number }>;
  byChannel: Array<{ channel: string; count: number; percentage: number }>;
  byAgent: Array<{ agentId: string; agentName: string; count: number; averageResponseTime: number }>;
}

interface PerformanceMetrics {
  responseTimeHistory: Array<{ date: string; avgTime: number; target: number }>;
  resolutionRateHistory: Array<{ date: string; rate: number; target: number }>;
  satisfactionHistory: Array<{ date: string; score: number; target: number }>;
  volumeByHour: Array<{ hour: number; count: number }>;
  topClientsData: Array<{ 
    id: string; 
    name: string; 
    conversations: number; 
    lastActivity: string;
    status: string; 
  }>;
}

interface AlertData {
  urgentTickets: number;
  overdueResponses: number;
  lowSatisfactionCases: number;
  systemIssues: number;
  unassignedConversations: number;
}

// Hook para obtener KPIs principales del dashboard
export function useDashboardKPIs(params?: {
  startDate?: string;
  endDate?: string;
  agentId?: string;
}) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', params],
    queryFn: async () => {
      logger.api('Obteniendo KPIs del dashboard', { params });
      const response = await api.get<DashboardKPIs>('/dashboard/kpis', params);
      logger.api('KPIs del dashboard obtenidos exitosamente');
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 30 * 1000, // Actualizar cada 30 segundos
  });
}

// Hook para estadísticas de conversaciones
export function useConversationStats(params?: {
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly';
}) {
  return useQuery({
    queryKey: ['dashboard', 'conversation-stats', params],
    queryFn: async () => {
      logger.api('Obteniendo estadísticas de conversaciones', { params });
      const response = await api.get<ConversationStats>('/dashboard/conversations/stats', params);
      logger.api('Estadísticas de conversaciones obtenidas exitosamente');
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para métricas de rendimiento
export function usePerformanceMetrics(params?: {
  startDate?: string;
  endDate?: string;
  agentId?: string;
}) {
  return useQuery({
    queryKey: ['dashboard', 'performance', params],
    queryFn: async () => {
      logger.api('Obteniendo métricas de rendimiento', { params });
      const response = await api.get<PerformanceMetrics>('/dashboard/performance', params);
      logger.api('Métricas de rendimiento obtenidas exitosamente');
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para alertas del dashboard
export function useDashboardAlerts() {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: async () => {
      logger.api('Obteniendo alertas del dashboard');
      const response = await api.get<AlertData>('/dashboard/alerts');
      logger.api('Alertas del dashboard obtenidas exitosamente');
      return response;
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 30 * 1000, // Actualizar cada 30 segundos para alertas
  });
}

// Hook para top clientes
export function useTopClients(params?: {
  limit?: number;
  period?: string;
}) {
  return useQuery({
    queryKey: ['dashboard', 'top-clients', params],
    queryFn: async () => {
      logger.api('Obteniendo top clientes', { params });
      const response = await api.get<PerformanceMetrics['topClientsData']>('/dashboard/top-clients', params);
      logger.api('Top clientes obtenidos exitosamente');
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para datos del heatmap de actividad
export function useActivityHeatmap(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['dashboard', 'heatmap', params],
    queryFn: async () => {
      logger.api('Obteniendo datos del heatmap de actividad', { params });
      const response = await api.get<Array<{
        hour: number;
        day: number;
        value: number;
        conversationsCount: number;
      }>>('/dashboard/activity-heatmap', params);
      logger.api('Datos del heatmap de actividad obtenidos exitosamente');
      return response;
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

// Hook para tendencias por canal
export function useChannelTrends(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['dashboard', 'channel-trends', params],
    queryFn: async () => {
      logger.api('Obteniendo tendencias por canal', { params });
      const response = await api.get<Array<{
        channel: string;
        data: Array<{ date: string; count: number }>;
        totalCount: number;
        growth: number;
      }>>('/dashboard/channel-trends', params);
      logger.api('Tendencias por canal obtenidas exitosamente');
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para métricas comparativas
export function useComparativeMetrics(params?: {
  currentPeriod: { startDate: string; endDate: string };
  previousPeriod: { startDate: string; endDate: string };
}) {
  return useQuery({
    queryKey: ['dashboard', 'comparative', params],
    queryFn: async () => {
      logger.api('Obteniendo métricas comparativas', { params });
      const response = await api.get<{
        current: DashboardKPIs;
        previous: DashboardKPIs;
        changes: Record<keyof DashboardKPIs, { 
          value: number; 
          percentage: number; 
          trend: 'up' | 'down' | 'stable' 
        }>;
      }>('/dashboard/comparative', params);
      logger.api('Métricas comparativas obtenidas exitosamente');
      return response;
    },
    enabled: !!params?.currentPeriod && !!params?.previousPeriod,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para métricas generales del dashboard (NUEVO - Hook solicitado)
export function useDashboardMetrics(params?: {
  startDate?: string;
  endDate?: string;
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  refresh?: boolean;
  agentId?: string;
  includeComparisons?: boolean;
}) {
  const startTime = performance.now();
  
  // Log de inicio del hook
  console.info('🚀 [DASHBOARD HOOK] useDashboardMetrics iniciado', {
    params,
    timestamp: new Date().toISOString(),
    hookId: `dashboard-metrics-${Date.now()}`
  });

  const query = useQuery({
    queryKey: ['dashboard', 'metrics', params],
    queryFn: async () => {
      const fetchStartTime = performance.now();
      
      logger.api('📊 Obteniendo métricas completas del dashboard', { 
        params,
        fetchId: `fetch-${Date.now()}`
      });

      try {
        const response = await api.get<{
          // KPIs principales
          totalConversations: number;
          activeConversations: number;
          responseTime: number;
          resolutionRate: number;
          customerSatisfaction: number;
          conversionRate: number;
          totalContacts: number;
          totalMessages: number;
          teamEfficiency: number;
          
          // Métricas de rendimiento
          dailyMetrics: Array<{
            date: string;
            conversations: number;
            responses: number;
            avgResponseTime: number;
            satisfaction: number;
          }>;
          
          // Comparaciones (si se solicitan)
          comparisons?: {
            previousPeriod: {
              totalConversations: number;
              responseTime: number;
              satisfaction: number;
            };
            changes: {
              conversations: { value: number; percentage: number; trend: 'up' | 'down' | 'stable' };
              responseTime: { value: number; percentage: number; trend: 'up' | 'down' | 'stable' };
              satisfaction: { value: number; percentage: number; trend: 'up' | 'down' | 'stable' };
            };
          };
          
          // Top performers
          topAgents: Array<{
            id: string;
            name: string;
            conversations: number;
            avgResponseTime: number;
            satisfaction: number;
          }>;
          
          // Alertas críticas
          alerts: Array<{
            type: 'warning' | 'error' | 'info';
            message: string;
            priority: 'high' | 'medium' | 'low';
            timestamp: string;
          }>;
          
          // Metadata de respuesta
          generatedAt: string;
          dataRange: {
            from: string;
            to: string;
          };
        }>('/dashboard/metrics', params);

        const fetchEndTime = performance.now();
        const fetchDuration = fetchEndTime - fetchStartTime;

        // Log detallado de éxito
        console.info('✅ [DASHBOARD SUCCESS] Métricas obtenidas exitosamente', {
          fetchDuration: `${fetchDuration.toFixed(2)}ms`,
          dataTimestamp: response.generatedAt,
          totalConversations: response.totalConversations,
          activeConversations: response.activeConversations,
          responseTime: response.responseTime,
          satisfaction: response.customerSatisfaction,
          alertsCount: response.alerts?.length || 0,
          hasComparisons: !!response.comparisons
        });

        // Log en tabla para mejor visualización
        console.table({
          'Total Conversaciones': response.totalConversations,
          'Conversaciones Activas': response.activeConversations,
          'Tiempo de Respuesta (min)': response.responseTime,
          'Tasa de Resolución (%)': response.resolutionRate,
          'Satisfacción (%)': response.customerSatisfaction,
          'Eficiencia del Equipo (%)': response.teamEfficiency
        });

        logger.api('📈 Métricas del dashboard procesadas exitosamente', {
          metricsCount: Object.keys(response).length,
          fetchDuration: `${fetchDuration}ms`,
          cacheStatus: 'fresh'
        });

        return response;

      } catch (error: any) {
        const fetchEndTime = performance.now();
        const fetchDuration = fetchEndTime - fetchStartTime;

        // Log detallado de error
        console.error('❌ [DASHBOARD ERROR] Error al obtener métricas', {
          error: error.message,
          status: error.response?.status,
          fetchDuration: `${fetchDuration.toFixed(2)}ms`,
          params,
          timestamp: new Date().toISOString()
        });

        logger.api('💥 Error crítico en obtención de métricas del dashboard', {
          error: error.message,
          statusCode: error.response?.status,
          statusText: error.response?.statusText,
          fetchDuration: `${fetchDuration}ms`
        }, true);

        throw error;
      }
    },
    staleTime: params?.refresh ? 0 : 2 * 60 * 1000, // 2 minutos, 0 si se solicita refresh
    refetchInterval: 30 * 1000, // Actualizar cada 30 segundos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // useEffect para manejar logs de success/error
  useEffect(() => {
    if (query.isSuccess && query.data) {
      const totalTime = performance.now() - startTime;
      console.info('🎯 [DASHBOARD COMPLETE] Hook useDashboardMetrics completado exitosamente', {
        totalExecutionTime: `${totalTime.toFixed(2)}ms`,
        dataGenerated: query.data.generatedAt,
        cacheHit: totalTime < 100 // Probablemente cache si es muy rápido
      });
    }
    
    if (query.isError && query.error) {
      const totalTime = performance.now() - startTime;
      console.error('💀 [DASHBOARD FATAL] Hook useDashboardMetrics falló completamente', {
        totalExecutionTime: `${totalTime.toFixed(2)}ms`,
        errorMessage: query.error.message,
        shouldRetry: (query.error as any).response?.status !== 401
      });
    }
  }, [query.isSuccess, query.isError, query.data, query.error, startTime]);

  return query;
}

// Hook para actividad en tiempo real (NUEVO - Requerido por ExecutiveDashboard)
export function useRealtimeActivity() {
  const [activities, setActivities] = useState<Array<{
    id: string;
    type: 'sale' | 'message' | 'customer' | 'order' | 'conversation';
    description: string;
    timestamp: string;
    user?: string;
    amount?: number;
  }>>([]);

  const query = useQuery({
    queryKey: ['dashboard', 'realtime-activity'],
    queryFn: async () => {
      const startTime = performance.now();
      
      logger.api('🔴 Obteniendo actividad en tiempo real', {
        timestamp: new Date().toISOString()
      });

      try {
        const response = await api.get<{
          activities: Array<{
            id: string;
            type: 'sale' | 'message' | 'customer' | 'order' | 'conversation';
            description: string;
            timestamp: string;
            user?: string;
            amount?: number;
          }>;
        }>('/dashboard/realtime-activity');

        const fetchDuration = performance.now() - startTime;

        console.info('✅ [REALTIME SUCCESS] Actividad en tiempo real obtenida', {
          fetchDuration: `${fetchDuration.toFixed(2)}ms`,
          activitiesCount: response.activities.length,
          latestActivity: response.activities[0]?.timestamp,
          types: [...new Set(response.activities.map(a => a.type))]
        });

        logger.api('🔴 Actividad en tiempo real procesada exitosamente', {
          activitiesCount: response.activities.length,
          fetchDuration: `${fetchDuration}ms`
        });

        setActivities(response.activities);
        return response.activities;

      } catch (error: any) {
        const fetchDuration = performance.now() - startTime;
        
        console.error('❌ [REALTIME ERROR] Error al obtener actividad en tiempo real', {
          error: error.message,
          fetchDuration: `${fetchDuration.toFixed(2)}ms`
        });

        logger.api('💥 Error al obtener actividad en tiempo real', {
          error: error.message,
          fetchDuration: `${fetchDuration}ms`
        }, true);

        throw error;
      }
    },
    refetchInterval: 10 * 1000, // Actualizar cada 10 segundos
    staleTime: 5 * 1000, // 5 segundos
  });

  return {
    ...query,
    data: activities
  };
}

// Hook para exportar reportes del dashboard (NUEVO - Requerido por ExecutiveDashboard)
export function useExportDashboardReport() {
  return useMutation({
    mutationFn: async (params: {
      type: 'pdf' | 'excel' | 'csv';
      period: 'today' | 'week' | 'month' | 'quarter' | 'year';
      sections: string[];
    }) => {
      const startTime = performance.now();
      
      logger.api('📄 Exportando reporte del dashboard', params);

      try {
        const response = await api.post<{
          downloadUrl: string;
          filename: string;
          size: number;
        }>('/dashboard/export-report', params);

        const exportDuration = performance.now() - startTime;

        console.info('✅ [EXPORT SUCCESS] Reporte exportado exitosamente', {
          exportDuration: `${exportDuration.toFixed(2)}ms`,
          filename: response.filename,
          size: `${(response.size / 1024).toFixed(2)} KB`,
          type: params.type
        });

        logger.api('📄 Reporte del dashboard exportado exitosamente', {
          filename: response.filename,
          type: params.type,
          exportDuration: `${exportDuration}ms`
        });

        // Descargar automáticamente
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = response.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return response;

      } catch (error: any) {
        const exportDuration = performance.now() - startTime;
        
        console.error('❌ [EXPORT ERROR] Error al exportar reporte', {
          error: error.message,
          params,
          exportDuration: `${exportDuration.toFixed(2)}ms`
        });

        logger.api('💥 Error al exportar reporte del dashboard', {
          error: error.message,
          type: params.type,
          exportDuration: `${exportDuration}ms`
        }, true);

        throw error;
      }
    },
  });
}

// Hook para resumen ejecutivo (mantenido)
export function useExecutiveSummary(params?: {
  period?: 'today' | 'week' | 'month' | 'quarter';
}) {
  return useQuery({
    queryKey: ['dashboard', 'executive-summary', params],
    queryFn: async () => {
      logger.api('Obteniendo resumen ejecutivo', { params });
      const response = await api.get<{
        overview: {
          totalRevenue: number;
          conversionRate: number;
          customerGrowth: number;
          agentUtilization: number;
        };
        highlights: Array<{
          title: string;
          value: string | number;
          change: number;
          isPositive: boolean;
        }>;
        insights: Array<{
          type: 'warning' | 'success' | 'info';
          message: string;
          priority: 'high' | 'medium' | 'low';
        }>;
        goals: Array<{
          metric: string;
          target: number;
          current: number;
          progress: number;
        }>;
      }>('/dashboard/executive-summary', params);
      logger.api('Resumen ejecutivo obtenido exitosamente');
      return response;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
} 