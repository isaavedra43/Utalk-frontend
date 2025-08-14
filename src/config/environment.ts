// Configuración de entorno para la aplicación
export const ENV_CONFIG = {
  // URLs del backend
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'https://utalk-backend-production.up.railway.app',
  WS_URL: import.meta.env.VITE_WS_URL || 'wss://utalk-backend-production.up.railway.app',
  API_URL: import.meta.env.VITE_API_URL || 'https://utalk-backend-production.up.railway.app/api',
  
  // Configuración de desarrollo
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
  
  // Configuración de WebSocket
  WS_TIMEOUT: 15000, // 15 segundos
  WS_RETRY_ATTEMPTS: 3,
  WS_RECONNECTION_DELAY: 1000,
  
  // Configuración de autenticación
  AUTH_STORAGE_KEY: 'utalk_auth_tokens',
  REFRESH_TOKEN_KEY: 'utalk_refresh_token',
  
  // Configuración de rate limiting
  RATE_LIMIT_TYPING: 500,
  RATE_LIMIT_MESSAGE: 100,
  RATE_LIMIT_SYNC: 5000,
} as const;

// Función para validar configuración
export const validateEnvironment = () => {
  const required = ['BACKEND_URL', 'WS_URL'];
  const missing = required.filter(key => !ENV_CONFIG[key as keyof typeof ENV_CONFIG]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Variables de entorno faltantes:', missing);
    console.warn('⚠️ Usando valores por defecto');
  }
  
  console.log('🔧 Configuración de entorno cargada:', {
    BACKEND_URL: ENV_CONFIG.BACKEND_URL,
    WS_URL: ENV_CONFIG.WS_URL,
    DEV_MODE: ENV_CONFIG.DEV_MODE
  });
};

// Validar al cargar el módulo
validateEnvironment();
