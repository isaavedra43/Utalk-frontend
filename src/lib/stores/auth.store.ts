/**
 * Store de Autenticación Global para UTalk Frontend
 * Maneja el estado de autenticación, hidratación SSR y sincronización con cookies
 *
 * Basado en la documentación backend:
 * - BACKEND_ADVANCED_LOGIC_CORREGIDO.md
 * - BACKEND_ADVANCED_LOGIC.md
 * - DOCUMENTACION_COMPLETA_BACKEND_UTALK.md
 */

import type { User } from '$lib/types/auth';
import { browser } from '$lib/utils/browser';
import type { RequestEvent } from '@sveltejs/kit';
import { derived, writable } from 'svelte/store';

// Tipos basados en la documentación del backend
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Estado inicial del store
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
};

// Store principal de autenticación
function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,

    /**
     * Función para inicializar el store desde el servidor (SSR)
     * Lee la información del usuario desde cookies HttpOnly
     *
     * @param event - RequestEvent de SvelteKit con acceso a cookies
     */
    initFromServer: (event: RequestEvent) => {
      try {
        // Leer información del usuario desde cookie (NO sensible)
        const userInfoCookie = event.cookies.get('user_info');

        if (userInfoCookie) {
          const userData = JSON.parse(userInfoCookie) as User;

          // Verificar que tenemos los datos mínimos requeridos
          if (userData.email && userData.name && userData.role) {
            set({
              user: userData,
              loading: false,
              error: null
            });

            // Establecer usuario en locals para SSR
            event.locals.user = {
              email: userData.email,
              name: userData.name,
              role: userData.role as User['role'],
              permissions: userData.permissions || [],
              isAuthenticated: true
            };
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error al inicializar auth store desde servidor:', error);
        set({
          user: null,
          loading: false,
          error: 'Error al cargar información del usuario'
        });
      }
    },

    /**
     * Función para inicializar el store desde el cliente (hidratación)
     * Lee la información del usuario desde cookies accesibles
     */
    initFromClient: () => {
      if (!browser) return;

      try {
        // En el cliente, leer desde document.cookie la info del usuario (NO sensible)
        const cookies = document.cookie.split(';').reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            if (key && value) {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, string>
        );

        const userInfoCookie = cookies['user_info'];

        if (userInfoCookie) {
          const userData = JSON.parse(decodeURIComponent(userInfoCookie)) as User;

          if (userData.email && userData.name && userData.role) {
            set({
              user: userData,
              loading: false,
              error: null
            });
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error al inicializar auth store desde cliente:', error);
        set({
          user: null,
          loading: false,
          error: 'Error al cargar información del usuario'
        });
      }
    },

    /**
     * Función para actualizar el usuario después de login exitoso
     * Se llama desde el servidor después de establecer las cookies
     *
     * @param user - Datos del usuario recibidos del backend
     */
    login: (user: User) => {
      set({
        user,
        loading: false,
        error: null
      });
    },

    /**
     * Función para limpiar el estado y realizar logout
     * Borra las cookies y limpia el store
     */
    logout: async () => {
      try {
        // Limpiar el store inmediatamente
        set({
          user: null,
          loading: false,
          error: null
        });

        if (browser) {
          // Hacer request al servidor para limpiar cookies
          // El endpoint manejará la limpieza de cookies HttpOnly
          await globalThis.fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include' // Incluir cookies en la request
          });

          // Limpiar cookies accesibles desde cliente
          document.cookie =
            'user_info=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; SameSite=Lax';

          // Redirigir a login
          window.location.href = '/login';
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error durante logout:', error);
        // Aún así limpiar el estado local
        set({
          user: null,
          loading: false,
          error: 'Error durante logout, pero sesión local limpiada'
        });
      }
    },

    /**
     * Función para establecer estado de loading
     */
    setLoading: (loading: boolean) => {
      update(state => ({ ...state, loading }));
    },

    /**
     * Función para establecer error
     */
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },

    /**
     * Función para limpiar error
     */
    clearError: () => {
      update(state => ({ ...state, error: null }));
    }
  };
}

// Instancia del store
export const authStore = createAuthStore();

// Stores derivados para acceso fácil a propiedades específicas
export const isAuthenticated = derived(authStore, $auth => $auth.user !== null);

export const currentUser = derived(authStore, $auth => $auth.user);

export const authLoading = derived(authStore, $auth => $auth.loading);

export const authError = derived(authStore, $auth => $auth.error);

/**
 * Función helper para verificar permisos del usuario
 * Basada en la jerarquía de roles del backend
 */
export function hasPermission(requiredRole: string): boolean {
  let currentState: AuthState = initialState;

  // Suscribirse sincrónicamente para obtener el valor actual
  const unsubscribe = authStore.subscribe(state => {
    currentState = state;
  });
  unsubscribe();

  if (!currentState.user) return false;

  // Jerarquía de roles según documentación backend (línea 383-389)
  const roleHierarchy = ['viewer', 'agent', 'admin', 'superadmin'];
  const userRoleIndex = roleHierarchy.indexOf(currentState.user.role);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

  // Usuario tiene el rol requerido o uno superior
  return userRoleIndex >= requiredRoleIndex;
}

/**
 * Función helper para verificar permisos específicos
 */
export function hasSpecificPermission(permission: string): boolean {
  let currentState: AuthState = initialState;

  const unsubscribe = authStore.subscribe(state => {
    currentState = state;
  });
  unsubscribe();

  if (!currentState.user) return false;

  return currentState.user.permissions?.includes(permission) ?? false;
}

/**
 * Función para inicializar el store automáticamente en el cliente
 */
if (browser) {
  // Hidratación automática en el cliente
  authStore.initFromClient();
}
