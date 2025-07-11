/**
 * Servicio de Twilio
 * Maneja el envío de mensajes por WhatsApp y procesamiento de webhooks
 * Integración con la API de Twilio para mensajería
 */

const twilio = require('twilio');
const config = require('../config');
const logger = require('../utils/logger');

class TwilioService {
  constructor() {
    this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
    this.fromNumber = config.twilio.phoneNumber;
  }

  /**
   * Enviar mensaje de WhatsApp
   * @param {string} to - Número de destino
   * @param {string} message - Mensaje a enviar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Respuesta de Twilio
   */
  async sendWhatsAppMessage(to, message, options = {}) {
    try {
      // Formatear número de destino
      const formattedTo = this.formatPhoneNumber(to);
      
      const messageData = {
        body: message,
        from: `whatsapp:${this.fromNumber}`,
        to: `whatsapp:${formattedTo}`
      };

      // Agregar media si existe
      if (options.mediaUrl) {
        messageData.mediaUrl = options.mediaUrl;
      }

      // Enviar mensaje
      const result = await this.client.messages.create(messageData);

      logger.info(`Mensaje WhatsApp enviado: ${result.sid}`, {
        to: formattedTo,
        messageId: result.sid,
        status: result.status
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        to: formattedTo,
        from: this.fromNumber,
        body: message,
        dateCreated: result.dateCreated,
        price: result.price,
        priceUnit: result.priceUnit
      };

    } catch (error) {
      logger.error('Error enviando mensaje WhatsApp:', error);
      throw new Error(`Error enviando mensaje: ${error.message}`);
    }
  }

  /**
   * Enviar mensaje SMS
   * @param {string} to - Número de destino
   * @param {string} message - Mensaje a enviar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Respuesta de Twilio
   */
  async sendSMS(to, message, options = {}) {
    try {
      const formattedTo = this.formatPhoneNumber(to);
      
      const messageData = {
        body: message,
        from: this.fromNumber,
        to: formattedTo
      };

      if (options.mediaUrl) {
        messageData.mediaUrl = options.mediaUrl;
      }

      const result = await this.client.messages.create(messageData);

      logger.info(`SMS enviado: ${result.sid}`, {
        to: formattedTo,
        messageId: result.sid,
        status: result.status
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        to: formattedTo,
        from: this.fromNumber,
        body: message,
        dateCreated: result.dateCreated
      };

    } catch (error) {
      logger.error('Error enviando SMS:', error);
      throw new Error(`Error enviando SMS: ${error.message}`);
    }
  }

  /**
   * Procesar webhook de Twilio
   * @param {Object} webhookData - Datos del webhook
   * @returns {Object} - Datos procesados
   */
  processWebhook(webhookData) {
    const {
      MessageSid,
      From,
      To,
      Body,
      NumMedia,
      MediaUrl0,
      MediaContentType0,
      ProfileName,
      WaId
    } = webhookData;

    // Determinar el canal
    const channel = From.startsWith('whatsapp:') ? 'whatsapp' : 'sms';
    
    // Limpiar números de teléfono
    const cleanFrom = From.replace('whatsapp:', '');
    const cleanTo = To.replace('whatsapp:', '');

    const processedData = {
      messageId: MessageSid,
      from: cleanFrom,
      to: cleanTo,
      body: Body || '',
      channel: channel,
      profileName: ProfileName || null,
      waId: WaId || null,
      hasMedia: parseInt(NumMedia) > 0,
      media: [],
      timestamp: new Date()
    };

    // Procesar media si existe
    if (processedData.hasMedia) {
      for (let i = 0; i < parseInt(NumMedia); i++) {
        const mediaUrl = webhookData[`MediaUrl${i}`];
        const mediaType = webhookData[`MediaContentType${i}`];
        
        if (mediaUrl) {
          processedData.media.push({
            url: mediaUrl,
            contentType: mediaType,
            type: this.getMediaType(mediaType)
          });
        }
      }
    }

    return processedData;
  }

  /**
   * Validar webhook de Twilio
   * @param {string} signature - Firma del webhook
   * @param {string} url - URL del webhook
   * @param {Object} params - Parámetros del webhook
   * @returns {boolean} - Es válido
   */
  validateWebhook(signature, url, params) {
    if (!config.twilio.webhookSecret) {
      logger.warn('Webhook secret no configurado, saltando validación');
      return true;
    }

    try {
      return twilio.validateRequest(
        config.twilio.webhookSecret,
        signature,
        url,
        params
      );
    } catch (error) {
      logger.error('Error validando webhook:', error);
      return false;
    }
  }

  /**
   * Obtener estado de mensaje
   * @param {string} messageId - ID del mensaje
   * @returns {Promise<Object>} - Estado del mensaje
   */
  async getMessageStatus(messageId) {
    try {
      const message = await this.client.messages(messageId).fetch();
      
      return {
        messageId: message.sid,
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        dateCreated: message.dateCreated,
        dateUpdated: message.dateUpdated,
        dateSent: message.dateSent,
        price: message.price,
        priceUnit: message.priceUnit
      };
    } catch (error) {
      logger.error(`Error obteniendo estado del mensaje ${messageId}:`, error);
      throw new Error(`Error obteniendo estado: ${error.message}`);
    }
  }

  /**
   * Formatear número de teléfono
   * @param {string} phoneNumber - Número a formatear
   * @returns {string} - Número formateado
   */
  formatPhoneNumber(phoneNumber) {
    // Remover espacios y caracteres especiales
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Agregar código de país si no existe
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    return '+' + cleaned;
  }

  /**
   * Obtener tipo de media
   * @param {string} contentType - Tipo de contenido
   * @returns {string} - Tipo de media
   */
  getMediaType(contentType) {
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('audio/')) return 'audio';
    if (contentType.startsWith('video/')) return 'video';
    if (contentType.startsWith('application/')) return 'document';
    return 'unknown';
  }

  /**
   * Descargar media de Twilio
   * @param {string} mediaUrl - URL del media
   * @returns {Promise<Buffer>} - Buffer del archivo
   */
  async downloadMedia(mediaUrl) {
    try {
      const response = await fetch(mediaUrl, {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${config.twilio.accountSid}:${config.twilio.authToken}`
          ).toString('base64')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error descargando media: ${response.statusText}`);
      }

      return await response.buffer();
    } catch (error) {
      logger.error('Error descargando media:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de mensajes
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array>} - Lista de mensajes
   */
  async getMessages(filters = {}) {
    try {
      const options = {};
      
      if (filters.from) options.from = filters.from;
      if (filters.to) options.to = filters.to;
      if (filters.dateSent) options.dateSent = filters.dateSent;
      if (filters.limit) options.limit = filters.limit;

      const messages = await this.client.messages.list(options);
      
      return messages.map(msg => ({
        messageId: msg.sid,
        from: msg.from,
        to: msg.to,
        body: msg.body,
        status: msg.status,
        direction: msg.direction,
        dateCreated: msg.dateCreated,
        dateSent: msg.dateSent,
        price: msg.price,
        priceUnit: msg.priceUnit
      }));
    } catch (error) {
      logger.error('Error obteniendo mensajes:', error);
      throw new Error(`Error obteniendo mensajes: ${error.message}`);
    }
  }
}

module.exports = new TwilioService(); 