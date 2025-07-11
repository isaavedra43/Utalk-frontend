/**
 * Servidor principal
 * Inicializa la aplicación Express y configura el puerto
 */

const app = require('./src/app');
const config = require('./src/config');
const logger = require('./src/utils/logger');

const PORT = config.server.port;

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`🚀 Servidor iniciado en puerto ${PORT}`);
  logger.info(`📱 Ambiente: ${config.server.env}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`📊 API Base: http://localhost:${PORT}/api`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  logger.info('Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
}); 