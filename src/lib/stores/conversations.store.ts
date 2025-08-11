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
import { normalizeConvId } from '$lib/services/transport';
import type {
    Conversation,
    ConversationFilters,
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

    // Función para reordenar conversaciones por updatedAt
    const reorderConversations = (conversations: Conversation[]): Conversation[] => {
        return conversations.sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.lastMessageAt || 0);
            const dateB = new Date(b.updatedAt || b.lastMessageAt || 0);
            return dateB.getTime() - dateA.getTime(); // Más reciente primero
        });
    };

    // Función para obtener conversación activa
    const getActiveConversationId = (): string | null => {
        const state = get(conversationsStore);
        return state.selectedConversation?.id || null;
    };

    return {
        subscribe,

        loadConversations: async (filters: ConversationFilters = {}) => {
            logStore('loadConversations: start', {
                filters,
                timestamp: new Date().toISOString()
            });

            update(state => ({ ...state, loading: true, error: null }));

            try {
                const params = new URLSearchParams();
                if (filters.limit) params.append('limit', filters.limit.toString());
                if ((filters as any).cursor) params.append('cursor', (filters as any).cursor);
                if (filters.status) params.append('status', filters.status);
                if (filters.search) params.append('search', filters.search);

                const startTime = performance.now();
                const response = await api.get<any>(`/conversations?${params.toString()}`);
                const endTime = performance.now();

                logApi('loadConversations: API success', {
                    responseTime: `${(endTime - startTime).toFixed(2)}ms`,
                    conversationCount: response.data.data.conversations.length,
                    pagination: response.data.data.pagination
                });

                // Procesar y ordenar conversaciones
                const conversations = response.data.data.conversations
                    .map((c: any) => ({
                        id: c.id || '',
                        participants: c.participants || [],
                        customerPhone: c.customerPhone || c.contact?.phone || '',
                        lastMessage: c.lastMessage || null,
                        lastMessageAt: c?.lastMessageAt ?? c?.lastMessage?.timestamp ?? c?.updatedAt ?? null,
                        updatedAt: c.updatedAt || c.lastMessageAt || new Date().toISOString(),
                        messageCount: c.messageCount || 0,
                        unreadCount: c.unreadCount || 0,
                        status: c.status || 'active',
                        displayName: c.displayName || c.contact?.name || c.customerPhone || 'Sin nombre'
                    }))
                    .filter((c: any) => c.id && c.customerPhone);

                const sortedConversations = reorderConversations(conversations);

                update(state => ({
                    ...state,
                    conversations: sortedConversations,
                    pagination: response.data.data.pagination || null,
                    filters,
                    loading: false,
                    error: null
                }));

                // Seleccionar primera conversación si no hay selección
                const currentState = get(conversationsStore);
                if (sortedConversations.length > 0 && !currentState.selectedConversation) {
                    conversationsStore.selectConversation(sortedConversations[0].id);
                }
            } catch (error: unknown) {
                const apiError = extractApiError(error);
                logError('loadConversations: API error', 'CONVERSATIONS', new Error(apiError.message));

                update(state => ({
                    ...state,
                    loading: false,
                    error: apiError.message
                }));
            }
        },

        updateConversation: (conversationId: string, updates: Partial<Conversation>) => {
            const normalizedId = normalizeConvId(conversationId);

            update(state => {
                const updatedConversations = state.conversations.map(conv =>
                    normalizeConvId(conv.id) === normalizedId
                        ? { ...conv, ...updates, updatedAt: new Date().toISOString() }
                        : conv
                );

                const sortedConversations = reorderConversations(updatedConversations);

                return {
                    ...state,
                    conversations: sortedConversations,
                    selectedConversation: state.selectedConversation?.id === normalizedId
                        ? { ...state.selectedConversation, ...updates }
                        : state.selectedConversation
                };
            });
        },

        addMessage: (conversationId: string, message: any) => {
            const normalizedId = normalizeConvId(conversationId);
            const activeConversationId = getActiveConversationId();

            update(state => {
                const updatedConversations = state.conversations.map(conv => {
                    if (normalizeConvId(conv.id) !== normalizedId) return conv;

                    const isActiveConversation = activeConversationId === normalizedId;

                    return {
                        ...conv,
                        lastMessage: {
                            id: message.id,
                            content: message.content,
                            type: message.type,
                            direction: message.direction,
                            timestamp: message.timestamp || new Date().toISOString(),
                            sender: message.senderIdentifier || 'agent'
                        },
                        lastMessageAt: message.timestamp || new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        messageCount: (conv.messageCount || 0) + 1,
                        // Solo incrementar unreadCount si NO es la conversación activa
                        unreadCount: isActiveConversation ? 0 : (conv.unreadCount || 0) + 1
                    };
                });

                const sortedConversations = reorderConversations(updatedConversations);

                return {
                    ...state,
                    conversations: sortedConversations,
                    selectedConversation: state.selectedConversation?.id === normalizedId
                        ? { ...state.selectedConversation, lastMessage: message, unreadCount: 0 }
                        : state.selectedConversation
                };
            });
        },

        markAsRead: (conversationId: string) => {
            const normalizedId = normalizeConvId(conversationId);

            update(state => {
                const updatedConversations = state.conversations.map(conv =>
                    normalizeConvId(conv.id) === normalizedId
                        ? { ...conv, unreadCount: 0 }
                        : conv
                );

                return {
                    ...state,
                    conversations: updatedConversations,
                    selectedConversation: state.selectedConversation?.id === normalizedId
                        ? { ...state.selectedConversation, unreadCount: 0 }
                        : state.selectedConversation
                };
            });
        },

        selectConversation: (conversationId: string) => {
            const normalizedId = normalizeConvId(conversationId);

            update(state => {
                const conversation = state.conversations.find(conv =>
                    normalizeConvId(conv.id) === normalizedId
                );

                if (conversation) {
                    // Marcar como leída al seleccionar
                    const updatedConversations = state.conversations.map(conv =>
                        normalizeConvId(conv.id) === normalizedId
                            ? { ...conv, unreadCount: 0 }
                            : conv
                    );

                    return {
                        ...state,
                        conversations: updatedConversations,
                        selectedConversation: { ...conversation, unreadCount: 0 }
                    };
                }

                return state;
            });
        },

        clearSelection: () => {
            update(state => ({
                ...state,
                selectedConversation: null
            }));
        },

        getSelectedConversation: (): Conversation | null => {
            const state = get(conversationsStore);
            return state.selectedConversation;
        },

        loadMoreConversations: async () => {
            const currentState = get(conversationsStore);
            if (!currentState.pagination?.hasMore || currentState.loading) return;

            update(state => ({ ...state, loading: true }));

            try {
                const params = new URLSearchParams();
                if (currentState.pagination.nextCursor) {
                    params.append('cursor', currentState.pagination.nextCursor);
                }
                params.append('limit', currentState.pagination.limit.toString());

                const response = await api.get<any>(`/conversations?${params.toString()}`);

                const newConversations = response.data.data.conversations
                    .map((c: any) => ({
                        id: c.id || '',
                        participants: c.participants || [],
                        customerPhone: c.customerPhone || c.contact?.phone || '',
                        lastMessage: c.lastMessage || null,
                        lastMessageAt: c?.lastMessageAt ?? c?.lastMessage?.timestamp ?? c?.updatedAt ?? null,
                        updatedAt: c.updatedAt || c.lastMessageAt || new Date().toISOString(),
                        messageCount: c.messageCount || 0,
                        unreadCount: c.unreadCount || 0,
                        status: c.status || 'active',
                        displayName: c.displayName || c.contact?.name || c.customerPhone || 'Sin nombre'
                    }))
                    .filter((c: any) => c.id && c.customerPhone);

                update(state => {
                    const allConversations = [...state.conversations, ...newConversations];
                    const sortedConversations = reorderConversations(allConversations);

                    return {
                        ...state,
                        conversations: sortedConversations,
                        pagination: response.data.data.pagination || null,
                        loading: false
                    };
                });
            } catch (error: unknown) {
                const apiError = extractApiError(error);
                logError('loadMoreConversations: API error', 'CONVERSATIONS', new Error(apiError.message));

                update(state => ({
                    ...state,
                    loading: false,
                    error: apiError.message
                }));
            }
        },

        setError: (error: string | null) => {
            update(state => ({ ...state, error }));
        },

        setLoading: (loading: boolean) => {
            update(state => ({ ...state, loading }));
        }
    };
};

export const conversationsStore = createConversationsStore(); 