/**
 * Rutas de API para el canal de Facebook Messenger
 * PLACEHOLDER - Listo para implementar funcionalidades de Facebook
 * 
 * Para implementar:
 * - Webhook de Facebook para recibir mensajes
 * - Envío de mensajes por Messenger
 * - Validación de tokens de verificación
 * - Manejo de diferentes tipos de eventos de Facebook
 */

const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');

// Middleware para logging de requests
router.use((req, res, next) => {
  logger.info(`Facebook API: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

/**
 * GET /webhook
 * Verificación de webhook de Facebook (challenge)
 * TODO: Implementar validación con FACEBOOK_VERIFY_TOKEN
 */
router.get('/webhook', (req, res) => {
  res.status(501).json({
    error: 'Facebook webhook verification not implemented',
    message: 'Este endpoint está preparado para implementar la verificación de webhook de Facebook',
    requiredParams: ['hub.mode', 'hub.verify_token', 'hub.challenge']
  });
});

/**
 * POST /webhook
 * Endpoint para recibir webhooks de Facebook Messenger
 * TODO: Implementar procesamiento de mensajes entrantes
 */
router.post('/webhook', (req, res) => {
  res.status(501).json({
    error: 'Facebook webhook processing not implemented',
    message: 'Este endpoint está preparado para procesar mensajes de Facebook Messenger',
    expectedFormat: {
      object: 'page',
      entry: [
        {
          messaging: [
            {
              sender: { id: 'PSID' },
              recipient: { id: 'PAGE_ID' },
              timestamp: 'TIMESTAMP',
              message: { text: 'MESSAGE_TEXT' }
            }
          ]
        }
      ]
    }
  });
});

/**
 * POST /send
 * Enviar mensaje por Facebook Messenger
 * TODO: Implementar envío usando Facebook Send API
 */
router.post('/send', (req, res) => {
  res.status(501).json({
    error: 'Facebook message sending not implemented',
    message: 'Este endpoint está preparado para enviar mensajes por Facebook Messenger',
    expectedBody: {
      psid: 'RECIPIENT_PSID',
      message: 'MESSAGE_TEXT',
      conversationId: 'OPTIONAL_CONVERSATION_ID'
    }
  });
});

/**
 * GET /health
 * Health check específico para Facebook
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    channel: 'facebook',
    implementation: 'placeholder',
    timestamp: new Date().toISOString(),
    nextSteps: [
      'Configurar Facebook App y Page Access Token',
      'Implementar webhook verification',
      'Implementar procesamiento de mensajes entrantes',
      'Implementar envío de mensajes',
      'Agregar soporte para attachments y quick replies'
    ]
  });
});

module.exports = router; 