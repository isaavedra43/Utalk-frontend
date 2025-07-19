// Types y helpers para AuthContext
// Archivo separado para evitar conflictos con Fast Refresh

// Estructura User alineada con el backend UTalk
export interface User {
  id: string              // Firebase UID
  email: string           // Email del usuario
  name: string            // Nombre completo
  role: 'admin' | 'agent' | 'viewer'  // Roles del backend
  status: 'active' | 'inactive'       // Estado del usuario
  avatar?: string         // URL del avatar (opcional)
  createdAt: string       // Timestamp de creación
  updatedAt?: string      // Timestamp de última actualización
  performance?: {         // KPIs del usuario (backend)
    totalMessages?: number
    avgResponseTime?: number
    customerSatisfaction?: number
  }
}

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  isAuthReady: boolean // ✅ NUEVO: Indica si la comprobación inicial ha terminado
  user: User | null
  token: string | null
  error: string | null
}

export type AuthAction =
  | { type: 'AUTH_REQUEST' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' }
  | { type: 'AUTH_READY' } // ✅ NUEVO: Acción para indicar que la auth está lista

export const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true, // Empieza en true hasta que se verifique la sesión
  isAuthReady: false, // ✅ NUEVO: Inicia en false
  user: null,
  token: null,
  error: null
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_REQUEST':
      return { ...state, isLoading: true, error: null }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        isAuthReady: true, // ✅ Se vuelve true con el éxito
        user: action.payload.user,
        token: action.payload.token,
        error: null
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        isAuthReady: true, // ✅ Se vuelve true también en fallo
        user: null,
        token: null,
        error: action.payload
      }
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'AUTH_READY': // ✅ NUEVO: Manejar la acción para marcar la auth como lista
      return {
        ...state,
        isLoading: false,
        isAuthReady: true,
      }
    default:
      return state
  }
} 