/**
 * Interceptores para logging automático
 * Axios, Fetch, Performance
 */

import { browser } from '$lib/utils/browser';
import { getLogger } from './index';

/**
 * Configuración de interceptores
 */
interface InterceptorConfig {
  logRequests: boolean;
  logResponses: boolean;
  logErrors: boolean;
  logPerformance: boolean;
  excludeUrls: string[];
  maxBodySize: number;
}

const DEFAULT_INTERCEPTOR_CONFIG: InterceptorConfig = {
  logRequests: true,
  logResponses: true,
  logErrors: true,
  logPerformance: true,
  excludeUrls: ['/ping', '/health', '/metrics'],
  maxBodySize: 1024 // 1KB
};

/**
 * Monitor de performance automático
 */
export function setupPerformanceMonitor(): void {
  if (!browser || !performance) {
    return;
  }

  const logger = getLogger();

  // Monitor de navigation timing
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        logger.logPerformance('Page Load', navigation.loadEventEnd - navigation.loadEventStart, {
          module: 'PerformanceMonitor',
          performance: {
            metric: 'page_load_duration',
            duration: navigation.loadEventEnd - navigation.loadEventStart,
            threshold: 3000,
            resource: window.location.pathname
          }
        });
      }
    }, 100);
  });
}

/**
 * Interceptor para fetch nativo
 */
export function setupFetchInterceptor(config: Partial<InterceptorConfig> = {}): void {
  if (!browser || typeof window.fetch !== 'function') {
    return;
  }

  const logger = getLogger();
  const interceptorConfig = { ...DEFAULT_INTERCEPTOR_CONFIG, ...config };
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;
    const method = init?.method || 'GET';
    const startTime = performance.now();

    try {
      if (interceptorConfig.logRequests && shouldLogUrl(url, interceptorConfig.excludeUrls)) {
        logger.logNetwork(method.toUpperCase(), url, {
          module: 'FetchInterceptor',
          function: 'request'
        });
      }

      const response = await originalFetch(input, init);
      const duration = performance.now() - startTime;

      if (interceptorConfig.logResponses && shouldLogUrl(url, interceptorConfig.excludeUrls)) {
        logger.logNetwork(method.toUpperCase(), url, {
          module: 'FetchInterceptor',
          function: 'response',
          network: {
            method: method.toUpperCase(),
            url,
            status: response.status,
            duration
          }
        });
      }

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;

      if (interceptorConfig.logErrors) {
        logger.error('Fetch error', error instanceof Error ? error : new Error(String(error)), {
          module: 'FetchInterceptor',
          function: 'response',
          networkMethod: method.toUpperCase(),
          networkUrl: url,
          networkDuration: duration
        });
      }

      throw error;
    }
  };
}

/**
 * Configurar interceptores de Axios (placeholder)
 */
export function setupAxiosInterceptors(
  axiosInstance: unknown,
  _config: Partial<InterceptorConfig> = {}
): void {
  const logger = getLogger();
  logger.debug('Axios interceptors setup requested', {
    module: 'AxiosInterceptor',
    configRequested: true
  });

  // TODO: Implementar cuando se integre Axios
  // eslint-disable-next-line no-console
  console.warn('Axios interceptors not implemented yet. Use setupFetchInterceptor instead.');
}

/**
 * Interceptor para Socket.io (placeholder)
 */
export function setupSocketInterceptor(
  socket: unknown,
  _config: Partial<InterceptorConfig> = {}
): void {
  const logger = getLogger();
  logger.debug('Socket interceptors setup requested', {
    module: 'SocketInterceptor',
    configRequested: true
  });

  // TODO: Implementar cuando se integre Socket.io
  // eslint-disable-next-line no-console
  console.warn('Socket interceptors not implemented yet.');
}

/**
 * Utilidades privadas
 */
function shouldLogUrl(url: string | undefined, excludeUrls: string[]): boolean {
  if (!url) return false;
  return !excludeUrls.some(excludeUrl => url.includes(excludeUrl));
}
