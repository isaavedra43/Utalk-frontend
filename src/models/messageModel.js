/**
 * Modelo de Mensaje
 * Esquema y validaciones para mensajes omnicanal
 * Agnóstico al canal de origen
 */

const { db } = require('../../firebase');
const { v4: uuidv4 } = require('uuid');

class MessageModel {
  constructor() {
    this.collection = 'messages';
  }

  /**
   * Crear un nuevo mensaje
   * @param {Object} messageData - Datos del mensaje
   * @returns {Promise<Object>} - Mensaje creado
   */
  async create(messageData) {
    const message = {
      id: uuidv4(),
      conversationId: messageData.conversationId,
      clientId: messageData.clientId,
      content: messageData.content,
      type: messageData.type || 'text', // text, image, audio, video, document
      direction: messageData.direction, // incoming, outgoing
      channel: messageData.channel, // twilio, facebook, email, webchat
      sender: {
        id: messageData.sender?.id,
        name: messageData.sender?.name,
        type: messageData.sender?.type || 'client' // client, agent, system
      },
      metadata: {
        twilioSid: messageData.metadata?.twilioSid,
        facebookId: messageData.metadata?.facebookId,
        emailId: messageData.metadata?.emailId,
        media: messageData.metadata?.media || [],
        deliveryStatus: messageData.metadata?.deliveryStatus || 'pending',
        readStatus: messageData.metadata?.readStatus || 'unread'
      },
      timestamps: {
        created: new Date(),
        updated: new Date(),
        delivered: null,
        read: null
      },
      isDeleted: false
    };

    // Validar mensaje
    this.validate(message);

    // Guardar en Firestore
    const docRef = await db.collection(this.collection).add(message);
    message.firestoreId = docRef.id;

    return message;
  }

  /**
   * Obtener mensajes de una conversación
   * @param {string} conversationId - ID de la conversación
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Array>} - Lista de mensajes
   */
  async getByConversation(conversationId, options = {}) {
    let query = db.collection(this.collection)
      .where('conversationId', '==', conversationId)
      .where('isDeleted', '==', false)
      .orderBy('timestamps.created', 'desc');

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.startAfter) {
      query = query.startAfter(options.startAfter);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
  }

  /**
   * Actualizar estado de entrega de mensaje
   * @param {string} messageId - ID del mensaje
   * @param {string} status - Estado de entrega
   * @returns {Promise<void>}
   */
  async updateDeliveryStatus(messageId, status) {
    const docRef = db.collection(this.collection).doc(messageId);
    await docRef.update({
      'metadata.deliveryStatus': status,
      'timestamps.delivered': status === 'delivered' ? new Date() : null,
      'timestamps.updated': new Date()
    });
  }

  /**
   * Marcar mensaje como leído
   * @param {string} messageId - ID del mensaje
   * @returns {Promise<void>}
   */
  async markAsRead(messageId) {
    const docRef = db.collection(this.collection).doc(messageId);
    await docRef.update({
      'metadata.readStatus': 'read',
      'timestamps.read': new Date(),
      'timestamps.updated': new Date()
    });
  }

  /**
   * Validar estructura del mensaje
   * @param {Object} message - Mensaje a validar
   * @throws {Error} - Error de validación
   */
  validate(message) {
    const required = ['conversationId', 'clientId', 'content', 'direction', 'channel'];
    
    for (const field of required) {
      if (!message[field]) {
        throw new Error(`Campo requerido: ${field}`);
      }
    }

    const validChannels = ['twilio', 'facebook', 'email', 'webchat'];
    if (!validChannels.includes(message.channel)) {
      throw new Error(`Canal inválido: ${message.channel}`);
    }

    const validDirections = ['incoming', 'outgoing'];
    if (!validDirections.includes(message.direction)) {
      throw new Error(`Dirección inválida: ${message.direction}`);
    }

    const validTypes = ['text', 'image', 'audio', 'video', 'document'];
    if (!validTypes.includes(message.type)) {
      throw new Error(`Tipo inválido: ${message.type}`);
    }
  }

  /**
   * Obtener estadísticas de mensajes
   * @param {string} conversationId - ID de la conversación
   * @returns {Promise<Object>} - Estadísticas
   */
  async getStats(conversationId) {
    const messages = await this.getByConversation(conversationId);
    
    return {
      total: messages.length,
      incoming: messages.filter(m => m.direction === 'incoming').length,
      outgoing: messages.filter(m => m.direction === 'outgoing').length,
      unread: messages.filter(m => m.metadata.readStatus === 'unread').length,
      byChannel: messages.reduce((acc, m) => {
        acc[m.channel] = (acc[m.channel] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

module.exports = new MessageModel(); 