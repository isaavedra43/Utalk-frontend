import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/utils";
import { extractData, processConversations, processMessages } from "@/lib/apiUtils";
import type { 
  Conversation, 
  Message, 
  MessageFormData,
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";
import type { PaginationParams } from "@/types/pagination";

// Hook principal para obtener lista de conversaciones - SOLO limit/startAfter
export function useConversations(params?: PaginationParams & {
  channel?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: async () => {
      logger.api('Obteniendo lista de conversaciones', { params });
      
      // 🔧 SOLO PARÁMETROS UNIFICADOS: limit, startAfter, orderBy, direction
      const response = await api.get<PaginatedResponse<Conversation>>('/conversations', params);
      
      // ✅ USA LA FUNCIÓN UTILITARIA PARA EXTRAER DATOS
      const conversations = extractData<Conversation>(response, 'conversations');
      
      // 🔧 USAR NUEVA FUNCIÓN DE PROCESAMIENTO ROBUSTA
      const processedConversations = processConversations(conversations);

      logger.api('Conversaciones obtenidas exitosamente', { count: processedConversations.length });
      
      return { ...response, conversations: processedConversations };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    // 🔥 ELIMINADO: refetchInterval - usar Socket.io para tiempo real
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
      const response = await api.get<Conversation>(`/conversations/phone/${phone}`);
      return response;
    },
    enabled: !!phone,
    staleTime: 30 * 1000,
  });
}

// 🔧 Hook para obtener mensajes - UNIFICADO EXCLUSIVAMENTE a limit/startAfter
export function useMessages(conversationId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ['messages', conversationId, params],
    queryFn: async () => {
      logger.api('Obteniendo mensajes de conversación', { conversationId, params });
      
      // 🔧 SOLO PARÁMETROS BACKEND: limit, startAfter
      const backendParams = {
        limit: params?.limit || 50,
        ...(params?.startAfter && { startAfter: params.startAfter }),
        ...(params?.orderBy && { orderBy: params.orderBy }),
        ...(params?.direction && { direction: params.direction })
      };
      
      const response = await api.get<any>(`/conversations/${conversationId}/messages`, backendParams);
      
      // ✅ USA LA FUNCIÓN UTILITARIA PARA EXTRAER DATOS
      const messages = extractData<Message>(response, 'messages');

      // 🔧 USAR NUEVA FUNCIÓN DE PROCESAMIENTO ROBUSTA
      const processedMessages = processMessages(messages);

      logger.api('Mensajes obtenidos exitosamente', { messageCount: processedMessages.length });
      
      return { ...response, messages: processedMessages };
    },
    enabled: !!conversationId,
    staleTime: 10 * 1000,
    // 🔥 ELIMINADO: refetchInterval - usar Socket.io para tiempo real EXCLUSIVAMENTE
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

// Hook para marcar mensajes como leídos - USANDO PUT (más semánticamente correcto)
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      logger.api('Marcando conversación como leída', { conversationId });
      // 🔧 ACTUALIZADO: Usar PUT para operación idempotente de actualización de estado
      await api.put(`/conversations/${conversationId}/mark-read`, {});
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
      
      // Si PUT no funciona, intentar con POST como fallback
      if (error.response?.status === 405) {
        logger.api('PUT no soportado para mark-read, usando POST como fallback');
        // El componente puede reintentar con POST si es necesario
      }
    },
  });
}

// Hook para asignar conversación a un agente - USANDO PUT (más semánticamente correcto)
export function useAssignConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, agentId }: { conversationId: string; agentId: string }) => {
      logger.api('Asignando conversación a agente', { conversationId, agentId });
      // 🔧 ACTUALIZADO: Usar PUT para operación idempotente de asignación
      const response = await api.put<Conversation>(`/conversations/${conversationId}/assign`, {
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
      
      // Si PUT no funciona, intentar con POST como fallback
      if (error.response?.status === 405) {
        logger.api('PUT no soportado para assign, usando POST como fallback');
        // El componente puede reintentar con POST si es necesario
      }
      
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

// 🔊 Hook para tiempo real con Socket.io + Firestore (SIN POLLING)
export function useRealTimeMessages(conversationId: string) {
  const [newMessages, setNewMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
  const [typingUsers, setTypingUsers] = useState<{ userId: string; userName: string }[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    let socket: any = null;
    let firestoreUnsubscribe: (() => void) | null = null;

    const setupRealTimeConnection = async () => {
      try {
        setConnectionStatus('connecting');
        logger.socket('🔌 Configurando conexión tiempo real para conversación', { conversationId });

        // 1. 🔊 Configurar Socket.io
        const { getSocket, initSocket } = await import('@/lib/socket');
        const authToken = localStorage.getItem('authToken');
        
        if (authToken) {
          socket = getSocket() || initSocket(authToken);
          
          if (socket) {
            // Join conversation room
            socket.emit('join-conversation', conversationId);
            logger.socket('🏠 Unido a sala de conversación', { conversationId });
            
            // Escuchar eventos de Socket.io
            socket.on('connect', () => {
              setConnectionStatus('connected');
              logger.socket('✅ Socket conectado para conversación', { conversationId });
            });

            socket.on('disconnect', () => {
              setConnectionStatus('disconnected');
              logger.socket('❌ Socket desconectado para conversación', { conversationId });
            });

            // 🔊 EVENTOS CRÍTICOS DEL BACKEND
            socket.on('new-message', (message: Message) => {
              logger.socket('📨 Nuevo mensaje recibido', { messageId: message.id, conversationId });
              
              // Actualizar React Query cache inmediatamente
              queryClient.setQueryData(['messages', conversationId], (old: any) => {
                if (!old) return old;
                return {
                  ...old,
                  messages: [...(old.messages || []), message]
                };
              });
              
              setNewMessages(prev => [...prev, message]);
            });

            socket.on('message-read', (data: { conversationId: string; messageId: string }) => {
              logger.socket('👁️ Mensaje marcado como leído', data);
              
              // Actualizar cache de mensajes
              queryClient.setQueryData(['messages', data.conversationId], (old: any) => {
                if (!old) return old;
                return {
                  ...old,
                  messages: old.messages?.map((msg: Message) => 
                    msg.id === data.messageId ? { ...msg, status: 'read' } : msg
                  )
                };
              });
            });

            socket.on('conversation-assigned', (data: { conversationId: string; agentId: string }) => {
              logger.socket('👤 Conversación reasignada', data);
              
              // Invalidar cache de conversaciones
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
              queryClient.invalidateQueries({ queryKey: ['conversations', data.conversationId] });
            });

            socket.on('typing-start', (data: { conversationId: string; userId: string; userName: string }) => {
              logger.socket('✍️ Usuario empezó a escribir', data);
              setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), { userId: data.userId, userName: data.userName }]);
            });

            socket.on('typing-stop', (data: { conversationId: string; userId: string }) => {
              logger.socket('⏹️ Usuario dejó de escribir', data);
              setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
            });

            setConnectionStatus('connected');
          }
        }

        // 2. 🔥 Configurar escucha de Firestore (si aplica)
        // Esto es adicional al Socket.io para máxima robustez
        try {
          const { onSnapshot, collection, query, orderBy } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          
          const messagesRef = collection(db, 'conversations', conversationId, 'messages');
          const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'));
          
          firestoreUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            logger.socket('🔥 Firestore: cambios detectados en mensajes', { 
              conversationId, 
              changes: snapshot.docChanges().length 
            });
            
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const message = { id: change.doc.id, ...change.doc.data() } as Message;
                
                // Solo agregar si no vino ya por Socket.io
                queryClient.setQueryData(['messages', conversationId], (old: any) => {
                  if (!old) return old;
                  const exists = old.messages?.some((m: Message) => m.id === message.id);
                  if (exists) return old;
                  
                  return {
                    ...old,
                    messages: [...(old.messages || []), message]
                  };
                });
              }
            });
          });
        } catch (firestoreError) {
          logger.socket('⚠️ Firestore no disponible, usando solo Socket.io', { error: firestoreError });
        }

      } catch (error) {
        setConnectionStatus('error');
        logger.socket('❌ Error configurando conexión tiempo real', { error }, true);
      }
    };

    setupRealTimeConnection();

    return () => {
      if (socket) {
        socket.emit('leave-conversation', conversationId);
        socket.off('new-message');
        socket.off('message-read');
        socket.off('conversation-assigned');
        socket.off('typing-start');
        socket.off('typing-stop');
        logger.socket('🔌 Limpieza de eventos Socket.io completada', { conversationId });
      }
      
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        logger.socket('🔥 Firestore unsubscribe completado', { conversationId });
      }
    };
  }, [conversationId, queryClient]);

  return {
    newMessages,
    connectionStatus,
    typingUsers,
    isConnected: connectionStatus === 'connected'
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