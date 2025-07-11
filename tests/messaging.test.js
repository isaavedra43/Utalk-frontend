/**
 * Tests de Mensajería
 * Pruebas completas del sistema de mensajería Twilio
 */

const request = require('supertest');
require('./setup');

const app = require('../src/app');

describe('Sistema de Mensajería', () => {
  let testUser, testAdmin, userToken, adminToken;

  beforeEach(() => {
    testUser = global.testUtils.createTestUser();
    testAdmin = global.testUtils.createTestAdmin();
    userToken = global.testUtils.generateTestToken(testUser);
    adminToken = global.testUtils.generateTestToken(testAdmin);

    jest.clearAllMocks();
  });

  describe('POST /api/channels/twilio/webhook', () => {
    it('debe procesar webhook válido de WhatsApp', async () => {
      const webhookPayload = global.testUtils.createTwilioWebhookPayload();
      const url = 'http://localhost:3000/api/channels/twilio/webhook';
      const signature = global.testUtils.createTwilioSignature(url, webhookPayload);

      // Mock del controlador
      const twilioController = require('../src/controllers/channels/twilioController');
      twilioController.processWebhook = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'processed-message-id'
      });

      const response = await request(app)
        .post('/api/channels/twilio/webhook')
        .set('X-Twilio-Signature', signature)
        .send(webhookPayload);

      expect(response.status).toBe(200);
      expect(twilioController.processWebhook).toHaveBeenCalled();
    });

    it('debe rechazar webhook sin firma válida', async () => {
      const webhookPayload = global.testUtils.createTwilioWebhookPayload();

      const response = await request(app)
        .post('/api/channels/twilio/webhook')
        .send(webhookPayload);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('FORBIDDEN');
    });

    it('debe rechazar webhook con firma inválida', async () => {
      const webhookPayload = global.testUtils.createTwilioWebhookPayload();

      const response = await request(app)
        .post('/api/channels/twilio/webhook')
        .set('X-Twilio-Signature', 'sha1=invalid-signature')
        .send(webhookPayload);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('INVALID_SIGNATURE');
    });

    it('debe aplicar rate limiting en webhooks', async () => {
      const webhookPayload = global.testUtils.createTwilioWebhookPayload();
      const url = 'http://localhost:3000/api/channels/twilio/webhook';
      const signature = global.testUtils.createTwilioSignature(url, webhookPayload);

      // Enviar múltiples webhooks rápidamente
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app)
            .post('/api/channels/twilio/webhook')
            .set('X-Twilio-Signature', signature)
            .send(webhookPayload)
        );
      }

      const responses = await Promise.all(promises);
      
      // Verificar que al menos una respuesta sea rate limited
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('POST /api/channels/twilio/send/whatsapp', () => {
    it('debe enviar mensaje WhatsApp válido', async () => {
      const twilioController = require('../src/controllers/channels/twilioController');
      twilioController.sendWhatsAppMessage = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'sent-message-id'
      });

      const response = await request(app)
        .post('/api/channels/twilio/send/whatsapp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          to: '+1234567890',
          message: 'Hola, este es un mensaje de prueba',
          conversationId: '123e4567-e89b-12d3-a456-426614174000'
        });

      expect(response.status).toBe(200);
      expect(twilioController.sendWhatsAppMessage).toHaveBeenCalled();
    });

    it('debe validar número de teléfono', async () => {
      const response = await request(app)
        .post('/api/channels/twilio/send/whatsapp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          to: 'numero-invalido',
          message: 'Mensaje de prueba'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.details.some(detail => 
        detail.field === 'to'
      )).toBe(true);
    });

    it('debe validar longitud del mensaje', async () => {
      const longMessage = 'a'.repeat(1601); // Excede el límite

      const response = await request(app)
        .post('/api/channels/twilio/send/whatsapp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          to: '+1234567890',
          message: longMessage
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.details.some(detail => 
        detail.field === 'message'
      )).toBe(true);
    });

    it('debe validar URL de media', async () => {
      const response = await request(app)
        .post('/api/channels/twilio/send/whatsapp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          to: '+1234567890',
          message: 'Mensaje con media',
          mediaUrl: 'url-invalida'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('debe rechazar acceso sin autenticación', async () => {
      const response = await request(app)
        .post('/api/channels/twilio/send/whatsapp')
        .send({
          to: '+1234567890',
          message: 'Mensaje de prueba'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('AUTHENTICATION_REQUIRED');
    });

    it('debe rechazar acceso sin permisos', async () => {
      // Crear usuario sin permisos de escritura
      const noPermUser = global.testUtils.createTestUser({
        permissions: ['messages.read'] // Solo lectura
      });
      const noPermToken = global.testUtils.generateTestToken(noPermUser);

      const response = await request(app)
        .post('/api/channels/twilio/send/whatsapp')
        .set('Authorization', `Bearer ${noPermToken}`)
        .send({
          to: '+1234567890',
          message: 'Mensaje de prueba'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('debe aplicar rate limiting por usuario', async () => {
      // Mock del controlador para evitar errores
      const twilioController = require('../src/controllers/channels/twilioController');
      twilioController.sendWhatsAppMessage = jest.fn().mockResolvedValue({
        success: true
      });

      // Enviar múltiples mensajes rápidamente
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app)
            .post('/api/channels/twilio/send/whatsapp')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
              to: '+1234567890',
              message: `Mensaje ${i}`
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Verificar que al menos una respuesta sea rate limited
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('POST /api/channels/twilio/send/sms', () => {
    it('debe enviar SMS válido', async () => {
      const twilioController = require('../src/controllers/channels/twilioController');
      twilioController.sendSMS = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'sent-sms-id'
      });

      const response = await request(app)
        .post('/api/channels/twilio/send/sms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          to: '+1234567890',
          message: 'SMS de prueba'
        });

      expect(response.status).toBe(200);
      expect(twilioController.sendSMS).toHaveBeenCalled();
    });

    it('debe validar longitud de SMS', async () => {
      const longMessage = 'a'.repeat(161); // Excede límite SMS

      const response = await request(app)
        .post('/api/channels/twilio/send/sms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          to: '+1234567890',
          message: longMessage
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/channels/twilio/message/:messageId/status', () => {
    it('debe obtener estado de mensaje válido', async () => {
      const twilioController = require('../src/controllers/channels/twilioController');
      twilioController.getMessageStatus = jest.fn().mockResolvedValue({
        success: true,
        status: 'delivered'
      });

      const response = await request(app)
        .get('/api/channels/twilio/message/test-message-id/status')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(twilioController.getMessageStatus).toHaveBeenCalled();
    });

    it('debe validar ID de mensaje', async () => {
      const response = await request(app)
        .get('/api/channels/twilio/message//status') // ID vacío
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404); // Ruta no encontrada
    });

    it('debe rechazar acceso sin permisos de lectura', async () => {
      // Crear usuario sin permisos
      const noPermUser = global.testUtils.createTestUser({
        permissions: [] // Sin permisos
      });
      const noPermToken = global.testUtils.generateTestToken(noPermUser);

      const response = await request(app)
        .get('/api/channels/twilio/message/test-message-id/status')
        .set('Authorization', `Bearer ${noPermToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('Validación de Media', () => {
    it('debe validar tipos de archivo permitidos', async () => {
      // Mock de multer middleware
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.exe',
        encoding: '7bit',
        mimetype: 'application/x-msdownload', // Tipo no permitido
        size: 1024,
        buffer: Buffer.from('test')
      };

      // Simular validación de media
      const { validateMediaFile } = require('../src/middlewares/validation');
      const req = { file: mockFile };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateMediaFile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'INVALID_FILE_TYPE'
        })
      );
    });

    it('debe validar tamaño de archivo', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 60 * 1024 * 1024, // 60MB - excede límite
        buffer: Buffer.from('test')
      };

      const { validateMediaFile } = require('../src/middlewares/validation');
      const req = { file: mockFile };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateMediaFile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'FILE_TOO_LARGE'
        })
      );
    });

    it('debe permitir archivos válidos', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB - válido
        buffer: Buffer.from('test')
      };

      const { validateMediaFile } = require('../src/middlewares/validation');
      const req = { file: mockFile };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateMediaFile(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.fileType).toBe('image');
    });
  });

  describe('Sanitización de Datos', () => {
    it('debe sanitizar contenido malicioso en mensajes', async () => {
      const maliciousMessage = '<script>alert("xss")</script>Mensaje normal';

      const response = await request(app)
        .post('/api/channels/twilio/send/whatsapp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          to: '+1234567890',
          message: maliciousMessage
        });

      // La validación debe fallar después de la sanitización
      expect(response.status).toBe(400);
    });

    it('debe sanitizar números de teléfono', async () => {
      const maliciousPhone = '+1234567890<script>alert("xss")</script>';

      const response = await request(app)
        .post('/api/channels/twilio/send/whatsapp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          to: maliciousPhone,
          message: 'Mensaje de prueba'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('Casos Edge y Errores', () => {
    it('debe manejar errores de Twilio API', async () => {
      const twilioController = require('../src/controllers/channels/twilioController');
      twilioController.sendWhatsAppMessage = jest.fn().mockRejectedValue(
        new Error('Twilio API error')
      );

      const response = await request(app)
        .post('/api/channels/twilio/send/whatsapp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          to: '+1234567890',
          message: 'Mensaje de prueba'
        });

      expect(response.status).toBe(500);
    });

    it('debe manejar números de teléfono internacionales', async () => {
      const twilioController = require('../src/controllers/channels/twilioController');
      twilioController.sendWhatsAppMessage = jest.fn().mockResolvedValue({
        success: true
      });

      const response = await request(app)
        .post('/api/channels/twilio/send/whatsapp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          to: '+525512345678', // Número mexicano
          message: 'Mensaje internacional'
        });

      expect(response.status).toBe(200);
    });

    it('debe manejar mensajes con emojis', async () => {
      const twilioController = require('../src/controllers/channels/twilioController');
      twilioController.sendWhatsAppMessage = jest.fn().mockResolvedValue({
        success: true
      });

      const response = await request(app)
        .post('/api/channels/twilio/send/whatsapp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          to: '+1234567890',
          message: 'Hola! 😊🎉 ¿Cómo estás? 👋'
        });

      expect(response.status).toBe(200);
    });

    it('debe manejar conversationId opcional', async () => {
      const twilioController = require('../src/controllers/channels/twilioController');
      twilioController.sendWhatsAppMessage = jest.fn().mockResolvedValue({
        success: true
      });

      const response = await request(app)
        .post('/api/channels/twilio/send/whatsapp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          to: '+1234567890',
          message: 'Mensaje sin conversación'
          // Sin conversationId
        });

      expect(response.status).toBe(200);
    });

    it('debe validar formato UUID para conversationId', async () => {
      const response = await request(app)
        .post('/api/channels/twilio/send/whatsapp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          to: '+1234567890',
          message: 'Mensaje de prueba',
          conversationId: 'invalid-uuid'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('Health Check', () => {
    it('debe responder health check de Twilio', async () => {
      const response = await request(app)
        .get('/api/channels/twilio/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.channel).toBe('twilio');
      expect(response.body.endpoints).toBeDefined();
    });
  });
}); 