/**
 * Modelo de Usuario
 * Gestión completa de usuarios del sistema con autenticación y autorización
 * Incluye registro, login, gestión de roles y seguridad
 */

const { db } = require('../../firebase');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

class UserModel {
  constructor() {
    this.collection = 'users';
    this.saltRounds = 12; // Rounds para bcrypt
  }

  /**
   * Esquema de validación para registro de usuario
   */
  getRegistrationSchema() {
    return Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
        .messages({
          'string.pattern.base': 'Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character'
        }),
      role: Joi.string().valid('admin', 'agent').default('agent'),
      name: Joi.string().min(2).max(50).required(),
      department: Joi.string().valid('support', 'sales', 'billing', 'admin').default('support')
    });
  }

  /**
   * Esquema de validación para login
   */
  getLoginSchema() {
    return Joi.object({
      identifier: Joi.string().required(), // username o email
      password: Joi.string().required()
    });
  }

  /**
   * Crear un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} - Usuario creado (sin password)
   */
  async create(userData) {
    // Validar datos de entrada
    const { error, value } = this.getRegistrationSchema().validate(userData);
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    // Verificar si el usuario ya existe
    const existingUser = await this.findByEmailOrUsername(value.email, value.username);
    if (existingUser) {
      throw new Error('User already exists with this email or username');
    }

    // Hash del password
    const passwordHash = await bcrypt.hash(value.password, this.saltRounds);

    // Crear objeto usuario
    const user = {
      id: uuidv4(),
      username: value.username,
      email: value.email.toLowerCase(),
      passwordHash: passwordHash,
      role: value.role,
      name: value.name,
      department: value.department,
      isActive: true,
      permissions: this.getDefaultPermissions(value.role),
      profile: {
        avatar: null,
        phone: null,
        timezone: 'America/Mexico_City',
        language: 'es'
      },
      stats: {
        totalLogins: 0,
        lastLogin: null,
        lastActivity: null,
        conversationsHandled: 0,
        messagesProcessed: 0
      },
      timestamps: {
        created: new Date(),
        updated: new Date(),
        lastPasswordChange: new Date()
      }
    };

    // Guardar en Firestore
    const docRef = await db.collection(this.collection).add(user);
    user.firestoreId = docRef.id;

    // Retornar usuario sin password
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Buscar usuario por email o username
   * @param {string} email - Email del usuario
   * @param {string} username - Username del usuario
   * @returns {Promise<Object|null>} - Usuario encontrado o null
   */
  async findByEmailOrUsername(email, username) {
    // Buscar por email
    let query = db.collection(this.collection)
      .where('email', '==', email.toLowerCase())
      .where('isActive', '==', true)
      .limit(1);

    let snapshot = await query.get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { firestoreId: doc.id, ...doc.data() };
    }

    // Buscar por username
    query = db.collection(this.collection)
      .where('username', '==', username)
      .where('isActive', '==', true)
      .limit(1);

    snapshot = await query.get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { firestoreId: doc.id, ...doc.data() };
    }

    return null;
  }

  /**
   * Buscar usuario por ID
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object|null>} - Usuario encontrado o null
   */
  async findById(userId) {
    const query = db.collection(this.collection)
      .where('id', '==', userId)
      .where('isActive', '==', true)
      .limit(1);

    const snapshot = await query.get();
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { firestoreId: doc.id, ...doc.data() };
  }

  /**
   * Autenticar usuario (login)
   * @param {string} identifier - Email o username
   * @param {string} password - Password del usuario
   * @returns {Promise<Object>} - Usuario autenticado (sin password)
   */
  async authenticate(identifier, password) {
    // Validar datos de entrada
    const { error } = this.getLoginSchema().validate({ identifier, password });
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    // Buscar usuario
    const user = await this.findByEmailOrUsername(identifier, identifier);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new Error('User account is deactivated');
    }

    // Actualizar estadísticas de login
    await this.updateLoginStats(user.firestoreId);

    // Retornar usuario sin password
    const { passwordHash: _pwd, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Actualizar estadísticas de login
   * @param {string} firestoreId - ID del documento en Firestore
   */
  async updateLoginStats(firestoreId) {
    const admin = require('firebase-admin');
    const docRef = db.collection(this.collection).doc(firestoreId);
    await docRef.update({
      'stats.totalLogins': admin.firestore.FieldValue.increment(1),
      'stats.lastLogin': new Date(),
      'stats.lastActivity': new Date(),
      'timestamps.updated': new Date()
    });
  }

  /**
   * Actualizar última actividad del usuario
   * @param {string} userId - ID del usuario
   */
  async updateLastActivity(userId) {
    const user = await this.findById(userId);
    if (!user) return;

    const docRef = db.collection(this.collection).doc(user.firestoreId);
    await docRef.update({
      'stats.lastActivity': new Date(),
      'timestamps.updated': new Date()
    });
  }

  /**
   * Obtener perfil de usuario (sin datos sensibles)
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} - Perfil del usuario
   */
  async getProfile(userId) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { passwordHash: _hash, ...profile } = user;
    return profile;
  }

  /**
   * Actualizar perfil de usuario
   * @param {string} userId - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async updateProfile(userId, updateData) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Campos permitidos para actualización
    const allowedFields = ['name', 'profile.phone', 'profile.timezone', 'profile.language', 'profile.avatar'];
    const updatePayload = { 'timestamps.updated': new Date() };

    // Filtrar solo campos permitidos
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updatePayload[key] = updateData[key];
      }
    });

    const docRef = db.collection(this.collection).doc(user.firestoreId);
    await docRef.update(updatePayload);

    return await this.getProfile(userId);
  }

  /**
   * Cambiar password del usuario
   * @param {string} userId - ID del usuario
   * @param {string} currentPassword - Password actual
   * @param {string} newPassword - Nuevo password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verificar password actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Validar nuevo password
    const { error } = Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).validate(newPassword);
    if (error) {
      throw new Error('New password does not meet security requirements');
    }

    // Hash del nuevo password
    const newPasswordHash = await bcrypt.hash(newPassword, this.saltRounds);

    // Actualizar en base de datos
    const docRef = db.collection(this.collection).doc(user.firestoreId);
    await docRef.update({
      passwordHash: newPasswordHash,
      'timestamps.updated': new Date(),
      'timestamps.lastPasswordChange': new Date()
    });
  }

  /**
   * Listar usuarios (solo para admins)
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Array>} - Lista de usuarios
   */
  async list(filters = {}, options = {}) {
    let query = db.collection(this.collection);

    // Aplicar filtros
    if (filters.role) {
      query = query.where('role', '==', filters.role);
    }

    if (filters.department) {
      query = query.where('department', '==', filters.department);
    }

    if (filters.isActive !== undefined) {
      query = query.where('isActive', '==', filters.isActive);
    }

    // Ordenar
    query = query.orderBy('timestamps.created', 'desc');

    // Paginación
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.startAfter) {
      query = query.startAfter(options.startAfter);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => {
      const userData = doc.data();
      const { passwordHash: _pass, ...userWithoutPassword } = userData;
      return { firestoreId: doc.id, ...userWithoutPassword };
    });
  }

  /**
   * Activar/Desactivar usuario
   * @param {string} userId - ID del usuario
   * @param {boolean} isActive - Estado activo
   */
  async setActiveStatus(userId, isActive) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const docRef = db.collection(this.collection).doc(user.firestoreId);
    await docRef.update({
      isActive: isActive,
      'timestamps.updated': new Date()
    });
  }

  /**
   * Obtener permisos por defecto según el rol
   * @param {string} role - Rol del usuario
   * @returns {Array} - Lista de permisos
   */
  getDefaultPermissions(role) {
    const permissions = {
      admin: [
        'users.read',
        'users.write',
        'users.delete',
        'conversations.read',
        'conversations.write',
        'conversations.delete',
        'messages.read',
        'messages.write',
        'campaigns.read',
        'campaigns.write',
        'campaigns.delete',
        'dashboard.read',
        'settings.read',
        'settings.write',
        'crm.read',
        'crm.write'
      ],
      agent: [
        'conversations.read',
        'conversations.write',
        'messages.read',
        'messages.write',
        'crm.read',
        'dashboard.read'
      ]
    };

    return permissions[role] || permissions.agent;
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   * @param {Object} user - Usuario
   * @param {string} permission - Permiso a verificar
   * @returns {boolean} - True si tiene el permiso
   */
  hasPermission(user, permission) {
    return user.permissions && user.permissions.includes(permission);
  }

  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise<Object>} - Estadísticas
   */
  async getStats() {
    const snapshot = await db.collection(this.collection).get();
    const users = snapshot.docs.map(doc => doc.data());

    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      byRole: users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}),
      byDepartment: users.reduce((acc, user) => {
        acc[user.department] = (acc[user.department] || 0) + 1;
        return acc;
      }, {}),
      recentLogins: users.filter(u => {
        const lastLogin = u.stats?.lastLogin;
        if (!lastLogin) return false;
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(lastLogin.seconds * 1000) > dayAgo;
      }).length
    };
  }

  /**
   * Validar estructura de usuario
   * @param {Object} user - Usuario a validar
   * @throws {Error} - Error de validación
   */
  validate(user) {
    const required = ['username', 'email', 'passwordHash', 'role'];
    
    for (const field of required) {
      if (!user[field]) {
        throw new Error(`Required field missing: ${field}`);
      }
    }

    const validRoles = ['admin', 'agent'];
    if (!validRoles.includes(user.role)) {
      throw new Error(`Invalid role: ${user.role}`);
    }

    const validDepartments = ['support', 'sales', 'billing', 'admin'];
    if (user.department && !validDepartments.includes(user.department)) {
      throw new Error(`Invalid department: ${user.department}`);
    }
  }
}

module.exports = new UserModel(); 