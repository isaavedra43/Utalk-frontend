import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { WebSocketContext } from './WebSocketContext';

const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { connect: connectSocket, disconnect: disconnectSocket } = useContext(WebSocketContext) || {};

  // Conectar WebSocket cuando se autentica
  useEffect(() => {
    if (auth.isAuthenticated && auth.backendUser && connectSocket) {
      const token = localStorage.getItem('access_token');
      if (token) {
        connectSocket(token);
      }
    } else if (disconnectSocket) {
      disconnectSocket();
    }
  }, [auth.isAuthenticated, auth.backendUser, connectSocket, disconnectSocket]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext }; 