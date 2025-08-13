import React, { createContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useWebSocket } from '../hooks/useWebSocket';
import { useRateLimiter } from '../hooks/useRateLimiter';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
  activeConversations: Set<string>;
  typingUsers: Map<string, Set<string>>;
  onlineUsers: Set<string>;
  connect: (token: string) => void;
  disconnect: () => void;
  emit: (event: string, data: unknown) => boolean;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string, type?: string, metadata?: Record<string, unknown>) => boolean;
  markMessagesAsRead: (conversationId: string, messageIds: string[]) => void;
  changeUserStatus: (status: string) => void;
  syncState: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    socket,
    isConnected,
    connectionError,
    connect,
    disconnect,
    on,
    off,
    emit
  } = useWebSocket();

  // Rate limiter para eventos del WebSocket
  const rateLimiter = useRateLimiter();

  const [activeConversations, setActiveConversations] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Función para verificar si el token es válido
  const isTokenValid = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isValid = payload.exp > currentTime + 300; // 5 minutos de margen
      
      console.log('🔐 Verificando token:', {
        exp: payload.exp,
        currentTime,
        isValid,
        expiresIn: Math.floor(payload.exp - currentTime)
      });
      
      return isValid;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  };

  // Conectar automáticamente cuando hay un token válido
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && isTokenValid(token) && !isConnected) {
      console.log('🔌 WebSocketContext - Conectando automáticamente con token válido');
      // Agregar un pequeño delay para asegurar que la autenticación esté completa
      setTimeout(() => {
        connect(token);
      }, 1000);
    }
  }, [isConnected, connect]); // Incluir 'connect' en las dependencias

  // Reautenticar socket cuando se refresca el access token
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { accessToken?: string } | undefined;
      const accessToken = detail?.accessToken;
      if (!accessToken) return;
      
      console.log('🔌 WebSocketContext - Token refrescado, reconectando...');
      disconnect();
      connect(accessToken);
    };

    window.addEventListener('auth:token-refreshed', handler as unknown as EventListener);
    return () => window.removeEventListener('auth:token-refreshed', handler as unknown as EventListener);
  }, [connect, disconnect]); // Incluir dependencias necesarias

  // Configurar listeners globales
  useEffect(() => {
    if (!socket) return;

    console.log('🔌 WebSocketContext - Configurando listeners globales');

    // Nuevo mensaje
    on('new-message', (data: unknown) => {
      console.log('📨 Nuevo mensaje recibido:', data);
      // El hook de chat manejará esto
    });

    // Mensaje enviado (confirmación)
    on('message-sent', (data: unknown) => {
      console.log('✅ Mensaje enviado confirmado:', data);
      // Actualizar estado del mensaje
    });

    // CONFIRMACIONES DE CONVERSACIÓN - CRÍTICO PARA EL CHAT
    on('conversation-joined', (data: unknown) => {
      const eventData = data as { conversationId: string; roomId: string; onlineUsers: string[]; timestamp: string };
      console.log('✅ Confirmado: Unido a conversación:', eventData);
      
      // Actualizar estado de conversación activa
      setActiveConversations(prev => new Set(prev).add(eventData.conversationId));
      
      // Emitir evento personalizado para que los hooks lo escuchen
      window.dispatchEvent(new CustomEvent('conversation:joined', { detail: eventData }));
    });

    on('conversation-left', (data: unknown) => {
      const eventData = data as { conversationId: string; timestamp: string };
      console.log('✅ Confirmado: Salido de conversación:', eventData);
      
      // Limpiar estado de conversación
      setActiveConversations(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventData.conversationId);
        return newSet;
      });
      
      // Emitir evento personalizado para que los hooks lo escuchen
      window.dispatchEvent(new CustomEvent('conversation:left', { detail: eventData }));
    });

    // MANEJO DE ERRORES DEL SERVIDOR - CRÍTICO
    on('error', (data: unknown) => {
      const errorData = data as { error: string; message: string; conversationId?: string };
      console.error('❌ Error del servidor:', errorData);
      
      // Emitir evento personalizado para manejo de errores
      window.dispatchEvent(new CustomEvent('websocket:error', { detail: errorData }));
    });

    // Usuario escribiendo
    on('typing', (data: unknown) => {
      const eventData = data as { conversationId: string; userEmail: string };
      console.log('✍️ Usuario escribiendo:', eventData);
      
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        const conversationUsers = newMap.get(eventData.conversationId) || new Set();
        conversationUsers.add(eventData.userEmail);
        newMap.set(eventData.conversationId, conversationUsers);
        return newMap;
      });
    });

    // Usuario dejó de escribir
    on('typing-stop', (data: unknown) => {
      const eventData = data as { conversationId: string; userEmail: string };
      console.log('⏹️ Usuario dejó de escribir:', eventData);
      
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        const conversationUsers = newMap.get(eventData.conversationId);
        if (conversationUsers) {
          conversationUsers.delete(eventData.userEmail);
          if (conversationUsers.size === 0) {
            newMap.delete(eventData.conversationId);
          } else {
            newMap.set(eventData.conversationId, conversationUsers);
          }
        }
        return newMap;
      });
    });

    // Usuario en línea
    on('user-online', (data: unknown) => {
      const eventData = data as { email: string };
      console.log('🟢 Usuario en línea:', eventData);
      setOnlineUsers(prev => new Set(prev).add(eventData.email));
    });

    // Usuario desconectado
    on('user-offline', (data: unknown) => {
      const eventData = data as { email: string };
      console.log('🔴 Usuario desconectado:', eventData);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventData.email);
        return newSet;
      });
    });

    // Evento de conversación
    on('conversation-event', (data: unknown) => {
      console.log('💬 Evento de conversación:', data);
      // Actualizar lista de conversaciones
    });

    // Shutdown del servidor
    on('server-shutdown', (data: unknown) => {
      console.log('🔄 Servidor reiniciándose:', data);
      // Mostrar notificación y reconectar
    });

    // Estado sincronizado
    on('state-synced', (data: unknown) => {
      console.log('✅ WebSocketContext - Estado sincronizado:', data);
      // Emitir evento personalizado para que useConversations lo escuche
      window.dispatchEvent(new CustomEvent('websocket:state-synced', { detail: data }));
    });

    // Sincronización requerida
    on('sync-required', (data: unknown) => {
      console.log('🔄 WebSocketContext - Sincronización requerida:', data);
      // Emitir evento personalizado para que useConversations lo escuche
      window.dispatchEvent(new CustomEvent('websocket:sync-required', { detail: data }));
    });

    // Respuesta de prueba
    on('test-response', (data: unknown) => {
      console.log('🧪 Respuesta de prueba recibida:', data);
    });

    return () => {
      console.log('🔌 WebSocketContext - Limpiando listeners');
      // Limpiar listeners
      off('new-message');
      off('message-sent');
      off('conversation-joined');
      off('conversation-left');
      off('error');
      off('typing');
      off('typing-stop');
      off('user-online');
      off('user-offline');
      off('conversation-event');
      off('server-shutdown');
      off('sync-required');
      off('state-synced');
      off('test-response');
    };
  }, [socket, on, off, emit]);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    connectionError,
    activeConversations,
    typingUsers,
    onlineUsers,
    connect,
    disconnect,
    emit,
    on,
    off,
    joinConversation: (conversationId: string) => {
      console.log('🔗 Uniéndose a conversación:', conversationId);
      rateLimiter.executeWithRateLimit('join-conversation', () => {
        emit('join-conversation', { conversationId });
        setActiveConversations(prev => new Set(prev).add(conversationId));
      }, (eventType, retryAfter) => {
        console.warn(`⚠️ Rate limit excedido para ${eventType}, reintentando en ${retryAfter}ms`);
      });
    },
    leaveConversation: (conversationId: string) => {
      console.log('🔌 Saliendo de conversación:', conversationId);
      rateLimiter.executeWithRateLimit('leave-conversation', () => {
        emit('leave-conversation', { conversationId });
        setActiveConversations(prev => {
          const newSet = new Set(prev);
          newSet.delete(conversationId);
          return newSet;
        });
      }, (eventType, retryAfter) => {
        console.warn(`⚠️ Rate limit excedido para ${eventType}, reintentando en ${retryAfter}ms`);
      });
    },
    startTyping: (conversationId: string) => {
      console.log('✍️ Iniciando typing en conversación:', conversationId);
      rateLimiter.executeWithRateLimit('typing', () => {
        emit('typing', { conversationId });
      }, (eventType, retryAfter) => {
        console.warn(`⚠️ Rate limit excedido para ${eventType}, reintentando en ${retryAfter}ms`);
      });
    },
    stopTyping: (conversationId: string) => {
      console.log('⏹️ Deteniendo typing en conversación:', conversationId);
      rateLimiter.executeWithRateLimit('typing-stop', () => {
        emit('typing-stop', { conversationId });
      }, (eventType, retryAfter) => {
        console.warn(`⚠️ Rate limit excedido para ${eventType}, reintentando en ${retryAfter}ms`);
      });
    },
    sendMessage: (conversationId: string, content: string, type = 'text', metadata = {}) => {
      console.log('📤 Enviando mensaje:', { conversationId, content, type, metadata });
      let success = false;
      rateLimiter.executeWithRateLimit('new-message', () => {
        success = emit('new-message', {
          conversationId,
          content,
          type,
          metadata
        });
      }, (eventType, retryAfter) => {
        console.warn(`⚠️ Rate limit excedido para ${eventType}, reintentando en ${retryAfter}ms`);
      });
      return success;
    },
    markMessagesAsRead: (conversationId: string, messageIds: string[]) => {
      console.log('👁️ Marcando mensajes como leídos:', { conversationId, messageIds });
      rateLimiter.executeWithRateLimit('message-read', () => {
        emit('message-read', {
          conversationId,
          messageIds
        });
      }, (eventType, retryAfter) => {
        console.warn(`⚠️ Rate limit excedido para ${eventType}, reintentando en ${retryAfter}ms`);
      });
    },
    changeUserStatus: (status: string) => {
      console.log('👤 Cambiando estado de usuario:', status);
      rateLimiter.executeWithRateLimit('user-status-change', () => {
        emit('user-status-change', { status });
      }, (eventType, retryAfter) => {
        console.warn(`⚠️ Rate limit excedido para ${eventType}, reintentando en ${retryAfter}ms`);
      });
    },
    syncState: () => {
      console.log('🔄 Sincronizando estado');
      rateLimiter.executeWithRateLimit('sync-state', () => {
        emit('sync-state', { syncId: Date.now() });
      }, (eventType, retryAfter) => {
        console.warn(`⚠️ Rate limit excedido para ${eventType}, reintentando en ${retryAfter}ms`);
      });
    }
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export { WebSocketContext }; 