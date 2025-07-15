import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import type { User, LoginCredentials, ApiResponse } from '@/types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    refreshAuth();
  }, []);

  const refreshAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Verificar si hay token guardado
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
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
      console.error('Auth verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
        email,
        password,
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        
        // Guardar token de autenticación
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
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
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

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 