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
import { convertLegacyPagination } from "@/types/pagination";

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

// 🔄 LEGACY: Hook compatible con page/pageSize (DEPRECATED)
export function useMessagesLegacy(conversationId: string, params?: {
  page?: number;
  pageSize?: number;
}) {
  // Convertir parámetros legacy a nuevo formato
  const unifiedParams = params ? convertLegacyPagination(params) : undefined;
  
  logger.api('⚠️ USANDO HOOK LEGACY - Migrar a useMessages con PaginationParams', { 
    conversationId, 
    legacyParams: params,
    unifiedParams 
  });
  
  return useMessages(conversationId, unifiedParams);
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

// 🔧 Hook para obtener mensajes - UNIFICADO a limit/startAfter
export function useMessages(conversationId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ['messages', conversationId, params],
    queryFn: async () => {
      logger.api('Obteniendo mensajes de conversación', { conversationId, params });
      const response = await api.get<any>(`/conversations/${conversationId}/messages`, params);
      
      // ✅ USA LA FUNCIÓN UTILITARIA PARA EXTRAER DATOS
      const messages = extractData<Message>(response, 'messages');

      // 🔧 USAR NUEVA FUNCIÓN DE PROCESAMIENTO ROBUSTA
      const processedMessages = processMessages(messages);

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
              logger.socket('✅ Socket conectado exitosamente', { conversationId, socketId: socket.id });
            });

            socket.on('disconnect', (reason: string) => {
              setConnectionStatus('disconnected');
              logger.socket('❌ Socket desconectado', { conversationId, reason });
            });

            socket.on('connect_error', (error: any) => {
              setConnectionStatus('error');
              logger.socket('🔴 Error de conexión Socket', { conversationId, error: error.message }, true);
            });

            // 📤 new-message: agrega el mensaje instantáneamente al chat
            socket.on('message:new', (message: Message) => {
              logger.socket('📨 Nuevo mensaje recibido via Socket', { 
                messageId: message.id, 
                conversationId,
                sender: message.sender 
              });
              
              setNewMessages(prev => {
                const exists = prev.some(msg => msg.id === message.id);
                if (!exists) {
                  return [...prev, message];
                }
                return prev;
              });

              // Actualizar cache de React Query sin refetch
              queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
                if (oldData?.messages) {
                  const exists = oldData.messages.some((msg: Message) => msg.id === message.id);
                  if (!exists) {
                    return {
                      ...oldData,
                      messages: [...oldData.messages, message]
                    };
                  }
                }
                return oldData;
              });
            });

            // 📖 message-read: actualiza el estado de leído/no leído en la UI
            socket.on('message:read', (data: { conversationId: string; messageId: string }) => {
              logger.socket('👁 Mensaje marcado como leído', data);
              
              queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
                if (oldData?.messages) {
                  return {
                    ...oldData,
                    messages: oldData.messages.map((msg: Message) =>
                      msg.id === data.messageId ? { ...msg, status: 'read' } : msg
                    )
                  };
                }
                return oldData;
              });
            });

            // ✍️ typing-start y typing-stop: muestra "está escribiendo..."
            socket.on('user:typing', (data: { conversationId: string; userId: string; userName?: string; isTyping: boolean }) => {
              if (data.conversationId === conversationId) {
                logger.socket(`✍️ Usuario ${data.isTyping ? 'escribiendo' : 'dejó de escribir'}`, { 
                  userId: data.userId, 
                  userName: data.userName 
                });
                
                setTypingUsers(prev => {
                  if (data.isTyping) {
                    const exists = prev.some(user => user.userId === data.userId);
                    if (!exists) {
                      return [...prev, { userId: data.userId, userName: data.userName || 'Usuario' }];
                    }
                  } else {
                    return prev.filter(user => user.userId !== data.userId);
                  }
                  return prev;
                });
              }
            });

            // 🏷 conversation-assigned: notifica si cambia el agente asignado
            socket.on('conversation:assigned', (data: { conversationId: string; agentId: string; agentName: string }) => {
              if (data.conversationId === conversationId) {
                logger.socket('👤 Conversación reasignada', data);
                
                // Mostrar notificación
                import('@/hooks/use-toast').then(({ toast }) => {
                  toast({
                    title: "Conversación reasignada",
                    description: `La conversación ha sido asignada a ${data.agentName}`,
                  });
                });

                // Invalidar queries para actualizar la información de la conversación
                queryClient.invalidateQueries({ queryKey: ['conversations', conversationId] });
              }
            });

            setConnectionStatus('connected');
          }
        }

        // 2. 🔥 Configurar Firestore listener para persistencia (backup)
        const { onSnapshot, collection, query, orderBy } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        
        // Query que funciona tanto con timestamp como createdAt
        let firestoreQuery;
        try {
          firestoreQuery = query(messagesRef, orderBy('timestamp', 'desc'));
        } catch (timestampError) {
          logger.socket('⚠️ Campo timestamp no existe, usando createdAt', { conversationId });
          firestoreQuery = query(messagesRef, orderBy('createdAt', 'desc'));
        }
        
        firestoreUnsubscribe = onSnapshot(firestoreQuery, 
          (snapshot) => {
            const newFirestoreMessages = snapshot.docChanges()
              .filter(change => change.type === 'added')
              .map(change => {
                const data = change.doc.data();
                return {
                  id: change.doc.id,
                  conversationId: data.conversationId || conversationId,
                  content: data.content || data.text || '',
                  sender: data.sender || 'client',
                  // 🔥 SOLUCION: Manejar tanto timestamp como createdAt
                  timestamp: data.timestamp?.toDate?.()?.toISOString() || 
                            data.createdAt?.toDate?.()?.toISOString() || 
                            new Date().toISOString(),
                  status: data.status || 'sent',
                  type: data.type || 'text',
                  attachments: data.attachments || []
                } as Message;
              });

            if (newFirestoreMessages.length > 0) {
              logger.socket('🔥 Nuevos mensajes de Firestore', { count: newFirestoreMessages.length });
              
              // Solo agregar si Socket.io no está disponible (fallback)
              if (connectionStatus !== 'connected') {
                setNewMessages(prev => {
                  const filtered = newFirestoreMessages.filter(newMsg => 
                    !prev.some(existingMsg => existingMsg.id === newMsg.id)
                  );
                  return [...prev, ...filtered];
                });
              }
            }
          },
          (error) => {
            logger.socket('❌ Error en Firestore listener', { conversationId, error: error.message }, true);
          }
        );

      } catch (error) {
        setConnectionStatus('error');
        logger.socket('❌ Error configurando tiempo real', { conversationId, error }, true);
      }
    };

    setupRealTimeConnection();

    return () => {
      logger.socket('🧹 Limpiando conexión tiempo real', { conversationId });
      
      if (socket) {
        socket.emit('leave-conversation', conversationId);
        socket.off('message:new');
        socket.off('message:read');
        socket.off('user:typing');
        socket.off('conversation:assigned');
      }
      
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
      
      setConnectionStatus('disconnected');
      setTypingUsers([]);
    };
  }, [conversationId, queryClient, connectionStatus]);

  // Función para indicar que el usuario está escribiendo
  const setTyping = useCallback(async (isTyping: boolean) => {
    try {
      const { getSocket } = await import('@/lib/socket');
      const socket = getSocket();
      
      if (socket && conversationId) {
        const eventName = isTyping ? 'typing:start' : 'typing:stop';
        // Obtener ID real del usuario desde localStorage o contexto
        const getUserId = () => {
          try {
            const authToken = localStorage.getItem('authToken');
            if (authToken) {
              // Decodificar JWT para obtener user ID (método simple)
              const payload = JSON.parse(atob(authToken.split('.')[1]));
              return payload.userId || payload.sub || 'unknown-user';
            }
          } catch (error) {
            logger.api('Error obteniendo userId del token', { error }, true);
          }
          return 'anonymous-user';
        };

        socket.emit(eventName, { 
          conversationId, 
          userId: getUserId()
        });
        
        logger.socket(`📝 Evento ${eventName} enviado`, { conversationId });
      }
    } catch (error) {
      logger.socket('❌ Error enviando estado de typing', { error }, true);
    }
  }, [conversationId]);

  return {
    newMessages,
    connectionStatus,
    typingUsers,
    setTyping,
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