// Configuración de autenticación
// Este archivo está preparado para la integración con Firebase y backend

export const AUTH_CONFIG = {
  // Firebase Configuration (se configurará en el siguiente paso)
  FIREBASE: {
    API_KEY: process.env.VITE_FIREBASE_API_KEY || '',
    AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || '',
    STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    APP_ID: process.env.VITE_FIREBASE_APP_ID || '',
  },

  // Backend Configuration
  BACKEND: {
    BASE_URL: process.env.VITE_BACKEND_URL || 'http://localhost:3000',
    ENDPOINTS: {
      LOGIN: '/api/auth/login',
      CREATE_USER: '/api/auth/create-user',
      REFRESH_TOKEN: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      PROFILE: '/api/auth/profile',
      CHANGE_PASSWORD: '/api/auth/change-password',
    },
  },

  // Token Configuration
  TOKENS: {
    ACCESS_TOKEN_KEY: 'access_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    USER_DATA_KEY: 'user',
    EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutos antes de expirar
  },

  // Social Login Providers
  SOCIAL_PROVIDERS: {
    GOOGLE: 'google',
    APPLE: 'apple',
  },

  // Validation Rules
  VALIDATION: {
    EMAIL: {
      REQUIRED: 'El email es requerido',
      INVALID: 'El email no es válido',
    },
    PASSWORD: {
      REQUIRED: 'La contraseña es requerida',
      MIN_LENGTH: 'La contraseña debe tener al menos 8 caracteres',
      WEAK: 'La contraseña es muy débil',
    },
  },

  // Error Messages
  ERRORS: {
    NETWORK: 'Error de conexión. Verifica tu internet.',
    UNAUTHORIZED: 'Credenciales inválidas',
    SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
    UNKNOWN: 'Error desconocido',
    FIREBASE: {
      USER_NOT_FOUND: 'Usuario no encontrado',
      WRONG_PASSWORD: 'Contraseña incorrecta',
      INVALID_EMAIL: 'Email inválido',
      TOO_MANY_REQUESTS: 'Demasiados intentos. Intenta más tarde.',
      USER_DISABLED: 'Usuario deshabilitado',
      WEAK_PASSWORD: 'La contraseña es muy débil',
      EMAIL_ALREADY_IN_USE: 'El email ya está en uso',
    },
  },

  // UI Configuration
  UI: {
    LOADING_TIMEOUT: 30000, // 30 segundos
    AUTO_REDIRECT_DELAY: 2000, // 2 segundos
    TYPING_TIMEOUT: 3000, // 3 segundos
  },

  // Routes
  ROUTES: {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    CHAT: '/chat',
    FORGOT_PASSWORD: '/forgot-password',
    SIGNUP: '/signup',
    UNAUTHORIZED: '/unauthorized',
  },

  // Roles
  ROLES: {
    ADMIN: 'admin',
    AGENT: 'agent',
    USER: 'user',
  },
};

// Tipos para TypeScript
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SocialLoginData {
  provider: string;
  token: string;
  user: {
    email: string;
    displayName?: string;
    photoURL?: string;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Estados de autenticación
export enum AuthStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  ERROR = 'error',
}

// Configuración para desarrollo
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// URLs de desarrollo vs producción
export const getBackendUrl = () => {
  if (isDevelopment) {
    return process.env.VITE_BACKEND_URL || 'http://localhost:3000';
  }
  return process.env.VITE_BACKEND_URL || 'https://tu-backend.railway.app';
};

// Configuración de WebSocket
export const WEBSOCKET_CONFIG = {
  URL: process.env.VITE_WEBSOCKET_URL || getBackendUrl().replace('http', 'ws'),
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000,
  HEARTBEAT_INTERVAL: 30000,
}; 