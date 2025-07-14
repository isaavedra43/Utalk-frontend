/**
 * Aplicación principal Express
 * Configuración de middlewares, rutas y manejo de errores
 * Punto de entrada para el backend omnicanal
 * ENTERPRISE FULLSTACK: Integración optimizada con frontend React
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs').promises;

const config = require('./config');
const { errorHandler, notFoundHandler, jsonErrorHandler } = require('./middlewares/errorHandler');
const { validateEnvironment, showConfigSummary } = require('./utils/envValidation');
const { generalRateLimit, apiRateLimit } = require('./middlewares/rateLimiting');
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

// Configurar trust proxy para Railway/producción
if (env.TRUST_PROXY || config.server.env === 'production') {
  app.set('trust proxy', 1);
  logger.info('Trust proxy habilitado para Railway/producción');
}

// ENTERPRISE FEATURE: Compresión gzip para todos los responses
app.use(compression({
  filter: (req, res) => {
    // No comprimir si el cliente no lo soporta
    if (req.headers['x-no-compression']) return false;
    // Comprimir todo excepto imágenes ya comprimidas
    return compression.filter(req, res);
  },
  level: config.server.env === 'production' ? 6 : 1, // Más agresivo en producción
  threshold: 1024 // Solo comprimir archivos > 1KB
}));

// Middleware para capturar raw body (necesario para validación de webhooks)
app.use(captureRawBody);

// Middlewares de seguridad enterprise
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "wss:", "ws:"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: config.server.env === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: config.server.env === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false
}));

// Rate limiting diferenciado
app.use('/api', apiRateLimit); // Más estricto para APIs
app.use(generalRateLimit); // General para frontend

// Middleware para manejar errores de parsing JSON
app.use(jsonErrorHandler);

// Middlewares de parsing con límites enterprise
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

// Logging estructurado
if (config.server.env !== 'test') {
  app.use(morgan('combined', { 
    stream: logger.stream,
    skip: (req, res) => {
      // Skip logs de assets estáticos en producción
      return config.server.env === 'production' && 
             req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/);
    }
  }));
}

// ENTERPRISE FULLSTACK: Cache frontend inteligente
let frontendCache = {
  distExists: false,
  indexExists: false,
  indexPath: null,
  lastCheck: 0,
  TTL: 30000 // Cache por 30 segundos
};

// Función para verificar frontend (asíncrona con cache)
async function checkFrontendStatus() {
  const now = Date.now();
  
  // Usar cache si no ha expirado
  if (now - frontendCache.lastCheck < frontendCache.TTL) {
    return frontendCache;
  }
  
  try {
    const frontendDistPath = path.join(__dirname, '../dist');
    const frontendIndexPath = path.join(frontendDistPath, 'index.html');
    
    // Verificaciones asíncronas paralelas
    const [distStats, indexStats] = await Promise.allSettled([
      fs.stat(frontendDistPath),
      fs.stat(frontendIndexPath)
    ]);
    
    frontendCache = {
      distExists: distStats.status === 'fulfilled' && distStats.value.isDirectory(),
      indexExists: indexStats.status === 'fulfilled' && indexStats.value.isFile(),
      indexPath: frontendIndexPath,
      lastCheck: now,
      TTL: frontendCache.TTL
    };
    
    if (frontendCache.distExists && frontendCache.indexExists) {
      logger.debug(`✅ Frontend verificado: dist OK, index OK`);
    } else {
      logger.warn(`⚠️ Frontend incompleto: dist=${frontendCache.distExists}, index=${frontendCache.indexExists}`);
    }
    
  } catch (error) {
    logger.error(`Error verificando frontend: ${error.message}`);
    frontendCache = {
      distExists: false,
      indexExists: false,
      indexPath: null,
      lastCheck: now,
      TTL: frontendCache.TTL
    };
  }
  
  return frontendCache;
}

// Inicializar cache al startup
checkFrontendStatus().then(status => {
  logger.info(`🔧 Frontend inicial: ${status.distExists ? 'OK' : 'NO_BUILD'}`);
});

// STEP 1: SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND (ANTES de rutas API)
const frontendDistPath = path.join(__dirname, '../dist');

app.use(express.static(frontendDistPath, {
  maxAge: config.server.env === 'production' ? '31536000000' : '3600000', // 1 año prod, 1 hora dev
  etag: true,
  lastModified: true,
  index: false, // CRÍTICO: No servir index.html automáticamente
  immutable: config.server.env === 'production',
  setHeaders: (res, filePath, stat) => {
    const ext = path.extname(filePath).toLowerCase();
    
    // Cache específico por tipo de archivo
    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (ext.match(/\.(js|css)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (ext.match(/\.(png|jpg|jpeg|gif|ico|svg|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else if (ext.match(/\.(woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    // Security headers para assets
    if (ext.match(/\.(js|css)$/)) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }
}));

// STEP 2: CORS APLICADO SOLO A RUTAS API
app.use('/api', cors(config.server.cors));
logger.info(`🔒 CORS configurado para rutas /api/* únicamente`);

// STEP 3: HEALTH CHECK ENTERPRISE (ANTES de rutas API)
app.get('/health', async (req, res) => {
  try {
    const frontendStatus = await checkFrontendStatus();
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.server.env,
      version: '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      services: {
        backend: 'running',
        frontend: frontendStatus.indexExists ? 'available' : 'not_built',
        database: 'unknown', // TODO: Add DB health check
        cache: 'ok'
      }
    };
    
    // Determinar status code basado en servicios críticos
    const statusCode = frontendStatus.indexExists ? 200 : 503;
    res.status(statusCode).json(healthData);
    
  } catch (error) {
    logger.error(`Health check error: ${error.message}`);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      environment: config.server.env
    });
  }
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

// STEP 5: FALLBACK SPA ENTERPRISE - MANEJA TODOS LOS MÉTODOS HTTP
app.use('*', async (req, res, next) => {
  try {
    // Si es una ruta API, pasar al notFoundHandler
    if (req.originalUrl.startsWith('/api/')) {
      return next();
    }
    
    // Para métodos no-GET, redirigir a la raíz para que React Router maneje
    if (req.method !== 'GET') {
      logger.debug(`SPA redirect: ${req.method} ${req.originalUrl} → GET /`);
      return res.redirect(302, '/');
    }
    
    // Verificar estado del frontend (con cache)
    const frontendStatus = await checkFrontendStatus();
    
    if (frontendStatus.indexExists) {
      // Servir index.html para rutas SPA
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      
      return res.sendFile(frontendStatus.indexPath, (err) => {
        if (err) {
          logger.error(`Error sirviendo SPA: ${err.message}`);
          res.status(500).json({
            error: 'Frontend Error',
            message: 'Unable to serve frontend application',
            timestamp: new Date().toISOString()
          });
        }
      });
    } else {
      // Frontend no disponible - respuesta informativa
      logger.warn(`Frontend no disponible para: ${req.originalUrl}`);
      res.status(503).json({
        error: 'Frontend Not Available',
        message: 'Frontend not built. Run: npm run build',
        backend: 'running',
        suggestion: 'The backend API is available at /api/*',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    logger.error(`SPA fallback error: ${error.message}`);
    next(error);
  }
});

// STEP 6: MANEJO DE RUTAS API NO ENCONTRADAS (404 específico)
app.use('/api/*', (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      type: 'NOT_FOUND',
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
      timestamp: new Date().toISOString(),
      suggestion: 'Check the API documentation for available endpoints'
    }
  });
});

// STEP 7: MIDDLEWARE DE MANEJO DE ERRORES ENTERPRISE (AL FINAL)
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('🔄 SIGTERM recibido, iniciando graceful shutdown...');
  // TODO: Cerrar conexiones DB, limpiar recursos
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🔄 SIGINT recibido, iniciando graceful shutdown...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app; 