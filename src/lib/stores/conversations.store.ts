/**
 * Store de Conversaciones para UTalk Frontend
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "📊 ESTRUCTURAS DE DATOS EXACTAS"
 * 
 * Modelos JSON exactos del backend:
 * - Conversación completa con contact, assignedTo, lastMessage, etc.
 * - Paginación con hasMore, nextCursor, totalResults
 * - Estados: open, pending, resolved, archived
 * - Prioridades: low, normal, high, urgent
 */

import { api } from '$lib/services/axios';
import type {
    Conversation,
    ConversationFilters,
    ConversationsResponse,
    ConversationsState
} from '$lib/types';
import { logApi, logError, logStore } from '$lib/utils/logger';
import { extractApiError, get } from '$lib/utils/store-helpers';
import { writable } from 'svelte/store';

const createConversationsStore = () => {
    const initialState: ConversationsState = {
        conversations: [],
        selectedConversation: null,
        loading: false,
        error: null,
        pagination: null,
        filters: {}
    };

    const { subscribe, set, update } = writable<ConversationsState>(initialState);

    // Mutex para evitar race conditions
    let isUpdating = false;
    const updateQueue: Array<() => void> = [];

    // Función para ejecutar actualizaciones de forma segura
    const executeUpdate = async (updateFn: () => void): Promise<void> => {
        if (isUpdating) {
            // Si hay una actualización en curso, agregar a la cola
            updateQueue.push(updateFn);
            return;
        }

        isUpdating = true;
        try {
            updateFn();
        } finally {
            isUpdating = false;

            // Procesar cola de actualizaciones pendientes
            if (updateQueue.length > 0) {
                const nextUpdate = updateQueue.shift();
                if (nextUpdate) {
                    setTimeout(() => executeUpdate(nextUpdate), 100); // Debounce de 100ms
                }
            }
        }
    };

    return {
        subscribe,

        loadConversations: async (filters: ConversationFilters = {}) => {
            logStore('loadConversations: start', { filters, timestamp: new Date().toISOString() });

            await executeUpdate(() => {
                update(state => ({ ...state, loading: true, error: null }));
            });

            try {
                const params = new URLSearchParams();

                if (filters.page) params.append('page', filters.page.toString());
                if (filters.limit) params.append('limit', filters.limit.toString());
                if (filters.status) params.append('status', filters.status);
                if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
                if (filters.search) params.append('search', filters.search);
                if (filters.priority) params.append('priority', filters.priority);
                if (filters.tags) params.append('tags', filters.tags.join(','));
                if (filters.startDate) params.append('startDate', filters.startDate);
                if (filters.endDate) params.append('endDate', filters.endDate);

                const startTime = performance.now();
                const response = await api.get<ConversationsResponse>(`/conversations?${params.toString()}`);
                const endTime = performance.now();

                logApi('loadConversations: API success', {
                    responseTime: `${(endTime - startTime).toFixed(2)}ms`,
                    conversationCount: response.data.data.length,
                    pagination: response.data.pagination,
                    metadata: response.data.metadata
                });

                await executeUpdate(() => {
                    update(state => ({
                        ...state,
                        conversations: response.data.data,
                        pagination: response.data.pagination || null,
                        filters,
                        loading: false,
                        error: null
                    }));
                });
            } catch (error: unknown) {
                const apiError = extractApiError(error);
                logError('loadConversations: API error', 'CONVERSATIONS', new Error(apiError.message));

                await executeUpdate(() => {
                    update(state => ({
                        ...state,
                        loading: false,
                        error: apiError.message
                    }));
                });
            }
        },

        selectConversation: (conversation: Conversation | null) => {
            logStore('selectConversation', {
                conversationId: conversation?.id,
                conversationStatus: conversation?.status,
                hasAgent: !!conversation?.assignedTo
            });

            executeUpdate(() => {
                update(state => ({ ...state, selectedConversation: conversation }));
            });
        },

        updateConversation: (conversationId: string, updates: Partial<Conversation>) => {
            logStore('updateConversation', {
                conversationId,
                updates: Object.keys(updates)
            });

            executeUpdate(() => {
                update(state => ({
                    ...state,
                    conversations: state.conversations.map(conv =>
                        conv.id === conversationId ? { ...conv, ...updates } : conv
                    ),
                    selectedConversation: state.selectedConversation?.id === conversationId
                        ? { ...state.selectedConversation, ...updates }
                        : state.selectedConversation
                }));
            });
        },

        addMessage: (conversationId: string, message: { id: string; content: string; timestamp: string; sender: { type: string }; type: string; status: string; direction: string }) => {
            logStore('addMessage', {
                conversationId,
                messageId: message.id,
                messageType: message.type,
                messageDirection: message.direction
            });

            executeUpdate(() => {
                update(state => ({
                    ...state,
                    conversations: state.conversations.map(conv => {
                        if (conv.id === conversationId) {
                            return {
                                ...conv,
                                messageCount: conv.messageCount + 1,
                                lastMessage: {
                                    id: message.id,
                                    content: message.content,
                                    timestamp: message.timestamp,
                                    sender: message.sender.type,
                                    type: message.type,
                                    status: message.status
                                },
                                lastMessageId: message.id,
                                lastMessageAt: message.timestamp,
                                unreadCount: message.direction === 'inbound' ? conv.unreadCount + 1 : conv.unreadCount
                            };
                        }
                        return conv;
                    })
                }));
            });
        },

        markConversationAsRead: (conversationId: string) => {
            logStore('markConversationAsRead', { conversationId });

            executeUpdate(() => {
                update(state => ({
                    ...state,
                    conversations: state.conversations.map(conv =>
                        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
                    )
                }));
            });
        },

        loadMoreConversations: async () => {
            const currentState = get(conversationsStore);
            if (!currentState.pagination?.hasMore || currentState.loading) return;

            logStore('loadMoreConversations: start', {
                currentCount: currentState.conversations.length,
                hasMore: currentState.pagination.hasMore
            });

            await executeUpdate(() => {
                update(state => ({ ...state, loading: true }));
            });

            try {
                const params = new URLSearchParams();
                params.append('cursor', currentState.pagination.nextCursor!);
                params.append('limit', currentState.pagination.limit.toString());

                const response = await api.get<ConversationsResponse>(`/conversations?${params.toString()}`);

                await executeUpdate(() => {
                    update(state => ({
                        ...state,
                        conversations: [...state.conversations, ...response.data.data],
                        pagination: response.data.pagination || null,
                        loading: false
                    }));
                });
            } catch (error: unknown) {
                const apiError = extractApiError(error);
                logError('loadMoreConversations: API error', 'CONVERSATIONS', new Error(apiError.message));

                await executeUpdate(() => {
                    update(state => ({
                        ...state,
                        loading: false,
                        error: apiError.message
                    }));
                });
            }
        },

        clear: () => {
            logStore('clear conversations store');
            set(initialState);
        },

        // Función de cleanup específica para logout
        cleanup: () => {
            logStore('conversations: cleanup - limpiando estado');
            set(initialState);
        },

        setError: (error: string) => {
            logStore('setError', { error });
            update(state => ({ ...state, error, loading: false }));
        },

        setLoading: (loading: boolean) => {
            update(state => ({ ...state, loading }));
        }
    };
};

export const conversationsStore = createConversationsStore(); 