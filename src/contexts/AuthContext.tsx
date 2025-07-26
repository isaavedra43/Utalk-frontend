// Contexto global de autenticación
// ✅ ALINEADO CON UID DE FIREBASE + FIRESTORE SYNC
// Manejo del estado de usuario, login, logout y protección de rutas
import { useReducer, useEffect } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import { apiClient } from '@/services/apiClient'
import { socketClient } from '@/services/socketClient'
import {
  User,
  authReducer,
  initialState,
} from './auth-types'
import { AuthContext } from '@/hooks/useAuthContext'
import { logger } from '@/lib/logger'
import { LoginResponse } from '@/types'
import { useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/lib/constants'
import { tokenManager } from '@/lib/tokenManager'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const queryClient = useQueryClient()

  useEffect(() => {
    let isMounted = true;
    async function initializeAuth() {
      console.log('--- ✅ Auth Initialization Start (UID + Firestore) ---');
      dispatch({ type: 'AUTH_REQUEST' });

      try {
        let token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        console.log('1. Reading from localStorage', { hasToken: !!token, hasUserData: !!userData });

        if (token && userData) {
          console.log('2. Token and user data found. Validating with backend...');
          
          apiClient.setAuthToken(token);

          // ✅ Verificar si el token está próximo a expirar
          if (tokenManager.isTokenExpiringSoon()) {
            console.log('Token próximo a expirar, refrescando...');
            const newToken = await tokenManager.refreshToken();
            if (newToken) {
              token = newToken;
              apiClient.setAuthToken(newToken);
            }
          }

          // ✅ CRÍTICO: Validar sesión Y sincronizar con Firestore
          const validationResponse = await apiClient.get(API_ENDPOINTS.AUTH.ME);
          console.log('3. Backend validation response:', validationResponse);

          if (validationResponse && validationResponse.uid) {
            // ✅ NUEVO: Sincronizar con Firestore usando UID
            const firestoreUser = await syncUserWithFirestore(validationResponse.uid);
            
            if (firestoreUser) {
              const user: User = {
                uid: validationResponse.uid,
                id: validationResponse.uid, // Legacy compatibility
                email: validationResponse.email,
                displayName: validationResponse.displayName,
                emailVerified: validationResponse.emailVerified || false,
                firestoreData: firestoreUser,
                syncStatus: {
                  isFirestoreUser: true,
                  lastSyncAt: new Date().toISOString(),
                  needsSync: false
                }
              };

              if (isMounted) {
                dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
                socketClient.connectWithToken(token, user.uid);
                tokenManager.startTokenMonitoring();
                console.log('4. ✅ Session restored and Firestore synced.');
              }
            } else {
              // ✅ Usuario no existe en Firestore
              if (isMounted) {
                dispatch({ 
                  type: 'REQUIRES_APPROVAL', 
                  payload: 'Tu cuenta no está autorizada en el sistema. Contacta a un administrador.' 
                });
              }
            }
          } else {
            throw new Error('Respuesta de validación inválida del backend');
          }
        } else {
          console.log('2. No session found in localStorage.');
          if (isMounted) {
            dispatch({ type: 'AUTH_FAILURE', payload: 'No active session' });
          }
        }
      } catch (error: any) {
        console.error('3. ❌ Session validation failed:', error.message);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        apiClient.setAuthToken(null);
        if (isMounted) {
          dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired or invalid' });
        }
      } finally {
        if (isMounted) {
          dispatch({ type: 'AUTH_READY' });
        }
        console.log('--- Auth Initialization End ---');
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * ✅ NUEVA FUNCIÓN: Sincronizar usuario con Firestore
   */
  async function syncUserWithFirestore(uid: string): Promise<any | null> {
    try {
      console.log('🔄 Syncing user with Firestore...', { uid });
      
      // ✅ Llamada al backend para obtener datos de Firestore del usuario
      const firestoreResponse = await apiClient.get(`/auth/user/${uid}/firestore`);
      
      if (firestoreResponse && firestoreResponse.exists) {
        console.log('✅ User found in Firestore:', firestoreResponse.data);
        return firestoreResponse.data;
      } else {
        console.warn('❌ User not found in Firestore:', uid);
        return null;
      }
    } catch (error: any) {
      console.error('❌ Failed to sync with Firestore:', error);
      
      // ✅ Si es error 404, el usuario no existe en Firestore
      if (error.response?.status === 404) {
        return null;
      }
      
      throw error;
    }
  }

  /**
   * ✅ ACTUALIZADO: Login con Firebase Auth + Backend + Firestore sync
   */
  const login = async (email: string, password: string) => {
    const perfId = logger.startPerformance('firebase_auth_firestore_login_flow')
    
    logger.info('🚀 LOGIN FLOW STARTED (Firebase Auth + UID + Firestore)', {
      email,
      timestamp: new Date().toISOString(),
    }, 'firebase_firestore_login_flow_start')
    
    dispatch({ type: 'AUTH_REQUEST' })
    
    try {
      // 1. ✅ Autenticación con Firebase Auth
      logger.info('🔑 Starting Firebase Authentication...', { email }, 'firebase_auth_start')
      
      const auth = getFirebaseAuth()
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      const firebaseUser = userCredential.user;
      const uid = firebaseUser.uid;
      
      logger.info('✅ Firebase Auth successful', {
        uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified
      }, 'firebase_auth_success')

      // 2. ✅ Obtener idToken de Firebase
      const idToken = await firebaseUser.getIdToken()
      
      logger.info('✅ Firebase idToken obtained', {
        idTokenLength: idToken.length,
        uid
      }, 'firebase_idtoken_obtained')

      // 3. ✅ Enviar idToken al backend para validación y obtener JWT
      logger.info('🔄 Sending idToken to backend...', {
        endpoint: API_ENDPOINTS.AUTH.LOGIN,
        uid
      }, 'backend_validation_start')
      
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, { 
        idToken 
      })
      
      logger.info('🔍 Backend response received', {
        responseType: typeof response,
        hasData: !!response,
        uid
      }, 'backend_response_structure')

      // 4. ✅ CRÍTICO: Extraer user y token del backend
      let backendUser: any, jwtToken: string

      if (response && typeof response === 'object') {
        if (response.user && response.token) {
          backendUser = response.user
          jwtToken = response.token
          logger.success('✅ Backend validation successful', { 
            hasUser: !!backendUser, 
            hasToken: !!jwtToken,
            backendUserId: backendUser.id,
            uid
          }, 'backend_validation_success')
        } else {
          throw new Error('Respuesta del backend inválida: faltan user o token.');
        }
      } else {
        throw new Error('Respuesta del backend no es un objeto válido.');
      }

      // 5. ✅ NUEVO: Sincronizar con Firestore usando UID
      logger.info('🔄 Syncing with Firestore...', { uid }, 'firestore_sync_start')
      dispatch({ type: 'SYNC_START' });
      
      const firestoreData = await syncUserWithFirestore(uid);
      
      if (!firestoreData) {
        // ✅ Usuario no autorizado en Firestore
        logger.error('❌ User not authorized in Firestore', { uid, email }, 'firestore_user_not_found')
        dispatch({ 
          type: 'REQUIRES_APPROVAL', 
          payload: 'Tu cuenta no está autorizada en el sistema. Contacta a un administrador.' 
        });
        return;
      }
      
      dispatch({ type: 'SYNC_SUCCESS', payload: { firestoreData } });
      logger.success('✅ Firestore sync successful', { uid }, 'firestore_sync_success')

      // 6. ✅ Construir objeto User completo
      const user: User = {
        uid: uid,
        id: uid, // Legacy compatibility
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || undefined,
        emailVerified: firebaseUser.emailVerified,
        firestoreData: firestoreData,
        syncStatus: {
          isFirestoreUser: true,
          lastSyncAt: new Date().toISOString(),
          needsSync: false
        }
      };

      // 7. ✅ Guardar datos localmente
      tokenManager.setToken(jwtToken, (response as any).expiresIn || 24 * 60 * 60)
      localStorage.setItem('user_data', JSON.stringify(user))

      // 8. ✅ Actualizar contexto
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token: jwtToken } })
      
      queryClient.invalidateQueries()

      // 9. ✅ Conectar WebSocket con UID
      try {
        socketClient.connectWithToken(jwtToken, uid)
        logger.success('WebSocket connected after login', { 
          hasToken: !!jwtToken, 
          uid 
        }, 'socket_connected')
      } catch (socketError) {
        logger.warn('Failed to connect WebSocket after login', socketError, 'socket_connection_failed')
      }
      
      logger.endPerformance(perfId, `Firebase Auth + Firestore login completed for ${email}`)
      
      logger.success('✅ Complete login flow successful', {
        firebaseUid: uid,
        firestoreRole: firestoreData.role,
        email: firebaseUser.email
      }, 'login_complete')

    } catch (error: any) {
      logger.error('❌ COMPLETE LOGIN ERROR', {
        errorType: typeof error,
        errorName: error?.name,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorStatus: error?.status,
        errorResponse: error?.response?.data
      }, 'complete_login_error')

      // ✅ MANEJO ESPECÍFICO DE ERRORES
      let userMessage = 'Error de autenticación.';
      
      if (error?.code?.startsWith('auth/')) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            userMessage = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
            break;
          case 'auth/user-disabled':
            userMessage = 'Usuario deshabilitado. Contacta al administrador.';
            break;
          case 'auth/too-many-requests':
            userMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
            break;
          default:
            userMessage = 'Error de autenticación Firebase.';
        }
      } else if (error?.response?.status === 401) {
        userMessage = 'Credenciales inválidas.';
      } else if (error?.response?.status >= 500) {
        userMessage = 'Error del servidor. Intenta nuevamente.';
      } else if (error?.message?.includes('no está autorizada')) {
        userMessage = error.message; // Usar mensaje específico de Firestore
      }

      dispatch({ type: 'AUTH_FAILURE', payload: userMessage })
      throw new Error(userMessage)
    }
  }

  /**
   * ✅ ACTUALIZADO: Logout completo
   */
  const logout = async () => {
    const perfId = logger.startPerformance('user_logout')
    
    logger.info('Starting logout process...', null, 'logout_start')

    try {
      // 1. Invalidar sesión en backend
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
      logger.success('Backend session invalidated', null, 'backend_logout_success')
    } catch (error) {
      logger.warn('Error invalidating backend session', error, 'backend_logout_error')
    }

    // 2. Limpiar localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')

    // 3. Desconectar WebSocket
    try {
      socketClient.disconnectSocket()
      logger.success('WebSocket disconnected during logout', null, 'socket_disconnected')
    } catch (socketError) {
      logger.warn('Error disconnecting WebSocket during logout', socketError, 'socket_disconnect_error')
    }

    dispatch({ type: 'AUTH_LOGOUT' })

    queryClient.clear()

    logger.endPerformance(perfId, 'Logout completed')
    logger.success('Logout process completed', null, 'logout_complete')
  }

  /**
   * ✅ NUEVO: Método para re-sincronizar con Firestore
   */
  const syncWithFirestore = async () => {
    if (!state.user?.uid || !state.token) {
      console.warn('❌ Cannot sync: Missing UID or token');
      return;
    }

    try {
      dispatch({ type: 'SYNC_START' });
      
      const firestoreData = await syncUserWithFirestore(state.user.uid);
      
      if (firestoreData) {
        dispatch({ type: 'SYNC_SUCCESS', payload: { firestoreData } });
        
        // Actualizar localStorage
        const updatedUser = {
          ...state.user,
          firestoreData,
          syncStatus: {
            isFirestoreUser: true,
            lastSyncAt: new Date().toISOString(),
            needsSync: false
          }
        };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        
        logger.success('✅ Manual Firestore sync successful', { uid: state.user.uid }, 'manual_sync_success');
      } else {
        dispatch({ type: 'SYNC_FAILURE', payload: 'Usuario no encontrado en Firestore' });
      }
    } catch (error: any) {
      dispatch({ type: 'SYNC_FAILURE', payload: error.message });
      logger.error('❌ Manual Firestore sync failed', error, 'manual_sync_error');
    }
  }

  /**
   * ✅ NUEVO: Limpiar errores de sincronización
   */
  const clearSyncError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  }

  /**
   * Actualizar datos del usuario en contexto
   */
  const updateUser = (userData: Partial<User>) => {
    logger.info('Updating user data in context', userData, 'user_update')
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }

  // ✅ No renderizar hasta que auth esté lista
  if (!state.isAuthReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          {state.isSyncing && (
            <p className="text-sm text-muted-foreground">Sincronizando con Firestore...</p>
          )}
        </div>
      </div>
    );
  }

  // ✅ NUEVO: Pantalla de aprobación requerida
  if (state.requiresApproval) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center p-6 border rounded-lg shadow-lg">
          <div className="mb-4 text-6xl">🔒</div>
          <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
          <p className="text-muted-foreground mb-4">{state.error}</p>
          <button 
            onClick={() => window.location.href = '/auth/login'}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    syncWithFirestore,
    clearSyncError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

 