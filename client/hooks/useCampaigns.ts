import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/utils";
import type { 
  Campaign, 
  CampaignFormData,
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";

// Tipos específicos para campañas
interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  unsubscribed: number;
  bounced: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  conversionRate: number;
}

interface CampaignAnalytics {
  overview: CampaignStats;
  timeline: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
  channels: Array<{
    channel: string;
    stats: CampaignStats;
  }>;
  demographics: {
    byAge: Array<{ range: string; count: number; engagement: number }>;
    byLocation: Array<{ location: string; count: number; engagement: number }>;
    bySegment: Array<{ segment: string; count: number; engagement: number }>;
  };
}

// Hook para obtener lista de campañas
export function useCampaigns(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  channel?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: async () => {
      logger.api('Obteniendo lista de campañas', { params });
      const response = await api.get<PaginatedResponse<Campaign>>('/campaigns', params);
      logger.api('Campañas obtenidas exitosamente', { total: response.pagination?.total });
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
      logger.api('Obteniendo campaña específica', { campaignId });
      const response = await api.get<Campaign>(`/campaigns/${campaignId}`);
      return response;
    },
    enabled: !!campaignId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para crear una nueva campaña
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignData: CampaignFormData) => {
      logger.api('Creando nueva campaña', { 
        name: campaignData.name, 
        type: campaignData.type,
        channel: campaignData.channel 
      });
      const response = await api.post<Campaign>('/campaigns', campaignData);
      return response;
    },
    onSuccess: (newCampaign) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      
      logger.api('Campaña creada exitosamente', { 
        campaignId: newCampaign.id, 
        name: newCampaign.name 
      });
      
      toast({
        title: "Campaña creada",
        description: `La campaña "${newCampaign.name}" ha sido creada exitosamente.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo crear la campaña.";
      logger.api('Error al crear campaña', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al crear campaña",
        description: errorMessage,
      });
    },
  });
}

// Hook para actualizar una campaña
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, data }: { campaignId: string; data: Partial<CampaignFormData> }) => {
      logger.api('Actualizando campaña', { 
        campaignId, 
        updatedFields: Object.keys(data) 
      });
      const response = await api.put<Campaign>(`/campaigns/${campaignId}`, data);
      return response;
    },
    onSuccess: (updatedCampaign) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.setQueryData(['campaigns', updatedCampaign.id], updatedCampaign);
      
      logger.api('Campaña actualizada exitosamente', { campaignId: updatedCampaign.id });
      
      toast({
        title: "Campaña actualizada",
        description: `La campaña "${updatedCampaign.name}" ha sido actualizada.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo actualizar la campaña.";
      logger.api('Error al actualizar campaña', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al actualizar campaña",
        description: errorMessage,
      });
    },
  });
}

// Hook para eliminar una campaña
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      logger.api('Eliminando campaña', { campaignId });
      await api.delete(`/campaigns/${campaignId}`);
      return campaignId;
    },
    onSuccess: (deletedCampaignId) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.removeQueries({ queryKey: ['campaigns', deletedCampaignId] });
      
      logger.api('Campaña eliminada exitosamente', { campaignId: deletedCampaignId });
      
      toast({
        title: "Campaña eliminada",
        description: "La campaña ha sido eliminada exitosamente.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo eliminar la campaña.";
      logger.api('Error al eliminar campaña', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al eliminar campaña",
        description: errorMessage,
      });
    },
  });
}

// Hook para duplicar una campaña
export function useDuplicateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, newName }: { campaignId: string; newName?: string }) => {
      logger.api('Duplicando campaña', { campaignId, newName });
      const response = await api.post<Campaign>(`/campaigns/${campaignId}/duplicate`, {
        name: newName,
      });
      return response;
    },
    onSuccess: (duplicatedCampaign) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      
      logger.api('Campaña duplicada exitosamente', { 
        originalId: duplicatedCampaign.id,
        newName: duplicatedCampaign.name 
      });
      
      toast({
        title: "Campaña duplicada",
        description: `Se ha creado una copia: "${duplicatedCampaign.name}".`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo duplicar la campaña.";
      logger.api('Error al duplicar campaña', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al duplicar campaña",
        description: errorMessage,
      });
    },
  });
}

// Hook para lanzar una campaña
export function useLaunchCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      logger.api('Lanzando campaña', { campaignId });
      const response = await api.post<Campaign>(`/campaigns/${campaignId}/launch`);
      return response;
    },
    onSuccess: (launchedCampaign) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.setQueryData(['campaigns', launchedCampaign.id], launchedCampaign);
      
      logger.api('Campaña lanzada exitosamente', { campaignId: launchedCampaign.id });
      
      toast({
        title: "Campaña lanzada",
        description: `La campaña "${launchedCampaign.name}" está ahora activa.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo lanzar la campaña.";
      logger.api('Error al lanzar campaña', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al lanzar campaña",
        description: errorMessage,
      });
    },
  });
}

// Hook para pausar una campaña
export function usePauseCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      logger.api('Pausando campaña', { campaignId });
      const response = await api.post<Campaign>(`/campaigns/${campaignId}/pause`);
      return response;
    },
    onSuccess: (pausedCampaign) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.setQueryData(['campaigns', pausedCampaign.id], pausedCampaign);
      
      logger.api('Campaña pausada exitosamente', { campaignId: pausedCampaign.id });
      
      toast({
        title: "Campaña pausada",
        description: `La campaña "${pausedCampaign.name}" ha sido pausada.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo pausar la campaña.";
      logger.api('Error al pausar campaña', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al pausar campaña",
        description: errorMessage,
      });
    },
  });
}

// Hook para detener/cancelar una campaña
export function useStopCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      logger.api('Deteniendo campaña', { campaignId });
      const response = await api.post<Campaign>(`/campaigns/${campaignId}/stop`);
      return response;
    },
    onSuccess: (stoppedCampaign) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.setQueryData(['campaigns', stoppedCampaign.id], stoppedCampaign);
      
      logger.api('Campaña detenida exitosamente', { campaignId: stoppedCampaign.id });
      
      toast({
        title: "Campaña detenida",
        description: `La campaña "${stoppedCampaign.name}" ha sido detenida.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo detener la campaña.";
      logger.api('Error al detener campaña', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al detener campaña",
        description: errorMessage,
      });
    },
  });
}

// Hook para obtener estadísticas de una campaña
export function useCampaignStats(campaignId: string) {
  return useQuery({
    queryKey: ['campaigns', campaignId, 'stats'],
    queryFn: async () => {
      logger.api('Obteniendo estadísticas de campaña', { campaignId });
      const response = await api.get<CampaignStats>(`/campaigns/${campaignId}/stats`);
      logger.api('Estadísticas de campaña obtenidas exitosamente');
      return response;
    },
    enabled: !!campaignId,
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 30 * 1000, // Actualizar cada 30 segundos para campañas activas
  });
}

// Hook para obtener análisis detallado de una campaña
export function useCampaignAnalytics(campaignId: string, params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['campaigns', campaignId, 'analytics', params],
    queryFn: async () => {
      logger.api('Obteniendo análisis de campaña', { campaignId, params });
      const response = await api.get<CampaignAnalytics>(`/campaigns/${campaignId}/analytics`, params);
      logger.api('Análisis de campaña obtenidos exitosamente');
      return response;
    },
    enabled: !!campaignId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener destinatarios de una campaña
export function useCampaignRecipients(campaignId: string, params?: {
  page?: number;
  pageSize?: number;
  status?: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced';
}) {
  return useQuery({
    queryKey: ['campaigns', campaignId, 'recipients', params],
    queryFn: async () => {
      logger.api('Obteniendo destinatarios de campaña', { campaignId, params });
      const response = await api.get<PaginatedResponse<{
        id: string;
        contactId: string;
        contactName: string;
        contactEmail: string;
        contactPhone: string;
        status: string;
        sentAt?: string;
        deliveredAt?: string;
        openedAt?: string;
        clickedAt?: string;
        errorMessage?: string;
      }>>(`/campaigns/${campaignId}/recipients`, params);
      logger.api('Destinatarios de campaña obtenidos exitosamente');
      return response;
    },
    enabled: !!campaignId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para probar una campaña (envío de prueba)
export function useTestCampaign() {
  return useMutation({
    mutationFn: async ({ campaignId, testRecipients }: { 
      campaignId: string; 
      testRecipients: string[] 
    }) => {
      logger.api('Enviando prueba de campaña', { 
        campaignId, 
        recipientCount: testRecipients.length 
      });
      const response = await api.post(`/campaigns/${campaignId}/test`, {
        recipients: testRecipients,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      logger.api('Prueba de campaña enviada exitosamente');
      
      toast({
        title: "Prueba enviada",
        description: `La prueba se envió a ${variables.testRecipients.length} destinatario(s).`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo enviar la prueba.";
      logger.api('Error al enviar prueba de campaña', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al enviar prueba",
        description: errorMessage,
      });
    },
  });
}

// Hook para exportar resultados de campaña
export function useExportCampaignResults() {
  return useMutation({
    mutationFn: async ({ 
      campaignId, 
      format 
    }: { 
      campaignId: string; 
      format: 'csv' | 'xlsx' | 'pdf' 
    }) => {
      logger.api('Exportando resultados de campaña', { campaignId, format });
      
      const { apiClient } = await import('@/lib/apiClient');
      const response = await apiClient.get(`/campaigns/${campaignId}/export`, {
        params: { format },
        responseType: 'blob',
      });
      
      // Crear URL para descarga
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `campaign-results-${campaignId}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response;
    },
    onSuccess: () => {
      logger.api('Exportación de resultados de campaña completada');
      
      toast({
        title: "Exportación completada",
        description: "Los resultados de la campaña se han exportado exitosamente.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo exportar los resultados.";
      logger.api('Error en exportación de resultados de campaña', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error en la exportación",
        description: errorMessage,
      });
    },
  });
}

// Hook para obtener plantillas de campaña
export function useCampaignTemplates() {
  return useQuery({
    queryKey: ['campaigns', 'templates'],
    queryFn: async () => {
      logger.api('Obteniendo plantillas de campaña');
      const response = await api.get<Array<{
        id: string;
        name: string;
        description: string;
        category: string;
        channel: string;
        previewUrl?: string;
        content: any;
      }>>('/campaigns/templates');
      logger.api('Plantillas de campaña obtenidas exitosamente', { 
        templateCount: response.length 
      });
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para vista previa de campaña
export function usePreviewCampaign() {
  return useMutation({
    mutationFn: async ({ campaignId, contactId }: { 
      campaignId: string; 
      contactId?: string 
    }) => {
      logger.api('Generando vista previa de campaña', { campaignId, contactId });
      const response = await api.post<{
        subject: string;
        content: string;
        previewText: string;
        personalizedContent: string;
      }>(`/campaigns/${campaignId}/preview`, {
        contactId,
      });
      return response;
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo generar la vista previa.";
      logger.api('Error al generar vista previa de campaña', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error en vista previa",
        description: errorMessage,
      });
         },
   });
} 