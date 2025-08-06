/**
 * Servicio de Autenticación para UTalk Frontend
 * Maneja login, logout, refresh tokens y autenticación con backend
 */

import { browser } from '$app/environment';
import { API_BASE_URL } from '$lib/env';
import type { LoginRequest, LoginResponse } from '$lib/types/auth';
import { apiClient } from './axios';

// ✅ LOG INICIAL SIMPLE
// eslint-disable-next-line no-console
console.log('🔐 AUTH SERVICE - Cargado');

/**
 * Función de login
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  // eslint-disable-next-line no-console
  console.log('🚀 AUTH LOGIN - Iniciando autenticación');

  try {
    // Verificar configuración
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL no configurada');
    }

    // Configurar URL base del cliente
    apiClient.defaults.baseURL = API_BASE_URL;

    // eslint-disable-next-line no-console
    console.log('📡 AUTH LOGIN - Enviando request a:', `${API_BASE_URL}/auth/login`);

    // Realizar request de login
    const response = await apiClient.post('/auth/login', credentials);

    // eslint-disable-next-line no-console
    console.log('✅ AUTH LOGIN - Respuesta exitosa del backend');

    const data = response.data as LoginResponse;

    // Validar respuesta
    if (!data.accessToken || !data.user) {
      throw new Error('Respuesta inválida del servidor');
    }

    // Almacenar token en localStorage SOLO en el cliente
    if (browser && data.accessToken) {
      try {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        // eslint-disable-next-line no-console
        console.log('💾 AUTH LOGIN - Token almacenado en localStorage');
      } catch (storageError) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ AUTH LOGIN - Error al guardar en localStorage:', storageError);
      }
    }

    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('🚨 AUTH LOGIN - Error:', {
      message: error instanceof Error ? error.message : String(error),
      status: (error as { response?: { status?: number } })?.response?.status || 'unknown'
    });

    // Manejar errores específicos
    if ((error as { response?: { status?: number } })?.response?.status === 502) {
      throw new Error('Backend temporalmente no disponible (502)');
    }

    if ((error as { response?: { status?: number } })?.response?.status === 401) {
      throw new Error('Credenciales incorrectas');
    }

    throw new Error('Error al conectar con el servidor');
  }
}

/**
 * Función de logout
 */
export async function logout(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('🚪 AUTH LOGOUT - Cerrando sesión');

  try {
    // Limpiar localStorage SOLO en el cliente
    if (browser) {
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // eslint-disable-next-line no-console
        console.log('🗑️ AUTH LOGOUT - Tokens eliminados del localStorage');
      } catch (storageError) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ AUTH LOGOUT - Error al limpiar localStorage:', storageError);
      }
    }

    // Intentar notificar al backend
    if (apiClient.defaults.baseURL) {
      await apiClient.post('/auth/logout');
      // eslint-disable-next-line no-console
      console.log('✅ AUTH LOGOUT - Backend notificado');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ AUTH LOGOUT - Error al notificar backend:', error);
    // No es crítico si el logout en backend falla
  }
}

/**
 * Función para refrescar token
 */
export async function refreshToken(): Promise<LoginResponse | null> {
  // eslint-disable-next-line no-console
  console.log('🔄 AUTH REFRESH - Refrescando token');

  try {
    let currentRefreshToken: string | null = null;

    // Obtener refresh token SOLO en el cliente
    if (browser) {
      try {
        currentRefreshToken = localStorage.getItem('refreshToken');
      } catch (storageError) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ AUTH REFRESH - Error al leer localStorage:', storageError);
      }
    }

    if (!currentRefreshToken) {
      // eslint-disable-next-line no-console
      console.warn('⚠️ AUTH REFRESH - No hay refresh token');
      return null;
    }

    const response = await apiClient.post('/auth/refresh', {
      refreshToken: currentRefreshToken
    });

    const data = response.data as LoginResponse;

    // Actualizar tokens en localStorage SOLO en el cliente
    if (browser && data.accessToken) {
      try {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        // eslint-disable-next-line no-console
        console.log('✅ AUTH REFRESH - Token actualizado');
      } catch (storageError) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ AUTH REFRESH - Error al guardar en localStorage:', storageError);
      }
    }

    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('🚨 AUTH REFRESH - Error:', error);

    // Si el refresh falla, limpiar tokens SOLO en el cliente
    if (browser) {
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } catch (storageError) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ AUTH REFRESH - Error al limpiar localStorage:', storageError);
      }
    }

    return null;
  }
}
