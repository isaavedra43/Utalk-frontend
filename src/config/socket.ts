import { io } from 'socket.io-client';
import { ENV_CONFIG } from './environment';
import { getUserInfo } from '../utils/jwtUtils';

const SOCKET_CONFIG = {
  transports: ['websocket', 'polling'], // NUEVO: Permitir fallback a polling
  timeout: 60000, // NUEVO: Aumentado a 60 segundos
  reconnection: true,
  reconnectionAttempts: 5, // NUEVO: Reducido para evitar loops infinitos
  reconnectionDelay: 2000, // NUEVO: Delay inicial de 2 segundos
  reconnectionDelayMax: 30000, // NUEVO: Máximo 30 segundos
  maxReconnectionAttempts: 5, // NUEVO: Máximo 5 intentos
  autoConnect: false, // No conectar automáticamente
  forceNew: true,
  upgrade: true,
  rememberUpgrade: true,
  // NUEVO: Configuraciones adicionales para estabilidad
  pingTimeout: 60000, // NUEVO: Timeout de ping de 60 segundos
  pingInterval: 25000, // NUEVO: Ping cada 25 segundos
  closeOnBeforeunload: false, // NUEVO: No cerrar en beforeunload
  // NUEVO: Configuraciones de transporte
  transportOptions: {
    websocket: {
      // NUEVO: Configuraciones específicas de WebSocket
      perMessageDeflate: false, // NUEVO: Deshabilitar compresión para evitar problemas
      maxPayload: 1000000 // NUEVO: Máximo 1MB de payload
    }
  }
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
  
  // NUEVO: Obtener información del usuario para incluir en la autenticación
  const userInfo = getUserInfo();
  console.log('🔌 Información del usuario para socket:', {
    workspaceId: userInfo.workspaceId,
    tenantId: userInfo.tenantId,
    userId: userInfo.userId,
    email: userInfo.email
  });
  
  const socketConfig = {
    ...SOCKET_CONFIG,
    // NUEVO: Timeout más largo para dar tiempo al backend
    timeout: Math.max(options?.timeout || SOCKET_CONFIG.timeout, 60000)
  };
  
  const socket = io(SOCKET_URL, {
    ...socketConfig,
    // NUEVO: Configuración de autenticación simplificada
    auth: {
      token: token
    },
    extraHeaders: {
      'Authorization': `Bearer ${token}`
    },
    path: '/socket.io/',
    // NUEVO: Configuraciones adicionales para estabilidad
    withCredentials: true, // NUEVO: Incluir credenciales
  });

  // CORREGIDO: Logging más detallado para debugging
  socket.on('connect', () => {
    console.log('✅ WebSocket: Conectado exitosamente', {
      socketId: socket.id,
      url: SOCKET_URL,
      timestamp: new Date().toISOString(),
      workspaceId: userInfo.workspaceId,
      tenantId: userInfo.tenantId,
      userId: userInfo.userId
    });
  });

  socket.on('connecting', () => {
    console.log('🔄 WebSocket: Conectando...', {
      url: SOCKET_URL,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket: Error de conexión', {
      message: error.message,
      name: error.name,
      url: SOCKET_URL,
      timestamp: new Date().toISOString(),
      workspaceId: userInfo.workspaceId,
      tenantId: userInfo.tenantId,
      userId: userInfo.userId
    });
    
    // Manejar errores específicos de autenticación
    if (error.message.includes('AUTHENTICATION_REQUIRED') || error.message.includes('JWT token required')) {
      console.error('🔐 WebSocket: Error de autenticación - Token JWT requerido o inválido');
      console.error('🔐 Token disponible:', token ? 'Sí' : 'No');
      if (token) {
        console.error('🔐 Token preview:', token.substring(0, 20) + '...');
      }
    }
    
    // NUEVO: Manejar errores específicos de workspaceId
    if (error.message.includes('workspace') || error.message.includes('tenant')) {
      console.error('🔐 WebSocket: Error de workspace/tenant - Verificar configuración:', {
        workspaceId: userInfo.workspaceId,
        tenantId: userInfo.tenantId
      });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 WebSocket: Desconectado', {
      reason,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnecting', (reason) => {
    console.log('🔌 WebSocket: Desconectando...', {
      reason,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  // NUEVO: Conectar explícitamente el socket
  console.log('🔌 Conectando socket explícitamente...');
  socket.connect();

  return socket;
}; 