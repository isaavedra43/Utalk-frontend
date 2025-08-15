import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WebSocketContext } from './WebSocketContext';
import api from '../services/api';
import { logger } from '../utils/logger';

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
  const [hasConnectedWebSocket, setHasConnectedWebSocket] = useState(false); // NUEVO: Flag para evitar múltiples conexiones
  
  const { connect: connectSocket, disconnect: disconnectSocket, isConnected } = useContext(WebSocketContext) || {};

  // Calcular estado de autenticación
  const isAuthenticated = !!user && !!backendUser && !isAuthenticating;

  // Función de login
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

  // Función para limpiar autenticación
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

  // Función para actualizar perfil
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

  // Función de logout
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

  // Verificar estado inicial de autenticación
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

  // CORREGIDO: Log del estado actual solo cuando cambia significativamente
  useEffect(() => {
    console.log('🔐 AuthProvider - Estado actual:', {
      isAuthenticated,
      loading,
      isAuthenticating,
      hasUser: !!user,
      hasBackendUser: !!backendUser
    });
  }, [isAuthenticated, loading, isAuthenticating, user, backendUser]);

  // CORREGIDO: Conectar WebSocket cuando se autentica - SIN LOGS EXCESIVOS
  useEffect(() => {
    // SOLO desconectar WebSocket si realmente no está autenticado y no está en proceso de autenticación
    if (disconnectSocket && isConnected && !isAuthenticated && !loading && !isAuthenticating) {
      console.log('🔐 AuthContext - Desconectando WebSocket (usuario no autenticado)');
      setHasConnectedWebSocket(false); // Resetear flag al desconectar
      disconnectSocket();
    }
  }, [isAuthenticated, loading, isAuthenticating, disconnectSocket, isConnected]);

  // Escuchar eventos de autenticación fallida para desconectar WebSocket
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

  // Escuchar evento de login exitoso para conectar WebSocket inmediatamente
  useEffect(() => {
    const handleLoginSuccess = (e: Event) => {
      const detail = (e as CustomEvent).detail as { user: unknown; accessToken: string } | undefined;
      const accessToken = detail?.accessToken;
      
      if (accessToken && connectSocket && !isConnected && !hasConnectedWebSocket) {
        console.log('🔐 AuthContext - Login exitoso detectado, conectando WebSocket...');
        setHasConnectedWebSocket(true); // Marcar como conectado
        connectSocket(accessToken);
      }
    };

    window.addEventListener('auth:login-success', handleLoginSuccess as EventListener);
    
    return () => {
      window.removeEventListener('auth:login-success', handleLoginSuccess as EventListener);
    };
  }, [connectSocket, isConnected, hasConnectedWebSocket]);

  // CORREGIDO: Log del estado que se está pasando al contexto solo cuando cambia
  useEffect(() => {
    console.log('🔐 AuthContext - Estado que se pasa al contexto:', {
      isAuthenticated,
      loading,
      isAuthenticating,
      hasUser: !!user,
      hasBackendUser: !!backendUser
    });
  }, [isAuthenticated, loading, isAuthenticating, user, backendUser]);

  const authValue: AuthState = {
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
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext }; 