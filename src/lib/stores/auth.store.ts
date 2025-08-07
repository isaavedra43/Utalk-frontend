/**
 * Store de Autenticación Global para UTalk Frontend
 * Maneja el estado de autenticación, hidratación SSR y sincronización con cookies
 *
 * Basado en la documentación backend:
 * - BACKEND_ADVANCED_LOGIC_CORREGIDO.md
 * - BACKEND_ADVANCED_LOGIC.md
 * - DOCUMENTACION_COMPLETA_BACKEND_UTALK.md
 */

import { writable } from 'svelte/store';

// Interfaces basadas en el documento - Documento sección "Modelos JSON"
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'agent' | 'viewer';
  name: string;
  avatar?: string;
  lastSeen?: string;
  isOnline?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

// Crear store de autenticación - Documento: "Store de Autenticación"
const createAuthStore = () => {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,

    // Login - Documento: "Componente de Login"
    login: (user: User, token: string) => {
      localStorage.setItem('token', token);
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    },

    // Logout - Documento: "Logout sincronizado en todas las pestañas"
    logout: () => {
      localStorage.removeItem('token');
      set(initialState);

      // Limpiar socket - Documento: "Limpieza de listeners"
      if (typeof window !== 'undefined') {
        // TODO: Importar y limpiar socketManager
        // socketManager.cleanup();
        // socketManager.disconnect();
      }
    },

    // Actualizar usuario - Documento: "updateUser"
    updateUser: (user: User) => {
      update(state => ({ ...state, user }));
    },

    // Establecer estado de carga
    setLoading: (isLoading: boolean) => {
      update(state => ({ ...state, isLoading }));
    },

    // Establecer error
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },

    // Actualizar tokens - Documento: info/1.5.md sección "Respuesta de Refresh Token"
    updateTokens: (accessToken: string, refreshToken: string) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      update(state => ({ ...state, token: accessToken }));
    },

    // Verificar si el usuario puede enviar mensajes - Documento: "Reglas de Autorización"
    canSendMessages: (state: AuthState): boolean => {
      if (!state.isAuthenticated || !state.user) return false;

      // Viewer no puede enviar mensajes - Documento: "Roles de Usuario"
      if (state.user.role === 'viewer') return false;

      return true;
    },

    // Verificar si el usuario puede ver conversaciones - Documento: "Reglas de Autorización"
    canViewConversations: (state: AuthState): boolean => {
      if (!state.isAuthenticated || !state.user) return false;

      // Viewer no puede ver conversaciones - Documento: "Roles de Usuario"
      if (state.user.role === 'viewer') return false;

      return true;
    },

    // Verificar si el usuario puede editar contactos - Documento: info/1.md sección "Reglas de Autorización"
    canEditContacts: (): boolean => {
      let currentState: AuthState | undefined;
      subscribe(s => currentState = s)();

      if (!currentState?.isAuthenticated || !currentState?.user) return false;

      // Solo admin y agent pueden editar contactos
      return currentState.user.role === 'admin' || currentState.user.role === 'agent';
    },

    // Verificar si el usuario es admin - Documento: "Roles de Usuario"
    isAdmin: (state: AuthState): boolean => {
      return state.user?.role === 'admin';
    },

    // Verificar si el usuario es agente - Documento: "Roles de Usuario"
    isAgent: (state: AuthState): boolean => {
      return state.user?.role === 'agent';
    },

    // Inicializar desde localStorage - Documento: "Logout sincronizado en todas las pestañas"
    initialize: () => {
      const token = localStorage.getItem('token');
      if (token) {
        // TODO: Validar token y obtener información del usuario
        // Por ahora, solo establecer el token
        update(state => ({ ...state, token, isAuthenticated: true }));
      }
    },

    // Sincronizar logout entre pestañas - Documento: "Logout sincronizado en todas las pestañas"
    setupStorageListener: () => {
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', (event) => {
          if (event.key === 'token' && !event.newValue) {
            // Token eliminado en otra pestaña
            set(initialState);
          }
        });
      }
    }
  };
};

export const authStore = createAuthStore();
