import React, { createContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useWebSocket } from '../hooks/useWebSocket';

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

  const [activeConversations, setActiveConversations] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Autoconnect eliminado: la conexión del WebSocket se maneja desde AuthContext para evitar duplicados

  // Reautenticar socket cuando se refresca el access token
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { accessToken?: string } | undefined;
      const accessToken = detail?.accessToken;
      if (!accessToken) return;
      disconnect();
      connect(accessToken);
    };

    window.addEventListener('auth:token-refreshed', handler as unknown as EventListener);
    return () => window.removeEventListener('auth:token-refreshed', handler as unknown as EventListener);
  }, [connect, disconnect]);

  // Configurar listeners globales
  useEffect(() => {
    if (!socket) return;

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

    // Usuario escribiendo
    on('typing', (data: unknown) => {
      const eventData = data as { conversationId: string; userEmail: string };
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
      setOnlineUsers(prev => new Set(prev).add(eventData.email));
    });

    // Usuario desconectado
    on('user-offline', (data: unknown) => {
      const eventData = data as { email: string };
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

    // Sincronización requerida
    on('sync-required', (data: unknown) => {
      console.log('🔄 Sincronización requerida:', data);
      emit('sync-state', { syncId: Date.now() });
    });

    // Estado sincronizado
    on('state-synced', (data: unknown) => {
      console.log('✅ Estado sincronizado:', data);
      // Actualizar estado global
    });

    return () => {
      // Limpiar listeners
      off('new-message');
      off('message-sent');
      off('typing');
      off('typing-stop');
      off('user-online');
      off('user-offline');
      off('conversation-event');
      off('server-shutdown');
      off('sync-required');
      off('state-synced');
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
      emit('join-conversation', { conversationId });
      setActiveConversations(prev => new Set(prev).add(conversationId));
    },
    leaveConversation: (conversationId: string) => {
      emit('leave-conversation', { conversationId });
      setActiveConversations(prev => {
        const newSet = new Set(prev);
        newSet.delete(conversationId);
        return newSet;
      });
    },
    startTyping: (conversationId: string) => {
      emit('typing', { conversationId });
    },
    stopTyping: (conversationId: string) => {
      emit('typing-stop', { conversationId });
    },
    sendMessage: (conversationId: string, content: string, type = 'text', metadata = {}) => {
      return emit('new-message', {
        conversationId,
        content,
        type,
        metadata
      });
    },
    markMessagesAsRead: (conversationId: string, messageIds: string[]) => {
      emit('message-read', {
        conversationId,
        messageIds
      });
    },
    changeUserStatus: (status: string) => {
      emit('user-status-change', { status });
    },
    syncState: () => {
      emit('sync-state', { syncId: Date.now() });
    }
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export { WebSocketContext }; 