// Sistema de logging centralizado para UTALK
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export enum LogCategory {
  AUTH = 'AUTH',
  FIREBASE = 'FIREBASE',
  BACKEND = 'BACKEND',
  WEBSOCKET = 'WEBSOCKET',
  API = 'API',
  CONFIG = 'CONFIG',
  CHAT = 'CHAT',
  SYSTEM = 'SYSTEM'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: Record<string, unknown>;
  error?: Error;
  context?: Record<string, unknown>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isDevelopment = import.meta.env.DEV;
  private isDebug = import.meta.env.VITE_DEBUG === 'true';

  private formatMessage(level: LogLevel, category: LogCategory, message: string, data?: Record<string, unknown>, error?: Error, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${category}]`;
    
    let formattedMessage = `${prefix} ${message}`;
    
    if (data) {
      formattedMessage += ` | Data: ${JSON.stringify(data, null, 2)}`;
    }
    
    if (error) {
      formattedMessage += ` | Error: ${error.message}`;
      if (error.stack) {
        formattedMessage += ` | Stack: ${error.stack}`;
      }
    }
    
    if (context) {
      formattedMessage += ` | Context: ${JSON.stringify(context, null, 2)}`;
    }
    
    return formattedMessage;
  }

  private addLog(level: LogLevel, category: LogCategory, message: string, data?: Record<string, unknown>, error?: Error, context?: Record<string, unknown>) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      error,
      context
    };

    this.logs.push(logEntry);

    // Mantener solo los últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Mostrar en consola según nivel y configuración
    if (this.shouldLog(level)) {
      const formattedMessage = this.formatMessage(level, category, message, data, error, context);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
        case LogLevel.CRITICAL:
          console.error(formattedMessage);
          break;
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && !this.isDebug) {
      return level === LogLevel.ERROR || level === LogLevel.CRITICAL;
    }
    return true;
  }

  // Métodos públicos para logging
  debug(category: LogCategory, message: string, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.addLog(LogLevel.DEBUG, category, message, data, undefined, context);
  }

  info(category: LogCategory, message: string, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.addLog(LogLevel.INFO, category, message, data, undefined, context);
  }

  warn(category: LogCategory, message: string, data?: Record<string, unknown>, error?: Error, context?: Record<string, unknown>) {
    this.addLog(LogLevel.WARN, category, message, data, error, context);
  }

  error(category: LogCategory, message: string, error?: Error, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.addLog(LogLevel.ERROR, category, message, data, error, context);
  }

  critical(category: LogCategory, message: string, error?: Error, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.addLog(LogLevel.CRITICAL, category, message, data, error, context);
  }

  // Métodos específicos para autenticación
  authInfo(message: string, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.info(LogCategory.AUTH, message, data, context);
  }

  authError(message: string, error?: Error, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.error(LogCategory.AUTH, message, error, data, context);
  }

  authCritical(message: string, error?: Error, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.critical(LogCategory.AUTH, message, error, data, context);
  }

  // Métodos específicos para Firebase
  firebaseInfo(message: string, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.info(LogCategory.FIREBASE, message, data, context);
  }

  firebaseError(message: string, error?: Error, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.error(LogCategory.FIREBASE, message, error, data, context);
  }

  firebaseCritical(message: string, error?: Error, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.critical(LogCategory.FIREBASE, message, error, data, context);
  }

  // Métodos específicos para Backend
  backendInfo(message: string, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.info(LogCategory.BACKEND, message, data, context);
  }

  backendError(message: string, error?: Error, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.error(LogCategory.BACKEND, message, error, data, context);
  }

  backendCritical(message: string, error?: Error, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.critical(LogCategory.BACKEND, message, error, data, context);
  }

  // Métodos específicos para WebSocket
  websocketInfo(message: string, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.info(LogCategory.WEBSOCKET, message, data, context);
  }

  websocketError(message: string, error?: Error, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.error(LogCategory.WEBSOCKET, message, error, data, context);
  }

  // Métodos específicos para API
  apiInfo(message: string, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.info(LogCategory.API, message, data, context);
  }

  apiError(message: string, error?: Error, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.error(LogCategory.API, message, error, data, context);
  }

  // Métodos específicos para configuración
  configInfo(message: string, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.info(LogCategory.CONFIG, message, data, context);
  }

  configError(message: string, error?: Error, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.error(LogCategory.CONFIG, message, error, data, context);
  }

  configCritical(message: string, error?: Error, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.critical(LogCategory.CONFIG, message, error, data, context);
  }

  // Métodos específicos para chat
  chatInfo(message: string, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.info(LogCategory.CHAT, message, data, context);
  }

  chatError(message: string, error?: Error, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.error(LogCategory.CHAT, message, error, data, context);
  }

  // Métodos específicos para sistema
  systemInfo(message: string, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.info(LogCategory.SYSTEM, message, data, context);
  }

  systemError(message: string, error?: Error, data?: Record<string, unknown>, context?: Record<string, unknown>) {
    this.error(LogCategory.SYSTEM, message, error, data, context);
  }

  // Métodos de utilidad
  getLogs(level?: LogLevel, category?: LogCategory): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    return filteredLogs;
  }

  getErrors(): LogEntry[] {
    return this.logs.filter(log => log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL);
  }

  getAuthLogs(): LogEntry[] {
    return this.getLogs(undefined, LogCategory.AUTH);
  }

  getFirebaseLogs(): LogEntry[] {
    return this.getLogs(undefined, LogCategory.FIREBASE);
  }

  getBackendLogs(): LogEntry[] {
    return this.getLogs(undefined, LogCategory.BACKEND);
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Método para validar configuración
  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = {
      firebase: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      },
      backend: {
        apiUrl: import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL,
        wsUrl: import.meta.env.VITE_WS_URL,
      }
    };

    // Validar Firebase
    if (!config.firebase.apiKey || config.firebase.apiKey.includes('mock')) {
      errors.push('VITE_FIREBASE_API_KEY no configurado o es mock');
    }
    if (!config.firebase.authDomain || config.firebase.authDomain.includes('mock')) {
      errors.push('VITE_FIREBASE_AUTH_DOMAIN no configurado o es mock');
    }
    if (!config.firebase.projectId || config.firebase.projectId.includes('mock')) {
      errors.push('VITE_FIREBASE_PROJECT_ID no configurado o es mock');
    }

    // Validar Backend
    if (!config.backend.apiUrl || config.backend.apiUrl.includes('tu-backend')) {
      errors.push('VITE_API_URL no configurado o es placeholder');
    }
    if (!config.backend.wsUrl || config.backend.wsUrl.includes('tu-backend')) {
      errors.push('VITE_WS_URL no configurado o es placeholder');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Método para log de inicio de sesión
  logLoginAttempt(email: string, context?: Record<string, unknown>): void {
    this.authInfo('Intento de login iniciado', { email }, {
      ...context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  logLoginSuccess(email: string, firebaseUser: Record<string, unknown>, backendUser: Record<string, unknown>, context?: Record<string, unknown>): void {
    this.authInfo('Login exitoso', {
      email,
      firebaseUid: firebaseUser?.uid,
      backendUserId: backendUser?.id,
      role: backendUser?.role
    }, {
      ...context,
      timestamp: new Date().toISOString()
    });
  }

  logLoginFailure(email: string, error: Error, context?: Record<string, unknown>): void {
    this.authError('Login fallido', error, { email }, {
      ...context,
      timestamp: new Date().toISOString(),
      errorCode: (error as unknown as Record<string, unknown>).code,
      errorMessage: error.message
    });
  }

  logFirebaseError(operation: string, error: Error, context?: Record<string, unknown>): void {
    this.firebaseError(`Error en Firebase: ${operation}`, error, undefined, {
      ...context,
      operation,
      errorCode: (error as unknown as Record<string, unknown>).code,
      timestamp: new Date().toISOString()
    });
  }

  logBackendError(operation: string, error: Error, status?: number, context?: Record<string, unknown>): void {
    this.backendError(`Error en Backend: ${operation}`, error, { status }, {
      ...context,
      operation,
      status,
      timestamp: new Date().toISOString()
    });
  }

  logConfigurationError(error: string, context?: Record<string, unknown>): void {
    this.configError('Error de configuración', new Error(error), undefined, {
      ...context,
      timestamp: new Date().toISOString()
    });
  }
}

// Instancia global del logger
export const logger = new Logger();

// Exportar tipos para uso externo
export type { LogEntry }; 