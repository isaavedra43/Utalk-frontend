import { useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../../../config/firebase';
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

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);

  // Verificar estado de autenticación de Firebase
  useEffect(() => {
    logger.authInfo('Iniciando listener de estado de autenticación Firebase');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      logger.authInfo('Estado de autenticación Firebase cambiado', {
        isAuthenticated: !!firebaseUser,
        email: firebaseUser?.email,
        uid: firebaseUser?.uid
      });
      
      if (firebaseUser) {
        try {
          logger.firebaseInfo('Usuario autenticado en Firebase', {
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified
          });
          
          // Obtener token de Firebase
          logger.authInfo('Obteniendo token de Firebase');
          const firebaseToken = await firebaseUser.getIdToken();
          logger.firebaseInfo('Token de Firebase obtenido exitosamente', {
            tokenLength: firebaseToken.length,
            tokenPreview: firebaseToken.substring(0, 20) + '...'
          });
          
          // Verificar/crear usuario en backend
          logger.backendInfo('Iniciando verificación/creación de usuario en backend');
          const backendResponse = await verifyBackendUser(firebaseToken, firebaseUser);
          logger.backendInfo('Usuario verificado/creado exitosamente en backend', {
            backendUserId: backendResponse.user.id,
            role: backendResponse.user.role
          });
          
          setUser(firebaseUser);
          setBackendUser(backendResponse.user);
          
          // Guardar tokens
          localStorage.setItem('access_token', backendResponse.accessToken);
          localStorage.setItem('refresh_token', backendResponse.refreshToken);
          localStorage.setItem('user', JSON.stringify(backendResponse.user));
          
          logger.authInfo('Tokens guardados en localStorage', {
            hasAccessToken: !!backendResponse.accessToken,
            hasRefreshToken: !!backendResponse.refreshToken,
            hasUserData: !!backendResponse.user
          });
          
          // Log de éxito completo
          logger.logLoginSuccess(
            firebaseUser.email || 'unknown',
            firebaseUser as unknown as Record<string, unknown>,
            backendResponse.user as unknown as Record<string, unknown>,
            { 
              timestamp: new Date().toISOString(),
              sessionId: Date.now().toString()
            }
          );
          
        } catch (error) {
          logger.authError('Error en proceso de autenticación', error as Error, {
            firebaseUser: {
              email: firebaseUser.email,
              uid: firebaseUser.uid
            }
          });
          
          setError(error instanceof Error ? error.message : 'Error desconocido');
          
          // Si falla el backend, cerrar sesión de Firebase
          logger.authInfo('Cerrando sesión de Firebase debido a error en backend');
          await signOut(auth);
        }
      } else {
        // Usuario no autenticado
        logger.authInfo('Usuario no autenticado, limpiando estado');
        setUser(null);
        setBackendUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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

  // Verificar/crear usuario en backend
  const verifyBackendUser = async (firebaseToken: string, firebaseUser: FirebaseUser): Promise<{ user: BackendUser } & AuthTokens> => {
    try {
      logger.backendInfo('Intentando login con backend', {
        endpoint: '/api/auth/login',
        firebaseTokenLength: firebaseToken.length,
        userEmail: firebaseUser.email
      });
      
      // Intentar login con Firebase token
      const response = await api.post('/api/auth/login', {
        firebaseToken,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      });
      
      logger.backendInfo('Login exitoso con backend', {
        status: response.status,
        hasAccessToken: !!response.data.accessToken,
        hasRefreshToken: !!response.data.refreshToken,
        hasUser: !!response.data.user
      });
      
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number; data?: { message?: string } } };
      
      logger.backendError('Error en login con backend', error as Error, {
        status: apiError.response?.status,
        errorData: apiError.response?.data,
        firebaseUser: {
          email: firebaseUser.email,
          uid: firebaseUser.uid
        }
      });
      
      if (apiError.response?.status === 404) {
        logger.backendInfo('Usuario no existe, creando nuevo usuario', {
          endpoint: '/api/auth/create-user',
          userEmail: firebaseUser.email
        });
        
        // Usuario no existe, crear nuevo
        const createResponse = await api.post('/api/auth/create-user', {
          firebaseToken,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'agent' // Rol por defecto
        });
        
        logger.backendInfo('Usuario creado exitosamente', {
          status: createResponse.status,
          newUserId: createResponse.data.user?.id,
          role: createResponse.data.user?.role
        });
        
        return createResponse.data;
      }
      
      // Manejar otros errores específicos
      if (apiError.response?.status === 401) {
        logger.backendError('Token de Firebase inválido o expirado', error as Error, {
          status: 401,
          operation: 'login'
        });
        throw new Error('Token de Firebase inválido o expirado');
      }
      
      if (apiError.response?.status === 403) {
        logger.backendError('Acceso denegado. Usuario no autorizado', error as Error, {
          status: 403,
          operation: 'login'
        });
        throw new Error('Acceso denegado. Usuario no autorizado');
      }
      
      if (apiError.response?.status && apiError.response.status >= 500) {
        logger.backendError('Error del servidor backend', error as Error, {
          status: apiError.response.status,
          operation: 'login'
        });
        throw new Error('Error del servidor. Intenta más tarde');
      }
      
      // Error genérico
      const errorMessage = apiError.response?.data?.message || 'Error de conexión con el backend';
      logger.backendError('Error genérico en backend', error as Error, {
        status: apiError.response?.status,
        errorMessage
      });
      throw new Error(errorMessage);
    }
  };

  // Login con email y password
  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Log del intento de login
      logger.logLoginAttempt(email, {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      logger.authInfo('Iniciando login con Firebase', { email });
      
      // Login con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      logger.firebaseInfo('Login con Firebase exitoso', {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        emailVerified: userCredential.user.emailVerified
      });
      
      // Firebase automáticamente actualizará el estado
      // y el useEffect se encargará del resto
      
      return userCredential.user;
    } catch (error: unknown) {
      let errorMessage = 'Error en el login';
      
      const firebaseError = error as { code?: string; message?: string };
      
      logger.firebaseError('Error de Firebase en login', error as Error, {
        email,
        errorCode: firebaseError.code,
        errorMessage: firebaseError.message
      });
      
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuario no encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Intenta más tarde';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Usuario deshabilitado';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Login con email/password no está habilitado';
          break;
        default:
          errorMessage = firebaseError.message || 'Error desconocido';
      }
      
      // Log del fallo de login
      logger.logLoginFailure(email, error as Error, {
        errorCode: firebaseError.code,
        finalErrorMessage: errorMessage
      });
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
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
      
      // Logout de Firebase
      logger.firebaseInfo('Ejecutando logout de Firebase');
      await signOut(auth);
      logger.firebaseInfo('Logout de Firebase exitoso');
      
      // Limpiar localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      logger.authInfo('Logout completado, localStorage limpiado');
      
    } catch (error) {
      logger.authError('Error en proceso de logout', error as Error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [user, backendUser]);

  // Cambiar contraseña
  const changePassword = useCallback(async (newPassword: string) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');
      
      logger.authInfo('Iniciando cambio de contraseña', {
        userEmail: user.email,
        hasNewPassword: !!newPassword
      });
      
      await updatePassword(user, newPassword);
      
      // Actualizar en backend
      logger.backendInfo('Actualizando contraseña en backend');
      await api.put('/api/auth/change-password', { newPassword });
      
      logger.authInfo('Contraseña cambiada exitosamente');
      
    } catch (error) {
      logger.authError('Error cambiando contraseña', error as Error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    }
  }, [user]);

  // Resetear contraseña
  const resetPassword = useCallback(async (email: string) => {
    try {
      logger.authInfo('Enviando email de reset de contraseña', { email });
      await sendPasswordResetEmail(auth, email);
      logger.authInfo('Email de reset enviado exitosamente');
    } catch (error) {
      logger.firebaseError('Error enviando email de reset', error as Error, {
        email,
        operation: 'sendPasswordResetEmail'
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

  return {
    user,
    backendUser,
    loading,
    error,
    login,
    logout,
    changePassword,
    resetPassword,
    getProfile,
    updateProfile,
    isAuthenticated: !!user && !!backendUser
  };
}; 