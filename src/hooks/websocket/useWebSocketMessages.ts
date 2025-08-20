import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useRateLimiter } from '../../hooks/useRateLimiter';

export const useWebSocketMessages = (socket: Socket | null) => {
  // const { addMessage, updateConversation } = useChatStore(); // TODO: Usar cuando se implemente procesamiento completo
  
  // Rate limiter para mensajes
  const rateLimiter = useRateLimiter({
    maxRequests: 5,
    timeWindow: 3000,
    retryDelay: 1000
  });

  // Enviar mensaje
  const sendMessage = useCallback((
    conversationId: string, 
    content: string, 
    type: string = 'text', 
    metadata?: Record<string, unknown>
  ) => {
    if (!socket || !socket.connected) {
      console.warn('⚠️ WebSocket no conectado, no se puede enviar mensaje');
      return false;
    }

    const success = rateLimiter.makeRequest(() => {
      socket.emit('new-message', {
        conversationId,
        content,
        type,
        metadata,
        timestamp: new Date().toISOString()
      });
    });

    if (!success) {
      console.warn('⚠️ Rate limit alcanzado para envío de mensajes');
      return false;
    }

    return true;
  }, [socket, rateLimiter]);

  // Marcar mensajes como leídos
  const markMessagesAsRead = useCallback((conversationId: string, messageIds: string[]) => {
    if (!socket || !socket.connected) {
      console.warn('⚠️ WebSocket no conectado, no se pueden marcar mensajes como leídos');
      return;
    }

    const success = rateLimiter.makeRequest(() => {
      socket.emit('mark-read', {
        conversationId,
        messageIds,
        timestamp: new Date().toISOString()
      });
    });

    if (!success) {
      console.warn('⚠️ Rate limit alcanzado para marcar mensajes como leídos');
    }
  }, [socket, rateLimiter]);

  // Procesar mensaje recibido (simplificado para evitar errores de tipos)
  const processReceivedMessage = useCallback((data: {
    conversationId: string;
    message: {
      id: string;
      content: string;
      sender: string;
      timestamp: string;
      type?: string;
      metadata?: Record<string, unknown>;
    };
  }) => {
    const { conversationId, message } = data;
    
    // TODO: Implementar procesamiento completo de mensajes
    // Por ahora solo log para evitar errores de tipos
    console.log('📨 Mensaje recibido:', { conversationId, message });
  }, []);

  return {
    sendMessage,
    markMessagesAsRead,
    processReceivedMessage
  };
}; 