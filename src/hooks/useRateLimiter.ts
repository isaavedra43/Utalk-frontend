import { useRef, useCallback } from 'react';

interface RateLimitConfig {
  [key: string]: {
    interval: number; // Tiempo en ms entre eventos
    maxAttempts?: number; // Máximo número de intentos en el intervalo
  };
}

// Configuración de rate limits según el backend
const DEFAULT_RATE_LIMITS: RateLimitConfig = {
  'typing': { interval: 500, maxAttempts: 1 },
  'typing-stop': { interval: 100, maxAttempts: 1 },
  'join-conversation': { interval: 1000, maxAttempts: 1 },
  'leave-conversation': { interval: 1000, maxAttempts: 1 },
  'new-message': { interval: 100, maxAttempts: 1 },
  'message-read': { interval: 100, maxAttempts: 5 },
  'user-status-change': { interval: 2000, maxAttempts: 1 },
  'sync-state': { interval: 5000, maxAttempts: 1 }
};

export const useRateLimiter = (customLimits?: Partial<RateLimitConfig>) => {
  const limits = useRef({ ...DEFAULT_RATE_LIMITS, ...customLimits });
  const lastExecutions = useRef<Map<string, number>>(new Map());
  const attemptCounts = useRef<Map<string, number>>(new Map());
  const queues = useRef<Map<string, Array<() => void>>>(new Map());

  // Función para verificar si un evento puede ejecutarse
  const canExecute = useCallback((eventType: string): boolean => {
    const config = limits.current[eventType];
    if (!config) return true; // Sin límite si no está configurado

    const now = Date.now();
    const lastExecution = lastExecutions.current.get(eventType) || 0;
    const attemptCount = attemptCounts.current.get(eventType) || 0;

    // Verificar intervalo
    if (now - lastExecution < config.interval) {
      return false;
    }

    // Verificar máximo de intentos
    if (config.maxAttempts && attemptCount >= config.maxAttempts) {
      return false;
    }

    return true;
  }, []);

  // Función para ejecutar un evento con rate limiting
  const executeWithRateLimit = useCallback((
    eventType: string, 
    callback: () => void,
    onRateLimitExceeded?: (eventType: string, retryAfter: number) => void
  ): boolean => {
    const config = limits.current[eventType];
    if (!config) {
      // Sin límite, ejecutar inmediatamente
      callback();
      return true;
    }

    const now = Date.now();
    const lastExecution = lastExecutions.current.get(eventType) || 0;
    const attemptCount = attemptCounts.current.get(eventType) || 0;

    // Verificar si puede ejecutarse
    if (canExecute(eventType)) {
      // Ejecutar inmediatamente
      callback();
      lastExecutions.current.set(eventType, now);
      attemptCounts.current.set(eventType, attemptCount + 1);

      // Resetear contador después del intervalo
      setTimeout(() => {
        attemptCounts.current.set(eventType, 0);
      }, config.interval);

      return true;
    } else {
      // Rate limit excedido, agregar a cola
      const queue = queues.current.get(eventType) || [];
      queue.push(callback);
      queues.current.set(eventType, queue);

      // Calcular tiempo de espera
      const retryAfter = config.interval - (now - lastExecution);
      
      // Notificar sobre rate limit
      if (onRateLimitExceeded) {
        onRateLimitExceeded(eventType, retryAfter);
      }

      // Programar ejecución después del intervalo
      setTimeout(() => {
        const queue = queues.current.get(eventType) || [];
        if (queue.length > 0) {
          const nextCallback = queue.shift();
          if (nextCallback) {
            executeWithRateLimit(eventType, nextCallback, onRateLimitExceeded);
          }
          queues.current.set(eventType, queue);
        }
      }, retryAfter);

      return false;
    }
  }, [canExecute]);

  // Función para limpiar colas
  const clearQueue = useCallback((eventType: string) => {
    queues.current.delete(eventType);
    attemptCounts.current.set(eventType, 0);
  }, []);

  // Función para obtener estadísticas
  const getStats = useCallback((eventType: string) => {
    const queue = queues.current.get(eventType) || [];
    const attemptCount = attemptCounts.current.get(eventType) || 0;
    const lastExecution = lastExecutions.current.get(eventType) || 0;
    const config = limits.current[eventType];

    return {
      queueLength: queue.length,
      attemptCount,
      lastExecution,
      config,
      canExecute: canExecute(eventType)
    };
  }, [canExecute]);

  return {
    canExecute,
    executeWithRateLimit,
    clearQueue,
    getStats
  };
}; 