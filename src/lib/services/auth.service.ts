/**
 * Servicio de Autenticación para UTalk Frontend
 * Maneja la comunicación con el backend para login y gestión de sesiones
 *
 * Basado en la documentación backend:
 * - BACKEND_ADVANCED_LOGIC_CORREGIDO.md
 * - BACKEND_ADVANCED_LOGIC.md
 * - DOCUMENTACION_COMPLETA_BACKEND_UTALK.md
 */

import type { AxiosError } from 'axios';
import { apiClient } from './axios';

// Tipos basados en la documentación del backend
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    name: string;
    role: string;
    avatarUrl?: string;
    status: string;
    permissions: string[];
    isOnline: boolean;
    lastSeen: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Errores específicos del backend según documentación
export interface ApiErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: {
    retryAfter?: number;
    operation?: string;
  };
}

/**
 * Función principal de login
 *
 * Según la documentación del backend:
 * - Endpoint: POST /api/auth/login
 * - Payload: { email, password }
 * - Respuesta exitosa: { accessToken, refreshToken, user }
 * - Errores específicos: 401 (invalid credentials), 429 (rate limit), 500 (server error)
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    // Usar el cliente Axios existente que ya tiene configurado:
    // - Base URL desde environment variables
    // - Timeouts apropiados
    // - Headers correctos
    // - Interceptors para logging
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      email: email.toLowerCase().trim(), // Normalizar email según backend
      password
    } as LoginRequest);

    // Validar respuesta según documentación backend
    const { accessToken, refreshToken, user } = response.data;

    if (!accessToken || !refreshToken || !user) {
      throw new Error('Respuesta inválida del servidor');
    }

    return response.data;
  } catch (error) {
    // Manejo de errores específicos según documentación backend
    const axiosError = error as AxiosError<ApiErrorResponse>;

    if (axiosError.response) {
      const status = axiosError.response.status;
      const errorData = axiosError.response.data;

      switch (status) {
        case 401:
          // Credenciales inválidas - según BACKEND_ADVANCED_LOGIC_CORREGIDO.md línea 185-190
          throw new Error('Correo o contraseña incorrectos');

        case 429: {
          // Rate limiting - según BACKEND_ADVANCED_LOGIC_CORREGIDO.md línea 334-356
          const retryAfter = axiosError.response.headers['x-ratelimit-reset'];
          if (retryAfter) {
            throw new Error(
              `Demasiados intentos. Intenta nuevamente en ${Math.ceil(parseInt(retryAfter) / 60)} minutos.`
            );
          }
          throw new Error('Demasiados intentos de login. Intenta más tarde.');
        }

        case 400:
          // Validación - credenciales faltantes según documentación
          if (errorData?.error === 'MISSING_CREDENTIALS') {
            throw new Error('Email y contraseña son requeridos');
          }
          throw new Error('Datos de login inválidos');

        case 500:
        case 502:
        case 503:
        case 504:
          // Errores del servidor - según documentación
          throw new Error('El servidor no está disponible, intenta más tarde');

        default:
          // Otros errores no documentados
          throw new Error('Error inesperado al iniciar sesión');
      }
    }

    // Error de red o conexión
    if (axiosError.code === 'NETWORK_ERROR' || axiosError.message?.includes('Network Error')) {
      throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
    }

    // Error de timeout
    if (axiosError.code === 'ECONNABORTED') {
      throw new Error('La solicitud tardó demasiado. Intenta nuevamente.');
    }

    // Error genérico
    throw new Error('Error inesperado al iniciar sesión');
  }
}

/**
 * Función para logout completo
 * Invalida tokens en el backend y limpia cookies
 */
export async function logout(): Promise<void> {
  try {
    // Llamar al endpoint de logout del backend para invalidar tokens
    await apiClient.post('/api/auth/logout');
  } catch (error) {
    // En caso de error del backend, continuar con logout local
    // El frontend debe limpiar su estado independientemente
    // eslint-disable-next-line no-console
    console.warn('Error al hacer logout en backend, continuando con logout local:', error);
  }
}

/**
 * Función para refresh token
 * Según BACKEND_ADVANCED_LOGIC.md línea 452-462 y documentación completa
 */
export async function refreshToken(): Promise<LoginResponse> {
  try {
    // El refresh token se envía automáticamente en cookies HttpOnly
    // No necesitamos enviarlo explícitamente en el body
    const response = await apiClient.post<LoginResponse>('/api/auth/refresh');

    if (!response.data.accessToken || !response.data.refreshToken || !response.data.user) {
      throw new Error('Respuesta inválida del servidor durante refresh');
    }

    return response.data;
  } catch (error) {
    const axiosError = error as any;

    if (axiosError.response?.status === 401) {
      // Refresh token expirado o inválido
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (axiosError.response?.status === 403) {
      // Token family comprometido según documentación (línea 204-208)
      throw new Error('Sesión comprometida. Por favor, inicia sesión nuevamente.');
    }

    // Otros errores
    throw new Error('Error al renovar la sesión. Intenta nuevamente.');
  }
}

/**
 * Función para validar si el usuario está autenticado
 * Útil para guards de rutas y verificaciones de estado
 */
export async function validateSession(): Promise<boolean> {
  try {
    // TODO: Implementar endpoint de validación cuando esté disponible
    const response = await apiClient.get('/api/auth/validate');
    return response.status === 200;
  } catch (error) {
    return false;
  }
}
