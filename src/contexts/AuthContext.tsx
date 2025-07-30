// Contexto global de autenticación
// ✅ BACKEND EMAIL-FIRST: Solo JWT propio, sin Firebase
// Manejo del estado de usuario, login, logout y protección de rutas
import React, { useReducer, useEffect, createContext, useContext } from 'react'
import { apiClient } from '@/services/apiClient'
import {
  User,
  AuthState,
  authReducer,
  initialState,
} from './auth-types'
import { logger } from '@/lib/logger'
import { useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/lib/constants'

// ✅ Contexto de autenticación
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const queryClient = useQueryClient()

  useEffect(() => {
    let isMounted = true
    
    async function initializeAuth() {
      console.log('--- ✅ Auth Initialization Start (EMAIL-FIRST Backend) ---')
      dispatch({ type: 'AUTH_REQUEST' })

      try {
        const token = localStorage.getItem('auth_token')
        const userData = localStorage.getItem('user_data')
        
        console.log('1. Reading from localStorage', { 
          hasToken: !!token, 
          hasUserData: !!userData 
        })

        if (token && userData) {
          console.log('2. Token and user data found. Validating with backend...')
          
          // ✅ Configurar token en apiClient
          apiClient.setAuthToken(token)

          // ✅ Validar token con backend
          const validationResponse = await apiClient.get(API_ENDPOINTS.AUTH.VALIDATE_TOKEN)
          console.log('3. Backend validation response:', validationResponse)

          if (validationResponse && validationResponse.valid) {
            const user: User = JSON.parse(userData)
            
            // ✅ Verificar que el usuario esté activo
            if (!user.isActive) {
              throw new Error('Usuario inactivo. Contacta al administrador.')
            }

            if (isMounted) {
              dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })
              
              console.log('4. ✅ Session restored successfully.')
            }
          } else {
            throw new Error('Token inválido')
          }
        } else {
          console.log('2. No session found in localStorage.')
          if (isMounted) {
            dispatch({ type: 'AUTH_FAILURE', payload: 'No active session' })
          }
        }
      } catch (error: any) {
        console.error('3. ❌ Session validation failed:', error.message)
        
        // ✅ Limpiar datos inválidos
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        apiClient.setAuthToken(null)
        
        if (isMounted) {
          dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired or invalid' })
        }
      } finally {
        if (isMounted) {
          dispatch({ type: 'AUTH_READY' })
        }
        console.log('--- Auth Initialization End ---')
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [])

  /**
   * ✅ Login con backend EMAIL-FIRST
   */
  const login = async (email: string, password: string) => {
    const perfId = logger.startPerformance('email_first_login_flow')
    
    logger.info('🚀 LOGIN FLOW STARTED (EMAIL-FIRST Backend)', {
      email,
      timestamp: new Date().toISOString(),
    }, 'email_first_login_flow_start')
    
    dispatch({ type: 'AUTH_REQUEST' })
    
    try {
      // ✅ Login directo con backend EMAIL-FIRST
      logger.info('🔑 Starting Backend Authentication...', { email }, 'backend_auth_start')
      
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      })
      
      logger.info('✅ Backend Auth successful', {
        hasUser: !!response.user,
        hasToken: !!response.token,
        userEmail: response.user?.email
      }, 'backend_auth_success')

      // ✅ Validar respuesta del backend
      if (!response.user || !response.token) {
        throw new Error('Respuesta del backend inválida: faltan user o token.')
      }

      const { user, token } = response

      // ✅ Verificar que el usuario esté activo
      if (!user.isActive) {
        throw new Error('Tu cuenta está inactiva. Contacta al administrador.')
      }

      // ✅ Guardar datos localmente
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(user))
      
      // ✅ Configurar token en apiClient
      apiClient.setAuthToken(token)

      // ✅ Actualizar contexto
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })
      
      // ✅ Invalidar queries de React Query
      queryClient.invalidateQueries()
      
      logger.endPerformance(perfId, `EMAIL-FIRST login completed for ${email}`)
      
      logger.success('✅ Complete login flow successful', {
        userEmail: user.email,
        userRole: user.role,
        permissions: user.permissions
      }, 'login_complete')

    } catch (error: any) {
      logger.error('❌ COMPLETE LOGIN ERROR', {
        errorType: typeof error,
        errorName: error?.name,
        errorMessage: error?.message,
        errorStatus: error?.status,
        errorResponse: error?.response?.data
      }, 'complete_login_error')

      // ✅ Manejo específico de errores
      let userMessage = 'Error de autenticación.'
      
      if (error?.response?.status === 401) {
        userMessage = 'Credenciales incorrectas. Verifica tu correo y contraseña.'
      } else if (error?.response?.status === 403) {
        userMessage = 'Usuario inactivo. Contacta al administrador.'
      } else if (error?.response?.status >= 500) {
        userMessage = 'Error del servidor. Intenta nuevamente.'
      } else if (error?.message?.includes('inactiva')) {
        userMessage = error.message
      }

      logger.endPerformance(perfId, `Login failed for ${email}: ${userMessage}`)

      dispatch({ type: 'AUTH_FAILURE', payload: userMessage })
      throw new Error(userMessage)
    }
  }

  /**
   * ✅ Logout completo
   */
  const logout = async () => {
    try {
      // ✅ Intentar logout en backend
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      logger.warn('Error during backend logout', error, 'logout_backend_error')
    }

    // ✅ Limpiar estado local
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    
    // ✅ Limpiar apiClient
    apiClient.setAuthToken(null)
    
    // ✅ Limpiar contexto
    dispatch({ type: 'AUTH_LOGOUT' })
    
    // ✅ Limpiar React Query cache
    queryClient.clear()
    
    logger.info('User logged out successfully', {}, 'logout_success')
  }

  /**
   * ✅ Actualizar datos del usuario
   */
  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData }
      
      // ✅ Actualizar localStorage
      localStorage.setItem('user_data', JSON.stringify(updatedUser))
      
      // ✅ Actualizar contexto
      dispatch({ type: 'UPDATE_USER', payload: userData })
      
      logger.info('User data updated', { 
        updatedFields: Object.keys(userData) 
      }, 'user_update')
    }
  }

  /**
   * ✅ Limpiar errores
   */
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * ✅ Hook para usar el contexto de autenticación
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

 