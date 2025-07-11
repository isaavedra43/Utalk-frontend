/**
 * Rutas de API para el módulo de Users (Usuarios)
 * IMPLEMENTADO - Sistema completo de autenticación y gestión de usuarios
 * 
 * Funcionalidades:
 * - Autenticación JWT completa
 * - Registro y login de usuarios
 * - Gestión de perfiles
 * - Roles y permisos
 * - Autorización por endpoints
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const userController = require('../controllers/userController');
const { authenticate, authorize, requirePermission } = require('../middlewares/auth');
const { authRateLimit, authSlowDown, registrationRateLimit, adminRateLimit } = require('../middlewares/rateLimiting');
const { validators, sanitizeInput } = require('../middlewares/validation');

// Middleware para logging de requests
router.use((req, res, next) => {
  logger.info(`Users API: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

/**
 * POST /auth/login
 * Iniciar sesión de usuario
 * IMPLEMENTADO - Autenticación JWT completa con protección anti-brute force
 */
router.post('/auth/login', sanitizeInput, validators.validateLogin, authRateLimit, authSlowDown, userController.login);

/**
 * POST /auth/refresh
 * Refrescar tokens JWT
 * IMPLEMENTADO - Sistema de refresh tokens con rotación segura
 */
router.post('/auth/refresh', userController.refreshTokens);

/**
 * POST /auth/revoke-all
 * Revocar todos los tokens del usuario
 * IMPLEMENTADO - Invalidar todas las sesiones del usuario
 */
router.post('/auth/revoke-all', authenticate, userController.revokeAllTokens);

/**
 * POST /auth/logout
 * Cerrar sesión de usuario
 * IMPLEMENTADO - Logout con JWT
 */
router.post('/auth/logout', authenticate, userController.logout);

/**
 * POST /register
 * Registrar nuevo usuario (solo admin)
 * IMPLEMENTADO - Registro con validación y rate limiting
 */
router.post('/register', sanitizeInput, validators.validateRegister, authenticate, authorize('admin'), registrationRateLimit, userController.register);

/**
 * GET /me
 * Obtener perfil del usuario actual
 * IMPLEMENTADO - Perfil autenticado
 */
router.get('/me', authenticate, userController.getProfile);

/**
 * PUT /me
 * Actualizar perfil del usuario actual
 * IMPLEMENTADO - Actualización de perfil
 */
router.put('/me', authenticate, userController.updateProfile);

/**
 * PUT /me/password
 * Cambiar password del usuario actual
 * IMPLEMENTADO - Cambio de contraseña
 */
router.put('/me/password', sanitizeInput, validators.validateChangePassword, authenticate, userController.changePassword);

/**
 * GET /users
 * Obtener lista de usuarios (solo admin)
 * IMPLEMENTADO - Listado con filtros y rate limiting
 */
router.get('/users', validators.validateUserFilters, authenticate, authorize('admin'), adminRateLimit, userController.listUsers);

/**
 * GET /stats
 * Obtener estadísticas de usuarios (solo admin)
 * IMPLEMENTADO - Estadísticas completas
 */
router.get('/stats', authenticate, authorize('admin'), userController.getUserStats);

/**
 * PUT /users/:userId/status
 * Activar/Desactivar usuario (solo admin)
 * IMPLEMENTADO - Gestión de estado
 */
router.put('/users/:userId/status', validators.validateUserId, authenticate, authorize('admin'), userController.setUserStatus);

// Endpoints adicionales para futuras implementaciones
// TODO: Implementar cuando sea necesario
// - GET /users/:userId - Detalles de usuario específico
// - PUT /users/:userId - Actualizar usuario específico
// - DELETE /users/:userId - Desactivar usuario
// - GET /users/:userId/activity - Actividad de usuario

/**
 * GET /health
 * Health check específico para Users
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    module: 'users',
    implementation: 'placeholder',
    timestamp: new Date().toISOString(),
    nextSteps: [
      'Implementar autenticación JWT',
      'Crear sistema de roles y permisos',
      'Desarrollar gestión de perfiles',
      'Implementar tracking de actividad',
      'Crear sistema de sesiones',
      'Desarrollar audit log',
      'Implementar 2FA (autenticación de dos factores)',
      'Crear sistema de invitaciones'
    ]
  });
});

module.exports = router; 