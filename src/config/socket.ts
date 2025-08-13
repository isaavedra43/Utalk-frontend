import { io } from 'socket.io-client';

const SOCKET_CONFIG = {
  transports: ['websocket', 'polling'],
  timeout: 30000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false // No conectar automáticamente
};

export const createSocket = (token: string) => {
  const SOCKET_URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'https://tu-backend.railway.app';
  
  return io(SOCKET_URL, {
    ...SOCKET_CONFIG,
    auth: {
      token: token
    }
  });
}; 