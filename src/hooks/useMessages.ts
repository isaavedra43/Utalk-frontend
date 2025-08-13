import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { Message, MessageInputData, TypingIndicator } from '../types';
import { messagesService, mockMessages } from '../services/messages';

export const useMessages = (conversationId: string | null) => {
  const [typingUsers] = useState<TypingIndicator[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Query para obtener mensajes
  const {
    data: messagesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => conversationId ? messagesService.getMessages(conversationId) : Promise.resolve({ messages: [], hasMore: false }),
    // Por ahora usar datos mock mientras no hay backend
    initialData: conversationId ? {
      messages: mockMessages.filter(msg => msg.conversationId === conversationId),
      hasMore: false
    } : { messages: [], hasMore: false },
    enabled: !!conversationId,
    staleTime: 10000, // 10 segundos
    refetchOnWindowFocus: false
  });

  // Mutation para enviar mensaje
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, messageData }: { conversationId: string; messageData: MessageInputData }) =>
      messagesService.sendMessage(conversationId, messageData),
    onSuccess: () => {
      // Refetch para obtener mensajes actualizados
      refetch();
      // Scroll al final
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  });

  // Mutation para marcar como leído
  const markAsReadMutation = useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      messagesService.markMessageAsRead(conversationId, messageId),
    onSuccess: () => {
      refetch();
    }
  });

  // Función para enviar mensaje
  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'document' | 'location' = 'text') => {
    if (!conversationId || !content.trim()) return;

    const messageData: MessageInputData = {
      content: content.trim(),
      type,
      metadata: {
        source: 'web',
        timestamp: new Date().toISOString()
      }
    };

    try {
      await sendMessageMutation.mutateAsync({ conversationId, messageData });
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  }, [conversationId, sendMessageMutation]);

  // Función para marcar mensajes como leídos
  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    if (!conversationId) return;

    try {
      await Promise.all(
        messageIds.map(messageId => 
          markAsReadMutation.mutateAsync({ conversationId, messageId })
        )
      );
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  }, [conversationId, markAsReadMutation]);

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

  // Scroll al final cuando se cargan nuevos mensajes
  useEffect(() => {
    if (messagesData?.messages.length) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messagesData?.messages.length]);

  // Marcar mensajes como leídos cuando se selecciona la conversación
  useEffect(() => {
    if (conversationId && messagesData?.messages.length) {
      const unreadMessages = messagesData.messages.filter(
        msg => msg.direction === 'inbound' && msg.status !== 'read'
      );
      
      if (unreadMessages.length > 0) {
        markMessagesAsRead(unreadMessages.map(msg => msg.id));
      }
    }
  }, [conversationId, messagesData?.messages, markMessagesAsRead]);

  const messageGroups = groupMessagesByDate(messagesData?.messages || []);

  return {
    // Datos
    messages: messagesData?.messages || [],
    messageGroups,
    hasMore: messagesData?.hasMore || false,
    
    // Estados
    isLoading,
    error,
    typingUsers,
    
    // Referencias
    messagesEndRef,
    
    // Acciones
    sendMessage,
    markMessagesAsRead,
    refetch,
    
    // Estados de mutaciones
    isSending: sendMessageMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending
  };
}; 