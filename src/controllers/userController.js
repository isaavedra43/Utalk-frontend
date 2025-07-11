/**
 * Controlador de Usuarios
 * Maneja todas las operaciones relacionadas con usuarios y autenticación
 * Incluye registro, login, perfil y gestión de usuarios
 */

const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middlewares/errorHandler');
const refreshTokenService = require('../services/refreshTokenService');

class UserController {
  /**
   * Registrar nuevo usuario
   * POST /api/users/register
   */
  register = asyncHandler(async (req, res) => {
    const { username, email, password, role, name, department } = req.body;

    logger.info('Attempting user registration', {
      username,
      email,
      role: role || 'agent',
      department: department || 'support'
    });

    try {
      // Crear usuario
      const user = await userModel.create({
        username,
        email,
        password,
        role: role || 'agent',
        name,
        department: department || 'support'
      });

      logger.info('User registered successfully', {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
            isActive: user.isActive,
            createdAt: user.timestamps.created
          }
        }
      });

    } catch (error) {
      logger.error('User registration failed', error, {
        username,
        email,
        error: error.message
      });

      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'CONFLICT',
          message: 'User already exists with this email or username'
        });
      }

      if (error.message.includes('Validation error')) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.message
        });
      }

      throw error;
    }
  });

  /**
   * Login de usuario
   * POST /api/users/login
   */
  login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    logger.info('Login attempt', {
      identifier,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    try {
      // Autenticar usuario
      const user = await userModel.authenticate(identifier, password);

      // Generar par de tokens (access + refresh)
      const tokenPair = await refreshTokenService.generateTokenPair(user);

      logger.info('User logged in successfully', {
        userId: user.id,
        username: user.username,
        role: user.role,
        ip: req.ip
      });

      // Configurar refresh token como httpOnly cookie
      res.cookie('refreshToken', tokenPair.refreshToken, {
        httpOnly: true,
        secure: config.server.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        path: '/api/users/auth/refresh'
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: tokenPair.accessToken,
          expiresIn: tokenPair.expiresIn,
          tokenType: tokenPair.tokenType,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
            permissions: user.permissions,
            lastLogin: user.stats.lastLogin
          }
        }
      });

    } catch (error) {
      logger.warn('Login failed', {
        identifier,
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      if (error.message.includes('Invalid credentials')) {
        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid username/email or password'
        });
      }

      if (error.message.includes('deactivated')) {
        return res.status(403).json({
          success: false,
          error: 'ACCOUNT_DEACTIVATED',
          message: 'Your account has been deactivated'
        });
      }

      throw error;
    }
  });

  /**
   * Obtener perfil del usuario actual
   * GET /api/users/me
   */
  getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    logger.info('Profile request', {
      userId,
      username: req.user.username
    });

    try {
      const profile = await userModel.getProfile(userId);

      res.json({
        success: true,
        data: {
          user: profile
        }
      });

    } catch (error) {
      logger.error('Failed to get user profile', error, {
        userId,
        error: error.message
      });

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      throw error;
    }
  });

  /**
   * Actualizar perfil del usuario actual
   * PUT /api/users/me
   */
  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updateData = req.body;

    logger.info('Profile update request', {
      userId,
      username: req.user.username,
      fields: Object.keys(updateData)
    });

    try {
      const updatedUser = await userModel.updateProfile(userId, updateData);

      logger.info('Profile updated successfully', {
        userId,
        username: req.user.username
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser
        }
      });

    } catch (error) {
      logger.error('Failed to update profile', error, {
        userId,
        error: error.message
      });

      throw error;
    }
  });

  /**
   * Cambiar password del usuario actual
   * PUT /api/users/me/password
   */
  changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    logger.info('Password change request', {
      userId,
      username: req.user.username
    });

    try {
      await userModel.changePassword(userId, currentPassword, newPassword);

      logger.info('Password changed successfully', {
        userId,
        username: req.user.username
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      logger.warn('Password change failed', {
        userId,
        username: req.user.username,
        error: error.message
      });

      if (error.message.includes('Current password is incorrect')) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect'
        });
      }

      if (error.message.includes('security requirements')) {
        return res.status(400).json({
          success: false,
          error: 'WEAK_PASSWORD',
          message: 'New password does not meet security requirements'
        });
      }

      throw error;
    }
  });

  /**
   * Listar usuarios (solo admin)
   * GET /api/users
   */
  listUsers = asyncHandler(async (req, res) => {
    const { role, department, isActive, limit, page } = req.query;

    logger.info('Users list request', {
      requestedBy: req.user.username,
      filters: { role, department, isActive },
      pagination: { limit, page }
    });

    try {
      const filters = {};
      if (role) filters.role = role;
      if (department) filters.department = department;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (page && limit) options.startAfter = (parseInt(page) - 1) * parseInt(limit);

      const users = await userModel.list(filters, options);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            total: users.length
          }
        }
      });

    } catch (error) {
      logger.error('Failed to list users', error, {
        requestedBy: req.user.username,
        error: error.message
      });

      throw error;
    }
  });

  /**
   * Activar/Desactivar usuario (solo admin)
   * PUT /api/users/:userId/status
   */
  setUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { isActive } = req.body;

    logger.info('User status change request', {
      requestedBy: req.user.username,
      targetUserId: userId,
      newStatus: isActive
    });

    try {
      await userModel.setActiveStatus(userId, isActive);

      logger.info('User status changed successfully', {
        requestedBy: req.user.username,
        targetUserId: userId,
        newStatus: isActive
      });

      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
      });

    } catch (error) {
      logger.error('Failed to change user status', error, {
        requestedBy: req.user.username,
        targetUserId: userId,
        error: error.message
      });

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      throw error;
    }
  });

  /**
   * Obtener estadísticas de usuarios (solo admin)
   * GET /api/users/stats
   */
  getUserStats = asyncHandler(async (req, res) => {
    logger.info('User stats request', {
      requestedBy: req.user.username
    });

    try {
      const stats = await userModel.getStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });

    } catch (error) {
      logger.error('Failed to get user stats', error, {
        requestedBy: req.user.username,
        error: error.message
      });

      throw error;
    }
  });

  /**
   * Generar JWT token
   * @param {Object} user - Usuario
   * @returns {string} - JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: config.jwt.issuer
    });
  }

  /**
   * Verificar JWT token
   * @param {string} token - JWT token
   * @returns {Object} - Payload decodificado
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret, {
        issuer: config.jwt.issuer
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Refrescar tokens
   * POST /api/users/auth/refresh
   */
  refreshTokens = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      logger.warn('Refresh token missing in request', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(401).json({
        success: false,
        error: 'REFRESH_TOKEN_MISSING',
        message: 'Refresh token not provided'
      });
    }

    try {
      // Refrescar tokens
      const newTokenPair = await refreshTokenService.refreshTokens(refreshToken);

      logger.info('Tokens refreshed successfully', {
        ip: req.ip
      });

      // Configurar nuevo refresh token como httpOnly cookie
      res.cookie('refreshToken', newTokenPair.refreshToken, {
        httpOnly: true,
        secure: config.server.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        path: '/api/users/auth/refresh'
      });

      res.json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          accessToken: newTokenPair.accessToken,
          expiresIn: newTokenPair.expiresIn,
          tokenType: newTokenPair.tokenType
        }
      });

    } catch (error) {
      logger.warn('Token refresh failed', {
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Limpiar cookie en caso de error
      res.clearCookie('refreshToken', {
        path: '/api/users/auth/refresh'
      });

      if (error.message.includes('expired')) {
        return res.status(401).json({
          success: false,
          error: 'REFRESH_TOKEN_EXPIRED',
          message: 'Refresh token has expired'
        });
      }

      if (error.message.includes('compromised')) {
        return res.status(401).json({
          success: false,
          error: 'TOKEN_FAMILY_COMPROMISED',
          message: 'Token family compromised. Please login again.'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token'
      });
    }
  });

  /**
   * Logout (invalidar refresh token)
   * POST /api/users/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const refreshToken = req.cookies.refreshToken;

    logger.info('User logout', {
      userId,
      username: req.user?.username
    });

    try {
      // Revocar refresh token si existe
      if (refreshToken) {
        await refreshTokenService.revokeRefreshToken(refreshToken);
      }

      // Limpiar cookie
      res.clearCookie('refreshToken', {
        path: '/api/users/auth/refresh'
      });

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      logger.error('Error during logout', error);
      
      // Limpiar cookie aunque haya error
      res.clearCookie('refreshToken', {
        path: '/api/users/auth/refresh'
      });

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    }
  });

  /**
   * Revocar todos los tokens del usuario
   * POST /api/users/auth/revoke-all
   */
  revokeAllTokens = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    logger.info('Revoking all user tokens', {
      userId,
      username: req.user.username
    });

    try {
      await refreshTokenService.revokeAllUserTokens(userId);

      // Limpiar cookie actual
      res.clearCookie('refreshToken', {
        path: '/api/users/auth/refresh'
      });

      res.json({
        success: true,
        message: 'All tokens revoked successfully'
      });

    } catch (error) {
      logger.error('Error revoking all tokens', error);
      throw error;
    }
  });
}

module.exports = new UserController(); 