import { io } from 'socket.io-client';

const SOCKET_CONFIG = {
  transports: ['websocket', 'polling'],
  timeout: 30000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  maxReconnectionAttempts: 10,
  autoConnect: false, // No conectar automáticamente
  forceNew: true,
  upgrade: true,
  rememberUpgrade: true
};

export const createSocket = (token: string) => {
  // Usar URL del backend real
  const SOCKET_URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_BACKEND_URL || 'https://tu-backend.railway.app';
  
  console.log('🔌 Configurando socket con URL:', SOCKET_URL);
  
  return io(SOCKET_URL, {
    ...SOCKET_CONFIG,
    auth: {
      token: token
    },
    extraHeaders: {
      'Authorization': `Bearer ${token}`
    }
  });
}; 