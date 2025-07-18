// Hook useAuth separado para evitar conflictos con Fast Refresh
import { useContext } from 'react'
import { createContext } from 'react'
import { User, AuthState } from '@/contexts/auth-types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
  updateUser: (userData: Partial<User>) => void
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