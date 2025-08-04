/**
 * Cliente HTTP configurado para UTalk Frontend
 * Incluye configuración de base URL, timeouts, headers y manejo de errores
 *
 * Configuración basada en DOCUMENTACION_COMPLETA_BACKEND_UTALK.md
 */

import { API_BASE_URL } from '$lib/env';
import type { QueueItem } from '$lib/types/http';
import { browser } from '$lib/utils/browser';
import axios from 'axios';

// Configuración del cliente Axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos timeout según documentación
  withCredentials: true, // Enviar cookies automáticamente
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Interceptor para requests
apiClient.interceptors.request.use(
  config => {
    // Log en desarrollo
    if (import.meta.env.DEV && typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  error => {
    // eslint-disable-next-line no-console
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

// Función para procesar la cola de requests después del refresh
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor para responses con auto-refresh
apiClient.interceptors.response.use(
  response => {
    // Log en desarrollo
    if (import.meta.env.DEV && typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }

    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Manejo centralizado de errores
    if (error.response) {
      // Error del servidor (4xx, 5xx)
      if (import.meta.env.DEV && typeof console !== 'undefined') {
        // eslint-disable-next-line no-console
        console.error('❌ API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          url: error.config?.url,
          data: error.response.data
        });
      }

      // Manejo específico por código de estado
      switch (error.response.status) {
        case 401: {
          // Token expirado - intentar refresh automático
          if (browser && !originalRequest._retry) {
            if (isRefreshing) {
              // Si ya estamos refrescando, añadir a la cola
              return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
              })
                .then(() => {
                  return apiClient(originalRequest);
                })
                .catch(err => {
                  return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
              // Importar dinámicamente para evitar dependencias circulares
              const { refreshToken } = await import('./auth.service');
              const refreshResponse = await refreshToken();

              // El nuevo token se establece automáticamente en cookies por el servidor
              // Procesar la cola de requests pendientes
              processQueue(null, refreshResponse.accessToken);

              // Reintentar el request original
              return apiClient(originalRequest);
            } catch (refreshError) {
              // Refresh falló - forzar logout
              processQueue(refreshError, null);

              // Importar y ejecutar logout
              const { authStore } = await import('../stores/auth.store');
              await authStore.logout();

              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          }
          break;
        }
        case 403:
          if (import.meta.env.DEV && typeof console !== 'undefined') {
            // eslint-disable-next-line no-console
            console.error('🔒 Acceso denegado');
          }
          break;
        case 404:
          if (import.meta.env.DEV && typeof console !== 'undefined') {
            // eslint-disable-next-line no-console
            console.error('🔍 Recurso no encontrado');
          }
          break;
        case 500:
          if (import.meta.env.DEV && typeof console !== 'undefined') {
            // eslint-disable-next-line no-console
            console.error('💥 Error interno del servidor');
          }
          break;
      }
    } else if (error.request) {
      // Error de red (sin respuesta del servidor)
      if (import.meta.env.DEV && typeof console !== 'undefined') {
        // eslint-disable-next-line no-console
        console.error('🌐 Network Error:', error.message);
      }
    } else {
      // Error de configuración
      if (import.meta.env.DEV && typeof console !== 'undefined') {
        // eslint-disable-next-line no-console
        console.error('⚙️ Axios Config Error:', error.message);
      }
    }

    return Promise.reject(error);
  }
);

// Exportar tipos útiles
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

// Funciones helper para métodos HTTP comunes
export const api = {
  get: <T = unknown>(url: string, config?: object) => apiClient.get<T>(url, config),

  post: <T = unknown>(url: string, data?: unknown, config?: object) =>
    apiClient.post<T>(url, data, config),

  put: <T = unknown>(url: string, data?: unknown, config?: object) =>
    apiClient.put<T>(url, data, config),

  patch: <T = unknown>(url: string, data?: unknown, config?: object) =>
    apiClient.patch<T>(url, data, config),

  delete: <T = unknown>(url: string, config?: object) => apiClient.delete<T>(url, config)
};

// Exportar por defecto para compatibilidad
export default apiClient;
