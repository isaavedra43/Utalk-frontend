import { useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { useContext } from 'react';

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
  const { connect: connectSocket, disconnect: disconnectSocket, isConnected } = useContext(WebSocketContext) || {};

  // Calcular isAuthenticated basado en el estado del store
  const isAuthenticated = useMemo(() => {
    return !!authStore.user && !!authStore.backendUser && !authStore.isAuthenticating;
  }, [authStore.user, authStore.backendUser, authStore.isAuthenticating]);

  // Verificar estado inicial de autenticación
  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userData = localStorage.getItem('user');
        
        if (accessToken && refreshToken && userData) {
          console.log('🔐 useAuth - Tokens encontrados en localStorage, validando con backend...');
          
          // Validar token con el backend
          const validatedUser = await authStore.validateToken(accessToken);
          
          if (validatedUser) {
            // Token válido, establecer usuario autenticado
            authStore.setBackendUser(validatedUser);
            authStore.setUser({ 
              uid: validatedUser.id, 
              email: validatedUser.email, 
              displayName: validatedUser.displayName 
            });
            console.log('🔐 useAuth - Autenticación inicial exitosa');
          } else {
            // Token inválido, limpiar autenticación
            console.log('🔐 useAuth - Token inválido, limpiando autenticación');
            authStore.clearAuth();
          }
        } else {
          console.log('🔐 useAuth - No hay tokens en localStorage');
        }
      } catch (error) {
        console.error('Error verificando autenticación inicial:', error);
        // En caso de error, limpiar autenticación para estar seguros
        authStore.clearAuth();
      } finally {
        authStore.setLoading(false);
      }
    };
    
    if (authStore.loading) {
      checkInitialAuth();
    }
  }, [authStore]);

  // Conectar WebSocket cuando se autentica
  useEffect(() => {
    // SOLO desconectar WebSocket si realmente no está autenticado y no está en proceso de autenticación
    if (disconnectSocket && isConnected && !isAuthenticated && !authStore.loading && !authStore.isAuthenticating) {
      console.log('🔐 useAuth - Desconectando WebSocket (usuario no autenticado)');
      disconnectSocket();
    }
  }, [isAuthenticated, authStore.loading, authStore.isAuthenticating, disconnectSocket, isConnected]);

  // Escuchar eventos de autenticación fallida
  useEffect(() => {
    const handleAuthFailed = () => {
      console.log('🔐 useAuth - Autenticación fallida, desconectando WebSocket');
      if (disconnectSocket) {
        disconnectSocket();
      }
    };

    window.addEventListener('auth:authentication-failed', handleAuthFailed);
    
    return () => {
      window.removeEventListener('auth:authentication-failed', handleAuthFailed);
    };
  }, [disconnectSocket]);

  // Escuchar evento de login exitoso
  useEffect(() => {
    const handleLoginSuccess = (e: Event) => {
      const detail = (e as CustomEvent).detail as { user: unknown; accessToken: string } | undefined;
      const accessToken = detail?.accessToken;
      
      if (accessToken && connectSocket && !isConnected) {
        console.log('🔐 useAuth - Login exitoso detectado, conectando WebSocket...');
        connectSocket(accessToken);
      }
    };

    window.addEventListener('auth:login-success', handleLoginSuccess as EventListener);
    
    return () => {
      window.removeEventListener('auth:login-success', handleLoginSuccess as EventListener);
    };
  }, [connectSocket, isConnected]);

  // Escuchar evento de token refrescado para reconectar WebSocket
  useEffect(() => {
    const handleTokenRefreshed = (e: Event) => {
      const detail = (e as CustomEvent).detail as { accessToken: string } | undefined;
      const accessToken = detail?.accessToken;
      
      if (accessToken && connectSocket && !isConnected) {
        console.log('🔐 useAuth - Token refrescado, reconectando WebSocket...');
        connectSocket(accessToken);
      }
    };

    window.addEventListener('auth:token-refreshed', handleTokenRefreshed as EventListener);
    
    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed as EventListener);
    };
  }, [connectSocket, isConnected]);

  // Retornar la misma API que AuthContext
  return {
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
  };
}; 