// Contexto global de autenticación
// Manejo del estado de usuario, login, logout y protección de rutas
import { useReducer, useEffect } from 'react'
import apiClient from '@/services/apiClient'
import {
  User,
  authReducer,
  initialState,
} from './auth-types'
import { AuthContext } from '@/hooks/useAuthContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Verificar token existente al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })
      } catch (error) {
        // Token o datos corruptos, limpiar
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        dispatch({ type: 'AUTH_FAILURE', payload: 'Sesión inválida' })
      }
    } else {
      dispatch({ type: 'AUTH_FAILURE', payload: '' })
    }
  }, [])

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_REQUEST' })
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const { user, token } = response

      // Guardar en localStorage
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(user))

      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error de autenticación'
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      throw error
    }
  }

  const register = async (userData: any) => {
    dispatch({ type: 'AUTH_REQUEST' })
    try {
      const response = await apiClient.post('/auth/register', userData)
      const { user, token } = response

      // Guardar en localStorage
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(user))

      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error de registro'
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      throw error
    }
  }

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')

    dispatch({ type: 'AUTH_LOGOUT' })
  }

  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData }
      localStorage.setItem('user_data', JSON.stringify(updatedUser))
      dispatch({ type: 'UPDATE_USER', payload: userData })
    }
  }

  const contextValue = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

 