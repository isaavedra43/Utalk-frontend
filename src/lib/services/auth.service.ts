/**
 * Servicio de Autenticación para UTalk Frontend
 * Maneja login, logout y refresh de tokens de manera segura
 *
 * Basado en la documentación del backend:
 * - BACKEND_ADVANCED_LOGIC_CORREGIDO.md
 * - BACKEND_ADVANCED_LOGIC.md
 * - DOCUMENTACION_COMPLETA_BACKEND_UTALK.md
 */

import type { LoginResponse } from '$lib/types/auth';
import type { ApiError } from '$lib/types/http';
import { apiClient } from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Función de login
 * Autentica un usuario con email y password
 * Los tokens se manejan automáticamente vía cookies HttpOnly
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    // Validación básica de credentials
    if (!credentials.email || !credentials.password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Realizar request de login al backend
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password
    });

    // Validar respuesta del backend
    if (!response.data || !response.data.accessToken || !response.data.user) {
      throw new Error('Respuesta inválida del servidor');
    }

    return response.data;
  } catch (error) {
    // Convertir errores de Axios a errores estructurados
    const apiError = error as ApiError;

    if (apiError.response?.status === 401) {
      throw new Error('Correo o contraseña incorrectos');
    }

    if (apiError.response?.status === 429) {
      const retryAfter = apiError.response.headers?.['retry-after'];
      const waitTime = retryAfter ? parseInt(retryAfter as string) : 60;
      throw new Error(`Demasiados intentos de login. Espera ${waitTime} segundos.`);
    }

    if (apiError.response?.status === 500) {
      throw new Error('El servidor no está disponible temporalmente');
    }

    if (!apiError.response) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }

    // Error genérico para casos no manejados
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
    const apiError = error as ApiError;

    if (apiError.response?.status === 401) {
      // Refresh token expirado o inválido
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (apiError.response?.status === 403) {
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
