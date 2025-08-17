// Configuración de entorno
export const environment = {
  // Entorno actual
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
  
  // Configuración de debug
  debug: import.meta.env.VITE_DEBUG === 'true',
  
  // Configuración de logging
  logging: {
    // Nivel de log por defecto
    level: import.meta.env.VITE_LOG_LEVEL || 'warn',
    
    // Configuración específica para clientes
    clients: {
      // Solo loggear errores críticos de clientes
      enabled: import.meta.env.VITE_LOG_CLIENTS !== 'false',
      // Nivel mínimo para logs de clientes
      level: import.meta.env.VITE_LOG_CLIENTS_LEVEL || 'error',
      // Rate limiting para logs de clientes (en minutos)
      rateLimitMinutes: parseInt(import.meta.env.VITE_LOG_CLIENTS_RATE_LIMIT || '5'),
    },
    
    // Configuración para API
    api: {
      enabled: import.meta.env.VITE_LOG_API !== 'false',
      level: import.meta.env.VITE_LOG_API_LEVEL || 'warn',
    },
    
    // Configuración para WebSocket
    websocket: {
      enabled: import.meta.env.VITE_LOG_WEBSOCKET !== 'false',
      level: import.meta.env.VITE_LOG_WEBSOCKET_LEVEL || 'warn',
    }
  },
  
  // URLs de la API
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  },
  
  // Configuración de Firebase
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },
  
  // Configuración de WebSocket
  websocket: {
    url: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000',
    reconnectInterval: parseInt(import.meta.env.VITE_WEBSOCKET_RECONNECT_INTERVAL || '5000'),
    maxReconnectAttempts: parseInt(import.meta.env.VITE_WEBSOCKET_MAX_RECONNECT_ATTEMPTS || '10'),
  }
};

// Función helper para verificar si se debe loggear algo
export const shouldLog = (category: string, level: string): boolean => {
  const config = environment.logging;
  
  // Verificar si la categoría está habilitada
  const categoryConfig = config[category as keyof typeof config];
  if (categoryConfig && !categoryConfig.enabled) {
    return false;
  }
  
  // Verificar nivel de log
  const levels = ['debug', 'info', 'warn', 'error', 'critical'];
  const currentLevelIndex = levels.indexOf(level);
  const configLevelIndex = levels.indexOf(categoryConfig?.level || config.level);
  
  return currentLevelIndex >= configLevelIndex;
};

// Configuración de entorno para WebSocket y otras funcionalidades
export const ENV_CONFIG = {
  // URLs
  WS_URL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000',
  BACKEND_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  
  // Configuración de WebSocket
  WS_TIMEOUT: parseInt(import.meta.env.VITE_WS_TIMEOUT || '45000'),
  WS_RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_WS_RETRY_ATTEMPTS || '5'),
  WS_RECONNECTION_DELAY: parseInt(import.meta.env.VITE_WS_RECONNECTION_DELAY || '1000'),
  
  // Modo de desarrollo
  DEV_MODE: import.meta.env.DEV,
  
  // Configuración de debug
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
};
