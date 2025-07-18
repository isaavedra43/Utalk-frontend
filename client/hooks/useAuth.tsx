import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import apiClient, { tokenUtils, setLogoutFunction } from "@/lib/apiClient";
import type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  AuthMeResponse,
  LogoutResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "@shared/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkSession: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Función de logout que será usada por el interceptor de Axios
  const logout = useCallback(() => {
    console.log('Ejecutando logout...');
    
    // Llamar al endpoint de logout si hay token
    if (tokenUtils.hasToken()) {
      apiClient.post<LogoutResponse>('/auth/logout')
        .catch((error) => {
          console.warn('Error al hacer logout en backend:', error);
        });
    }
    
    // Limpiar estado local
    tokenUtils.removeToken();
    setUser(null);
    setError(null);
    
    // Redirigir a login - usar window.location para evitar dependencia de router
    window.location.href = '/login';
  }, []);

  // Configurar la función de logout en el cliente API
  useEffect(() => {
    setLogoutFunction(logout);
  }, [logout]);

  // Función para verificar sesión actual
  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = tokenUtils.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verificar token con el backend
      const response = await apiClient.get<AuthMeResponse>('/auth/me');
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        console.log('Sesión válida:', response.data.user);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.warn('Sesión inválida o expirada:', error);
      
      // Si el token es inválido, limpiar y no mostrar error (el interceptor manejará)
      if (error.response?.status === 401 || error.response?.status === 403) {
        tokenUtils.removeToken();
        setUser(null);
      } else {
        // Otros errores sí mostrar
        setError(error.response?.data?.message || 'Error al verificar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función de login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validaciones básicas
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Formato de email inválido');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Realizar login
      const loginData: LoginRequest = { email, password };
      const response = await apiClient.post<LoginResponse>('/auth/login', loginData);

      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Guardar token y usuario
      tokenUtils.setToken(response.data.token);
      setUser(response.data.user);
      
      console.log('Login exitoso:', response.data.user);
      console.log('Token expira en:', response.data.expiresIn);
      
      // Redirigir al dashboard - usar window.location para evitar dependencia de router
      window.location.href = '/';
      
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Limpiar token en caso de error
      tokenUtils.removeToken();
      setUser(null);
      
      // Extraer mensaje de error
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para actualizar perfil
  const updateProfile = useCallback(async (name: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!name || name.trim().length === 0) {
        throw new Error('El nombre es requerido');
      }

      const profileData: UpdateProfileRequest = { name: name.trim() };
      const response = await apiClient.put<UpdateProfileResponse>('/auth/profile', profileData);

      if (response.data && response.data.user) {
        setUser(response.data.user);
        console.log('Perfil actualizado:', response.data.user);
      }
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar perfil';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Verificar sesión al cargar la app
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkSession,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
