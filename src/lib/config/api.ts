/**
 * Configuración de API según documentación del backend
 * Basado en DOCUMENTACION_COMPLETA_BACKEND_UTALK.md
 */

// ✅ URLs del backend según documentación
export const API_CONFIG = {
  // URL base del backend
  BASE_URL: 'https://utalk-backend-production.up.railway.app/api',

  // Endpoints de autenticación según documentación
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },

  // Headers requeridos según documentación
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    AUTHORIZATION: 'Bearer ' // Header requerido por el backend
  }
} as const;

// ✅ Función para construir URLs completas
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// ✅ Función para obtener headers requeridos
export function getAuthHeaders(token?: string): Record<string, string> {
  return {
    'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
    Authorization: `${API_CONFIG.HEADERS.AUTHORIZATION}${token || ''}`
  };
}

// ✅ Función para validar respuesta del backend
export function validateAuthResponse(data: any): boolean {
  return !!(data?.accessToken && data?.user);
}
