import { useEffect, useMemo, useRef, useCallback } from 'react';
import { infoLog } from '../config/logger';
import { useAuthStore } from '../stores/useAuthStore';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { useContext } from 'react';
import api from '../services/api';
import { cleanCorruptedTokens, getStoredTokens, forceCleanAuth, isAuthStateCorrupted } from '../utils/authUtils';

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

  // Verificar estado inicial de autenticación - OPTIMIZADO
  useEffect(() => {
    // Solo ejecutar una vez al montar el componente
    if (hasCheckedInitialAuth.current || !authStore.loading) {
      return;
    }

    const checkInitialAuth = async () => {
      try {
        hasCheckedInitialAuth.current = true;
        
        // Verificar si el estado está corrupto
        if (isAuthStateCorrupted()) {
          infoLog('🔐 useAuth - Estado de autenticación corrupto detectado, limpiando completamente...');
          forceCleanAuth();
          authStore.clearAuth();
          authStore.setLoading(false);
          return;
        }
        
        // Limpiar tokens corruptos automáticamente (solo una vez)
        cleanCorruptedTokens();
        const { accessToken, refreshToken } = getStoredTokens();
        
        if (accessToken && refreshToken) {
          infoLog('🔐 useAuth - Tokens encontrados en localStorage, validando con backend...');
          
          // Intentar validar token con el backend
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
            // Intentar refresh del token antes de limpiar
            infoLog('🔐 useAuth - Token inválido, intentando refresh...');
            try {
              // Verificar que el refreshToken sea válido
              if (!refreshToken) {
                infoLog('🔐 useAuth - Refresh token inválido, limpiando autenticación');
                authStore.clearAuth();
                authStore.setLoading(false);
                return;
              }
              
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
    
    checkInitialAuth();
  }, []); // Sin dependencias para evitar re-ejecuciones

  // Conectar WebSocket cuando se autentica - OPTIMIZADO
  useEffect(() => {
    // SOLO desconectar WebSocket si realmente no está autenticado y no está en proceso de autenticación
    if (disconnectSocket && isConnected && !isAuthenticatedRef.current && !authStore.loading && !authStore.isAuthenticating) {
      infoLog('🔐 useAuth - Desconectando WebSocket (usuario no autenticado)');
      disconnectSocket();
    }
  }, [isAuthenticated, disconnectSocket, isConnected]); // Dependencias mínimas

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