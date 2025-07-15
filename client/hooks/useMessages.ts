import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { 
  Conversation, 
  Message, 
  MessageFormData,
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";

// Hook para obtener conversaciones
export function useConversations(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  channel?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Conversation>>('/conversations', params);
      return response;
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 10 * 1000, // Refresco cada 10 segundos para nuevos mensajes
  });
}

// Hook para obtener una conversación específica
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: ['conversations', conversationId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Conversation>>(`/conversations/${conversationId}`);
      return response.data;
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  });
}

// Hook para obtener mensajes de una conversación
export function useMessages(conversationId: string, params?: {
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['messages', conversationId, params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Message>>(`/conversations/${conversationId}/messages`, params);
      return response;
    },
    enabled: !!conversationId,
    staleTime: 10 * 1000, // 10 segundos
    refetchInterval: 5 * 1000, // Refresco cada 5 segundos para nuevos mensajes
  });
}

// Hook para enviar un mensaje
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, messageData }: { 
      conversationId: string; 
      messageData: MessageFormData 
    }) => {
      const response = await api.post<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, messageData);
      return response.data;
    },
    onSuccess: (newMessage, { conversationId }) => {
      // Invalidar mensajes de la conversación
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      // Invalidar lista de conversaciones para actualizar último mensaje
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar mensaje",
        description: error.response?.data?.message || "No se pudo enviar el mensaje.",
        variant: "destructive",
      });
    },
  });
}

// Hook para marcar mensajes como leídos
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await api.post<ApiResponse<void>>(`/conversations/${conversationId}/mark-read`);
      return response;
    },
    onSuccess: (_, conversationId) => {
      // Invalidar conversación y mensajes
      queryClient.invalidateQueries({ queryKey: ['conversations', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Hook para asignar conversación a un agente
export function useAssignConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, agentId }: { conversationId: string; agentId: string }) => {
      const response = await api.post<ApiResponse<Conversation>>(`/conversations/${conversationId}/assign`, {
        agentId,
      });
      return response.data;
    },
    onSuccess: (updatedConversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations', updatedConversation.id] });
      
      toast({
        title: "Conversación asignada",
        description: "La conversación ha sido asignada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al asignar conversación",
        description: error.response?.data?.message || "No se pudo asignar la conversación.",
        variant: "destructive",
      });
    },
  });
}

// Hook para cerrar una conversación
export function useCloseConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await api.post<ApiResponse<Conversation>>(`/conversations/${conversationId}/close`);
      return response.data;
    },
    onSuccess: (closedConversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations', closedConversation.id] });
      
      toast({
        title: "Conversación cerrada",
        description: "La conversación ha sido cerrada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al cerrar conversación",
        description: error.response?.data?.message || "No se pudo cerrar la conversación.",
        variant: "destructive",
      });
    },
  });
}

// Hook para polling en tiempo real (alternativa a WebSockets)
export function useRealTimeMessages(conversationId: string) {
  const [isPolling, setIsPolling] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId || !isPolling) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    }, 3000); // Cada 3 segundos

    return () => clearInterval(interval);
  }, [conversationId, isPolling, queryClient]);

  return {
    startPolling: () => setIsPolling(true),
    stopPolling: () => setIsPolling(false),
    isPolling,
  };
}

// Hook para estadísticas de mensajería
export function useMessagingStats(params?: {
  startDate?: string;
  endDate?: string;
  agentId?: string;
}) {
  return useQuery({
    queryKey: ['messaging-stats', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{
        totalConversations: number;
        activeConversations: number;
        closedConversations: number;
        averageResponseTime: number;
        messagesPerDay: number;
        conversionRate: number;
      }>>('/conversations/stats', params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
} 