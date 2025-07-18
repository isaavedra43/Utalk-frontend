// Contexto global de autenticación
// Manejo del estado de usuario, login, logout y protección de rutas
import { useReducer, useEffect } from 'react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import apiClient from '@/services/apiClient'
import {
  User,
  authReducer,
  initialState,
} from './auth-types'
import { AuthContext } from '@/hooks/useAuthContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  /**
   * Inicialización de autenticación al cargar la app
   * Verifica si hay token en localStorage y valida con backend
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token')

      if (token) {
        try {
          // Verificar sesión con backend UTalk (GET /api/auth/me)
          const user = await apiClient.get('/auth/me')
          dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })
        } catch (error: any) {
          // Token inválido, expirado o usuario inactivo
          console.warn('Sesión inválida, limpiando estado:', error.response?.status)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
          dispatch({ type: 'AUTH_FAILURE', payload: 'Sesión expirada' })
        }
      } else {
        // No hay token, usuario no autenticado
        dispatch({ type: 'AUTH_FAILURE', payload: '' })
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
    dispatch({ type: 'AUTH_REQUEST' })
    try {
      // 1. Autenticar con Firebase Auth
      const firebaseUser = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await firebaseUser.user.getIdToken()

      // 2. Enviar idToken al backend UTalk
      const response = await apiClient.post('/auth/login', { idToken })
      const { user, token } = response

      // 3. Guardar en localStorage (para persistencia)
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(user))

      // 4. Actualizar contexto
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })
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
      } else if (error.response) {
        // Error del backend UTalk
        message = error.response.data?.message || 'Error del servidor'
      }

      dispatch({ type: 'AUTH_FAILURE', payload: message })
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
    try {
      // 1. Invalidar sesión en backend UTalk
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.warn('Error al hacer logout en backend UTalk:', error)
      // Continúa con logout local aunque falle el backend
    }

    try {
      // 2. Cerrar sesión en Firebase Auth
      await signOut(auth)
    } catch (error) {
      console.warn('Error al hacer logout en Firebase:', error)
      // Continúa con logout local aunque falle Firebase
    }

    // 3. Limpiar localStorage y contexto (siempre ejecutar)
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
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

 