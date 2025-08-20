import { useRef, useCallback } from 'react';
import { infoLog } from '../config/logger';

interface RateLimiterOptions {
  maxRequests: number;
  timeWindow: number;
  retryDelay?: number;
}

export const useRateLimiter = (options: RateLimiterOptions = {
  maxRequests: 5,
  timeWindow: 1000, // 1 segundo
  retryDelay: 1000
}) => {
  const requestCountRef = useRef(0);
  const lastResetTimeRef = useRef(Date.now());
  const lastRequestTimeRef = useRef(0);

  const canMakeRequest = useCallback(() => {
    const now = Date.now();
    
    // Reset contador si ha pasado el tiempo de ventana
    if (now - lastResetTimeRef.current > options.timeWindow) {
      requestCountRef.current = 0;
      lastResetTimeRef.current = now;
    }
    
    // Verificar si podemos hacer la solicitud
    if (requestCountRef.current >= options.maxRequests) {
      const timeUntilReset = options.timeWindow - (now - lastResetTimeRef.current);
      infoLog(`⚠️ Rate limit excedido, reintentando en ${Math.round(timeUntilReset)}ms`);
      return false;
    }
    
    // Verificar tiempo mínimo entre solicitudes (para sync-state específicamente)
    const minInterval = 500; // 500ms mínimo entre sync-state
    if (now - lastRequestTimeRef.current < minInterval) {
      const remainingTime = minInterval - (now - lastRequestTimeRef.current);
      infoLog(`⚠️ Rate limit excedido para sync-state, reintentando en ${Math.round(remainingTime)}ms`);
      return false;
    }
    
    return true;
  }, [options.maxRequests, options.timeWindow]);

  const makeRequest = useCallback((requestFn: () => void) => {
    if (canMakeRequest()) {
      requestCountRef.current++;
      lastRequestTimeRef.current = Date.now();
      requestFn();
      return true;
    }
    return false;
  }, [canMakeRequest]);

  const reset = useCallback(() => {
    requestCountRef.current = 0;
    lastResetTimeRef.current = Date.now();
    lastRequestTimeRef.current = 0;
  }, []);

  return {
    canMakeRequest,
    makeRequest,
    reset,
    getStats: () => ({
      requestCount: requestCountRef.current,
      maxRequests: options.maxRequests,
      timeWindow: options.timeWindow,
      lastRequestTime: lastRequestTimeRef.current,
      lastResetTime: lastResetTimeRef.current
    })
  };
}; 