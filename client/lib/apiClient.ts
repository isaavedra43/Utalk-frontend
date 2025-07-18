import axios, { AxiosError, AxiosResponse } from 'axios';

// Clave única para el JWT en localStorage
const JWT_STORAGE_KEY = 'jwt_token_utalk';

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable para almacenar la función de logout (se inyectará desde useAuth)
let logoutFunction: (() => void) | null = null;

// Función para establecer la función de logout desde useAuth
export const setLogoutFunction = (logout: () => void) => {
  logoutFunction = logout;
};

// Interceptor de request - Agregar JWT automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(JWT_STORAGE_KEY);
    if (token && config.url?.startsWith('/api/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response - Manejar errores de autenticación
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Si es error 401 o 403, ejecutar logout automático
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Token JWT inválido o expirado, cerrando sesión...');
      
      // Remover token inválido
      localStorage.removeItem(JWT_STORAGE_KEY);
      
      // Ejecutar logout si está disponible
      if (logoutFunction) {
        logoutFunction();
      } else {
        // Fallback: redirigir a login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Funciones de utilidad para el token
export const tokenUtils = {
  // Obtener token del localStorage
  getToken: (): string | null => {
    return localStorage.getItem(JWT_STORAGE_KEY);
  },
  
  // Guardar token en localStorage
  setToken: (token: string): void => {
    localStorage.setItem(JWT_STORAGE_KEY, token);
  },
  
  // Remover token del localStorage
  removeToken: (): void => {
    localStorage.removeItem(JWT_STORAGE_KEY);
  },
  
  // Verificar si existe token
  hasToken: (): boolean => {
    return !!localStorage.getItem(JWT_STORAGE_KEY);
  }
};

export default apiClient; 