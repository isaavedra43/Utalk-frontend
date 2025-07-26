// Types y helpers para AuthContext
// ✅ ALINEADO CON UID DE FIREBASE + FIRESTORE SYNC
// Archivo separado para evitar conflictos con Fast Refresh

// ✅ ACTUALIZADA: Estructura User completa con metadata de Firestore
export interface User {
  // ✅ CRÍTICO: Firebase UID como identificador único
  uid: string             // Firebase UID (identificador principal)
  id?: string             // Legacy field, será igual a uid
  
  // ✅ Información básica de Firebase Auth
  email: string           // Email del usuario
  displayName?: string    // Nombre de Firebase Auth
  emailVerified: boolean  // Verificación de email
  
  // ✅ Metadata de Firestore (fuente de verdad para roles y permisos)
  firestoreData: {
    name: string                    // Nombre completo desde Firestore
    role: 'admin' | 'agent' | 'viewer' | 'supervisor'  // Rol desde Firestore
    permissions: string[]           // Array de permisos específicos
    status: 'active' | 'inactive' | 'suspended'        // Estado del usuario
    avatar?: string                 // URL del avatar
    phone?: string                  // Teléfono (solo para display)
    department?: string             // Departamento
    
    // ✅ Configuración del usuario
    preferences: {
      language: string              // Idioma preferido
      timezone: string              // Zona horaria
      theme: 'light' | 'dark' | 'auto'  // Tema preferido
      notifications: {
        email: boolean
        push: boolean
        desktop: boolean
      }
    }
    
    // ✅ KPIs y estadísticas
    performance: {
      totalMessages: number
      totalConversations: number
      avgResponseTime: number       // En minutos
      customerSatisfaction: number  // Rating promedio
      lastActivity: string          // ISO timestamp
    }
    
    // ✅ Timestamps
    createdAt: string               // Timestamp de creación
    updatedAt: string               // Timestamp de última actualización
    lastLoginAt?: string            // Último login
    
    // ✅ Metadata adicional
    isOnline: boolean               // Estado de conexión
    currentConversations: string[]  // IDs de conversaciones activas
    assignedCampaigns: string[]     // IDs de campañas asignadas
  }
  
  // ✅ Estado de sincronización
  syncStatus: {
    isFirestoreUser: boolean        // Si existe en Firestore
    lastSyncAt: string              // Última sincronización
    needsSync: boolean              // Si necesita re-sincronizar
  }
}

// ✅ ACTUALIZADA: AuthState con soporte para sincronización
export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  isAuthReady: boolean            // Si la comprobación inicial ha terminado
  isSyncing: boolean              // ✅ NUEVO: Si está sincronizando con Firestore
  user: User | null
  token: string | null
  error: string | null
  
  // ✅ NUEVOS: Estados específicos de sincronización
  syncError: string | null        // Errores de sincronización Firestore
  requiresApproval: boolean       // Si el usuario necesita aprobación admin
}

// ✅ ACTUALIZADA: AuthAction con acciones de sincronización
export type AuthAction =
  | { type: 'AUTH_REQUEST' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' }
  | { type: 'AUTH_READY' }
  | { type: 'SYNC_START' }                                    // ✅ NUEVO: Iniciar sync
  | { type: 'SYNC_SUCCESS'; payload: { firestoreData: any } } // ✅ NUEVO: Sync exitoso
  | { type: 'SYNC_FAILURE'; payload: string }                 // ✅ NUEVO: Error de sync
  | { type: 'REQUIRES_APPROVAL'; payload: string }            // ✅ NUEVO: Necesita aprobación

// ✅ ACTUALIZADO: Estado inicial
export const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  isAuthReady: false,
  isSyncing: false,              // ✅ NUEVO
  user: null,
  token: null,
  error: null,
  syncError: null,               // ✅ NUEVO
  requiresApproval: false        // ✅ NUEVO
}

// ✅ ACTUALIZADA: Interfaz del contexto
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  syncWithFirestore: () => Promise<void>     // ✅ NUEVO: Método para re-sincronizar
  clearSyncError: () => void                 // ✅ NUEVO: Limpiar errores de sync
}

// ✅ ACTUALIZADO: Reducer con manejo de sincronización
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_REQUEST':
      return { ...state, isLoading: true, error: null }
      
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        isAuthReady: true,
        isSyncing: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
        syncError: null,
        requiresApproval: false
      }
      
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        isAuthReady: true,
        isSyncing: false,
        user: null,
        token: null,
        error: action.payload,
        requiresApproval: false
      }
      
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isSyncing: false,
        error: null,
        syncError: null,
        requiresApproval: false
      }
      
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      }
      
    case 'CLEAR_ERROR':
      return { ...state, error: null, syncError: null }
      
    case 'AUTH_READY':
      return {
        ...state,
        isLoading: false,
        isAuthReady: true,
      }
      
    // ✅ NUEVOS: Casos de sincronización
    case 'SYNC_START':
      return {
        ...state,
        isSyncing: true,
        syncError: null
      }
      
    case 'SYNC_SUCCESS':
      return {
        ...state,
        isSyncing: false,
        syncError: null,
        user: state.user ? {
          ...state.user,
          firestoreData: action.payload.firestoreData,
          syncStatus: {
            isFirestoreUser: true,
            lastSyncAt: new Date().toISOString(),
            needsSync: false
          }
        } : null
      }
      
    case 'SYNC_FAILURE':
      return {
        ...state,
        isSyncing: false,
        syncError: action.payload
      }
      
    case 'REQUIRES_APPROVAL':
      return {
        ...state,
        isLoading: false,
        isAuthReady: true,
        isSyncing: false,
        requiresApproval: true,
        error: action.payload
      }
      
    default:
      return state
  }
} 