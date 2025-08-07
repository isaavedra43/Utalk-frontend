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

// ✅ Interfaz para respuesta de autenticación según estructura real del backend
export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  refreshExpiresIn: string;
  user: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: 'admin' | 'agent' | 'viewer';
    permissions: string[];
    department: string;
    isActive: boolean;
    settings: {
      notifications: boolean;
      language: string;
      timezone: string;
    };
    lastLoginAt: {
      _seconds: number;
      _nanoseconds: number;
    };
    createdAt: {
      _seconds: number;
      _nanoseconds: number;
    };
    updatedAt: {
      _seconds: number;
      _nanoseconds: number;
    };
    performance: any;
  };
  deviceInfo: {
    deviceId: string;
    deviceType: string;
    loginAt: string;
  };
}

// ✅ Función para validar respuesta del backend según estructura real
export function validateAuthResponse(data: any): boolean {
  // Validar estructura completa según estructura real del backend
  if (!data || typeof data !== 'object') {
    console.warn('validateAuthResponse: data no es un objeto válido');
    return false;
  }

  if (!data.success) {
    console.warn('validateAuthResponse: success no es true');
    return false;
  }

  if (!data.accessToken || typeof data.accessToken !== 'string') {
    console.warn('validateAuthResponse: accessToken no existe o no es string');
    return false;
  }

  if (!data.refreshToken || typeof data.refreshToken !== 'string') {
    console.warn('validateAuthResponse: refreshToken no existe o no es string');
    return false;
  }

  if (!data.user || typeof data.user !== 'object') {
    console.warn('validateAuthResponse: user no existe o no es objeto');
    return false;
  }

  // Validar campos mínimos del usuario
  if (!data.user.id || !data.user.email || !data.user.role) {
    console.warn('validateAuthResponse: campos mínimos del usuario faltantes');
    return false;
  }

  return true;
}
