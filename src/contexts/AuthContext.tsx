// Contexto global de autenticación
// Manejo del estado de usuario, login, logout y protección de rutas
// ACTUALIZADO: Sin dependencia de Firebase Auth (autenticación directa)
import { useReducer, useEffect } from 'react'
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
      
      // ✅ Validación de configuración básica
      logger.info('Direct auth mode - no Firebase initialization needed', null, 'direct_auth_mode')
      
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
   * Login directo con Backend UTalk
   * ACTUALIZADO: El backend real usa email/password directo, no Firebase Auth
   * 1. Envía email/password al backend /api/auth/login
   * 2. Recibe usuario + JWT del backend
   * 3. Almacena en localStorage y contexto
   */
  const login = async (email: string, password: string) => {
    const perfId = logger.startPerformance('direct_login_flow')
    
    logger.info('🚀 LOGIN FLOW STARTED (DIRECT AUTH)', {
      email,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE,
      apiUrl: import.meta.env.VITE_API_URL,
      hasApiUrl: !!import.meta.env.VITE_API_URL,
      userAgent: navigator.userAgent.substring(0, 100)
    }, 'login_flow_start')
    
    dispatch({ type: 'AUTH_REQUEST' })
    
    try {
      // 1. Autenticación directa con backend UTalk (email/password)
      logger.info('🔑 Sending credentials directly to backend...', {
        email,
        hasPassword: !!password,
        passwordLength: password.length
      }, 'backend_auth_start')
      
      // ✅ CORREGIDO: Enviar email/password como espera el backend real
      const response = await apiClient.post<LoginResponse>('/auth/login', { 
        email, 
        password 
      })
      
      // ✅ LOGS CRÍTICOS: Verificar estructura de respuesta ANTES de extraer datos
      logger.info('🔍 Backend response received', {
        responseType: typeof response,
        hasData: !!response,
        responseKeys: response ? Object.keys(response) : [],
        responseStructure: response ? JSON.stringify(response, null, 2).substring(0, 500) : 'null'
      }, 'backend_response_structure')

      // ✅ NUEVO: Log crítico para verificar si llegamos hasta aquí
      logger.info('🎯 CHECKPOINT: Response received from backend', {
        timestamp: new Date().toISOString(),
        responseExists: !!response,
        responseType: typeof response
      }, 'backend_response_checkpoint')

      // ✅ CORREGIDO: Extracción robusta de user y token
      let user: User, token: string

      // El apiClient ya retorna LoginResponse directamente para /auth/login
      if (response && typeof response === 'object') {
        // Caso 1: Respuesta directa { user, token }
        if (response.user && response.token) {
          user = response.user
          token = response.token
          logger.success('✅ Direct extraction successful', { hasUser: !!user, hasToken: !!token }, 'token_extraction')
        }
        // Caso 2: Error - estructura no reconocida
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
      
      // 5. ✅ Conectar WebSocket con token y userId válidos (según Backend UTalk)
      try {
        if (user?.id && token) {
          socketClient.connectWithToken(token, user.id)
          logger.success('WebSocket connected after login', { 
            hasToken: !!token, 
            hasUserId: !!user.id 
          }, 'socket_connected')
        } else {
          logger.warn('Missing token or userId for WebSocket connection', {
            hasToken: !!token,
            hasUserId: !!user?.id
          }, 'socket_connection_missing_data')
        }
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
      // ✅ LOGS SÚPER CRÍTICOS: Capturar TODO sobre el error
      logger.error('❌ COMPLETE LOGIN ERROR ANALYSIS', {
        errorType: typeof error,
        errorName: error?.name,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorStatus: error?.status,
        errorResponse: error?.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        } : 'no response',
        errorStack: error?.stack?.substring(0, 300),
        isAxiosError: error?.isAxiosError,
        isNetworkError: error?.code === 'ERR_NETWORK',
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2).substring(0, 500)
      }, 'complete_login_error')

      // ✅ MANEJO INTELIGENTE DE ERRORES ESPECÍFICOS
      let userMessage = 'Error de autenticación'
      
      if (error?.code === 'ERR_NETWORK') {
        userMessage = 'No se puede conectar al servidor. Verifica tu conexión.'
        logger.error('Network connectivity issue', { 
          baseURL: import.meta.env.VITE_API_URL,
          isOnline: navigator.onLine 
        }, 'network_error')
      } else if (error?.response?.status === 401) {
        userMessage = 'Credenciales inválidas. Verifica tu email y contraseña.'
      } else if (error?.response?.status === 403) {
        userMessage = 'No tienes permisos para acceder a esta aplicación.'
      } else if (error?.response?.status >= 500) {
        userMessage = 'Error del servidor. Intenta nuevamente en unos minutos.'
      } else if (error?.code?.startsWith('auth/')) {
        // Errores específicos de Firebase
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            userMessage = 'Email o contraseña incorrectos'
            break
          case 'auth/user-disabled':
            userMessage = 'Usuario deshabilitado'
            break
          case 'auth/too-many-requests':
            userMessage = 'Demasiados intentos fallidos. Intenta más tarde'
            break
          default:
            userMessage = 'Error de autenticación con Firebase'
        }
      } else if (error?.response?.data?.message) {
        userMessage = error.response.data.message
      }

      dispatch({ type: 'AUTH_FAILURE', payload: userMessage })
      throw new Error(userMessage)
    }
  }

  // NOTA: El backend UTalk no tiene endpoint de registro
  // Los usuarios son creados directamente en Firebase Console por administradores

  /**
   * Logout completo: Backend + Local
   * ACTUALIZADO: Sin dependencia de Firebase
   * 1. Invalida sesión en backend UTalk
   * 2. Limpia localStorage y contexto
   */
  const logout = async () => {
    const perfId = logger.startPerformance('user_logout')
    
    logger.info('Starting logout process (DIRECT AUTH)...', null, 'logout_start')

    try {
      // 1. Invalidar sesión en backend UTalk
      logger.info('Invalidating backend session...', null, 'backend_logout_start')
      await apiClient.post('/auth/logout')
      
      logger.success('Backend session invalidated', null, 'backend_logout_success')
    } catch (error) {
      logger.warn('Error invalidating backend session', error, 'backend_logout_error')
      // Continúa con logout local aunque falle el backend
    }

    // 2. Limpiar localStorage y contexto (siempre ejecutar)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')

    // 3. ✅ Desconectar WebSocket
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

 