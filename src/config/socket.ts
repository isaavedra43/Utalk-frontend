import { io } from 'socket.io-client';
import { infoLog } from '../config/logger';
import { ENV_CONFIG } from './environment';
import { getUserInfo } from '../utils/jwtUtils';

const SOCKET_CONFIG = {
  transports: ['websocket', 'polling'], // NUEVO: Permitir fallback a polling
  timeout: 60000, // NUEVO: Aumentado a 60 segundos
  reconnection: true,
  reconnectionAttempts: 3, // REDUCIDO: Solo 3 intentos para evitar loops
  reconnectionDelay: 5000, // AUMENTADO: Delay inicial de 5 segundos
  reconnectionDelayMax: 30000, // NUEVO: Máximo 30 segundos
  maxReconnectionAttempts: 3, // REDUCIDO: Máximo 3 intentos
  autoConnect: false, // No conectar automáticamente
  forceNew: true,
  upgrade: true,
  rememberUpgrade: true,
  // NUEVO: Configuraciones adicionales para estabilidad
  pingTimeout: 60000, // NUEVO: Timeout de ping de 60 segundos
  pingInterval: 30000, // AUMENTADO: Ping cada 30 segundos (menos frecuente)
  closeOnBeforeunload: false, // NUEVO: No cerrar en beforeunload
  // NUEVO: Configuraciones de transporte optimizadas
  transportOptions: {
    websocket: {
      // NUEVO: Configuraciones específicas de WebSocket
      perMessageDeflate: false, // NUEVO: Deshabilitar compresión para evitar problemas
      maxPayload: 1000000, // NUEVO: Máximo 1MB de payload
      // NUEVO: Configuraciones para reducir eventos
      binaryType: 'arraybuffer',
      protocols: []
    },
    polling: {
      // NUEVO: Configuraciones para polling
      timeout: 60000,
      extraHeaders: {}
    }
  },
  // NUEVO: Configuraciones para reducir eventos
  maxHttpBufferSize: 1e6, // 1MB
  allowEIO3: true,
  // NUEVO: Throttling de eventos
  eventThrottleMs: 100, // 100ms entre eventos
  maxEventsPerSecond: 10 // Máximo 10 eventos por segundo
};

export const createSocket = (token: string, options?: { timeout?: number }) => {
  // CORREGIDO: Usar configuración centralizada
  const SOCKET_URL = ENV_CONFIG.WS_URL;
  
  infoLog('🔌 Configurando socket con URL:', SOCKET_URL);
  infoLog('🔌 Token disponible:', token ? 'Sí' : 'No');
  infoLog('🔌 Configuración de entorno:', {
    WS_URL: ENV_CONFIG.WS_URL,
    BACKEND_URL: ENV_CONFIG.BACKEND_URL,
    DEV_MODE: ENV_CONFIG.DEV_MODE
  });
  
  // NUEVO: Obtener información del usuario para incluir en la autenticación
  const userInfo = getUserInfo();
  infoLog('🔌 Información del usuario para socket:', {
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
    infoLog('✅ WebSocket: Conectado exitosamente', {
      socketId: socket.id,
      url: SOCKET_URL,
      timestamp: new Date().toISOString(),
      workspaceId: userInfo.workspaceId,
      tenantId: userInfo.tenantId,
      userId: userInfo.userId
    });
  });

  socket.on('connecting', () => {
    infoLog('🔄 WebSocket: Conectando...', {
      url: SOCKET_URL,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('connect_error', (error) => {
          infoLog('❌ WebSocket: Error de conexión', {
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
      infoLog('🔐 WebSocket: Error de autenticación - Token JWT requerido o inválido');
      infoLog('🔐 Token disponible:', token ? 'Sí' : 'No');
      if (token) {
        infoLog('🔐 Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      }
    }
    
    // NUEVO: Manejar errores específicos de workspaceId
    if (error.message.includes('workspace') || error.message.includes('tenant')) {
      infoLog('🔐 WebSocket: Error de workspace/tenant - Verificar configuración:', {
        workspaceId: userInfo.workspaceId,
        tenantId: userInfo.tenantId
      });
    }
  });

  socket.on('disconnect', (reason) => {
    infoLog('🔌 WebSocket: Desconectado', {
      reason,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnecting', (reason) => {
    infoLog('🔌 WebSocket: Desconectando...', {
      reason,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  // NUEVO: Conectar explícitamente el socket
  infoLog('🔌 Conectando socket explícitamente...');
  socket.connect();

  return socket;
}; 