import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/utils';
import { disconnectSocket } from '@/lib/socket';
import type { User } from '@/types/api';

/* ------------------------------------------------------------------------------ */
/*  TYPES & CONTEXT                                                                */
/* ------------------------------------------------------------------------------ */
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ------------------------------------------------------------------------------ */
/*  PROVIDER COMPONENT                                                              */
/* ------------------------------------------------------------------------------ */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!user && !!token;

  // Helper: Clear token and session
  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    disconnectSocket();
  };

  /* ------------------------------------------------------------------------------ */
  /*  LOGIN FUNCTION - EXTRACCIÓN ROBUSTA DEL TOKEN                                  */
  /* ------------------------------------------------------------------------------ */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      if (import.meta.env.DEV) {
        console.group('🔐 [AUTH] LOGIN INICIADO');
        console.log('Email:', email);
        console.log('Backend URL:', import.meta.env.VITE_API_URL);
      }

      // HACER REQUEST AL BACKEND
      const response = await api.post<{ user: User; token: string; expiresIn?: string }>('/auth/login', {
        email,
        password,
      });

      if (import.meta.env.DEV) {
        console.log('✅ Respuesta HTTP recibida del backend');
        console.log('Response completa:', response);
        console.log('Tipo de response:', typeof response);
      }

      // EXTRACCIÓN ROBUSTA: Priorizar response.data (Axios wrapping), fallback a response directo
      let userData: User | undefined;
      let authToken: string | undefined;

      // Opción 1: Estructura Axios estándar { data: { user, token } }
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        const responseData = response.data as any;
        
        if (import.meta.env.DEV) {
          console.log('🔍 Buscando en response.data:', responseData);
          console.log('Tiene user?:', 'user' in responseData);
          console.log('Tiene token?:', 'token' in responseData);
        }

        if (responseData.user && responseData.token) {
          userData = responseData.user;
          authToken = responseData.token;
          
          if (import.meta.env.DEV) {
            console.log('✅ Estructura detectada: response.data.{user,token}');
          }
        }
      }

      // Opción 2: Respuesta directa { user, token }
      if (!userData || !authToken) {
        const directResponse = response as any;
        
        if (import.meta.env.DEV) {
          console.log('🔍 Buscando en response directo:', directResponse);
          console.log('Tiene user?:', 'user' in directResponse);
          console.log('Tiene token?:', 'token' in directResponse);
        }

        if (directResponse.user && directResponse.token) {
          userData = directResponse.user;
          authToken = directResponse.token;
          
          if (import.meta.env.DEV) {
            console.log('✅ Estructura detectada: response.{user,token}');
          }
        }
      }

      // VALIDACIÓN ESTRICTA: Abortar si falta token o user
      if (!authToken || typeof authToken !== 'string' || authToken.length < 10) {
        if (import.meta.env.DEV) {
          console.error('❌ TOKEN INVÁLIDO O FALTANTE');
          console.log('authToken encontrado:', authToken);
          console.log('Tipo:', typeof authToken);
          console.log('Longitud:', authToken?.length || 0);
          console.groupEnd();
        }
        
        throw new Error('Token de autenticación no recibido del servidor. Revisa la respuesta del backend.');
      }

      if (!userData || typeof userData !== 'object' || !userData.id || !userData.email) {
        if (import.meta.env.DEV) {
          console.error('❌ USUARIO INVÁLIDO O FALTANTE');
          console.log('userData encontrado:', userData);
          console.log('Tipo:', typeof userData);
          console.groupEnd();
        }
        
        throw new Error('Datos de usuario no válidos recibidos del servidor.');
      }

      if (import.meta.env.DEV) {
        console.log('✅ VALIDACIÓN EXITOSA');
        console.log('Token (primeros 20 chars):', authToken.substring(0, 20) + '...');
        console.log('Usuario:', { id: userData.id, email: userData.email, role: userData.role });
        console.groupEnd();
      }

      // GUARDAR EN CONTEXTO Y LOCALSTORAGE
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('authToken', authToken);

      logger.auth('✅ Login exitoso - Token y usuario guardados', { 
        userId: userData.id, 
        email: userData.email,
        tokenLength: authToken.length
      });

      // REDIRECCIÓN
      toast({
        title: "¡Bienvenido!",
        description: `Hola ${userData.name || userData.email}, sesión iniciada correctamente.`,
      });

      navigate('/');

    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.group('❌ [AUTH] LOGIN ERROR');
        console.error('Error completo:', error);
        console.log('Error message:', error.message);
        console.log('Error response:', error.response);
        console.groupEnd();
      }

      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      
      logger.auth('❌ Error en login', {
        error: errorMessage,
        status: error.response?.status,
        url: error.config?.url
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

  /* ------------------------------------------------------------------------------ */
  /*  REFRESH AUTH - HIDRATACIÓN TRAS RELOAD                                         */
  /* ------------------------------------------------------------------------------ */
  const refreshAuth = async (): Promise<void> => {
    try {
      setLoading(true);

      const savedToken = localStorage.getItem('authToken');
      
      if (import.meta.env.DEV) {
        console.group('🔄 [AUTH] REFRESH AUTH');
        console.log('Token en localStorage:', savedToken ? `${savedToken.substring(0, 20)}...` : 'NO HAY TOKEN');
        console.log('URL actual:', window.location.href);
      }

      if (!savedToken) {
        if (import.meta.env.DEV) {
          console.log('❌ No hay token guardado - sesión limpia');
          console.groupEnd();
        }
        
        logger.auth('No se encontró token en localStorage - usuario no autenticado');
        setLoading(false);
        return;
      }

      // Verificar token con backend
      const response = await api.get<User>('/auth/me');
      
      if (import.meta.env.DEV) {
        console.log('✅ Respuesta de /auth/me:', response);
      }

      const userData = response;
      
      if (!userData || !userData.id) {
        throw new Error('Respuesta de /auth/me inválida');
      }

      setToken(savedToken);
      setUser(userData);

      if (import.meta.env.DEV) {
        console.log('✅ Auth refreshed - Usuario:', { id: userData.id, email: userData.email });
        console.groupEnd();
      }

      logger.auth('✅ Autenticación restaurada exitosamente', { userId: userData.id });

    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.group('❌ [AUTH] REFRESH ERROR');
        console.error('Error:', error);
        console.log('Status:', error.response?.status);
        console.groupEnd();
      }

      // SOLO limpiar sesión si es 401 (token inválido/expirado)
      if (error.response?.status === 401) {
        logger.auth('❌ Token inválido o expirado durante refresh - limpiando sesión', {
          status: 401,
          url: error.config?.url
        }, true);
        
        clearSession();
        
        toast({
          variant: "destructive",
          title: "Sesión expirada",
          description: "Tu sesión ha expirado. Inicia sesión nuevamente.",
        });
      } else {
        // Error de red/servidor - NO limpiar token
        logger.auth('❌ Error de red en refresh - conservando token', {
          error: error.message,
          status: error.response?.status
        }, true);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------------------ */
  /*  LOGOUT FUNCTION                                                                 */
  /* ------------------------------------------------------------------------------ */
  const logout = () => {
    if (import.meta.env.DEV) {
      console.log('🚪 [AUTH] LOGOUT - Limpiando sesión');
    }

    logger.auth('🚪 Logout iniciado por usuario');
    
    clearSession();
    
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
    
    navigate('/login');
  };

  /* ------------------------------------------------------------------------------ */
  /*  EFFECT: HYDRATE AUTH ON MOUNT                                                  */
  /* ------------------------------------------------------------------------------ */
  useEffect(() => {
    refreshAuth();
  }, []);

  /* ------------------------------------------------------------------------------ */
  /*  EFFECT: WATCH LOCALSTORAGE CHANGES                                             */
  /* ------------------------------------------------------------------------------ */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && e.newValue === null) {
        if (import.meta.env.DEV) {
          console.log('🔍 [AUTH] Token eliminado manualmente de localStorage');
        }
        
        logger.auth('Token eliminado manualmente de localStorage - limpiando sesión');
        clearSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /* ------------------------------------------------------------------------------ */
  /*  CONTEXT VALUE                                                                   */
  /* ------------------------------------------------------------------------------ */
  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ------------------------------------------------------------------------------ */
/*  HOOK                                                                            */
/* ------------------------------------------------------------------------------ */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

// Export por defecto
export default AuthProvider; 