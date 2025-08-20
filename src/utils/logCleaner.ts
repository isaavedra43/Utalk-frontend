// Utilidad para limpiar logs y reiniciar el sistema de logging
import { loggingConfig } from '../config/logging';
import { infoLog } from '../config/logger';

export class LogCleaner {
  /**
   * Limpiar todos los caches de logs
   */
  static clearAllCaches(): void {
    loggingConfig.rateLimit.clearErrorCache();
    infoLog('🧹 Caches de logs limpiados');
  }

  /**
   * Limpiar solo el cache de errores de clientes
   */
  static clearClientErrorCache(): void {
    loggingConfig.rateLimit.clientErrorCache.clear();
    infoLog('🧹 Cache de errores de clientes limpiado');
  }

  /**
   * Reiniciar el sistema de logging
   */
  static resetLogging(): void {
    this.clearAllCaches();
    
    // Limpiar logs de la consola
    console.clear();
    
    infoLog('🔄 Sistema de logging reiniciado');
    infoLog('📊 Configuración actual:', {
      maxErrorLogsPerMinute: loggingConfig.rateLimit.maxErrorLogsPerMinute,
      ignoreRepetitiveClientErrors: loggingConfig.errors.ignoreRepetitiveClientErrors,
      clientLogLevel: loggingConfig.clients.logLevel,
      clientLogSuccess: loggingConfig.clients.logSuccess,
      clientLogLoading: loggingConfig.clients.logLoading
    });
  }

  /**
   * Obtener estadísticas de logs
   */
  static getLogStats(): {
    errorCacheSize: number;
    clientErrorCacheSize: number;
    config: typeof loggingConfig;
  } {
    return {
      errorCacheSize: loggingConfig.rateLimit.errorCache.size,
      clientErrorCacheSize: loggingConfig.rateLimit.clientErrorCache.size,
      config: loggingConfig
    };
  }

  /**
   * Configurar logging para modo silencioso
   */
  static enableSilentMode(): void {
    loggingConfig.rateLimit.maxErrorLogsPerMinute = 1;
    loggingConfig.errors.ignoreRepetitiveClientErrors = true;
    loggingConfig.clients.logLevel = 'critical';
    loggingConfig.clients.logSuccess = false;
    loggingConfig.clients.logLoading = false;
    
    infoLog('🔇 Modo silencioso activado - logs mínimos');
  }

  /**
   * Configurar logging para modo verbose
   */
  static enableVerboseMode(): void {
    loggingConfig.rateLimit.maxErrorLogsPerMinute = 10;
    loggingConfig.errors.ignoreRepetitiveClientErrors = false;
    loggingConfig.clients.logLevel = 'info';
    loggingConfig.clients.logSuccess = true;
    loggingConfig.clients.logLoading = true;
    
    infoLog('🔊 Modo verbose activado - logs detallados');
  }
}

// Funciones globales para usar desde la consola del navegador
(window as typeof window & { 
  clearLogCaches?: () => void;
  resetLogging?: () => void;
  enableSilentMode?: () => void;
  enableVerboseMode?: () => void;
  getLogStats?: () => ReturnType<typeof LogCleaner.getLogStats>;
}).clearLogCaches = () => LogCleaner.clearAllCaches();

(window as typeof window & { 
  clearLogCaches?: () => void;
  resetLogging?: () => void;
  enableSilentMode?: () => void;
  enableVerboseMode?: () => void;
  getLogStats?: () => ReturnType<typeof LogCleaner.getLogStats>;
}).resetLogging = () => LogCleaner.resetLogging();

(window as typeof window & { 
  clearLogCaches?: () => void;
  resetLogging?: () => void;
  enableSilentMode?: () => void;
  enableVerboseMode?: () => void;
  getLogStats?: () => ReturnType<typeof LogCleaner.getLogStats>;
}).enableSilentMode = () => LogCleaner.enableSilentMode();

(window as typeof window & { 
  clearLogCaches?: () => void;
  resetLogging?: () => void;
  enableSilentMode?: () => void;
  enableVerboseMode?: () => void;
  getLogStats?: () => ReturnType<typeof LogCleaner.getLogStats>;
}).enableVerboseMode = () => LogCleaner.enableVerboseMode();

(window as typeof window & { 
  clearLogCaches?: () => void;
  resetLogging?: () => void;
  enableSilentMode?: () => void;
  enableVerboseMode?: () => void;
  getLogStats?: () => ReturnType<typeof LogCleaner.getLogStats>;
}).getLogStats = () => LogCleaner.getLogStats(); 