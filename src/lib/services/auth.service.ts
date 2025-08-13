/**
 * Servicio de Autenticación para UTalk Frontend
 * Maneja login, logout, refresh tokens y autenticación con backend
 */

import { browser } from '$app/environment';
import { API_BASE_URL } from '$lib/env';
import type { LoginRequest, LoginResponse } from '$lib/types/auth';
import { logAuth, logError, logWarn, logWarnWithContext } from '$lib/utils/logger';
import { api } from './axios';

// ✅ LOG INICIAL SIMPLE
logAuth('AUTH SERVICE - Cargado');

/**
 * Función de login
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  logAuth('AUTH LOGIN - Iniciando autenticación');

  try {
    // Verificar configuración
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL no configurada');
    }

    // Configurar URL base del cliente
    api.defaults.baseURL = API_BASE_URL;

    logAuth('AUTH LOGIN - Enviando request a:', `${API_BASE_URL}/auth/login`);

    // Realizar request de login
    const response = await api.post('/auth/login', credentials);

    logAuth('AUTH LOGIN - Respuesta exitosa del backend');

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
        logAuth('AUTH LOGIN - Token almacenado en localStorage');
      } catch (storageError) {
        logWarnWithContext(
          'AUTH LOGIN - Error al guardar en localStorage:',
          'AUTH',
          String(storageError)
        );
      }
    }

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(
      'AUTH LOGIN - Error:',
      'AUTH',
      error instanceof Error ? error : new Error(errorMessage)
    );

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
  logAuth('AUTH LOGOUT - Cerrando sesión');

  try {
    // Limpiar localStorage SOLO en el cliente
    if (browser) {
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        logAuth('AUTH LOGOUT - Tokens eliminados del localStorage');
      } catch (storageError) {
        logWarnWithContext(
          'AUTH LOGOUT - Error al limpiar localStorage:',
          'AUTH',
          String(storageError)
        );
      }
    }

    // Intentar notificar al backend
    if (api.defaults.baseURL) {
      await api.post('/auth/logout');
      logAuth('AUTH LOGOUT - Backend notificado');
    }
  } catch (error) {
    logWarnWithContext('AUTH LOGOUT - Error al notificar backend:', 'AUTH', String(error));
    // No es crítico si el logout en backend falla
  }
}

/**
 * Función para refrescar token
 */
export async function refreshToken(): Promise<LoginResponse | null> {
  logAuth('AUTH REFRESH - Refrescando token');

  try {
    let currentRefreshToken: string | null = null;

    // Obtener refresh token SOLO en el cliente
    if (browser) {
      try {
        currentRefreshToken = localStorage.getItem('refreshToken');
      } catch (storageError) {
        logWarnWithContext(
          'AUTH REFRESH - Error al leer localStorage:',
          'AUTH',
          String(storageError)
        );
      }
    }

    if (!currentRefreshToken) {
      logWarn('AUTH REFRESH - No hay refresh token');
      return null;
    }

    const response = await api.post('/auth/refresh', {
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
        logAuth('AUTH REFRESH - Token actualizado');
      } catch (storageError) {
        logWarnWithContext(
          'AUTH REFRESH - Error al guardar en localStorage:',
          'AUTH',
          String(storageError)
        );
      }
    }

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(
      'AUTH REFRESH - Error:',
      'AUTH',
      error instanceof Error ? error : new Error(errorMessage)
    );

    // Si el refresh falla, limpiar tokens SOLO en el cliente
    if (browser) {
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } catch (storageError) {
        logWarnWithContext(
          'AUTH REFRESH - Error al limpiar localStorage:',
          'AUTH',
          String(storageError)
        );
      }
    }

    return null;
  }
}
