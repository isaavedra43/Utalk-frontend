/**
 * Sistema de logging profesional para SvelteKit
 * Basado en estándares de observabilidad moderna
 */

import {
  Environment,
  LogLevel,
  type ErrorLogContext,
  type LogBreadcrumb,
  type LogContext,
  type Logger,
  type LoggerConfig,
  type LogMetrics,
  type LogTransport,
  type NetworkLogContext,
  type PerformanceLogContext,
  type UserLogContext
} from './types';

import {
  detectEnvironment,
  extractErrorInfo,
  formatTimestamp,
  generateCorrelationId,
  getBrowserContext,
  getDefaultLogLevel,
  shouldLog
} from './utils';

import { createTransports } from './transports';

/**
 * Configuración predeterminada del logger
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  environment: detectEnvironment(),
  enableConsole: true,
  enableStorage: true,
  enableRemote: false,
  maxBreadcrumbs: 50,
  storageKey: 'utalk_logs',
  batchSize: 10,
  flushInterval: 5000, // 5 segundos
  sensitiveFields: [
    'password',
    'token',
    'apiKey',
    'secret',
    'authorization',
    'sessionId',
    'refreshToken',
    'accessToken'
  ]
};

/**
 * Implementación principal del logger
 */
class UTalkLogger implements Logger {
  private config: LoggerConfig;
  private transports: LogTransport[] = [];
  private breadcrumbs: LogBreadcrumb[] = [];
  private context: Partial<LogContext> = {};
  private metrics: LogMetrics;

  // Throttled logging para evitar spam
  private throttledLog = this.processLog.bind(this);

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.config.level = getDefaultLogLevel(this.config.environment);

    // Inicializar métricas
    this.metrics = {
      totalLogs: 0,
      logsByLevel: {
        [LogLevel.FATAL]: 0,
        [LogLevel.ERROR]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.DEBUG]: 0,
        [LogLevel.TRACE]: 0,
        [LogLevel.EVENT]: 0
      },
      errorRate: 0,
      avgResponseTime: 0,
      lastFlush: formatTimestamp()
    };

    // Configurar transportes
    this.transports = createTransports(this.config);

    // Configurar contexto base
    this.setContext({
      environment: this.config.environment,
      version: this.getAppVersion(),
      ...getBrowserContext()
    });

    // Registrar handlers globales de error
    this.setupGlobalErrorHandlers();

    // Flush automático al cerrar la página
    this.setupBeforeUnload();
  }

  /**
   * Métodos principales de logging
   */
  fatal(message: string, context: Partial<LogContext> = {}): void {
    this.log(LogLevel.FATAL, message, context);
  }

  error(message: string, error?: Error, context: Partial<ErrorLogContext> = {}): void {
    const errorContext: Partial<ErrorLogContext> = {
      ...context,
      ...(error && { error: extractErrorInfo(error) }),
      breadcrumbs: [...this.breadcrumbs]
    };
    this.log(LogLevel.ERROR, message, errorContext);
  }

  warn(message: string, context: Partial<LogContext> = {}): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context: Partial<LogContext> = {}): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context: Partial<LogContext> = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  trace(message: string, context: Partial<LogContext> = {}): void {
    this.log(LogLevel.TRACE, message, context);
  }

  event(message: string, context: Partial<UserLogContext> = {}): void {
    this.log(LogLevel.EVENT, message, context);
  }

  /**
   * Métodos especializados
   */
  logPerformance(
    metric: string,
    duration: number,
    context: Partial<PerformanceLogContext> = {}
  ): void {
    const perfContext: Partial<PerformanceLogContext> = {
      ...context,
      performance: {
        metric,
        duration,
        ...context.performance
      }
    };
    this.log(LogLevel.INFO, `Performance: ${metric} took ${duration}ms`, perfContext);
  }

  logNetwork(method: string, url: string, context: Partial<NetworkLogContext> = {}): void {
    const networkContext: Partial<NetworkLogContext> = {
      ...context,
      network: {
        method,
        url,
        ...context.network
      }
    };
    this.log(LogLevel.INFO, `Network: ${method} ${url}`, networkContext);
  }

  logUserAction(action: string, context: Partial<UserLogContext> = {}): void {
    const userContext: Partial<UserLogContext> = {
      ...context,
      user: {
        action,
        ...context.user
      }
    };
    this.log(LogLevel.EVENT, `User action: ${action}`, userContext);
  }

  /**
   * Gestión de contexto
   */
  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  addBreadcrumb(message: string, level: LogLevel, data: Record<string, unknown> = {}): void {
    const breadcrumb: LogBreadcrumb = {
      timestamp: formatTimestamp(),
      message,
      level,
      data
    };

    this.breadcrumbs.push(breadcrumb);

    // Mantener solo las últimas N breadcrumbs
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.config.maxBreadcrumbs);
    }
  }

  /**
   * Gestión de transports
   */
  addTransport(transport: LogTransport): void {
    const existingIndex = this.transports.findIndex(t => t.name === transport.name);
    if (existingIndex >= 0) {
      this.transports[existingIndex] = transport;
    } else {
      this.transports.push(transport);
    }
  }

  removeTransport(name: string): void {
    this.transports = this.transports.filter(t => t.name !== name);
  }

  /**
   * Utilidades
   */
  async flush(): Promise<void> {
    const flushPromises = this.transports
      .filter(transport => transport.isEnabled())
      .map(transport => {
        if ('forceFlush' in transport && typeof transport.forceFlush === 'function') {
          return (transport as { forceFlush: () => Promise<void> }).forceFlush();
        }
        return Promise.resolve();
      });

    await Promise.allSettled(flushPromises);
    this.metrics.lastFlush = formatTimestamp();
  }

  clear(): void {
    this.breadcrumbs = [];
    this.metrics.totalLogs = 0;
    this.metrics.logsByLevel = {
      [LogLevel.FATAL]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.DEBUG]: 0,
      [LogLevel.TRACE]: 0,
      [LogLevel.EVENT]: 0
    };

    // Limpiar storage si está disponible
    const storageTransport = this.transports.find(t => t.name === 'storage');
    if (storageTransport && 'clear' in storageTransport) {
      (storageTransport as { clear: () => void }).clear();
    }
  }

  async export(): Promise<Blob> {
    const storageTransport = this.transports.find(t => t.name === 'storage');
    if (storageTransport && 'exportLogs' in storageTransport) {
      return (storageTransport as { exportLogs: () => Promise<Blob> }).exportLogs();
    }

    // Fallback: exportar métricas y breadcrumbs
    const data = {
      metrics: this.metrics,
      breadcrumbs: this.breadcrumbs,
      context: this.context,
      timestamp: formatTimestamp()
    };

    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }

  /**
   * Obtener métricas del logger
   */
  getMetrics(): LogMetrics {
    return { ...this.metrics };
  }

  /**
   * Método principal de logging
   */
  private log(level: LogLevel, message: string, context: Partial<LogContext> = {}): void {
    // Verificar si el log debe ser procesado
    if (!shouldLog(level, this.config.level)) {
      return;
    }

    // Usar throttling para evitar spam
    this.throttledLog(level, message, context);
  }

  /**
   * Procesa el log (llamado por throttledLog)
   */
  private async processLog(
    level: LogLevel,
    message: string,
    context: Partial<LogContext> = {}
  ): Promise<void> {
    // Crear contexto completo del log
    const logContext: LogContext = {
      timestamp: formatTimestamp(),
      level,
      message,
      environment: this.config.environment,
      requestId: generateCorrelationId(),
      ...this.context,
      ...context
    };

    // Actualizar métricas
    this.updateMetrics(level);

    // Agregar breadcrumb para logs importantes
    if (level <= LogLevel.WARN) {
      this.addBreadcrumb(message, level, context);
    }

    // Enviar a todos los transportes habilitados
    const transportPromises = this.transports
      .filter(transport => transport.isEnabled())
      .map(transport =>
        transport.send([logContext]).catch(error => {
          // Si falla un transport, no afectar a los demás
          // eslint-disable-next-line no-console
          console.warn(`Transport ${transport.name} failed:`, error);
        })
      );

    await Promise.allSettled(transportPromises);
  }

  /**
   * Actualiza métricas del logger
   */
  private updateMetrics(level: LogLevel): void {
    this.metrics.totalLogs++;
    this.metrics.logsByLevel[level]++;

    // Calcular error rate
    const errorLogs =
      this.metrics.logsByLevel[LogLevel.ERROR] + this.metrics.logsByLevel[LogLevel.FATAL];
    this.metrics.errorRate = (errorLogs / this.metrics.totalLogs) * 100;
  }

  /**
   * Obtiene la versión de la aplicación
   */
  private getAppVersion(): string {
    // Intentar obtener la versión desde diferentes fuentes
    if (typeof window !== 'undefined') {
      // @ts-expect-error - __APP_VERSION__ puede no estar definido
      if (window.__APP_VERSION__) {
        // @ts-expect-error - __APP_VERSION__ puede no estar definido
        return window.__APP_VERSION__;
      }
    }

    return '1.0.0'; // Fallback
  }

  /**
   * Configura handlers globales de error
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Handler para errores no capturados
    window.addEventListener('error', event => {
      this.error('Uncaught error', event.error, {
        module: 'GlobalErrorHandler',
        function: 'window.onerror',
        url: event.filename
      });
    });

    // Handler para promesas rechazadas no capturadas
    window.addEventListener('unhandledrejection', event => {
      this.error(
        'Unhandled promise rejection',
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          module: 'GlobalErrorHandler',
          function: 'window.onunhandledrejection'
        }
      );
    });
  }

  /**
   * Configura flush antes de cerrar la página
   */
  private setupBeforeUnload(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('beforeunload', () => {
      // Flush síncrono antes de cerrar
      this.flush().catch(() => {
        // Ignorar errores en beforeunload
      });
    });
  }
}

/**
 * Instancia global del logger
 */
let loggerInstance: UTalkLogger | null = null;

/**
 * Configura y obtiene la instancia del logger
 */
export function createLogger(config: Partial<LoggerConfig> = {}): Logger {
  if (!loggerInstance) {
    loggerInstance = new UTalkLogger(config);
  }
  return loggerInstance;
}

/**
 * Obtiene la instancia del logger existente
 */
export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = new UTalkLogger();
  }
  return loggerInstance;
}

/**
 * Configura el logger con nueva configuración
 */
export function configureLogger(config: Partial<LoggerConfig>): Logger {
  loggerInstance = new UTalkLogger(config);
  return loggerInstance;
}

// Re-exportar tipos y enums
export {
  Environment,
  LogLevel,
  type ErrorLogContext,
  type LogBreadcrumb,
  type LogContext,
  type Logger,
  type LoggerConfig,
  type LogMetrics,
  type NetworkLogContext,
  type PerformanceLogContext,
  type UserLogContext
};
