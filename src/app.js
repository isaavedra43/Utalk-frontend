/**
 * Aplicación principal Express
 * Configuración de middlewares, rutas y manejo de errores
 * Punto de entrada para el backend omnicanal
 * FULLSTACK MONOREPO: Integración completa con frontend React
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

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

// Rate limiting global (ANTES de CORS y rutas)
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

// FULLSTACK: Paths del frontend
const frontendDistPath = path.join(__dirname, '../dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');

// STEP 1: SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND (ANTES de las rutas API)
if (fs.existsSync(frontendDistPath)) {
  logger.info(`✅ Frontend encontrado en: ${frontendDistPath}`);
  
  app.use(express.static(frontendDistPath, {
    maxAge: config.server.env === 'production' ? '31536000000' : '0', // 1 año en prod, 0 en dev
    etag: true,
    lastModified: true,
    index: false, // IMPORTANTE: No servir index.html automáticamente
    setHeaders: (res, filePath) => {
      // Cache busting: HTML sin cache, assets con cache largo
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } else if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));
} else {
  logger.warn(`⚠️ Frontend no encontrado en: ${frontendDistPath}`);
  logger.warn(`   Ejecuta 'npm run build' para generar el frontend`);
}

// STEP 2: CORS APLICADO SOLO A RUTAS API
app.use('/api', cors(config.server.cors));
logger.info(`🔒 CORS configurado para rutas /api/*`);

// STEP 3: HEALTH CHECK (ANTES de rutas API)
app.get('/health', (req, res) => {
  const frontendExists = fs.existsSync(frontendDistPath);
  const frontendIndexExists = fs.existsSync(frontendIndexPath);
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    services: {
      backend: 'running',
      frontend: frontendExists ? 'available' : 'not_built',
      frontendIndex: frontendIndexExists ? 'available' : 'missing'
    },
    version: '1.0.0'
  });
});

// STEP 4: RUTAS DE API (DESPUÉS de archivos estáticos)
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

// STEP 5: FALLBACK SPA UNIVERSAL (MANEJA TODOS LOS MÉTODOS HTTP Y RUTAS NO-API)
app.use('*', (req, res, next) => {
  // Si es una ruta API, pasar al notFoundHandler
  if (req.originalUrl.startsWith('/api/')) {
    return next();
  }
  
  // Si NO es GET, redirigir a la SPA para que React Router maneje
  if (req.method !== 'GET') {
    return res.redirect('/');
  }
  
  // Servir index.html para todas las rutas de frontend
  if (fs.existsSync(frontendIndexPath)) {
    return res.sendFile(frontendIndexPath, (err) => {
      if (err) {
        logger.error(`Error sirviendo index.html: ${err.message}`);
        res.status(500).json({
          error: 'Frontend Error',
          message: 'Unable to serve frontend application'
        });
      }
    });
  } else {
    // Si no hay frontend buildeado, mostrar mensaje informativo
    res.status(503).json({
      error: 'Frontend Not Available',
      message: 'Frontend not built. Run: npm run build',
      backend: 'running',
      suggestion: 'The backend API is available at /api/*'
    });
  }
});

// STEP 6: MANEJO DE RUTAS API NO ENCONTRADAS
app.use('/api/*', notFoundHandler);

// STEP 7: MIDDLEWARE DE MANEJO DE ERRORES (AL FINAL)
app.use(errorHandler);

module.exports = app; 