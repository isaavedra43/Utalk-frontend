// Configuración de entorno para la aplicación UTALK
export const environment = {
  // Configuración base
  NODE_ENV: import.meta.env.MODE || 'development',
  DEV: import.meta.env.DEV || false,
  PROD: import.meta.env.PROD || false,
  
  // URLs de la API
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://utalk-backend-production.up.railway.app',
  WS_BASE_URL: import.meta.env.VITE_WS_URL || 'wss://utalk-backend-production.up.railway.app',
  
  // Configuración de Firebase
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
  
  // Configuración de la aplicación
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_NAME: 'UTALK',
  
  // Configuración de desarrollo
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true' || false,
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // Configuración de Railway
  RAILWAY_ENVIRONMENT: import.meta.env.RAILWAY_ENVIRONMENT || 'development',
  PORT: import.meta.env.PORT || '5173',
  
  // Configuración de WebSocket
  WS_RECONNECT_ATTEMPTS: parseInt(import.meta.env.VITE_WS_RECONNECT_ATTEMPTS || '5'),
  WS_RECONNECT_DELAY: parseInt(import.meta.env.VITE_WS_RECONNECT_DELAY || '1000'),
  
  // Configuración de caché
  CACHE_TTL: parseInt(import.meta.env.VITE_CACHE_TTL || '300000'), // 5 minutos
  
  // Configuración de rate limiting
  RATE_LIMIT_MAX_REQUESTS: parseInt(import.meta.env.VITE_RATE_LIMIT_MAX_REQUESTS || '100'),
  RATE_LIMIT_WINDOW_MS: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW_MS || '60000'), // 1 minuto
};

// Compatibilidad: exportación esperada por código existente
export const ENV_CONFIG = {
  WS_URL: environment.WS_BASE_URL,
  BACKEND_URL: environment.API_BASE_URL,
  DEV_MODE: environment.DEV
};

// Función para validar la configuración
export const validateEnvironment = () => {
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_WS_URL',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Variables de entorno faltantes:', missingVars);
    console.warn('🔧 Usando valores por defecto para desarrollo');
  }
  
  return {
    isValid: true,
    missingVars,
    environment
  };
};

// Configuración específica para Railway
export const railwayConfig = {
  // Railway detecta automáticamente el puerto
  port: (typeof process !== 'undefined' && process.env && process.env.PORT) ? process.env.PORT : environment.PORT,
  
  // Configuración de health check
  healthCheck: {
    path: '/',
    timeout: 5000,
    interval: 30000
  },
  
  // Configuración de logs
  logging: {
    level: environment.LOG_LEVEL,
    format: 'json',
    timestamp: true
  }
};

export default environment;
