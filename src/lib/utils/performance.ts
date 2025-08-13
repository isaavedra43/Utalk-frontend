/**
 * Utilidades de Optimización de Performance
 * Para el módulo Equipo & Performance
 */

// Cache para memoización
const cache = new Map<string, { data: unknown; timestamp: number }>();

// Configuración de cache
const CACHE_DURATION = 5000; // 5 segundos

/**
 * Función memoizada para cálculos complejos
 */
export function memoize<T>(key: string, fn: () => T, duration: number = CACHE_DURATION): T {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.timestamp < duration) {
    return cached.data as T;
  }

  const result = fn();
  cache.set(key, { data: result, timestamp: now });
  return result;
}

/**
 * Debounce optimizado para búsquedas
 */
export function createDebounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;

  return ((...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

/**
 * Throttle para eventos de scroll y resize
 */
export function createThrottle<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let lastCall = 0;

  return ((...args: unknown[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}

/**
 * Lazy loading de componentes
 */
export function lazyLoad<T>(importFn: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | null = null;

  return () => {
    if (!promise) {
      promise = importFn();
    }
    return promise;
  };
}

/**
 * Optimización de re-renders con comparación profunda
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a === null || b === null) return false;

  if (typeof a !== typeof b) return false;

  if (typeof a === 'object' && a !== null && b !== null) {
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    if (!Array.isArray(a) && !Array.isArray(b)) {
      const keysA = Object.keys(a as Record<string, unknown>);
      const keysB = Object.keys(b as Record<string, unknown>);

      if (keysA.length !== keysB.length) return false;

      for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
          return false;
      }

      return true;
    }
  }

  return false;
}

/**
 * Limpiar cache expirado
 */
export function cleanupCache(): void {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}

/**
 * Métricas de performance
 */
export class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }

  startTimer(name: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name)!.push(duration);

      // Log si es muy lento
      if (duration > 100) {
        // Performance warning - solo en desarrollo
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          // console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`);
        }
      }
    };
  }

  getAverageTime(name: string): number {
    const times = this.metrics.get(name);
    if (!times || times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Limpiar cache periódicamente
setInterval(cleanupCache, 10000);
