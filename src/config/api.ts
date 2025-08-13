import axios from 'axios';

// Configuración del backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://tu-backend.railway.app';
const SOCKET_URL = BACKEND_URL; // Mismo dominio para WebSocket

// Configuración de autenticación
const AUTH_STORAGE_KEY = 'utalk_auth_tokens';
const REFRESH_TOKEN_KEY = 'utalk_refresh_token';

// Configuración de Axios
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para renovar token automáticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const response = await api.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('access_token', response.data.accessToken);
          error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api.request(error.config);
        } catch {
          // Redirigir al login
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Función para manejar errores de API
const handleApiError = (error: unknown) => {
  const errorResponse: {
    message: string;
    code: string;
    details: unknown;
    status?: number;
  } = {
    message: 'Error desconocido',
    code: 'UNKNOWN_ERROR',
    details: null
  };

  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Error de respuesta del servidor
      errorResponse.message = error.response.data?.message || 'Error del servidor';
      errorResponse.code = error.response.data?.code || 'SERVER_ERROR';
      errorResponse.details = error.response.data?.details || null;
      errorResponse.status = error.response.status;
    } else if (error.request) {
      // Error de red
      errorResponse.message = 'Error de conexión';
      errorResponse.code = 'NETWORK_ERROR';
    }
  } else if (error instanceof Error) {
    // Error de configuración
    errorResponse.message = error.message || 'Error de configuración';
    errorResponse.code = 'CONFIG_ERROR';
  }

  return errorResponse;
};

// Códigos de error comunes
const ERROR_CODES = {
  // Autenticación
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Autorización
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validación
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_PHONE: 'INVALID_PHONE',
  INVALID_EMAIL: 'INVALID_EMAIL',
  
  // Recursos
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  MESSAGE_NOT_FOUND: 'MESSAGE_NOT_FOUND',
  CONTACT_NOT_FOUND: 'CONTACT_NOT_FOUND',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  
  // Socket
  SOCKET_CONNECTION_ERROR: 'SOCKET_CONNECTION_ERROR',
  SOCKET_AUTHENTICATION_ERROR: 'SOCKET_AUTHENTICATION_ERROR',
  
  // IA
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  AI_CONFIGURATION_ERROR: 'AI_CONFIGURATION_ERROR',
  
  // Servidor
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

export {
  api,
  BACKEND_URL,
  SOCKET_URL,
  AUTH_STORAGE_KEY,
  REFRESH_TOKEN_KEY,
  handleApiError,
  ERROR_CODES
}; 