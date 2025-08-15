import { io } from 'socket.io-client';
import { ENV_CONFIG } from './environment';

const SOCKET_CONFIG = {
  transports: ['websocket', 'polling'],
  timeout: ENV_CONFIG.WS_TIMEOUT,
  reconnection: true,
  reconnectionAttempts: ENV_CONFIG.WS_RETRY_ATTEMPTS,
  reconnectionDelay: ENV_CONFIG.WS_RECONNECTION_DELAY,
  reconnectionDelayMax: 10000, // Aumentado para dar más tiempo al backend
  maxReconnectionAttempts: ENV_CONFIG.WS_RETRY_ATTEMPTS,
  autoConnect: false, // No conectar automáticamente
  forceNew: true,
  upgrade: true,
  rememberUpgrade: true
};

export const createSocket = (token: string, options?: { timeout?: number }) => {
  // CORREGIDO: Usar configuración centralizada
  const SOCKET_URL = ENV_CONFIG.WS_URL;
  
  console.log('🔌 Configurando socket con URL:', SOCKET_URL);
  console.log('🔌 Token disponible:', token ? 'Sí' : 'No');
  console.log('🔌 Configuración de entorno:', {
    WS_URL: ENV_CONFIG.WS_URL,
    BACKEND_URL: ENV_CONFIG.BACKEND_URL,
    DEV_MODE: ENV_CONFIG.DEV_MODE
  });
  
  const socketConfig = {
    ...SOCKET_CONFIG,
    // OPTIMIZADO: Timeout personalizable para login (mínimo 20 segundos)
    timeout: Math.max(options?.timeout || SOCKET_CONFIG.timeout, 20000)
  };
  
  const socket = io(SOCKET_URL, {
    ...socketConfig,
    // SIMPLIFICADO: Solo usar auth para el token
    auth: {
      token: token
    },
    path: '/socket.io/', // Asegurar que use el path correcto
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