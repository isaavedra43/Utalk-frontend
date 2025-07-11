/**
 * Modelo de Conversación
 * Esquema y validaciones para conversaciones omnicanal
 * Gestiona hilos de conversación entre clientes y el sistema
 * Agnóstico al canal de origen (twilio, facebook, email, webchat)
 */

const { db } = require('../../firebase');
const { v4: uuidv4 } = require('uuid');

class ConversationModel {
  constructor() {
    this.collection = 'conversations';
  }

  /**
   * Crear una nueva conversación
   * @param {Object} conversationData - Datos de la conversación
   * @returns {Promise<Object>} - Conversación creada
   */
  async create(conversationData) {
    const conversation = {
      id: uuidv4(),
      clientId: conversationData.clientId,
      channel: conversationData.channel, // twilio, facebook, email, webchat
      status: conversationData.status || 'active', // active, closed, pending
      assignedTo: conversationData.assignedTo || null, // ID del agente asignado
      priority: conversationData.priority || 'normal', // low, normal, high, urgent
      metadata: {
        phoneNumber: conversationData.metadata?.phoneNumber || null,
        email: conversationData.metadata?.email || null,
        facebookPsid: conversationData.metadata?.facebookPsid || null,
        webchatSessionId: conversationData.metadata?.webchatSessionId || null,
        profileName: conversationData.metadata?.profileName || null,
        lastMessagePreview: conversationData.metadata?.lastMessagePreview || null,
        tags: conversationData.metadata?.tags || [],
        customFields: conversationData.metadata?.customFields || {}
      },
      stats: {
        totalMessages: 0,
        unreadMessages: 0,
        lastMessageAt: null,
        firstResponseTime: null,
        avgResponseTime: null,
        resolutionTime: null
      },
      timestamps: {
        created: new Date(),
        updated: new Date(),
        lastActivity: new Date(),
        closed: null,
        reopened: null
      },
      isActive: true,
      isArchived: false
    };

    // Validar conversación
    this.validate(conversation);

    // Guardar en Firestore
    const docRef = await db.collection(this.collection).add(conversation);
    conversation.firestoreId = docRef.id;

    return conversation;
  }

  /**
   * Buscar conversación activa por cliente y canal
   * @param {string} clientId - ID del cliente
   * @param {string} channel - Canal de la conversación
   * @returns {Promise<Object|null>} - Conversación encontrada o null
   */
  async findActiveByClient(clientId, channel) {
    const query = db.collection(this.collection)
      .where('clientId', '==', clientId)
      .where('channel', '==', channel)
      .where('status', '==', 'active')
      .where('isActive', '==', true)
      .orderBy('timestamps.updated', 'desc')
      .limit(1);

    const snapshot = await query.get();
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { firestoreId: doc.id, ...doc.data() };
  }

  /**
   * Obtener conversación por ID
   * @param {string} conversationId - ID de la conversación
   * @returns {Promise<Object|null>} - Conversación encontrada o null
   */
  async getById(conversationId) {
    const doc = await db.collection(this.collection).doc(conversationId).get();
    if (!doc.exists) return null;
    return { firestoreId: doc.id, ...doc.data() };
  }

  /**
   * Obtener conversaciones por cliente
   * @param {string} clientId - ID del cliente
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise<Array>} - Lista de conversaciones
   */
  async getByClient(clientId, options = {}) {
    let query = db.collection(this.collection)
      .where('clientId', '==', clientId)
      .where('isActive', '==', true);

    // Filtros opcionales
    if (options.status) {
      query = query.where('status', '==', options.status);
    }

    if (options.channel) {
      query = query.where('channel', '==', options.channel);
    }

    // Ordenar y paginar
    query = query.orderBy('timestamps.updated', 'desc');

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
   * Obtener conversaciones con filtros avanzados
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Array>} - Lista de conversaciones
   */
  async search(filters = {}, options = {}) {
    let query = db.collection(this.collection).where('isActive', '==', true);

    // Aplicar filtros
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    if (filters.channel) {
      query = query.where('channel', '==', filters.channel);
    }

    if (filters.assignedTo) {
      query = query.where('assignedTo', '==', filters.assignedTo);
    }

    if (filters.priority) {
      query = query.where('priority', '==', filters.priority);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.where('metadata.tags', 'array-contains-any', filters.tags);
    }

    // Ordenar
    const orderBy = options.orderBy || 'timestamps.updated';
    const orderDirection = options.orderDirection || 'desc';
    query = query.orderBy(orderBy, orderDirection);

    // Paginación
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
   * Actualizar conversación
   * @param {string} conversationId - ID de la conversación
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Conversación actualizada
   */
  async update(conversationId, updateData) {
    const docRef = db.collection(this.collection).doc(conversationId);
    
    const updatePayload = {
      ...updateData,
      'timestamps.updated': new Date()
    };

    await docRef.update(updatePayload);
    
    const updatedDoc = await docRef.get();
    return { firestoreId: updatedDoc.id, ...updatedDoc.data() };
  }

  /**
   * Cerrar conversación
   * @param {string} conversationId - ID de la conversación
   * @param {string} reason - Razón del cierre
   * @returns {Promise<Object>} - Conversación cerrada
   */
  async close(conversationId, reason = 'resolved') {
    const updateData = {
      status: 'closed',
      'metadata.closeReason': reason,
      'timestamps.closed': new Date(),
      'timestamps.updated': new Date(),
      'stats.resolutionTime': new Date() // Se puede calcular la diferencia con created
    };

    return await this.update(conversationId, updateData);
  }

  /**
   * Reabrir conversación
   * @param {string} conversationId - ID de la conversación
   * @returns {Promise<Object>} - Conversación reabierta
   */
  async reopen(conversationId) {
    const updateData = {
      status: 'active',
      'timestamps.reopened': new Date(),
      'timestamps.updated': new Date(),
      'timestamps.closed': null
    };

    return await this.update(conversationId, updateData);
  }

  /**
   * Asignar conversación a un agente
   * @param {string} conversationId - ID de la conversación
   * @param {string} agentId - ID del agente
   * @returns {Promise<Object>} - Conversación asignada
   */
  async assign(conversationId, agentId) {
    const updateData = {
      assignedTo: agentId,
      'timestamps.updated': new Date()
    };

    return await this.update(conversationId, updateData);
  }

  /**
   * Actualizar estadísticas de la conversación
   * @param {string} conversationId - ID de la conversación
   * @param {Object} stats - Estadísticas a actualizar
   * @returns {Promise<void>}
   */
  async updateStats(conversationId, stats) {
    const docRef = db.collection(this.collection).doc(conversationId);
    const updateData = {
      'timestamps.updated': new Date(),
      'timestamps.lastActivity': new Date()
    };

    // Actualizar estadísticas específicas
    if (stats.totalMessages !== undefined) {
      updateData['stats.totalMessages'] = stats.totalMessages;
    }

    if (stats.unreadMessages !== undefined) {
      updateData['stats.unreadMessages'] = stats.unreadMessages;
    }

    if (stats.lastMessageAt !== undefined) {
      updateData['stats.lastMessageAt'] = stats.lastMessageAt;
    }

    if (stats.lastMessagePreview !== undefined) {
      updateData['metadata.lastMessagePreview'] = stats.lastMessagePreview;
    }

    await docRef.update(updateData);
  }

  /**
   * Agregar tag a la conversación
   * @param {string} conversationId - ID de la conversación
   * @param {string} tag - Tag a agregar
   * @returns {Promise<void>}
   */
  async addTag(conversationId, tag) {
    const admin = require('firebase-admin');
    const docRef = db.collection(this.collection).doc(conversationId);
    await docRef.update({
      'metadata.tags': admin.firestore.FieldValue.arrayUnion(tag),
      'timestamps.updated': new Date()
    });
  }

  /**
   * Remover tag de la conversación
   * @param {string} conversationId - ID de la conversación
   * @param {string} tag - Tag a remover
   * @returns {Promise<void>}
   */
  async removeTag(conversationId, tag) {
    const admin = require('firebase-admin');
    const docRef = db.collection(this.collection).doc(conversationId);
    await docRef.update({
      'metadata.tags': admin.firestore.FieldValue.arrayRemove(tag),
      'timestamps.updated': new Date()
    });
  }

  /**
   * Archivar conversación
   * @param {string} conversationId - ID de la conversación
   * @returns {Promise<Object>} - Conversación archivada
   */
  async archive(conversationId) {
    const updateData = {
      isArchived: true,
      'timestamps.updated': new Date()
    };

    return await this.update(conversationId, updateData);
  }

  /**
   * Obtener estadísticas generales de conversaciones
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} - Estadísticas
   */
  async getStats(filters = {}) {
    let query = db.collection(this.collection).where('isActive', '==', true);

    // Aplicar filtros si existen
    if (filters.channel) {
      query = query.where('channel', '==', filters.channel);
    }

    if (filters.assignedTo) {
      query = query.where('assignedTo', '==', filters.assignedTo);
    }

    const snapshot = await query.get();
    const conversations = snapshot.docs.map(doc => doc.data());

    return {
      total: conversations.length,
      byStatus: conversations.reduce((acc, conv) => {
        acc[conv.status] = (acc[conv.status] || 0) + 1;
        return acc;
      }, {}),
      byChannel: conversations.reduce((acc, conv) => {
        acc[conv.channel] = (acc[conv.channel] || 0) + 1;
        return acc;
      }, {}),
      byPriority: conversations.reduce((acc, conv) => {
        acc[conv.priority] = (acc[conv.priority] || 0) + 1;
        return acc;
      }, {}),
      unassigned: conversations.filter(conv => !conv.assignedTo).length,
      withUnreadMessages: conversations.filter(conv => conv.stats.unreadMessages > 0).length
    };
  }

  /**
   * Validar estructura de la conversación
   * @param {Object} conversation - Conversación a validar
   * @throws {Error} - Error de validación
   */
  validate(conversation) {
    const required = ['clientId', 'channel'];
    
    for (const field of required) {
      if (!conversation[field]) {
        throw new Error(`Campo requerido: ${field}`);
      }
    }

    const validChannels = ['twilio', 'facebook', 'email', 'webchat'];
    if (!validChannels.includes(conversation.channel)) {
      throw new Error(`Canal inválido: ${conversation.channel}`);
    }

    const validStatuses = ['active', 'closed', 'pending'];
    if (!validStatuses.includes(conversation.status)) {
      throw new Error(`Estado inválido: ${conversation.status}`);
    }

    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(conversation.priority)) {
      throw new Error(`Prioridad inválida: ${conversation.priority}`);
    }
  }
}

module.exports = new ConversationModel(); 