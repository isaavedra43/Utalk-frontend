// Configuración del entorno
export const ENV_CONFIG = {
  // URLs del backend
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'https://utalk-backend-production.up.railway.app',
  WS_URL: import.meta.env.VITE_WS_URL || 'wss://utalk-backend-production.up.railway.app',
  
  // Configuración de WebSocket
  WS_TIMEOUT: parseInt(import.meta.env.VITE_WS_TIMEOUT || '45000'),
  WS_RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_WS_RETRY_ATTEMPTS || '5'),
  WS_RECONNECTION_DELAY: parseInt(import.meta.env.VITE_WS_RECONNECTION_DELAY || '1000'),
  
  // Configuración de desarrollo
  DEV_MODE: import.meta.env.DEV || false,
  
  // NUEVO: Configuración de workspace y tenant
  WORKSPACE_ID: import.meta.env.VITE_WORKSPACE_ID || 'default',
  TENANT_ID: import.meta.env.VITE_TENANT_ID || 'na',
  
  // Configuración de API
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  
  // Configuración de autenticación
  AUTH_STORAGE_KEY: 'utalk_auth_tokens',
  REFRESH_TOKEN_KEY: 'utalk_refresh_token'
} as const;

// Validar configuración crítica
if (!ENV_CONFIG.BACKEND_URL) {
  console.error('❌ VITE_BACKEND_URL no está configurado');
}

if (!ENV_CONFIG.WS_URL) {
  console.error('❌ VITE_WS_URL no está configurado');
}

// Log de configuración en desarrollo
if (ENV_CONFIG.DEV_MODE) {
  console.log('🔧 Configuración del entorno:', {
    BACKEND_URL: ENV_CONFIG.BACKEND_URL,
    WS_URL: ENV_CONFIG.WS_URL,
    WORKSPACE_ID: ENV_CONFIG.WORKSPACE_ID,
    TENANT_ID: ENV_CONFIG.TENANT_ID,
    DEV_MODE: ENV_CONFIG.DEV_MODE
  });
}
