/**
 * Middleware de Autenticación y Autorización
 * Valida tokens JWT y gestiona permisos por roles
 * Protege endpoints sensibles del sistema
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
const userModel = require('../models/userModel');

/**
 * Middleware de autenticación JWT
 * Valida el token JWT y agrega información del usuario al request
 */
const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.warn('Authentication failed - No authorization header', {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method
      });
      
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authorization header is required'
      });
    }

    // Verificar formato "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.warn('Authentication failed - Invalid authorization format', {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
        authHeader: authHeader.substring(0, 20) + '...'
      });
      
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN_FORMAT',
        message: 'Authorization header must be "Bearer <token>"'
      });
    }

    const token = parts[1];

    // Verificar y decodificar token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret, {
        issuer: config.jwt.issuer
      });
    } catch (error) {
      logger.warn('Authentication failed - Invalid token', {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
        error: error.message
      });

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'TOKEN_EXPIRED',
          message: 'Token has expired'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'INVALID_TOKEN',
          message: 'Invalid token'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'TOKEN_VERIFICATION_FAILED',
        message: 'Token verification failed'
      });
    }

    // Verificar que el usuario existe y está activo
    const user = await userModel.findById(decoded.userId);
    if (!user) {
      logger.warn('Authentication failed - User not found', {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
        userId: decoded.userId
      });
      
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      logger.warn('Authentication failed - User inactive', {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
        userId: decoded.userId,
        username: user.username
      });
      
      return res.status(403).json({
        success: false,
        error: 'ACCOUNT_DEACTIVATED',
        message: 'Your account has been deactivated'
      });
    }

    // Actualizar última actividad del usuario
    await userModel.updateLastActivity(user.id);

    // Agregar información del usuario al request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      department: user.department
    };

    logger.debug('Authentication successful', {
      userId: user.id,
      username: user.username,
      role: user.role,
      url: req.originalUrl,
      method: req.method
    });

    next();

  } catch (error) {
    logger.error('Authentication middleware error', error, {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      error: error.message
    });

    return res.status(500).json({
      success: false,
      error: 'AUTHENTICATION_ERROR',
      message: 'Internal authentication error'
    });
  }
};

/**
 * Middleware de autorización por rol
 * Verifica que el usuario tenga el rol requerido
 * @param {string|Array} allowedRoles - Rol(es) permitidos
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.error('Authorization failed - No user in request', {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method
      });
      
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'User must be authenticated'
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed - Insufficient permissions', {
        userId: req.user.id,
        username: req.user.username,
        userRole: req.user.role,
        requiredRoles: roles,
        url: req.originalUrl,
        method: req.method
      });
      
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to access this resource'
      });
    }

    logger.debug('Authorization successful', {
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      url: req.originalUrl,
      method: req.method
    });

    next();
  };
};

/**
 * Middleware de autorización por permiso específico
 * Verifica que el usuario tenga el permiso requerido
 * @param {string} permission - Permiso requerido
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'User must be authenticated'
      });
    }

    if (!userModel.hasPermission(req.user, permission)) {
      logger.warn('Authorization failed - Missing permission', {
        userId: req.user.id,
        username: req.user.username,
        userPermissions: req.user.permissions,
        requiredPermission: permission,
        url: req.originalUrl,
        method: req.method
      });
      
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: `You do not have the required permission: ${permission}`
      });
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación
 * Agrega información del usuario si el token es válido, pero no falla si no hay token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: config.jwt.issuer
      });

      const user = await userModel.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          department: user.department
        };
      }
    } catch (error) {
      // Ignorar errores de token en autenticación opcional
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error', error);
    next();
  }
};

/**
 * Middleware para verificar ownership de recursos
 * Verifica que el usuario sea el propietario del recurso o sea admin
 * @param {string} resourceIdParam - Nombre del parámetro que contiene el ID del recurso
 * @param {string} ownerField - Campo que contiene el ID del propietario
 */
const requireOwnership = (resourceIdParam, ownerField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'User must be authenticated'
      });
    }

    // Los admins pueden acceder a cualquier recurso
    if (req.user.role === 'admin') {
      return next();
    }

    const resourceId = req.params[resourceIdParam];
    const ownerId = req.body[ownerField] || req.query[ownerField];

    if (ownerId && ownerId !== req.user.id) {
      logger.warn('Ownership verification failed', {
        userId: req.user.id,
        username: req.user.username,
        resourceId,
        ownerId,
        url: req.originalUrl,
        method: req.method
      });
      
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'You can only access your own resources'
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  requirePermission,
  optionalAuth,
  requireOwnership
}; 