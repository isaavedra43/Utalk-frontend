/**
 * Health Checks Avanzados
 * Verifica el estado de todos los servicios externos y internos
 * Proporciona métricas detalladas para monitoreo
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const config = require('../config');
const { authenticate, authorize } = require('../middlewares/auth');
const refreshTokenService = require('../services/refreshTokenService');

/**
 * GET /health
 * Health check básico - público
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    version: '1.0.0',
    uptime: process.uptime()
  });
});

/**
 * GET /health/detailed
 * Health check detallado - requiere autenticación
 */
router.get('/health/detailed', authenticate, authorize('admin'), async (req, res) => {
  const startTime = Date.now();
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    version: '1.0.0',
    uptime: process.uptime(),
    checks: {},
    metrics: {},
    errors: []
  };

  try {
    // 1. Verificar Firebase/Firestore
    const firebaseStatus = await checkFirebaseHealth();
    healthStatus.checks.firebase = firebaseStatus;

    // 2. Verificar Twilio
    const twilioStatus = await checkTwilioHealth();
    healthStatus.checks.twilio = twilioStatus;

    // 3. Verificar sistema de tokens
    const tokenStatus = await checkTokenSystemHealth();
    healthStatus.checks.tokens = tokenStatus;

    // 4. Verificar memoria y CPU
    const systemStatus = checkSystemHealth();
    healthStatus.checks.system = systemStatus;

    // 5. Verificar logs
    const logsStatus = checkLogsHealth();
    healthStatus.checks.logs = logsStatus;

    // 6. Métricas generales
    healthStatus.metrics = await getSystemMetrics();

    // Determinar estado general
    const allChecks = Object.values(healthStatus.checks);
    const failedChecks = allChecks.filter(check => check.status !== 'OK');
    
    if (failedChecks.length > 0) {
      healthStatus.status = 'DEGRADED';
      healthStatus.errors = failedChecks.map(check => check.error).filter(Boolean);
    }

    // Si hay errores críticos, marcar como DOWN
    const criticalErrors = failedChecks.filter(check => check.critical);
    if (criticalErrors.length > 0) {
      healthStatus.status = 'DOWN';
    }

    healthStatus.responseTime = Date.now() - startTime;

    logger.info('Detailed health check completed', {
      status: healthStatus.status,
      responseTime: healthStatus.responseTime,
      failedChecks: failedChecks.length,
      requestedBy: req.user.username
    });

    const statusCode = healthStatus.status === 'OK' ? 200 : 
                      healthStatus.status === 'DEGRADED' ? 200 : 503;

    res.status(statusCode).json(healthStatus);

  } catch (error) {
    logger.error('Health check failed', error);
    
    healthStatus.status = 'DOWN';
    healthStatus.errors = [error.message];
    healthStatus.responseTime = Date.now() - startTime;

    res.status(503).json(healthStatus);
  }
});

/**
 * GET /health/firebase
 * Health check específico para Firebase
 */
router.get('/health/firebase', authenticate, authorize('admin'), async (req, res) => {
  try {
    const firebaseStatus = await checkFirebaseHealth();
    res.json(firebaseStatus);
  } catch (error) {
    logger.error('Firebase health check failed', error);
    res.status(503).json({
      status: 'DOWN',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /health/twilio
 * Health check específico para Twilio
 */
router.get('/health/twilio', authenticate, authorize('admin'), async (req, res) => {
  try {
    const twilioStatus = await checkTwilioHealth();
    res.json(twilioStatus);
  } catch (error) {
    logger.error('Twilio health check failed', error);
    res.status(503).json({
      status: 'DOWN',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /health/tokens
 * Health check específico para el sistema de tokens
 */
router.get('/health/tokens', authenticate, authorize('admin'), async (req, res) => {
  try {
    const tokenStatus = await checkTokenSystemHealth();
    res.json(tokenStatus);
  } catch (error) {
    logger.error('Token system health check failed', error);
    res.status(503).json({
      status: 'DOWN',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Verificar salud de Firebase/Firestore
 */
async function checkFirebaseHealth() {
  const startTime = Date.now();
  
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    // Test de escritura
    const testDoc = db.collection('_health_check').doc('test');
    await testDoc.set({
      timestamp: new Date(),
      test: 'health_check'
    });
    
    // Test de lectura
    const doc = await testDoc.get();
    if (!doc.exists) {
      throw new Error('Failed to read test document');
    }
    
    // Limpiar documento de prueba
    await testDoc.delete();
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'OK',
      service: 'Firebase/Firestore',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      operations: {
        write: 'OK',
        read: 'OK',
        delete: 'OK'
      }
    };
    
  } catch (error) {
    return {
      status: 'DOWN',
      service: 'Firebase/Firestore',
      error: error.message,
      timestamp: new Date().toISOString(),
      critical: true
    };
  }
}

/**
 * Verificar salud de Twilio
 */
async function checkTwilioHealth() {
  const startTime = Date.now();
  
  try {
    const twilio = require('twilio');
    const client = twilio(config.twilio.accountSid, config.twilio.authToken);
    
    // Verificar cuenta
    const account = await client.api.accounts(config.twilio.accountSid).fetch();
    
    // Verificar balance (si está disponible)
    let balance = null;
    try {
      const balanceData = await client.api.accounts(config.twilio.accountSid).balance.fetch();
      balance = balanceData.balance;
    } catch (error) {
      // Balance no disponible en algunas cuentas
    }
    
    // Verificar número de teléfono
    let phoneNumber = null;
    try {
      const numbers = await client.incomingPhoneNumbers.list({ limit: 1 });
      phoneNumber = numbers.length > 0 ? numbers[0].phoneNumber : null;
    } catch (error) {
      // Números no disponibles
    }
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'OK',
      service: 'Twilio',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      account: {
        sid: account.sid,
        name: account.friendlyName,
        status: account.status,
        balance: balance,
        phoneNumber: phoneNumber
      }
    };
    
  } catch (error) {
    return {
      status: 'DOWN',
      service: 'Twilio',
      error: error.message,
      timestamp: new Date().toISOString(),
      critical: true
    };
  }
}

/**
 * Verificar salud del sistema de tokens
 */
async function checkTokenSystemHealth() {
  try {
    const stats = await refreshTokenService.getTokenStats();
    
    // Verificar si hay demasiados tokens comprometidos
    const compromisedRatio = stats.compromisedFamilies / (stats.activeTokens + stats.revokedTokens + 1);
    const isHealthy = compromisedRatio < 0.1; // Menos del 10% comprometidos
    
    return {
      status: isHealthy ? 'OK' : 'WARNING',
      service: 'Token System',
      timestamp: new Date().toISOString(),
      stats: stats,
      health: {
        compromisedRatio: Math.round(compromisedRatio * 100) / 100,
        isHealthy: isHealthy,
        warning: !isHealthy ? 'High number of compromised token families' : null
      }
    };
    
  } catch (error) {
    return {
      status: 'DOWN',
      service: 'Token System',
      error: error.message,
      timestamp: new Date().toISOString(),
      critical: false
    };
  }
}

/**
 * Verificar salud del sistema (memoria, CPU)
 */
function checkSystemHealth() {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  // Convertir a MB
  const memoryMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024)
  };
  
  // Verificar límites
  const memoryWarning = memoryMB.heapUsed > 500; // 500MB
  const memoryError = memoryMB.heapUsed > 1000; // 1GB
  
  let status = 'OK';
  let warnings = [];
  
  if (memoryError) {
    status = 'CRITICAL';
    warnings.push('Memory usage is critically high');
  } else if (memoryWarning) {
    status = 'WARNING';
    warnings.push('Memory usage is high');
  }
  
  return {
    status: status,
    service: 'System Resources',
    timestamp: new Date().toISOString(),
    memory: memoryMB,
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    warnings: warnings
  };
}

/**
 * Verificar salud de logs
 */
function checkLogsHealth() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    const logFiles = ['error.log', 'combined.log'];
    
    const fileStats = {};
    let totalSize = 0;
    
    for (const file of logFiles) {
      const filePath = path.join(logsDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        fileStats[file] = {
          size: Math.round(stats.size / 1024 / 1024), // MB
          lastModified: stats.mtime
        };
        totalSize += stats.size;
      }
    }
    
    const totalSizeMB = Math.round(totalSize / 1024 / 1024);
    const sizeWarning = totalSizeMB > 100; // 100MB
    
    return {
      status: sizeWarning ? 'WARNING' : 'OK',
      service: 'Logging System',
      timestamp: new Date().toISOString(),
      files: fileStats,
      totalSize: `${totalSizeMB}MB`,
      warning: sizeWarning ? 'Log files are getting large' : null
    };
    
  } catch (error) {
    return {
      status: 'WARNING',
      service: 'Logging System',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Obtener métricas del sistema
 */
async function getSystemMetrics() {
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    // Contar documentos en colecciones principales
    const collections = ['users', 'clients', 'conversations', 'messages', 'refreshTokens'];
    const counts = {};
    
    for (const collection of collections) {
      try {
        const snapshot = await db.collection(collection).count().get();
        counts[collection] = snapshot.data().count;
      } catch (error) {
        counts[collection] = 'N/A';
      }
    }
    
    // Métricas de tokens
    const tokenStats = await refreshTokenService.getTokenStats();
    
    return {
      collections: counts,
      tokens: tokenStats,
      system: {
        uptime: process.uptime(),
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        nodeVersion: process.version,
        environment: config.server.env
      }
    };
    
  } catch (error) {
    logger.error('Failed to get system metrics', error);
    return {
      error: 'Failed to retrieve metrics',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * GET /health/metrics
 * Métricas del sistema para monitoreo
 */
router.get('/health/metrics', authenticate, authorize('admin'), async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      metrics: metrics
    });
  } catch (error) {
    logger.error('Failed to get metrics', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 