import { useState, useEffect, useCallback } from 'react';
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
  }, []);

  // Verificar estado de autenticación desde localStorage
  useEffect(() => {
    logger.authInfo('Verificando estado de autenticación desde localStorage');
    
    const checkAuthState = async () => {
      try {
        setIsAuthenticating(true);
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access_token');
        
        logger.authInfo('Estado de localStorage', {
          hasStoredUser: !!storedUser,
          hasAccessToken: !!accessToken,
          storedUserPreview: storedUser ? JSON.parse(storedUser).email : null
        });
        
        if (storedUser && accessToken) {
          const user = JSON.parse(storedUser);
          logger.authInfo('Usuario encontrado en localStorage', {
            userId: user.id,
            email: user.email,
            hasAccessToken: !!accessToken
          });
          
          // Verificar que el token sea válido haciendo una llamada al backend
          try {
            logger.authInfo('Verificando validez del token');
            const profileResponse = await api.get('/api/auth/profile');
            
            // Si la llamada es exitosa, el token es válido
            const currentUser = profileResponse.data || user;
            setUser({ uid: currentUser.id, email: currentUser.email, displayName: currentUser.displayName } as FirebaseUser);
            setBackendUser(currentUser);
            
            // Actualizar localStorage con datos actualizados
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            logger.authInfo('Usuario autenticado establecido desde localStorage', {
              userId: currentUser.id,
              email: currentUser.email,
              hasProfileData: !!profileResponse.data
            });
          } catch (tokenError) {
            logger.authError('Token inválido, limpiando autenticación', tokenError as Error);
            // Token inválido, limpiar todo
            clearAuth();
          }
        } else {
          logger.authInfo('No hay usuario autenticado en localStorage');
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
      }
    };

    checkAuthState();
  }, [clearAuth]);

  // Escuchar eventos de autenticación fallida
  useEffect(() => {
    const handleAuthFailed = () => {
      logger.authInfo('Evento de autenticación fallida recibido');
      clearAuth();
    };

    window.addEventListener('auth:authentication-failed', handleAuthFailed);
    
    return () => {
      window.removeEventListener('auth:authentication-failed', handleAuthFailed);
    };
  }, [clearAuth]);

  // Manejar bypass de desarrollo
  useEffect(() => {
    const handleDevBypass = async (event: CustomEvent) => {
      try {
        logger.authInfo('Ejecutando bypass de desarrollo');
        const mockFirebaseUser = event.detail.user;
        
        // Simular backend user desde localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const backendUser = JSON.parse(storedUser);
          setUser(mockFirebaseUser as FirebaseUser);
          setBackendUser(backendUser);
          setLoading(false);
          
          logger.authInfo('Bypass de desarrollo completado exitosamente', {
            mockUser: mockFirebaseUser,
            backendUser
          });
        }
      } catch (error) {
        logger.authError('Error en bypass de desarrollo', error as Error);
        setError('Error en bypass de desarrollo');
      }
    };

    // Escuchar evento de bypass de desarrollo
    window.addEventListener('firebase-auth-state-changed', handleDevBypass as unknown as EventListener);

    return () => {
      window.removeEventListener('firebase-auth-state-changed', handleDevBypass as unknown as EventListener);
    };
  }, []);

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
      clearAuth();
      
      logger.authInfo('Logout completado, localStorage limpiado');
      
    } catch (error) {
      logger.authError('Error en proceso de logout', error as Error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [user, backendUser, clearAuth]);

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

  // Calcular estado de autenticación
  const isAuthenticated = !!user && !!backendUser && !isAuthenticating;
  
  // Log del estado de autenticación
  useEffect(() => {
    logger.authInfo('Estado de autenticación calculado', {
      hasUser: !!user,
      hasBackendUser: !!backendUser,
      isAuthenticating,
      isAuthenticated,
      userEmail: user?.email || backendUser?.email
    });
  }, [user, backendUser, isAuthenticating, isAuthenticated]);

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