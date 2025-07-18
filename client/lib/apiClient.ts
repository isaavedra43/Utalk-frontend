import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';
import { logger } from './utils';
import { disconnectSocket } from './socket';

// Configuración base de Axios
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ------------------------------------------------------------------------------ */
/*  REQUEST INTERCEPTOR - AÑADIR TOKEN Y LOGS                                      */
/* ------------------------------------------------------------------------------ */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    const isProtectedRoute = config.url?.startsWith('/api/') || config.url?.includes('/auth/me');
    
    if (import.meta.env.DEV) {
      console.group('🔍 [API REQUEST]');
      console.log('URL:', config.url);
      console.log('Método:', config.method?.toUpperCase());
      console.log('Es ruta protegida?:', isProtectedRoute);
      console.log('Token disponible:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      if (import.meta.env.DEV) {
        console.log('✅ Token añadido al header Authorization');
      }
    } else if (isProtectedRoute) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ WARNING: Request protegida sin token!');
        console.warn('Esta request podría fallar con 401');
      }
      
      logger.api('⚠️ Request protegida enviada sin token de autorización', { 
        url: config.url,
        method: config.method
      }, true);
    }
    
    if (import.meta.env.DEV) {
      console.log('Headers finales:', config.headers);
      console.groupEnd();
    }

    logger.api('Request enviada', { 
      url: config.url, 
      method: config.method?.toUpperCase(),
      hasAuth: !!config.headers.Authorization,
      isProtected: isProtectedRoute
    });
    
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('❌ [API REQUEST ERROR]', error);
    }
    
    logger.api('Error en request interceptor', { error: error.message }, true);
    return Promise.reject(error);
  }
);

/* ------------------------------------------------------------------------------ */
/*  RESPONSE INTERCEPTOR - MANEJO DE ERRORES Y 401                                 */
/* ------------------------------------------------------------------------------ */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV) {
      console.log(`✅ [API RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`);
    }
    
    logger.api('Response exitosa', { 
      url: response.config.url, 
      status: response.status,
      method: response.config.method?.toUpperCase()
    });
    
    return response; // Mantener estructura completa para compatibilidad
  },
  (error: AxiosError) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url;
    const hadAuthHeader = !!originalRequest?.headers?.Authorization;
    
    if (import.meta.env.DEV) {
      console.group('❌ [API RESPONSE ERROR]');
      console.error('Error completo:', error);
      console.log('Status:', status);
      console.log('URL:', url);
      console.log('Tenía Authorization header?:', hadAuthHeader);
      console.log('Response data:', error.response?.data);
      console.groupEnd();
    }

    logger.api('Error en response', {
      url,
      status,
      method: originalRequest?.method?.toUpperCase(),
      hadAuthHeader,
      errorMessage: (error.response?.data as any)?.message || error.message
    }, true);

    // Manejo específico por status code
    switch (status) {
      case 401:
        // SOLO limpiar token si la request llevaba Authorization header
        if (hadAuthHeader) {
          if (import.meta.env.DEV) {
            console.group('🔥 [401 CON AUTH HEADER] - Token inválido/expirado');
            console.log('Limpiando sesión y desconectando socket');
            console.groupEnd();
          }
          
          logger.auth('Token inválido o expirado - Limpiando sesión', { 
            url,
            hadAuthHeader: true
          }, true);
          
          localStorage.removeItem('authToken');
          disconnectSocket();
          
          // Solo redirigir si no estamos ya en login
          if (!window.location.pathname.includes('/login')) {
            toast({
              variant: "destructive",
              title: "Sesión expirada",
              description: "Tu sesión ha expirado. Inicia sesión nuevamente.",
            });
            
            window.location.href = '/login';
          }
        } else {
          if (import.meta.env.DEV) {
            console.log('ℹ️ [401 SIN AUTH HEADER] - Request pública falló, conservando token');
          }
          
          logger.api('401 en request sin Authorization - conservando token', { url }, true);
        }
        break;

      case 403:
        toast({
          variant: "destructive",
          title: "Acceso denegado",
          description: "No tienes permisos para realizar esta acción.",
        });
        break;

      case 404:
        if (import.meta.env.DEV) {
          console.warn(`⚠️ [404] Endpoint no encontrado: ${url}`);
        }
        break;

      case 500:
        toast({
          variant: "destructive",
          title: "Error del servidor",
          description: "Ha ocurrido un error interno. Inténtalo más tarde.",
        });
        break;

      case 502:
      case 503:
      case 504:
        toast({
          variant: "destructive",
          title: "Servicio no disponible",
          description: "El servidor no está disponible temporalmente.",
        });
        break;

      default:
        if (status && status >= 400) {
          const errorMessage = (error.response?.data as any)?.message || 'Error en la solicitud';
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
          });
        }
        break;
    }

    return Promise.reject(error);
  }
);

/* ------------------------------------------------------------------------------ */
/*  HELPER FUNCTIONS                                                                */
/* ------------------------------------------------------------------------------ */

// Helper para setear token manualmente (usado en utilidades)
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
  logger.auth('Token establecido manualmente vía apiClient helper');
};

// Helper para limpiar token manualmente
export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
  disconnectSocket();
  logger.auth('Token limpiado manualmente vía apiClient helper');
};

// Export alias para compatibilidad
export const api = apiClient;
export default apiClient; 