import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useBaseSocket } from './useBaseSocket';
import { infoLog } from '../../config/logger';

// Helper para logs de debug condicionales
const debugLog = (message: string, data?: unknown) => {
  if (import.meta.env.VITE_DEBUG === 'true' && import.meta.env.DEV) {
    console.debug(message, data);
  }
};

// Configuración de reconexión con backoff exponencial
const RECONNECTION_CONFIG = {
  maxAttempts: 5,
  baseDelay: 1000, // 1 segundo
  maxDelay: 30000, // 30 segundos
  backoffMultiplier: 2
};

export const useWebSocketConnection = () => {
  const {
    socket,
    isConnected,
    connectionError,
    connect: baseConnect,
    disconnect: baseDisconnect,
    on,
    off,
    emit
  } = useBaseSocket();

  // Ruta actual (para limitar WS a /chat)
  const location = useLocation();
  const isChatRoute = location.pathname === '/chat';

  // Estados de conexión mejorados
  const [isSynced, setIsSynced] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastConnectionTime, setLastConnectionTime] = useState<Date | null>(null);

  // Refs para control de sincronización y timeouts
  const lastSyncRef = useRef(0);
  const initialSyncTriggeredRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función de reconexión con backoff exponencial
  const attemptReconnect = useCallback((token: string) => {
    if (reconnectAttempts >= RECONNECTION_CONFIG.maxAttempts) {
      infoLog('❌ Máximo número de intentos de reconexión alcanzado');
      setIsFallbackMode(true);
      return;
    }

    const delay = Math.min(
      RECONNECTION_CONFIG.baseDelay * Math.pow(RECONNECTION_CONFIG.backoffMultiplier, reconnectAttempts),
      RECONNECTION_CONFIG.maxDelay
    );

    infoLog(`🔄 Intento de reconexión ${reconnectAttempts + 1}/${RECONNECTION_CONFIG.maxAttempts} en ${delay}ms`);

    reconnectTimeoutRef.current = setTimeout(() => {
      setIsConnecting(true);
      baseConnect(token, { timeout: 30000 });
      setReconnectAttempts(prev => prev + 1);
    }, delay);
  }, [reconnectAttempts, baseConnect]);

  // Función de conexión mejorada
  const connect = useCallback((token: string, options?: { timeout?: number }) => {
    if (isConnecting || isConnected) {
      debugLog('[DEBUG][WS] Ya conectando o conectado, saltando');
      return;
    }

    setIsConnecting(true);
    setReconnectAttempts(0);
    setIsFallbackMode(false);

    // Limpiar timeouts anteriores
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    const timeout = options?.timeout || 60000;
    
    // Timeout de conexión
    connectionTimeoutRef.current = setTimeout(() => {
      if (!isConnected) {
        setIsConnecting(false);
        infoLog('❌ Timeout de conexión WebSocket');
      }
    }, timeout);

    baseConnect(token, options);
  }, [isConnecting, isConnected, baseConnect]);

  // Función de desconexión mejorada
  const disconnect = useCallback(() => {
    setIsConnecting(false);
    setIsSynced(false);
    setIsFallbackMode(false);
    setReconnectAttempts(0);
    setLastConnectionTime(null);

    // Limpiar timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    baseDisconnect();
    infoLog('🔌 WebSocket desconectado');
  }, [baseDisconnect]);

  // Función de sincronización de estado
  const syncState = useCallback(() => {
    if (!isConnected || !socket) {
      debugLog('[DEBUG][WS] No conectado, no se puede sincronizar');
      return;
    }

    const now = Date.now();
    if (now - lastSyncRef.current < 5000) {
      debugLog('[DEBUG][WS] Sincronización muy reciente, saltando');
      return;
    }

    lastSyncRef.current = now;
    emit('sync-state', { timestamp: now });
    setIsSynced(true);
    infoLog('🔄 Estado sincronizado con servidor');
  }, [isConnected, socket, emit]);

  // Función de sincronización forzada
  const doSyncState = useCallback((reason?: string) => {
    if (!isConnected || !socket) {
      debugLog('[DEBUG][WS] No conectado, no se puede sincronizar');
      return;
    }

    const now = Date.now();
    lastSyncRef.current = now;
    emit('sync-state', { timestamp: now, reason });
    setIsSynced(true);
    infoLog(`🔄 Sincronización forzada: ${reason || 'manual'}`);
  }, [isConnected, socket, emit]);

  // Unirse a una conversación (rooms)
  const joinConversation = useCallback((conversationId: string) => {
    if (!socket || !socket.connected) {
      infoLog('⚠️ WebSocket no conectado, no se puede unir a la conversación');
      return;
    }
    emit('join-conversation', { conversationId });
    infoLog(`🔗 Uniendo a conversación: ${conversationId}`);
  }, [socket, emit]);

  // Salir de una conversación (rooms)
  const leaveConversation = useCallback((conversationId: string) => {
    if (!socket || !socket.connected) {
      infoLog('⚠️ WebSocket no conectado, no se puede salir de la conversación');
      return;
    }
    emit('leave-conversation', { conversationId });
    infoLog(`🔌 Saliendo de conversación: ${conversationId}`);
  }, [socket, emit]);

  // Conectar/desconectar WS según la ruta - OPTIMIZADO
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    // Solo conectar si hay token, estamos en /chat, no conectado y sin error
    if (isChatRoute && token && !isConnected && !connectionError && !isConnecting) {
      debugLog('[DEBUG][WS] Conectando WebSocket en /chat');
      connect(token, { timeout: 60000 });
    }
    
    // Solo desconectar si no hay token Y está conectado
    if (!token && isConnected) {
      debugLog('[DEBUG][WS] Desconectando WebSocket (sin auth)');
      disconnect();
    }
    
    // Evitar reconexiones automáticas si hay error de rate limiting
    if (connectionError && connectionError.includes('RATE_LIMITED')) {
      debugLog('[DEBUG][WS] Rate limited detectado, no reconectar');
      return;
    }
  }, [isChatRoute, isConnected, connectionError, isConnecting, connect, disconnect]);

  // Manejar cambios de estado de conexión
  useEffect(() => {
    if (isConnected) {
      setIsConnecting(false);
      setLastConnectionTime(new Date());
      setReconnectAttempts(0);
      setIsFallbackMode(false);
      
      // Limpiar timeout de conexión
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }

      infoLog('✅ WebSocket conectado exitosamente');
      
      // Trigger sincronización inicial
      if (!initialSyncTriggeredRef.current) {
        initialSyncTriggeredRef.current = true;
        setTimeout(() => syncState(), 1000);
      }
    } else if (isConnecting) {
      // Si se desconecta mientras está conectando, intentar reconectar
      const token = localStorage.getItem('access_token');
      if (token && isChatRoute && !connectionError?.includes('RATE_LIMITED')) {
        attemptReconnect(token);
      }
    }
  }, [isConnected, isConnecting, isChatRoute, connectionError, syncState, attemptReconnect]);

  // Reautenticar socket cuando se refresca el access token (solo si estamos en /chat)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { accessToken?: string } | undefined;
      const accessToken = detail?.accessToken;
      if (!accessToken) return;
      if (!isChatRoute) return;
      debugLog('[DEBUG][WS] Token refrescado, reconectando (/chat)');
      disconnect();
      connect(accessToken);
    };

    window.addEventListener('auth:token-refreshed', handler as unknown as EventListener);
    return () => window.removeEventListener('auth:token-refreshed', handler as unknown as EventListener);
  }, [connect, disconnect, isChatRoute]);

  // Conectar WebSocket cuando el usuario esté autenticado y esté en /chat
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    // Conectar si tenemos token, usuario, estamos en /chat y no estamos conectados
    if (token && user && isChatRoute && !isConnected && !connectionError && !isConnecting) {
      debugLog('[DEBUG][WS] Usuario autenticado, conectando WS...');
      connect(token, { timeout: 60000 });
    }
  }, [isChatRoute, isConnected, connectionError, isConnecting, connect]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Estados
    socket,
    isConnected,
    isConnecting,
    isSynced,
    connectionError,
    isFallbackMode,
    isChatRoute,
    reconnectAttempts,
    lastConnectionTime,
    
    // Acciones
    connect,
    disconnect,
    syncState,
    doSyncState,
    emit,
    on,
    off,
    joinConversation,
    leaveConversation
  };
}; 