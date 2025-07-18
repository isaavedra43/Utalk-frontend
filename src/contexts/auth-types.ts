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
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export type AuthAction =
  | { type: 'AUTH_REQUEST' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' }

export const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_REQUEST':
      return { ...state, isLoading: true, error: null }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
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
    default:
      return state
  }
} 