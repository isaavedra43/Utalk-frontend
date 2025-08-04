/**
 * Constantes globales para UTalk Frontend
 */

// URLs del backend (validadas desde env.ts)
export { API_BASE_URL, WS_BASE_URL } from './env.js';

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
  },
  TYPING_TIMEOUT: 3000, // ms
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000 // ms
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

// Canales de comunicación
export const CHANNELS = {
  INTERNAL: 'internal',
  WHATSAPP: 'whatsapp',
  SMS: 'sms',
  EMAIL: 'email',
  WEBCHAT: 'webchat'
} as const;

// Configuración de UI
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 280,
  CHAT_INPUT_MAX_HEIGHT: 120,
  MESSAGE_BUBBLE_MAX_WIDTH: 600,
  TOAST_DURATION: 4000,
  DEBOUNCE_SEARCH: 300
} as const;
