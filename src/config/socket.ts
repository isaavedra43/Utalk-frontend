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
  const SOCKET_URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_BACKEND_URL || 'https://utalk-backend-production.up.railway.app';
  
  console.log('🔌 Configurando socket con URL:', SOCKET_URL);
  console.log('🔌 Token disponible:', token ? 'Sí' : 'No');
  console.log('🔌 Variables de entorno:', {
    VITE_WS_URL: import.meta.env.VITE_WS_URL,
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL
  });
  
  const socket = io(SOCKET_URL, {
    ...SOCKET_CONFIG,
    auth: {
      token: token
    },
    extraHeaders: {
      'Authorization': `Bearer ${token}`
    },
    path: '/socket.io/', // Asegurar que use el path correcto
    query: {
      token: token // Agregar token también como query parameter
    }
  });

  // Agregar logging adicional para debug
  socket.on('connect', () => {
    console.log('🔌 Socket conectado exitosamente:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('🔌 Error de conexión del socket:', error);
    console.error('🔌 Detalles del error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Manejar errores específicos de autenticación
    if (error.message.includes('AUTHENTICATION_REQUIRED') || error.message.includes('JWT token required')) {
      console.error('🔐 Error de autenticación: Token JWT requerido o inválido');
      console.error('🔐 Token disponible:', token ? 'Sí' : 'No');
      if (token) {
        console.error('🔐 Token preview:', token.substring(0, 20) + '...');
      }
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket desconectado:', reason);
  });

  return socket;
}; 