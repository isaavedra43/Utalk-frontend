import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  type User as FirebaseUser
} from 'firebase/auth';
// import { auth } from '../../../config/firebase';
import api from '../../../services/api';
import { logger } from '../../../utils/logger';

interface BackendUser {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const lastAuthStateRef = useRef<string>('');
  const clearAuthRef = useRef<(() => void) | null>(null);
  const userRef = useRef<FirebaseUser | null>(null);
  const backendUserRef = useRef<BackendUser | null>(null);
  const hasVerifiedAuthRef = useRef<boolean>(false);
  const isVerifyingAuthRef = useRef<boolean>(false);

  // Refresh token automático
  const refreshToken = useCallback(async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (!storedRefreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      logger.authInfo('Refrescando token de acceso');
      const response = await api.post('/api/auth/refresh', {
        refreshToken: storedRefreshToken
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Actualizar tokens en localStorage
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', newRefreshToken);
      
      logger.authInfo('Token refrescado exitosamente');
      return accessToken;
    } catch (error) {
      logger.authError('Error refrescando token', error as Error);
      // Si falla el refresh, limpiar todo y redirigir al login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setBackendUser(null);
      throw error;
    }
  }, []);

  // Función para limpiar autenticación
  const clearAuth = useCallback(() => {
    logger.authInfo('Limpiando estado de autenticación');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setBackendUser(null);
    setError(null);
  }, []); // Sin dependencias para evitar re-renders

  // Guardar referencias para evitar warnings de ESLint
  clearAuthRef.current = clearAuth;
  userRef.current = user;
  backendUserRef.current = backendUser;

  // Actualizar referencias cuando cambien los valores - OPTIMIZADO PARA ESLINT
  useEffect(() => {
    userRef.current = user;
    backendUserRef.current = backendUser;
  }, [user, backendUser]); // Mantener dependencias para ESLint

  // Verificar estado de autenticación desde localStorage - OPTIMIZADO PARA EVITAR MÚLTIPLES PETICIONES
  useEffect(() => {
    // Solo ejecutar si NO se ha verificado y NO hay usuario autenticado
    // EVITAR RE-EJECUCIÓN CUANDO YA HAY USUARIOS ESTABLECIDOS
    if (hasVerifiedAuthRef.current || (user && backendUser) || isVerifyingAuthRef.current) {
      return;
    }
    
    // Marcar como verificado inmediatamente para evitar re-ejecuciones
    hasVerifiedAuthRef.current = true;
    isVerifyingAuthRef.current = true;
    
    // Verificación con debounce para evitar múltiples peticiones
    const checkAuth = async () => {
      try {
        logger.authInfo('Verificando estado de autenticación desde localStorage');
        setIsAuthenticating(true);
        
        // Verificar si hay tokens válidos en localStorage
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userData = localStorage.getItem('user');
        
        if (accessToken && refreshToken && userData) {
          // HAY DATOS DE AUTENTICACIÓN - Verificar solo si no hay usuario ya establecido
          if (!user && !backendUser) {
            logger.authInfo('Tokens encontrados en localStorage, verificando validez');
            
            try {
              // Verificar token con backend - SOLO UNA VEZ
              const response = await api.get('/api/auth/profile');
              const user = response.data;
              
              setBackendUser(user);
              setUser({ uid: user.id, email: user.email, displayName: user.displayName } as FirebaseUser);
              
              logger.authInfo('Autenticación automática exitosa desde localStorage');
            } catch (error) {
              logger.authError('Error verificando token, limpiando datos inválidos', error as Error);
              // Solo limpiar si el token es realmente inválido (401)
              if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { status?: number } };
                if (apiError.response?.status === 401) {
                  clearAuthRef.current?.();
                }
              }
            }
          } else {
            // Ya hay usuario establecido, no hacer petición adicional
            logger.authInfo('Usuario ya autenticado, saltando verificación adicional');
          }
        } else {
          // NO HAY DATOS - Estado inicial
          logger.authInfo('No hay datos de autenticación en localStorage');
          setUser(null);
          setBackendUser(null);
        }
        
      } catch (error) {
        logger.authError('Error verificando estado de autenticación', error as Error);
        setUser(null);
        setBackendUser(null);
      } finally {
        setLoading(false);
        setIsAuthenticating(false);
        isVerifyingAuthRef.current = false; // Resetear flag de verificación
      }
    };

    // Ejecutar verificación con debounce para evitar múltiples peticiones simultáneas
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, backendUser]); // INCLUIR DEPENDENCIAS PARA ESLINT - Solo se ejecuta cuando cambian user o backendUser

  // Escuchar eventos de autenticación fallida
  useEffect(() => {
    const handleAuthFailed = () => {
      logger.authInfo('Evento de autenticación fallida recibido');
      clearAuthRef.current?.();
    };

    window.addEventListener('auth:authentication-failed', handleAuthFailed);
    
    return () => {
      window.removeEventListener('auth:authentication-failed', handleAuthFailed);
    };
  }, []); // Usar referencia para evitar warnings de ESLint



  // Login con email y password - Solo backend
  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      setIsAuthenticating(true);
      
      // Log del intento de login
      logger.logLoginAttempt(email, {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      logger.authInfo('Iniciando login con backend', { email });
      
      // Login directo con backend
      const response = await api.post('/api/auth/login', {
        email,
        password
      });
      
      logger.backendInfo('Login exitoso con backend', {
        status: response.status,
        hasAccessToken: !!response.data.accessToken,
        hasRefreshToken: !!response.data.refreshToken,
        hasUser: !!response.data.user
      });
      
      // Guardar tokens y datos del usuario
      const { accessToken, refreshToken, user } = response.data;
      
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Actualizar estado
      setBackendUser(user);
      setUser({ uid: user.id, email: user.email, displayName: user.displayName } as FirebaseUser);
      
      // Log del estado actualizado
      logger.authInfo('Estado de autenticación actualizado después del login', {
        hasUser: !!user,
        hasBackendUser: !!user,
        userEmail: user.email,
        userId: user.id
      });
      
      // Log de éxito completo
      logger.logLoginSuccess(
        user.email || 'unknown',
        { uid: user.id, email: user.email } as unknown as Record<string, unknown>,
        user as unknown as Record<string, unknown>,
        { 
          timestamp: new Date().toISOString(),
          sessionId: Date.now().toString()
        }
      );
      
      // Disparar evento de login exitoso para sincronizar WebSocket
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('auth:login-success', {
          detail: { user, accessToken }
        }));
      }, 100);
      
      return user;
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number; data?: { message?: string } } };
      let errorMessage = 'Error en el login';
      
      logger.backendError('Error en login con backend', error as Error, {
        email,
        status: apiError.response?.status,
        errorData: apiError.response?.data
      });
      
      // Manejar errores específicos del backend
      if (apiError.response?.status === 401) {
        errorMessage = 'Credenciales inválidas';
      } else if (apiError.response?.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (apiError.response?.status === 403) {
        errorMessage = 'Acceso denegado';
      } else if (apiError.response?.status && apiError.response.status >= 500) {
        errorMessage = 'Error del servidor. Intenta más tarde';
      } else {
        errorMessage = apiError.response?.data?.message || 'Error de conexión';
      }
      
      // Log del fallo de login
      logger.logLoginFailure(email, error as Error, {
        status: apiError.response?.status,
        finalErrorMessage: errorMessage
      });
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      setIsAuthenticating(false);
    }
  }, []);

  // Logout - Solo backend
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      logger.authInfo('Iniciando proceso de logout', {
        hasUser: !!user,
        hasBackendUser: !!backendUser
      });
      
      // Logout del backend
      try {
        logger.backendInfo('Ejecutando logout en backend');
        await api.post('/api/auth/logout');
        logger.backendInfo('Logout del backend exitoso');
      } catch (error) {
        logger.backendError('Error en logout del backend', error as Error, {
          operation: 'logout'
        });
      }
      
      // Limpiar estado local
      clearAuthRef.current?.();
      
      logger.authInfo('Logout completado, localStorage limpiado');
      
    } catch (error) {
      logger.authError('Error en proceso de logout', error as Error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [user, backendUser]); // clearAuth es estable (useCallback sin dependencias)

  // Cambiar contraseña - Solo backend
  const changePassword = useCallback(async (newPassword: string) => {
    try {
      if (!backendUser) throw new Error('Usuario no autenticado');
      
      logger.authInfo('Iniciando cambio de contraseña', {
        userEmail: backendUser.email,
        hasNewPassword: !!newPassword
      });
      
      // Cambiar contraseña en backend
      logger.backendInfo('Actualizando contraseña en backend');
      await api.post('/api/auth/change-password', { newPassword });
      
      logger.authInfo('Contraseña cambiada exitosamente');
      
    } catch (error) {
      logger.authError('Error cambiando contraseña', error as Error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    }
  }, [backendUser]);

  // Resetear contraseña - Solo backend
  const resetPassword = useCallback(async (email: string) => {
    try {
      logger.authInfo('Enviando email de reset de contraseña', { email });
      await api.post('/api/auth/reset-password', { email });
      logger.authInfo('Email de reset enviado exitosamente');
    } catch (error) {
      logger.backendError('Error enviando email de reset', error as Error, {
        email,
        operation: 'resetPassword'
      });
      setError(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    }
  }, []);

  // Obtener perfil del usuario
  const getProfile = useCallback(async () => {
    try {
      logger.backendInfo('Obteniendo perfil de usuario');
      const response = await api.get('/api/auth/profile');
      setBackendUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      logger.backendInfo('Perfil obtenido exitosamente', {
        userId: response.data.id,
        role: response.data.role
      });
      return response.data;
    } catch (error) {
      logger.backendError('Error obteniendo perfil', error as Error, {
        operation: 'getProfile'
      });
      setError(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    }
  }, []);

  // Actualizar perfil
  const updateProfile = useCallback(async (profileData: Partial<BackendUser>) => {
    try {
      logger.backendInfo('Actualizando perfil de usuario', { profileData });
      const response = await api.put('/api/auth/profile', profileData);
      setBackendUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      logger.backendInfo('Perfil actualizado exitosamente', {
        userId: response.data.id,
        updatedFields: Object.keys(profileData)
      });
      return response.data;
    } catch (error) {
      logger.backendError('Error actualizando perfil', error as Error, {
        operation: 'updateProfile',
        profileData
      });
      setError(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    }
  }, []);

  // Calcular estado de autenticación de forma estable con useMemo
  const isAuthenticated = useMemo(() => {
    const authenticated = !!user && !!backendUser && !isAuthenticating;
    return authenticated;
  }, [user, backendUser, isAuthenticating]);

  // Log del estado de autenticación solo cuando cambie realmente - OPTIMIZADO PARA REDUCIR RE-RENDERS Y ESLINT
  useEffect(() => {
    const currentState = {
      hasUser: !!user,
      hasBackendUser: !!backendUser,
      isAuthenticating,
      isAuthenticated,
      userEmail: user?.email || backendUser?.email
    };

    // Solo loggear si hay cambios significativos y no es un cambio temporal
    const stateKey = JSON.stringify(currentState);
    if (stateKey !== lastAuthStateRef.current) {
      lastAuthStateRef.current = stateKey;
      
      // Solo loggear cambios importantes, no cambios temporales durante la autenticación
      // EVITAR LOGGING DURANTE LA VERIFICACIÓN AUTOMÁTICA Y REDUCIR FRECUENCIA
      if (!isAuthenticating && (!!user && !!backendUser)) {
        // Debounce para evitar logs excesivos y ciclos
        const timeoutId = setTimeout(() => {
          logger.authInfo('Estado de autenticación calculado', currentState);
        }, 500);
        
        return () => clearTimeout(timeoutId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, backendUser, isAuthenticating]); // REMOVER isAuthenticated para evitar ciclos - ESLint ignorado intencionalmente

  return {
    user,
    backendUser,
    loading: loading || isAuthenticating,
    error,
    login,
    logout,
    changePassword,
    resetPassword,
    refreshToken,
    getProfile,
    updateProfile,
    clearAuth,
    isAuthenticated
  };
}; 