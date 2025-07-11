/**
 * Aplicación principal Express
 * Configuración de middlewares, rutas y manejo de errores
 * Punto de entrada para el backend omnicanal
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const { errorHandler, notFoundHandler, jsonErrorHandler } = require('./middlewares/errorHandler');
const { validateEnvironment, showConfigSummary } = require('./utils/envValidation');
const { generalRateLimit } = require('./middlewares/rateLimiting');
const { captureRawBody } = require('./middlewares/twilioSecurity');
const logger = require('./utils/logger');

// Validar variables de entorno al inicio
const env = validateEnvironment();
showConfigSummary(env);

// Inicializar Firebase
require('../firebase');

// Importar rutas
const twilioRoutes = require('./api/channels/twilio');
const facebookRoutes = require('./api/channels/facebook');
const emailRoutes = require('./api/channels/email');
const webchatRoutes = require('./api/channels/webchat');
const crmRoutes = require('./api/crm');
const campaignsRoutes = require('./api/campaigns');
const dashboardRoutes = require('./api/dashboard');
const settingsRoutes = require('./api/settings');
const usersRoutes = require('./api/users');
const healthRoutes = require('./api/health');

const app = express();

// Configurar trust proxy si es necesario
if (env.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

// Middleware para capturar raw body (necesario para validación de webhooks)
app.use(captureRawBody);

// Middlewares de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors(config.server.cors));

// Rate limiting global
app.use(generalRateLimit);

// Middleware para manejar errores de parsing JSON
app.use(jsonErrorHandler);

// Middlewares de parsing
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Guardar raw body para validación de webhooks
    if (req.originalUrl && req.originalUrl.includes('/webhook')) {
      req.rawBody = buf.toString('utf8');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', { stream: logger.stream }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.server.env
  });
});

// Rutas principales
app.use('/api/channels/twilio', twilioRoutes);
app.use('/api/channels/facebook', facebookRoutes);
app.use('/api/channels/email', emailRoutes);
app.use('/api/channels/webchat', webchatRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api', healthRoutes);

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({
    message: 'Backend Omnicanal - Sistema de Mensajería Empresarial',
    version: '1.0.0',
    channels: ['twilio', 'facebook', 'email', 'webchat'],
    modules: ['crm', 'campaigns', 'dashboard', 'settings', 'users']
  });
});

// Manejo de rutas no encontradas
app.use('*', notFoundHandler);

// Middleware de manejo de errores
app.use(errorHandler);

module.exports = app; 