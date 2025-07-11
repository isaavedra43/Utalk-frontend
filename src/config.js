/**
 * Configuración general del sistema
 * Centraliza todas las variables de entorno y configuraciones
 * para facilitar el mantenimiento y la escalabilidad
 */

require('dotenv').config();

module.exports = {
  // Configuración del servidor
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    cors: {
      origin: function (origin, callback) {
        // Lista de orígenes permitidos
        const allowedOrigins = process.env.CORS_ORIGIN 
          ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
          : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'];
        
        // Permitir requests sin origin (mobile apps, Postman, etc.) solo en desarrollo
        if (!origin && process.env.NODE_ENV === 'development') {
          return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
      maxAge: 86400 // 24 horas
    }
  },

  // Configuración de Firebase
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    databaseURL: process.env.FIREBASE_DATABASE_URL
  },

  // Configuración de Twilio (WhatsApp)
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    webhookSecret: process.env.TWILIO_WEBHOOK_SECRET
  },

  // Configuración para futuros canales
  channels: {
    facebook: {
      pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      verifyToken: process.env.FACEBOOK_VERIFY_TOKEN,
      appSecret: process.env.FACEBOOK_APP_SECRET
    },
    email: {
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT,
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS
    }
  },

  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log'
  },

  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: process.env.JWT_ISSUER || 'omnichannel-backend',
    audience: process.env.JWT_AUDIENCE || 'omnichannel-users',
    
    // Configuración de refresh tokens
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d'
  },

  // Configuración de seguridad
  security: {
    webhookSecret: process.env.WEBHOOK_SECRET || 'your-webhook-secret-key',
    rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutos
    rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || 100
  }
}; 