import axios from 'axios';
import { logger, LogCategory } from '../utils/logger';
import { sanitizeConversationId, logConversationId } from '../utils/conversationUtils';

// Usar URL del backend real
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'https://tu-backend.railway.app';

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

// Interceptor para agregar token y validar IDs de conversación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logger.apiInfo('Token agregado a request', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasToken: !!token,
        tokenPreview: token.substring(0, 20) + '...'
      });
    } else {
      logger.apiInfo('Request sin token', {
        method: config.method?.toUpperCase(),
        url: config.url,
        isAuthEndpoint: config.url?.includes('/auth/')
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
            method: config.method?.toUpperCase()
          });
          return Promise.reject(new Error(`ID de conversación inválido: ${conversationId}`));
        }
        
        // SOLUCIÓN CRÍTICA: Aplicar encodeURIComponent para preservar los + en la URL
        const encodedSanitizedId = encodeURIComponent(sanitizedId);
        
        if (encodedSanitizedId !== conversationId) {
          // Reemplazar el ID en la URL con la versión correctamente codificada
          config.url = config.url.replace(conversationId, encodedSanitizedId);
          logConversationId(sanitizedId, 'API Interceptor - URL encoded');
          logger.apiInfo('ID de conversación codificado correctamente en URL', {
            originalId: conversationId,
            decodedId: decodedConversationId,
            sanitizedId,
            encodedId: encodedSanitizedId,
            method: config.method?.toUpperCase(),
            url: config.url
          });
        }
      }
    }
    
    // Log de requests en desarrollo
    if (import.meta.env.DEV) {
      logger.debug(LogCategory.API, `Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    logger.apiError('Error en request interceptor', error);
    return Promise.reject(error);
  }
);

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => {
    // Log de responses en desarrollo
    if (import.meta.env.DEV) {
      logger.debug(LogCategory.API, `Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    logger.apiInfo('Response exitosa', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      statusText: response.statusText
    });
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

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
        if (!refreshToken) {
          logger.authError('No hay refresh token disponible', new Error('Refresh token no encontrado'), {
            hasAccessToken: !!localStorage.getItem('access_token'),
            hasRefreshToken: false
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

        logger.authInfo('Intentando refresh token', {
          hasRefreshToken: !!refreshToken,
          refreshTokenPreview: refreshToken.substring(0, 20) + '...'
        });
        
        const response = await api.post('/api/auth/refresh', { refreshToken });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        
        logger.authInfo('Token refrescado exitosamente', {
          hasNewAccessToken: !!accessToken,
          hasNewRefreshToken: !!newRefreshToken,
          accessTokenPreview: accessToken.substring(0, 20) + '...'
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
    }

    return Promise.reject(error);
  }
);

export default api; 