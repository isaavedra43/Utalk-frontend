// Configuración de la aplicación
export const APP_CONFIG = {
  // Límites de archivos
  MAX_FILE_SIZE: {
    IMAGE: 10 * 1024 * 1024, // 10MB
    AUDIO: 50 * 1024 * 1024, // 50MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    DOCUMENT: 25 * 1024 * 1024, // 25MB
  },
  
  // Tipos de archivo permitidos
  ALLOWED_FILE_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    AUDIO: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
    VIDEO: ['video/mp4', 'video/avi', 'video/mov', 'video/webm'],
    DOCUMENT: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  },
  
  // Configuración de grabación de audio
  AUDIO_RECORDING: {
    MAX_DURATION: 300, // 5 minutos en segundos
    SAMPLE_RATE: 44100,
    CHANNELS: 1
  },
  
  // Configuración de WebSocket
  WEBSOCKET: {
    RECONNECTION_ATTEMPTS: 5,
    RECONNECTION_DELAY: 1000,
    TIMEOUT: 30000
  },
  
  // Configuración de paginación
  PAGINATION: {
    MESSAGES_PER_PAGE: 50,
    CONVERSATIONS_PER_PAGE: 20,
    CONTACTS_PER_PAGE: 20
  }
};

// Mensajes de error
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'El archivo es demasiado grande',
  INVALID_FILE_TYPE: 'Tipo de archivo no válido',
  UPLOAD_FAILED: 'Error al subir el archivo',
  AUDIO_RECORDING_FAILED: 'Error al grabar audio',
  LOCATION_ACCESS_DENIED: 'Acceso a ubicación denegado',
  NETWORK_ERROR: 'Error de conexión',
  UNAUTHORIZED: 'No autorizado',
  SERVER_ERROR: 'Error del servidor'
};

// Estados de mensaje
export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
} as const;

// Tipos de mensaje
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  DOCUMENT: 'document',
  LOCATION: 'location',
  AUDIO: 'audio',
  VOICE: 'voice',
  VIDEO: 'video',
  STICKER: 'sticker'
} as const; 