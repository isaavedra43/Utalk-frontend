import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { Message, MessageInputData } from '../types';
import { messagesService } from '../services/messages';
import { useAppStore } from '../stores/useAppStore';
import { useWebSocketContext } from './useWebSocketContext';

export const useMessages = (conversationId: string | null) => {

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasInitialScroll, setHasInitialScroll] = useState(false);
  
  const {
    messages: storeMessages,
    setMessages,
    addMessage: addStoreMessage,
    updateMessage: updateStoreMessage
  } = useAppStore();

  // WebSocket context
  const {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage: socketSendMessage,
    markMessagesAsRead: socketMarkAsRead,
    typingUsers: socketTypingUsers,
    on,
    off
  } = useWebSocketContext();

  // Query para obtener mensajes
  const {
    data: messagesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => conversationId ? messagesService.getMessages(conversationId, { limit: 50 }) : Promise.resolve({ messages: [], hasMore: false }),
    enabled: !!conversationId,
    staleTime: 10000,
    refetchOnWindowFocus: false
  });

  // Sincronizar mensajes del store con la query
  useEffect(() => {
    if (conversationId && messagesData?.messages) {
      setMessages(conversationId, messagesData.messages);
    }
  }, [conversationId, messagesData?.messages, setMessages]);

  // Unirse a conversación cuando se conecta
  useEffect(() => {
    if (isConnected && conversationId) {
      joinConversation(conversationId);
    }
  }, [isConnected, conversationId, joinConversation]);

  // Salir de conversación al desmontar
  useEffect(() => {
    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, leaveConversation]);

  // Configurar listeners de socket para esta conversación
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (data: unknown) => {
      const eventData = data as { conversationId: string; message: Message };
      if (eventData.conversationId === conversationId) {
        addStoreMessage(conversationId, eventData.message);
        // Scroll al final si estamos cerca del final
        if (hasInitialScroll) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    };

    const handleMessageSent = (data: unknown) => {
      const eventData = data as { conversationId: string; message: Message };
      if (eventData.conversationId === conversationId) {
        // Actualizar mensaje con confirmación
        updateStoreMessage(conversationId, eventData.message.id, eventData.message);
      }
    };

    const handleTyping = (data: unknown) => {
      const eventData = data as { conversationId: string; userEmail: string };
      if (eventData.conversationId === conversationId) {
        console.log('Usuario escribiendo:', eventData.userEmail);
      }
    };

    const handleTypingStop = (data: unknown) => {
      const eventData = data as { conversationId: string; userEmail: string };
      if (eventData.conversationId === conversationId) {
        console.log('Usuario dejó de escribir:', eventData.userEmail);
      }
    };

    on('new-message', handleNewMessage);
    on('message-sent', handleMessageSent);
    on('typing', handleTyping);
    on('typing-stop', handleTypingStop);

    return () => {
      off('new-message');
      off('message-sent');
      off('typing');
      off('typing-stop');
    };
  }, [socket, conversationId, on, off, addStoreMessage, updateStoreMessage, hasInitialScroll]);

  // Mutation para enviar mensaje
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, messageData }: { conversationId: string; messageData: MessageInputData }) =>
      messagesService.sendMessage(conversationId, messageData),
    onSuccess: (newMessage, variables) => {
      // Agregar mensaje al store
      addStoreMessage(variables.conversationId, newMessage);
      // Refetch para obtener mensajes actualizados
      refetch();
      // Scroll al final solo si es un mensaje nuevo
      if (!hasInitialScroll) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  });

  // Mutation para marcar como leído
  const markAsReadMutation = useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      messagesService.markMessageAsRead(conversationId, messageId),
    onSuccess: (updatedMessage, variables) => {
      // Actualizar mensaje en el store
      updateStoreMessage(variables.conversationId, variables.messageId, updatedMessage);
      refetch();
    }
  });

  // Función para enviar mensaje
  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'document' | 'location' | 'audio' | 'voice' | 'video' | 'sticker' = 'text') => {
    if (!conversationId || !content.trim()) return;

    const messageData: MessageInputData = {
      content: content.trim(),
      type,
      metadata: {
        source: 'web',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    };

    try {
      // Enviar por socket para tiempo real
      const socketSuccess = socketSendMessage(conversationId, content.trim(), type, messageData.metadata);
      
      if (!socketSuccess) {
        console.warn('Socket no disponible, enviando solo por API');
      }

      // También enviar por API para persistencia
      await sendMessageMutation.mutateAsync({ conversationId, messageData });
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  }, [conversationId, socketSendMessage, sendMessageMutation]);

  // Función para marcar mensajes como leídos
  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    if (!conversationId) return;

    try {
      // Enviar por socket
      socketMarkAsRead(conversationId, messageIds);

      // También enviar por API
      await Promise.all(
        messageIds.map(messageId => 
          markAsReadMutation.mutateAsync({ conversationId, messageId })
        )
      );
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  }, [conversationId, socketMarkAsRead, markAsReadMutation]);

  // Función para cargar más mensajes (scroll infinito)
  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      // TODO: Implementar carga de más mensajes cuando el backend esté listo
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error cargando más mensajes:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, isLoadingMore]);

  // Agrupar mensajes por fecha
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: Record<string, Message[]> = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages: messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }));
  };

  // Obtener mensajes del store o de la query
  const currentMessages = useMemo(() => 
    conversationId ? (storeMessages[conversationId] || messagesData?.messages || []) : [],
    [conversationId, storeMessages, messagesData?.messages]
  );

  // Scroll al final cuando se cargan nuevos mensajes (solo inicialmente)
  useEffect(() => {
    if (currentMessages.length && !hasInitialScroll) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        setHasInitialScroll(true);
      }, 100);
    }
  }, [currentMessages.length, hasInitialScroll]);

  // Marcar mensajes como leídos cuando se selecciona la conversación
  useEffect(() => {
    if (conversationId && currentMessages.length) {
      const unreadMessages = currentMessages.filter(
        msg => msg.direction === 'inbound' && msg.status !== 'read'
      );
      
      if (unreadMessages.length > 0) {
        markMessagesAsRead(unreadMessages.map(msg => msg.id));
      }
    }
  }, [conversationId, currentMessages, markMessagesAsRead]);

  // Resetear estado cuando cambia la conversación
  useEffect(() => {
    setHasInitialScroll(false);
  }, [conversationId]);

  const messageGroups = groupMessagesByDate(currentMessages);

  // Combinar typing users del socket con los locales
  const allTypingUsers = useMemo(() => {
    const socketUsers = Array.from(socketTypingUsers.get(conversationId || '') || []);
    
    return socketUsers.map(email => ({
      conversationId: conversationId || '',
      userId: email,
      userName: email.split('@')[0],
      isTyping: true,
      timestamp: new Date()
    }));
  }, [socketTypingUsers, conversationId]);

  return {
    // Datos
    messages: currentMessages,
    messageGroups,
    hasMore: false, // TODO: Implementar cuando el backend esté listo
    
    // Estados
    isLoading,
    error,
    typingUsers: allTypingUsers,
    isFetchingNextPage: isLoadingMore,
    
    // Referencias
    messagesEndRef,
    
    // Acciones
    sendMessage,
    markMessagesAsRead,
    loadMoreMessages,
    refetch,
    
    // Estados de mutaciones
    isSending: sendMessageMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending
  };
}; 