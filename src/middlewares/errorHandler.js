/**
 * Middleware de manejo de errores
 * Captura y procesa errores de toda la aplicación
 * Proporciona respuestas consistentes y logging detallado
 * Previene exposición de información sensible
 */

const logger = require('../utils/logger');
const config = require('../config');

/**
 * Generar ID único para tracking de errores
 */
const generateErrorId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Sanitizar errores para prevenir exposición de información sensible
 */
const sanitizeError = (error, isProduction) => {
  // Lista de información sensible que nunca debe exponerse
  const sensitivePatterns = [
    /password/i,
    /token/i,
    /secret/i,
    /key/i,
    /credential/i,
    /authorization/i,
    /firebase/i,
    /twilio/i,
    /auth/i,
    /private/i
  ];

  // Limpiar stack trace en producción
  if (isProduction) {
    delete error.stack;
  }

  // Limpiar mensaje si contiene información sensible
  if (error.message && sensitivePatterns.some(pattern => pattern.test(error.message))) {
    error.message = 'Internal server error';
  }

  return error;
};

/**
 * Middleware principal de manejo de errores
 * @param {Error} err - Error capturado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const errorHandler = (err, req, res, next) => {
  // Si la respuesta ya fue enviada, delegar al handler por defecto
  if (res.headersSent) {
    return next(err);
  }

  const isProduction = config.server.env === 'production';
  const errorId = generateErrorId();

  // Extraer información del error (sin datos sensibles)
  const errorInfo = {
    errorId,
    message: err.message,
    name: err.name,
    code: err.code,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    username: req.user?.username,
    timestamp: new Date().toISOString()
  };

  // Determinar el tipo de error y código de estado
  let statusCode = 500;
  let errorType = 'INTERNAL_SERVER_ERROR';
  let userMessage = 'Error interno del servidor';

  // Errores de validación Joi
  if (err.isJoi || err.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'VALIDATION_ERROR';
    userMessage = 'Datos inválidos';
    
    if (!isProduction && err.details) {
      userMessage = err.details.map(detail => detail.message).join(', ');
    }
  }

  // Errores de autenticación JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorType = 'INVALID_TOKEN';
    userMessage = 'Token de autenticación inválido';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = 'TOKEN_EXPIRED';
    userMessage = 'Token de autenticación expirado';
  }

  // Errores de autorización
  if (err.message?.includes('permission') || err.message?.includes('unauthorized')) {
    statusCode = 403;
    errorType = 'INSUFFICIENT_PERMISSIONS';
    userMessage = 'Permisos insuficientes';
  }

  // Errores de Firebase
  if (err.code && err.code.startsWith('auth/')) {
    statusCode = 401;
    errorType = 'AUTHENTICATION_ERROR';
    userMessage = 'Error de autenticación';
  }

  // Errores de Twilio
  if (err.code && typeof err.code === 'number' && err.code >= 20000) {
    statusCode = 400;
    errorType = 'EXTERNAL_SERVICE_ERROR';
    userMessage = 'Error en el servicio de mensajería';
    
    // Log específico para errores de Twilio
    logger.warn('Twilio API error', {
      errorId,
      twilioCode: err.code,
      twilioMessage: err.message,
      moreInfo: err.moreInfo
    });
  }

  // Errores de duplicado
  if (err.code === 11000 || err.message?.includes('already exists')) {
    statusCode = 409;
    errorType = 'DUPLICATE_RESOURCE';
    userMessage = 'El recurso ya existe';
  }

  // Errores de recurso no encontrado
  if (err.name === 'CastError' || err.message?.includes('not found')) {
    statusCode = 404;
    errorType = 'RESOURCE_NOT_FOUND';
    userMessage = 'Recurso no encontrado';
  }

  // Errores de rate limiting
  if (err.message?.includes('rate limit') || err.status === 429) {
    statusCode = 429;
    errorType = 'RATE_LIMIT_EXCEEDED';
    userMessage = 'Demasiadas peticiones';
  }

  // Errores de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    errorType = 'JSON_SYNTAX_ERROR';
    userMessage = 'Formato JSON inválido';
  }

  // Errores de timeout
  if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
    statusCode = 504;
    errorType = 'SERVICE_TIMEOUT';
    userMessage = 'Servicio temporalmente no disponible';
  }

  // Log completo del error (interno)
  logger.error(`Error [${errorId}]: ${err.message}`, {
    error: {
      name: err.name,
      message: err.message,
      stack: isProduction ? '[HIDDEN]' : err.stack,
      code: err.code
    },
    request: errorInfo
  });

  // Sanitizar error para respuesta pública
  const sanitizedError = sanitizeError({ ...err }, isProduction);

  // Preparar respuesta
  const errorResponse = {
    success: false,
    error: {
      type: errorType,
      message: userMessage,
      timestamp: errorInfo.timestamp,
      ...(isProduction ? {} : { 
        errorId,
        details: sanitizedError.message
      })
    }
  };

  // Logging adicional para errores críticos
  if (statusCode >= 500) {
    logger.error(`Critical error [${errorId}]`, {
      statusCode,
      errorType,
      originalError: err.message,
      request: errorInfo
    });
    
    // TODO: Enviar notificación a canal de alertas
    if (isProduction) {
      console.error(`🚨 CRITICAL ERROR [${errorId}]:`, {
        error: err.message,
        request: {
          url: req.originalUrl,
          method: req.method,
          ip: req.ip,
          userId: req.user?.id
        }
      });
    }
  }

  // Enviar respuesta
  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para manejar rutas no encontradas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Wrapper para funciones async que captura errores automáticamente
 * @param {Function} fn - Función async a envolver
 * @returns {Function} - Función envuelta
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Crear error personalizado
 * @param {string} message - Mensaje del error
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} type - Tipo de error
 * @returns {Error} - Error personalizado
 */
const createError = (message, statusCode = 500, type = 'CUSTOM_ERROR') => {
  const error = new Error(message);
  error.status = statusCode;
  error.type = type;
  return error;
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createError
}; 