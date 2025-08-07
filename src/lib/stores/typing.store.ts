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

import { writable } from 'svelte/store';

export interface TypingUser {
    userEmail: string;
    userName: string;
    startedAt: number;
}

export interface TypingState {
    [conversationId: string]: TypingUser[];
}

const createTypingStore = () => {
    const { subscribe, update, set } = writable<TypingState>({});

    // Timeout para limpiar indicadores de escritura
    const typingTimeouts: { [key: string]: NodeJS.Timeout } = {};

    return {
        subscribe,

        // Agregar usuario escribiendo
        addTypingUser: (conversationId: string, userEmail: string, userName: string) => {
            update(state => {
                const conversation = state[conversationId] || [];
                const existingUserIndex = conversation.findIndex(user => user.userEmail === userEmail);

                if (existingUserIndex >= 0) {
                    // Actualizar usuario existente
                    conversation[existingUserIndex] = {
                        userEmail,
                        userName,
                        startedAt: Date.now()
                    };
                } else {
                    // Agregar nuevo usuario
                    conversation.push({
                        userEmail,
                        userName,
                        startedAt: Date.now()
                    });
                }

                // Limpiar timeout anterior si existe
                const timeoutKey = `${conversationId}-${userEmail}`;
                if (typingTimeouts[timeoutKey]) {
                    clearTimeout(typingTimeouts[timeoutKey]);
                }

                // Configurar auto-cleanup después de 3 segundos
                typingTimeouts[timeoutKey] = setTimeout(() => {
                    // Usar referencia directa al método removeTypingUser
                    update(state => {
                        const conversation = state[conversationId] || [];
                        const filteredConversation = conversation.filter(user => user.userEmail !== userEmail);

                        // Limpiar timeout
                        const timeoutKey = `${conversationId}-${userEmail}`;
                        if (typingTimeouts[timeoutKey]) {
                            clearTimeout(typingTimeouts[timeoutKey]);
                            delete typingTimeouts[timeoutKey];
                        }

                        if (filteredConversation.length === 0) {
                            // Si no hay usuarios escribiendo, remover la conversación
                            const { [conversationId]: removed, ...rest } = state;
                            return rest;
                        }

                        return {
                            ...state,
                            [conversationId]: filteredConversation
                        };
                    });
                }, 3000);

                return {
                    ...state,
                    [conversationId]: conversation
                };
            });
        },

        // Remover usuario escribiendo
        removeTypingUser: (conversationId: string, userEmail: string) => {
            update(state => {
                const conversation = state[conversationId] || [];
                const filteredConversation = conversation.filter(user => user.userEmail !== userEmail);

                // Limpiar timeout
                const timeoutKey = `${conversationId}-${userEmail}`;
                if (typingTimeouts[timeoutKey]) {
                    clearTimeout(typingTimeouts[timeoutKey]);
                    delete typingTimeouts[timeoutKey];
                }

                if (filteredConversation.length === 0) {
                    // Si no hay usuarios escribiendo, remover la conversación
                    const { [conversationId]: removed, ...rest } = state;
                    return rest;
                }

                return {
                    ...state,
                    [conversationId]: filteredConversation
                };
            });
        },

        // Obtener usuarios escribiendo en una conversación
        getTypingUsers: (conversationId: string): TypingUser[] => {
            let currentState: TypingState | undefined;
            subscribe(s => currentState = s)();
            return currentState?.[conversationId] || [];
        },

        // Verificar si hay usuarios escribiendo
        isAnyoneTyping: (conversationId: string): boolean => {
            let currentState: TypingState | undefined;
            subscribe(s => currentState = s)();
            const users = currentState?.[conversationId] || [];
            return users.length > 0;
        },

        // Limpiar todos los indicadores de una conversación
        clearConversation: (conversationId: string) => {
            update(state => {
                const { [conversationId]: removed, ...rest } = state;

                // Limpiar todos los timeouts de esta conversación
                Object.keys(typingTimeouts).forEach(key => {
                    if (key.startsWith(conversationId)) {
                        clearTimeout(typingTimeouts[key]);
                        delete typingTimeouts[key];
                    }
                });

                return rest;
            });
        },

        // Limpiar todos los indicadores
        clearAll: () => {
            // Limpiar todos los timeouts
            Object.values(typingTimeouts).forEach(timeout => {
                clearTimeout(timeout);
            });

            set({});
        },

        // Obtener texto de indicador de escritura
        getTypingText: (conversationId: string): string => {
            let currentState: TypingState | undefined;
            subscribe(s => currentState = s)();
            const users = currentState?.[conversationId] || [];

            if (users.length === 0) {
                return '';
            }

            if (users.length === 1) {
                return `${users[0].userName} está escribiendo...`;
            }

            if (users.length === 2) {
                return `${users[0].userName} y ${users[1].userName} están escribiendo...`;
            }

            return `${users[0].userName} y ${users.length - 1} más están escribiendo...`;
        }
    };
};

export const typingStore = createTypingStore(); 