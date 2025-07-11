/**
 * Rutas de API para el canal de Email
 * PLACEHOLDER - Listo para implementar funcionalidades de email
 * 
 * Para implementar:
 * - Recepción de emails vía webhook (SendGrid, Mailgun, etc.)
 * - Envío de emails usando SMTP o servicios como SendGrid
 * - Parsing de emails entrantes (texto, HTML, attachments)
 * - Manejo de hilos de conversación por email
 */

const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');

// Middleware para logging de requests
router.use((req, res, next) => {
  logger.info(`Email API: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

/**
 * POST /webhook/inbound
 * Endpoint para recibir emails entrantes
 * TODO: Implementar parsing de emails desde servicios como SendGrid
 */
router.post('/webhook/inbound', (req, res) => {
  res.status(501).json({
    error: 'Email inbound webhook not implemented',
    message: 'Este endpoint está preparado para recibir emails entrantes',
    supportedServices: ['SendGrid', 'Mailgun', 'Amazon SES'],
    expectedData: {
      from: 'sender@example.com',
      to: 'support@company.com',
      subject: 'Email subject',
      text: 'Plain text content',
      html: 'HTML content',
      attachments: []
    }
  });
});

/**
 * POST /send
 * Enviar email
 * TODO: Implementar envío usando SMTP o servicios de email
 */
router.post('/send', (req, res) => {
  res.status(501).json({
    error: 'Email sending not implemented',
    message: 'Este endpoint está preparado para enviar emails',
    expectedBody: {
      to: 'recipient@example.com',
      subject: 'Email subject',
      text: 'Plain text content',
      html: 'HTML content (optional)',
      conversationId: 'OPTIONAL_CONVERSATION_ID',
      attachments: []
    }
  });
});

/**
 * GET /templates
 * Obtener plantillas de email
 * TODO: Implementar gestión de plantillas
 */
router.get('/templates', (req, res) => {
  res.status(501).json({
    error: 'Email templates not implemented',
    message: 'Este endpoint está preparado para gestionar plantillas de email',
    features: [
      'Plantillas predefinidas',
      'Variables dinámicas',
      'Versiones HTML y texto',
      'Personalización por cliente'
    ]
  });
});

/**
 * GET /health
 * Health check específico para Email
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    channel: 'email',
    implementation: 'placeholder',
    timestamp: new Date().toISOString(),
    nextSteps: [
      'Configurar servicio de email (SMTP/SendGrid/Mailgun)',
      'Implementar parsing de emails entrantes',
      'Implementar envío de emails',
      'Crear sistema de plantillas',
      'Agregar soporte para attachments',
      'Implementar threading de conversaciones'
    ]
  });
});

module.exports = router; 