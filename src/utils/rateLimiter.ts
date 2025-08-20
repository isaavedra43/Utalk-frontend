/**
 * Sistema de Rate Limiting para el Frontend
 * Previene peticiones excesivas al backend
 */
import { infoLog } from '../config/logger';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestTracker {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requestCounts = new Map<string, RequestTracker>();
  private readonly defaultConfig: RateLimitConfig = {
    maxRequests: 10, // Máximo 10 peticiones
    windowMs: 60000  // Por minuto
  };

  /**
   * Verifica si se puede hacer una petición sin exceder el rate limit
   */
  checkRateLimit(url: string): boolean {
    const config = this.getConfigForUrl(url);
    const key = this.getKeyForUrl(url);
    const now = Date.now();
    
    const tracker = this.requestCounts.get(key);
    
    // Si no hay tracker o ya expiró, crear uno nuevo
    if (!tracker || now > tracker.resetTime) {
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }
    
    // Si ya se excedió el límite, rechazar
    if (tracker.count >= config.maxRequests) {
      infoLog(`🚫 Rate limit excedido para ${url}: ${tracker.count}/${config.maxRequests} peticiones en ${config.windowMs}ms`);
      return false;
    }
    
    // Incrementar contador
    tracker.count++;
    return true;
  }

  /**
   * Registra una petición realizada
   */
  recordRequest(url: string): void {
    const key = this.getKeyForUrl(url);
    const now = Date.now();
    
    const tracker = this.requestCounts.get(key);
    if (tracker && now <= tracker.resetTime) {
      tracker.count++;
    }
  }

  /**
   * Obtiene la configuración específica para una URL
   */
  private getConfigForUrl(url: string): RateLimitConfig {
    // Configuraciones específicas por endpoint
    if (url.includes('/api/conversations/')) {
      return {
        maxRequests: 5,  // Menos peticiones para conversaciones
        windowMs: 30000  // Ventana más corta
      };
    }
    
    if (url.includes('/api/contacts/')) {
      return {
        maxRequests: 3,  // Muy pocas peticiones para contactos
        windowMs: 60000  // 1 minuto
      };
    }
    
    return this.defaultConfig;
  }

  /**
   * Genera una clave única para la URL
   */
  private getKeyForUrl(url: string): string {
    // Extraer el endpoint base sin parámetros
    const endpoint = url.split('?')[0];
    return endpoint;
  }

  /**
   * Limpia todos los contadores
   */
  clear(): void {
    this.requestCounts.clear();
  }

  /**
   * Obtiene estadísticas de rate limiting
   */
  getStats(): Record<string, RequestTracker> {
    const stats: Record<string, RequestTracker> = {};
    this.requestCounts.forEach((tracker, key) => {
      stats[key] = { ...tracker };
    });
    return stats;
  }
}

export const rateLimiter = new RateLimiter(); 