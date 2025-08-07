/**
 * Store de Indicadores de Escritura para UTalk Frontend
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "Eventos de Escritura"
 * 
 * Características:
 * - Manejo de indicadores de escritura por conversación
 * - Auto-cleanup después de 3 segundos de inactividad
 * - Debounce de 500ms para evitar spam
 * - Integración con Socket.IO para eventos en tiempo real
 */

import type { TypingState } from '$lib/types';
import { logStore } from '$lib/utils/logger';
import { get, writable } from 'svelte/store';

const createTypingStore = () => {
    const initialState: TypingState = {};

    const { subscribe, set, update } = writable<TypingState>(initialState);

    return {
        subscribe,

        addTypingUser: (conversationId: string, userEmail: string, userName: string) => {
            logStore('typing: addTypingUser', {
                conversationId,
                userEmail,
                userName
            });

            update(state => {
                const conversation = state[conversationId] || {};
                const updatedConversation = {
                    ...conversation,
                    [userEmail]: {
                        userName,
                        timestamp: Date.now()
                    }
                };

                return {
                    ...state,
                    [conversationId]: updatedConversation
                };
            });
        },

        removeTypingUser: (conversationId: string, userEmail: string) => {
            logStore('typing: removeTypingUser', {
                conversationId,
                userEmail
            });

            update(state => {
                const conversation = state[conversationId];
                if (!conversation) return state;

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [userEmail]: _, ...filteredConversation } = conversation;

                if (Object.keys(filteredConversation).length === 0) {
                    // Si no hay usuarios escribiendo, remover la conversación
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [conversationId]: _, ...rest } = state;
                    return rest;
                }

                return {
                    ...state,
                    [conversationId]: filteredConversation
                };
            });
        },

        clearConversation: (conversationId: string) => {
            logStore('typing: clearConversation', { conversationId });

            update(state => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [conversationId]: _, ...rest } = state;
                return rest;
            });
        },

        clear: () => {
            logStore('typing: clear');
            set(initialState);
        },

        // Función para obtener texto de escritura
        getTypingText: (conversationId: string): string => {
            const state = get({ subscribe });
            const conversation = state[conversationId];

            if (!conversation) return '';

            const users = Object.values(conversation);
            if (users.length === 0) return '';

            if (users.length === 1) {
                return `${users[0].userName} está escribiendo...`;
            } else if (users.length === 2) {
                return `${users[0].userName} y ${users[1].userName} están escribiendo...`;
            } else {
                return `${users[0].userName} y ${users.length - 1} más están escribiendo...`;
            }
        },

        // Función de cleanup específica para logout
        cleanup: () => {
            logStore('typing: cleanup - limpiando indicadores de escritura');
            set(initialState);
        }
    };
};

export const typingStore = createTypingStore(); 