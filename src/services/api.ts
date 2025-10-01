import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { rateLimiter } from '../utils/rateLimiter';
import { deduplicateRequest, generateRequestKey } from '../utils/retryUtils';
import { sanitizeConversationId } from '../utils/conversationUtils';
import { logger, LogCategory } from '../utils/logger';
import { infoLog } from '../config/logger';
import { retryApiOperation, retryAuthOperation } from '../utils/retryWithBackoff';

// Usar URL del backend real
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'https://utalk-backend-production.up.railway.app';

logger.apiInfo('Configurando API con URL', { apiBaseUrl: API_BASE_URL });

// Flag para prevenir múltiples intentos de refresh simultáneos
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url || '';
    const method = config.method || 'GET';
    
    // Verificar rate limit antes de hacer la petición
    if (!rateLimiter.checkRateLimit(url)) {
      infoLog('🚫 Rate limit excedido, cancelando petición:', url);
      throw new Error('Rate limit exceeded');
    }

    // VALIDACIÓN MEJORADA DE TOKENS - CRÍTICO PARA CALIDAD
    const token = localStorage.getItem('access_token');
    // ✅ CORREGIDO: Agregar token a TODAS las llamadas API (incluyendo GET)
    const shouldAddToken = true;
    
    // Validación estricta del token antes de agregarlo
    if (token && shouldAddToken) {
      // Verificar que el token no sea undefined, null o malformado
      if (token === 'undefined' || token === 'null' || token.length < 10 || !token.startsWith('eyJ')) {
        logger.apiError('Token inválido detectado en request', new Error('Token malformado'), {
          method: method?.toUpperCase(),
          url: url,
          tokenValue: token,
          tokenLength: token.length,
          tokenStart: token.substring(0, 10)
        });
        
        // Limpiar token inválido y evitar el request
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Disparar evento de autenticación fallida
        window.dispatchEvent(new CustomEvent('auth:authentication-failed'));
        
        return Promise.reject(new Error('Token inválido en localStorage'));
      }
      
      const authHeader = `Bearer ${token}`;
      
      // Verificar que el header no contenga undefined
      if (authHeader.includes('undefined')) {
        logger.apiError('Header Authorization contiene undefined', new Error('Header malformado'), {
          method: method?.toUpperCase(),
          url: url,
          authHeader: authHeader,
          tokenValue: token
        });
        return Promise.reject(new Error('Header Authorization malformado'));
      }
      
      config.headers.Authorization = authHeader;
      
      logger.apiInfo('Token válido agregado a request', {
        method: method?.toUpperCase(),
        url: url,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
        headerValid: !authHeader.includes('undefined')
      });
    } else if (shouldAddToken && !token) {
      // Loggear requests sin token para métodos no-GET y proxy de medios
      logger.apiInfo('Request sin token', {
        method: method?.toUpperCase(),
        url: url,
        isAuthEndpoint: url.includes('/auth/')
      });
    }

    // Validar IDs de conversación en URLs y aplicar URL encoding correcto
    if (config.url) {
      const conversationIdMatch = config.url.match(/\/conversations\/([^/?]+)/);
      if (conversationIdMatch) {
        const conversationId = conversationIdMatch[1];
        
        // SOLUCIÓN CRÍTICA: Decodificar el ID que puede tener espacios en lugar de +
        // HTTP convierte automáticamente + en espacios, necesitamos revertir esto
        const decodedConversationId = conversationId.replace(/\s/g, '+');
        
        const sanitizedId = sanitizeConversationId(decodedConversationId);
        
        if (!sanitizedId) {
          logger.apiError('ID de conversación inválido detectado en URL', new Error(`Invalid conversation ID: ${conversationId}`), {
            originalUrl: config.url,
            invalidId: conversationId,
            decodedId: decodedConversationId,
            method: method?.toUpperCase()
          });
          return Promise.reject(new Error(`ID de conversación inválido: ${conversationId}`));
        }
        
        // SOLUCIÓN: Enviar + directamente sin codificar para que el backend lo reciba correctamente
        // El backend espera + literal, no %2B
        const sanitizedForBackend = sanitizedId.replace(/%2B/g, '+');
        
        if (sanitizedForBackend !== conversationId) {
          // Reemplazar el ID en la URL con la versión que el backend espera
          config.url = config.url.replace(conversationId, sanitizedForBackend);
          // Solo loggear formateo de ID en desarrollo
          if (import.meta.env.DEV) {
            logger.apiInfo('ID de conversación formateado para backend', {
              originalId: conversationId,
              decodedId: decodedConversationId,
              sanitizedId,
              backendFormat: sanitizedForBackend,
              method: method?.toUpperCase(),
              url: config.url
            });
          }
        }
      }
    }

    // DEDUPLICACIÓN SOLO PARA GET - NO APLICAR A FORMDATA
    const isFormData = config.data instanceof FormData;
    const requestKey = generateRequestKey(method, url, config.params);
    
    if (method === 'GET' && !isFormData) {
      return deduplicateRequest(requestKey, () => {
        // Continuar con la petición original
        return Promise.resolve(config);
      });
    }
    
    // Log de requests solo en desarrollo y solo para métodos no-GET
    // NO loggear config.data para FormData para evitar problemas
    if (import.meta.env.DEV && config.method !== 'GET' && !isFormData) {
      logger.debug(LogCategory.API, `Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    } else if (import.meta.env.DEV && config.method !== 'GET' && isFormData) {
      // Para FormData, solo loggear información básica sin el contenido
      logger.debug(LogCategory.API, `Request: ${config.method?.toUpperCase()} ${config.url} [FormData]`);
    }
    
    return config;
  },
  (error) => {
    logger.apiError('Error en interceptor de request', error);
    return Promise.reject(error);
  }
);

// Interceptor de responses
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const url = response.config.url || '';
    
    // NUEVO: Registrar petición exitosa en el rate limiter (solo para métodos no-GET)
    if (response.config.method !== 'GET') {
      rateLimiter.recordRequest(url);
    }
    
    // Log de responses solo en desarrollo y solo para métodos no-GET
    if (import.meta.env.DEV && response.config.method !== 'GET') {
      logger.debug(LogCategory.API, `Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    // Solo loggear responses exitosas para métodos no-GET
    if (response.config.method !== 'GET') {
      logger.apiInfo('Response exitosa', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        statusText: response.statusText
      });
    }
    
    return response;
  },
  async (error) => {
    const url = error.config?.url || '';
    
    // NUEVO: Registrar petición fallida también
    rateLimiter.recordRequest(url);

    const originalRequest = error.config;

    // Manejar rate limiting (429)
    if (error.response?.status === 429) {
      const retryAfterHeader = error.response.headers['retry-after'];
      let backoffMs = 5000; // Default 5 segundos
      
      if (retryAfterHeader && !isNaN(Number(retryAfterHeader))) {
        backoffMs = Number(retryAfterHeader) * 1000;
      } else if (error.response?.data?.retryAfterMs) {
        backoffMs = Number(error.response.data.retryAfterMs) || 0;
      }
      
      // Log del rate limit sin usar setBackoff
      infoLog('🚫 Rate limit excedido, esperando', backoffMs, 'ms antes de reintentar');
    }

    // Log de errores en desarrollo
    if (import.meta.env.DEV) {
      logger.apiError(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }

    // Log detallado del error
    logger.apiError('Error en respuesta de API', error, {
      method: originalRequest?.method?.toUpperCase(),
      url: originalRequest?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      isNetworkError: !error.response,
      isTimeout: error.code === 'ECONNABORTED'
    });

    // Solo manejar errores 401 para refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = error.response.data?.error?.code;
      const errorMessage = error.response.data?.error?.message || 'Error de autenticación';
      
      logger.authError('Error 401 detectado', error as Error, {
        errorCode,
        errorMessage,
        url: originalRequest.url,
        method: originalRequest.method
      });

      // Manejar MALFORMED_TOKEN inmediatamente sin intentar refresh
      if (errorCode === 'MALFORMED_TOKEN' || errorCode === 'INVALID_TOKEN') {
        logger.authError('Token corrupto detectado, limpiando inmediatamente', error as Error, {
          errorCode
        });
        
        // Limpiar tokens inmediatamente
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Notificar que la autenticación falló
        window.dispatchEvent(new CustomEvent('auth:authentication-failed'));
        
        // Redirigir al login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }

      // Solo intentar refresh para TOKEN_EXPIRED
      if (errorCode === 'TOKEN_EXPIRED') {
        // Si ya estamos refrescando, agregar a la cola
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');
          
          // VALIDACIÓN MEJORADA DEL REFRESH TOKEN
          if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null' || refreshToken.length < 10) {
            logger.authError('Refresh token inválido o no disponible', new Error('Refresh token inválido'), {
              hasAccessToken: !!localStorage.getItem('access_token'),
              hasRefreshToken: !!refreshToken,
              refreshTokenValue: refreshToken,
              refreshTokenLength: refreshToken?.length
            });
            
            // Limpiar tokens y redirigir
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            
            // Notificar que la autenticación falló
            window.dispatchEvent(new CustomEvent('auth:authentication-failed'));
            
            processQueue(new Error('No refresh token available'));
            throw new Error('No refresh token available');
          }

          logger.authInfo('Intentando refresh token para TOKEN_EXPIRED', {
            hasRefreshToken: !!refreshToken,
            refreshTokenPreview: refreshToken ? refreshToken.substring(0, 20) + '...' : 'null'
          });
          
          // VALIDACIÓN DEL PAYLOAD DE REFRESH
          const refreshPayload = { refreshToken };
          if (!refreshPayload.refreshToken || refreshPayload.refreshToken.includes('undefined')) {
            logger.authError('Payload de refresh contiene token inválido', new Error('Payload inválido'), {
              refreshToken: refreshPayload.refreshToken
            });
            throw new Error('Refresh token inválido en payload');
          }
          
          // USAR RETRY SYSTEM PARA REFRESH TOKEN - CRÍTICO
          const refreshResult = await retryAuthOperation(async () => {
            return await api.post('/api/auth/refresh', refreshPayload);
          });
          
          if (!refreshResult.success) {
            logger.authError('Refresh token falló después de todos los reintentos', refreshResult.error as Error);
            throw refreshResult.error || new Error('Refresh token falló');
          }
          
          const response = refreshResult.data!;
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // VALIDACIÓN DE LA RESPUESTA DE REFRESH
          if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
            logger.authError('Respuesta de refresh contiene token inválido', new Error('Token de respuesta inválido'), {
              hasAccessToken: !!accessToken,
              accessTokenValue: accessToken,
              responseData: response.data
            });
            throw new Error('Token de acceso inválido en respuesta de refresh');
          }
          
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', newRefreshToken);
          
          // VALIDACIÓN FINAL ANTES DE GUARDAR
          if (accessToken.includes('undefined') || newRefreshToken?.includes('undefined')) {
            logger.authError('Tokens refrescados contienen undefined', new Error('Tokens malformados'), {
              accessToken: accessToken,
              newRefreshToken: newRefreshToken
            });
            throw new Error('Tokens refrescados malformados');
          }
          
          logger.authInfo('Token refrescado exitosamente', {
            hasNewAccessToken: !!accessToken,
            hasNewRefreshToken: !!newRefreshToken,
            accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'null',
            accessTokenValid: !accessToken.includes('undefined'),
            refreshTokenValid: !newRefreshToken?.includes('undefined')
          });
          
          // Notificar a la aplicación que el token fue refrescado para reautenticar WS
          window.dispatchEvent(new CustomEvent('auth:token-refreshed', { detail: { accessToken } }));
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          logger.apiInfo('Reintentando request original con nuevo token', {
            method: originalRequest.method?.toUpperCase(),
            url: originalRequest.url
          });
          
          processQueue(null, accessToken);
          return api(originalRequest);
        } catch (refreshError) {
          logger.authError('Error refrescando token', refreshError as Error, {
            originalError: error.message,
            refreshAttempted: true
          });
          
          // Limpiar tokens y redirigir al login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          
          logger.authInfo('Tokens limpiados, redirigiendo al login');
          
          // Notificar que la autenticación falló
          window.dispatchEvent(new CustomEvent('auth:authentication-failed'));
          
          processQueue(refreshError as Error);
          
          // Redirigir al login solo si no estamos ya en login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Otros errores 401 no manejados - limpiar y redirigir
        logger.authError('Error 401 no manejado, limpiando autenticación', error as Error, {
          errorCode,
          errorMessage
        });
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        window.dispatchEvent(new CustomEvent('auth:authentication-failed'));
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    }

    // Manejar errores 404 específicos sin retry
    if (error.response?.status === 404) {
      const errorCode = error.response.data?.error?.code;
      
      if (errorCode === 'CONVERSATION_NOT_FOUND') {
        logger.apiInfo('Conversación no encontrada, no reintentando', {
          url: originalRequest.url,
          conversationId: originalRequest.url?.match(/conv_[^&?]+/)?.[0]
        });
        // No hacer retry de conversaciones no encontradas
        return Promise.reject(error);
      }
    }

    // Manejar errores 500 sin retry
    if (error.response?.status === 500) {
      logger.apiError('Error interno del servidor, no reintentando', error as Error, {
        url: originalRequest.url,
        method: originalRequest.method,
        errorDetails: error.response.data
      });
      // No hacer retry de errores 500
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export { api };
export default api; 