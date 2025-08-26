import { create } from 'zustand';
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import api from '../services/api';
import { logger } from '../utils/logger';
import { performanceMonitor } from '../utils/performanceMonitor';
import { infoLog } from '../config/logger';

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
    subscribeWithSelector(
      persist(
        (set, get) => ({
          // Estado inicial
          user: null,
          backendUser: null,
          loading: true,
          error: null,
          isAuthenticated: false,
          isAuthenticating: false,

          // Acciones básicas optimizadas para evitar re-renders
          setUser: (user) => {
            const currentState = get();
            // Solo actualizar si el usuario realmente cambió
            if (shallow(currentState.user, user)) return;
            set({ user });
          },
          
          setBackendUser: (backendUser) => {
            const currentState = get();
            // Solo actualizar si el backendUser realmente cambió
            if (shallow(currentState.backendUser, backendUser)) return;
            set({ backendUser });
          },
          
          setLoading: (loading) => {
            const currentState = get();
            // Solo actualizar si loading realmente cambió
            if (currentState.loading === loading) return;
            set({ loading });
          },
          
          setError: (error) => {
            const currentState = get();
            // Solo actualizar si error realmente cambió
            if (currentState.error === error) return;
            set({ error });
          },
          
          setIsAuthenticating: (isAuthenticating) => {
            const currentState = get();
            // Solo actualizar si isAuthenticating realmente cambió
            if (currentState.isAuthenticating === isAuthenticating) return;
            set({ isAuthenticating });
          },
          
          clearError: () => {
            const currentState = get();
            // Solo actualizar si hay un error que limpiar
            if (!currentState.error) return;
            set({ error: null });
          },

          // Validar token con el backend
          validateToken: async (accessToken: string): Promise<BackendUser | null> => {
            try {
              logger.authInfo('Validando token con backend...');
              
              // Verificar que el token no sea undefined, null o muy corto
              if (!accessToken || accessToken === 'undefined' || accessToken === 'null' || accessToken.length < 10) {
                logger.authError('Token inválido o muy corto', new Error('Token inválido'));
                return null;
              }
              
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

          // Login optimizado
          login: async (email: string, password: string) => {
            try {
              set({ error: null, loading: true, isAuthenticating: true });
              
              logger.authInfo('Iniciando login con backend', { email });
              
              const response = await api.post('/api/auth/login', {
                email,
                password
              });
              
              logger.authInfo('Respuesta del backend recibida', { 
                status: response.status,
                hasData: !!response.data,
                dataKeys: Object.keys(response.data || {}),
                fullResponse: response.data
              });
              
              // El backend envía los datos dentro de response.data.data
              const { accessToken, refreshToken, user: userData } = response.data.data || response.data;
              
              logger.authInfo('Tokens extraídos', { 
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken,
                hasUserData: !!userData,
                accessTokenLength: accessToken?.length,
                refreshTokenLength: refreshToken?.length
              });
              
              localStorage.setItem('access_token', accessToken);
              localStorage.setItem('refresh_token', refreshToken);
              localStorage.setItem('user', JSON.stringify(userData));
              
              // Actualizar estado de una sola vez para evitar múltiples re-renders
              set({
                backendUser: userData,
                user: { uid: userData.id, email: userData.email, displayName: userData.displayName },
                loading: false,
                isAuthenticating: false,
                isAuthenticated: true
              });
              
              // 🔍 DEBUG TEMPORAL: Log para verificar que backendUser se guardó correctamente
              console.log('🔍 DEBUG backendUser guardado:', {
                userData,
                userDataId: userData.id,
                userDataKeys: Object.keys(userData),
                hasId: !!userData.id,
                idType: typeof userData.id,
                idLength: userData.id?.length
              });
              
              logger.authInfo('Login exitoso - Usuario autenticado', { 
                userId: userData.id,
                userEmail: userData.email
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
              logger.authError('Error en login', error as Error, { email });
              
              const apiError = error as { response?: { data?: { message?: string } } };
              const errorMessage = apiError?.response?.data?.message || 'Error en el login';
              set({ error: errorMessage, loading: false, isAuthenticating: false });
              throw new Error(errorMessage);
            }
          },

          // Limpiar autenticación optimizado
          clearAuth: () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            // Actualizar todo el estado de una sola vez
            set({
              user: null,
              backendUser: null,
              error: null,
              loading: false,
              isAuthenticating: false,
              isAuthenticated: false
            });
          },

          // Actualizar perfil optimizado
          updateProfile: async (data: { displayName?: string; email?: string }) => {
            try {
              set({ loading: true, error: null });

              const response = await api.put('/api/auth/profile', data);
              
              // Actualizar el usuario en el estado solo si realmente cambió
              const currentState = get();
              if (currentState.backendUser) {
                const updatedUser = { ...currentState.backendUser, ...response.data };
                // Solo actualizar si realmente hay cambios
                if (!shallow(currentState.backendUser, updatedUser)) {
                  set({ backendUser: updatedUser });
                  localStorage.setItem('user', JSON.stringify(updatedUser));
                }
              }

              set({ loading: false });
              return response.data;
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Error al actualizar perfil';
              set({ error: errorMessage, loading: false });
              throw err;
            }
          },

          // Logout optimizado
          logout: async () => {
            try {
              set({ loading: true });
              await api.post('/api/auth/logout');
            } catch (error) {
              infoLog('Error en logout:', error);
            } finally {
              get().clearAuth();
            }
          },
        }),
        {
          name: 'auth-store',
          // ✅ SOLUCIÓN: Configurar persistencia para mantener backendUser después de refrescar
          partialize: (state) => ({
            user: state.user,
            backendUser: state.backendUser,
            isAuthenticated: state.isAuthenticated
          })
        }
      )
    ),
    { name: 'auth-store' }
  )
); 