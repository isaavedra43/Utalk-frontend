/**
 * Utilidades para el sistema de logging
 * Funciones auxiliares, formatters y helpers
 */

import { browser } from '$lib/utils/browser';
import { Environment, LogLevel, type LogContext } from './types';

/**
 * Detecta el entorno de ejecución actual
 */
export function detectEnvironment(): Environment {
  if (typeof process !== 'undefined' && process.env) {
    const nodeEnv = process.env['NODE_ENV'];
    switch (nodeEnv) {
      case 'development':
        return Environment.DEVELOPMENT;
      case 'test':
        return Environment.TEST;
      case 'staging':
        return Environment.STAGING;
      case 'production':
        return Environment.PRODUCTION;
      default:
        return Environment.DEVELOPMENT;
    }
  }

  if (browser) {
    // En el navegador, detectar por hostname o variables específicas
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname.includes('dev')) {
      return Environment.DEVELOPMENT;
    }
    if (hostname.includes('staging') || hostname.includes('stg')) {
      return Environment.STAGING;
    }
    if (hostname.includes('test')) {
      return Environment.TEST;
    }
    return Environment.PRODUCTION;
  }

  return Environment.DEVELOPMENT;
}

/**
 * Obtiene el nivel de log predeterminado según el entorno
 */
export function getDefaultLogLevel(environment: Environment): LogLevel {
  switch (environment) {
    case Environment.DEVELOPMENT:
      return LogLevel.DEBUG;
    case Environment.TEST:
      return LogLevel.WARN;
    case Environment.STAGING:
      return LogLevel.INFO;
    case Environment.PRODUCTION:
      return LogLevel.WARN;
    default:
      return LogLevel.INFO;
  }
}

/**
 * Convierte LogLevel enum a string legible
 */
export function logLevelToString(level: LogLevel): string {
  switch (level) {
    case LogLevel.FATAL:
      return 'FATAL';
    case LogLevel.ERROR:
      return 'ERROR';
    case LogLevel.WARN:
      return 'WARN';
    case LogLevel.INFO:
      return 'INFO';
    case LogLevel.DEBUG:
      return 'DEBUG';
    case LogLevel.TRACE:
      return 'TRACE';
    case LogLevel.EVENT:
      return 'EVENT';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Obtiene el color para el nivel de log en consola
 */
export function getLogLevelColor(level: LogLevel): string {
  switch (level) {
    case LogLevel.FATAL:
      return '#8B0000'; // Dark red
    case LogLevel.ERROR:
      return '#FF0000'; // Red
    case LogLevel.WARN:
      return '#FFA500'; // Orange
    case LogLevel.INFO:
      return '#0000FF'; // Blue
    case LogLevel.DEBUG:
      return '#008000'; // Green
    case LogLevel.TRACE:
      return '#808080'; // Gray
    case LogLevel.EVENT:
      return '#800080'; // Purple
    default:
      return '#000000'; // Black
  }
}

/**
 * Genera un ID único para correlación
 */
export function generateCorrelationId(): string {
  if (browser && 'crypto' in window && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  // Fallback para ambientes sin crypto.randomUUID
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Obtiene información del contexto del navegador
 */
export function getBrowserContext(): Partial<LogContext> {
  if (!browser) {
    return {};
  }

  return {
    userAgent: navigator.userAgent,
    url: window.location.href,
    sessionId: getSessionId()
  };
}

/**
 * Obtiene o genera un ID de sesión
 */
export function getSessionId(): string {
  if (!browser) {
    return generateCorrelationId();
  }

  const sessionKey = 'utalk_session_id';
  let sessionId = sessionStorage.getItem(sessionKey);

  if (!sessionId) {
    sessionId = generateCorrelationId();
    sessionStorage.setItem(sessionKey, sessionId);
  }

  return sessionId;
}

/**
 * Sanitiza datos sensibles de los logs
 */
export function sanitizeLogData<T extends Record<string, unknown>>(
  data: T,
  sensitiveFields: string[] = ['password', 'token', 'apiKey', 'secret', 'authorization']
): T {
  const sanitized = { ...data };

  function sanitizeValue(obj: Record<string, unknown>, key: string): void {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      obj[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key] as Record<string, unknown>);
    }
  }

  function sanitizeObject(obj: Record<string, unknown>): void {
    Object.keys(obj).forEach(key => sanitizeValue(obj, key));
  }

  sanitizeObject(sanitized);
  return sanitized;
}

/**
 * Formatea el timestamp en ISO con timezone
 */
export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Calcula el tamaño aproximado de un objeto en bytes
 */
export function calculateObjectSize(obj: unknown): number {
  const jsonString = JSON.stringify(obj);
  return new Blob([jsonString]).size;
}

/**
 * Verifica si un nivel de log debe ser procesado
 */
export function shouldLog(currentLevel: LogLevel, targetLevel: LogLevel): boolean {
  return currentLevel >= targetLevel;
}

/**
 * Extrae información útil de un Error
 */
export function extractErrorInfo(error: Error): {
  name: string;
  message: string;
  stack?: string;
  cause?: unknown;
} {
  const result: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
  } = {
    name: error.name || 'UnknownError',
    message: error.message || 'No error message provided'
  };

  if (error.stack) {
    result.stack = error.stack;
  }

  const errorWithCause = error as { cause?: unknown };
  if (errorWithCause.cause) {
    result.cause = errorWithCause.cause;
  }

  return result;
}

/**
 * Formatea un log para visualización en consola
 */
export function formatConsoleLog(logContext: LogContext): {
  prefix: string;
  message: string;
  style: string;
  data?: unknown;
} {
  const level = logLevelToString(logContext.level);
  const timestamp = new Date(logContext.timestamp).toLocaleTimeString();
  const module = logContext.module ? `[${logContext.module}]` : '';
  const func = logContext.function ? `::${logContext.function}()` : '';

  return {
    prefix: `%c${timestamp} ${level}${module}${func}`,
    message: logContext.message,
    style: `color: ${getLogLevelColor(logContext.level)}; font-weight: bold;`,
    data: logContext
  };
}

/**
 * Verifica si el almacenamiento local está disponible
 */
export function isStorageAvailable(): boolean {
  if (!browser) {
    return false;
  }

  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene información de performance si está disponible
 */
export function getPerformanceInfo(): {
  loadTime?: number;
  domContentLoaded?: number;
} {
  if (!browser || !performance) {
    return {};
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (!navigation) {
    return {};
  }

  return {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
  };
}

/**
 * Throttle function para evitar spam de logs
 */
export function throttle<T extends (...args: never[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastExecTime = 0;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay);
    }
  };
}
