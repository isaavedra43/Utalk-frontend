// Configuración para controlar el logging y evitar spam
export const loggingConfig = {
  // Controlar qué errores se loggean
  errors: {
    // No loggear errores 500 del endpoint de contactos (sabemos que falla)
    ignore500Contacts: true,
    // No loggear errores de WebSocket reconexión
    ignoreWebSocketReconnect: true,
    // No loggear warnings de mensajes de media sin contenido
    ignoreMediaWarnings: true,
    // NUEVO: No loggear errores repetitivos de clientes
    ignoreRepetitiveClientErrors: true
  },
  
  // Controlar frecuencia de logs
  rateLimit: {
    // REDUCIDO: Máximo logs por minuto para errores repetitivos
    maxErrorLogsPerMinute: 2,
    // Cache de errores ya loggeados
    errorCache: new Map<string, number>(),
    // NUEVO: Cache específico para errores de clientes
    clientErrorCache: new Map<string, number>(),
    
    // Verificar si un error ya fue loggeado recientemente
    shouldLogError(errorKey: string): boolean {
      const now = Date.now();
      const lastLog = this.errorCache.get(errorKey);
      
      if (!lastLog || now - lastLog > 60000) { // 1 minuto
        this.errorCache.set(errorKey, now);
        return true;
      }
      
      return false;
    },
    
    // NUEVO: Verificar si un error de cliente ya fue loggeado recientemente
    shouldLogClientError(errorKey: string): boolean {
      const now = Date.now();
      const lastLog = this.clientErrorCache.get(errorKey);
      
      // Para errores de clientes, esperar 5 minutos antes de loggear de nuevo
      if (!lastLog || now - lastLog > 300000) { // 5 minutos
        this.clientErrorCache.set(errorKey, now);
        return true;
      }
      
      return false;
    },
    
    // Limpiar cache de errores
    clearErrorCache(): void {
      this.errorCache.clear();
      this.clientErrorCache.clear();
    }
  },
  
  // NUEVO: Configuración específica para logs de clientes
  clients: {
    // Solo loggear errores críticos de clientes
    logLevel: 'error' as 'debug' | 'info' | 'warn' | 'error' | 'critical',
    // No loggear operaciones exitosas de clientes
    logSuccess: false,
    // No loggear operaciones de carga de clientes
    logLoading: false
  }
};

// Función helper para loggear errores con rate limiting
export const logError = (message: string, error?: unknown, context?: Record<string, unknown>) => {
  const errorKey = `${message}-${error instanceof Error ? error.message : String(error)}`;
  
  if (loggingConfig.rateLimit.shouldLogError(errorKey)) {
    if (error) {
      console.error(message, error, context);
    } else {
      console.error(message, context);
    }
  }
};

// NUEVO: Función helper específica para errores de clientes
export const logClientError = (message: string, error?: unknown, context?: Record<string, unknown>) => {
  // Si está configurado para ignorar errores repetitivos de clientes
  if (loggingConfig.errors.ignoreRepetitiveClientErrors) {
    const errorKey = `${message}-${error instanceof Error ? error.message : String(error)}`;
    
    if (loggingConfig.rateLimit.shouldLogClientError(errorKey)) {
      if (error) {
        console.error(`[CLIENT] ${message}`, error, context);
      } else {
        console.error(`[CLIENT] ${message}`, context);
      }
    }
  } else {
    // Fallback al comportamiento normal
    logError(message, error, context);
  }
};

// Función helper para loggear warnings con rate limiting
export const logWarning = (message: string, data?: unknown) => {
  const warningKey = message;
  
  if (loggingConfig.rateLimit.shouldLogError(warningKey)) {
    console.warn(message, data);
  }
}; 