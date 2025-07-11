/**
 * Modelo de Cliente
 * Esquema y validaciones para clientes omnicanal
 * Centraliza información del cliente independiente del canal
 */

const { db } = require('../../firebase');
const { v4: uuidv4 } = require('uuid');

class ClientModel {
  constructor() {
    this.collection = 'clients';
  }

  /**
   * Crear un nuevo cliente
   * @param {Object} clientData - Datos del cliente
   * @returns {Promise<Object>} - Cliente creado
   */
  async create(clientData) {
    const client = {
      id: uuidv4(),
      name: clientData.name || 'Cliente',
      email: clientData.email || null,
      phone: clientData.phone || null,
      avatar: clientData.avatar || null,
      channels: {
        twilio: {
          phoneNumber: clientData.channels?.twilio?.phoneNumber || null,
          profileName: clientData.channels?.twilio?.profileName || null
        },
        facebook: {
          psid: clientData.channels?.facebook?.psid || null,
          profileName: clientData.channels?.facebook?.profileName || null
        },
        email: {
          address: clientData.channels?.email?.address || null,
          name: clientData.channels?.email?.name || null
        },
        webchat: {
          sessionId: clientData.channels?.webchat?.sessionId || null,
          ipAddress: clientData.channels?.webchat?.ipAddress || null
        }
      },
      profile: {
        firstName: clientData.profile?.firstName || null,
        lastName: clientData.profile?.lastName || null,
        company: clientData.profile?.company || null,
        position: clientData.profile?.position || null,
        location: clientData.profile?.location || null,
        timezone: clientData.profile?.timezone || null,
        language: clientData.profile?.language || 'es'
      },
      metadata: {
        source: clientData.metadata?.source || 'unknown', // organic, campaign, referral
        tags: clientData.metadata?.tags || [],
        customFields: clientData.metadata?.customFields || {},
        notes: clientData.metadata?.notes || ''
      },
      stats: {
        totalConversations: 0,
        totalMessages: 0,
        lastActivity: null,
        avgResponseTime: null,
        preferredChannel: null
      },
      timestamps: {
        created: new Date(),
        updated: new Date(),
        lastSeen: new Date()
      },
      isActive: true,
      isBlocked: false
    };

    // Validar cliente
    this.validate(client);

    // Guardar en Firestore
    const docRef = await db.collection(this.collection).add(client);
    client.firestoreId = docRef.id;

    return client;
  }

  /**
   * Buscar cliente por canal y identificador
   * @param {string} channel - Canal (twilio, facebook, email, webchat)
   * @param {string} identifier - Identificador del canal
   * @returns {Promise<Object|null>} - Cliente encontrado o null
   */
  async findByChannel(channel, identifier) {
    let query;
    
    switch (channel) {
      case 'twilio':
        query = db.collection(this.collection)
          .where('channels.twilio.phoneNumber', '==', identifier)
          .where('isActive', '==', true)
          .limit(1);
        break;
      case 'facebook':
        query = db.collection(this.collection)
          .where('channels.facebook.psid', '==', identifier)
          .where('isActive', '==', true)
          .limit(1);
        break;
      case 'email':
        query = db.collection(this.collection)
          .where('channels.email.address', '==', identifier)
          .where('isActive', '==', true)
          .limit(1);
        break;
      case 'webchat':
        query = db.collection(this.collection)
          .where('channels.webchat.sessionId', '==', identifier)
          .where('isActive', '==', true)
          .limit(1);
        break;
      default:
        return null;
    }

    const snapshot = await query.get();
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { firestoreId: doc.id, ...doc.data() };
  }

  /**
   * Obtener cliente por ID
   * @param {string} clientId - ID del cliente
   * @returns {Promise<Object|null>} - Cliente encontrado o null
   */
  async getById(clientId) {
    const doc = await db.collection(this.collection).doc(clientId).get();
    if (!doc.exists) return null;
    return { firestoreId: doc.id, ...doc.data() };
  }

  /**
   * Actualizar cliente
   * @param {string} clientId - ID del cliente
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Cliente actualizado
   */
  async update(clientId, updateData) {
    const docRef = db.collection(this.collection).doc(clientId);
    
    const updatePayload = {
      ...updateData,
      'timestamps.updated': new Date()
    };

    await docRef.update(updatePayload);
    
    const updatedDoc = await docRef.get();
    return { firestoreId: updatedDoc.id, ...updatedDoc.data() };
  }

  /**
   * Actualizar estadísticas del cliente
   * @param {string} clientId - ID del cliente
   * @param {Object} stats - Estadísticas a actualizar
   * @returns {Promise<void>}
   */
  async updateStats(clientId, stats) {
    const docRef = db.collection(this.collection).doc(clientId);
    await docRef.update({
      'stats.totalConversations': stats.totalConversations,
      'stats.totalMessages': stats.totalMessages,
      'stats.lastActivity': stats.lastActivity || new Date(),
      'stats.avgResponseTime': stats.avgResponseTime,
      'stats.preferredChannel': stats.preferredChannel,
      'timestamps.updated': new Date(),
      'timestamps.lastSeen': new Date()
    });
  }

  /**
   * Agregar tag al cliente
   * @param {string} clientId - ID del cliente
   * @param {string} tag - Tag a agregar
   * @returns {Promise<void>}
   */
  async addTag(clientId, tag) {
    const docRef = db.collection(this.collection).doc(clientId);
    await docRef.update({
      'metadata.tags': db.FieldValue.arrayUnion(tag),
      'timestamps.updated': new Date()
    });
  }

  /**
   * Buscar clientes con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Array>} - Lista de clientes
   */
  async search(filters = {}, options = {}) {
    let query = db.collection(this.collection).where('isActive', '==', true);

    // Aplicar filtros
    if (filters.name) {
      query = query.where('name', '>=', filters.name)
                  .where('name', '<=', filters.name + '\uf8ff');
    }

    if (filters.email) {
      query = query.where('email', '==', filters.email);
    }

    if (filters.phone) {
      query = query.where('phone', '==', filters.phone);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.where('metadata.tags', 'array-contains-any', filters.tags);
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
   * Validar estructura del cliente
   * @param {Object} client - Cliente a validar
   * @throws {Error} - Error de validación
   */
  validate(client) {
    if (!client.name || client.name.trim().length === 0) {
      throw new Error('El nombre del cliente es requerido');
    }

    if (client.email && !this.isValidEmail(client.email)) {
      throw new Error('Email inválido');
    }

    if (client.phone && !this.isValidPhone(client.phone)) {
      throw new Error('Teléfono inválido');
    }
  }

  /**
   * Validar email
   * @param {string} email - Email a validar
   * @returns {boolean} - Es válido
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar teléfono
   * @param {string} phone - Teléfono a validar
   * @returns {boolean} - Es válido
   */
  isValidPhone(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
}

module.exports = new ClientModel(); 