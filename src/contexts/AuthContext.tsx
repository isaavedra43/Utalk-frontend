import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { WebSocketContext } from './WebSocketContext';
import api from '../services/api';
import { logger } from '../utils/logger';
import { performanceMonitor } from '../utils/performanceMonitor';

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

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; email: string; displayName?: string } | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasConnectedWebSocket, setHasConnectedWebSocket] = useState(false);
  
  const { connect: connectSocket, disconnect: disconnectSocket, isConnected } = useContext(WebSocketContext) || {};

  // OPTIMIZADO: Usar useMemo para calcular estado de autenticación
  const isAuthenticated = useMemo(() => {
    return !!user && !!backendUser && !isAuthenticating;
  }, [user, backendUser, isAuthenticating]);

  // OPTIMIZADO: Función de login con useCallback
  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      setIsAuthenticating(true);
      
      logger.authInfo('Iniciando login con backend', { email });
      
      const response = await api.post('/api/auth/login', {
        email,
        password
      });
      
      const { accessToken, refreshToken, user: userData } = response.data;
      
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setBackendUser(userData);
      setUser({ uid: userData.id, email: userData.email, displayName: userData.displayName });
      setLoading(false);
      setIsAuthenticating(false);
      
      // Disparar evento de login exitoso
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('auth:login-success', {
          detail: { user: userData, accessToken }
        }));
        // Log de performance
        performanceMonitor.logLoginSuccess();
      }, 100);
      
      return userData;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError?.response?.data?.message || 'Error en el login';
      setError(errorMessage);
      setLoading(false);
      setIsAuthenticating(false);
      throw new Error(errorMessage);
    }
  }, []);

  // OPTIMIZADO: Función para limpiar autenticación
  const clearAuth = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setBackendUser(null);
    setError(null);
    setLoading(false);
    setIsAuthenticating(false);
  }, []);

  // OPTIMIZADO: Función para actualizar perfil
  const updateProfile = useCallback(async (data: { displayName?: string; email?: string }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put('/api/auth/profile', data);
      
      // Actualizar el usuario en el estado
      if (backendUser) {
        const updatedUser = { ...backendUser, ...response.data };
        setBackendUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [backendUser]);

  // OPTIMIZADO: Función de logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  // OPTIMIZADO: Verificar estado inicial de autenticación
  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userData = localStorage.getItem('user');
        
        if (accessToken && refreshToken && userData) {
          const user = JSON.parse(userData);
          setBackendUser(user);
          setUser({ uid: user.id, email: user.email, displayName: user.displayName });
        }
      } catch (error) {
        console.error('Error verificando autenticación inicial:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkInitialAuth();
  }, []);

  // OPTIMIZADO: Log del estado actual solo en errores críticos
  useEffect(() => {
    // Solo log en errores críticos
    if (error) {
      console.log('🔐 AuthProvider - Error crítico:', {
        error,
        isAuthenticated,
        loading
      });
    }
  }, [error, isAuthenticated, loading]);

  // OPTIMIZADO: Conectar WebSocket cuando se autentica
  useEffect(() => {
    // SOLO desconectar WebSocket si realmente no está autenticado y no está en proceso de autenticación
    if (disconnectSocket && isConnected && !isAuthenticated && !loading && !isAuthenticating) {
      console.log('🔐 AuthContext - Desconectando WebSocket (usuario no autenticado)');
      setHasConnectedWebSocket(false);
      disconnectSocket();
    }
  }, [isAuthenticated, loading, isAuthenticating, disconnectSocket, isConnected]);

  // OPTIMIZADO: Escuchar eventos de autenticación fallida
  useEffect(() => {
    const handleAuthFailed = () => {
      console.log('🔐 AuthContext - Autenticación fallida, desconectando WebSocket');
      if (disconnectSocket) {
        disconnectSocket();
      }
    };

    window.addEventListener('auth:authentication-failed', handleAuthFailed);
    
    return () => {
      window.removeEventListener('auth:authentication-failed', handleAuthFailed);
    };
  }, [disconnectSocket]);

  // OPTIMIZADO: Escuchar evento de login exitoso
  useEffect(() => {
    const handleLoginSuccess = (e: Event) => {
      const detail = (e as CustomEvent).detail as { user: unknown; accessToken: string } | undefined;
      const accessToken = detail?.accessToken;
      
      if (accessToken && connectSocket && !isConnected && !hasConnectedWebSocket) {
        console.log('🔐 AuthContext - Login exitoso detectado, conectando WebSocket...');
        setHasConnectedWebSocket(true);
        connectSocket(accessToken);
      }
    };

    window.addEventListener('auth:login-success', handleLoginSuccess as EventListener);
    
    return () => {
      window.removeEventListener('auth:login-success', handleLoginSuccess as EventListener);
    };
  }, [connectSocket, isConnected, hasConnectedWebSocket]);

  // Logs de contexto eliminados - redundantes con AuthProvider

  // OPTIMIZADO: Usar useMemo para el valor del contexto
  const authValue: AuthState = useMemo(() => ({
    user,
    backendUser,
    loading,
    error,
    isAuthenticated,
    isAuthenticating,
    login,
    logout,
    clearAuth,
    updateProfile
  }), [user, backendUser, loading, error, isAuthenticated, isAuthenticating, login, logout, clearAuth, updateProfile]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext }; 