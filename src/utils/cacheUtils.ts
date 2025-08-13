// Sistema de cache local para optimizar peticiones

// Sistema de cache local para optimizar peticiones
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
}

interface CacheConfig {
  defaultTTL?: number; // TTL por defecto en milisegundos
  maxSize?: number; // Tamaño máximo del cache
}

class LocalCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL: number;
  private maxSize: number;

  constructor(config: CacheConfig = {}) {
    this.defaultTTL = config.defaultTTL || 5 * 60 * 1000; // 5 minutos por defecto
    this.maxSize = config.maxSize || 100; // 100 entradas por defecto
  }

  // Obtener datos del cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    // Verificar si ha expirado
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Guardar datos en el cache
  set<T>(key: string, data: T, ttl?: number): void {
    // Limpiar cache si está lleno
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    this.cache.set(key, entry);
  }

  // Verificar si existe en cache
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Verificar si ha expirado
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Eliminar entrada del cache
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Limpiar cache expirado
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Limpiar todo el cache
  clear(): void {
    this.cache.clear();
  }

  // Obtener estadísticas del cache
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      defaultTTL: this.defaultTTL
    };
  }
}

// Instancias de cache para diferentes tipos de datos
export const conversationsCache = new LocalCache({
  defaultTTL: 2 * 60 * 1000, // 2 minutos para conversaciones
  maxSize: 50
});

export const messagesCache = new LocalCache({
  defaultTTL: 1 * 60 * 1000, // 1 minuto para mensajes
  maxSize: 100
});

export const userCache = new LocalCache({
  defaultTTL: 10 * 60 * 1000, // 10 minutos para datos de usuario
  maxSize: 20
});

// Función para generar claves de cache
export const generateCacheKey = (prefix: string, params: Record<string, unknown>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return `${prefix}:${sortedParams}`;
};

// Función para invalidar cache por patrón
export const invalidateCacheByPattern = (): void => {
  const caches = [conversationsCache, messagesCache, userCache];
  
  caches.forEach(cache => {
    // Nota: Esta es una implementación simple. En un caso real,
    // necesitarías un sistema más sofisticado para invalidar por patrón
    cache.cleanup();
  });
};

export default LocalCache; 