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
import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';
import { environment } from '../config/environment';
import { authStore } from '../stores/auth.store';
import { notificationsStore } from '../stores/notifications.store';

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
    const token = localStorage.getItem('accessToken');
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
      const errorCode = (error.response.data as any)?.code;

      if (errorCode === 'TOKEN_EXPIRED_DURING_PROCESSING') {
        try {
          // Intentar refresh token automáticamente
          await refreshToken();
          // Reintentar la operación original
          return api.request(error.config!);
        } catch (refreshError) {
          // Si el refresh falla, deslogear al usuario
          authStore.logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // Otro error 401, deslogear al usuario
        authStore.logout();
        window.location.href = '/login';
      }
    }

    // Rate limiting - Documento: info/1.md sección "Rate Limiting"
    if (error.response?.status === 429) {
      const retryAfter = (error.response.data as any)?.retryAfter || 60;
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
      const message = (error.response.data as any)?.message || 'Recurso no encontrado';
      notificationsStore.error(message);
      return Promise.reject(error);
    }

    // Error genérico del servidor
    if (error.response?.status && error.response.status >= 500) {
      notificationsStore.error('Error interno del servidor. Intenta de nuevo más tarde.');
      return Promise.reject(error);
    }

    // Mostrar mensaje de error del backend si existe
    const errorMessage = (error.response?.data as any)?.message || 'Error de conexión';
    notificationsStore.error(errorMessage);

    return Promise.reject(error);
  }
);

// Función para manejar headers de rate limiting - Documento: info/1.md sección "Rate Limiting"
function handleRateLimitHeaders(response: AxiosResponse) {
  const remaining = response.headers['X-RateLimit-Remaining'];
  const reset = response.headers['X-RateLimit-Reset'];

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

    const response = await axios.post(`${environment.API_URL}/auth/refresh`, {
      refreshToken
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Actualizar tokens en localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    // Actualizar store de autenticación
    authStore.updateTokens(accessToken, newRefreshToken);

  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

export { api };
