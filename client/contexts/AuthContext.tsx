import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import type { User, ApiResponse } from '@/types/api';

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

// Función helper para logs consistentes
const logAuth = (action: string, data?: any, isError = false) => {
  const timestamp = new Date().toISOString();
  const logLevel = isError ? 'ERROR' : 'INFO';
  const message = `[AUTH ${logLevel}] ${action}`;
  
  if (isError) {
    console.error(message, data);
  } else {
    console.log(message, data || '');
  }
  
  // Solo en desarrollo, mostrar logs más detallados
  if (import.meta.env.DEV) {
    console.log(`[AUTH DEBUG] ${timestamp} - ${action}`, data);
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    logAuth('Iniciando verificación de autenticación al cargar app');
    refreshAuth();
  }, []);

  const refreshAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      logAuth('Verificando token guardado...');
      
      // Verificar si hay token guardado
      const token = localStorage.getItem('authToken');
      if (!token) {
        logAuth('No se encontró token en localStorage');
        setLoading(false);
        return;
      }

      logAuth('Token encontrado, verificando validez con backend...', { tokenLength: token.length });

      // Verificar con el backend si el token es válido
      const response = await api.get<ApiResponse<User>>('/auth/me');
      
      if (response.success && response.data) {
        logAuth('Token válido - Usuario autenticado exitosamente', { 
          userId: response.data.id, 
          userEmail: response.data.email,
          userRole: response.data.role 
        });
        setUser(response.data);
      } else {
        logAuth('Respuesta del servidor indica token inválido', response, true);
        // Token inválido, limpiar
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (error: any) {
      // Error al verificar autenticación, limpiar estado
      logAuth('Error al verificar autenticación', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      }, true);
      
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setLoading(false);
      logAuth('Verificación de autenticación completada');
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      logAuth('Iniciando proceso de login', { email });
      
      // Validación básica antes de enviar
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      
      logAuth('Enviando credenciales al servidor...');
      
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
        email,
        password,
      });

      logAuth('Respuesta recibida del servidor', { 
        success: response.success,
        hasUser: !!response.data?.user,
        hasToken: !!response.data?.token
      });

      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        logAuth('Login exitoso - Guardando datos de sesión', {
          userId: userData.id,
          userEmail: userData.email,
          userRole: userData.role,
          tokenLength: token?.length
        });
        
        // Actualizar estado
        setUser(userData);
        
        // Guardar token de autenticación
        if (token) {
          localStorage.setItem('authToken', token);
          logAuth('Token guardado en localStorage exitosamente');
        } else {
          logAuth('ADVERTENCIA: No se recibió token del servidor', null, true);
        }

        // Mostrar mensaje de éxito
        toast({
          title: "¡Bienvenido!",
          description: `Hola ${userData.name}, sesión iniciada correctamente.`,
        });
        
        logAuth('Login completado exitosamente - Usuario redirigido');
      } else {
        const errorMsg = response.message || 'Error desconocido en el login';
        logAuth('Login fallido - Respuesta del servidor inválida', { 
          message: response.message,
          success: response.success 
        }, true);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      
      logAuth('Login fallido - Error capturado', {
        error: errorMessage,
        status: error.response?.status,
        statusText: error.response?.statusText,
        email
      }, true);
      
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
      logAuth('Iniciando proceso de logout');
      
      // Llamar al endpoint de logout si existe
      try {
        await api.post('/auth/logout');
        logAuth('Logout exitoso en el servidor');
      } catch (error) {
        logAuth('Error en logout del servidor (continuando con logout local)', error, true);
        // Si falla el logout en el servidor, continuar con el logout local
      }
    } catch (error) {
      logAuth('Error durante logout', error, true);
    } finally {
      // Limpiar estado local siempre
      logAuth('Limpiando estado local de autenticación');
      setUser(null);
      localStorage.removeItem('authToken');
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      
      logAuth('Logout completado - Usuario desconectado');
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

  // Log del estado actual de autenticación
  useEffect(() => {
    logAuth('Estado de autenticación actualizado', {
      isAuthenticated: !!user,
      loading,
      userId: user?.id,
      userEmail: user?.email
    });
  }, [user, loading]);

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