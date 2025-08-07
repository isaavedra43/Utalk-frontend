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

import { writable } from 'svelte/store';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number; // en milisegundos, 0 = permanente
    timestamp: number;
    dismissed?: boolean;
}

interface NotificationsState {
    notifications: Notification[];
}

const createNotificationsStore = () => {
    const { subscribe, update } = writable<NotificationsState>({
        notifications: []
    });

    return {
        subscribe,

        // Agregar notificación
        add: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
            const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            const newNotification: Notification = {
                ...notification,
                id,
                timestamp: Date.now()
            };

            update(state => ({
                ...state,
                notifications: [...state.notifications, newNotification]
            }));

            // Auto-dismiss si tiene duración
            if (notification.duration && notification.duration > 0) {
                setTimeout(() => {
                    // Usar referencia directa al método remove
                    update(state => ({
                        ...state,
                        notifications: state.notifications.filter(n => n.id !== id)
                    }));
                }, notification.duration);
            }
        },

        // Remover notificación
        remove: (id: string) => {
            update(state => ({
                ...state,
                notifications: state.notifications.filter(n => n.id !== id)
            }));
        },

        // Marcar como descartada
        dismiss: (id: string) => {
            update(state => ({
                ...state,
                notifications: state.notifications.map(n =>
                    n.id === id ? { ...n, dismissed: true } : n
                )
            }));
        },

        // Limpiar todas las notificaciones
        clear: () => {
            update(state => ({
                ...state,
                notifications: []
            }));
        },

        // Métodos de conveniencia por tipo
        success: (message: string, duration?: number) => {
            const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            const newNotification: Notification = {
                type: 'success',
                message,
                duration,
                id,
                timestamp: Date.now()
            };

            update(state => ({
                ...state,
                notifications: [...state.notifications, newNotification]
            }));

            // Auto-dismiss si tiene duración
            if (duration && duration > 0) {
                setTimeout(() => {
                    update(state => ({
                        ...state,
                        notifications: state.notifications.filter(n => n.id !== id)
                    }));
                }, duration);
            }
        },

        error: (message: string, duration?: number) => {
            const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            const newNotification: Notification = {
                type: 'error',
                message,
                duration,
                id,
                timestamp: Date.now()
            };

            update(state => ({
                ...state,
                notifications: [...state.notifications, newNotification]
            }));

            // Auto-dismiss si tiene duración
            if (duration && duration > 0) {
                setTimeout(() => {
                    update(state => ({
                        ...state,
                        notifications: state.notifications.filter(n => n.id !== id)
                    }));
                }, duration);
            }
        },

        warning: (message: string, duration?: number) => {
            const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            const newNotification: Notification = {
                type: 'warning',
                message,
                duration,
                id,
                timestamp: Date.now()
            };

            update(state => ({
                ...state,
                notifications: [...state.notifications, newNotification]
            }));

            // Auto-dismiss si tiene duración
            if (duration && duration > 0) {
                setTimeout(() => {
                    update(state => ({
                        ...state,
                        notifications: state.notifications.filter(n => n.id !== id)
                    }));
                }, duration);
            }
        },

        info: (message: string, duration?: number) => {
            const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            const newNotification: Notification = {
                type: 'info',
                message,
                duration,
                id,
                timestamp: Date.now()
            };

            update(state => ({
                ...state,
                notifications: [...state.notifications, newNotification]
            }));

            // Auto-dismiss si tiene duración
            if (duration && duration > 0) {
                setTimeout(() => {
                    update(state => ({
                        ...state,
                        notifications: state.notifications.filter(n => n.id !== id)
                    }));
                }, duration);
            }
        },

        // Obtener notificaciones activas (no descartadas)
        getActive: () => {
            let currentState: NotificationsState | undefined;
            subscribe(s => currentState = s)();
            return currentState?.notifications.filter(n => !n.dismissed) || [];
        },

        // Obtener notificaciones por tipo
        getByType: (type: Notification['type']) => {
            let currentState: NotificationsState | undefined;
            subscribe(s => currentState = s)();
            return currentState?.notifications.filter(n => n.type === type && !n.dismissed) || [];
        }
    };
};

export const notificationsStore = createNotificationsStore(); 