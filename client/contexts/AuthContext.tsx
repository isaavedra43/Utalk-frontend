import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/utils';
import type { User, ApiResponse } from '@/types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    logger.auth('Iniciando verificación de autenticación al cargar app');
    refreshAuth();
  }, []);

  const refreshAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      logger.auth('Verificando token guardado...');
      
      // Verificar si hay token guardado
      const savedToken = localStorage.getItem('authToken');
      if (!savedToken) {
        logger.auth('No se encontró token en localStorage');
        setLoading(false);
        return;
      }

      logger.auth('Token encontrado, verificando validez con backend...', { tokenLength: savedToken.length });

      // Verificar con el backend si el token es válido
      const response = await api.get<User>('/auth/me');
      
      if (response) {
        logger.auth('Token válido - Usuario autenticado exitosamente', { 
          userId: response.id, 
          userEmail: response.email,
          userRole: response.role 
        });
        setUser(response);
        setToken(savedToken);
      } else {
        logger.auth('Respuesta del servidor indica token inválido', response, true);
        // Token inválido, limpiar
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
      }
    } catch (error: any) {
      // Error al verificar autenticación, limpiar estado
      logger.auth('Error al verificar autenticación', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      }, true);
      
      localStorage.removeItem('authToken');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
      logger.auth('Verificación de autenticación completada');
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      logger.auth('Iniciando proceso de login', { email });
      
      // Validación básica antes de enviar
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      
      logger.auth('Enviando credenciales al servidor...');
      
      const response = await api.post<{ user: User; token: string }>('/auth/login', {
        email,
        password,
      });

      logger.auth('Respuesta recibida del servidor', { 
        hasUser: !!response?.user,
        hasToken: !!response?.token
      });

      // Manejar respuesta del backend (tanto con wrapper ApiResponse como sin él)
      const userData = response.user || response.data?.user;
      const authToken = response.token || response.data?.token;

      if (userData && authToken) {
        logger.auth('Login exitoso - Guardando datos de sesión', {
          userId: userData.id,
          userEmail: userData.email,
          userRole: userData.role,
          tokenLength: authToken.length
        });
        
        // Actualizar estado INMEDIATAMENTE
        setUser(userData);
        setToken(authToken);
        
        // Guardar token de autenticación
        localStorage.setItem('authToken', authToken);
        logger.auth('Token guardado en localStorage exitosamente');

        // Mostrar mensaje de éxito
        toast({
          title: "¡Bienvenido!",
          description: `Hola ${userData.name}, sesión iniciada correctamente.`,
        });
        
        logger.auth('Login completado exitosamente - Estado actualizado');
      } else {
        const errorMsg = 'Respuesta del servidor inválida - faltan datos de usuario o token';
        logger.auth('Login fallido - Respuesta del servidor inválida', { 
          response: response
        }, true);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      
      logger.auth('Login fallido - Error capturado', {
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
      logger.auth('Iniciando proceso de logout');
      
      // Llamar al endpoint de logout si existe
      try {
        await api.post('/auth/logout');
        logger.auth('Logout exitoso en el servidor');
      } catch (error) {
        logger.auth('Error en logout del servidor (continuando con logout local)', error, true);
        // Si falla el logout en el servidor, continuar con el logout local
      }
    } catch (error) {
      logger.auth('Error durante logout', error, true);
    } finally {
      // Limpiar estado local siempre
      logger.auth('Limpiando estado local de autenticación');
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      
      logger.auth('Logout completado - Usuario desconectado');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    refreshAuth,
    token,
  };

  // Log del estado actual de autenticación
  useEffect(() => {
    logger.auth('Estado de autenticación actualizado', {
      isAuthenticated: !!user && !!token,
      loading,
      userId: user?.id,
      userEmail: user?.email,
      hasToken: !!token
    });
  }, [user, loading, token]);

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