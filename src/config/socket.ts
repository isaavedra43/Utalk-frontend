import { io } from 'socket.io-client';
import { ENV_CONFIG } from './environment';
import { getUserInfo } from '../utils/jwtUtils';

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
    // ALINEADO: Timeout personalizable para login (mínimo 45 segundos para coincidir con backend)
    timeout: Math.max(options?.timeout || SOCKET_CONFIG.timeout, 45000)
  };
  
  const socket = io(SOCKET_URL, {
    ...socketConfig,
    // CORREGIDO: Usar auth.token y también Authorization header
    auth: {
      token: token,
      // NUEVO: Incluir workspaceId y tenantId en la autenticación
      workspaceId: userInfo.workspaceId,
      tenantId: userInfo.tenantId,
      userId: userInfo.userId,
      email: userInfo.email
    },
    extraHeaders: {
      'Authorization': `Bearer ${token}`,
      // NUEVO: Headers adicionales para workspaceId y tenantId
      'X-Workspace-ID': userInfo.workspaceId,
      'X-Tenant-ID': userInfo.tenantId,
      'X-User-ID': userInfo.userId || '',
      'X-User-Email': userInfo.email || ''
    },
    path: '/socket.io/', // Asegurar que use el path correcto
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

  return socket;
}; 