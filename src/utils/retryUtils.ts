// Sistema de backoff exponencial para reintentos inteligentes

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
}

interface RetryState {
  attempt: number;
  lastError: Error | null;
  nextDelay: number;
}

class ExponentialBackoff {
  private config: Required<RetryConfig>;
  private retryStates = new Map<string, RetryState>();

  constructor(config: RetryConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries || 5,
      baseDelay: config.baseDelay || 1000, // 1 segundo
      maxDelay: config.maxDelay || 30000, // 30 segundos
      backoffMultiplier: config.backoffMultiplier || 2,
      jitter: config.jitter !== false // true por defecto
    };
  }

  // Calcular delay para el siguiente intento
  private calculateDelay(attempt: number): number {
    const delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt);
    
    // Aplicar jitter para evitar thundering herd
    if (this.config.jitter) {
      const jitter = Math.random() * 0.1 * delay; // 10% de jitter
      return Math.min(delay + jitter, this.config.maxDelay);
    }
    
    return Math.min(delay, this.config.maxDelay);
  }

  // Verificar si se debe reintentar
  shouldRetry(operationKey: string, error: Error): boolean {
    const state = this.retryStates.get(operationKey);
    
    if (!state) {
      // Primera vez, crear estado
      this.retryStates.set(operationKey, {
        attempt: 0,
        lastError: error,
        nextDelay: this.calculateDelay(0)
      });
      return true;
    }

    // Verificar si se ha excedido el número máximo de reintentos
    if (state.attempt >= this.config.maxRetries) {
      return false;
    }

    // Verificar si el error es retryable
    if (!this.isRetryableError(error)) {
      return false;
    }

    // Incrementar intento
    state.attempt++;
    state.lastError = error;
    state.nextDelay = this.calculateDelay(state.attempt);
    
    return true;
  }

  // Obtener delay para el siguiente intento
  getNextDelay(operationKey: string): number {
    const state = this.retryStates.get(operationKey);
    return state ? state.nextDelay : this.config.baseDelay;
  }

  // Obtener estado de reintentos
  getRetryState(operationKey: string): RetryState | null {
    return this.retryStates.get(operationKey) || null;
  }

  // Resetear estado de reintentos
  reset(operationKey: string): void {
    this.retryStates.delete(operationKey);
  }

  // Verificar si un error es retryable
  private isRetryableError(error: Error): boolean {
    // Errores que NO son retryable
    const nonRetryableErrors = [
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'VALIDATION_ERROR',
      'INVALID_TOKEN'
    ];

    // Verificar si el error contiene alguna de estas palabras clave
    const errorMessage = error.message.toUpperCase();
    return !nonRetryableErrors.some(keyword => errorMessage.includes(keyword));
  }

  // Limpiar todos los estados
  clear(): void {
    this.retryStates.clear();
  }

  // Obtener estadísticas
  getStats() {
    return {
      activeRetries: this.retryStates.size,
      config: this.config
    };
  }
}

// Instancia global para rate limiting
export const rateLimitBackoff = new ExponentialBackoff({
  maxRetries: 3,
  baseDelay: 2000, // 2 segundos
  maxDelay: 10000, // 10 segundos
  backoffMultiplier: 2,
  jitter: true
});

// Instancia global para errores de red
export const networkBackoff = new ExponentialBackoff({
  maxRetries: 5,
  baseDelay: 1000, // 1 segundo
  maxDelay: 30000, // 30 segundos
  backoffMultiplier: 2,
  jitter: true
});

// Función helper para generar claves de operación
export const generateOperationKey = (operation: string, params: Record<string, unknown>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return `${operation}:${sortedParams}`;
};

// Función helper para esperar con delay
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Función helper para retry con backoff exponencial
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  operationKey: string,
  backoff: ExponentialBackoff = rateLimitBackoff
): Promise<T> => {
  let lastError: Error;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (!backoff.shouldRetry(operationKey, lastError)) {
        break;
      }

      const delay = backoff.getNextDelay(operationKey);
      console.log(`🔄 Reintentando ${operationKey} en ${delay}ms (intento ${backoff.getRetryState(operationKey)?.attempt})`);
      
      await wait(delay);
    }
  }

  // Resetear estado después de fallar
  backoff.reset(operationKey);
  throw lastError;
};

// NUEVO: Sistema de deduplicación de peticiones
const pendingRequests = new Map<string, Promise<unknown>>();

/**
 * Ejecuta una petición HTTP con deduplicación para evitar peticiones duplicadas
 * @param requestKey - Clave única para identificar la petición
 * @param requestFn - Función que ejecuta la petición HTTP
 * @returns Promise con el resultado de la petición
 */
export const deduplicateRequest = async <T>(
  requestKey: string,
  requestFn: () => Promise<T>
): Promise<T> => {
  // Si ya hay una petición pendiente con la misma clave, retornar esa
  if (pendingRequests.has(requestKey)) {
    console.log('🔄 Deduplicando petición:', requestKey);
    const existingRequest = pendingRequests.get(requestKey);
    if (existingRequest) {
      return existingRequest as Promise<T>;
    }
    throw new Error('Request not found');
  }

  // Crear nueva petición
  const requestPromise = requestFn().finally(() => {
    // Limpiar la petición del cache cuando termine
    pendingRequests.delete(requestKey);
  });

  // Guardar la petición en el cache
  pendingRequests.set(requestKey, requestPromise);
  
  return requestPromise;
};

/**
 * Genera una clave única para una petición HTTP
 * @param method - Método HTTP
 * @param url - URL de la petición
 * @param params - Parámetros de la petición
 * @returns Clave única para la petición
 */
export const generateRequestKey = (
  method: string,
  url: string,
  params?: Record<string, unknown>
): string => {
  const paramsString = params ? JSON.stringify(params) : '';
  return `${method}:${url}:${paramsString}`;
};

export default ExponentialBackoff; 