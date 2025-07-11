/**
 * Controlador de Twilio
 * Maneja la lógica de negocio para WhatsApp y SMS vía Twilio
 * Procesa webhooks entrantes y coordina el envío de mensajes
 */

const twilioService = require('../../services/twilioService');
const clientModel = require('../../models/clientModel');
const conversationModel = require('../../models/conversationModel');
const messageModel = require('../../models/messageModel');
const logger = require('../../utils/logger');

class TwilioController {
  /**
   * Procesar webhook entrante de Twilio
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async processWebhook(req, res) {
    try {
      // Validar webhook (opcional en desarrollo)
      const signature = req.headers['x-twilio-signature'];
      const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      
      if (!twilioService.validateWebhook(signature, url, req.body)) {
        logger.warn('Webhook inválido de Twilio');
        return res.status(403).json({ error: 'Webhook inválido' });
      }

      // Procesar datos del webhook
      const webhookData = twilioService.processWebhook(req.body);
      
      logger.info('Webhook recibido de Twilio:', {
        messageId: webhookData.messageId,
        from: webhookData.from,
        channel: webhookData.channel
      });

      // Buscar o crear cliente
      const client = await this.findOrCreateClient(webhookData);
      
      // Buscar o crear conversación
      const conversation = await this.findOrCreateConversation(client, webhookData);
      
      // Crear mensaje
      const message = await this.createMessage(client, conversation, webhookData);
      
      // Actualizar estadísticas del cliente
      await this.updateClientStats(client.firestoreId, conversation.firestoreId);

      // Responder a Twilio
      res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');

      // Aquí se puede agregar lógica para:
      // - Notificar a agentes en tiempo real
      // - Ejecutar automatizaciones
      // - Análisis de IA del mensaje
      // - Respuestas automáticas

    } catch (error) {
      logger.error('Error procesando webhook de Twilio:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Enviar mensaje por WhatsApp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendWhatsAppMessage(req, res) {
    try {
      const { to, message, conversationId, mediaUrl } = req.body;

      if (!to || !message) {
        return res.status(400).json({ error: 'Número de destino y mensaje son requeridos' });
      }

      // Obtener conversación si se proporciona ID
      let conversation = null;
      if (conversationId) {
        conversation = await conversationModel.getById(conversationId);
        if (!conversation) {
          return res.status(404).json({ error: 'Conversación no encontrada' });
        }
      }

      // Enviar mensaje por Twilio
      const result = await twilioService.sendWhatsAppMessage(to, message, { mediaUrl });

      // Buscar cliente por número
      const client = await clientModel.findByChannel('twilio', to);
      if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      // Crear mensaje en la base de datos
      const messageData = {
        conversationId: conversation?.id || null,
        clientId: client.id,
        content: message,
        direction: 'outgoing',
        channel: 'twilio',
        sender: {
          id: 'system', // En el futuro será el ID del agente
          name: 'Sistema',
          type: 'system'
        },
        metadata: {
          twilioSid: result.messageId,
          deliveryStatus: result.status,
          media: mediaUrl ? [{ url: mediaUrl }] : []
        }
      };

      const savedMessage = await messageModel.create(messageData);

      res.status(200).json({
        success: true,
        message: savedMessage,
        twilioResult: result
      });

    } catch (error) {
      logger.error('Error enviando mensaje WhatsApp:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Enviar mensaje SMS
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendSMS(req, res) {
    try {
      const { to, message, conversationId, mediaUrl } = req.body;

      if (!to || !message) {
        return res.status(400).json({ error: 'Número de destino y mensaje son requeridos' });
      }

      // Enviar SMS por Twilio
      const result = await twilioService.sendSMS(to, message, { mediaUrl });

      // Buscar cliente por número
      const client = await clientModel.findByChannel('twilio', to);
      if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      // Crear mensaje en la base de datos
      const messageData = {
        conversationId: conversationId || null,
        clientId: client.id,
        content: message,
        direction: 'outgoing',
        channel: 'twilio',
        sender: {
          id: 'system',
          name: 'Sistema',
          type: 'system'
        },
        metadata: {
          twilioSid: result.messageId,
          deliveryStatus: result.status,
          media: mediaUrl ? [{ url: mediaUrl }] : []
        }
      };

      const savedMessage = await messageModel.create(messageData);

      res.status(200).json({
        success: true,
        message: savedMessage,
        twilioResult: result
      });

    } catch (error) {
      logger.error('Error enviando SMS:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener estado de mensaje
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getMessageStatus(req, res) {
    try {
      const { messageId } = req.params;
      const status = await twilioService.getMessageStatus(messageId);
      res.status(200).json(status);
    } catch (error) {
      logger.error('Error obteniendo estado del mensaje:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Buscar o crear cliente
   * @param {Object} webhookData - Datos del webhook
   * @returns {Promise<Object>} - Cliente
   */
  async findOrCreateClient(webhookData) {
    // Buscar cliente existente
    let client = await clientModel.findByChannel('twilio', webhookData.from);
    
    if (!client) {
      // Crear nuevo cliente
      const clientData = {
        name: webhookData.profileName || 'Cliente WhatsApp',
        phone: webhookData.from,
        channels: {
          twilio: {
            phoneNumber: webhookData.from,
            profileName: webhookData.profileName,
            waId: webhookData.waId
          }
        },
        metadata: {
          source: 'twilio'
        }
      };

      client = await clientModel.create(clientData);
      logger.info(`Nuevo cliente creado: ${client.id}`, { phone: webhookData.from });
    }

    return client;
  }

  /**
   * Buscar o crear conversación
   * @param {Object} client - Cliente
   * @param {Object} webhookData - Datos del webhook
   * @returns {Promise<Object>} - Conversación
   */
  async findOrCreateConversation(client, webhookData) {
    // Buscar conversación activa
    let conversation = await conversationModel.findActiveByClient(client.id, 'twilio');
    
    if (!conversation) {
      // Crear nueva conversación
      const conversationData = {
        clientId: client.id,
        channel: 'twilio',
        status: 'active',
        metadata: {
          phoneNumber: webhookData.from,
          profileName: webhookData.profileName
        }
      };

      conversation = await conversationModel.create(conversationData);
      logger.info(`Nueva conversación creada: ${conversation.id}`, { 
        clientId: client.id,
        channel: 'twilio'
      });
    }

    return conversation;
  }

  /**
   * Crear mensaje
   * @param {Object} client - Cliente
   * @param {Object} conversation - Conversación
   * @param {Object} webhookData - Datos del webhook
   * @returns {Promise<Object>} - Mensaje creado
   */
  async createMessage(client, conversation, webhookData) {
    const messageData = {
      conversationId: conversation.id,
      clientId: client.id,
      content: webhookData.body,
      type: webhookData.hasMedia ? 'media' : 'text',
      direction: 'incoming',
      channel: 'twilio',
      sender: {
        id: client.id,
        name: webhookData.profileName || client.name,
        type: 'client'
      },
      metadata: {
        twilioSid: webhookData.messageId,
        media: webhookData.media,
        deliveryStatus: 'delivered'
      }
    };

    const message = await messageModel.create(messageData);
    logger.info(`Mensaje creado: ${message.id}`, { 
      conversationId: conversation.id,
      clientId: client.id
    });

    return message;
  }

  /**
   * Actualizar estadísticas del cliente
   * @param {string} clientId - ID del cliente
   * @param {string} conversationId - ID de la conversación
   */
  async updateClientStats(clientId, conversationId) {
    try {
      const stats = await messageModel.getStats(conversationId);
      await clientModel.updateStats(clientId, {
        totalMessages: stats.total,
        lastActivity: new Date(),
        preferredChannel: 'twilio'
      });
    } catch (error) {
      logger.error('Error actualizando estadísticas del cliente:', error);
    }
  }
}

module.exports = new TwilioController(); 