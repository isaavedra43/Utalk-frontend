/**
 * Utilidades compartidas para stores
 * Elimina duplicación de funciones helper entre stores
 */

import type { ApiError } from '$lib/types';

// Función helper para extraer errores de API de forma segura
export function extractApiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { data?: { message?: string; code?: string }; status?: number };
    };
    return {
      message: axiosError.response?.data?.message || 'Error de conexión',
      code: axiosError.response?.data?.code,
      status: axiosError.response?.status
    };
  }
  return {
    message: 'Error desconocido',
    code: 'UNKNOWN_ERROR'
  };
}

// Función helper para obtener el estado del store
export function get<T>(store: { subscribe: (fn: (value: T) => void) => () => void }): T {
  let value: T;
  store.subscribe((val: T) => {
    value = val;
  })();
  return value!;
}
