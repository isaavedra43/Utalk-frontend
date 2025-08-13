// Configuración de variables de entorno - Extraído de PLAN_FRONTEND_UTALK_COMPLETO.md
export const environment = {
  // URLs de API y Socket - Documento sección "Configuración de Entornos"
  API_URL: import.meta.env['VITE_API_URL'] || 'https://utalk-backend-production.up.railway.app/api',
  SOCKET_URL:
    import.meta.env['VITE_SOCKET_URL'] || 'https://utalk-backend-production.up.railway.app',

  // Credenciales de prueba - Documento sección "Configuración de Entornos"
  TEST_CREDENTIALS: {
    email: 'admin@company.com',
    password: '123456'
  },

  // Límites de validación - Documento sección "Validaciones y Reglas de Negocio"
  VALIDATION_LIMITS: {
    MESSAGE_MAX_LENGTH: 4096, // bytes, no caracteres
    MAX_FILES_PER_MESSAGE: 10,
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    TYPING_DEBOUNCE: 500, // ms
    MAX_RECONNECT_ATTEMPTS: 5
  },

  // Tipos de archivo permitidos - Documento sección "Validaciones y Reglas de Negocio"
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'audio/mp3',
    'audio/ogg',
    'audio/wav',
    'video/mp4',
    'video/webm',
    'application/pdf'
  ],

  // Extensiones bloqueadas - Documento sección "Validaciones y Reglas de Negocio"
  BLOCKED_EXTENSIONS: ['.exe', '.js', '.bat', '.cmd'],

  // Regex de validación de teléfono - Documento sección "Validaciones y Reglas de Negocio"
  PHONE_REGEX: /^\+[1-9]\d{1,14}$/,

  // Headers de autorización - Documento sección "Headers de Autorización Específicos"
  AUTH_HEADERS: {
    AUTHORIZATION: 'Authorization',
    BEARER_PREFIX: 'Bearer '
  }
};
