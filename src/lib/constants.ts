/**
 * Constantes globales para UTalk Frontend
 */

// URLs del backend (se configurarán con variables de entorno)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'UTalk',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de mensajería multicanal con CRM integrado'
} as const;

// Configuración de mensajería
export const MESSAGE_CONFIG = {
  MAX_LENGTH: 4096,
  MAX_ATTACHMENTS: 10,
  MAX_FILE_SIZE_MB: 100,
  SUPPORTED_FILE_TYPES: {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    document: ['application/pdf', 'text/plain', 'application/msword']
  }
} as const;

// Estados de mensaje
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
} as const;

// Roles de usuario
export const USER_ROLES = {
  VIEWER: 'viewer',
  AGENT: 'agent',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
} as const;

// Configuración de Socket.IO
export const SOCKET_CONFIG = {
  TIMEOUT: 5000,
  RETRIES: 3,
  RETRY_DELAY: 1000,
  TYPING_DEBOUNCE: 500
} as const;

// Rate limiting
export const RATE_LIMITS = {
  TYPING_INTERVAL: 500,
  MESSAGE_INTERVAL: 100,
  JOIN_CONVERSATION_INTERVAL: 1000
} as const;
