import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from '@/hooks/use-toast';

// Crear instancia de axios configurada
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Para enviar cookies de autenticación
  timeout: 10000, // 10 segundos timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
apiClient.interceptors.request.use(
  (config) => {
    // Agregar cualquier configuración adicional aquí
    // Por ejemplo, agregar token de autorización si está disponible
    const token = localStorage.getItem('authToken'); // Solo si es necesario
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Manejo global de errores
    if (error.response?.status === 401) {
      // Token expirado o no autorizado
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      toast({
        title: 'Sesión expirada',
        description: 'Por favor, inicia sesión nuevamente',
        variant: 'destructive',
      });
    } else if (error.response?.status === 403) {
      toast({
        title: 'Acceso denegado',
        description: 'No tienes permisos para realizar esta acción',
        variant: 'destructive',
      });
    } else if (error.response?.status >= 500) {
      toast({
        title: 'Error del servidor',
        description: 'Ocurrió un error interno. Inténtalo más tarde.',
        variant: 'destructive',
      });
    } else if (error.code === 'ECONNABORTED') {
      toast({
        title: 'Tiempo agotado',
        description: 'La solicitud tardó demasiado. Verifica tu conexión.',
        variant: 'destructive',
      });
    } else if (!error.response) {
      toast({
        title: 'Error de red',
        description: 'No se pudo conectar con el servidor.',
        variant: 'destructive',
      });
    }
    
    return Promise.reject(error);
  }
);

// Utilidades para hacer llamadas API más fáciles
export const api = {
  // GET request
  get: <T>(url: string, params?: any) => 
    apiClient.get<T>(url, { params }).then(res => res.data),
  
  // POST request
  post: <T>(url: string, data?: any) => 
    apiClient.post<T>(url, data).then(res => res.data),
  
  // PUT request
  put: <T>(url: string, data?: any) => 
    apiClient.put<T>(url, data).then(res => res.data),
  
  // DELETE request
  delete: <T>(url: string) => 
    apiClient.delete<T>(url).then(res => res.data),
  
  // PATCH request
  patch: <T>(url: string, data?: any) => 
    apiClient.patch<T>(url, data).then(res => res.data),
};

export default apiClient; 