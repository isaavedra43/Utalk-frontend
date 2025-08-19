import React, { createContext, useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { useRateLimiter } from '../hooks/useRateLimiter';
import { generateRoomId as generateRoomIdUtil, validateRoomConfiguration } from '../utils/jwtUtils';
import { encodeConversationIdForWebSocket } from '../utils/conversationUtils';
import { performanceMonitor } from '../utils/performanceMonitor';

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

  // CORREGIDO: Rate limiter más conservador para evitar rate limiting del servidor
  const rateLimiter = useRateLimiter({
    maxRequests: 10, // Reducido de 20 a 10 para ser más conservador
    timeWindow: 5000, // Aumentado a 5 segundos para ser más conservador
    retryDelay: 1000 // Aumentado a 1 segundo para evitar spam
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
  // NUEVO: Ref para evitar sincronizaciones duplicadas
  const lastSyncRef = React.useRef(0);

  // SOLUCIONADO: Eliminado el useEffect problemático que desconectaba el WebSocket
  // Ahora el WebSocket permanecerá conectado después del login exitoso

  // CORREGIDO: Función para generar roomId con validación de autenticación
  const generateRoomId = useCallback((conversationId: string) => {
    // Usar la utilidad centralizada que maneja JWT y fallbacks
    const roomId = generateRoomIdUtil(conversationId);
    
    // CORREGIDO: Verificar si se pudo generar el roomId
          if (!roomId) {
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.debug('[DEBUG][WS] No se puede generar roomId (sin autenticación)');
        }
        return null;
      }
    
    return roomId;
  }, []);

  // CORREGIDO: función centralizada para solicitar sincronización de estado con control de rate limit
  const doSyncState = useCallback((reason?: string) => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.debug('[DEBUG][WS] Sincronizando estado', { reason });
    }
    
    // Evitar sincronizaciones duplicadas en un corto período
    const now = Date.now();
    
    if (now - lastSyncRef.current < 5000) { // Aumentado a 5 segundos mínimo entre sincronizaciones
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.debug('[DEBUG][WS] Sincronización reciente, saltando...');
      }
      return;
    }
    
    // Verificar si el socket está realmente conectado antes de enviar
    if (!isConnected || !socket) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.debug('[DEBUG][WS] Socket no conectado, saltando sincronización');
      }
      return;
    }
    
    const success = rateLimiter.makeRequest(() => {
      emit('sync-state', { syncId: Date.now(), reason });
      lastSyncRef.current = now;
    });
    
    if (!success) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.debug('[DEBUG][WS] Sync-state rate limited, reintentando más tarde');
      }
    }
  }, [emit, rateLimiter, isConnected, socket]);
  const doSyncStateRef = React.useRef(doSyncState);

  // Reautenticar socket cuando se refresca el access token (solo si estamos en /chat)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { accessToken?: string } | undefined;
      const accessToken = detail?.accessToken;
      if (!accessToken) return;
      if (!isChatRoute) return;
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.debug('[DEBUG][WS] Token refrescado, reconectando (/chat)');
      }
      disconnect();
      connect(accessToken);
    };

    window.addEventListener('auth:token-refreshed', handler as unknown as EventListener);
    return () => window.removeEventListener('auth:token-refreshed', handler as unknown as EventListener);
  }, [connect, disconnect, isChatRoute]);

  // CORREGIDO: Conectar/desconectar WS según la ruta - OPTIMIZADO
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    // CORREGIDO: Solo conectar si hay token, estamos en /chat, no conectado y sin error
    if (isChatRoute && token && !isConnected && !connectionError) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.debug('[DEBUG][WS] Conectando WebSocket en /chat');
      }
      connect(token, { timeout: 60000 });
    }
    
    // CORREGIDO: Solo desconectar si no hay token Y está conectado
    if (!token && isConnected) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.debug('[DEBUG][WS] Desconectando WebSocket (sin auth)');
      }
      disconnect();
      setIsSynced(false);
      setIsFallbackMode(false);
      setActiveConversations(new Set());
      roomIdMapRef.current.clear();
    }
    
    // NUEVO: Evitar reconexiones automáticas si hay error de rate limiting
    if (connectionError && connectionError.includes('RATE_LIMITED')) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.debug('[DEBUG][WS] Rate limited detectado, no reconectar');
      }
      return;
    }
  }, [isChatRoute, isConnected, connectionError, connect, disconnect]);

  // OPTIMIZADO: Logging del estado de conexión solo en errores
  useEffect(() => {
    // Solo log en errores de conexión
    if (connectionError) {
      // Log solo en error (mantener)
      console.error('[WS] Error de conexión', {
        connectionError,
        isConnected,
        isChatRoute
      });
    }
  }, [connectionError, isConnected, isChatRoute]);

  // NUEVO: Conectar WebSocket cuando el usuario esté autenticado y esté en /chat
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    // Conectar si tenemos token, usuario, estamos en /chat y no estamos conectados
    if (token && user && isChatRoute && !isConnected && !connectionError) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.debug('[DEBUG][WS] Usuario autenticado, conectando WS...');
      }
      connect(token, { timeout: 60000 });
    }
  }, [isChatRoute, isConnected, connectionError, connect, disconnect]);

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
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.debug('[DEBUG][WS] Conexión de login ya en progreso, saltando');
        }
        return;
      }
      if (isConnected) {
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.debug('[DEBUG][WS] Ya conectado, saltando conexión de login');
        }
        return;
      }
      
      loginConnectInFlightRef.current = true;
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.debug('[DEBUG][WS] Login exitoso, conectando WS...');
      }
      
      // NUEVO: Timeout aumentado para dar más tiempo al backend
      connect(accessToken, { timeout: 60000 });
      
      // FALLBACK: Si WebSocket no se conecta en 30s, continuar con login HTTP exitoso
      if (loginFallbackTimeoutRef.current) {
        clearTimeout(loginFallbackTimeoutRef.current);
      }
      loginFallbackTimeoutRef.current = setTimeout(() => {
        if (!isConnected && !connectionError) {
          console.log('🔌 WebSocketContext - Fallback: WebSocket no se conectó en 30s');
          
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
        }
      };
    };

    window.addEventListener('auth:login-success', handler as unknown as EventListener);
    return () => window.removeEventListener('auth:login-success', handler as unknown as EventListener);
  }, [connect, disconnect, isChatRoute, isConnected, connectionError]);

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
      
      console.log('🔌 WebSocket conectado en /chat');
      performanceMonitor.logWebSocketConnected();
      
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
  }, [isConnected, isChatRoute, rateLimiter, emit]); // NUEVO: Agregadas rateLimiter y emit como dependencias

  // OPTIMIZADO: Actualizar atributo data-socket-status en el DOM
  useEffect(() => {
    const status = isConnected ? 'connected' : 'disconnected';
    document.documentElement.setAttribute('data-socket-status', status);
    // Logs eliminados - no críticos para debugging
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
      console.log('📨 WebSocketContext - Nuevo mensaje recibido:', data);
      console.log('📨 WebSocketContext - Timestamp del evento:', new Date().toISOString());
      
      // NUEVO: Log detallado para debugging
      const eventData = data as { 
        conversationId: string; 
        message: { content: string; timestamp: string; sender: string };
        isNewConversation?: boolean;
      };
      console.log('📨 WebSocketContext - Detalles del evento new-message:', {
        conversationId: eventData.conversationId,
        messageContent: eventData.message?.content,
        isNewConversation: eventData.isNewConversation,
        timestamp: new Date().toISOString()
      });
      
      // Emitir evento personalizado para que useConversations lo maneje
      window.dispatchEvent(new CustomEvent('new-message', { detail: data }));
      
      // NUEVO: Log de confirmación
      console.log('✅ WebSocketContext - Evento new-message procesado y emitido exitosamente');
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
      const errorData = data as { error: string; message: string; conversationId?: string; code?: string };
      console.error('❌ Error del servidor:', errorData);
      
      // NUEVO: Manejo específico para rate limiting
      if (errorData.code === 'RATE_LIMITED') {
        const retryAfter = (errorData as { retryAfter?: number }).retryAfter || 5;
        
        // Log de performance para rate limiting
        performanceMonitor.logRateLimited(errorData.message, retryAfter);
        
        // Pausar todas las operaciones por el tiempo especificado
        console.log(`⏸️ Pausando operaciones por ${retryAfter} segundos debido a rate limiting`);
        
        // Desconectar temporalmente para evitar más errores
        setTimeout(() => {
          if (disconnect) {
            disconnect();
          }
        }, 1000);
      }
      
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
      console.log('✅ Estado sincronizado');
      
      // Actualizar estado de sincronización
      setIsSynced(true);
      
      // Emitir evento personalizado para que useConversations lo escuche
      try {
        const customEvent = new CustomEvent('websocket:state-synced', { detail: data });
        window.dispatchEvent(customEvent);
        
        // Log de performance
        const eventData = data as { conversations?: unknown[] };
        const conversationsCount = eventData.conversations?.length || 0;
        performanceMonitor.logDataSync(conversationsCount);
      } catch (error) {
        console.error('❌ Error emitiendo evento websocket:state-synced:', error);
      }
    });

    // Eventos de webhook - CRÍTICOS para sincronización
    onRef.current('webhook:conversation-created', (data: unknown) => {
      console.log('🔌 Nueva conversación desde webhook');
      window.dispatchEvent(new CustomEvent('webhook:conversation-created', { detail: data }));
    });

    onRef.current('webhook:new-message', (data: unknown) => {
      console.log('🔌 Nuevo mensaje desde webhook');
      window.dispatchEvent(new CustomEvent('webhook:new-message', { detail: data }));
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
      offRef.current('webhook:conversation-created');
      offRef.current('webhook:new-message');
    };
  }, [socket?.id, disconnect]);

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