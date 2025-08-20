import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useRateLimiter } from '../../hooks/useRateLimiter';
import { performanceMonitor } from '../../utils/performanceMonitor';

// Helper para logs de debug condicionales
const debugLog = (message: string, data?: unknown) => {
  if (import.meta.env.VITE_DEBUG === 'true' && import.meta.env.DEV) {
    console.debug(message, data);
  }
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
  } = useWebSocket();

  // Ruta actual (para limitar WS a /chat)
  const location = useLocation();
  const isChatRoute = location.pathname === '/chat';

  // Rate limiter más conservador para evitar rate limiting del servidor
  const rateLimiter = useRateLimiter({
    maxRequests: 10,
    timeWindow: 5000,
    retryDelay: 1000
  });

  const [isSynced, setIsSynced] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  // Refs para estabilizar funciones del socket y evitar re-registro de listeners
  const onRef = useRef(on);
  const offRef = useRef(off);
  const emitRef = useRef(emit);
  const lastSyncRef = useRef(0);
  const initialSyncTriggeredRef = useRef(false);

  // Conectar/desconectar WS según la ruta - OPTIMIZADO
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    // Solo conectar si hay token, estamos en /chat, no conectado y sin error
    if (isChatRoute && token && !isConnected && !connectionError) {
      debugLog('[DEBUG][WS] Conectando WebSocket en /chat');
      baseConnect(token, { timeout: 60000 });
    }
    
    // Solo desconectar si no hay token Y está conectado
    if (!token && isConnected) {
      debugLog('[DEBUG][WS] Desconectando WebSocket (sin auth)');
      baseDisconnect();
      setIsSynced(false);
      setIsFallbackMode(false);
    }
    
    // Evitar reconexiones automáticas si hay error de rate limiting
    if (connectionError && connectionError.includes('RATE_LIMITED')) {
      debugLog('[DEBUG][WS] Rate limited detectado, no reconectar');
      return;
    }
  }, [isChatRoute, isConnected, connectionError, baseConnect, baseDisconnect]);

  // Reautenticar socket cuando se refresca el access token (solo si estamos en /chat)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { accessToken?: string } | undefined;
      const accessToken = detail?.accessToken;
      if (!accessToken) return;
      if (!isChatRoute) return;
      debugLog('[DEBUG][WS] Token refrescado, reconectando (/chat)');
      baseDisconnect();
      baseConnect(accessToken);
    };

    window.addEventListener('auth:token-refreshed', handler as unknown as EventListener);
    return () => window.removeEventListener('auth:token-refreshed', handler as unknown as EventListener);
  }, [baseConnect, baseDisconnect, isChatRoute]);

  // Conectar WebSocket cuando el usuario esté autenticado y esté en /chat
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    // Conectar si tenemos token, usuario, estamos en /chat y no estamos conectados
    if (token && user && isChatRoute && !isConnected && !connectionError) {
      debugLog('[DEBUG][WS] Usuario autenticado, conectando WS...');
      baseConnect(token, { timeout: 60000 });
    }
  }, [isChatRoute, isConnected, connectionError, baseConnect, baseDisconnect]);

  // Conectar WebSocket inmediatamente después del login exitoso con fallback
  const loginConnectInFlightRef = useRef(false);
  const loginFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { user: unknown; accessToken: string } | undefined;
      const accessToken = detail?.accessToken;
      if (!accessToken) return;
      if (!isChatRoute) {
        return;
      }
      if (loginConnectInFlightRef.current) {
        debugLog('[DEBUG][WS] Conexión de login ya en progreso, saltando');
        return;
      }
      if (isConnected) {
        debugLog('[DEBUG][WS] Ya conectado, saltando conexión de login');
        return;
      }
      
      loginConnectInFlightRef.current = true;
      debugLog('[DEBUG][WS] Login exitoso, conectando WS...');
      
      baseConnect(accessToken, { timeout: 60000 });
      
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
  }, [baseConnect, baseDisconnect, isChatRoute, isConnected, connectionError]);

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
  useEffect(() => { 
    onRef.current = on; 
    offRef.current = off; 
    emitRef.current = emit; 
  }, [on, off, emit]);

  // Disparar sincronización inicial una sola vez al conectar en /chat
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
      initialSyncTriggeredRef.current = false;
    }
  }, [isConnected, isChatRoute, emit, rateLimiter]);

  // Función centralizada para solicitar sincronización de estado con control de rate limit
  const doSyncState = useCallback((reason?: string) => {
    debugLog('[DEBUG][WS] Sincronizando estado', { reason });
    
    // Evitar sincronizaciones duplicadas en un corto período
    const now = Date.now();
    
    if (now - lastSyncRef.current < 5000) {
      debugLog('[DEBUG][WS] Sincronización reciente, saltando...');
      return;
    }
    
    // Verificar si el socket está realmente conectado antes de enviar
    if (!isConnected || !socket) {
      debugLog('[DEBUG][WS] Socket no conectado, saltando sincronización');
      return;
    }
    
    const success = rateLimiter.makeRequest(() => {
      emit('sync-state', { syncId: Date.now(), reason });
      lastSyncRef.current = now;
    });
    
    if (!success) {
      debugLog('[DEBUG][WS] Sync-state rate limited, reintentando más tarde');
    }
  }, [emit, rateLimiter, isConnected, socket]);

  // Función para sincronizar con el servidor
  const syncState = useCallback(() => {
    if (!isConnected || !socket) {
      console.log('🔌 WebSocketContext - No se puede sincronizar (socket no conectado)');
      return;
    }
    
    console.log('🔄 WebSocketContext - Sincronizando estado', { reason: 'manual' });
    
    const success = rateLimiter.makeRequest(() => {
      emit('sync-state', { syncId: Date.now(), reason: 'manual' });
    });
    
    if (!success) {
      console.log('⚠️ WebSocketContext - Sync-state rate limited, reintentando más tarde');
    }
  }, [isConnected, socket, emit, rateLimiter]);

  return {
    socket,
    isConnected,
    connectionError,
    isSynced,
    isFallbackMode,
    isChatRoute,
    connect: baseConnect,
    disconnect: baseDisconnect,
    emit,
    on,
    off,
    syncState,
    doSyncState
  };
}; 