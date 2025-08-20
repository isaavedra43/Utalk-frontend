import { useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useRateLimiter } from '../../hooks/useRateLimiter';

export const useWebSocketTyping = (socket: Socket | null) => {
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  
  // Rate limiter para typing
  const rateLimiter = useRateLimiter({
    maxRequests: 10,
    timeWindow: 2000,
    retryDelay: 500
  });

  // Iniciar typing
  const startTyping = useCallback((conversationId: string) => {
    if (!socket || !socket.connected) {
      console.warn('⚠️ WebSocket no conectado, no se puede iniciar typing');
      return;
    }

    const success = rateLimiter.makeRequest(() => {
      socket.emit('typing', {
        conversationId,
        timestamp: new Date().toISOString()
      });
    });

    if (!success) {
      console.warn('⚠️ Rate limit alcanzado para typing');
    }
  }, [socket, rateLimiter]);

  // Detener typing
  const stopTyping = useCallback((conversationId: string) => {
    if (!socket || !socket.connected) {
      console.warn('⚠️ WebSocket no conectado, no se puede detener typing');
      return;
    }

    const success = rateLimiter.makeRequest(() => {
      socket.emit('stop-typing', {
        conversationId,
        timestamp: new Date().toISOString()
      });
    });

    if (!success) {
      console.warn('⚠️ Rate limit alcanzado para stop-typing');
    }
  }, [socket, rateLimiter]);

  // Procesar evento de typing recibido
  const processTypingEvent = useCallback((data: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }) => {
    const { conversationId, userId, isTyping } = data;
    
    setTypingUsers(prev => {
      const newMap = new Map(prev);
      const conversationUsers = new Set(newMap.get(conversationId) || []);
      
      if (isTyping) {
        conversationUsers.add(userId);
      } else {
        conversationUsers.delete(userId);
      }
      
      if (conversationUsers.size > 0) {
        newMap.set(conversationId, conversationUsers);
      } else {
        newMap.delete(conversationId);
      }
      
      return newMap;
    });
  }, []);

  // TODO: Implementar limpieza automática de typing
  // useEffect(() => {
  //   // Lógica de limpieza automática
  // }, [processTypingEvent]);

  // Obtener usuarios typing para una conversación
  const getTypingUsers = useCallback((conversationId: string): string[] => {
    return Array.from(typingUsers.get(conversationId) || []);
  }, [typingUsers]);

  // Verificar si hay usuarios typing en una conversación
  const isAnyoneTyping = useCallback((conversationId: string): boolean => {
    return (typingUsers.get(conversationId)?.size || 0) > 0;
  }, [typingUsers]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    processTypingEvent,
    getTypingUsers,
    isAnyoneTyping
  };
}; 