/**
 * Configuración inicial para tests
 * Setup de Jest, Supertest y mocks necesarios
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const admin = require('firebase-admin');

// Mock de Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      add: jest.fn(),
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      })),
      where: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn()
          })),
          get: jest.fn()
        })),
        limit: jest.fn(() => ({
          get: jest.fn()
        })),
        get: jest.fn()
      })),
      limit: jest.fn(() => ({
        get: jest.fn()
      })),
      get: jest.fn(),
      count: jest.fn(() => ({
        get: jest.fn(() => ({
          data: () => ({ count: 0 })
        }))
      }))
    }))
  }))
}));

// Mock de Twilio
jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn(() => Promise.resolve({
        sid: 'test_message_sid',
        status: 'queued',
        to: '+1234567890',
        from: '+0987654321'
      }))
    },
    api: {
      accounts: jest.fn(() => ({
        fetch: jest.fn(() => Promise.resolve({
          sid: 'test_account_sid',
          friendlyName: 'Test Account',
          status: 'active'
        }))
      }))
    },
    incomingPhoneNumbers: {
      list: jest.fn(() => Promise.resolve([
        { phoneNumber: '+1234567890' }
      ]))
    }
  }));
});

// Variables globales para tests
global.testConfig = {
  jwt: {
    secret: 'test-jwt-secret',
    refreshTokenSecret: 'test-refresh-secret',
    expiresIn: '1h',
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
    issuer: 'test-issuer',
    audience: 'test-audience'
  },
  server: {
    env: 'test',
    port: 3001
  },
  twilio: {
    accountSid: 'test_account_sid',
    authToken: 'test_auth_token',
    phoneNumber: '+1234567890',
    webhookSecret: 'test_webhook_secret'
  }
};

// Setup antes de todos los tests
beforeAll(async () => {
  // Configurar variables de entorno para tests
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = global.testConfig.jwt.secret;
  process.env.JWT_REFRESH_SECRET = global.testConfig.jwt.refreshTokenSecret;
  process.env.TWILIO_ACCOUNT_SID = global.testConfig.twilio.accountSid;
  process.env.TWILIO_AUTH_TOKEN = global.testConfig.twilio.authToken;
  process.env.TWILIO_PHONE_NUMBER = global.testConfig.twilio.phoneNumber;
  process.env.TWILIO_WEBHOOK_SECRET = global.testConfig.twilio.webhookSecret;
  
  // Suprimir logs durante tests
  try {
    const logger = require('../src/utils/logger');
    if (logger && logger.transports) {
      logger.transports.forEach(transport => {
        transport.silent = true;
      });
    }
  } catch (error) {
    // Ignorar errores de logger en tests
  }
});

// Cleanup después de todos los tests
afterAll(async () => {
  // Restaurar logs
  try {
    const logger = require('../src/utils/logger');
    if (logger && logger.transports) {
      logger.transports.forEach(transport => {
        transport.silent = false;
      });
    }
  } catch (error) {
    // Ignorar errores de logger en tests
  }
});

// Utilidades para tests
global.testUtils = {
  /**
   * Crear usuario de prueba
   */
  createTestUser: (overrides = {}) => ({
    id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    role: 'agent',
    department: 'support',
    permissions: ['messages.read', 'messages.write', 'crm.read'],
    isActive: true,
    ...overrides
  }),

  /**
   * Crear admin de prueba
   */
  createTestAdmin: (overrides = {}) => ({
    id: 'test-admin-id',
    username: 'testadmin',
    email: 'admin@example.com',
    name: 'Test Admin',
    role: 'admin',
    department: 'admin',
    permissions: [
      'users.read', 'users.write', 'users.delete',
      'conversations.read', 'conversations.write', 'conversations.delete',
      'messages.read', 'messages.write',
      'campaigns.read', 'campaigns.write', 'campaigns.delete',
      'dashboard.read', 'settings.read', 'settings.write',
      'crm.read', 'crm.write'
    ],
    isActive: true,
    ...overrides
  }),

  /**
   * Generar token JWT de prueba
   */
  generateTestToken: (user) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      global.testConfig.jwt.secret,
      {
        expiresIn: global.testConfig.jwt.expiresIn,
        issuer: global.testConfig.jwt.issuer
      }
    );
  },

  /**
   * Crear headers de autenticación
   */
  createAuthHeaders: (user) => ({
    'Authorization': `Bearer ${global.testUtils.generateTestToken(user)}`
  }),

  /**
   * Crear payload de webhook de Twilio
   */
  createTwilioWebhookPayload: (overrides = {}) => ({
    MessageSid: 'test_message_sid',
    From: 'whatsapp:+1234567890',
    To: 'whatsapp:+0987654321',
    Body: 'Test message',
    NumMedia: '0',
    ProfileName: 'Test User',
    WaId: '1234567890',
    ...overrides
  }),

  /**
   * Crear firma de webhook de Twilio
   */
  createTwilioSignature: (url, params) => {
    const crypto = require('crypto');
    const qs = require('querystring');
    
    const data = url + qs.stringify(params);
    return 'sha1=' + crypto
      .createHmac('sha1', global.testConfig.twilio.webhookSecret)
      .update(data)
      .digest('base64');
  },

  /**
   * Esperar un tiempo determinado
   */
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generar datos aleatorios
   */
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  randomEmail: () => `test${Date.now()}@example.com`,
  
  randomPhone: () => `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`
};

module.exports = global.testUtils; 