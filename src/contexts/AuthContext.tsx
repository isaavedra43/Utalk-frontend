import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { WebSocketContext } from './WebSocketContext';

const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { connect: connectSocket, disconnect: disconnectSocket, isConnected } = useContext(WebSocketContext) || {};

  // Conectar WebSocket cuando se autentica
  useEffect(() => {
    console.log('🔐 AuthContext - Estado de autenticación:', {
      isAuthenticated: auth.isAuthenticated,
      hasBackendUser: !!auth.backendUser,
      loading: auth.loading,
      isConnected: isConnected,
      userEmail: auth.backendUser?.email || auth.user?.email
    });

    // SOLO desconectar WebSocket si realmente no está autenticado
    if (disconnectSocket && isConnected && !auth.isAuthenticated && !auth.loading) {
      console.log('🔐 AuthContext - Desconectando WebSocket (usuario no autenticado)');
      disconnectSocket();
    }
  }, [auth.isAuthenticated, auth.backendUser, auth.loading, auth.user?.email, disconnectSocket, isConnected]);

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