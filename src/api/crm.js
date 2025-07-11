/**
 * Rutas de API para el módulo CRM
 * PLACEHOLDER - Listo para implementar funcionalidades de gestión de clientes
 * 
 * Para implementar:
 * - Gestión completa de clientes (CRUD)
 * - Historial de interacciones
 * - Segmentación de clientes
 * - Notas y tags personalizados
 * - Integración con conversaciones
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { authenticate, authorize, requirePermission } = require('../middlewares/auth');

// Middleware para logging de requests
router.use((req, res, next) => {
  logger.info(`CRM API: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

/**
 * GET /clients
 * Obtener lista de clientes con filtros y paginación
 * TODO: Implementar búsqueda avanzada y filtros
 * PROTEGIDO - Requiere autenticación y permisos
 */
router.get('/clients', authenticate, requirePermission('crm.read'), (req, res) => {
  res.status(501).json({
    error: 'CRM clients listing not implemented',
    message: 'Este endpoint está preparado para listar clientes con filtros avanzados',
    supportedFilters: {
      search: 'Búsqueda por nombre, email o teléfono',
      channel: 'Filtrar por canal de origen',
      tags: 'Filtrar por tags',
      status: 'active|inactive|blocked',
      dateRange: 'Rango de fechas de creación',
      segment: 'Segmento de cliente'
    },
    pagination: {
      page: 1,
      limit: 20,
      orderBy: 'created|updated|lastActivity',
      orderDirection: 'asc|desc'
    }
  });
});

/**
 * GET /clients/:clientId
 * Obtener información detallada de un cliente
 * TODO: Implementar vista completa del cliente
 */
router.get('/clients/:clientId', (req, res) => {
  res.status(501).json({
    error: 'CRM client details not implemented',
    message: 'Este endpoint está preparado para mostrar información completa del cliente',
    willInclude: {
      basicInfo: 'Información personal y contacto',
      conversations: 'Historial de conversaciones',
      interactions: 'Timeline de interacciones',
      stats: 'Estadísticas de actividad',
      notes: 'Notas del equipo',
      tags: 'Tags y segmentación',
      customFields: 'Campos personalizados'
    }
  });
});

/**
 * PUT /clients/:clientId
 * Actualizar información de cliente
 * TODO: Implementar actualización con validaciones
 */
router.put('/clients/:clientId', (req, res) => {
  res.status(501).json({
    error: 'CRM client update not implemented',
    message: 'Este endpoint está preparado para actualizar información de clientes',
    expectedBody: {
      name: 'Client name',
      email: 'client@example.com',
      phone: '+1234567890',
      company: 'Company name',
      position: 'Job position',
      location: 'City, Country',
      tags: ['tag1', 'tag2'],
      customFields: {
        industry: 'Technology',
        budget: '10000-50000'
      },
      notes: 'Additional notes'
    }
  });
});

/**
 * POST /clients/:clientId/notes
 * Agregar nota a cliente
 * TODO: Implementar sistema de notas con historial
 */
router.post('/clients/:clientId/notes', (req, res) => {
  res.status(501).json({
    error: 'CRM client notes not implemented',
    message: 'Este endpoint está preparado para agregar notas a clientes',
    expectedBody: {
      content: 'Note content',
      type: 'general|call|meeting|follow-up',
      isPrivate: false,
      reminderDate: 'ISO_DATE (optional)'
    }
  });
});

/**
 * GET /clients/:clientId/conversations
 * Obtener conversaciones de un cliente
 * TODO: Implementar historial de conversaciones
 */
router.get('/clients/:clientId/conversations', (req, res) => {
  res.status(501).json({
    error: 'CRM client conversations not implemented',
    message: 'Este endpoint está preparado para mostrar conversaciones del cliente',
    willInclude: {
      conversations: 'Lista de conversaciones por canal',
      summary: 'Resumen de actividad',
      lastInteraction: 'Última interacción',
      responseTime: 'Tiempo promedio de respuesta'
    }
  });
});

/**
 * GET /segments
 * Obtener segmentos de clientes
 * TODO: Implementar segmentación automática y manual
 */
router.get('/segments', (req, res) => {
  res.status(501).json({
    error: 'CRM segments not implemented',
    message: 'Este endpoint está preparado para gestionar segmentos de clientes',
    segmentTypes: {
      automatic: 'Basados en comportamiento y datos',
      manual: 'Creados manualmente por el equipo',
      dynamic: 'Se actualizan automáticamente'
    },
    examples: [
      'Clientes VIP (alto valor)',
      'Nuevos clientes (últimos 30 días)',
      'Clientes inactivos (sin actividad 90+ días)',
      'Por canal preferido',
      'Por ubicación geográfica'
    ]
  });
});

/**
 * GET /analytics
 * Obtener analytics de CRM
 * TODO: Implementar métricas y reportes
 */
router.get('/analytics', (req, res) => {
  res.status(501).json({
    error: 'CRM analytics not implemented',
    message: 'Este endpoint está preparado para mostrar analytics de CRM',
    metrics: {
      totalClients: 'Total de clientes',
      newClientsThisMonth: 'Clientes nuevos este mes',
      activeClients: 'Clientes activos',
      clientsByChannel: 'Distribución por canal',
      avgLifetimeValue: 'Valor promedio del cliente',
      churnRate: 'Tasa de abandono',
      satisfactionScore: 'Puntuación de satisfacción'
    }
  });
});

/**
 * GET /health
 * Health check específico para CRM
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    module: 'crm',
    implementation: 'placeholder',
    timestamp: new Date().toISOString(),
    nextSteps: [
      'Implementar CRUD completo de clientes',
      'Crear sistema de notas y comentarios',
      'Desarrollar segmentación de clientes',
      'Implementar analytics y reportes',
      'Agregar campos personalizados',
      'Crear sistema de scoring de clientes',
      'Integrar con conversaciones existentes'
    ]
  });
});

module.exports = router; 