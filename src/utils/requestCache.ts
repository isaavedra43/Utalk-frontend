// Sistema de cache global para evitar peticiones duplicadas
class RequestCache {
  private cache = new Map<string, { data: unknown; timestamp: number; promise?: Promise<unknown> }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // Verificar si hay una petición en curso
  isRequestInProgress(key: string): boolean {
    const cached = this.cache.get(key);
    return cached?.promise !== undefined;
  }

  // Obtener datos del cache
  get(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  // Guardar datos en cache
  set(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Guardar promesa en curso
  setPromise(key: string, promise: Promise<unknown>): void {
    this.cache.set(key, {
      data: null,
      timestamp: Date.now(),
      promise
    });
  }

  // Limpiar promesa cuando se resuelve
  clearPromise(key: string): void {
    const cached = this.cache.get(key);
    if (cached) {
      cached.promise = undefined;
    }
  }

  // Limpiar cache
  clear(): void {
    this.cache.clear();
  }

  // Limpiar entrada específica
  delete(key: string): void {
    this.cache.delete(key);
  }
}

export const requestCache = new RequestCache(); 