import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import type { ApiResponse } from '../types';

// Configuración del backend
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const REFRESH_TOKEN_KEY = 'utalk_refresh_token';

// Crear instancia de Axios
const api: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para renovar token automáticamente
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const response = await api.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('access_token', response.data.accessToken);
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return api.request(error.config);
          }
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
export const handleApiError = (error: AxiosError): ApiResponse<null> => {
  const errorResponse: ApiResponse<null> = {
    data: null,
    message: 'Error desconocido',
    success: false,
  };

  if (error.response) {
    // Error de respuesta del servidor
    errorResponse.message = (error.response.data as Record<string, unknown>)?.message as string || 'Error del servidor';
    errorResponse.success = false;
  } else if (error.request) {
    // Error de red
    errorResponse.message = 'Error de conexión';
    errorResponse.success = false;
  } else {
    // Error de configuración
    errorResponse.message = error.message || 'Error de configuración';
    errorResponse.success = false;
  }

  return errorResponse;
};

// Funciones de autenticación
export const login = async (email: string, password: string): Promise<ApiResponse<Record<string, unknown> | null>> => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    
    // Guardar tokens
    localStorage.setItem('access_token', response.data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
    localStorage.setItem('user_profile', JSON.stringify(response.data.user));
    
    return {
      data: response.data,
      message: 'Login exitoso',
      success: true,
    };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    console.warn('Error en logout:', error);
  } finally {
    localStorage.clear();
  }
};

export const validateToken = async (): Promise<boolean> => {
  try {
    const response = await api.post('/api/auth/validate-token');
    return response.data.valid;
  } catch {
    return false;
  }
};

export default api; 