import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import api from '../services/api';
import { logger } from '../utils/logger';
import { performanceMonitor } from '../utils/performanceMonitor';
import { infoLog } from '../config/logger';
import { retryAuthOperation, retryCriticalOperation } from '../utils/retryWithBackoff';

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
  isInitializing: boolean;  // Nuevo estado para inicialización
  hasInitialized: boolean;  // Nuevo estado para verificar si ya se inicializó
}

interface AuthStore extends AuthState {
  // Acciones básicas
  setUser: (user: { uid: string; email: string; displayName?: string } | null) => void;
  setBackendUser: (user: BackendUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsAuthenticating: (isAuthenticating: boolean) => void;
  setIsInitializing: (isInitializing: boolean) => void;
  setHasInitialized: (hasInitialized: boolean) => void;
  clearError: () => void;
  
  // Acciones de autenticación
  login: (email: string, password: string) => Promise<BackendUser>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  updateProfile: (data: { displayName?: string; email?: string }) => Promise<BackendUser>;
  validateToken: (accessToken: string) => Promise<BackendUser | null>;
  initializeAuth: () => Promise<void>;  // Nueva acción para inicialización
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    subscribeWithSelector(
      (set, get) => ({
        // Estado inicial
        user: null,
        backendUser: null,
        loading: true,
        error: null,
        isAuthenticated: false,
        isAuthenticating: false,
        isInitializing: false,
        hasInitialized: false,

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
        
        setIsInitializing: (isInitializing) => {
          const currentState = get();
          if (currentState.isInitializing === isInitializing) return;
          set({ isInitializing });
        },
        
        setHasInitialized: (hasInitialized) => {
          const currentState = get();
          if (currentState.hasInitialized === hasInitialized) return;
          set({ hasInitialized });
        },
        
        clearError: () => {
          const currentState = get();
          // Solo actualizar si hay un error que limpiar
          if (!currentState.error) return;
          set({ error: null });
        },

        // Validar token con el backend - MEJORADO
        validateToken: async (accessToken: string): Promise<BackendUser | null> => {
          try {
            logger.authInfo('Validando token con backend...');
            
            // Validación más estricta del token
            if (!accessToken || 
                accessToken === 'undefined' || 
                accessToken === 'null' || 
                accessToken.length < 10 ||
                !accessToken.startsWith('eyJ')) {
              logger.authError('Token inválido, undefined, null o malformado', new Error('Token inválido'));
              return null;
            }
            
            // Verificar que el header Authorization no contenga undefined
            const authHeader = `Bearer ${accessToken}`;
            if (authHeader.includes('undefined')) {
              logger.authError('Header Authorization contiene undefined', new Error('Header inválido'));
              return null;
            }
            
            // USAR RETRY SYSTEM PARA VALIDACIÓN DE TOKEN
            const validateResult = await retryAuthOperation(async () => {
              return await api.get('/api/auth/profile', {
                headers: {
                  Authorization: authHeader
                }
              });
            });
            
            if (!validateResult.success) {
              logger.authError('Validación de token falló', validateResult.error as Error);
              return null;
            }
            
            const response = validateResult.data!;
            
            // El backend devuelve { success, data: { user, ... } }
            const backendUser = (response.data && response.data.data && response.data.data.user) || null;
            if (!backendUser) {
              logger.authError('Estructura inesperada en /api/auth/profile', new Error('Perfil sin user'));
              return null;
            }
            
            logger.authInfo('Token válido, usuario autenticado');
            return backendUser as BackendUser;
          } catch (error) {
            logger.authError('Token inválido o expirado', error as Error);
            return null;
          }
        },
        
        // Inicialización robusta de autenticación - NUEVO
        initializeAuth: async () => {
          const currentState = get();
          
          // Evitar múltiples inicializaciones simultáneas
          if (currentState.isInitializing || currentState.hasInitialized) {
            logger.authInfo('Inicialización ya en progreso o completada');
            return;
          }
          
          try {
            set({ isInitializing: true, error: null });
            logger.authInfo('Iniciando verificación de autenticación...');
            
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            const storedUser = localStorage.getItem('user');
            
            // Verificar si hay tokens válidos
            if (!accessToken || accessToken === 'undefined' || !refreshToken || refreshToken === 'undefined') {
              logger.authInfo('No hay tokens válidos, limpiando autenticación');
              get().clearAuth();
              set({ hasInitialized: true, isInitializing: false });
              return;
            }
            
            // Intentar validar el token actual
            const validatedUser = await get().validateToken(accessToken);
            if (validatedUser) {
              logger.authInfo('Token válido, restaurando sesión');
              set({
                backendUser: validatedUser,
                user: { uid: validatedUser.id, email: validatedUser.email, displayName: validatedUser.displayName },
                isAuthenticated: true,
                loading: false,
                isInitializing: false,
                hasInitialized: true
              });
              return;
            }
            
            // Si el token no es válido, intentar refresh
            logger.authInfo('Token inválido, intentando refresh...');
            try {
              // USAR RETRY SYSTEM PARA REFRESH EN INICIALIZACIÓN
              const refreshResult = await retryAuthOperation(async () => {
                return await api.post('/api/auth/refresh', { refreshToken });
              });
              
              if (!refreshResult.success) {
                logger.authError('Refresh en inicialización falló', refreshResult.error as Error);
                throw refreshResult.error || new Error('Refresh falló');
              }
              
              const refreshResponse = refreshResult.data!;
              
              if (refreshResponse.data && refreshResponse.data.accessToken) {
                const newAccessToken = refreshResponse.data.accessToken;
                const newRefreshToken = refreshResponse.data.refreshToken || refreshToken;
                
                // Guardar nuevos tokens
                localStorage.setItem('access_token', newAccessToken);
                localStorage.setItem('refresh_token', newRefreshToken);
                
                // Validar el nuevo token
                const newValidatedUser = await get().validateToken(newAccessToken);
                if (newValidatedUser) {
                  logger.authInfo('Refresh exitoso, sesión restaurada');
                  set({
                    backendUser: newValidatedUser,
                    user: { uid: newValidatedUser.id, email: newValidatedUser.email, displayName: newValidatedUser.displayName },
                    isAuthenticated: true,
                    loading: false,
                    isInitializing: false,
                    hasInitialized: true
                  });
                  return;
                }
              }
            } catch (refreshError) {
              logger.authError('Refresh falló', refreshError as Error);
            }
            
            // Si llegamos aquí, tanto validación como refresh fallaron
            logger.authInfo('Autenticación falló completamente, limpiando');
            get().clearAuth();
            set({ hasInitialized: true, isInitializing: false });
            
          } catch (error) {
            logger.authError('Error en inicialización de autenticación', error as Error);
            get().clearAuth();
            set({ 
              error: 'Error al inicializar autenticación',
              hasInitialized: true, 
              isInitializing: false 
            });
          }
        },

        // Login optimizado
        login: async (email: string, password: string) => {
          try {
            set({ error: null, loading: true, isAuthenticating: true });
            
            logger.authInfo('Iniciando login con backend', { email });
            
            // USAR RETRY SYSTEM PARA LOGIN - CRÍTICO PARA CALIDAD
            const loginResult = await retryAuthOperation(async () => {
              return await api.post('/api/auth/login', {
                email,
                password
              });
            });
            
            if (!loginResult.success) {
              logger.authError('Login falló después de todos los reintentos', loginResult.error as Error, { email });
              throw loginResult.error || new Error('Login falló');
            }
            
            const response = loginResult.data!;
            
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
            isAuthenticated: false,
            isInitializing: false,
            hasInitialized: true  // Marcar como inicializado para evitar loops
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

        // Logout optimizado y robusto - SIN ERRORES
        logout: async () => {
          try {
            set({ loading: true });
            
            // ✅ CRÍTICO: Intentar logout en backend SOLO si hay token
            const accessToken = localStorage.getItem('access_token');
            if (accessToken && accessToken !== 'undefined' && accessToken !== 'null') {
              try {
                await api.post('/api/auth/logout');
                logger.authInfo('Logout exitoso en backend');
              } catch (error) {
                // ✅ Ignorar errores del backend durante logout
                logger.authInfo('Error en logout backend (ignorado)', error as Error);
              }
            }
          } catch (error) {
            // ✅ NO mostrar errores al usuario durante logout
            logger.authInfo('Error en logout (ignorado)', error as Error);
          } finally {
            // ✅ SIEMPRE limpiar autenticación local, incluso si el backend falla
            get().clearAuth();
            
            // ✅ Redirigir inmediatamente al login
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          }
        },
      })
    ),
    { name: 'auth-store' }
  )
); 