import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { WebSocketContext } from './WebSocketContext';

const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { connect: connectSocket, disconnect: disconnectSocket, isConnected } = useContext(WebSocketContext) || {};

  // Función para verificar si el token es válido
  const isTokenValid = (token: string): boolean => {
    try {
      // Decodificar el token JWT (sin verificar la firma)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Verificar si el token no ha expirado (con margen de 5 minutos)
      return payload.exp > currentTime + 300;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  };

  // Conectar WebSocket cuando se autentica
  useEffect(() => {
    console.log('🔐 AuthContext - Estado de autenticación:', {
      isAuthenticated: auth.isAuthenticated,
      hasBackendUser: !!auth.backendUser,
      loading: auth.loading,
      isConnected: isConnected,
      userEmail: auth.backendUser?.email || auth.user?.email
    });

    if (auth.isAuthenticated && auth.backendUser && !auth.loading && connectSocket && !isConnected) {
      const token = localStorage.getItem('access_token');
      console.log('🔐 AuthContext - Intentando conectar WebSocket con token:', token ? 'Disponible' : 'No disponible');
      
      if (token) {
        // Verificar si el token es válido
        if (isTokenValid(token)) {
          console.log('🔐 AuthContext - Token válido, conectando WebSocket...');
          // Conectar inmediatamente sin delay para evitar problemas de timing
          connectSocket(token);
        } else {
          console.warn('🔐 AuthContext - Token expirado o inválido, no conectando WebSocket');
          // El token está expirado, debería refrescarse automáticamente
        }
      } else {
        console.warn('🔐 AuthContext - No hay token disponible para conectar WebSocket');
      }
    } else if (disconnectSocket && isConnected && (!auth.isAuthenticated || !auth.backendUser)) {
      console.log('🔐 AuthContext - Desconectando WebSocket (usuario no autenticado)');
      disconnectSocket();
    }
  }, [auth.isAuthenticated, auth.backendUser, auth.loading, connectSocket, disconnectSocket, isConnected, auth.user?.email]);

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
      
      if (accessToken && connectSocket && !isConnected) {
        console.log('🔐 AuthContext - Login exitoso detectado, conectando WebSocket...');
        connectSocket(accessToken);
      }
    };

    window.addEventListener('auth:login-success', handleLoginSuccess as EventListener);
    
    return () => {
      window.removeEventListener('auth:login-success', handleLoginSuccess as EventListener);
    };
  }, [connectSocket, isConnected]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext }; 