// Contexto global de autenticación
// ✅ BACKEND EMAIL-FIRST: Solo JWT propio, sin Firebase
// Manejo del estado de usuario, login, logout y protección de rutas
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { apiClient } from '@/services/apiClient'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'
import type { User } from './auth-types'

// ✅ CONTEXTO PARA LOGGING
const authContext = getComponentContext('AuthContext')

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAuthLoaded: boolean
  isLoading: boolean
  error: string | null
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_LOADED' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isAuthLoaded: false,
  isLoading: false,
  error: null
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
    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  initializeAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // ✅ INICIALIZACIÓN CON LOGS PROFESIONALES
  const initializeAuth = async () => {
    const context = createLogContext({
      ...authContext,
      method: 'initializeAuth'
    })

    logger.auth('🔄 Iniciando restauración de sesión', context)

    try {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')

      logger.auth('📋 Estado inicial verificado', createLogContext({
        ...context,
        data: {
          hasToken: !!token,
          hasUserData: !!userData,
          tokenLength: token?.length || 0
        }
      }))

      if (token && userData) {
        logger.auth('🔧 Configurando apiClient con token existente', context)
        apiClient.setAuthToken(token)

        logger.auth('🌐 Validando token con backend', context)
        const validationResponse = await apiClient.get('/auth/validate-token')

        logger.auth('📡 Respuesta de validación recibida', createLogContext({
          ...context,
          data: {
            success: validationResponse?.success,
            hasData: !!validationResponse?.data,
            hasUser: !!validationResponse?.data?.user,
            message: validationResponse?.message
          }
        }))

        if (validationResponse?.success && validationResponse?.data?.user) {
          const user: User = validationResponse.data.user
          
          logger.auth('✅ Validación exitosa - Usuario restaurado', createLogContext({
            ...context,
            data: {
              userEmail: user.email,
              userRole: user.role,
              isActive: user.isActive,
              userName: user.name
            }
          }))

          if (!user.isActive) {
            logger.authError('❌ Usuario inactivo detectado', createLogContext({
              ...context,
              data: { userEmail: user.email, isActive: user.isActive }
            }))
            throw new Error('Usuario inactivo. Contacta al administrador.')
          }

          dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })
          logger.auth('🎉 Sesión restaurada exitosamente', createLogContext({
            ...context,
            data: {
              userEmail: user.email,
              userRole: user.role,
              isActive: user.isActive
            }
          }))
        } else {
          logger.authError('❌ Validación de token fallida', createLogContext({
            ...context,
            data: {
              success: validationResponse?.success,
              hasData: !!validationResponse?.data,
              hasUser: !!validationResponse?.data?.user,
              message: validationResponse?.message
            }
          }))

          // ✅ LIMPIEZA DE DATOS INVALIDOS
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
          apiClient.setAuthToken(null)
          throw new Error('Token inválido según el backend')
        }
      } else {
        logger.auth('ℹ️ No se encontraron datos de sesión', context)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      logger.authError('💥 Error durante inicialización de auth', createLogContext({
        ...context,
        error: error as Error,
        data: { errorMessage }
      }))

      // ✅ LIMPIEZA COMPLETA EN CASO DE ERROR
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      apiClient.setAuthToken(null)
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
    } finally {
      dispatch({ type: 'AUTH_LOADED' })
      logger.auth('🏁 Inicialización de auth completada', createLogContext({
        ...context,
        data: { isAuthLoaded: true }
      }))
    }
  }

  // ✅ LOGIN CON LOGS DETALLADOS
  const login = async (email: string, password: string) => {
    const context = createLogContext({
      ...authContext,
      method: 'login',
      data: { email, passwordLength: password.length }
    })

    logger.auth('🔐 Iniciando proceso de login', context)

    try {
      dispatch({ type: 'AUTH_START' })

      logger.auth('📡 Enviando credenciales al backend', context)
      const response = await apiClient.post('/auth/login', { email, password })

      logger.auth('📥 Respuesta de login recibida', createLogContext({
        ...context,
        data: {
          success: response?.success,
          hasToken: !!response?.data?.token,
          hasUser: !!response?.data?.user
        }
      }))

      if (response?.success && response?.data?.token && response?.data?.user) {
        const { token, user } = response.data

        logger.auth('💾 Guardando datos en localStorage', context)
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(user))

        logger.auth('🔧 Configurando apiClient', context)
        apiClient.setAuthToken(token)

        logger.auth('✅ Login exitoso - Usuario autenticado', createLogContext({
          ...context,
          data: {
            userEmail: user.email,
            userRole: user.role,
            isActive: user.isActive,
            userName: user.name
          }
        }))

        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })
      } else {
        const errorMsg = response?.message || 'Respuesta inválida del servidor'
        logger.authError('❌ Login fallido - Respuesta inválida', createLogContext({
          ...context,
          data: { errorMessage: errorMsg }
        }))
        throw new Error(errorMsg)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      logger.authError('💥 Error durante login', createLogContext({
        ...context,
        error: error as Error,
        data: { errorMessage }
      }))
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      throw error
    }
  }

  // ✅ LOGOUT CON LOGS
  const logout = () => {
    const context = createLogContext({
      ...authContext,
      method: 'logout',
      data: { userEmail: state.user?.email }
    })

    logger.auth('🚪 Iniciando logout', context)

    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    apiClient.setAuthToken(null)
    dispatch({ type: 'AUTH_LOGOUT' })

    logger.auth('✅ Logout completado', context)
  }

  useEffect(() => {
    initializeAuth()
  }, [])

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    initializeAuth
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

 