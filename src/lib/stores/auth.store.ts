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

const createAuthStore = () => {
  const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false
  };

  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,

    login: (user: User, token: string) => {
      logStore('auth: login', {
        userId: user.id,
        userEmail: user.email,
        userRole: user.role
      });

      localStorage.setItem('token', token);
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

      localStorage.setItem('token', token);
      update(state => ({ ...state, token }));
    },

    clear: () => {
      logStore('auth: clear');
      set(initialState);
    },

    // Función para validar si el token existe y no ha expirado
    validateToken: (): boolean => {
      const token = localStorage.getItem('token');
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

    // Función para inicializar desde localStorage
    initialize: () => {
      const token = localStorage.getItem('token');
      if (token && authStore.validateToken()) {
        logStore('auth: inicializando desde localStorage');
        update(state => ({ ...state, token, isAuthenticated: true }));
      } else {
        logStore('auth: no hay token válido en localStorage');
        authStore.clear();
      }
    }
  };
};

export const authStore = createAuthStore();
