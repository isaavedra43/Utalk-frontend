import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { 
  Campaign, 
  CampaignFormData,
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";

// Hook para obtener lista de campañas
export function useCampaigns(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: Campaign['status'];
  channels?: string[];
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
    mutationFn: async ({ campaignId, sendNow = true }: { campaignId: string; sendNow?: boolean }) => {
      const response = await api.post<ApiResponse<Campaign>>(`/campaigns/${campaignId}/send`, { sendNow });
      return response.data;
    },
    onSuccess: (sentCampaign) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', sentCampaign.id] });
      
      toast({
        title: "Campaña enviada",
        description: `La campaña "${sentCampaign.name}" ha sido enviada exitosamente.`,
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
export function useCampaignStats(campaignId?: string, params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['campaign-stats', campaignId, params],
    queryFn: async () => {
      const endpoint = campaignId ? `/campaigns/${campaignId}/stats` : '/campaigns/stats';
      const response = await api.get<ApiResponse<{
        totalCampaigns: number;
        activeCampaigns: number;
        sentCampaigns: number;
        totalSent: number;
        totalDelivered: number;
        totalOpened: number;
        totalClicked: number;
        totalReplied: number;
        averageOpenRate: number;
        averageClickRate: number;
        averageConversionRate: number;
      }>>(endpoint, params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener análisis de campaña
export function useCampaignAnalytics(campaignId: string) {
  return useQuery({
    queryKey: ['campaign-analytics', campaignId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        replied: number;
        bounced: number;
        unsubscribed: number;
        deliveryRate: number;
        openRate: number;
        clickRate: number;
        replyRate: number;
        conversionRate: number;
        timelineData: Array<{
          date: string;
          sent: number;
          opened: number;
          clicked: number;
        }>;
        channelPerformance: Array<{
          channel: string;
          sent: number;
          delivered: number;
          opened: number;
          clicked: number;
        }>;
      }>>(`/campaigns/${campaignId}/analytics`);
      return response.data;
    },
    enabled: !!campaignId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
} 