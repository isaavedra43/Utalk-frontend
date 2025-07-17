import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/utils";
import { extractData, toISOStringFromFirestore } from "@/lib/apiUtils";
import type { 
  Conversation, 
  Message, 
  MessageFormData,
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";

// Hook para obtener conversaciones reales
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
      logger.api('Obteniendo lista de conversaciones', { params });
      const response = await api.get<PaginatedResponse<Conversation>>('/conversations', params);
      
      // ✅ USA LA FUNCIÓN UTILITARIA PARA EXTRAER DATOS
      const conversations = extractData<Conversation>(response, 'conversations');
      
      const processedConversations = conversations.map((conv: any) => ({
        ...conv,
        lastMessageAt: toISOStringFromFirestore(conv.lastMessageAt),
        createdAt: toISOStringFromFirestore(conv.createdAt),
        updatedAt: toISOStringFromFirestore(conv.updatedAt),
      }));

      logger.api('Conversaciones obtenidas exitosamente', { count: processedConversations.length });
      
      return { ...response, conversations: processedConversations };
    },
    staleTime: 30 * 1000,
    refetchInterval: 10 * 1000,
  });
}

// Hook para obtener una conversación específica
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: ['conversations', conversationId],
    queryFn: async () => {
      logger.api('Obteniendo conversación específica', { conversationId });
      const response = await api.get<Conversation>(`/conversations/${conversationId}`);
      return response;
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  });
}

// Hook para obtener mensajes de una conversación por teléfono (Twilio)
export function useConversationByPhone(phone: string) {
  return useQuery({
    queryKey: ['conversations', 'phone', phone],
    queryFn: async () => {
      logger.api('Obteniendo conversación por teléfono', { phone });
      const response = await api.get<Conversation>(`/messages/conversation/${phone}`);
      return response;
    },
    enabled: !!phone,
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
      logger.api('Obteniendo mensajes de conversación', { conversationId, params });
      const response = await api.get<any>(`/conversations/${conversationId}/messages`, params);
      
      // ✅ USA LA FUNCIÓN UTILITARIA PARA EXTRAER DATOS
      const messages = extractData<Message>(response, 'messages');

      const processedMessages = messages.map((msg: any) => ({
        ...msg,
        timestamp: toISOStringFromFirestore(msg.timestamp),
        createdAt: toISOStringFromFirestore(msg.createdAt),
        updatedAt: toISOStringFromFirestore(msg.updatedAt),
      }));

      logger.api('Mensajes obtenidos exitosamente', { messageCount: processedMessages.length });
      
      return { ...response, messages: processedMessages };
    },
    enabled: !!conversationId,
    staleTime: 10 * 1000,
    refetchInterval: 5 * 1000,
  });
}

// Hook para enviar un mensaje real a través de Twilio
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ to, body, mediaUrl }: { 
      to: string; 
      body: string; 
      mediaUrl?: string;
    }) => {
      logger.api('Enviando mensaje', { to, hasMedia: !!mediaUrl, bodyLength: body.length });
      
      const response = await api.post<Message>('/messages/send', {
        to,
        body,
        mediaUrl
      });
      
      return response;
    },
    onSuccess: (newMessage, variables) => {
      // Invalidar mensajes relacionados
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      logger.api('Mensaje enviado exitosamente', { 
        messageId: newMessage.id,
        to: variables.to 
      });
      
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado exitosamente.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo enviar el mensaje.";
      logger.api('Error al enviar mensaje', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al enviar mensaje",
        description: errorMessage,
      });
    },
  });
}

// Hook para marcar mensajes como leídos
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      logger.api('Marcando conversación como leída', { conversationId });
      await api.post(`/conversations/${conversationId}/mark-read`);
      return conversationId;
    },
    onSuccess: (conversationId) => {
      // Invalidar conversación y mensajes
      queryClient.invalidateQueries({ queryKey: ['conversations', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      logger.api('Conversación marcada como leída exitosamente');
    },
    onError: (error: any) => {
      logger.api('Error al marcar como leída', { error: error.message }, true);
    },
  });
}

// Hook para asignar conversación a un agente
export function useAssignConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, agentId }: { conversationId: string; agentId: string }) => {
      logger.api('Asignando conversación a agente', { conversationId, agentId });
      const response = await api.post<Conversation>(`/conversations/${conversationId}/assign`, {
        agentId,
      });
      return response;
    },
    onSuccess: (updatedConversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.setQueryData(['conversations', updatedConversation.id], updatedConversation);
      
      logger.api('Conversación asignada exitosamente');
      
      toast({
        title: "Conversación asignada",
        description: "La conversación ha sido asignada exitosamente.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo asignar la conversación.";
      logger.api('Error al asignar conversación', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al asignar conversación",
        description: errorMessage,
      });
    },
  });
}

// Hook para cerrar una conversación
export function useCloseConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      logger.api('Cerrando conversación', { conversationId });
      const response = await api.post<Conversation>(`/conversations/${conversationId}/close`);
      return response;
    },
    onSuccess: (closedConversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.setQueryData(['conversations', closedConversation.id], closedConversation);
      
      logger.api('Conversación cerrada exitosamente');
      
      toast({
        title: "Conversación cerrada",
        description: "La conversación ha sido cerrada exitosamente.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo cerrar la conversación.";
      logger.api('Error al cerrar conversación', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al cerrar conversación",
        description: errorMessage,
      });
    },
  });
}

// Hook para búsqueda de mensajes
export function useSearchMessages(query: string) {
  return useQuery({
    queryKey: ['messages', 'search', query],
    queryFn: async () => {
      logger.api('Buscando mensajes', { query });
      const response = await api.get<Message[]>('/messages/search', { q: query });
      logger.api('Búsqueda de mensajes completada', { resultCount: response.length });
      return response;
    },
    enabled: query.length >= 3, // Solo buscar con al menos 3 caracteres
    staleTime: 30 * 1000,
  });
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
      logger.api('Obteniendo estadísticas de mensajería', { params });
      const response = await api.get<{
        totalConversations: number;
        activeConversations: number;
        closedConversations: number;
        averageResponseTime: number;
        messagesPerDay: number;
        conversionRate: number;
      }>('/messages/stats', params);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para tiempo real con Firestore listeners (alternativa a WebSocket)
export function useRealTimeMessages(conversationId: string) {
  const [newMessages, setNewMessages] = useState<Message[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    logger.socket('Configurando listener de tiempo real para conversación', { conversationId });

    // Aquí se implementaría el listener de Firestore para tiempo real
    // Ejemplo con Firestore:
    /*
    const unsubscribe = onSnapshot(
      collection(db, 'conversations', conversationId, 'messages'),
      (snapshot) => {
        const newMessages = snapshot.docChanges()
          .filter(change => change.type === 'added')
          .map(change => ({ id: change.doc.id, ...change.doc.data() } as Message));
        
        if (newMessages.length > 0) {
          logger.socket('Nuevos mensajes recibidos en tiempo real', { count: newMessages.length });
          setNewMessages(prev => [...prev, ...newMessages]);
          
          // Invalidar queries para actualizar UI
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      }
    );

    return () => {
      logger.socket('Desconectando listener de tiempo real');
      unsubscribe();
    };
    */

    // Por ahora, usar polling como fallback
    const interval = setInterval(() => {
      logger.socket('Polling para nuevos mensajes');
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    }, 3000);

    return () => {
      logger.socket('Deteniendo polling de mensajes');
      clearInterval(interval);
    };
  }, [conversationId, queryClient]);

  return {
    newMessages,
    clearNewMessages: () => setNewMessages([]),
  };
}

// Hook para actualizar estado de mensaje
export function useUpdateMessageStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, status }: { messageId: string; status: string }) => {
      logger.api('Actualizando estado de mensaje', { messageId, status });
      const response = await api.put<Message>(`/messages/${messageId}/status`, { status });
      return response;
    },
    onSuccess: (updatedMessage) => {
      // Actualizar mensaje en el cache
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      
      logger.api('Estado de mensaje actualizado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo actualizar el estado del mensaje.";
      logger.api('Error al actualizar estado de mensaje', { error: errorMessage }, true);
    },
  });
} 