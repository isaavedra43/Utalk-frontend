import { useQuery } from "@tanstack/react-query";
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

// Hook para resumen ejecutivo
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