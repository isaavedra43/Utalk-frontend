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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtener token de Firebase
          const firebaseToken = await firebaseUser.getIdToken();
          
          // Verificar/crear usuario en backend
          const backendResponse = await verifyBackendUser(firebaseToken, firebaseUser);
          
          setUser(firebaseUser);
          setBackendUser(backendResponse.user);
          
          // Guardar tokens
          localStorage.setItem('access_token', backendResponse.accessToken);
          localStorage.setItem('refresh_token', backendResponse.refreshToken);
          localStorage.setItem('user', JSON.stringify(backendResponse.user));
          
        } catch (error) {
          console.error('Error verificando usuario en backend:', error);
          setError(error instanceof Error ? error.message : 'Error desconocido');
          // Si falla el backend, cerrar sesión de Firebase
          await signOut(auth);
        }
      } else {
        // Usuario no autenticado
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
        const mockFirebaseUser = event.detail.user;
        
        // Simular backend user desde localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const backendUser = JSON.parse(storedUser);
          setUser(mockFirebaseUser as FirebaseUser);
          setBackendUser(backendUser);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error en bypass de desarrollo:', error);
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
      // Intentar login con Firebase token
      const response = await api.post('/api/auth/login', {
        firebaseToken,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      });
      
      return response.data;
    } catch (error: unknown) {
      if ((error as { response?: { status?: number } }).response?.status === 404) {
        // Usuario no existe, crear nuevo
        const createResponse = await api.post('/api/auth/create-user', {
          firebaseToken,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'agent' // Rol por defecto
        });
        
        return createResponse.data;
      }
      throw error;
    }
  };

  // Login con email y password
  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Login con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Firebase automáticamente actualizará el estado
      // y el useEffect se encargará del resto
      
      return userCredential.user;
    } catch (error: unknown) {
      let errorMessage = 'Error en el login';
      
      const firebaseError = error as { code?: string; message?: string };
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
        default:
          errorMessage = firebaseError.message || 'Error desconocido';
      }
      
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
      
      // Logout del backend
      try {
        await api.post('/api/auth/logout');
      } catch (error) {
        console.warn('Error en logout del backend:', error);
      }
      
      // Logout de Firebase
      await signOut(auth);
      
      // Limpiar localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
    } catch (error) {
      console.error('Error en logout:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar contraseña
  const changePassword = useCallback(async (newPassword: string) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');
      
      await updatePassword(user, newPassword);
      
      // Actualizar en backend
      await api.put('/api/auth/change-password', { newPassword });
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    }
  }, [user]);

  // Resetear contraseña
  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    }
  }, []);

  // Obtener perfil del usuario
  const getProfile = useCallback(async () => {
    try {
      const response = await api.get('/api/auth/profile');
      setBackendUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    }
  }, []);

  // Actualizar perfil
  const updateProfile = useCallback(async (profileData: Partial<BackendUser>) => {
    try {
      const response = await api.put('/api/auth/profile', profileData);
      setBackendUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
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