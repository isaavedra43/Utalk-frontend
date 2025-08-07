/**
 * Store de Presencia de Usuarios para UTalk Frontend
 * Maneja estados online/offline/ausente de usuarios en tiempo real
 * 
 * Basado en la documentación backend:
 * - info/1.md sección "🔌 EVENTOS SOCKET.IO ESPECÍFICOS"
 * - info/2.md sección "Eventos de Presencia"
 */

import { writable } from 'svelte/store';

// Interfaces basadas en el documento - Documento: info/1.5.md sección "Modelos JSON"
export interface UserPresence {
    userId: string;
    email: string;
    name: string;
    status: 'online' | 'offline' | 'away' | 'busy';
    lastSeen?: string;
    isTyping?: boolean;
    currentConversationId?: string | undefined;
}

export interface PresenceState {
    users: { [userId: string]: UserPresence };
    onlineCount: number;
    awayCount: number;
    busyCount: number;
    offlineCount: number;
}

// Estado inicial
const initialState: PresenceState = {
    users: {},
    onlineCount: 0,
    awayCount: 0,
    busyCount: 0,
    offlineCount: 0
};

// Crear store de presencia - Documento: info/2.md sección "Eventos de Presencia"
const createPresenceStore = () => {
    const { subscribe, set, update } = writable<PresenceState>(initialState);

    return {
        subscribe,

        // Actualizar presencia de usuario - Documento: info/1.md sección "USER_PRESENCE"
        updateUserPresence: (userPresence: UserPresence) => {
            update(state => {
                const newUsers = { ...state.users };

                // Actualizar usuario
                newUsers[userPresence.userId] = userPresence;

                // Recalcular contadores
                let onlineCount = 0, awayCount = 0, busyCount = 0, offlineCount = 0;

                Object.values(newUsers).forEach(user => {
                    switch (user.status) {
                        case 'online':
                            onlineCount++;
                            break;
                        case 'away':
                            awayCount++;
                            break;
                        case 'busy':
                            busyCount++;
                            break;
                        case 'offline':
                            offlineCount++;
                            break;
                    }
                });

                return {
                    users: newUsers,
                    onlineCount,
                    awayCount,
                    busyCount,
                    offlineCount
                };
            });
        },

        // Actualizar estado de escritura - Documento: info/1.md sección "TYPING_INDICATOR"
        updateTypingStatus: (userId: string, isTyping: boolean, conversationId?: string) => {
            update(state => {
                const user = state.users[userId];
                if (user) {
                    const updatedUsers = { ...state.users };
                    updatedUsers[userId] = {
                        ...user,
                        isTyping,
                        currentConversationId: isTyping ? conversationId : user.currentConversationId
                    };
                    return { ...state, users: updatedUsers };
                }
                return state;
            });
        },

        // Obtener presencia de usuario específico
        getUserPresence: (userId: string): UserPresence | null => {
            let currentState: PresenceState | undefined;
            subscribe(s => currentState = s)();
            return currentState?.users[userId] || null;
        },

        // Obtener usuarios online
        getOnlineUsers: (): UserPresence[] => {
            let currentState: PresenceState | undefined;
            subscribe(s => currentState = s)();
            return Object.values(currentState?.users || {}).filter(user => user.status === 'online');
        },

        // Obtener usuarios escribiendo en una conversación
        getTypingUsers: (conversationId: string): UserPresence[] => {
            let currentState: PresenceState | undefined;
            subscribe(s => currentState = s)();
            return Object.values(currentState?.users || {}).filter(user =>
                user.isTyping && user.currentConversationId === conversationId
            );
        },

        // Limpiar estado de escritura para un usuario
        clearTypingStatus: (userId: string) => {
            update(state => {
                const user = state.users[userId];
                if (user) {
                    const updatedUsers = { ...state.users };
                    updatedUsers[userId] = {
                        ...user,
                        isTyping: false,
                        currentConversationId: undefined
                    };
                    return { ...state, users: updatedUsers };
                }
                return state;
            });
        },

        // Limpiar todo el estado
        clear: () => {
            set(initialState);
        }
    };
};

export const presenceStore = createPresenceStore(); 