/**
 * Sistema de Logging Ultra Robusto para UTalk Frontend
 *
 * Punto de entrada principal del sistema de logging profesional
 * Basado en estándares de observabilidad moderna de empresas como:
 * - Netflix, Google, Stripe, Vercel
 * - OpenTelemetry, Elastic, Datadog, Sentry
 *
 * @author UTalk Frontend Team
 * @version 1.0.0
 *
 * ## Características principales:
 * - Logging estructurado con niveles RFC5424
 * - Múltiples transportes (Console, Storage, Remote)
 * - Interceptores automáticos para Axios/Fetch/Socket.io
 * - Performance monitoring integrado
 * - Error tracking con breadcrumbs
 * - Sanitización automática de datos sensibles
 * - Throttling para prevenir spam
 * - Métricas de observabilidad
 * - Export/import de logs para auditoría
 *
 * ## Ejemplo de uso básico:
 * ```typescript
 * import { logger } from '$lib/logger';
 *
 * // Logging básico
 * logger.info('Usuario autenticado', { userId: '123' });
 * logger.error('Error de login', error);
 *
 * // Logging especializado
 * logger.logUserAction('login_attempt');
 * logger.logPerformance('api_call', 250);
 * logger.logNetwork('POST', '/api/auth/login');
 * ```
 *
 * ## Integración con servicios:
 * ```typescript
 * import { setupAxiosInterceptors, setupPerformanceMonitor } from '$lib/logger';
 *
 * // Configurar interceptores automáticos
 * setupAxiosInterceptors(axiosInstance);
 * setupPerformanceMonitor();
 * ```
 */

// Re-exportar todo desde el módulo principal
export {
  configureLogger,
  // Logger principal
  createLogger,
  Environment,
  getLogger,
  // Tipos y enums
  LogLevel,
  type ErrorLogContext,
  type LogBreadcrumb,
  type LogContext,
  // Types para TypeScript
  type Logger,
  type LoggerConfig,
  type LogMetrics,
  type NetworkLogContext,
  type PerformanceLogContext,
  type UserLogContext
} from './logger/index';

// Re-exportar interceptores
export {
  setupAxiosInterceptors,
  setupFetchInterceptor,
  setupPerformanceMonitor,
  setupSocketInterceptor
} from './logger/interceptors';

// Re-exportar utilidades
export {
  detectEnvironment,
  formatTimestamp,
  generateCorrelationId,
  getDefaultLogLevel,
  logLevelToString,
  sanitizeLogData
} from './logger/utils';

// Re-exportar transportes para configuración avanzada
export {
  ConsoleTransport,
  createTransports,
  RemoteTransport,
  SentryTransport,
  StorageTransport
} from './logger/transports';

// Instancia del logger lista para usar
import { configureLogger, LogLevel } from './logger/index';
import { detectEnvironment } from './logger/utils';

/**
 * Configuración optimizada según entorno
 */
const environment = detectEnvironment();
const isProduction = environment === 'production';
const isDevelopment = environment === 'development';

/**
 * Logger pre-configurado y listo para usar
 * Configuración optimizada según el entorno detectado
 */
export const logger = configureLogger({
  level: isDevelopment ? LogLevel.DEBUG : LogLevel.WARN,
  environment,
  enableConsole: true,
  enableStorage: !isProduction, // Solo en dev/staging
  enableRemote: isProduction, // Solo en producción
  maxBreadcrumbs: isDevelopment ? 100 : 50,
  storageKey: 'utalk_logs',
  batchSize: isProduction ? 20 : 5,
  flushInterval: isProduction ? 10000 : 3000,
  sensitiveFields: [
    'password',
    'token',
    'apiKey',
    'secret',
    'authorization',
    'sessionId',
    'refreshToken',
    'accessToken',
    'email',
    'phone',
    'address'
  ]
});

/**
 * Configuración automática de interceptores según entorno
 */
if (typeof window !== 'undefined') {
  // En el cliente, configurar interceptores automáticamente
  import('./logger/interceptors')
    .then(({ setupPerformanceMonitor, setupFetchInterceptor }) => {
      // Performance monitoring siempre activo
      setupPerformanceMonitor();

      // Fetch interceptor solo en desarrollo
      if (isDevelopment) {
        setupFetchInterceptor({
          logRequests: true,
          logResponses: true,
          logErrors: true,
          logPerformance: true,
          excludeUrls: ['/ping', '/health', '/metrics', '/favicon.ico'],
          maxBodySize: 1024
        });
      }
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.warn('Failed to setup automatic interceptors:', error);
    });
}

/**
 * Export por defecto para facilidad de uso
 */
export default logger;
