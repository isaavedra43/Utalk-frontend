import React, { createContext, useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { useRateLimiter } from '../hooks/useRateLimiter';
import { generateRoomId as generateRoomIdUtil, validateRoomConfiguration } from '../utils/jwtUtils';
import { encodeConversationIdForWebSocket } from '../utils/conversationUtils';

// FASE 5: Constantes para manejo de reconexión y health checks (futuro)
// const RECONNECTION_ATTEMPTS = 5;
// const RECONNECTION_DELAYS = [1000, 2000, 5000, 10000, 30000]; // Delays progresivos
// const HEALTH_CHECK_INTERVAL = 30000; // 30 segundos
// const EVENT_QUEUE_MAX_SIZE = 100;

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

  // Ruta actual (para limitar WS a /chat)
  const location = useLocation();
  const isChatRoute = location.pathname === '/chat';

  // FASE 2: Rate limiter diferenciado para eventos del WebSocket
  const rateLimiter = useRateLimiter({
    maxRequests: 5, // Aumentado para eventos críticos
    timeWindow: 1000, // 1 segundo (más permisivo)
    retryDelay: 500 // Reducido para respuesta más rápida
  });

  const [activeConversations, setActiveConversations] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isSynced, setIsSynced] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false); // Estado para modo fallback

  // FASE 5: Estados para manejo de reconexión y queue de eventos (futuro)
  // const [reconnectionAttempts, setReconnectionAttempts] = useState(0);
  // const [isReconnecting, setIsReconnecting] = useState(false);
  // const [lastHealthCheck, setLastHealthCheck] = useState<number>(Date.now());
  // const eventQueueRef = useRef<Array<{ event: string; data: unknown; timestamp: number }>>([]);
  // const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // const reconnectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // NUEVO: Mapa en memoria para almacenar el roomId devuelto por el backend por conversación
  const roomIdMapRef = React.useRef<Map<string, string>>(new Map());
  // NUEVO: Flag para evitar múltiples sincronizaciones iniciales entre componentes
  const initialSyncTriggeredRef = React.useRef(false);
  // NUEVO: refs para estabilizar funciones del socket y evitar re-registro de listeners
  const onRef = React.useRef(on);
  const offRef = React.useRef(off);
  const emitRef = React.useRef(emit);

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

  // NUEVO: función centralizada para solicitar sincronización de estado con control de rate limit
  const doSyncState = useCallback((reason?: string) => {
    console.log('🔄 WebSocketContext - Sincronizando estado', { reason });
    const success = rateLimiter.makeRequest(() => {
      emit('sync-state', { syncId: Date.now(), reason });
    });
    
    if (!success) {
      console.warn(`⚠️ Rate limit excedido para sync-state, reintentando más tarde`);
    }
  }, [emit, rateLimiter]);
  const doSyncStateRef = React.useRef(doSyncState);

  // Reautenticar socket cuando se refresca el access token (solo si estamos en /chat)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { accessToken?: string } | undefined;
      const accessToken = detail?.accessToken;
      if (!accessToken) return;
      if (!isChatRoute) return;
      console.log('🔌 WebSocketContext - Token refrescado, reconectando (ruta /chat)...');
      disconnect();
      connect(accessToken);
    };

    window.addEventListener('auth:token-refreshed', handler as unknown as EventListener);
    return () => window.removeEventListener('auth:token-refreshed', handler as unknown as EventListener);
  }, [connect, disconnect, isChatRoute]);

  // NUEVO: Conectar/desconectar WS según la ruta
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (isChatRoute && token && !isConnected && !connectionError) {
      console.log('🔌 WebSocketContext - Conectando WebSocket en ruta /chat');
      connect(token, { timeout: 45000 });
    }
    if (!isChatRoute && isConnected) {
      disconnect();
      setIsSynced(false);
      setIsFallbackMode(false);
      setActiveConversations(new Set());
      roomIdMapRef.current.clear();
    }
  }, [isChatRoute, isConnected, connectionError, connect, disconnect]);

  // NUEVO: Logging del estado de conexión para debugging
  useEffect(() => {
    console.log('🔌 WebSocketContext - Estado de conexión actualizado:', {
      isConnected,
      isChatRoute,
      hasSocket: !!socket,
      connectionError
    });
  }, [isConnected, isChatRoute, socket, connectionError]);

  // Conectar WebSocket inmediatamente después del login exitoso con fallback (control de duplicados)
  const loginConnectInFlightRef = React.useRef(false);
  const loginFallbackTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { user: unknown; accessToken: string } | undefined;
      const accessToken = detail?.accessToken;
      if (!accessToken) return;
      if (!isChatRoute) {
        // Si no estamos en /chat, no conectar; el efecto de ruta lo hará cuando entremos
        return;
      }
      if (loginConnectInFlightRef.current) {
        return;
      }
      loginConnectInFlightRef.current = true;
      // ALINEADO: Usar timeout de 45 segundos para coincidir con connectTimeout del backend
      connect(accessToken, { timeout: 45000 });
      
      // FALLBACK: Si WebSocket no se conecta en 30s, continuar con login HTTP exitoso
      if (loginFallbackTimeoutRef.current) {
        clearTimeout(loginFallbackTimeoutRef.current);
      }
      loginFallbackTimeoutRef.current = setTimeout(() => {
              if (!isConnected && !connectionError) {
          
          // Emitir evento de fallback para que otros componentes lo manejen
          window.dispatchEvent(new CustomEvent('websocket:fallback', {
            detail: { 
              reason: 'timeout',
              timestamp: new Date().toISOString(),
              accessToken 
            }
          }));
        }
        loginConnectInFlightRef.current = false;
        loginFallbackTimeoutRef.current = null;
      }, 30000);
      
      return () => {
        if (loginFallbackTimeoutRef.current) {
          clearTimeout(loginFallbackTimeoutRef.current);
          loginFallbackTimeoutRef.current = null;
        }
        loginConnectInFlightRef.current = false;
      };
    };

    window.addEventListener('auth:login-success', handler as unknown as EventListener);
    return () => window.removeEventListener('auth:login-success', handler as unknown as EventListener);
  }, [connect, isConnected, connectionError, isChatRoute]);

  // Limpiar el timeout de fallback cuando el socket se conecte o aparezca un error de conexión
  useEffect(() => {
    if (isConnected || connectionError) {
      if (loginFallbackTimeoutRef.current) {
        clearTimeout(loginFallbackTimeoutRef.current);
        loginFallbackTimeoutRef.current = null;
      }
      loginConnectInFlightRef.current = false;
    }
  }, [isConnected, connectionError]);


  // Mantener refs actualizadas sin re-registrar listeners
  useEffect(() => { onRef.current = on; offRef.current = off; emitRef.current = emit; }, [on, off, emit]);

  // NUEVO: Disparar sincronización inicial una sola vez al conectar en /chat
  useEffect(() => {
    if (isConnected && isChatRoute && !initialSyncTriggeredRef.current) {
      initialSyncTriggeredRef.current = true;
      
      const success = rateLimiter.makeRequest(() => {
        emit('sync-state', { syncId: Date.now(), reason: 'initial' });
      });
      
      if (!success) {
        console.log('⚠️ WebSocketContext - Sync inicial rate limited, reintentando más tarde');
      }
    }
    if (!isConnected) {
      // Reset al desconectar para futuras sesiones
      initialSyncTriggeredRef.current = false;
      setIsSynced(false);
    }
  }, [isConnected, isChatRoute, rateLimiter, emit]);

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

  // Configurar listeners globales (estable) - depende solo de socketId
  useEffect(() => {
    const socketId = socket?.id;
    if (!socketId) return;

    console.debug('🔌 WebSocketContext - Configurando listeners globales');

    // Nuevo mensaje
    onRef.current('new-message', (data: unknown) => {
      console.log('📨 Nuevo mensaje recibido:', data);
      // El hook de chat manejará esto
    });

    // Mensaje enviado (confirmación)
    onRef.current('message-sent', (data: unknown) => {
      console.log('✅ Mensaje enviado confirmado:', data);
      // Actualizar estado del mensaje
    });

    // EVENTOS DE ARCHIVOS - ALINEACIÓN CON BACKEND
    onRef.current('file-upload-start', (data: unknown) => {
      console.log('📁 Inicio de subida de archivo:', data);
      // El FileUploadManager manejará esto
    });

    onRef.current('file-upload-progress', (data: unknown) => {
      console.log('📁 Progreso de subida:', data);
      // El FileUploadManager manejará esto
    });

    onRef.current('file-upload-complete', (data: unknown) => {
      console.log('✅ Subida de archivo completada:', data);
      // El FileUploadManager manejará esto
    });

    onRef.current('file-upload-error', (data: unknown) => {
      console.log('❌ Error en subida de archivo:', data);
      // El FileUploadManager manejará esto
    });

    onRef.current('file-received', (data: unknown) => {
      console.log('📁 Archivo recibido:', data);
      // El chat manejará esto
    });

    onRef.current('file-processing', (data: unknown) => {
      console.log('⚙️ Procesando archivo:', data);
      // El chat manejará esto
    });

    onRef.current('file-ready', (data: unknown) => {
      console.log('✅ Archivo listo:', data);
      // El chat manejará esto
    });

    // CONFIRMACIONES DE CONVERSACIÓN - CRÍTICO PARA EL CHAT
    onRef.current('conversation-joined', (data: unknown) => {
      const eventData = data as { conversationId: string; roomId: string; onlineUsers: string[]; timestamp: string };
      console.log('✅ Confirmado: Unido a conversación:', eventData);
      
      // Actualizar estado de conversación activa
      setActiveConversations(prev => new Set(prev).add(eventData.conversationId));

      // Guardar el roomId devuelto por el backend para esta conversación
      if (eventData.roomId) {
        roomIdMapRef.current.set(eventData.conversationId, eventData.roomId);
      }
      
      // Emitir evento personalizado para que los hooks lo escuchen
      window.dispatchEvent(new CustomEvent('conversation:joined', { detail: eventData }));
    });

    onRef.current('conversation-left', (data: unknown) => {
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
    onRef.current('error', (data: unknown) => {
      const errorData = data as { error: string; message: string; conversationId?: string };
      console.error('❌ Error del servidor:', errorData);
      
      // Emitir evento personalizado para manejo de errores
      window.dispatchEvent(new CustomEvent('websocket:error', { detail: errorData }));
    });

    // Usuario escribiendo
    onRef.current('typing', (data: unknown) => {
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
    onRef.current('typing-stop', (data: unknown) => {
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
    onRef.current('user-online', (data: unknown) => {
      const eventData = data as { email: string };
      console.log('🟢 Usuario en línea:', eventData);
      setOnlineUsers(prev => new Set(prev).add(eventData.email));
    });

    // Usuario desconectado
    onRef.current('user-offline', (data: unknown) => {
      const eventData = data as { email: string };
      console.log('🔴 Usuario desconectado:', eventData);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventData.email);
        return newSet;
      });
    });

    // Evento de conversación
    onRef.current('conversation-event', (data: unknown) => {
      console.log('💬 Evento de conversación:', data);
      // Actualizar lista de conversaciones
    });

    // Shutdown del servidor
    onRef.current('server-shutdown', (data: unknown) => {
      console.log('🔄 Servidor reiniciándose:', data);
      // Mostrar notificación y reconectar
    });

    // Estado sincronizado
    onRef.current('state-synced', (data: unknown) => {
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
    onRef.current('sync-required', (data: unknown) => {
      console.log('🔄 WebSocketContext - Sincronización requerida:', data);
      // Emitir evento personalizado para que useConversations lo escuche
      window.dispatchEvent(new CustomEvent('websocket:sync-required', { detail: data }));
      // NUEVO: Ejecutar sincronización desde el contexto para evitar duplicados desde varios hooks
      doSyncStateRef.current('required');
    });

    // Respuesta de prueba
    onRef.current('test-response', (data: unknown) => {
      console.log('🧪 Respuesta de prueba recibida:', data);
    });

    return () => {
      console.debug('🔌 WebSocketContext - Limpiando listeners');
      // Limpiar listeners
      offRef.current('new-message');
      offRef.current('message-sent');
      offRef.current('conversation-joined');
      offRef.current('conversation-left');
      offRef.current('error');
      offRef.current('typing');
      offRef.current('typing-stop');
      offRef.current('user-online');
      offRef.current('user-offline');
      offRef.current('conversation-event');
      offRef.current('server-shutdown');
      offRef.current('sync-required');
      offRef.current('state-synced');
      offRef.current('test-response');
    };
  }, [socket?.id]);

  // Eliminado: timeout manual de 120s. Dejamos que el heartbeat del servidor gobierne la conexión.

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
    emit: (...args) => emitRef.current(...args),
    on: (...args) => onRef.current(...args),
    off: (...args) => offRef.current(...args),
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
      
      const success = rateLimiter.makeRequest(() => {
        emit('typing', { conversationId: encodedConversationId });
      });
      
      if (!success) {
        console.warn(`⚠️ Rate limit excedido para typing, reintentando más tarde`);
      }
    },
    stopTyping: (conversationId: string) => {
      console.log('⏹️ Deteniendo typing en conversación:', conversationId);
      
      // CORREGIDO: Codificar conversationId para WebSocket
      const encodedConversationId = encodeConversationIdForWebSocket(conversationId);
      
      const success = rateLimiter.makeRequest(() => {
        emit('typing-stop', { conversationId: encodedConversationId });
      });
      
      if (!success) {
        console.warn(`⚠️ Rate limit excedido para typing-stop, reintentando más tarde`);
      }
    },
    sendMessage: (conversationId: string, content: string, type = 'text', metadata = {}) => {
      console.log('📤 Enviando mensaje:', { conversationId, content, type, metadata });
      
      // CORREGIDO: Codificar conversationId para WebSocket
      const encodedConversationId = encodeConversationIdForWebSocket(conversationId);
      
      let success = false;
      const rateLimitSuccess = rateLimiter.makeRequest(() => {
        success = emit('new-message', {
          conversationId: encodedConversationId,
          content,
          type,
          metadata
        });
      });
      
      if (!rateLimitSuccess) {
        console.warn(`⚠️ Rate limit excedido para new-message, reintentando más tarde`);
      }
      return success;
    },
    markMessagesAsRead: (conversationId: string, messageIds: string[]) => {
      console.log('👁️ Marcando mensajes como leídos:', { conversationId, messageIds });
      
      // Usar el mismo formato que para join: ID codificado para WebSocket
      const encodedConversationId = encodeConversationIdForWebSocket(conversationId);
      // Preferir el roomId confirmado por el backend; fallback al local si aún no ha llegado el ack
      const selectedRoomId = roomIdMapRef.current.get(conversationId) || generateRoomId(encodedConversationId) || null;
      if (!selectedRoomId) {
        console.warn('⚠️ No se puede marcar como leído (roomId null)');
        return;
      }
      
      const success = rateLimiter.makeRequest(() => {
        emit('message-read', {
          conversationId: encodedConversationId,
          roomId: selectedRoomId,
          messageIds
        });
      });
      
      if (!success) {
        console.warn(`⚠️ Rate limit excedido para message-read, reintentando más tarde`);
      }
    },
    changeUserStatus: (status: string) => {
      console.log('👤 Cambiando estado de usuario:', status);
      const success = rateLimiter.makeRequest(() => {
        emit('user-status-change', { status });
      });
      
      if (!success) {
        console.warn(`⚠️ Rate limit excedido para user-status-change, reintentando más tarde`);
      }
    },
    syncState: () => {
      if (!isConnected || !socket) {
        console.log('🔌 WebSocketContext - No se puede sincronizar (socket no conectado)');
        return;
      }

      const success = rateLimiter.makeRequest(() => {
        console.log('🔄 WebSocketContext - Sincronizando estado', { reason: 'manual' });
        emit('sync-state', { syncId: Date.now(), reason: 'manual' });
      });

      if (!success) {
        console.log('⚠️ WebSocketContext - Sync-state rate limited, reintentando más tarde');
      }
    }
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export { WebSocketContext }; 