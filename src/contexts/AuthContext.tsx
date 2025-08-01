// Contexto global de autenticación
// ✅ BACKEND EMAIL-FIRST: Solo JWT propio, sin Firebase
// Manejo del estado de usuario, login, logout y protección de rutas
import { createContext, useEffect, useContext, ReactNode, useReducer, useCallback } from 'react'
import { apiClient } from '@/services/apiClient'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'
import type { User } from './auth-types'

// Función helper para parsear errores
const parseError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return 'Error desconocido'
}

// ✅ CONTEXTO PARA LOGGING
const authContext = getComponentContext('AuthContext')

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAuthLoaded: boolean
  isLoading: boolean
  error: string | null
  sessionValid: boolean
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_LOADED' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SESSION_VALID'; payload: boolean }

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isAuthLoaded: false,
  isLoading: false,
  error: null,
  sessionValid: false
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      }
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    case 'AUTH_LOADED':
      return { ...state, isAuthLoaded: true }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_SESSION_VALID':
      return { ...state, sessionValid: action.payload }
    default:
      return state
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAuthLoaded: boolean
  isLoading: boolean
  error: string | null
  sessionValid: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  validateSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ✅ VALIDACIÓN DE SESIÓN MEJORADA - CRÍTICA PARA EVITAR PÉRDIDA AL REFRESCAR
const validateSession = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('auth_token')
    const userDataStr = localStorage.getItem('user_data')

    if (!token || !userDataStr) {
      logger.warn('AUTH', 'No hay datos de sesión almacenados', {
        hasToken: !!token,
        hasUserData: !!userDataStr
      })
      return false
    }

    // ✅ PARSEAR DATOS DE USUARIO LOCALES
    let userData: User
    try {
      userData = JSON.parse(userDataStr)
    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Error parseando datos de usuario'
      logger.error('AUTH', 'Error parseando datos de usuario', {
        error: errorMessage
      })
      localStorage.removeItem('user_data')
      return false
    }

    // ✅ CONFIGURAR TOKEN EN API CLIENT ANTES DE VALIDAR
    apiClient.setAuthToken(token)

    logger.info('AUTH', 'Validando sesión con backend', {
      userEmail: userData.email,
      tokenPreview: `${token.substring(0, 10)}...`
    })

    // ✅ VALIDAR CON BACKEND - MANEJO ROBUSTO DE ERRORES
    const response = await apiClient.get('/auth/validate-token')

    // ✅ CORRECCIÓN CRÍTICA: VALIDAR ESTRUCTURA CORRECTA DE RESPUESTA
    const responseData = response.data
    if (responseData?.success && responseData.data && responseData.data.sessionValid === true) {
      // ✅ SESIÓN VÁLIDA - RESTAURAR ESTADO CORRECTAMENTE
      const validatedUser: User = {
        ...userData,
        ...responseData.data.user // ✅ USAR DATOS DEL BACKEND SI ESTÁN DISPONIBLES
      }

      localStorage.setItem('user_data', JSON.stringify(validatedUser))

      logger.success('AUTH', 'Sesión validada exitosamente según backend', {
        userEmail: validatedUser.email,
        sessionValid: responseData.data.sessionValid,
        backendValidation: true
      })

      return true
    } else {
      // ✅ SESIÓN INVÁLIDA SEGÚN BACKEND - LIMPIAR DATOS
      logger.warn('AUTH', 'Sesión inválida según backend - limpiando datos', {
        responseSuccess: responseData?.success,
        hasData: !!responseData?.data,
        sessionValid: responseData?.data?.sessionValid,
        backendValidation: false
      })

      // ✅ LIMPIAR DATOS INVÁLIDOS
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      apiClient.setAuthToken(null)

      return false
    }

  } catch (error: unknown) {
    const errorMessage = parseError(error)
    logger.error('AUTH', 'Error validando sesión con backend', {
      error: errorMessage,
      status: (error as any)?.response?.status,
      url: (error as any)?.config?.url
    })

    // ✅ MANEJO ESPECÍFICO DE ERRORES DE RED - NO LIMPIAR INMEDIATAMENTE
    if ((error as any)?.response?.status === 401) {
      // ✅ 401: Token expirado o inválido
      logger.warn('AUTH', 'Token expirado según backend, limpiando datos', {
        status: (error as any).response.status
      })

      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      apiClient.setAuthToken(null)

    } else if ((error as any)?.code === 'NETWORK_ERROR' || (error as any)?.message.includes('Network Error')) {
      // ✅ ERROR DE RED: Mantener datos locales y permitir uso offline
      logger.warn('AUTH', 'Error de red, manteniendo sesión local temporalmente', {
        error: errorMessage
      })

      // ✅ NO limpiar datos por error de red - permitir uso offline
      return true
    } else {
      // ✅ OTROS ERRORES: Marcar como no válida pero no limpiar inmediatamente
      logger.error('AUTH', 'Error desconocido validando sesión', {
        error: errorMessage,
        status: (error as any)?.response?.status
      })
    }

    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const context = createLogContext({
    ...authContext,
    method: 'AuthProvider',
    data: {
      isAuthenticated: state.isAuthenticated,
      hasUser: !!state.user,
      hasToken: !!state.token,
      sessionValid: state.sessionValid
    }
  })

  // ✅ INICIALIZAR AUTENTICACIÓN
  const initializeAuth = useCallback(async () => {
    logger.auth('🔐 Inicializando autenticación', context)
    dispatch({ type: 'AUTH_START' })

    try {
      const isValid = await validateSession()

      if (isValid) {
        const token = localStorage.getItem('auth_token')
        const userData = localStorage.getItem('user_data')

        if (token && userData) {
          const user = JSON.parse(userData)
          dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })
          dispatch({ type: 'SET_SESSION_VALID', payload: true })
        }
      }

      dispatch({ type: 'AUTH_LOADED' })
      logger.auth('✅ Autenticación inicializada', context)
    } catch (error) {
      logger.authError('❌ Error inicializando autenticación', {
        error: error as Error
      })
      dispatch({ type: 'AUTH_LOADED' })
    }
  }, [context])

  // ✅ LOGIN MEJORADO CON VALIDACIÓN CORRECTA
  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' })

    const loginContext = createLogContext({
      ...context,
      method: 'login',
      data: { email }
    })

    logger.info('AUTH', 'Iniciando proceso de login', loginContext)

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      })

      const responseData = response.data
      logger.info('AUTH', 'Respuesta de login recibida', {
        success: responseData?.success,
        hasToken: !!responseData?.token,
        hasUser: !!responseData?.user
      })

      // ✅ VALIDACIÓN CORRECTA DE RESPUESTA DE LOGIN
      if (responseData?.success && responseData.token && responseData.user) {
        const { token, user } = responseData

        // ✅ ALMACENAR DATOS CORRECTAMENTE
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(user))
        apiClient.setAuthToken(token)

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        })
        dispatch({ type: 'SET_SESSION_VALID', payload: true })

        logger.success('AUTH', 'Login exitoso', {
          userEmail: user.email,
          userName: user.name,
          hasToken: !!token
        })

        return true
      } else {
        const errorMsg = responseData?.message || 'Login fallido - respuesta inválida del servidor'
        dispatch({ type: 'AUTH_FAILURE', payload: errorMsg })
        logger.error('AUTH', 'Login fallido - respuesta inválida', {
          response: responseData || 'No response',
          expected: 'success, token, user',
          received: {
            success: responseData?.success,
            hasToken: !!responseData?.token,
            hasUser: !!responseData?.user
          }
        })
        return false
      }

    } catch (error: unknown) {
      const errorMsg = parseError(error)
      dispatch({ type: 'AUTH_FAILURE', payload: errorMsg })

      logger.error('AUTH', 'Error durante login', {
        error: errorMsg,
        status: (error as Error & { response?: { status?: number } })?.response?.status,
        email,
        url: (error as Error & { config?: { url?: string } })?.config?.url
      })

      return false
    }
  }

  // ✅ LOGOUT MEJORADO
  const logout = () => {
    logger.info('AUTH', 'Cerrando sesión de usuario')

    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    apiClient.setAuthToken(null)

    dispatch({ type: 'AUTH_LOGOUT' })

    logger.success('AUTH', 'Sesión cerrada exitosamente')
  }

  // ✅ VALIDAR SESIÓN AL CARGAR LA APLICACIÓN
  useEffect(() => {
    if (!state.isAuthLoaded) {
      logger.info('AUTH', 'Validando sesión al cargar aplicación')
      initializeAuth()
    }
  }, [state.isAuthLoaded, initializeAuth])

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isAuthLoaded: state.isAuthLoaded,
    isLoading: state.isLoading,
    error: state.error,
    sessionValid: state.sessionValid,
    login,
    logout,
    validateSession
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    logger.authError('❌ useAuth debe usarse dentro de AuthProvider')
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
