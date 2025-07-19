// Contexto global de autenticación
// Manejo del estado de usuario, login, logout y protección de rutas
import { useReducer, useEffect } from 'react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, getFirebaseApp } from '@/lib/firebase'
import apiClient from '@/services/apiClient'
import { socketClient } from '@/services/socketClient'
import {
  User,
  authReducer,
  initialState,
} from './auth-types'
import { AuthContext } from '@/hooks/useAuthContext'
import { logger } from '@/lib/logger'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  /**
   * Inicialización de autenticación al cargar la app
   * Verifica si hay token en localStorage y valida con backend
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const perfId = logger.startPerformance('auth_initialization')
      
      logger.info('Initializing authentication...', null, 'auth_init')
      
      // ✅ Validar que Firebase esté inicializado correctamente
      try {
        const firebaseApp = getFirebaseApp()
        logger.success('Firebase App initialized successfully', {
          projectId: firebaseApp.options.projectId,
          authDomain: firebaseApp.options.authDomain
        }, 'firebase_init_success')
      } catch (error) {
        logger.error('Firebase initialization failed', error, 'firebase_init_error')
        dispatch({ type: 'AUTH_FAILURE', payload: 'Error de configuración de Firebase' })
        return
      }
      
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')

      if (token) {
        logger.info('Token found in localStorage, validating...', { hasUserData: !!userData }, 'auth_token_found')
        
        try {
          // Verificar sesión con backend UTalk (GET /api/auth/me)
          const user = await apiClient.get('/auth/me')
          
          logger.auth('session_validation', { user: user.data, token })
          
          dispatch({ type: 'AUTH_SUCCESS', payload: { user: user.data, token } })
          
          logger.endPerformance(perfId, 'Session validated successfully')
        } catch (error: any) {
          // Token inválido, expirado o usuario inactivo
          logger.auth('session_validation', { error })
          
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
          dispatch({ type: 'AUTH_FAILURE', payload: 'Sesión expirada' })
          
          logger.endPerformance(perfId, 'Session expired, cleaned up')
        }
      } else {
        // No hay token, usuario no autenticado
        logger.info('No token found, user not authenticated', null, 'auth_no_token')
        dispatch({ type: 'AUTH_FAILURE', payload: '' })
        
        logger.endPerformance(perfId, 'No token found')
      }
    }

    initializeAuth()
  }, [])

  /**
   * Login con Firebase Auth + Backend UTalk
   * 1. Autentica con Firebase (signInWithEmailAndPassword)
   * 2. Obtiene idToken de Firebase
   * 3. Envía idToken al backend /api/auth/login
   * 4. Recibe usuario + JWT del backend
   * 5. Almacena en localStorage y contexto
   */
  const login = async (email: string, password: string) => {
    const perfId = logger.startPerformance('user_login')
    
    logger.info('Starting login process...', { email }, 'login_start')
    
    // ✅ Validar que Firebase Auth esté disponible
    try {
      const authInstance = auth
      if (!authInstance) {
        throw new Error('Firebase Auth not initialized')
      }
      logger.success('Firebase Auth instance available', null, 'firebase_auth_ready')
    } catch (error) {
      logger.error('Firebase Auth not available', error, 'firebase_auth_error')
      throw new Error('Error de configuración de autenticación')
    }
    
    dispatch({ type: 'AUTH_REQUEST' })
    
    try {
      // 1. Autenticar con Firebase Auth
      logger.info('Authenticating with Firebase...', null, 'firebase_auth_start')
      const firebaseUser = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await firebaseUser.user.getIdToken()

      logger.success('Firebase authentication successful', {
        uid: firebaseUser.user.uid,
        email: firebaseUser.user.email,
        tokenLength: idToken.length
      }, 'firebase_auth_success')

      // 2. Enviar idToken al backend UTalk
      logger.info('Sending idToken to backend...', null, 'backend_auth_start')
      
      // ✅ CRÍTICO: Petición al backend con logs detallados
      const response = await apiClient.post('/auth/login', { idToken })
      
      // ✅ LOGS CRÍTICOS: Verificar estructura de respuesta ANTES de extraer datos
      logger.info('🔍 Backend response received', {
        responseType: typeof response,
        hasData: !!response,
        responseKeys: response ? Object.keys(response) : [],
        responseStructure: response ? JSON.stringify(response, null, 2).substring(0, 500) : 'null'
      }, 'backend_response_structure')

      // ✅ CORREGIDO: Extracción robusta de user y token
      let user, token

      // El apiClient ya devuelve response.data.data, así que response debería ser directo
      if (response && typeof response === 'object') {
        // Caso 1: Respuesta directa { user, token }
        if (response.user && response.token) {
          user = response.user
          token = response.token
          logger.success('✅ Direct extraction successful', { hasUser: !!user, hasToken: !!token }, 'token_extraction')
        }
        // Caso 2: Respuesta anidada en .data
        else if (response.data && response.data.user && response.data.token) {
          user = response.data.user
          token = response.data.token
          logger.success('✅ Nested extraction successful', { hasUser: !!user, hasToken: !!token }, 'token_extraction')
        }
        // Caso 3: Error - estructura no reconocida
        else {
          logger.error('❌ Unrecognized response structure', {
            response,
            availableKeys: Object.keys(response),
            suggestion: 'Check backend response format'
          }, 'token_extraction_error')
          throw new Error('Respuesta del servidor inválida: no se encontró user/token')
        }
      } else {
        logger.error('❌ Invalid response type', {
          responseType: typeof response,
          response
        }, 'invalid_response_type')
        throw new Error('Respuesta del servidor inválida')
      }

      // ✅ VALIDACIÓN FINAL: Verificar que tenemos los datos necesarios
      if (!user || !token) {
        logger.error('❌ Missing user or token after extraction', {
          hasUser: !!user,
          hasToken: !!token,
          userType: typeof user,
          tokenType: typeof token
        }, 'missing_auth_data')
        throw new Error('Error en autenticación: datos incompletos del servidor')
      }

      logger.auth('backend_login', { 
        user: { id: user.id, email: user.email, role: user.role }, 
        token: token.substring(0, 20) + '...' // Solo mostrar inicio del token por seguridad
      })

      // 3. Guardar en localStorage (para persistencia)
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(user))

      // 4. Actualizar contexto
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })
      
      // 5. ✅ Conectar WebSocket con token válido
      try {
        socketClient.connectWithToken(token)
        logger.success('WebSocket connected after login', null, 'socket_connected')
      } catch (socketError) {
        logger.warn('Failed to connect WebSocket after login', socketError, 'socket_connection_failed')
        // No fallar el login por problemas de socket
      }
      
      logger.endPerformance(perfId, `Login completed for ${email}`)
      
      logger.success('Login process completed successfully', {
        userId: user.id,
        role: user.role,
        email: user.email
      }, 'login_complete')

    } catch (error: any) {
      let message = 'Error de autenticación'
      
      // Manejo específico de errores Firebase vs Backend
      if (error.code) {
        // Error de Firebase Auth
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            message = 'Email o contraseña incorrectos'
            break
          case 'auth/user-disabled':
            message = 'Usuario deshabilitado'
            break
          case 'auth/too-many-requests':
            message = 'Demasiados intentos fallidos. Intenta más tarde'
            break
          default:
            message = 'Error de autenticación con Firebase'
        }
        
        logger.error('Firebase authentication failed', error, 'firebase_auth_error')
      } else if (error.response) {
        // Error del backend UTalk
        message = error.response.data?.message || 'Error del servidor'
        
        logger.error('Backend authentication failed', {
          status: error.response.status,
          data: error.response.data
        }, 'backend_auth_error')
      }

      logger.auth('login', { error })
      
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      
      logger.endPerformance(perfId, `Login failed: ${message}`)
      
      throw new Error(message)
    }
  }

  // NOTA: El backend UTalk no tiene endpoint de registro
  // Los usuarios son creados directamente en Firebase Console por administradores

  /**
   * Logout completo: Backend + Firebase + Local
   * 1. Invalida sesión en backend UTalk
   * 2. Cierra sesión en Firebase Auth
   * 3. Limpia localStorage y contexto
   */
  const logout = async () => {
    const perfId = logger.startPerformance('user_logout')
    
    logger.info('Starting logout process...', null, 'logout_start')

    try {
      // 1. Invalidar sesión en backend UTalk
      logger.info('Invalidating backend session...', null, 'backend_logout_start')
      await apiClient.post('/auth/logout')
      
      logger.success('Backend session invalidated', null, 'backend_logout_success')
    } catch (error) {
      logger.warn('Error invalidating backend session', error, 'backend_logout_error')
      // Continúa con logout local aunque falle el backend
    }

    try {
      // 2. Cerrar sesión en Firebase Auth
      logger.info('Signing out from Firebase...', null, 'firebase_logout_start')
      await signOut(auth)
      
      logger.success('Firebase signout successful', null, 'firebase_logout_success')
    } catch (error) {
      logger.warn('Error signing out from Firebase', error, 'firebase_logout_error')
      // Continúa con logout local aunque falle Firebase
    }

    // 3. Limpiar localStorage y contexto (siempre ejecutar)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')

    // 4. ✅ Desconectar WebSocket
    try {
      socketClient.disconnectSocket()
      logger.success('WebSocket disconnected during logout', null, 'socket_disconnected')
    } catch (socketError) {
      logger.warn('Error disconnecting WebSocket during logout', socketError, 'socket_disconnect_error')
    }

    dispatch({ type: 'AUTH_LOGOUT' })

    logger.auth('logout', {})

    logger.endPerformance(perfId, 'Logout completed')

    logger.success('Logout process completed', null, 'logout_complete')
  }

  /**
   * Actualizar datos del usuario en contexto
   * Útil para cambios de perfil, roles, etc.
   */
  const updateUser = (userData: Partial<User>) => {
    logger.info('Updating user data in context', userData, 'user_update')
    
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }

  const value = {
    ...state,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

 