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

        // Validar token con el backend - CORREGIDO
        validateToken: async (accessToken: string): Promise<BackendUser | null> => {
          try {
            logger.authInfo('Validando token con backend...');
            
            // ✅ Validación más estricta del token
            if (!accessToken || 
                accessToken === 'undefined' || 
                accessToken === 'null' || 
                accessToken.length < 10 ||
                !accessToken.startsWith('eyJ')) {
              logger.authInfo('Token inválido, undefined, null o malformado - no validando');
              return null;
            }
            
            // ✅ Verificar que el header Authorization no contenga undefined
            const authHeader = `Bearer ${accessToken}`;
            if (authHeader.includes('undefined')) {
              logger.authInfo('Header Authorization contiene undefined - no validando');
              return null;
            }
            
            // ✅ Validación directa SIN retry para evitar loops de error
            try {
              const response = await api.get('/api/auth/profile', {
                headers: {
                  Authorization: authHeader
                }
              });
              
              if (!response.data.success) {
                logger.authInfo('Validación de token falló - respuesta del backend');
                return null;
              }
              
              // El backend devuelve { success, data: { user, ... } }
              const backendUser = (response.data && response.data.data && response.data.data.user) || null;
              if (!backendUser) {
                logger.authInfo('Estructura inesperada en /api/auth/profile - no user encontrado');
                return null;
              }
              
              logger.authInfo('Token válido, usuario encontrado');
              return backendUser;
              
            } catch (apiError: any) {
              // ✅ Manejo graceful de errores de API
              if (apiError.response?.status === 401) {
                logger.authInfo('Token expirado o inválido (401)');
              } else if (apiError.response?.status >= 500) {
                logger.authInfo('Error del servidor al validar token');
              } else {
                logger.authInfo('Error de red al validar token');
              }
              return null;
            }
            
          } catch (error) {
            logger.authInfo('Error general en validación de token:', error);
            return null;
          }
        },
        
        // Inicialización robusta de autenticación - CORREGIDA
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
            
            // ✅ VALIDACIÓN PREVIA ESTRICTA - Evitar errores de validación
            if (!accessToken || 
                accessToken === 'undefined' || 
                accessToken === 'null' || 
                accessToken.length < 10 ||
                !accessToken.startsWith('eyJ')) {
              logger.authInfo('Token de acceso inválido o malformado, limpiando autenticación');
              get().clearAuth();
              set({ hasInitialized: true, isInitializing: false, loading: false });
              return;
            }
            
            if (!refreshToken || 
                refreshToken === 'undefined' || 
                refreshToken === 'null' || 
                refreshToken.length < 10 ||
                !refreshToken.startsWith('eyJ')) {
              logger.authInfo('Token de refresh inválido o malformado, limpiando autenticación');
              get().clearAuth();
              set({ hasInitialized: true, isInitializing: false, loading: false });
              return;
            }
            
            // ✅ Solo intentar validar si los tokens parecen válidos
            logger.authInfo('Tokens parecen válidos, validando con backend...');
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
            
            // ✅ Si el token no es válido, NO intentar refresh automáticamente
            // Solo limpiar y dejar que el usuario haga login manualmente
            logger.authInfo('Token inválido, limpiando autenticación (sin intentar refresh automático)');
            get().clearAuth();
            set({ hasInitialized: true, isInitializing: false, loading: false });
            
          } catch (error) {
            logger.authError('Error en inicialización de autenticación', error as Error);
            get().clearAuth();
            set({ 
              error: 'Error al inicializar autenticación',
              hasInitialized: true, 
              isInitializing: false,
              loading: false
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