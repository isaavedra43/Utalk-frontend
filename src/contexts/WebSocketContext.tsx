import React, { createContext, useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useWebSocket } from '../hooks/useWebSocket';
import { useRateLimiter } from '../hooks/useRateLimiter';
import { generateRoomId as generateRoomIdUtil, validateRoomConfiguration } from '../utils/jwtUtils';
import { encodeConversationIdForWebSocket } from '../utils/conversationUtils';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isSynced: boolean;
  connectionError: string | null;
  isFallbackMode: boolean; // Nuevo estado para modo fallback
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
  const [isSynced, setIsSynced] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false); // Estado para modo fallback

  // SOLUCIONADO: Eliminado el useEffect problemático que desconectaba el WebSocket
  // Ahora el WebSocket permanecerá conectado después del login exitoso

  // CORREGIDO: Función para generar roomId con validación de autenticación
  const generateRoomId = useCallback((conversationId: string) => {
    // Usar la utilidad centralizada que maneja JWT y fallbacks
    const roomId = generateRoomIdUtil(conversationId);
    
    // CORREGIDO: Verificar si se pudo generar el roomId
    if (!roomId) {
      console.log('🔗 WebSocketContext - No se puede generar roomId (sin autenticación)');
      return null;
    }
    
    return roomId;
  }, []);

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
  }, [connect, disconnect]);

  // Conectar WebSocket inmediatamente después del login exitoso con fallback
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { user: unknown; accessToken: string } | undefined;
      const accessToken = detail?.accessToken;
      if (!accessToken) return;
      
      console.log('🔌 WebSocketContext - Login exitoso, conectando WebSocket inmediatamente...');
      // ALINEADO: Usar timeout de 45 segundos para coincidir con connectTimeout del backend
      connect(accessToken, { timeout: 45000 });
      
      // FALLBACK: Si WebSocket falla después de 45 segundos, continuar con login HTTP exitoso
      const fallbackTimer = setTimeout(() => {
        if (!isConnected && !connectionError) {
          console.warn('⚠️ WebSocketContext - WebSocket timeout, continuando sin tiempo real');
          console.warn('⚠️ WebSocketContext - Login HTTP exitoso, navegando al dashboard...');
          
          // Emitir evento de fallback para que otros componentes lo manejen
          window.dispatchEvent(new CustomEvent('websocket:fallback', {
            detail: { 
              reason: 'timeout',
              timestamp: new Date().toISOString(),
              accessToken 
            }
          }));
          
          // Continuar con login exitoso - el usuario puede acceder a la aplicación
          // El estado de autenticación HTTP ya está establecido
        }
      }, 30000);
      
      // Limpiar timer si se conecta exitosamente
      const cleanupTimer = () => {
        clearTimeout(fallbackTimer);
      };
      
      // Escuchar conexión exitosa para limpiar timer
      if (socket) {
        socket.once('connect', cleanupTimer);
      }
      
      return cleanupTimer;
    };

    window.addEventListener('auth:login-success', handler as unknown as EventListener);
    return () => window.removeEventListener('auth:login-success', handler as unknown as EventListener);
  }, [connect, isConnected, connectionError, socket]);

  // MEJORADO: Actualizar atributo data-socket-status en el DOM
  useEffect(() => {
    const status = isConnected ? 'connected' : 'disconnected';
    document.documentElement.setAttribute('data-socket-status', status);
    console.log('🔌 WebSocketContext - Estado actualizado en DOM:', status);
  }, [isConnected]);

  // Escuchar evento de fallback para activar modo offline
  useEffect(() => {
    const handleFallback = (e: Event) => {
      const detail = (e as CustomEvent).detail as { reason: string; timestamp: string };
      console.warn('⚠️ WebSocketContext - Activando modo fallback:', detail);
      setIsFallbackMode(true);
      
      // Mostrar notificación al usuario
      console.warn('⚠️ Modo offline activado - Funcionalidad de tiempo real limitada');
    };

    window.addEventListener('websocket:fallback', handleFallback as EventListener);
    return () => window.removeEventListener('websocket:fallback', handleFallback as EventListener);
  }, []);

  // Validar configuración de rooms al inicializar
  useEffect(() => {
    validateRoomConfiguration();
  }, []);

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
      console.log('🚀 WebSocketContext - Emitiendo evento websocket:state-synced...');
      
      // Actualizar estado de sincronización
      setIsSynced(true);
      
      // Emitir evento personalizado para que useConversations lo escuche
      try {
        const customEvent = new CustomEvent('websocket:state-synced', { detail: data });
        window.dispatchEvent(customEvent);
        console.log('✅ WebSocketContext - Evento websocket:state-synced emitido exitosamente');
      } catch (error) {
        console.error('❌ WebSocketContext - Error emitiendo evento websocket:state-synced:', error);
      }
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
    isSynced,
    connectionError,
    isFallbackMode,
    activeConversations,
    typingUsers,
    onlineUsers,
    connect,
    disconnect,
    emit,
    on,
    off,
    joinConversation: (conversationId: string) => {
      // CORREGIDO: Verificar autenticación antes de unirse
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('🔗 WebSocket: No se puede unir (sin autenticación)');
        return;
      }

      // Evitar unirse si ya está en la conversación
      if (activeConversations.has(conversationId)) {
        console.log('🔗 WebSocket: Ya está en la conversación:', conversationId);
        return;
      }

      console.log('🔗 WebSocket: Uniéndose a conversación', {
        conversationId,
        timestamp: new Date().toISOString()
      });
      
      // CORREGIDO: Codificar conversationId para WebSocket
      const encodedConversationId = encodeConversationIdForWebSocket(conversationId);
      const roomId = generateRoomId(encodedConversationId);
      
      // CORREGIDO: Verificar si se pudo generar el roomId
      if (!roomId) {
        console.log('🔗 WebSocket: No se puede unir (roomId null)');
        return;
      }
      
      // SOLUCIONADO: Eliminar throttling excesivo para evitar rate limiting
      emit('join-conversation', { 
        conversationId: encodedConversationId,
        roomId: roomId
      });
      setActiveConversations(prev => new Set([...prev, conversationId]));
      
      console.log('✅ WebSocket: Unido a conversación', {
        conversationId,
        roomId,
        timestamp: new Date().toISOString()
      });
    },
    
    leaveConversation: (conversationId: string) => {
      // CORREGIDO: Verificar autenticación antes de salir
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('🔌 WebSocket: No se puede salir (sin autenticación)');
        return;
      }

      // Evitar salir si no está en la conversación
      if (!activeConversations.has(conversationId)) {
        console.log('🔌 WebSocket: No está en la conversación:', conversationId);
        return;
      }

      console.log('🔌 WebSocket: Saliendo de conversación', {
        conversationId,
        timestamp: new Date().toISOString()
      });
      
      // CORREGIDO: Codificar conversationId para WebSocket
      const encodedConversationId = encodeConversationIdForWebSocket(conversationId);
      const roomId = generateRoomId(encodedConversationId);
      
      // CORREGIDO: Verificar si se pudo generar el roomId
      if (!roomId) {
        console.log('🔌 WebSocket: No se puede salir (roomId null)');
        return;
      }
      
      // SOLUCIONADO: Eliminar throttling excesivo para evitar rate limiting
      emit('leave-conversation', { 
        conversationId: encodedConversationId,
        roomId: roomId
      });
      setActiveConversations(prev => {
        const newSet = new Set(prev);
        newSet.delete(conversationId);
        return newSet;
      });
    },
    startTyping: (conversationId: string) => {
      console.log('✍️ Iniciando typing en conversación:', conversationId);
      
      // CORREGIDO: Codificar conversationId para WebSocket
      const encodedConversationId = encodeConversationIdForWebSocket(conversationId);
      
      rateLimiter.executeWithRateLimit('typing', () => {
        emit('typing', { conversationId: encodedConversationId });
      }, (eventType, retryAfter) => {
        console.warn(`⚠️ Rate limit excedido para ${eventType}, reintentando en ${retryAfter}ms`);
      });
    },
    stopTyping: (conversationId: string) => {
      console.log('⏹️ Deteniendo typing en conversación:', conversationId);
      
      // CORREGIDO: Codificar conversationId para WebSocket
      const encodedConversationId = encodeConversationIdForWebSocket(conversationId);
      
      rateLimiter.executeWithRateLimit('typing-stop', () => {
        emit('typing-stop', { conversationId: encodedConversationId });
      }, (eventType, retryAfter) => {
        console.warn(`⚠️ Rate limit excedido para ${eventType}, reintentando en ${retryAfter}ms`);
      });
    },
    sendMessage: (conversationId: string, content: string, type = 'text', metadata = {}) => {
      console.log('📤 Enviando mensaje:', { conversationId, content, type, metadata });
      
      // CORREGIDO: Codificar conversationId para WebSocket
      const encodedConversationId = encodeConversationIdForWebSocket(conversationId);
      
      let success = false;
      rateLimiter.executeWithRateLimit('new-message', () => {
        success = emit('new-message', {
          conversationId: encodedConversationId,
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
      
      // CORREGIDO: Codificar conversationId para WebSocket
      const encodedConversationId = encodeConversationIdForWebSocket(conversationId);
      
      rateLimiter.executeWithRateLimit('message-read', () => {
        emit('message-read', {
          conversationId: encodedConversationId,
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