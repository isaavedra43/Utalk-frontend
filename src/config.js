/**
 * Configuración principal del servidor
 * Variables de entorno y configuraciones de producción/desarrollo
 * ENTERPRISE: Validación robusta y alertas de configuración
 */

const path = require('path');

// Función para validar y parsear CORS origins
function validateCorsOrigins() {
  const corsOrigin = process.env.CORS_ORIGIN;
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  if (!corsOrigin && nodeEnv === 'production') {
    console.warn('🚨 CORS_ORIGIN no configurado en producción. Usando configuración restrictiva.');
    return [];
  }
  
  if (corsOrigin) {
    const origins = corsOrigin.split(',').map(origin => origin.trim()).filter(Boolean);
    
    // Validar formato de origins
    const invalidOrigins = origins.filter(origin => {
      try {
        new URL(origin);
        return false;
      } catch {
        return !origin.includes('localhost') && !origin.includes('127.0.0.1');
      }
    });
    
    if (invalidOrigins.length > 0) {
      console.error(`🚨 CORS origins inválidos detectados: ${invalidOrigins.join(', ')}`);
      if (nodeEnv === 'production') {
        throw new Error(`Invalid CORS origins in production: ${invalidOrigins.join(', ')}`);
      }
    }
    
    console.info(`🔒 CORS configurado para: ${origins.join(', ')}`);
    return origins;
  }
  
  // Desarrollo: origins por defecto
  const defaultDevOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080'
  ];
  
  console.info(`🔧 CORS desarrollo: ${defaultDevOrigins.join(', ')}`);
  return defaultDevOrigins;
}

// Configuración principal
const config = {
  // Configuración del servidor
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    cors: {
      origin: function (origin, callback) {
        // FULLSTACK MODE: Si no hay origin (same-origin requests), permitir siempre
        if (!origin) {
          return callback(null, true);
        }

        const allowedOrigins = validateCorsOrigins();
        
        // Verificar si el origin está permitido
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          // Log detallado para debugging
          const logLevel = process.env.NODE_ENV === 'development' ? 'warn' : 'error';
          console[logLevel](`🚫 CORS: Origin '${origin}' rechazado. Permitidos: ${allowedOrigins.join(', ')}`);
          
          const error = new Error(`CORS policy violation: Origin '${origin}' not allowed`);
          error.statusCode = 403;
          callback(error);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cache-Control',
        'X-File-Name',
        'X-API-Key',
        'If-Match',
        'If-None-Match'
      ],
      exposedHeaders: [
        'X-RateLimit-Limit', 
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-Total-Count',
        'ETag',
        'Last-Modified'
      ],
      maxAge: 86400, // 24 horas
      preflightContinue: false,
      optionsSuccessStatus: 204
    }
  },

  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRY || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'omnichannel-backend',
    audience: process.env.JWT_AUDIENCE || 'omnichannel-users'
  },

  // Configuración de base de datos
  database: {
    uri: process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/omnichannel',
    options: {
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
      serverSelectionTimeoutMS: parseInt(process.env.DB_TIMEOUT) || 5000,
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
    }
  },

  // Configuración de Firebase
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    databaseURL: process.env.FIREBASE_DATABASE_URL
  },

  // Configuración de Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    webhookSecret: process.env.TWILIO_WEBHOOK_SECRET,
    statusCallbackUrl: process.env.TWILIO_STATUS_CALLBACK_URL
  },

  // Configuración de seguridad
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET,
    trustProxy: process.env.TRUST_PROXY === 'true',
    rateLimiting: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 min
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      apiMaxRequests: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100,
      authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 10
    }
  },

  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_TO_FILE === 'true',
    directory: process.env.LOG_DIRECTORY || path.join(__dirname, '../logs')
  },

  // Configuración de uploads
  uploads: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx,txt,csv').split(','),
    destination: process.env.UPLOAD_DESTINATION || path.join(__dirname, '../uploads'),
    tempDirectory: process.env.TEMP_DIRECTORY || path.join(__dirname, '../temp')
  },

  // URLs y endpoints externos
  external: {
    webhookBaseUrl: process.env.WEBHOOK_BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
    frontendUrl: process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 3000}`,
    apiVersion: process.env.API_VERSION || 'v1'
  }
};

// Validación de configuración crítica en startup
function validateCriticalConfig() {
  const errors = [];
  const warnings = [];

  // Validar secrets en producción
  if (config.server.env === 'production') {
    if (!config.jwt.secret || config.jwt.secret.length < 32) {
      errors.push('JWT_SECRET debe ser de al menos 32 caracteres en producción');
    }
    
    if (!config.jwt.refreshSecret || config.jwt.refreshSecret.length < 32) {
      errors.push('JWT_REFRESH_SECRET debe ser de al menos 32 caracteres en producción');
    }
    
    if (!config.security.sessionSecret || config.security.sessionSecret.length < 32) {
      errors.push('SESSION_SECRET debe ser de al menos 32 caracteres en producción');
    }
  }

  // Validar configuración de Firebase
  if (config.firebase.projectId && (!config.firebase.privateKey || !config.firebase.clientEmail)) {
    warnings.push('Firebase configuración incompleta: faltan privateKey o clientEmail');
  }

  // Validar configuración de Twilio
  if (config.twilio.accountSid && (!config.twilio.authToken || !config.twilio.phoneNumber)) {
    warnings.push('Twilio configuración incompleta: faltan authToken o phoneNumber');
  }

  // Reportar errores y warnings
  if (errors.length > 0) {
    console.error('🚨 Errores críticos de configuración:');
    errors.forEach(error => console.error(`  - ${error}`));
    if (config.server.env === 'production') {
      throw new Error(`Critical configuration errors: ${errors.join(', ')}`);
    }
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Advertencias de configuración:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
}

// Ejecutar validación al cargar módulo
try {
  validateCriticalConfig();
  console.info('✅ Configuración validada exitosamente');
} catch (error) {
  console.error(`💥 Error en validación de configuración: ${error.message}`);
  if (config.server.env === 'production') {
    process.exit(1);
  }
}

module.exports = config; 