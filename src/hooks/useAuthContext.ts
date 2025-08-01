// Hook useAuth separado para evitar conflictos con Fast Refresh
import { useContext } from 'react'
import { createContext } from 'react'
import { User, AuthState } from '@/contexts/auth-types'

// Contexto de autenticación alineado con backend UTalk
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void> // Backend JWT
  logout: () => Promise<void> // Logout backend
  updateUser: (userData: Partial<User>) => void // Actualizar datos locales
  // NOTA: No hay register - usuarios creados por admin en backend
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext }

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}