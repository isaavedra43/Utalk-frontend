/**
 * Store de Autenticación Global para UTalk Frontend
 * Maneja el estado de autenticación, hidratación SSR y sincronización con cookies
 *
 * Basado en la documentación backend:
 * - BACKEND_ADVANCED_LOGIC_CORREGIDO.md
 * - BACKEND_ADVANCED_LOGIC.md
 * - DOCUMENTACION_COMPLETA_BACKEND_UTALK.md
 */

import type { AuthState, User } from '$lib/types';
import { logStore } from '$lib/utils/logger';
import { get, writable } from 'svelte/store';

// Token en memoria y localStorage
let _token: string | null = null;
const KEY = 'utalk.accessToken';

// Función para obtener token actual
export function getAccessToken(): string | null {
  return _token ?? localStorage.getItem(KEY);
}

// Función para establecer token
export function setAccessToken(t: string) {
  _token = t || null;
  if (t) localStorage.setItem(KEY, t);
  else localStorage.removeItem(KEY);

  logStore('auth: setAccessToken', { hasToken: !!t });
}

// Función para limpiar autenticación
export function clearAuth() {
  setAccessToken('');
  authStore.clear();
}

const createAuthStore = () => {
  const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false
  };

  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,

    login: (user: User, token: string, refreshToken?: string) => {
      logStore('auth: login', {
        userId: user.id,
        userEmail: user.email,
        userRole: user.role
      });

      setAccessToken(token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      set({ user, token, isAuthenticated: true });
    },

    logout: () => {
      logStore('auth: logout - iniciando cleanup global');

      // Importar y ejecutar cleanup global
      import('$lib/services/cleanup.service').then(({ cleanupService }) => {
        cleanupService.performGlobalCleanup();
      });

      // Resetear estado de autenticación inmediatamente
      set(initialState);

      logStore('auth: logout - cleanup global iniciado');
    },

    updateUser: (user: User) => {
      logStore('auth: updateUser', {
        userId: user.id,
        userEmail: user.email,
        userRole: user.role
      });

      update(state => ({ ...state, user }));
    },

    setToken: (token: string) => {
      logStore('auth: setToken');
      setAccessToken(token);
      update(state => ({ ...state, token }));
    },

    getToken: (): string | null => {
      return getAccessToken();
    },

    clear: () => {
      logStore('auth: clear');
      localStorage.removeItem(KEY);
      localStorage.removeItem('refreshToken');
      set(initialState);
    },

    // Función para validar si el token existe y no ha expirado
    validateToken: (): boolean => {
      const token = getAccessToken();
      if (!token) return false;

      try {
        // Decodificar JWT para verificar expiración
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (payload.exp && payload.exp < currentTime) {
          logStore('auth: token expirado', {
            exp: payload.exp,
            currentTime
          });
          return false;
        }

        return true;
      } catch (error) {
        logStore('auth: error validando token', { error: String(error) });
        return false;
      }
    },

    // Función para verificar permisos de edición de contactos
    canEditContacts: (): boolean => {
      const state = get({ subscribe });
      if (!state.user) return false;

      // Solo admin y agent pueden editar contactos
      return state.user.role === 'admin' || state.user.role === 'agent';
    },

    // Función para verificar permisos de envío de mensajes
    canSendMessages: (): boolean => {
      const state = get({ subscribe });
      if (!state.user) return false;

      // Solo admin y agent pueden enviar mensajes
      return state.user.role === 'admin' || state.user.role === 'agent';
    },

    // Función para verificar permisos de asignación de conversaciones
    canAssignConversations: (): boolean => {
      const state = get({ subscribe });
      if (!state.user) return false;

      // Solo admin puede asignar conversaciones
      return state.user.role === 'admin';
    },

    // Función para verificar permisos de gestión de usuarios
    canManageUsers: (): boolean => {
      const state = get({ subscribe });
      if (!state.user) return false;

      // Solo admin puede gestionar usuarios
      return state.user.role === 'admin';
    },

    // Función para verificar permisos de visualización de estadísticas
    canViewStats: (): boolean => {
      const state = get({ subscribe });
      if (!state.user) return false;

      // Solo admin y agent pueden ver estadísticas
      return state.user.role === 'admin' || state.user.role === 'agent';
    },

    // Función para validar sesión con el backend
    validateSession: async () => {
      const token = getAccessToken();
      if (!token) {
        logStore('auth: no hay token en localStorage');
        return false;
      }

      try {
        // Llamar al endpoint de validación de sesión
        const response = await fetch('auth/validate', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          logStore('auth: sesión válida', { userId: userData.user.id });

          // Actualizar el store con los datos del usuario
          update(state => ({
            ...state,
            user: userData.user,
            token,
            isAuthenticated: true
          }));

          return true;
        } else {
          logStore('auth: sesión inválida', { status: response.status });
          authStore.clear();
          return false;
        }
      } catch (error) {
        logStore('auth: error validando sesión', { error: String(error) });
        authStore.clear();
        return false;
      }
    },

    // Función para inicializar desde localStorage
    initialize: async () => {
      const token = getAccessToken();
      if (token && authStore.validateToken()) {
        logStore('auth: inicializando desde localStorage');

        // Intentar validar la sesión con el backend
        const isValid = await authStore.validateSession();

        if (!isValid) {
          logStore('auth: sesión no válida, limpiando');
          authStore.clear();
        }
      } else {
        logStore('auth: no hay token válido en localStorage');
        authStore.clear();
      }
    }
  };
};

export const authStore = createAuthStore();
