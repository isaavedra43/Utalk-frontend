/**
 * Frontend Configuration
 * Centralizes all environment variables and configuration settings
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  VERSION: 'v1',
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'UNIK AI',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_NODE_ENV || 'development',
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_DEMO_CREDENTIALS: import.meta.env.VITE_ENABLE_DEMO_CREDENTIALS === 'true',
  ENABLE_POLLING: import.meta.env.VITE_ENABLE_POLLING !== 'false',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  ENABLE_FILE_UPLOAD: true,
  ENABLE_MEDIA_PREVIEW: true,
} as const;

// Polling Configuration
export const POLLING_CONFIG = {
  CONVERSATIONS_INTERVAL: parseInt(import.meta.env.VITE_POLLING_INTERVAL || '5000'),
  MESSAGES_INTERVAL: parseInt(import.meta.env.VITE_MESSAGE_POLLING_INTERVAL || '3000'),
  DASHBOARD_INTERVAL: parseInt(import.meta.env.VITE_DASHBOARD_POLLING_INTERVAL || '10000'),
} as const;

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'), // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
  },
  PREVIEW_SIZE: {
    WIDTH: 300,
    HEIGHT: 200,
  },
} as const;

// UI Configuration
export const UI_CONFIG = {
  THEME: import.meta.env.VITE_THEME || 'dark',
  LANGUAGE: import.meta.env.VITE_LANGUAGE || 'es',
  TIMEZONE: import.meta.env.VITE_TIMEZONE || 'America/Mexico_City',
  SIDEBAR_WIDTH: 280,
  CHAT_PANEL_WIDTH: 320,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN_EXPIRY: 'tokenExpiry',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
} as const;

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/users/auth/login',
    LOGOUT: '/api/users/auth/logout',
    REFRESH: '/api/users/auth/refresh',
    REGISTER: '/api/users/register',
    ME: '/api/users/me',
    CHANGE_PASSWORD: '/api/users/me/password',
  },
  
  // Conversations
  CONVERSATIONS: {
    LIST: '/api/conversations',
    DETAIL: (id: string) => `/api/conversations/${id}`,
    UPDATE: (id: string) => `/api/conversations/${id}`,
    MESSAGES: (id: string) => `/api/conversations/${id}/messages`,
    SEND_MESSAGE: (id: string) => `/api/conversations/${id}/messages`,
  },
  
  // CRM
  CRM: {
    CLIENTS: '/api/crm/clients',
    CLIENT_DETAIL: (id: string) => `/api/crm/clients/${id}`,
    SEGMENTS: '/api/crm/segments',
  },
  
  // Campaigns
  CAMPAIGNS: {
    LIST: '/api/campaigns/campaigns',
    DETAIL: (id: string) => `/api/campaigns/campaigns/${id}`,
    CREATE: '/api/campaigns/campaigns',
    UPDATE: (id: string) => `/api/campaigns/campaigns/${id}`,
    DELETE: (id: string) => `/api/campaigns/campaigns/${id}`,
    SEND: (id: string) => `/api/campaigns/campaigns/${id}/send`,
  },
  
  // Dashboard
  DASHBOARD: {
    OVERVIEW: '/api/dashboard/overview',
    AGENTS: '/api/dashboard/agents',
    REALTIME: '/api/dashboard/realtime',
  },
  
  // Channels
  CHANNELS: {
    TWILIO: {
      SEND_WHATSAPP: '/api/channels/twilio/send/whatsapp',
      SEND_SMS: '/api/channels/twilio/send/sms',
      MESSAGE_STATUS: (id: string) => `/api/channels/twilio/message/${id}/status`,
    },
    EMAIL: {
      SEND: '/api/channels/email/send',
      WEBHOOK: '/api/channels/email/webhook/inbound',
    },
    FACEBOOK: {
      SEND: '/api/channels/facebook/send',
      WEBHOOK: '/api/channels/facebook/webhook',
    },
    WEBCHAT: {
      START_SESSION: '/api/channels/webchat/session/start',
      SEND_MESSAGE: '/api/channels/webchat/message/send',
      CONFIG: '/api/channels/webchat/widget/config',
    },
  },
  
  // Media
  MEDIA: {
    UPLOAD: '/api/media/upload',
    DOWNLOAD: (id: string) => `/api/media/${id}`,
  },
  
  // Settings
  SETTINGS: {
    CHANNELS: '/api/settings/channels',
    NOTIFICATIONS: '/api/settings/notifications',
    INTEGRATIONS: '/api/settings/integrations',
    SYSTEM: '/api/settings/system',
  },
  
  // Health
  HEALTH: '/health',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  VALIDATION_ERROR: 'Los datos ingresados no son válidos.',
  SERVER_ERROR: 'Error interno del servidor. Intenta nuevamente más tarde.',
  FILE_TOO_LARGE: `El archivo es demasiado grande. Máximo ${FILE_CONFIG.MAX_SIZE / 1024 / 1024}MB.`,
  FILE_TYPE_NOT_ALLOWED: 'Tipo de archivo no permitido.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Sesión iniciada correctamente.',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente.',
  MESSAGE_SENT: 'Mensaje enviado correctamente.',
  FILE_UPLOADED: 'Archivo subido correctamente.',
  SETTINGS_SAVED: 'Configuración guardada correctamente.',
  CAMPAIGN_SENT: 'Campaña enviada correctamente.',
  PROFILE_UPDATED: 'Perfil actualizado correctamente.',
} as const;

// Validation Rules
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD: {
    MIN_LENGTH: 6,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  TIME_ONLY: 'HH:mm',
} as const;

// Development Configuration
export const DEV_CONFIG = {
  ENABLE_LOGGING: import.meta.env.VITE_DEBUG === 'true',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  MOCK_DELAY: 1000, // Simulated API delay in development
} as const;

// Export all configuration
export const CONFIG = {
  API: API_CONFIG,
  APP: APP_CONFIG,
  FEATURES,
  POLLING: POLLING_CONFIG,
  FILE: FILE_CONFIG,
  UI: UI_CONFIG,
  STORAGE: STORAGE_KEYS,
  ENDPOINTS,
  ERRORS: ERROR_MESSAGES,
  SUCCESS: SUCCESS_MESSAGES,
  VALIDATION,
  DATE: DATE_FORMATS,
  DEV: DEV_CONFIG,
} as const;

export default CONFIG; 