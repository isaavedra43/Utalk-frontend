// Configuración de entorno para la aplicación
export const ENV_CONFIG = {
  // URLs del backend
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'https://utalk-backend-production.up.railway.app',
  WS_URL: import.meta.env.VITE_WS_URL || 'wss://utalk-backend-production.up.railway.app',
  API_URL: import.meta.env.VITE_API_URL || 'https://utalk-backend-production.up.railway.app/api',
  
  // Configuración de desarrollo
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
  
  // Configuración de WebSocket - OPTIMIZADO PARA REDUCIR TIMEOUTS
  WS_TIMEOUT: 30000, // 30 segundos para dar más tiempo al backend
  WS_RETRY_ATTEMPTS: 5, // Más intentos de reconexión
  WS_RECONNECTION_DELAY: 2000, // Más tiempo entre reconexiones
  
  // Configuración de autenticación
  AUTH_STORAGE_KEY: 'utalk_auth_tokens',
  REFRESH_TOKEN_KEY: 'utalk_refresh_token',
  
  // Configuración de rate limiting - OPTIMIZADO PARA REDUCIR PETICIONES
  RATE_LIMIT_TYPING: 1000, // Aumentado para reducir peticiones
  RATE_LIMIT_MESSAGE: 200, // Aumentado para reducir peticiones
  RATE_LIMIT_SYNC: 10000, // Aumentado para reducir peticiones
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
