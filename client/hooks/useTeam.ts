import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { 
  Seller, 
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";

// Tipos específicos para el equipo
interface SellerFormData {
  name: string;
  email: string;
  role: string;
  permissions: {
    read: boolean;
    write: boolean;
    approve: boolean;
    admin: boolean;
  };
}

interface PerformanceUpdate {
  sellerId: string;
  metrics: Partial<Seller['kpis']>;
}

// Hook para obtener lista de vendedores/equipo
export function useTeam(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  role?: string;
}) {
  return useQuery({
    queryKey: ['team', params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Seller>>('/team', params);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para obtener un vendedor específico
export function useSeller(sellerId: string) {
  return useQuery({
    queryKey: ['team', sellerId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Seller>>(`/team/${sellerId}`);
      return response.data;
    },
    enabled: !!sellerId,
  });
}

// Hook para crear un nuevo vendedor
export function useCreateSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sellerData: SellerFormData) => {
      const response = await api.post<ApiResponse<Seller>>('/team', sellerData);
      return response.data;
    },
    onSuccess: (newSeller) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      
      toast({
        title: "Vendedor creado",
        description: `${newSeller.name} ha sido añadido al equipo exitosamente.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear vendedor",
        description: error.response?.data?.message || "No se pudo crear el vendedor.",
        variant: "destructive",
      });
    },
  });
}

// Hook para actualizar un vendedor
export function useUpdateSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sellerId, data }: { sellerId: string; data: Partial<SellerFormData> }) => {
      const response = await api.put<ApiResponse<Seller>>(`/team/${sellerId}`, data);
      return response.data;
    },
    onSuccess: (updatedSeller) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['team', updatedSeller.id] });
      
      toast({
        title: "Vendedor actualizado",
        description: `Los datos de ${updatedSeller.name} han sido actualizados.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar vendedor",
        description: error.response?.data?.message || "No se pudo actualizar el vendedor.",
        variant: "destructive",
      });
    },
  });
}

// Hook para actualizar permisos de un vendedor
export function useUpdateSellerPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sellerId, permissions }: { 
      sellerId: string; 
      permissions: Seller['permissions'] 
    }) => {
      const response = await api.patch<ApiResponse<Seller>>(
        `/team/${sellerId}/permissions`, 
        { permissions }
      );
      return response.data;
    },
    onSuccess: (updatedSeller) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['team', updatedSeller.id] });
      
      toast({
        title: "Permisos actualizados",
        description: `Los permisos de ${updatedSeller.name} han sido actualizados.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar permisos",
        description: error.response?.data?.message || "No se pudieron actualizar los permisos.",
        variant: "destructive",
      });
    },
  });
}

// Hook para activar/desactivar un vendedor
export function useToggleSellerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sellerId, status }: { sellerId: string; status: 'active' | 'inactive' }) => {
      const response = await api.patch<ApiResponse<Seller>>(
        `/team/${sellerId}/status`, 
        { status }
      );
      return response.data;
    },
    onSuccess: (updatedSeller) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['team', updatedSeller.id] });
      
      const action = updatedSeller.status === 'active' ? 'activado' : 'desactivado';
      toast({
        title: `Vendedor ${action}`,
        description: `${updatedSeller.name} ha sido ${action} exitosamente.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al cambiar estado",
        description: error.response?.data?.message || "No se pudo cambiar el estado del vendedor.",
        variant: "destructive",
      });
    },
  });
}

// Hook para eliminar un vendedor
export function useDeleteSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sellerId: string) => {
      const response = await api.delete<ApiResponse<void>>(`/team/${sellerId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      
      toast({
        title: "Vendedor eliminado",
        description: "El vendedor ha sido eliminado del equipo.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar vendedor",
        description: error.response?.data?.message || "No se pudo eliminar el vendedor.",
        variant: "destructive",
      });
    },
  });
}

// Hook para obtener métricas de performance del equipo
export function useTeamPerformance(params?: {
  period?: string;
  teamId?: string;
}) {
  return useQuery({
    queryKey: ['team', 'performance', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>('/team/performance', params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para obtener KPIs individuales de un vendedor
export function useSellerKPIs(sellerId: string, params?: {
  period?: string;
}) {
  return useQuery({
    queryKey: ['team', sellerId, 'kpis', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Seller['kpis']>>(
        `/team/${sellerId}/kpis`, 
        params
      );
      return response.data;
    },
    enabled: !!sellerId,
    staleTime: 30 * 1000, // 30 segundos para KPIs más frescos
    refetchInterval: 60 * 1000, // Refetch cada minuto
  });
}

// Hook para obtener tendencias de performance
export function useSellerTrends(sellerId: string, params?: {
  period?: string;
  metrics?: string[];
}) {
  return useQuery({
    queryKey: ['team', sellerId, 'trends', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>(
        `/team/${sellerId}/trends`, 
        params
      );
      return response.data;
    },
    enabled: !!sellerId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para enviar sugerencia de mejora a un vendedor
export function useSendImprovementSuggestion() {
  return useMutation({
    mutationFn: async ({ 
      sellerId, 
      suggestion, 
      category,
      priority = 'medium'
    }: {
      sellerId: string;
      suggestion: string;
      category: string;
      priority?: 'low' | 'medium' | 'high';
    }) => {
      const response = await api.post<ApiResponse<void>>(
        `/team/${sellerId}/suggestions`,
        { suggestion, category, priority }
      );
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Sugerencia enviada",
        description: "La sugerencia de mejora ha sido enviada al vendedor.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar sugerencia",
        description: error.response?.data?.message || "No se pudo enviar la sugerencia.",
        variant: "destructive",
      });
    },
  });
}

// Hook para enviar recordatorio a un vendedor
export function useSendReminder() {
  return useMutation({
    mutationFn: async ({ 
      sellerId, 
      message, 
      type = 'general',
      priority = 'medium'
    }: {
      sellerId: string;
      message: string;
      type?: 'task' | 'meeting' | 'followup' | 'general';
      priority?: 'low' | 'medium' | 'high';
    }) => {
      const response = await api.post<ApiResponse<void>>(
        `/team/${sellerId}/reminders`,
        { message, type, priority }
      );
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Recordatorio enviado",
        description: "El recordatorio ha sido enviado al vendedor.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar recordatorio",
        description: error.response?.data?.message || "No se pudo enviar el recordatorio.",
        variant: "destructive",
      });
    },
  });
}

// Hook para obtener roles disponibles
export function useAvailableRoles() {
  return useQuery({
    queryKey: ['team', 'roles'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<string[]>>('/team/roles');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutos (los roles no cambian frecuentemente)
  });
}

// Hook para comparar performance entre vendedores
export function useSellerComparison(sellerIds: string[], params?: {
  period?: string;
  metrics?: string[];
}) {
  return useQuery({
    queryKey: ['team', 'comparison', sellerIds, params],
    queryFn: async () => {
      const response = await api.post<ApiResponse<any>>('/team/compare', {
        sellerIds,
        ...params
      });
      return response.data;
    },
    enabled: sellerIds.length > 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
} 