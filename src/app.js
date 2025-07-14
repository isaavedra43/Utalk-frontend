/**
 * Aplicación principal Express
 * Configuración de middlewares, rutas y manejo de errores
 * Punto de entrada para el backend omnicanal
 * ACTUALIZADO: Integración completa fullstack con frontend React
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

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

// CORS OPTIMIZADO PARA FULLSTACK: Solo para APIs externas si es necesario
// En modo fullstack (mismo dominio), CORS no es necesario para el frontend
if (config.server.env === 'development' || process.env.ENABLE_EXTERNAL_API === 'true') {
  app.use('/api', cors(config.server.cors));
  logger.info('CORS habilitado solo para rutas /api/*');
}

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

// Health check - DEBE ir ANTES de servir archivos estáticos
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    frontend: 'integrated',
    backend: 'running'
  });
});

// Rutas principales de API - ANTES de archivos estáticos
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

// INTEGRACIÓN FULLSTACK: Servir archivos estáticos del frontend
const frontendDistPath = path.join(__dirname, '../dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');

// Verificar si existe el build del frontend
const fs = require('fs');
if (fs.existsSync(frontendDistPath)) {
  logger.info(`Frontend servido desde: ${frontendDistPath}`);
  
  // Servir archivos estáticos del frontend
  app.use(express.static(frontendDistPath, {
    maxAge: config.server.env === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Cache específico para diferentes tipos de archivos
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  }));

  // FALLBACK SPA: Todas las rutas no-API devuelven index.html
  app.get('*', (req, res, next) => {
    // Solo para rutas que no son API ni archivos estáticos
    if (req.path.startsWith('/api/')) {
      return next(); // Pasar al notFoundHandler para APIs
    }
    
    // Verificar si el archivo existe antes de servir index.html
    if (fs.existsSync(frontendIndexPath)) {
      res.sendFile(frontendIndexPath);
    } else {
      logger.error(`Frontend index.html no encontrado en: ${frontendIndexPath}`);
      res.status(500).json({
        error: 'Frontend not built',
        message: 'Run npm run build to generate frontend assets'
      });
    }
  });
} else {
  logger.warn(`Frontend no encontrado en: ${frontendDistPath}`);
  logger.warn('Ejecuta "npm run build" para generar archivos del frontend');
  
  // Ruta por defecto cuando no hay frontend buildeado
  app.get('/', (req, res) => {
    res.json({
      message: 'Backend Omnicanal - Sistema de Mensajería Empresarial',
      version: '1.0.0',
      channels: ['twilio', 'facebook', 'email', 'webchat'],
      modules: ['crm', 'campaigns', 'dashboard', 'settings', 'users'],
      warning: 'Frontend not built. Run: npm run build'
    });
  });
}

// Manejo de rutas API no encontradas
app.use('/api/*', notFoundHandler);

// Middleware de manejo de errores
app.use(errorHandler);

module.exports = app; 