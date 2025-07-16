import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Sistema centralizado de logs para debugging
export interface LogOptions {
  module?: string;
  action?: string;
  data?: any;
  level?: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  showInProduction?: boolean;
}

export const logger = {
  // Log general
  log: (message: string, options: LogOptions = {}) => {
    const {
      module = 'APP',
      action = '',
      data,
      level = 'INFO',
      showInProduction = false
    } = options;

    // En producción, solo mostrar logs críticos o si está explícitamente habilitado
    if (!import.meta.env.DEV && !showInProduction && level !== 'ERROR') {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMessage = `[${module} ${level}] ${action ? `${action} - ` : ''}${message}`;
    
    switch (level) {
      case 'ERROR':
        console.error(logMessage, data || '');
        break;
      case 'WARN':
        console.warn(logMessage, data || '');
        break;
      case 'DEBUG':
        if (import.meta.env.DEV) {
          console.debug(`${logMessage} (${timestamp})`, data || '');
        }
        break;
      default:
        console.log(logMessage, data || '');
    }
  },

  // Logs específicos por módulo
  auth: (action: string, data?: any, isError = false) => {
    logger.log(action, {
      module: 'AUTH',
      data,
      level: isError ? 'ERROR' : 'INFO',
      showInProduction: isError
    });
  },

  navigation: (action: string, data?: any, isError = false) => {
    logger.log(action, {
      module: 'NAVIGATION',
      data,
      level: isError ? 'ERROR' : 'INFO'
    });
  },

  api: (action: string, data?: any, isError = false) => {
    logger.log(action, {
      module: 'API',
      data,
      level: isError ? 'ERROR' : 'INFO',
      showInProduction: isError
    });
  },

  socket: (action: string, data?: any, isError = false) => {
    logger.log(action, {
      module: 'SOCKET',
      data,
      level: isError ? 'ERROR' : 'INFO'
    });
  },

  messages: (action: string, data?: any, isError = false) => {
    logger.log(action, {
      module: 'MESSAGES',
      data,
      level: isError ? 'ERROR' : 'INFO'
    });
  },

  router: (action: string, data?: any, isError = false) => {
    logger.log(action, {
      module: 'ROUTER',
      data,
      level: isError ? 'ERROR' : 'INFO'
    });
  },

  // Log de inicio de la aplicación
  appStart: () => {
    logger.log('Aplicación iniciada', {
      module: 'APP',
      action: 'STARTUP',
      data: {
        environment: import.meta.env.DEV ? 'development' : 'production',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      level: 'INFO',
      showInProduction: true
    });
  },

  // Log de errores críticos
  critical: (message: string, error?: any) => {
    logger.log(message, {
      module: 'CRITICAL',
      data: {
        error: error?.message || error,
        stack: error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      },
      level: 'ERROR',
      showInProduction: true
    });
  }
};

// Utilidades para debugging en desarrollo
export const debugUtils = {
  // Mostrar estado actual de la aplicación
  showAppState: () => {
    if (!import.meta.env.DEV) return;
    
    console.group('🔍 Estado actual de la aplicación');
    console.log('URL actual:', window.location.href);
    console.log('LocalStorage:', { ...localStorage });
    console.log('SessionStorage:', { ...sessionStorage });
    console.log('User Agent:', navigator.userAgent);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  },

  // Limpiar todos los datos de autenticación
  clearAuthData: () => {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    logger.log('Datos de autenticación limpiados manualmente', {
      module: 'DEBUG',
      level: 'WARN'
    });
    console.log('✅ Datos de autenticación limpiados. Recarga la página.');
  },

  // Simular error de red
  simulateNetworkError: () => {
    if (!import.meta.env.DEV) return;
    logger.log('Simulando error de red para testing', {
      module: 'DEBUG',
      level: 'WARN'
    });
  }
};

// Hacer utilities disponibles globalmente en desarrollo
if (import.meta.env.DEV) {
  (window as any).debugUtils = debugUtils;
  (window as any).logger = logger;
}
