import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiClient } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { 
  DashboardMetrics, 
  ApiResponse 
} from "@/types/api";

// Hook para obtener métricas del dashboard
export function useDashboard(params?: {
  dateRange?: string;
  refreshInterval?: number;
}) {
  return useQuery({
    queryKey: ['dashboard', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardMetrics>>('/dashboard', params);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos para datos frescos
    refetchInterval: params?.refreshInterval || 30 * 1000, // Auto-refresh cada 30 segundos
  });
}

// Hook para obtener alertas del dashboard
export function useDashboardAlerts() {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>('/dashboard/alerts');
      return response.data;
    },
    staleTime: 15 * 1000, // 15 segundos para alertas críticas
    refetchInterval: 15 * 1000,
  });
}

// Hook para obtener top clientes
export function useTopClients(params?: {
  period?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['dashboard', 'top-clients', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>('/dashboard/top-clients', params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener performance de agentes
export function useAgentPerformance(params?: {
  period?: string;
  agentId?: string;
}) {
  return useQuery({
    queryKey: ['dashboard', 'agent-performance', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>('/dashboard/agent-performance', params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para obtener datos del heatmap de actividad
export function useActivityHeatmap(params?: {
  date?: string;
  period?: string;
}) {
  return useQuery({
    queryKey: ['dashboard', 'heatmap', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>('/dashboard/heatmap', params);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para exportar dashboard
export function useExportDashboard() {
  return useMutation({
    mutationFn: async ({ format, dateRange }: { format: 'pdf' | 'csv' | 'xlsx'; dateRange?: string }) => {
      const response = await apiClient.get('/dashboard/export', {
        params: { format, dateRange },
        responseType: 'blob',
      });
      
      // Crear URL para descarga
      const blob = new Blob([response.data], { 
        type: format === 'pdf' 
          ? 'application/pdf' 
          : format === 'csv' 
            ? 'text/csv' 
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Exportación completada",
        description: "El dashboard se ha exportado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error en la exportación",
        description: error.response?.data?.message || "No se pudo exportar el dashboard.",
        variant: "destructive",
      });
    },
  });
}

// Hook para compartir dashboard
export function useShareDashboard() {
  return useMutation({
    mutationFn: async (params?: { expiresIn?: string; permissions?: string[] }) => {
      const response = await api.post<ApiResponse<{ shareLink: string; expiresAt: string }>>(
        '/dashboard/share',
        params
      );
      return response.data;
    },
    onSuccess: (result) => {
      // Copiar al portapapeles
      if (navigator.clipboard) {
        navigator.clipboard.writeText(result.shareLink);
        toast({
          title: "Enlace copiado",
          description: `Enlace de dashboard copiado. Expira: ${new Date(result.expiresAt).toLocaleDateString()}`,
        });
      } else {
        toast({
          title: "Enlace generado",
          description: `Enlace: ${result.shareLink}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error al compartir",
        description: error.response?.data?.message || "No se pudo generar el enlace.",
        variant: "destructive",
      });
    },
  });
}

// Hook para refrescar datos manualmente
export function useRefreshDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Llamar al endpoint de refresco si existe
      const response = await api.post<ApiResponse<void>>('/dashboard/refresh');
      return response;
    },
    onSuccess: () => {
      // Invalidar todas las queries del dashboard para forzar actualización
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: "Dashboard actualizado",
        description: "Los datos del dashboard han sido actualizados.",
      });
    },
    onError: (error: any) => {
      // Aunque falle el endpoint, refrescar las queries locales
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: "Dashboard actualizado",
        description: "Se han actualizado los datos disponibles.",
      });
    },
  });
}

// Hook para obtener comparativas de períodos
export function useDashboardComparison(params: {
  currentPeriod: string;
  comparisonPeriod: string;
  metrics: string[];
}) {
  return useQuery({
    queryKey: ['dashboard', 'comparison', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>('/dashboard/comparison', params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!(params.currentPeriod && params.comparisonPeriod && params.metrics.length > 0),
  });
}

// Hook para obtener metas y objetivos
export function useDashboardGoals() {
  return useQuery({
    queryKey: ['dashboard', 'goals'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>('/dashboard/goals');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutos (las metas no cambian tan frecuentemente)
  });
}

// Hook para actualizar metas
export function useUpdateDashboardGoals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goals: any) => {
      const response = await api.put<ApiResponse<any>>('/dashboard/goals', goals);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'goals'] });
      
      toast({
        title: "Metas actualizadas",
        description: "Las metas del dashboard han sido actualizadas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar metas",
        description: error.response?.data?.message || "No se pudieron actualizar las metas.",
        variant: "destructive",
      });
    },
  });
} 