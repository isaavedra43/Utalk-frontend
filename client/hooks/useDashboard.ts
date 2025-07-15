import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { ApiResponse } from "@/types/api";

// Interface para métricas del dashboard
export interface DashboardMetrics {
  // Métricas principales
  totalSales: {
    value: number;
    change: number;
    isPositive: boolean;
  };
  totalOrders: {
    value: number;
    change: number;
    isPositive: boolean;
  };
  totalCustomers: {
    value: number;
    change: number;
    isPositive: boolean;
  };
  totalMessages: {
    value: number;
    change: number;
    isPositive: boolean;
  };
  
  // Métricas de performance
  conversionRate: number;
  averageOrderValue: number;
  customerSatisfaction: number;
  responseTime: number;
  
  // Tendencias y gráficos
  salesTrend: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  
  messagesTrend: Array<{
    date: string;
    messages: number;
    responses: number;
  }>;
  
  channelPerformance: Array<{
    channel: string;
    messages: number;
    conversions: number;
    revenue: number;
  }>;
  
  topClients: Array<{
    id: string;
    name: string;
    totalSpent: number;
    lastOrder: string;
    status: string;
  }>;
  
  // Alertas y notificaciones
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    description: string;
    timestamp: string;
    isRead: boolean;
  }>;
  
  // Actividad en tiempo real
  recentActivity: Array<{
    id: string;
    type: 'sale' | 'message' | 'customer' | 'order';
    description: string;
    timestamp: string;
    user?: string;
    amount?: number;
  }>;
}

// Hook para obtener métricas del dashboard
export function useDashboardMetrics(params?: {
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  refresh?: boolean;
}) {
  return useQuery({
    queryKey: ['dashboard-metrics', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics', params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Refresco cada 5 minutos
  });
}

// Hook para obtener métricas de ventas
export function useSalesMetrics(params?: {
  startDate?: string;
  endDate?: string;
  agentId?: string;
  channel?: string;
}) {
  return useQuery({
    queryKey: ['sales-metrics', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
        conversionRate: number;
        topProducts: Array<{
          id: string;
          name: string;
          sales: number;
          revenue: number;
        }>;
        salesByChannel: Array<{
          channel: string;
          sales: number;
          revenue: number;
          conversionRate: number;
        }>;
        salesByAgent: Array<{
          agentId: string;
          agentName: string;
          sales: number;
          revenue: number;
        }>;
        dailySales: Array<{
          date: string;
          sales: number;
          revenue: number;
          orders: number;
        }>;
      }>>('/dashboard/sales', params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener métricas de mensajería
export function useMessagingMetrics(params?: {
  startDate?: string;
  endDate?: string;
  agentId?: string;
  channel?: string;
}) {
  return useQuery({
    queryKey: ['messaging-metrics', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{
        totalMessages: number;
        totalConversations: number;
        averageResponseTime: number;
        resolutionRate: number;
        activeChats: number;
        pendingChats: number;
        messagesByChannel: Array<{
          channel: string;
          messages: number;
          conversations: number;
          averageResponseTime: number;
        }>;
        messagesByAgent: Array<{
          agentId: string;
          agentName: string;
          messages: number;
          conversations: number;
          responseTime: number;
        }>;
        hourlyActivity: Array<{
          hour: number;
          messages: number;
          conversations: number;
        }>;
      }>>('/dashboard/messaging', params);
      return response.data;
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
}

// Hook para obtener métricas de clientes
export function useCustomerMetrics(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['customer-metrics', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{
        totalCustomers: number;
        newCustomers: number;
        returningCustomers: number;
        customerSatisfaction: number;
        churnRate: number;
        lifetimeValue: number;
        customersBySegment: Array<{
          segment: string;
          count: number;
          revenue: number;
        }>;
        customerActivity: Array<{
          date: string;
          newCustomers: number;
          returningCustomers: number;
          totalRevenue: number;
        }>;
        topCustomers: Array<{
          id: string;
          name: string;
          totalSpent: number;
          lastActivity: string;
          status: string;
        }>;
      }>>('/dashboard/customers', params);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para obtener alertas del dashboard
export function useDashboardAlerts() {
  return useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Array<{
        id: string;
        type: 'warning' | 'error' | 'info' | 'success';
        title: string;
        description: string;
        timestamp: string;
        isRead: boolean;
        priority: 'high' | 'medium' | 'low';
      }>>>('/dashboard/alerts');
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refresco cada minuto
  });
}

// Hook para marcar alertas como leídas
export function useMarkAlertAsRead() {
  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await api.post<ApiResponse<void>>(`/dashboard/alerts/${alertId}/read`);
      return response;
    },
  });
}

// Hook para obtener actividad en tiempo real
export function useRealtimeActivity() {
  return useQuery({
    queryKey: ['realtime-activity'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Array<{
        id: string;
        type: 'sale' | 'message' | 'customer' | 'order' | 'conversation';
        description: string;
        timestamp: string;
        user?: string;
        amount?: number;
        metadata?: Record<string, any>;
      }>>>('/dashboard/activity');
      return response.data;
    },
    staleTime: 10 * 1000, // 10 segundos
    refetchInterval: 15 * 1000, // Refresco cada 15 segundos
  });
}

// Hook para exportar reportes del dashboard
export function useExportDashboardReport() {
  return useMutation({
    mutationFn: async (params: {
      type: 'pdf' | 'excel' | 'csv';
      period: string;
      sections: string[];
    }) => {
      const { apiClient } = await import('@/lib/apiClient');
      const response = await apiClient.get('/dashboard/export', {
        params,
        responseType: 'blob',
      });
      
      // Crear URL para descarga
      const blob = new Blob([response.data], { 
        type: params.type === 'pdf' ? 'application/pdf' : 
              params.type === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-dashboard-${new Date().toISOString().split('T')[0]}.${params.type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Reporte exportado",
        description: "El reporte del dashboard se ha exportado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al exportar reporte",
        description: error.response?.data?.message || "No se pudo exportar el reporte.",
        variant: "destructive",
      });
    },
  });
}

// Hook para obtener comparativas de períodos
export function usePeriodComparison(params: {
  currentPeriod: { start: string; end: string };
  previousPeriod: { start: string; end: string };
  metrics: string[];
}) {
  return useQuery({
    queryKey: ['period-comparison', params],
    queryFn: async () => {
      const response = await api.post<ApiResponse<{
        current: Record<string, number>;
        previous: Record<string, number>;
        changes: Record<string, {
          value: number;
          percentage: number;
          isPositive: boolean;
        }>;
      }>>('/dashboard/compare-periods', params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para configurar widgets del dashboard
export function useDashboardConfig() {
  return useQuery({
    queryKey: ['dashboard-config'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{
        widgets: Array<{
          id: string;
          type: string;
          title: string;
          position: { x: number; y: number; w: number; h: number };
          isVisible: boolean;
          config: Record<string, any>;
        }>;
        layout: string;
        theme: string;
        refreshInterval: number;
      }>>('/dashboard/config');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

// Hook para actualizar configuración del dashboard
export function useUpdateDashboardConfig() {
  return useMutation({
    mutationFn: async (config: {
      widgets?: Array<{
        id: string;
        position: { x: number; y: number; w: number; h: number };
        isVisible: boolean;
        config: Record<string, any>;
      }>;
      layout?: string;
      theme?: string;
      refreshInterval?: number;
    }) => {
      const response = await api.put<ApiResponse<void>>('/dashboard/config', config);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración del dashboard ha sido actualizada.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al guardar configuración",
        description: error.response?.data?.message || "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    },
  });
} 