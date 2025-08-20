import { infoLog } from './logger';

// Sistema de logging configurable para reducir logs excesivos
interface LogConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  modules: {
    chatHeader: boolean;
    useConversations: boolean;
    webSocket: boolean;
    auth: boolean;
    clientProfile: boolean;
  };
}

const defaultConfig: LogConfig = {
  enabled: import.meta.env.DEV,
  level: 'info',
  modules: {
    chatHeader: false, // Deshabilitado por defecto
    useConversations: false, // Deshabilitado por defecto
    webSocket: true, // Solo mantener logs críticos de WebSocket
    auth: true, // Mantener logs de autenticación
    clientProfile: false // Deshabilitado por defecto
  }
};

class Logger {
  private config: LogConfig;

  constructor(config: LogConfig = defaultConfig) {
    this.config = config;
  }

  private shouldLog(module: keyof LogConfig['modules'], level: LogConfig['level'] = 'info'): boolean {
    if (!this.config.enabled) return false;
    if (!this.config.modules[module]) return false;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= configLevelIndex;
  }

  log(module: keyof LogConfig['modules'], message: string, data?: unknown, level: LogConfig['level'] = 'info'): void {
    if (!this.shouldLog(module, level)) return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${module.toUpperCase()}]`;
    
    if (data) {
      infoLog(`${prefix} ${message}`, data);
    } else {
      infoLog(`${prefix} ${message}`);
    }
  }

  debug(module: keyof LogConfig['modules'], message: string, data?: unknown): void {
    this.log(module, message, data, 'debug');
  }

  info(module: keyof LogConfig['modules'], message: string, data?: unknown): void {
    this.log(module, message, data, 'info');
  }

  warn(module: keyof LogConfig['modules'], message: string, data?: unknown): void {
    this.log(module, message, data, 'warn');
  }

  error(module: keyof LogConfig['modules'], message: string, data?: unknown): void {
    this.log(module, message, data, 'error');
  }

  // Método para habilitar/deshabilitar módulos específicos
  setModuleEnabled(module: keyof LogConfig['modules'], enabled: boolean): void {
    this.config.modules[module] = enabled;
  }

  // Método para cambiar el nivel de logging
  setLevel(level: LogConfig['level']): void {
    this.config.level = level;
  }
}

// Instancia global del logger
export const logger = new Logger();

// Funciones de conveniencia para cada módulo
export const chatHeaderLogger = {
  log: (message: string, data?: unknown) => logger.log('chatHeader', message, data),
  debug: (message: string, data?: unknown) => logger.debug('chatHeader', message, data),
  info: (message: string, data?: unknown) => logger.info('chatHeader', message, data),
  warn: (message: string, data?: unknown) => logger.warn('chatHeader', message, data),
  error: (message: string, data?: unknown) => logger.error('chatHeader', message, data)
};

export const conversationsLogger = {
  log: (message: string, data?: unknown) => logger.log('useConversations', message, data),
  debug: (message: string, data?: unknown) => logger.debug('useConversations', message, data),
  info: (message: string, data?: unknown) => logger.info('useConversations', message, data),
  warn: (message: string, data?: unknown) => logger.warn('useConversations', message, data),
  error: (message: string, data?: unknown) => logger.error('useConversations', message, data)
};

export const webSocketLogger = {
  log: (message: string, data?: unknown) => logger.log('webSocket', message, data),
  debug: (message: string, data?: unknown) => logger.debug('webSocket', message, data),
  info: (message: string, data?: unknown) => logger.info('webSocket', message, data),
  warn: (message: string, data?: unknown) => logger.warn('webSocket', message, data),
  error: (message: string, data?: unknown) => logger.error('webSocket', message, data)
};

export const authLogger = {
  log: (message: string, data?: unknown) => logger.log('auth', message, data),
  debug: (message: string, data?: unknown) => logger.debug('auth', message, data),
  info: (message: string, data?: unknown) => logger.info('auth', message, data),
  warn: (message: string, data?: unknown) => logger.warn('auth', message, data),
  error: (message: string, data?: unknown) => logger.error('auth', message, data)
};

export const clientProfileLogger = {
  log: (message: string, data?: unknown) => logger.log('clientProfile', message, data),
  debug: (message: string, data?: unknown) => logger.debug('clientProfile', message, data),
  info: (message: string, data?: unknown) => logger.info('clientProfile', message, data),
  warn: (message: string, data?: unknown) => logger.warn('clientProfile', message, data),
  error: (message: string, data?: unknown) => logger.error('clientProfile', message, data)
};

// --- Compatibilidad temporal con utilidades antiguas ---
// Estructura mínima para que utilidades como logCleaner funcionen.
export type LegacyClientLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export const loggingConfig = {
  errors: {
    ignoreRepetitiveClientErrors: true
  },
  rateLimit: {
    maxErrorLogsPerMinute: 2,
    errorCache: new Map<string, number>(),
    clientErrorCache: new Map<string, number>(),
    clearErrorCache(): void {
      this.errorCache.clear();
      this.clientErrorCache.clear();
    }
  },
  clients: {
    logLevel: 'error' as LegacyClientLogLevel,
    logSuccess: false,
    logLoading: false
  }
};

export default logger; 