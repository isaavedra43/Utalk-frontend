/**
 * Rutas de API para el canal de Twilio
 * Endpoints para webhook, envío de mensajes WhatsApp y SMS
 * Base para integración omnicanal
 */

const express = require('express');
const router = express.Router();
const twilioController = require('../../controllers/channels/twilioController');
const logger = require('../../utils/logger');
const { authenticate, authorize, requirePermission } = require('../../middlewares/auth');
const { validateTwilioSignature, webhookRateLimit } = require('../../middlewares/twilioSecurity');
const { messageRateLimit } = require('../../middlewares/rateLimiting');
const { validators, sanitizeInput } = require('../../middlewares/validation');

// Middleware para logging de requests
router.use((req, res, next) => {
  logger.info(`Twilio API: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

/**
 * POST /webhook
 * Endpoint para recibir webhooks de Twilio
 * Procesa mensajes entrantes de WhatsApp y SMS
 * PROTEGIDO - Validación de firma Twilio y rate limiting
 */
router.post('/webhook', webhookRateLimit, validateTwilioSignature, async (req, res) => {
  await twilioController.processWebhook(req, res);
});

/**
 * POST /send/whatsapp
 * Enviar mensaje por WhatsApp
 * Body: { to, message, conversationId?, mediaUrl? }
 * PROTEGIDO - Requiere autenticación, permisos y rate limiting
 */
router.post('/send/whatsapp', sanitizeInput, validators.validateSendWhatsApp, authenticate, requirePermission('messages.write'), messageRateLimit, async (req, res) => {
  await twilioController.sendWhatsAppMessage(req, res);
});

/**
 * POST /send/sms
 * Enviar mensaje por SMS
 * Body: { to, message, conversationId?, mediaUrl? }
 * PROTEGIDO - Requiere autenticación, permisos y rate limiting
 */
router.post('/send/sms', sanitizeInput, validators.validateSendSMS, authenticate, requirePermission('messages.write'), messageRateLimit, async (req, res) => {
  await twilioController.sendSMS(req, res);
});

/**
 * GET /message/:messageId/status
 * Obtener estado de un mensaje enviado
 * PROTEGIDO - Requiere autenticación y permisos
 */
router.get('/message/:messageId/status', validators.validateMessageId, authenticate, requirePermission('messages.read'), async (req, res) => {
  await twilioController.getMessageStatus(req, res);
});

/**
 * GET /health
 * Health check específico para Twilio
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    channel: 'twilio',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /webhook - Recibir mensajes',
      'POST /send/whatsapp - Enviar WhatsApp',
      'POST /send/sms - Enviar SMS',
      'GET /message/:id/status - Estado del mensaje'
    ]
  });
});

module.exports = router; 