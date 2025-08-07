/**
 * Cliente HTTP configurado para UTalk Frontend
 * Incluye configuración de base URL, timeouts, headers y manejo de errores
 *
 * Configuración basada en DOCUMENTACION_COMPLETA_BACKEND_UTALK.md
 *
 * ⚠️ ALINEACIÓN CRÍTICA CON BACKEND:
 * Según BACKEND_ADVANCED_LOGIC_CORREGIDO.md y DOCUMENTACION_COMPLETA_BACKEND_UTALK.md,
 * el backend REQUIERE el header 'Authorization: Bearer ' en TODAS las requests,
 * incluso en el login inicial donde aún no hay token.
 */

// Configuración de Axios con interceptores - Extraído de PLAN_FRONTEND_UTALK_COMPLETO.md Fase 1.1
import { environment } from '$lib/config/environment';
import { authStore } from '$lib/stores/auth.store';
import { notificationsStore } from '$lib/stores/notifications.store';
import { logError } from '$lib/utils/logger';
import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';

// ✅ Interfaces específicas para errores del backend según documentación
export interface BackendErrorResponse {
  success: false;
  message: string;
  code?: string;
  retryAfter?: number;
}

export interface RefreshTokenResponse {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// ✅ Función para validar si es error del backend
function isBackendError(data: unknown): data is BackendErrorResponse {
  return typeof data === 'object' && data !== null && 'message' in data;
}

// ✅ Función para extraer datos de error de forma segura
function extractErrorData(error: AxiosError): BackendErrorResponse {
  if (error.response?.data && isBackendError(error.response.data)) {
    return error.response.data;
  }

  return {
    success: false,
    message: 'Error de conexión',
    code: 'UNKNOWN_ERROR'
  };
}

// Configuración de la instancia de Axios - Documento: info/1.md sección "Headers de Autorización Específicos"
const api: AxiosInstance = axios.create({
  baseURL: environment.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requests - Documento: info/1.md sección "Headers de Autorización Específicos"
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de responses - Documento: info/1.md sección "Casos Especiales que la UI debe manejar"
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Manejar rate limiting - Documento: info/1.md sección "Rate Limiting"
    handleRateLimitHeaders(response);
    return response;
  },
  async (error: AxiosError) => {
    // Token expirado durante procesamiento - Documento: info/1.md sección "Token Expirado Durante Procesamiento"
    if (error.response?.status === 401) {
      const errorData = extractErrorData(error);

      // Verificar si es una petición crítica que requiere redirección
      const isCriticalRequest = error.config?.url?.includes('/auth/') ||
        error.config?.url?.includes('/profile') ||
        error.config?.method === 'POST';

      if (errorData.code === 'TOKEN_EXPIRED_DURING_PROCESSING') {
        try {
          // Intentar refresh token automáticamente
          await refreshToken();
          // Reintentar la operación original
          return api.request(error.config!);
        } catch (refreshError) {
          // Si el refresh falla y es una petición crítica, deslogear al usuario
          if (isCriticalRequest) {
            authStore.logout();
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // Otro error 401 - solo redirigir si es una petición crítica
        if (isCriticalRequest) {
          authStore.logout();
          window.location.href = '/login';
        } else {
          // Para peticiones no críticas (como cargar conversaciones), solo mostrar error
          notificationsStore.error('Error de autorización. Verifica tu sesión.');
        }
      }
    }

    // Rate limiting - Documento: info/1.md sección "Rate Limiting"
    if (error.response?.status === 429) {
      const errorData = extractErrorData(error);
      const retryAfter = errorData.retryAfter || 60;
      notificationsStore.error(`Has excedido el límite de peticiones. Intenta de nuevo en ${retryAfter} segundos.`);
      return Promise.reject(error);
    }

    // Error de archivo demasiado grande - Documento: info/1.5.md sección "Validación de Archivos"
    if (error.response?.status === 413) {
      notificationsStore.error('Archivo demasiado grande. Máximo 100MB por archivo.');
      return Promise.reject(error);
    }

    // Error de tipo de archivo no permitido - Documento: info/1.5.md sección "Validación de Archivos"
    if (error.response?.status === 415) {
      notificationsStore.error('Tipo de archivo no permitido.');
      return Promise.reject(error);
    }

    // Error de permisos - Documento: info/1.md sección "Reglas de Autorización"
    if (error.response?.status === 403) {
      notificationsStore.error('No tienes permisos para realizar esta acción.');
      return Promise.reject(error);
    }

    // Error de conversación no encontrada - Documento: info/1.md sección "Casos Especiales"
    if (error.response?.status === 404) {
      const errorData = extractErrorData(error);
      notificationsStore.error(errorData.message);
      return Promise.reject(error);
    }

    // Error específico para conversaciones - no redirigir automáticamente
    if (error.response?.status === 401 && error.config?.url?.includes('/conversations')) {
      notificationsStore.error('No se pudieron cargar las conversaciones. Verifica tu sesión.');
      return Promise.reject(error);
    }

    // Error genérico del servidor
    if (error.response?.status && error.response.status >= 500) {
      notificationsStore.error('Error interno del servidor. Intenta de nuevo más tarde.');
      return Promise.reject(error);
    }

    // Mostrar mensaje de error del backend si existe
    const errorData = extractErrorData(error);
    notificationsStore.error(errorData.message);

    return Promise.reject(error);
  }
);

// Función para manejar headers de rate limiting - Documento: info/1.md sección "Rate Limiting"
function handleRateLimitHeaders(response: AxiosResponse) {
  const remaining = response.headers['X-RateLimit-Remaining'];

  if (remaining && parseInt(remaining) < 5) {
    notificationsStore.warning('Estás cerca del límite de peticiones. Ten cuidado con el uso.');
  }
}

// Función para refresh token - Documento: info/1.5.md sección "Respuesta de Refresh Token"
async function refreshToken(): Promise<void> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    const response = await axios.post<RefreshTokenResponse>(`${environment.API_URL}/auth/refresh`, {
      refreshToken
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    // Actualizar tokens en localStorage con nombres consistentes
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    // Actualizar store de autenticación
    authStore.setToken(accessToken);

  } catch (error) {
    logError('Error refreshing token:', 'API', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

export { api };
