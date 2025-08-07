/**
 * Store de Presencia de Usuarios para UTalk Frontend
 * Maneja estados online/offline/ausente de usuarios en tiempo real
 * 
 * Basado en la documentación backend:
 * - info/1.md sección "🔌 EVENTOS SOCKET.IO ESPECÍFICOS"
 * - info/2.md sección "Eventos de Presencia"
 */

import type { PresenceState, UserPresence } from '$lib/types';
import { logStore } from '$lib/utils/logger';
import { writable } from 'svelte/store';

const createPresenceStore = () => {
    const initialState: PresenceState = {};

    const { subscribe, set, update } = writable<PresenceState>(initialState);

    return {
        subscribe,

        updateUserPresence: (userPresence: UserPresence) => {
            logStore('presence: updateUserPresence', {
                userId: userPresence.userId,
                email: userPresence.email,
                status: userPresence.status,
                isTyping: userPresence.isTyping
            });

            update(state => ({
                ...state,
                [userPresence.userId]: userPresence
            }));
        },

        removeUser: (userId: string) => {
            logStore('presence: removeUser', { userId });

            update(state => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [userId]: _, ...rest } = state;
                return rest;
            });
        },

        clear: () => {
            logStore('presence: clear');
            set(initialState);
        },

        // Función de cleanup específica para logout
        cleanup: () => {
            logStore('presence: cleanup - limpiando estado de presencia');
            set(initialState);
        }
    };
};

export const presenceStore = createPresenceStore(); 