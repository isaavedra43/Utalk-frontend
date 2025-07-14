/**
 * Frontend Configuration
 * Centralized configuration for the React application
 * FULLSTACK MONOREPO: Configuración simplificada para rutas relativas
 */

export const config = {
  api: {
    // En desarrollo: Vite proxy maneja /api -> localhost:3000
    // En producción: rutas relativas al mismo dominio
    BASE_URL: import.meta.env.DEV && import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL 
      : '',
    TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  },
  
  app: {
    NAME: import.meta.env.VITE_APP_NAME || 'UNIK AI',
    VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    ENVIRONMENT: import.meta.env.MODE || 'development',
  },
  
  features: {
    ENABLE_DEMO_CREDENTIALS: import.meta.env.VITE_ENABLE_DEMO_CREDENTIALS === 'true',
    ENABLE_POLLING: import.meta.env.VITE_ENABLE_POLLING !== 'false',
    ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  },
  
  polling: {
    CONVERSATIONS_INTERVAL: parseInt(import.meta.env.VITE_POLLING_INTERVAL || '5000'),
    MESSAGES_INTERVAL: parseInt(import.meta.env.VITE_MESSAGE_POLLING_INTERVAL || '3000'),
    DASHBOARD_INTERVAL: parseInt(import.meta.env.VITE_DASHBOARD_POLLING_INTERVAL || '10000'),
  },
  
  uploads: {
    MAX_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'), // 10MB
    ALLOWED_TYPES: [
      // Imágenes
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      // Documentos
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv',
      // Audio
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
      // Video (tamaños pequeños)
      'video/mp4', 'video/mpeg'
    ]
  },
  
  ui: {
    THEME: import.meta.env.VITE_THEME || 'dark',
    LANGUAGE: import.meta.env.VITE_LANGUAGE || 'es',
    TIMEZONE: import.meta.env.VITE_TIMEZONE || 'America/Mexico_City',
  },
  
  // Storage Keys
  storage: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    TOKEN_EXPIRY: 'tokenExpiry',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language',
    SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  },
  
  // API Endpoints
  endpoints: {
    // Authentication
    auth: {
      LOGIN: '/api/users/auth/login',
      LOGOUT: '/api/users/auth/logout',
      REFRESH: '/api/users/auth/refresh',
      REGISTER: '/api/users/register',
      ME: '/api/users/me',
      CHANGE_PASSWORD: '/api/users/me/password',
    },
    
    // Conversations
    conversations: {
      LIST: '/api/conversations',
      DETAIL: (id: string) => `/api/conversations/${id}`,
      UPDATE: (id: string) => `/api/conversations/${id}`,
      MESSAGES: (id: string) => `/api/conversations/${id}/messages`,
      SEND_MESSAGE: (id: string) => `/api/conversations/${id}/messages`,
    },
    
    // CRM
    crm: {
      CLIENTS: '/api/crm/clients',
      CLIENT_DETAIL: (id: string) => `/api/crm/clients/${id}`,
      SEGMENTS: '/api/crm/segments',
    },
    
    // Campaigns
    campaigns: {
      LIST: '/api/campaigns/campaigns',
      DETAIL: (id: string) => `/api/campaigns/campaigns/${id}`,
      CREATE: '/api/campaigns/campaigns',
      UPDATE: (id: string) => `/api/campaigns/campaigns/${id}`,
      DELETE: (id: string) => `/api/campaigns/campaigns/${id}`,
      SEND: (id: string) => `/api/campaigns/campaigns/${id}/send`,
    },
    
    // Dashboard
    dashboard: {
      OVERVIEW: '/api/dashboard/overview',
      AGENTS: '/api/dashboard/agents',
      REALTIME: '/api/dashboard/realtime',
    },
    
    // Channels
    channels: {
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
    media: {
      UPLOAD: '/api/media/upload',
      DOWNLOAD: (id: string) => `/api/media/${id}`,
    },
    
    // Settings
    settings: {
      CHANNELS: '/api/settings/channels',
      NOTIFICATIONS: '/api/settings/notifications',
      INTEGRATIONS: '/api/settings/integrations',
      SYSTEM: '/api/settings/system',
    },
    
    // Health
    health: '/health',
  },
  
  // Error Messages
  errorMessages: {
    NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
    UNAUTHORIZED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    FORBIDDEN: 'No tienes permisos para acceder a este recurso.',
    NOT_FOUND: 'El recurso solicitado no fue encontrado.',
    TIMEOUT: 'La solicitud ha tardado demasiado tiempo.',
    VALIDATION_ERROR: 'Los datos ingresados no son válidos.',
    SERVER_ERROR: 'Error interno del servidor. Intenta nuevamente más tarde.',
    FILE_TOO_LARGE: 'El archivo es demasiado grande. Máximo 10MB.',
    FILE_TYPE_NOT_ALLOWED: 'Tipo de archivo no permitido.',
    UNKNOWN_ERROR: 'Ha ocurrido un error inesperado.',
  },
  
  // Success Messages
  successMessages: {
    LOGIN_SUCCESS: 'Sesión iniciada correctamente.',
    LOGOUT_SUCCESS: 'Sesión cerrada correctamente.',
    MESSAGE_SENT: 'Mensaje enviado correctamente.',
    FILE_UPLOADED: 'Archivo subido correctamente.',
    SETTINGS_SAVED: 'Configuración guardada correctamente.',
    CAMPAIGN_SENT: 'Campaña enviada correctamente.',
    PROFILE_UPDATED: 'Perfil actualizado correctamente.',
  },
  
  // Validation Rules
  validation: {
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
  },
  
  // Date Formats
  dateFormats: {
    DISPLAY: 'DD/MM/YYYY',
    DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
    API: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    TIME_ONLY: 'HH:mm',
  },
  
  // Development Configuration
  dev: {
    ENABLE_LOGGING: import.meta.env.VITE_DEBUG === 'true',
    LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
    MOCK_DELAY: 1000, // Simulated API delay in development
  },
} as const;

export default config; 