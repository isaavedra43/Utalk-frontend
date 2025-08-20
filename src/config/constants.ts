import { infoLog } from './logger';

// Configuración de la aplicación
export const APP_CONFIG = {
  name: 'UTALK',
  version: '1.0.0',
  debug: import.meta.env.VITE_DEBUG === 'true',
  devMode: import.meta.env.VITE_DEV_MODE === 'true',
  mockMode: import.meta.env.VITE_MOCK_MODE === 'true',
};

// Configuración de Firebase
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Configuración del backend
export const BACKEND_CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL,
  wsUrl: import.meta.env.VITE_WS_URL,
};

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_FILE_SIZE: {
    IMAGE: 10 * 1024 * 1024,    // 10MB
    AUDIO: 50 * 1024 * 1024,    // 50MB
    VIDEO: 100 * 1024 * 1024,   // 100MB
    DOCUMENT: 25 * 1024 * 1024, // 25MB
  },
  ALLOWED_FILE_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
    VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  },
};

// Mensajes de error
export const ERROR_MESSAGES = {
  // Autenticación
  AUTHENTICATION_FAILED: 'Error de autenticación',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  USER_NOT_FOUND: 'Usuario no encontrado',
  WRONG_PASSWORD: 'Contraseña incorrecta',
  INVALID_EMAIL: 'Email inválido',
  TOO_MANY_REQUESTS: 'Demasiados intentos. Intenta más tarde',
  USER_DISABLED: 'Usuario deshabilitado',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet',
  OPERATION_NOT_ALLOWED: 'Login con email/password no está habilitado',
  
  // Backend
  BACKEND_CONNECTION_ERROR: 'Error de conexión con el backend',
  TOKEN_INVALID: 'Token de Firebase inválido o expirado',
  ACCESS_DENIED: 'Acceso denegado. Usuario no autorizado',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde',
  
  // Archivos
  INVALID_FILE_TYPE: 'Tipo de archivo no permitido',
  FILE_TOO_LARGE: 'El archivo es demasiado grande',
  UPLOAD_FAILED: 'Error al subir el archivo',
  
  // General
  UNKNOWN_ERROR: 'Error desconocido',
  NETWORK_REQUEST_FAILED: 'Error de conexión de red',
};

// Códigos de error de Firebase
export const FIREBASE_ERROR_CODES = {
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  INVALID_EMAIL: 'auth/invalid-email',
  TOO_MANY_REQUESTS: 'auth/too-many-requests',
  USER_DISABLED: 'auth/user-disabled',
  NETWORK_REQUEST_FAILED: 'auth/network-request-failed',
  OPERATION_NOT_ALLOWED: 'auth/operation-not-allowed',
};

// Códigos de estado HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  USER: 'user',
} as const;

// Estados de autenticación
export const AUTH_STATES = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error',
} as const;

// Configuración de WebSocket
export const WEBSOCKET_CONFIG = {
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000,
  TIMEOUT: 30000,
};

// Configuración de caché
export const CACHE_CONFIG = {
  USER_PROFILE_TTL: 5 * 60 * 1000, // 5 minutos
  CONVERSATIONS_TTL: 2 * 60 * 1000, // 2 minutos
  MESSAGES_TTL: 1 * 60 * 1000, // 1 minuto
};

// Validación de configuración
export const validateAppConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validar Firebase
  if (!FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey.includes('mock')) {
    errors.push('VITE_FIREBASE_API_KEY no está configurado correctamente');
  }
  if (!FIREBASE_CONFIG.authDomain || FIREBASE_CONFIG.authDomain.includes('mock')) {
    errors.push('VITE_FIREBASE_AUTH_DOMAIN no está configurado correctamente');
  }
  if (!FIREBASE_CONFIG.projectId || FIREBASE_CONFIG.projectId.includes('mock')) {
    errors.push('VITE_FIREBASE_PROJECT_ID no está configurado correctamente');
  }

  // Validar Backend
  if (!BACKEND_CONFIG.apiUrl || BACKEND_CONFIG.apiUrl.includes('tu-backend')) {
    errors.push('VITE_API_URL o VITE_BACKEND_URL no está configurado correctamente');
  }
  if (!BACKEND_CONFIG.wsUrl || BACKEND_CONFIG.wsUrl.includes('tu-backend')) {
    errors.push('VITE_WS_URL no está configurado correctamente');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Función para mostrar errores de configuración
export const logConfigErrors = (): void => {
  const { isValid, errors } = validateAppConfig();
  
  if (!isValid) {
    console.error('❌ Errores de configuración detectados:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('🔧 Por favor, verifica tu archivo .env.development');
  } else {
    infoLog('✅ Configuración válida');
  }
}; 