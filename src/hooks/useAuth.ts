import { useEffect, useMemo, useRef, useCallback } from 'react';
import { infoLog } from '../config/logger';
import { useAuthStore } from '../stores/useAuthStore';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { useContext } from 'react';
import api from '../services/api';
import { cleanCorruptedTokens, getStoredTokens, forceCleanAuth, isAuthStateCorrupted } from '../utils/authUtils';

// SINGLETON PATTERN PARA EVITAR RACE CONDITIONS
let initializationPromise: Promise<void> | null = null;
let isInitializing = false;

const getInitializationPromise = (authStore: any): Promise<void> => {
  if (initializationPromise) {
    return initializationPromise;
  }
  
  if (isInitializing) {
    // Si ya se está inicializando, esperar a que termine
    return new Promise((resolve) => {
      const checkInitialization = () => {
        if (!isInitializing) {
          resolve();
        } else {
          setTimeout(checkInitialization, 100);
        }
      };
      checkInitialization();
    });
  }
  
  isInitializing = true;
  initializationPromise = performInitialization(authStore);
  
  return initializationPromise;
};

const performInitialization = async (authStore: any): Promise<void> => {
  try {
    infoLog('🔐 SINGLETON - Iniciando inicialización única de autenticación...');
    
    // Verificar si el estado está corrupto
    if (isAuthStateCorrupted()) {
      infoLog('🔐 SINGLETON - Estado de autenticación corrupto detectado, limpiando completamente...');
      forceCleanAuth();
      authStore.clearAuth();
      authStore.setLoading(false);
      return;
    }
    
    // Limpiar tokens corruptos automáticamente (solo una vez)
    cleanCorruptedTokens();
    const { accessToken, refreshToken } = getStoredTokens();
    
    if (accessToken && refreshToken) {
      infoLog('🔐 SINGLETON - Tokens encontrados, validando con backend...');
      
      // Usar el nuevo método initializeAuth del store
      await authStore.initializeAuth();
    } else {
      infoLog('🔐 SINGLETON - No hay tokens en localStorage');
      authStore.clearAuth();
      authStore.setLoading(false);
    }
  } catch (error) {
    infoLog('🔐 SINGLETON - Error en inicialización:', error);
    authStore.clearAuth();
    authStore.setLoading(false);
  } finally {
    isInitializing = false;
  }
};

interface BackendUser {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: { uid: string; email: string; displayName?: string } | null;
  backendUser: BackendUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<BackendUser>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  updateProfile: (data: { displayName?: string; email?: string }) => Promise<BackendUser>;
}

export const useAuth = (): AuthState => {
  const authStore = useAuthStore();
  const webSocketContext = useContext(WebSocketContext);
  const { connect: connectSocket, disconnect: disconnectSocket, isConnected } = webSocketContext || {};
  
  // Refs para evitar dependencias inestables
  const hasCheckedInitialAuth = useRef(false);
  const isAuthenticatedRef = useRef(false);

  // Calcular isAuthenticated basado en el estado del store - OPTIMIZADO
  const isAuthenticated = useMemo(() => {
    // Si está autenticando, no considerar como autenticado aún
    if (authStore.isAuthenticating) {
      isAuthenticatedRef.current = false;
      return false;
    }
    
    // Si está cargando, mantener el estado anterior o false
    if (authStore.loading) {
      isAuthenticatedRef.current = false;
      return false;
    }
    
    // Solo considerar autenticado si tiene tanto user como backendUser
    const authenticated = !!(authStore.user && authStore.backendUser);
    isAuthenticatedRef.current = authenticated;
    return authenticated;
  }, [authStore.user, authStore.backendUser, authStore.isAuthenticating, authStore.loading]);

  // Verificar estado inicial de autenticación - SINGLETON PATTERN
  useEffect(() => {
    // Solo ejecutar una vez al montar el componente
    if (hasCheckedInitialAuth.current || !authStore.loading) {
      return;
    }

    const checkInitialAuth = async () => {
      try {
        hasCheckedInitialAuth.current = true;
        
        // Usar singleton pattern para evitar múltiples inicializaciones
        await getInitializationPromise(authStore);
        
        infoLog('🔐 useAuth - Inicialización completada');
      } catch (error) {
        infoLog('🔐 useAuth - Error en inicialización:', error);
        authStore.clearAuth();
        authStore.setLoading(false);
      }
    };
    
    checkInitialAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Conectar WebSocket cuando se autentica - OPTIMIZADO
  useEffect(() => {
    // SOLO desconectar WebSocket si realmente no está autenticado y no está en proceso de autenticación
    if (disconnectSocket && isConnected && !isAuthenticatedRef.current && !authStore.loading && !authStore.isAuthenticating) {
      infoLog('🔐 useAuth - Desconectando WebSocket (usuario no autenticado)');
      disconnectSocket();
    }
  }, [isAuthenticated, disconnectSocket, isConnected, authStore.loading, authStore.isAuthenticating]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escuchar eventos de autenticación fallida - OPTIMIZADO
  const handleAuthFailed = useCallback(() => {
    infoLog('🔐 useAuth - Autenticación fallida, desconectando WebSocket');
    if (disconnectSocket) {
      disconnectSocket();
    }
  }, [disconnectSocket]);

  useEffect(() => {
    window.addEventListener('auth:authentication-failed', handleAuthFailed);
    
    return () => {
      window.removeEventListener('auth:authentication-failed', handleAuthFailed);
    };
  }, [handleAuthFailed]);

  // Escuchar evento de login exitoso - OPTIMIZADO
  const handleLoginSuccess = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail as { user: unknown; accessToken: string } | undefined;
    const accessToken = detail?.accessToken;
    
    if (accessToken && connectSocket && !isConnected) {
      infoLog('🔐 useAuth - Login exitoso detectado, conectando WebSocket...');
      connectSocket(accessToken);
    }
  }, [connectSocket, isConnected]);

  useEffect(() => {
    window.addEventListener('auth:login-success', handleLoginSuccess as EventListener);
    
    return () => {
      window.removeEventListener('auth:login-success', handleLoginSuccess as EventListener);
    };
  }, [handleLoginSuccess]);

  // Escuchar evento de token refrescado para reconectar WebSocket - OPTIMIZADO
  const handleTokenRefreshed = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail as { accessToken: string } | undefined;
    const accessToken = detail?.accessToken;
    
    if (accessToken && connectSocket && !isConnected) {
      infoLog('🔐 useAuth - Token refrescado, reconectando WebSocket...');
      connectSocket(accessToken);
    }
  }, [connectSocket, isConnected]);

  useEffect(() => {
    window.addEventListener('auth:token-refreshed', handleTokenRefreshed as EventListener);
    
    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed as EventListener);
    };
  }, [handleTokenRefreshed]);

  // Memoizar el objeto de retorno para evitar re-renders
  return useMemo(() => ({
    user: authStore.user,
    backendUser: authStore.backendUser,
    loading: authStore.loading,
    error: authStore.error,
    isAuthenticated,
    isAuthenticating: authStore.isAuthenticating,
    login: authStore.login,
    logout: authStore.logout,
    clearAuth: authStore.clearAuth,
    updateProfile: authStore.updateProfile
  }), [
    authStore.user,
    authStore.backendUser,
    authStore.loading,
    authStore.error,
    isAuthenticated,
    authStore.isAuthenticating,
    authStore.login,
    authStore.logout,
    authStore.clearAuth,
    authStore.updateProfile
  ]);
}; 