/**
 * Rate Limiting Middleware
 * Configuración diferenciada por tipo de endpoint
 * Protección contra ataques de denegación de servicio
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const logger = require('../utils/logger');

// Configuración base de rate limiting
const createRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, URL: ${req.originalUrl}`);
      res.status(429).json({
        success: false,
        error: {
          type: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil(options.windowMs / 1000),
          timestamp: new Date().toISOString()
        }
      });
    },
    skip: (req) => {
      // Skip rate limiting para health checks en desarrollo
      if (process.env.NODE_ENV === 'development' && req.path === '/health') {
        return true;
      }
      return false;
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Rate limiting general para frontend y assets
const generalRateLimit = createRateLimit({
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Más permisivo para frontend
  message: 'Too many requests from this IP for frontend resources'
});

// Rate limiting estricto para APIs
const apiRateLimit = createRateLimit({
  max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100, // Más restrictivo para APIs
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  message: 'Too many API requests from this IP'
});

// Rate limiting muy estricto para autenticación
const authRateLimit = createRateLimit({
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 10,
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  message: 'Too many authentication attempts from this IP'
});

// Rate limiting para uploads
const uploadRateLimit = createRateLimit({
  max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX_REQUESTS) || 20,
  windowMs: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 hora
  message: 'Too many upload attempts from this IP'
});

module.exports = {
  generalRateLimit,
  apiRateLimit,
  authRateLimit,
  uploadRateLimit
}; 