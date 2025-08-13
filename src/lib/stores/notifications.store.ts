/**
 * Store de Notificaciones para UTalk Frontend
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "📋 Fase 5: Manejo de Errores y Estados Especiales"
 *
 * Características:
 * - Notificaciones temporales y permanentes
 * - Tipos: success, error, warning, info
 * - Auto-dismiss con duración configurable
 * - Gestión de múltiples notificaciones simultáneas
 */

import type { Notification, NotificationsState } from '$lib/types';
import { logStore } from '$lib/utils/logger';
import { writable } from 'svelte/store';

const createNotificationsStore = () => {
  const initialState: NotificationsState = {
    notifications: []
  };

  const { subscribe, update } = writable<NotificationsState>(initialState);

  return {
    subscribe,

    add: (notification: Omit<Notification, 'id'>) => {
      const id = Date.now().toString();
      const newNotification: Notification = {
        ...notification,
        id,
        dismissed: false
      };

      logStore('notifications: add', {
        id: newNotification.id,
        type: newNotification.type,
        message: newNotification.message
      });

      update(state => ({
        ...state,
        notifications: [...state.notifications, newNotification]
      }));

      // Auto-remove after duration
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          notificationsStore.remove(id);
        }, notification.duration);
      }
    },

    remove: (id: string) => {
      logStore('notifications: remove', { id });

      update(state => ({
        ...state,
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    },

    dismiss: (id: string) => {
      logStore('notifications: dismiss', { id });

      update(state => ({
        ...state,
        notifications: state.notifications.map(n => (n.id === id ? { ...n, dismissed: true } : n))
      }));
    },

    success: (message: string, duration?: number) => {
      notificationsStore.add({ type: 'success', message, duration });
    },

    error: (message: string, duration?: number) => {
      notificationsStore.add({ type: 'error', message, duration });
    },

    warning: (message: string, duration?: number) => {
      notificationsStore.add({ type: 'warning', message, duration });
    },

    info: (message: string, duration?: number) => {
      notificationsStore.add({ type: 'info', message, duration });
    },

    clear: () => {
      logStore('notifications: clear');
      update(state => ({ ...state, notifications: [] }));
    },

    // Función de cleanup específica para logout
    cleanup: () => {
      logStore('notifications: cleanup - limpiando notificaciones');
      update(state => ({ ...state, notifications: [] }));
    }
  };
};

export const notificationsStore = createNotificationsStore();
