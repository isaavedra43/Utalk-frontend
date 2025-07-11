/**
 * Utilidad de Logging
 * Sistema de logs estructurado con diferentes niveles
 * Configuración centralizada para desarrollo y producción
 */

const winston = require('winston');
const config = require('../config');

// Configurar formato de logs
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Crear logger principal
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'omnichannel-backend' },
  transports: [
    // Archivo de logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// En desarrollo, también mostrar logs en consola
if (config.server.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Stream para Morgan (HTTP logging)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Funciones de conveniencia
const loggerUtils = {
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },

  error: (message, error = null, meta = {}) => {
    if (error instanceof Error) {
      logger.error(message, { 
        error: error.message, 
        stack: error.stack,
        ...meta 
      });
    } else {
      logger.error(message, { error, ...meta });
    }
  },

  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },

  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },

  // Log específico para webhooks
  webhook: (channel, action, data = {}) => {
    logger.info(`Webhook ${channel}: ${action}`, {
      channel,
      action,
      ...data
    });
  },

  // Log específico para mensajes
  message: (action, messageData = {}) => {
    logger.info(`Message ${action}`, {
      action,
      messageId: messageData.id,
      channel: messageData.channel,
      direction: messageData.direction,
      clientId: messageData.clientId
    });
  },

  // Log específico para clientes
  client: (action, clientData = {}) => {
    logger.info(`Client ${action}`, {
      action,
      clientId: clientData.id,
      channel: clientData.channel,
      phone: clientData.phone
    });
  },

  // Log específico para conversaciones
  conversation: (action, conversationData = {}) => {
    logger.info(`Conversation ${action}`, {
      action,
      conversationId: conversationData.id,
      clientId: conversationData.clientId,
      channel: conversationData.channel,
      status: conversationData.status
    });
  }
};

module.exports = {
  ...loggerUtils,
  logger, // Logger original de Winston
  stream: logger.stream
}; 