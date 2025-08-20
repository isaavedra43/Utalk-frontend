import { useState, useCallback, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useRateLimiter } from '../../hooks/useRateLimiter';
import { infoLog } from '../../config/logger';

export const useWebSocketTyping = (socket: Socket | null) => {
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  
  // Mapa para expiración de indicadores: conversationId -> (userId -> expirationTimestamp)
  const typingExpirationRef = useRef<Map<string, Map<string, number>>>(new Map());
  const cleanupIntervalRef = useRef<number | null>(null);

  // Configuración de expiración de typing (ms)
  const TYPING_TTL_MS = 5000;

  // Rate limiter para typing
  const rateLimiter = useRateLimiter({
    maxRequests: 10,
    timeWindow: 2000,
    retryDelay: 500
  });

  // Iniciar typing
  const startTyping = useCallback((conversationId: string) => {
    if (!socket || !socket.connected) {
      infoLog('⚠️ WebSocket no conectado, no se puede iniciar typing');
      return;
    }

    const success = rateLimiter.makeRequest(() => {
      socket.emit('typing', {
        conversationId,
        timestamp: new Date().toISOString()
      });
    });

    if (!success) {
      infoLog('⚠️ Rate limit alcanzado para typing');
    }
  }, [socket, rateLimiter]);

  // Detener typing
  const stopTyping = useCallback((conversationId: string) => {
    if (!socket || !socket.connected) {
      infoLog('⚠️ WebSocket no conectado, no se puede detener typing');
      return;
    }

    const success = rateLimiter.makeRequest(() => {
      socket.emit('stop-typing', {
        conversationId,
        timestamp: new Date().toISOString()
      });
    });

    if (!success) {
      infoLog('⚠️ Rate limit alcanzado para stop-typing');
    }
  }, [socket, rateLimiter]);

  // Procesar evento de typing recibido
  const processTypingEvent = useCallback((data: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }) => {
    const { conversationId, userId, isTyping } = data;

    // Actualizar expiración
    const perConversation = typingExpirationRef.current.get(conversationId) || new Map<string, number>();
    if (isTyping) {
      perConversation.set(userId, Date.now() + TYPING_TTL_MS);
    } else {
      perConversation.delete(userId);
    }
    if (perConversation.size > 0) {
      typingExpirationRef.current.set(conversationId, perConversation);
    } else {
      typingExpirationRef.current.delete(conversationId);
    }

    // Actualizar estado visible
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

  // Limpieza automática de indicadores expirados
  useEffect(() => {
    // Capturar el valor del ref al inicio del efecto
    const expirationRef = typingExpirationRef.current;
    
    // Crear intervalo de limpieza si no existe
    if (cleanupIntervalRef.current == null) {
      cleanupIntervalRef.current = window.setInterval(() => {
        const now = Date.now();
        let changed = false;

        typingExpirationRef.current.forEach((userMap, conversationId) => {
          userMap.forEach((expiresAt, userId) => {
            if (expiresAt <= now) {
              userMap.delete(userId);
              changed = true;
            }
          });
          if (userMap.size === 0) {
            typingExpirationRef.current.delete(conversationId);
          } else {
            typingExpirationRef.current.set(conversationId, userMap);
          }
        });

        if (changed) {
          setTypingUsers(() => {
            const newMap = new Map<string, Set<string>>();
            typingExpirationRef.current.forEach((userMap, convId) => {
              newMap.set(convId, new Set<string>(Array.from(userMap.keys())));
            });
            return newMap;
          });
        }
      }, 1000);
    }

    // Cleanup total
    return () => {
      if (cleanupIntervalRef.current != null) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }
      const timer = expirationRef;
      if (timer) {
        timer.clear();
      }
    };
  }, [setTypingUsers]);

  // Escuchar eventos de typing del socket
  useEffect(() => {
    if (!socket) return;

    const handleTyping = (data: { conversationId: string; userId: string }) => {
      processTypingEvent({ conversationId: data.conversationId, userId: data.userId, isTyping: true });
    };

    const handleStopTyping = (data: { conversationId: string; userId: string }) => {
      processTypingEvent({ conversationId: data.conversationId, userId: data.userId, isTyping: false });
    };

    socket.on('typing', handleTyping);
    socket.on('stop-typing', handleStopTyping);

    return () => {
      socket.off('typing', handleTyping);
      socket.off('stop-typing', handleStopTyping);
    };
  }, [socket, processTypingEvent]);

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