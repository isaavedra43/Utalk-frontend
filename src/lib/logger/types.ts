/**
 * Tipos y interfaces para el sistema de logging profesional
 * Basado en estándares de observabilidad moderna (OpenTelemetry, Elastic, Datadog)
 */

/**
 * Niveles de logging según RFC5424 y mejores prácticas
 */
export enum LogLevel {
  FATAL = 0, // Sistema no funcional
  ERROR = 1, // Errores que afectan funcionalidad
  WARN = 2, // Advertencias y situaciones inesperadas
  INFO = 3, // Información general del flujo
  DEBUG = 4, // Información detallada para debugging
  TRACE = 5, // Información muy detallada
  EVENT = 6 // Eventos de negocio/analytics
}

/**
 * Entornos de ejecución
 */
export enum Environment {
  DEVELOPMENT = 'development',
  TEST = 'test',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

/**
 * Contexto base que se incluye en todos los logs
 */
export interface LogContext {
  timestamp: string;
  level: LogLevel;
  message: string;
  module?: string;
  function?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  userAgent?: string;
  url?: string;
  environment: Environment;
  version?: string;
  // Campos adicionales flexibles
  [key: string]: unknown;
}

/**
 * Contexto extendido para errores
 */
export interface ErrorLogContext extends LogContext {
  error: {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
    cause?: unknown;
  };
  breadcrumbs?: LogBreadcrumb[];
}

/**
 * Contexto para eventos de performance
 */
export interface PerformanceLogContext extends LogContext {
  performance: {
    duration: number;
    metric: string;
    threshold?: number;
    resource?: string;
  };
}

/**
 * Contexto para eventos de red
 */
export interface NetworkLogContext extends LogContext {
  network: {
    method: string;
    url: string;
    status?: number;
    duration?: number;
    requestSize?: number;
    responseSize?: number;
    retryCount?: number;
  };
}

/**
 * Contexto para eventos de usuario
 */
export interface UserLogContext extends LogContext {
  user: {
    action: string;
    component?: string;
    metadata?: Record<string, unknown>;
  };
}

/**
 * Breadcrumb para trazabilidad
 */
export interface LogBreadcrumb {
  timestamp: string;
  message: string;
  level: LogLevel;
  data?: Record<string, unknown>;
}

/**
 * Configuración del logger
 */
export interface LoggerConfig {
  level: LogLevel;
  environment: Environment;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  maxBreadcrumbs: number;
  storageKey: string;
  remoteEndpoint?: string;
  batchSize: number;
  flushInterval: number;
  sensitiveFields: string[];
}

/**
 * Transportes disponibles para logs
 */
export interface LogTransport {
  name: string;
  send: (logs: LogContext[]) => Promise<void>;
  isEnabled: () => boolean;
}

/**
 * Interface principal del logger
 */
export interface Logger {
  fatal: (message: string, context?: Partial<LogContext>) => void;
  error: (message: string, error?: Error, context?: Partial<ErrorLogContext>) => void;
  warn: (message: string, context?: Partial<LogContext>) => void;
  info: (message: string, context?: Partial<LogContext>) => void;
  debug: (message: string, context?: Partial<LogContext>) => void;
  trace: (message: string, context?: Partial<LogContext>) => void;
  event: (message: string, context?: Partial<UserLogContext>) => void;

  // Métodos especializados
  logPerformance: (
    metric: string,
    duration: number,
    context?: Partial<PerformanceLogContext>
  ) => void;
  logNetwork: (method: string, url: string, context?: Partial<NetworkLogContext>) => void;
  logUserAction: (action: string, context?: Partial<UserLogContext>) => void;

  // Gestión de contexto
  setContext: (context: Partial<LogContext>) => void;
  addBreadcrumb: (message: string, level: LogLevel, data?: Record<string, unknown>) => void;

  // Gestión de transports
  addTransport: (transport: LogTransport) => void;
  removeTransport: (name: string) => void;

  // Utilidades
  flush: () => Promise<void>;
  clear: () => void;
  export: () => Promise<Blob>;
}

/**
 * Métricas de logging para monitoreo
 */
export interface LogMetrics {
  totalLogs: number;
  logsByLevel: Record<LogLevel, number>;
  errorRate: number;
  avgResponseTime: number;
  lastFlush: string;
}
