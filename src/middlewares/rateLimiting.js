/**
 * Middleware de Rate Limiting
 * Protege endpoints críticos contra ataques de fuerza bruta, DoS y abuso
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const logger = require('../utils/logger');

/**
 * Rate limiter estricto para login y autenticación
 * Previene ataques de fuerza bruta
 */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP por ventana
  skipSuccessfulRequests: true, // no contar requests exitosos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_AUTH_ATTEMPTS',
    message: 'Too many authentication attempts. Try again in 15 minutes.',
    retryAfter: 15 * 60
  },
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Too many authentication attempts. Try again in 15 minutes.',
      retryAfter: 15 * 60
    });
  }
});

/**
 * Rate limiter para envío de mensajes
 * Previene spam y abuso del sistema de mensajería
 */
const messageRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // máximo 30 mensajes por minuto por usuario
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Rate limit por usuario autenticado, no por IP
    return req.user ? req.user.id : req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'MESSAGE_RATE_LIMIT_EXCEEDED',
    message: 'Too many messages sent. Please wait before sending more.',
    retryAfter: 60
  },
  handler: (req, res) => {
    logger.warn('Message rate limit exceeded', {
      userId: req.user?.id,
      username: req.user?.username,
      ip: req.ip,
      url: req.originalUrl
    });
    
    res.status(429).json({
      success: false,
      error: 'MESSAGE_RATE_LIMIT_EXCEEDED',
      message: 'Too many messages sent. Please wait before sending more.',
      retryAfter: 60
    });
  }
});

/**
 * Rate limiter general para API
 * Protección básica contra abuso general
 */
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por IP por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
    retryAfter: 15 * 60
  },
  handler: (req, res) => {
    logger.warn('General rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      retryAfter: 15 * 60
    });
  }
});

/**
 * Rate limiter para webhooks
 * Protege contra spam de webhooks maliciosos
 */
const webhookRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // máximo 100 webhooks por minuto por IP
  standardHeaders: false, // no revelar límites en webhooks
  legacyHeaders: false,
  message: {
    success: false,
    error: 'WEBHOOK_RATE_LIMIT_EXCEEDED',
    message: 'Too many webhook requests'
  },
  handler: (req, res) => {
    logger.warn('Webhook rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl
    });
    
    res.status(429).json({
      success: false,
      error: 'WEBHOOK_RATE_LIMIT_EXCEEDED',
      message: 'Too many webhook requests'
    });
  }
});

/**
 * Slow down middleware para login
 * Ralentiza requests después de cierto número de intentos
 */
const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 2, // después de 2 requests, empezar a ralentizar
  delayMs: 500, // incrementar delay en 500ms por request
  maxDelayMs: 20000, // máximo delay de 20 segundos
  skipSuccessfulRequests: true,
  onLimitReached: (req, res, options) => {
    logger.warn('Auth slow down activated', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      delayMs: options.delay
    });
  }
});

/**
 * Rate limiter para registro de usuarios
 * Previene creación masiva de cuentas
 */
const registrationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros por IP por hora
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
    message: 'Too many registration attempts. Try again in 1 hour.',
    retryAfter: 60 * 60
  },
  handler: (req, res) => {
    logger.warn('Registration rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestedUsername: req.body?.username,
      requestedEmail: req.body?.email
    });
    
    res.status(429).json({
      success: false,
      error: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
      message: 'Too many registration attempts. Try again in 1 hour.',
      retryAfter: 60 * 60
    });
  }
});

/**
 * Rate limiter para endpoints de administración
 * Protección extra para operaciones sensibles
 */
const adminRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 50, // máximo 50 operaciones admin por ventana
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'ADMIN_RATE_LIMIT_EXCEEDED',
    message: 'Too many administrative operations. Please wait.',
    retryAfter: 5 * 60
  },
  handler: (req, res) => {
    logger.warn('Admin rate limit exceeded', {
      userId: req.user?.id,
      username: req.user?.username,
      ip: req.ip,
      url: req.originalUrl,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: 'ADMIN_RATE_LIMIT_EXCEEDED',
      message: 'Too many administrative operations. Please wait.',
      retryAfter: 5 * 60
    });
  }
});

/**
 * Crear rate limiter personalizado
 */
const createCustomRateLimit = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || ((req) => req.ip),
    message: {
      success: false,
      error: options.errorCode || 'RATE_LIMIT_EXCEEDED',
      message: options.message || 'Too many requests',
      retryAfter: Math.floor(options.windowMs / 1000)
    },
    handler: (req, res) => {
      logger.warn(`Custom rate limit exceeded: ${options.name}`, {
        ip: req.ip,
        userId: req.user?.id,
        url: req.originalUrl,
        method: req.method
      });
      
      res.status(429).json({
        success: false,
        error: options.errorCode || 'RATE_LIMIT_EXCEEDED',
        message: options.message || 'Too many requests',
        retryAfter: Math.floor(options.windowMs / 1000)
      });
    }
  });
};

module.exports = {
  authRateLimit,
  authSlowDown,
  messageRateLimit,
  generalRateLimit,
  webhookRateLimit,
  registrationRateLimit,
  adminRateLimit,
  createCustomRateLimit
}; 