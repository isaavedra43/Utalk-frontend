import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { 
  Campaign, 
  CampaignFormData, 
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";

// Hook para obtener campañas
export function useCampaigns(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Campaign>>('/campaigns', params);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para obtener una campaña específica
export function useCampaign(campaignId: string) {
  return useQuery({
    queryKey: ['campaigns', campaignId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Campaign>>(`/campaigns/${campaignId}`);
      return response.data;
    },
    enabled: !!campaignId,
  });
}

// Hook para crear una nueva campaña
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignData: CampaignFormData) => {
      const response = await api.post<ApiResponse<Campaign>>('/campaigns', campaignData);
      return response.data;
    },
    onSuccess: (newCampaign) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      
      toast({
        title: "Campaña creada",
        description: `La campaña "${newCampaign.name}" ha sido creada exitosamente.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear campaña",
        description: error.response?.data?.message || "No se pudo crear la campaña.",
        variant: "destructive",
      });
    },
  });
}

// Hook para actualizar una campaña
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, data }: { campaignId: string; data: Partial<CampaignFormData> }) => {
      const response = await api.put<ApiResponse<Campaign>>(`/campaigns/${campaignId}`, data);
      return response.data;
    },
    onSuccess: (updatedCampaign) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', updatedCampaign.id] });
      
      toast({
        title: "Campaña actualizada",
        description: `La campaña "${updatedCampaign.name}" ha sido actualizada.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar campaña",
        description: error.response?.data?.message || "No se pudo actualizar la campaña.",
        variant: "destructive",
      });
    },
  });
}

// Hook para eliminar una campaña
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await api.delete<ApiResponse<void>>(`/campaigns/${campaignId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      
      toast({
        title: "Campaña eliminada",
        description: "La campaña ha sido eliminada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar campaña",
        description: error.response?.data?.message || "No se pudo eliminar la campaña.",
        variant: "destructive",
      });
    },
  });
}

// Hook para enviar una campaña
export function useSendCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await api.post<ApiResponse<void>>(`/campaigns/${campaignId}/send`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      
      toast({
        title: "Campaña enviada",
        description: "La campaña ha sido enviada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar campaña",
        description: error.response?.data?.message || "No se pudo enviar la campaña.",
        variant: "destructive",
      });
    },
  });
}

// Hook para cancelar una campaña programada
export function useCancelCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await api.post<ApiResponse<void>>(`/campaigns/${campaignId}/cancel`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      
      toast({
        title: "Campaña cancelada",
        description: "La campaña ha sido cancelada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al cancelar campaña",
        description: error.response?.data?.message || "No se pudo cancelar la campaña.",
        variant: "destructive",
      });
    },
  });
}

// Hook para duplicar una campaña
export function useDuplicateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await api.post<ApiResponse<Campaign>>(`/campaigns/${campaignId}/duplicate`);
      return response.data;
    },
    onSuccess: (duplicatedCampaign) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      
      toast({
        title: "Campaña duplicada",
        description: `Se ha creado una copia de la campaña: "${duplicatedCampaign.name}".`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al duplicar campaña",
        description: error.response?.data?.message || "No se pudo duplicar la campaña.",
        variant: "destructive",
      });
    },
  });
}

// Hook para obtener estadísticas de campañas
export function useCampaignStats(campaignId?: string) {
  return useQuery({
    queryKey: ['campaigns', 'stats', campaignId],
    queryFn: async () => {
      const url = campaignId ? `/campaigns/${campaignId}/stats` : '/campaigns/stats';
      const response = await api.get<ApiResponse<any>>(url);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos para stats más frescas
  });
} 