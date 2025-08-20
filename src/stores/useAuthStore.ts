import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../services/api';
import { logger } from '../utils/logger';
import { performanceMonitor } from '../utils/performanceMonitor';

interface BackendUser {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: { uid: string; email: string; displayName?: string } | null;
  backendUser: BackendUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
}

interface AuthStore extends AuthState {
  // Acciones básicas
  setUser: (user: { uid: string; email: string; displayName?: string } | null) => void;
  setBackendUser: (user: BackendUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsAuthenticating: (isAuthenticating: boolean) => void;
  clearError: () => void;
  
  // Acciones de autenticación
  login: (email: string, password: string) => Promise<BackendUser>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  updateProfile: (data: { displayName?: string; email?: string }) => Promise<BackendUser>;
  validateToken: (accessToken: string) => Promise<BackendUser | null>;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      user: null,
      backendUser: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      isAuthenticating: false,

      // Acciones básicas
      setUser: (user) => set({ user }),
      setBackendUser: (backendUser) => set({ backendUser }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setIsAuthenticating: (isAuthenticating) => set({ isAuthenticating }),
      clearError: () => set({ error: null }),

      // Validar token con el backend
      validateToken: async (accessToken: string): Promise<BackendUser | null> => {
        try {
          logger.authInfo('Validando token con backend...');
          
          const response = await api.get('/api/auth/profile', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          logger.authInfo('Token válido, usuario autenticado');
          return response.data;
        } catch (error) {
          logger.authError('Token inválido o expirado', error as Error);
          return null;
        }
      },

      // Login
      login: async (email: string, password: string) => {
        try {
          set({ error: null, loading: true, isAuthenticating: true });
          
          logger.authInfo('Iniciando login con backend', { email });
          
          const response = await api.post('/api/auth/login', {
            email,
            password
          });
          
          const { accessToken, refreshToken, user: userData } = response.data;
          
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('user', JSON.stringify(userData));
          
          set({
            backendUser: userData,
            user: { uid: userData.id, email: userData.email, displayName: userData.displayName },
            loading: false,
            isAuthenticating: false,
            isAuthenticated: true
          });
          
          // Disparar evento de login exitoso
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('auth:login-success', {
              detail: { user: userData, accessToken }
            }));
            // Log de performance
            performanceMonitor.logLoginSuccess();
          }, 100);
          
          return userData;
        } catch (error: unknown) {
          const apiError = error as { response?: { data?: { message?: string } } };
          const errorMessage = apiError?.response?.data?.message || 'Error en el login';
          set({ error: errorMessage, loading: false, isAuthenticating: false });
          throw new Error(errorMessage);
        }
      },

      // Limpiar autenticación
      clearAuth: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        set({
          user: null,
          backendUser: null,
          error: null,
          loading: false,
          isAuthenticating: false,
          isAuthenticated: false
        });
      },

      // Actualizar perfil
      updateProfile: async (data: { displayName?: string; email?: string }) => {
        try {
          set({ loading: true, error: null });

          const response = await api.put('/api/auth/profile', data);
          
          // Actualizar el usuario en el estado
          const currentState = get();
          if (currentState.backendUser) {
            const updatedUser = { ...currentState.backendUser, ...response.data };
            set({ backendUser: updatedUser });
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }

          set({ loading: false });
          return response.data;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error al actualizar perfil';
          set({ error: errorMessage, loading: false });
          throw err;
        }
      },

      // Logout
      logout: async () => {
        try {
          set({ loading: true });
          await api.post('/api/auth/logout');
        } catch (error) {
          console.error('Error en logout:', error);
        } finally {
          get().clearAuth();
        }
      },
    }),
    { name: 'auth-store' }
  )
); 