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
      logger.auth('Iniciando verificación de autenticación al cargar app');
      
      // Verificar si hay token guardado
      const savedToken = localStorage.getItem('authToken');
      if (!savedToken) {
        logger.auth('No se encontró token en localStorage');
        setLoading(false);
        return;
      }

      logger.auth('Token encontrado, verificando validez con backend...', { 
        tokenLength: savedToken.length,
        tokenPreview: savedToken.substring(0, 20) + '...',
        currentUrl: window.location.href
      });

      // Verificar con el backend si el token es válido
      const response = await api.get<User>('/auth/me');
      
      // 🚨 LOGS EXHAUSTIVOS PARA DEBUG - refreshAuth
      console.group('🔍 [REFRESH AUTH DEBUG] Respuesta del endpoint /auth/me:');
      console.log('RESPUESTA COMPLETA:', response);
      console.log('TIPO de respuesta:', typeof response);
      console.log('Es un objeto?:', typeof response === 'object');
      console.log('Tiene propiedad id?:', response && typeof response === 'object' && 'id' in response);
      console.log('Tiene propiedad email?:', response && typeof response === 'object' && 'email' in response);
      console.log('Todas las propiedades:', response ? Object.keys(response) : 'N/A');
      console.log('Token usado en request:', savedToken.substring(0, 20));
      console.log('URL del backend:', import.meta.env.VITE_API_URL);
      console.groupEnd();
      
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
        statusText: error.response?.statusText,
        fullError: error,
        backendUrl: import.meta.env.VITE_API_URL,
        tokenExists: !!localStorage.getItem('authToken')
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

      // 🚨 LOGS EXHAUSTIVOS PARA DEBUG - VER RESPUESTA REAL
      console.group('🔍 [LOGIN DEBUG] Respuesta REAL del backend:');
      console.log('RESPUESTA COMPLETA:', response);
      console.log('TIPO de respuesta:', typeof response);
      console.log('Es un objeto?:', typeof response === 'object');
      console.log('Tiene propiedad user?:', typeof response === 'object' && 'user' in response);
      console.log('Tiene propiedad token?:', typeof response === 'object' && 'token' in response);
      console.log('Valor de response.user:', response.user);
      console.log('Valor de response.token:', response.token);
      console.log('Todas las propiedades:', Object.keys(response));
      console.groupEnd();

      logger.auth('🔍 RESPUESTA REAL LOGIN - ANÁLISIS COMPLETO', { 
        response: response,
        responseType: typeof response,
        responseKeys: Object.keys(response || {}),
        hasUser: typeof response === 'object' && 'user' in response,
        hasToken: typeof response === 'object' && 'token' in response,
        userValue: response?.user,
        tokenValue: response?.token
      });

      // Intentar múltiples estructuras de respuesta para compatibilidad
      let userData: User | undefined;
      let authToken: string | undefined;

      // Opción 1: Respuesta directa { user: {...}, token: "..." }
      if (response && typeof response === 'object' && 'user' in response && 'token' in response) {
        userData = response.user;
        authToken = response.token;
        logger.auth('✅ Estructura detectada: Respuesta directa { user, token }');
      }
      // Opción 2: Respuesta envuelta { data: { user: {...}, token: "..." } }
      else if (response && typeof response === 'object' && 'data' in response) {
        const data = (response as any).data;
        if (data && typeof data === 'object' && 'user' in data && 'token' in data) {
          userData = data.user;
          authToken = data.token;
          logger.auth('✅ Estructura detectada: Respuesta envuelta { data: { user, token } }');
        }
      }
             // Opción 3: El backend devuelve el usuario y token de forma no estándar
       else if (response && typeof response === 'object') {
         // Buscar token en diferentes propiedades posibles
         const possibleToken = (response as any).token || (response as any).accessToken || (response as any).authToken;
         // Buscar datos de usuario en diferentes propiedades posibles
         const possibleUser = (response as any).user || (response as any).data || response;
         
         if (possibleUser && possibleToken) {
           userData = possibleUser;
           authToken = possibleToken;
           logger.auth('✅ Estructura detectada: Formato no estándar');
         }
       }

      console.group('🔍 [LOGIN DEBUG] Datos extraídos:');
      console.log('userData extraído:', userData);
      console.log('authToken extraído:', authToken);
      console.log('userData válido?:', !!userData);
      console.log('authToken válido?:', !!authToken);
      console.groupEnd();

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
          description: `Hola ${userData.name || userData.email}, sesión iniciada correctamente.`,
        });
        
        logger.auth('Login completado exitosamente - Estado actualizado');
      } else {
        const errorMsg = 'Respuesta del servidor inválida - faltan datos de usuario o token';
        logger.auth('Login fallido - Respuesta del servidor inválida', { 
          response: response,
          extractedUserData: userData,
          extractedAuthToken: authToken,
          responseStructure: {
            hasUser: !!userData,
            hasToken: !!authToken,
            userType: typeof userData,
            tokenType: typeof authToken
          }
        }, true);

        // Agregar toast con información detallada para debugging
        toast({
          variant: "destructive",
          title: "Error de inicio de sesión",
          description: import.meta.env.DEV 
            ? `${errorMsg}. Revisa la consola para detalles de la respuesta.` 
            : errorMsg,
        });

        throw new Error(errorMsg);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      
      logger.auth('Login fallido - Error capturado', {
        error: errorMessage,
        status: error.response?.status,
        statusText: error.response?.statusText,
        email,
        fullError: error
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