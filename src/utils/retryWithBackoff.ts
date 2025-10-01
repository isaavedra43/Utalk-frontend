/**
 * Sistema de retry inteligente con exponential backoff
 * Crítico para garantizar calidad y resilencia en la aplicación
 */

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  shouldRetry?: (error: any) => boolean;
}

interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos máximo
  backoffMultiplier: 2,
  jitter: true,
  shouldRetry: (error: any) => {
    // Retry para errores de red, timeouts y 5xx
    if (!error.response) return true; // Errores de red
    if (error.code === 'ECONNABORTED') return true; // Timeouts
    if (error.response.status >= 500) return true; // Errores del servidor
    if (error.response.status === 429) return true; // Rate limiting
    
    // NO retry para errores de autenticación (4xx excepto 429)
    if (error.response.status >= 400 && error.response.status < 500) return false;
    
    return true;
  }
};

/**
 * Ejecuta una función con retry automático y exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  let lastError: Error;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const result = await fn();
      const totalTime = Date.now() - startTime;
      
      return {
        success: true,
        data: result,
        attempts: attempt + 1,
        totalTime
      };
    } catch (error) {
      lastError = error as Error;
      
      // Verificar si debemos hacer retry
      if (!opts.shouldRetry(error) || attempt === opts.maxRetries) {
        break;
      }
      
      // Calcular delay con exponential backoff
      const delay = calculateDelay(attempt, opts);
      
      console.log(`🔄 Retry ${attempt + 1}/${opts.maxRetries} en ${delay}ms para error:`, error);
      
      // Esperar antes del siguiente intento
      await sleep(delay);
    }
  }
  
  const totalTime = Date.now() - startTime;
  
  return {
    success: false,
    error: lastError!,
    attempts: opts.maxRetries + 1,
    totalTime
  };
};

/**
 * Calcula el delay para el siguiente retry usando exponential backoff
 */
const calculateDelay = (attempt: number, options: Required<RetryOptions>): number => {
  let delay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt);
  
  // Limitar el delay máximo
  delay = Math.min(delay, options.maxDelay);
  
  // Agregar jitter para evitar thundering herd
  if (options.jitter) {
    const jitterRange = delay * 0.1; // 10% de jitter
    delay += (Math.random() - 0.5) * 2 * jitterRange;
  }
  
  return Math.max(0, Math.floor(delay));
};

/**
 * Función de sleep para delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Wrapper específico para operaciones de autenticación
 */
export const retryAuthOperation = async <T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> => {
  return retryWithBackoff(fn, {
    maxRetries: 2, // Menos reintentos para auth
    baseDelay: 500, // Delay más corto para auth
    shouldRetry: (error: any) => {
      // Solo retry para errores de red/timeout en auth
      if (!error.response) return true;
      if (error.code === 'ECONNABORTED') return true;
      if (error.response.status >= 500) return true;
      
      // NO retry para errores de auth (401, 403, etc.)
      return false;
    },
    ...options
  });
};

/**
 * Wrapper específico para operaciones de API
 */
export const retryApiOperation = async <T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> => {
  return retryWithBackoff(fn, {
    maxRetries: 3,
    baseDelay: 1000,
    shouldRetry: (error: any) => {
      // Retry para errores de red y 5xx
      if (!error.response) return true;
      if (error.code === 'ECONNABORTED') return true;
      if (error.response.status >= 500) return true;
      if (error.response.status === 429) return true;
      
      // NO retry para errores del cliente (4xx excepto 429)
      return false;
    },
    ...options
  });
};

/**
 * Wrapper para operaciones críticas que deben funcionar siempre
 */
export const retryCriticalOperation = async <T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> => {
  return retryWithBackoff(fn, {
    maxRetries: 5, // Más reintentos para operaciones críticas
    baseDelay: 500,
    maxDelay: 5000,
    shouldRetry: (error: any) => {
      // Retry más agresivo para operaciones críticas
      if (!error.response) return true;
      if (error.code === 'ECONNABORTED') return true;
      if (error.response.status >= 500) return true;
      if (error.response.status === 429) return true;
      
      // Retry incluso para algunos 4xx en operaciones críticas
      if (error.response.status === 408) return true; // Request timeout
      if (error.response.status === 409) return true; // Conflict (puede ser temporal)
      
      return false;
    },
    ...options
  });
};

export default retryWithBackoff;
