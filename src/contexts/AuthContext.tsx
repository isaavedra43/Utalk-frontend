// Contexto global de autenticación
// ✅ BACKEND EMAIL-FIRST: Solo JWT propio, sin Firebase
// Manejo del estado de usuario, login, logout y protección de rutas
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { apiClient } from '@/services/apiClient'
import { logger } from '@/lib/logger'
import { User } from '@/types/shared'

// Tipos para el estado de autenticación
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

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isAuthLoaded: false,
  isLoading: false,
  error: null,
  sessionValid: false
}

// Reducer para manejar acciones de autenticación
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
        error: null,
        sessionValid: true
      }
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        sessionValid: false
      }
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        sessionValid: false
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

// Contexto de autenticación
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

// Función para validar sesión con el backend
const validateSession = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('authToken')
    const userDataStr = localStorage.getItem('user_data')

    if (!token || !userDataStr) {
      logger.warn('AUTH', 'No hay datos de sesión en localStorage')
      return false
    }

    let userData: User
    try {
      userData = JSON.parse(userDataStr)
    } catch (error) {
      logger.error('AUTH', 'Error parseando datos de usuario', { error })
      localStorage.removeItem('user_data')
      return false
    }

    if (!userData.email) {
      logger.warn('AUTH', 'Datos de usuario incompletos')
      return false
    }

    // Configurar token en API client
    apiClient.setAuthToken(token)

    logger.info('AUTH', 'Validando sesión con backend', {
      userEmail: userData.email,
      tokenPreview: `${token.substring(0, 10)}...`
    })

    // Validar con backend
    const response = await apiClient.get('/auth/validate-token')
    
    // Verificar estructura de respuesta correcta
    if (response && response.data && response.data.success && response.data.sessionValid === true) {
      // Sesión válida
      const validatedUser: User = {
        ...userData,
        ...response.data.user,
      }

      localStorage.setItem('user_data', JSON.stringify(validatedUser))
      
      logger.success('AUTH', 'Sesión validada exitosamente según backend', {
        userEmail: validatedUser.email,
        sessionValid: response.data.sessionValid,
        backendValidation: true
      })
      
      return true
    } else {
      // Sesión inválida según backend
      logger.warn('AUTH', 'Sesión inválida según backend - limpiando datos', {
        responseSuccess: response?.data?.success,
        hasData: !!response?.data,
        sessionValid: response?.data?.sessionValid,
        backendValidation: false
      })
      
      // Limpiar datos inválidos
      localStorage.removeItem('authToken')
      localStorage.removeItem('user_data')
      apiClient.setAuthToken(null)
      
      return false
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    logger.error('AUTH', 'Error validando sesión con backend', {
      error: errorMessage,
      status: (error as any)?.response?.status,
      url: (error as any)?.config?.url
    })

    // Manejo específico de errores de red
    if ((error as any)?.response?.status === 401) {
      // 401: Token expirado o inválido
      logger.warn('AUTH', 'Token expirado según backend, limpiando datos', {
        status: (error as any).response.status
      })
      
      localStorage.removeItem('authToken')
      localStorage.removeItem('user_data')
      apiClient.setAuthToken(null)
      
    } else if ((error as any)?.code === 'NETWORK_ERROR' || (error as any)?.message?.includes('Network Error')) {
      // Error de red: Mantener datos locales y permitir uso offline
      logger.warn('AUTH', 'Error de red, manteniendo sesión local temporalmente', {
        error: errorMessage
      })
      
      // NO limpiar datos por error de red - permitir uso offline
      return true
    } else {
      // Otros errores: Marcar como no válida pero no limpiar inmediatamente
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

  // Inicializar autenticación al cargar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        const isValid = await validateSession()
        
        if (isValid) {
          const token = localStorage.getItem('authToken')
          const userDataStr = localStorage.getItem('user_data')
          
          if (token && userDataStr) {
            const userData = JSON.parse(userDataStr)
            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: { user: userData, token } 
            })
          }
        }
        
        dispatch({ type: 'AUTH_LOADED' })
        
      } catch (error) {
        logger.error('AUTH', 'Error inicializando autenticación', { error })
        dispatch({ type: 'AUTH_FAILURE', payload: 'Error inicializando autenticación' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initializeAuth()
  }, [])

  // Función de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      logger.info('AUTH', 'Iniciando login', { email })
      
      const response = await apiClient.post('/auth/login', { email, password })
      
      // Verificar estructura de respuesta correcta
      if (response && response.data && response.data.success && response.data.token) {
        const { token, user } = response.data
        
        // Configurar token en API client
        apiClient.setAuthToken(token)
        
        // Guardar datos en localStorage
        localStorage.setItem('authToken', token)
        localStorage.setItem('user_data', JSON.stringify(user))
        
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { user, token } 
        })
        
        logger.success('AUTH', 'Login exitoso', { 
          userEmail: user.email,
          tokenPreview: `${token.substring(0, 10)}...`
        })
        
        return true
      } else {
        const errorMsg = response?.data?.message || 'Respuesta inválida del servidor'
        dispatch({ type: 'AUTH_FAILURE', payload: errorMsg })
        logger.error('AUTH', 'Login falló - respuesta inválida', { 
          response: response?.data 
        })
        return false
      }
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      
      logger.error('AUTH', 'Error en login', { 
        error: errorMessage,
        status: (error as any)?.response?.status 
      })
      
      return false
    }
  }

  // Función de logout
  const logout = () => {
    logger.info('AUTH', 'Cerrando sesión')
    
    // Limpiar datos locales
    localStorage.removeItem('authToken')
    localStorage.removeItem('user_data')
    
    // Limpiar token en API client
    apiClient.setAuthToken(null)
    
    dispatch({ type: 'AUTH_LOGOUT' })
    
    // Redirigir a login
    window.location.href = '/auth/login'
  }

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

 