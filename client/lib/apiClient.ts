import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';
import { logger } from './utils';
import { disconnectSocket } from './socket';

// Configuración base de la API
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Tipos para las respuestas de la API
interface ApiErrorResponse {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

interface ApiSuccessResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// Crear instancia principal de axios
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Añadir token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logger.api('Token de autenticación añadido a la request', { 
        url: config.url,
        method: config.method?.toUpperCase(),
        hasToken: true 
      });
    }

    // Log de la request saliente
    logger.api('Enviando request HTTP', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      params: config.params,
      hasData: !!config.data,
      headers: {
        'Content-Type': config.headers['Content-Type'],
        'Authorization': config.headers.Authorization ? '[PRESENT]' : '[MISSING]'
      }
    });

    return config;
  },
  (error) => {
    logger.api('Error en request interceptor', { error: error.message }, true);
    return Promise.reject(error);
  }
);

// Response interceptor - Manejo global de respuestas y errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de respuesta exitosa
    logger.api('Respuesta HTTP exitosa recibida', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      hasData: !!response.data,
      dataType: typeof response.data
    });

    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Log del error
    logger.api('Error en respuesta HTTP', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: originalRequest?.url,
      method: originalRequest?.method?.toUpperCase(),
      message: error.response?.data?.message || error.message,
      isNetworkError: !error.response
    }, true);

    // Manejo específico de errores por código de estado
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401: {
          // ¿La request fallida llevaba realmente token?
          const hadAuthHeader = !!originalRequest.headers?.Authorization;

          if (!hadAuthHeader) {
            // 401 en endpoint público o llamada sin credenciales → no tocar sesión
            logger.api('401 recibido SIN header Authorization – se preserva token', {
              url: originalRequest?.url,
            });
            break;
          }

          // Token inválido o expirado (porque SÍ había Authorization)
          logger.auth('Token inválido o expirado - Limpiando sesión y cerrando socket', {
            url: originalRequest?.url,
          }, true);

          // Limpiar token y cerrar conexiones tiempo real
          localStorage.removeItem('authToken');
          try {
            disconnectSocket();
          } catch (_) {
            /* socket no inicializado */
          }

          if (!window.location.pathname.includes('/login')) {
            toast({
              variant: 'destructive',
              title: 'Sesión expirada',
              description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            });

            setTimeout(() => {
              window.location.href = '/login';
            }, 1500);
          }
          break;
        }

        case 403:
          // Sin permisos
          logger.auth('Acceso denegado - Sin permisos suficientes', {
            url: originalRequest?.url,
            userAgent: navigator.userAgent
          }, true);
          
          toast({
            variant: "destructive",
            title: "Acceso denegado",
            description: "No tienes permisos para realizar esta acción.",
          });
          break;

        case 404:
          // Recurso no encontrado
          logger.api('Recurso no encontrado', {
            url: originalRequest?.url,
            method: originalRequest?.method
          }, true);
          
          toast({
            variant: "destructive",
            title: "Recurso no encontrado",
            description: data?.message || "El recurso solicitado no existe.",
          });
          break;

        case 422:
          // Errores de validación
          logger.api('Errores de validación', {
            url: originalRequest?.url,
            errors: data?.errors,
            message: data?.message
          }, true);
          
          if (data?.errors) {
            // Mostrar errores de validación específicos
            const errorMessages = Object.entries(data.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('\n');
            
            toast({
              variant: "destructive",
              title: "Errores de validación",
              description: errorMessages,
            });
          } else {
            toast({
              variant: "destructive",
              title: "Error de validación",
              description: data?.message || "Los datos enviados no son válidos.",
            });
          }
          break;

        case 429:
          // Rate limiting
          logger.api('Rate limit excedido', {
            url: originalRequest?.url,
            retryAfter: error.response.headers['retry-after']
          }, true);
          
          toast({
            variant: "destructive",
            title: "Demasiadas solicitudes",
            description: "Has excedido el límite de solicitudes. Intenta nuevamente en unos momentos.",
          });
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Errores del servidor
          logger.api('Error del servidor', {
            status,
            statusText: error.response.statusText,
            url: originalRequest?.url
          }, true);
          
          toast({
            variant: "destructive",
            title: "Error del servidor",
            description: "Ocurrió un error en el servidor. Intenta nuevamente más tarde.",
          });
          break;

        default:
          // Otros errores
          toast({
            variant: "destructive",
            title: "Error",
            description: data?.message || "Ocurrió un error inesperado.",
          });
      }
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      logger.api('Timeout en request HTTP', {
        url: originalRequest?.url,
        timeout: API_CONFIG.TIMEOUT
      }, true);
      
      toast({
        variant: "destructive",
        title: "Tiempo de espera agotado",
        description: "La solicitud tardó demasiado en responder. Verifica tu conexión.",
      });
    } else {
      // Error de red
      logger.api('Error de red', {
        message: error.message,
        code: error.code,
        url: originalRequest?.url
      }, true);
      
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
      });
    }

    return Promise.reject(error);
  }
);

// Wrapper principal para requests con manejo de errores y retries
class ApiService {
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await apiClient.request<ApiSuccessResponse<T> | T>(config);
      
      // Si la respuesta tiene formato wrapper, extraer data
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as ApiSuccessResponse<T>).data;
      }
      
      // Si es respuesta directa, retornar tal cual
      return response.data as T;
    } catch (error) {
      logger.api('Error en ApiService.request', {
        url: config.url,
        method: config.method,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, true);
      throw error;
    }
  }

  async get<T>(url: string, params?: any): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
    });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config,
    });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });
  }
}

// Instancia principal del servicio API
export const api = new ApiService();

// Funciones utilitarias adicionales
export const apiHelpers = {
  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Obtener el token actual
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  },

  // Establecer token de autenticación
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
    logger.auth('Token de autenticación establecido', { tokenLength: token.length });
  },

  // Limpiar token de autenticación
  clearAuthToken(): void {
    localStorage.removeItem('authToken');
    logger.auth('Token de autenticación eliminado');
  },

  // Construir URL completa
  buildUrl(endpoint: string): string {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  },

  // Verificar conexión con el servidor
  async checkConnection(): Promise<boolean> {
    try {
      logger.api('Verificando conexión con el servidor');
      await apiClient.get('/health');
      logger.api('Conexión con el servidor exitosa');
      return true;
    } catch (error) {
      logger.api('Error de conexión con el servidor', { error }, true);
      return false;
    }
  },

  // Obtener información del usuario actual
  async getCurrentUser() {
    try {
      logger.api('Obteniendo información del usuario actual');
      const user = await api.get('/auth/me');
      logger.api('Información del usuario obtenida exitosamente');
      return user;
    } catch (error) {
      logger.api('Error al obtener información del usuario', { error }, true);
      throw error;
    }
  }
};

// Configuración para diferentes entornos
export const configureApiForEnvironment = () => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  if (isDevelopment) {
    logger.api('Configurando API para entorno de desarrollo', {
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT
    });
    
    // En desarrollo, logs más verbosos
    apiClient.defaults.headers.common['X-Debug'] = 'true';
  }

  if (isProduction) {
    logger.api('Configurando API para entorno de producción', {
      baseURL: API_CONFIG.BASE_URL
    });
    
    // En producción, configuraciones de seguridad adicionales
    apiClient.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  }

  logger.api('Configuración de API completada', {
    environment: isDevelopment ? 'development' : 'production',
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT
  });
};

// Inicializar configuración
configureApiForEnvironment();

export default api; 