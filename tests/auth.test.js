/**
 * Tests de Autenticación
 * Pruebas completas del sistema JWT con refresh tokens
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
require('./setup');

// Mock del app
const app = require('../src/app');

describe('Sistema de Autenticación', () => {
  let testUser, testAdmin, userToken, adminToken;

  beforeEach(() => {
    // Crear usuarios de prueba
    testUser = global.testUtils.createTestUser();
    testAdmin = global.testUtils.createTestAdmin();
    
    // Generar tokens
    userToken = global.testUtils.generateTestToken(testUser);
    adminToken = global.testUtils.generateTestToken(testAdmin);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('POST /api/users/auth/login', () => {
    it('debe permitir login con credenciales válidas', async () => {
      // Mock del modelo de usuario
      const userModel = require('../src/models/userModel');
      userModel.authenticate = jest.fn().mockResolvedValue(testUser);

      // Mock del servicio de refresh tokens
      const refreshTokenService = require('../src/services/refreshTokenService');
      refreshTokenService.generateTokenPair = jest.fn().mockResolvedValue({
        accessToken: userToken,
        refreshToken: 'test-refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer'
      });

      const response = await request(app)
        .post('/api/users/auth/login')
        .send({
          identifier: 'testuser',
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('debe rechazar credenciales inválidas', async () => {
      const userModel = require('../src/models/userModel');
      userModel.authenticate = jest.fn().mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app)
        .post('/api/users/auth/login')
        .send({
          identifier: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_CREDENTIALS');
    });

    it('debe validar formato de entrada', async () => {
      const response = await request(app)
        .post('/api/users/auth/login')
        .send({
          identifier: 'ab', // Muy corto
          password: '123' // Muy corto
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.details).toHaveLength(2);
    });

    it('debe rechazar datos maliciosos', async () => {
      const response = await request(app)
        .post('/api/users/auth/login')
        .send({
          identifier: '<script>alert("xss")</script>',
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/users/auth/refresh', () => {
    it('debe refrescar tokens válidos', async () => {
      const refreshTokenService = require('../src/services/refreshTokenService');
      refreshTokenService.refreshTokens = jest.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer'
      });

      const response = await request(app)
        .post('/api/users/auth/refresh')
        .set('Cookie', ['refreshToken=valid-refresh-token']);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBe('new-access-token');
    });

    it('debe rechazar refresh tokens expirados', async () => {
      const refreshTokenService = require('../src/services/refreshTokenService');
      refreshTokenService.refreshTokens = jest.fn().mockRejectedValue(new Error('Refresh token has expired'));

      const response = await request(app)
        .post('/api/users/auth/refresh')
        .set('Cookie', ['refreshToken=expired-token']);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('REFRESH_TOKEN_EXPIRED');
    });

    it('debe detectar token reuse y comprometer familia', async () => {
      const refreshTokenService = require('../src/services/refreshTokenService');
      refreshTokenService.refreshTokens = jest.fn().mockRejectedValue(new Error('Token family compromised due to reuse'));

      const response = await request(app)
        .post('/api/users/auth/refresh')
        .set('Cookie', ['refreshToken=reused-token']);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('TOKEN_FAMILY_COMPROMISED');
    });

    it('debe rechazar request sin refresh token', async () => {
      const response = await request(app)
        .post('/api/users/auth/refresh');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('REFRESH_TOKEN_MISSING');
    });
  });

  describe('POST /api/users/register', () => {
    it('debe permitir registro por admin', async () => {
      const userModel = require('../src/models/userModel');
      userModel.create = jest.fn().mockResolvedValue({
        id: 'new-user-id',
        username: 'newuser',
        email: 'new@example.com',
        name: 'New User',
        role: 'agent',
        department: 'support',
        isActive: true,
        timestamps: { created: new Date() }
      });

      const response = await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'NewPassword123!',
          name: 'New User',
          role: 'agent'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('newuser');
    });

    it('debe rechazar registro por usuario no-admin', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'NewPassword123!',
          name: 'New User'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('debe validar fortaleza de contraseña', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'weak', // Contraseña débil
          name: 'New User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.details.some(detail => 
        detail.message.includes('Password must contain')
      )).toBe(true);
    });

    it('debe validar formato de email', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'newuser',
          email: 'invalid-email', // Email inválido
          password: 'ValidPassword123!',
          name: 'New User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/users/me/password', () => {
    it('debe permitir cambio de contraseña válido', async () => {
      const userModel = require('../src/models/userModel');
      userModel.changePassword = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'CurrentPassword123!',
          newPassword: 'NewPassword456@'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('debe rechazar contraseña actual incorrecta', async () => {
      const userModel = require('../src/models/userModel');
      userModel.changePassword = jest.fn().mockRejectedValue(new Error('Current password is incorrect'));

      const response = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword456@'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('INVALID_CURRENT_PASSWORD');
    });

    it('debe validar nueva contraseña', async () => {
      const response = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'CurrentPassword123!',
          newPassword: 'weak' // Contraseña débil
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/users/auth/logout', () => {
    it('debe hacer logout correctamente', async () => {
      const refreshTokenService = require('../src/services/refreshTokenService');
      refreshTokenService.revokeRefreshToken = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/users/auth/logout')
        .set('Authorization', `Bearer ${userToken}`)
        .set('Cookie', ['refreshToken=valid-refresh-token']);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(refreshTokenService.revokeRefreshToken).toHaveBeenCalled();
    });

    it('debe limpiar cookies en logout', async () => {
      const response = await request(app)
        .post('/api/users/auth/logout')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      // Verificar que se limpia la cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
    });
  });

  describe('POST /api/users/auth/revoke-all', () => {
    it('debe revocar todos los tokens del usuario', async () => {
      const refreshTokenService = require('../src/services/refreshTokenService');
      refreshTokenService.revokeAllUserTokens = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/users/auth/revoke-all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(refreshTokenService.revokeAllUserTokens).toHaveBeenCalledWith(testUser.id);
    });
  });

  describe('Seguridad y Rate Limiting', () => {
    it('debe aplicar rate limiting en login', async () => {
      // Simular múltiples intentos de login
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/users/auth/login')
            .send({
              identifier: 'testuser',
              password: 'wrong'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Al menos una respuesta debe ser rate limited
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });

    it('debe sanitizar datos de entrada', async () => {
      const response = await request(app)
        .post('/api/users/auth/login')
        .send({
          identifier: '<script>alert("xss")</script>testuser',
          password: 'TestPassword123!'
        });

      // La sanitización debe remover el script
      expect(response.status).toBe(400); // Validation error por el script
    });

    it('debe rechazar tokens JWT inválidos', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('INVALID_TOKEN');
    });

    it('debe rechazar tokens JWT expirados', async () => {
      // Crear token expirado
      const expiredToken = jwt.sign(
        { userId: testUser.id, exp: Math.floor(Date.now() / 1000) - 3600 },
        global.testConfig.jwt.secret
      );

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('TOKEN_EXPIRED');
    });

    it('debe rechazar acceso a rutas protegidas sin token', async () => {
      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('AUTHENTICATION_REQUIRED');
    });

    it('debe rechazar acceso admin a usuarios no-admin', async () => {
      const response = await request(app)
        .get('/api/users/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('Casos Edge', () => {
    it('debe manejar usuarios desactivados', async () => {
      const userModel = require('../src/models/userModel');
      userModel.authenticate = jest.fn().mockRejectedValue(new Error('User account is deactivated'));

      const response = await request(app)
        .post('/api/users/auth/login')
        .send({
          identifier: 'deactivateduser',
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('ACCOUNT_DEACTIVATED');
    });

    it('debe manejar errores de base de datos', async () => {
      const userModel = require('../src/models/userModel');
      userModel.authenticate = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/users/auth/login')
        .send({
          identifier: 'testuser',
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(500);
    });

    it('debe manejar payloads JSON malformados', async () => {
      const response = await request(app)
        .post('/api/users/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
    });

    it('debe manejar headers de autorización malformados', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('INVALID_TOKEN_FORMAT');
    });
  });

  describe('Integración con Refresh Tokens', () => {
    it('debe generar familia de tokens en login', async () => {
      const userModel = require('../src/models/userModel');
      userModel.authenticate = jest.fn().mockResolvedValue(testUser);

      const refreshTokenService = require('../src/services/refreshTokenService');
      const generateTokenPairSpy = jest.fn().mockResolvedValue({
        accessToken: userToken,
        refreshToken: 'test-refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer'
      });
      refreshTokenService.generateTokenPair = generateTokenPairSpy;

      await request(app)
        .post('/api/users/auth/login')
        .send({
          identifier: 'testuser',
          password: 'TestPassword123!'
        });

      expect(generateTokenPairSpy).toHaveBeenCalledWith(testUser);
    });

    it('debe rotar tokens en refresh', async () => {
      const refreshTokenService = require('../src/services/refreshTokenService');
      const refreshTokensSpy = jest.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer'
      });
      refreshTokenService.refreshTokens = refreshTokensSpy;

      await request(app)
        .post('/api/users/auth/refresh')
        .set('Cookie', ['refreshToken=old-refresh-token']);

      expect(refreshTokensSpy).toHaveBeenCalledWith('old-refresh-token');
    });
  });
}); 