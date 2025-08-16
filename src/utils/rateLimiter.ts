/**
 * Sistema de Rate Limiting para el Frontend
 * Previene peticiones excesivas al backend
 */

interface RateLimitConfig {
  limit: number; // Número máximo de peticiones
  window: number; // Ventana de tiempo en milisegundos
  endpoint?: string; // Endpoint específico (opcional)
}

interface RateLimitEntry {
  timestamp: number;
  count: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry[]> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();
  // NUEVO: Backoff por endpoint para respetar Retry-After del backend
  private backoffUntilMsByKey: Map<string, number> = new Map();

  constructor() {
    // Configuración por defecto
    this.setDefaultConfigs();
  }

  private setDefaultConfigs() {
    // Configuración general
    this.configs.set('default', {
      limit: 10,
      window: 60000 // 1 minuto
    });

    // Configuración específica para conversaciones
    this.configs.set('/api/conversations', {
      limit: 5,
      window: 60000 // 1 minuto
    });

    // Configuración específica para mensajes
    this.configs.set('/api/messages', {
      limit: 8,
      window: 60000 // 1 minuto
    });

    // Configuración específica para WebSocket
    this.configs.set('websocket', {
      limit: 3,
      window: 30000 // 30 segundos
    });
  }

  /**
   * Verifica si una petición está permitida según el rate limit
   * @param endpoint - Endpoint de la petición
   * @returns true si la petición está permitida, false si excede el límite
   */
  public checkRateLimit(endpoint: string): boolean {
    const config = this.getConfig(endpoint);
    const now = Date.now();
    const key = this.getKey(endpoint);

    // Respetar backoff explícito (Retry-After)
    const backoffUntil = this.backoffUntilMsByKey.get(key) || 0;
    if (now < backoffUntil) {
      const remaining = backoffUntil - now;
      console.warn('⏳ Backoff activo por Retry-After, bloqueando petición:', endpoint, { remainingMs: remaining });
      return false;
    }

    // Obtener entradas existentes
    let entries = this.requests.get(key) || [];

    // Filtrar entradas dentro de la ventana de tiempo
    entries = entries.filter(entry => now - entry.timestamp < config.window);

    // Verificar si excede el límite
    const totalRequests = entries.reduce((sum, entry) => sum + entry.count, 0);
    
    if (totalRequests >= config.limit) {
      console.warn('⚠️ Rate limit excedido para:', endpoint, {
        limit: config.limit,
        window: config.window,
        current: totalRequests
      });
      return false;
    }

    // Agregar nueva entrada
    entries.push({ timestamp: now, count: 1 });
    this.requests.set(key, entries);

    return true;
  }

  /**
   * Registra una petición exitosa
   * @param endpoint - Endpoint de la petición
   */
  public recordRequest(endpoint: string): void {
    const key = this.getKey(endpoint);
    const now = Date.now();
    const entries = this.requests.get(key) || [];
    
    // Agregar entrada si no existe
    if (entries.length === 0 || entries[entries.length - 1].timestamp !== now) {
      entries.push({ timestamp: now, count: 1 });
    } else {
      // Incrementar contador si ya existe una entrada para este timestamp
      entries[entries.length - 1].count++;
    }
    
    this.requests.set(key, entries);
  }

  /**
   * Establece un periodo de backoff (en ms) para un endpoint después de un 429
   */
  public setBackoff(endpoint: string, backoffMs: number): void {
    const key = this.getKey(endpoint);
    const until = Date.now() + Math.max(0, backoffMs);
    this.backoffUntilMsByKey.set(key, until);
    console.warn('⏳ Backoff configurado por Retry-After:', { endpoint: key, backoffMs });
  }

  /**
   * Obtiene la configuración para un endpoint
   * @param endpoint - Endpoint de la petición
   * @returns Configuración del rate limit
   */
  private getConfig(endpoint: string): RateLimitConfig {
    // Buscar configuración específica
    for (const [pattern, config] of this.configs) {
      if (endpoint.includes(pattern)) {
        return config;
      }
    }
    
    // Retornar configuración por defecto
    return this.configs.get('default')!;
  }

  /**
   * Genera una clave única para el endpoint
   * @param endpoint - Endpoint de la petición
   * @returns Clave única
   */
  private getKey(endpoint: string): string {
    return endpoint.split('?')[0]; // Remover query parameters
  }

  /**
   * Limpia entradas antiguas para liberar memoria
   */
  public cleanup(): void {
    const now = Date.now();
    
    for (const [key, entries] of this.requests) {
      const config = this.getConfig(key);
      const validEntries = entries.filter(entry => now - entry.timestamp < config.window);
      
      if (validEntries.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validEntries);
      }
    }
  }

  /**
   * Obtiene estadísticas del rate limit
   * @param endpoint - Endpoint específico (opcional)
   * @returns Estadísticas del rate limit
   */
  public getStats(endpoint?: string): Record<string, unknown> {
    const stats: Record<string, unknown> = {};
    
    for (const [key, entries] of this.requests) {
      if (endpoint && !key.includes(endpoint)) continue;
      
      const config = this.getConfig(key);
      const now = Date.now();
      const validEntries = entries.filter(entry => now - entry.timestamp < config.window);
      const totalRequests = validEntries.reduce((sum, entry) => sum + entry.count, 0);
      
      stats[key] = {
        limit: config.limit,
        current: totalRequests,
        remaining: Math.max(0, config.limit - totalRequests),
        window: config.window,
        backoffRemainingMs: Math.max(0, (this.backoffUntilMsByKey.get(key) || 0) - now)
      };
    }
    
    return stats;
  }
}

// Instancia global del rate limiter
export const rateLimiter = new RateLimiter();

// Limpiar entradas antiguas cada 5 minutos
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);

export default rateLimiter; 