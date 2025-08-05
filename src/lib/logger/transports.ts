/**
 * Transportes para el sistema de logging
 * Console, Storage, Remote endpoints
 */

import { browser } from '$lib/utils/browser';
import type { LogContext, LoggerConfig, LogTransport } from './types';
import { formatConsoleLog, isStorageAvailable, sanitizeLogData } from './utils';

/**
 * Transport para consola con formato mejorado
 */
export class ConsoleTransport implements LogTransport {
  name = 'console';
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  async send(logs: LogContext[]): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    logs.forEach(log => {
      const formatted = formatConsoleLog(log);

      // eslint-disable-next-line no-console
      console.log(formatted.prefix, formatted.style, formatted.message);

      // Solo mostrar data adicional en desarrollo
      if (this.config.environment === 'development' && formatted.data) {
        // eslint-disable-next-line no-console
        console.log('📋 Log Data:', formatted.data);
      }
    });
  }

  isEnabled(): boolean {
    return this.config.enableConsole && browser;
  }
}

/**
 * Transport para almacenamiento local
 */
export class StorageTransport implements LogTransport {
  name = 'storage';
  private config: LoggerConfig;
  private maxLogs = 1000;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  async send(logs: LogContext[]): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    try {
      const existingLogs = this.getLogs();
      const sanitizedLogs = logs.map(log => ({
        ...log,
        ...sanitizeLogData(log as unknown as Record<string, unknown>, this.config.sensitiveFields)
      }));

      const allLogs = [...existingLogs, ...sanitizedLogs];

      // Mantener solo los últimos N logs para evitar llenar el storage
      const trimmedLogs = allLogs.slice(-this.maxLogs);

      localStorage.setItem(this.config.storageKey, JSON.stringify(trimmedLogs));
    } catch (error) {
      // Si falla el storage, no hacer nada para evitar loops de error
      // eslint-disable-next-line no-console
      console.warn('Failed to store logs:', error);
    }
  }

  isEnabled(): boolean {
    return this.config.enableStorage && isStorageAvailable();
  }

  /**
   * Obtiene logs almacenados
   */
  getLogs(): LogContext[] {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Limpia logs almacenados
   */
  clear(): void {
    try {
      localStorage.removeItem(this.config.storageKey);
    } catch {
      // Ignorar errores de limpieza
    }
  }

  /**
   * Exporta logs como archivo
   */
  async exportLogs(): Promise<Blob> {
    const logs = this.getLogs();
    const jsonString = JSON.stringify(logs, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }
}

/**
 * Transport para endpoints remotos
 */
export class RemoteTransport implements LogTransport {
  name = 'remote';
  private config: LoggerConfig;
  private buffer: LogContext[] = [];
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  async send(logs: LogContext[]): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    // Agregar logs al buffer
    const sanitizedLogs = logs.map(log => ({
      ...log,
      ...sanitizeLogData(log as unknown as Record<string, unknown>, this.config.sensitiveFields)
    }));

    this.buffer.push(...sanitizedLogs);

    // Si alcanzamos el tamaño de batch, enviar inmediatamente
    if (this.buffer.length >= this.config.batchSize) {
      await this.flush();
    } else {
      // Si no, programar un flush
      this.scheduleFlush();
    }
  }

  isEnabled(): boolean {
    return this.config.enableRemote && !!this.config.remoteEndpoint && browser;
  }

  /**
   * Envía logs al endpoint remoto
   */
  private async flush(): Promise<void> {
    if (this.buffer.length === 0 || !this.config.remoteEndpoint) {
      return;
    }

    const logsToSend = [...this.buffer];
    this.buffer = [];

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          logs: logsToSend,
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Si falla el envío, re-agregar los logs al buffer para reintento
      this.buffer.unshift(...logsToSend);

      // Limitar el tamaño del buffer para evitar memoria infinita
      if (this.buffer.length > this.config.batchSize * 3) {
        this.buffer = this.buffer.slice(-this.config.batchSize * 2);
      }

      // eslint-disable-next-line no-console
      console.warn('Failed to send logs to remote endpoint:', error);
    }
  }

  /**
   * Programa un flush automático
   */
  private scheduleFlush(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }

    this.flushTimeout = setTimeout(() => {
      this.flush().catch(error => {
        // eslint-disable-next-line no-console
        console.warn('Scheduled flush failed:', error);
      });
    }, this.config.flushInterval);
  }

  /**
   * Fuerza el envío de logs pendientes
   */
  async forceFlush(): Promise<void> {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
    await this.flush();
  }
}

/**
 * Transport para Sentry (ejemplo de integración externa)
 */
export class SentryTransport implements LogTransport {
  name = 'sentry';
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  async send(logs: LogContext[]): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    // Solo enviar errores y fatales a Sentry
    const criticalLogs = logs.filter(
      log => log.level <= 1 // FATAL o ERROR
    );

    if (criticalLogs.length === 0) {
      return;
    }

    // Aquí se integraría con el SDK de Sentry
    // Ejemplo conceptual:
    criticalLogs.forEach(log => {
      try {
        // @ts-expect-error - Sentry no está instalado aún
        if (typeof Sentry !== 'undefined') {
          // @ts-expect-error - Sentry no está instalado aún
          Sentry.captureException(new Error(log.message), {
            level: log.level === 0 ? 'fatal' : 'error',
            extra: sanitizeLogData(
              log as unknown as Record<string, unknown>,
              this.config.sensitiveFields
            )
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to send to Sentry:', error);
      }
    });
  }

  isEnabled(): boolean {
    // Solo habilitado en producción y si Sentry está disponible
    return (
      this.config.environment === 'production' &&
      browser &&
      typeof window !== 'undefined' &&
      'Sentry' in window
    );
  }
}

/**
 * Factory para crear transportes
 */
export function createTransports(config: LoggerConfig): LogTransport[] {
  const transports: LogTransport[] = [];

  if (config.enableConsole) {
    transports.push(new ConsoleTransport(config));
  }

  if (config.enableStorage) {
    transports.push(new StorageTransport(config));
  }

  if (config.enableRemote && config.remoteEndpoint) {
    transports.push(new RemoteTransport(config));
  }

  // Agregar Sentry si está disponible
  transports.push(new SentryTransport(config));

  return transports;
}
