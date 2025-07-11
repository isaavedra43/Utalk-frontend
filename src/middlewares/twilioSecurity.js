/**
 * Middleware de Seguridad para Twilio
 * Valida la firma de webhooks para prevenir ataques y requests no autorizados
 */

const crypto = require('crypto');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Middleware para validar la firma de Twilio webhook
 * Previene ataques de replay y requests no autorizados
 */
const validateTwilioSignature = (req, res, next) => {
  try {
    const twilioSignature = req.headers['x-twilio-signature'];
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const body = req.rawBody || '';

    if (!twilioSignature) {
      logger.warn('Twilio webhook without signature', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl
      });
      
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Missing Twilio signature'
      });
    }

    if (!config.twilio.webhookSecret) {
      logger.error('Twilio webhook secret not configured');
      return res.status(500).json({
        success: false,
        error: 'CONFIGURATION_ERROR',
        message: 'Webhook validation not properly configured'
      });
    }

    // Crear firma esperada
    const expectedSignature = crypto
      .createHmac('sha1', config.twilio.webhookSecret)
      .update(url + body)
      .digest('base64');

    const expectedSignatureHeader = `sha1=${expectedSignature}`;

    // Comparación segura para prevenir timing attacks
    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(twilioSignature),
      Buffer.from(expectedSignatureHeader)
    );

    if (!isValidSignature) {
      logger.warn('Invalid Twilio signature', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        receivedSignature: twilioSignature.substring(0, 10) + '...',
        expectedSignature: expectedSignatureHeader.substring(0, 10) + '...'
      });
      
      return res.status(403).json({
        success: false,
        error: 'INVALID_SIGNATURE',
        message: 'Invalid webhook signature'
      });
    }

    logger.debug('Twilio signature validated successfully', {
      ip: req.ip,
      url: req.originalUrl
    });

    next();
  } catch (error) {
    logger.error('Error validating Twilio signature', error, {
      ip: req.ip,
      url: req.originalUrl
    });
    
    return res.status(500).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Error validating webhook signature'
    });
  }
};

/**
 * Middleware para capturar raw body para validación de firma
 */
const captureRawBody = (req, res, next) => {
  if (req.originalUrl.includes('/webhook')) {
    let rawBody = '';
    
    req.on('data', (chunk) => {
      rawBody += chunk.toString();
    });
    
    req.on('end', () => {
      req.rawBody = rawBody;
      next();
    });
  } else {
    next();
  }
};

/**
 * Rate limiting específico para webhooks
 */
const webhookRateLimit = (req, res, next) => {
  // Implementar rate limiting específico para webhooks
  // Por ahora, permitir pero loggear frecuencia
  const ip = req.ip;
  const now = Date.now();
  
  if (!req.app.locals.webhookRequests) {
    req.app.locals.webhookRequests = new Map();
  }
  
  const requests = req.app.locals.webhookRequests.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < 60000); // último minuto
  
  if (recentRequests.length > 100) { // máximo 100 webhooks por minuto por IP
    logger.warn('Webhook rate limit exceeded', {
      ip,
      requestCount: recentRequests.length,
      timeWindow: '1 minute'
    });
    
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many webhook requests'
    });
  }
  
  recentRequests.push(now);
  req.app.locals.webhookRequests.set(ip, recentRequests);
  
  next();
};

module.exports = {
  validateTwilioSignature,
  captureRawBody,
  webhookRateLimit
}; 