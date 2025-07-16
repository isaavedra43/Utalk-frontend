import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import { useConversationStore } from "@/hooks/useConversationStore";
import type { 
  Conversation, 
  Message, 
  MessageFormData,
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";

// Hook para obtener conversaciones - sincroniza con store
export function useConversations(params?: {
  pageSize?: number;
  search?: string;
  channel?: string;
  status?: string;
  cursor?: string;
}) {
  const { setConversations } = useConversationStore();
  
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: async () => {
      console.log("🔄 Obteniendo conversaciones desde API...");
      const response = await api.get<PaginatedResponse<Conversation>>('/conversations', params);
      
      // Sincronizar con store global
      if (response.data) {
        console.log("📦 Sincronizando", response.data.length, "conversaciones con store");
        setConversations(response.data);
      }
      
      return response;
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Refresco cada 30 segundos
  });
}

// Hook para obtener una conversación específica
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: ['conversations', conversationId],
    queryFn: async () => {
      console.log("🔄 Obteniendo conversación:", conversationId);
      const response = await api.get<ApiResponse<Conversation>>(`/conversations/${conversationId}`);
      return response.data;
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  });
}

// Hook para obtener mensajes de una conversación - sincroniza con store
export function useMessages(conversationId: string, params?: {
  pageSize?: number;
  cursor?: string;
  enabled?: boolean;
}) {
  const { setMessagesForConversation } = useConversationStore();
  
  return useQuery({
    queryKey: ['messages', conversationId, params],
    queryFn: async () => {
      console.log("🔄 Obteniendo mensajes para conversación:", conversationId);
      const response = await api.get<PaginatedResponse<Message>>(`/conversations/${conversationId}/messages`, params);
      
      // Sincronizar con store global
      if (response.data) {
        console.log("📦 Sincronizando", response.data.length, "mensajes con store para conversación:", conversationId);
        setMessagesForConversation(conversationId, response.data);
      }
      
      return response;
    },
    enabled: !!conversationId && (params?.enabled !== false),
    staleTime: 10 * 1000, // 10 segundos
    refetchInterval: 10 * 1000, // Refresco cada 10 segundos para nuevos mensajes
  });
}

// Hook para enviar un mensaje - actualiza store optimísticamente
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { addMessage } = useConversationStore();

  return useMutation({
    mutationFn: async ({ conversationId, messageData }: { 
      conversationId: string; 
      messageData: MessageFormData 
    }) => {
      console.log("📤 Enviando mensaje a API:", messageData.content, "conversación:", conversationId);
      
      // Crear mensaje optimista para el store
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        content: messageData.content,
        sender: "agent",
        timestamp: new Date().toISOString(),
        status: "sent",
        type: "text",
      };
      
      // Agregar al store inmediatamente (optimistic update)
      console.log("⚡ Agregando mensaje optimista al store");
      addMessage(optimisticMessage);
      
      const response = await api.post<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, messageData);
      return response.data;
    },
    onSuccess: (newMessage, { conversationId }) => {
      console.log("✅ Mensaje enviado exitosamente:", newMessage?.id);
      
      // Actualizar mensaje en store con ID real del servidor
      if (newMessage) {
        addMessage(newMessage);
      }
      
      // Invalidar cache de React Query
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any, { conversationId }) => {
      console.error("❌ Error al enviar mensaje:", error);
      
      toast({
        title: "Error al enviar mensaje",
        description: error.response?.data?.message || "No se pudo enviar el mensaje.",
        variant: "destructive",
      });
      
      // Revalidar datos en caso de error
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });
}

// Hook para marcar mensajes como leídos
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      console.log("👁️ Marcando conversación como leída:", conversationId);
      const response = await api.post<ApiResponse<void>>(`/conversations/${conversationId}/mark-read`);
      return response;
    },
    onSuccess: (_, conversationId) => {
      console.log("✅ Conversación marcada como leída:", conversationId);
      
      // Invalidar conversación y mensajes
      queryClient.invalidateQueries({ queryKey: ['conversations', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      console.error("❌ Error al marcar como leído:", error);
    },
  });
}

// Hook para asignar conversación a un agente
export function useAssignConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, agentId }: { conversationId: string; agentId: string }) => {
      console.log("👤 Asignando conversación:", conversationId, "a agente:", agentId);
      const response = await api.post<ApiResponse<Conversation>>(`/conversations/${conversationId}/assign`, {
        agentId,
      });
      return response.data;
    },
    onSuccess: (updatedConversation) => {
      console.log("✅ Conversación asignada exitosamente");
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations', updatedConversation.id] });
      
      toast({
        title: "Conversación asignada",
        description: "La conversación ha sido asignada exitosamente.",
      });
    },
    onError: (error: any) => {
      console.error("❌ Error al asignar conversación:", error);
      
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
      console.log("🔒 Cerrando conversación:", conversationId);
      const response = await api.post<ApiResponse<Conversation>>(`/conversations/${conversationId}/close`);
      return response.data;
    },
    onSuccess: (closedConversation) => {
      console.log("✅ Conversación cerrada exitosamente");
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations', closedConversation.id] });
      
      toast({
        title: "Conversación cerrada",
        description: "La conversación ha sido cerrada exitosamente.",
      });
    },
    onError: (error: any) => {
      console.error("❌ Error al cerrar conversación:", error);
      
      toast({
        title: "Error al cerrar conversación",
        description: error.response?.data?.message || "No se pudo cerrar la conversación.",
        variant: "destructive",
      });
    },
  });
}

// Hook para polling en tiempo real (backup de WebSockets)
export function useRealTimeMessages(conversationId: string) {
  const [isPolling, setIsPolling] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId || !isPolling) return;

    console.log("🔄 Iniciando polling para conversación:", conversationId);

    const interval = setInterval(() => {
      console.log("🔄 Polling: refrescando mensajes...");
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    }, 3000); // Cada 3 segundos

    return () => {
      console.log("🛑 Deteniendo polling para conversación:", conversationId);
      clearInterval(interval);
    };
  }, [conversationId, isPolling, queryClient]);

  return {
    startPolling: () => {
      console.log("▶️ Iniciando polling");
      setIsPolling(true);
    },
    stopPolling: () => {
      console.log("⏹️ Deteniendo polling");
      setIsPolling(false);
    },
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
      console.log("📊 Obteniendo estadísticas de mensajería...");
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