import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { User, LoginCredentials, ApiResponse } from "@/types/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = async ({ email, password }: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      const response = await api.post<ApiResponse<{ user: User; token?: string }>>('/auth/login', {
        email,
        password,
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        
        // Si el backend devuelve un token, guardarlo
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }

        toast({
          title: "Bienvenido",
          description: `Hola ${response.data.user.name}, sesión iniciada correctamente.`,
        });
      } else {
        throw new Error(response.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      toast({
        title: "Error de autenticación",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Llamar al endpoint de logout si existe
      await api.post('/auth/logout').catch(() => {
        // Si falla el logout en el servidor, continuar con el logout local
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar estado local
      setUser(null);
      localStorage.removeItem('authToken');
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Verificar si hay token guardado
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verificar con el backend si el token es válido
      const response = await api.get<ApiResponse<User>>('/auth/me');
      
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // Token inválido, limpiar
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (error) {
      // Error al verificar autenticación, limpiar estado
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
} 