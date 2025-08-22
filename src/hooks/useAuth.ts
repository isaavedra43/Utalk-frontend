import { useEffect, useMemo } from 'react';
import { infoLog } from '../config/logger';
import { useAuthStore } from '../stores/useAuthStore';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { useContext } from 'react';
import api from '../services/api';

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
        // TEMPORAL: Limpiar tokens corruptos automáticamente
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (accessToken && refreshToken) {
          // Verificar si los tokens parecen válidos (no undefined, null, o muy cortos)
          if (accessToken === 'undefined' || accessToken === 'null' || accessToken.length < 10) {
            infoLog('🔐 useAuth - Tokens corruptos detectados, limpiando localStorage...');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            authStore.clearAuth();
            authStore.setLoading(false);
            return;
          }
          
          infoLog('🔐 useAuth - Tokens encontrados en localStorage, validando con backend...');
          
          // NUEVO: Intentar validar token con el backend
          const validatedUser = await authStore.validateToken(accessToken);
          
          if (validatedUser) {
            // Token válido, establecer usuario autenticado
            authStore.setBackendUser(validatedUser);
            authStore.setUser({ 
              uid: validatedUser.id, 
              email: validatedUser.email, 
              displayName: validatedUser.displayName 
            });
            infoLog('🔐 useAuth - Autenticación inicial exitosa');
          } else {
            // NUEVO: Intentar refresh del token antes de limpiar
            infoLog('🔐 useAuth - Token inválido, intentando refresh...');
            try {
              const refreshResponse = await api.post('/api/auth/refresh', { 
                refreshToken: refreshToken 
              });
              
              if (refreshResponse.data.accessToken) {
                // Refresh exitoso, actualizar tokens
                localStorage.setItem('access_token', refreshResponse.data.accessToken);
                if (refreshResponse.data.refreshToken) {
                  localStorage.setItem('refresh_token', refreshResponse.data.refreshToken);
                }
                
                // Validar el nuevo token
                const newValidatedUser = await authStore.validateToken(refreshResponse.data.accessToken);
                if (newValidatedUser) {
                  authStore.setBackendUser(newValidatedUser);
                  authStore.setUser({ 
                    uid: newValidatedUser.id, 
                    email: newValidatedUser.email, 
                    displayName: newValidatedUser.displayName 
                  });
                  infoLog('🔐 useAuth - Refresh exitoso, autenticación restaurada');
                  
                  // Disparar evento de token refrescado
                  window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
                    detail: { accessToken: refreshResponse.data.accessToken }
                  }));
                  return;
                }
              }
            } catch (refreshError) {
              infoLog('🔐 useAuth - Refresh falló:', refreshError);
            }
            
            // Si llegamos aquí, tanto validación como refresh fallaron
            infoLog('🔐 useAuth - Token inválido y refresh falló, limpiando autenticación');
            authStore.clearAuth();
          }
        } else {
          infoLog('🔐 useAuth - No hay tokens en localStorage');
        }
      } catch (error) {
        infoLog('Error verificando autenticación inicial:', error);
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
      infoLog('🔐 useAuth - Desconectando WebSocket (usuario no autenticado)');
      disconnectSocket();
    }
  }, [isAuthenticated, authStore.loading, authStore.isAuthenticating, disconnectSocket, isConnected]);

  // Escuchar eventos de autenticación fallida
  useEffect(() => {
    const handleAuthFailed = () => {
      infoLog('🔐 useAuth - Autenticación fallida, desconectando WebSocket');
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
        infoLog('🔐 useAuth - Login exitoso detectado, conectando WebSocket...');
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
        infoLog('🔐 useAuth - Token refrescado, reconectando WebSocket...');
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