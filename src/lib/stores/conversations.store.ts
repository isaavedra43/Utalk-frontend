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
            // DEBUG-LOG-START(conversations-front)
            if (import.meta.env.VITE_LOG_VERBOSE_CONVERSATIONS === 'true') {
                console.debug('[CONV][api][fetch:start]', {
                    event: 'fetch:start',
                    layer: 'api',
                    request: {
                        url: '/conversations',
                        method: 'GET',
                        queryParams: filters
                    },
                    response: { status: null, ok: null, itemsLength: null, keysSample: null },
                    clientFilters: { inbox: null, status: null, assignedTo: null, search: null, pagination: null },
                    mapping: { requiredKeysPresent: [], missingKeys: [] },
                    render: { willShowEmptyState: null, reason: null }
                });
            }
            // DEBUG-LOG-END(conversations-front)

            logStore('loadConversations: start', { filters, timestamp: new Date().toISOString() });

            await executeUpdate(() => {
                update(state => ({ ...state, loading: true, error: null }));
            });

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

            try {
                const startTime = performance.now();
                const response = await api.get<ConversationsResponse>(`/conversations?${params.toString()}`);
                const endTime = performance.now();

                // DEBUG-LOG-START(conversations-front)
                if (import.meta.env.VITE_LOG_VERBOSE_CONVERSATIONS === 'true') {
                    const conversationsData = response.data.data || [];
                    const firstItem = conversationsData[0];
                    const keysSample = firstItem ? Object.keys(firstItem).slice(0, 3) : [];

                    console.debug('[CONV][api][fetch:done]', {
                        event: 'fetch:done',
                        layer: 'api',
                        request: {
                            url: `/conversations?${params.toString()}`,
                            method: 'GET',
                            queryParams: filters
                        },
                        response: {
                            status: response.status,
                            ok: response.status >= 200 && response.status < 300,
                            itemsLength: conversationsData.length,
                            keysSample: keysSample
                        },
                        clientFilters: { inbox: null, status: null, assignedTo: null, search: null, pagination: null },
                        mapping: { requiredKeysPresent: [], missingKeys: [] },
                        render: { willShowEmptyState: null, reason: null }
                    });
                }
                // DEBUG-LOG-END(conversations-front)

                // Log de la respuesta completa para debugging
                console.log('🔍 RESPONSE FROM BACKEND:', response.data);

                // Manejar tanto la estructura nueva como la antigua
                const conversationsData = response.data.data || [];
                console.log('🔍 CONVERSATIONS DATA:', conversationsData);
                console.log('🔍 FIRST CONVERSATION:', conversationsData[0]);
                const paginationData = response.data.pagination || null;
                const metadataData = response.data.metadata || {};

                // Normalización defensiva de lastMessageAt para la UI
                const normalized = conversationsData.map((c: any) => {
                    // Validación defensiva para evitar TypeError
                    if (!c || typeof c !== 'object') {
                        console.warn('Conversación inválida encontrada:', c);
                        return null;
                    }

                    return {
                        ...c,
                        id: c.id || `unknown_${Date.now()}`,
                        participants: Array.isArray(c.participants) ? c.participants : [],
                        customerPhone: c.customerPhone || 'unknown',
                        lastMessageAt: c?.lastMessageAt ?? c?.lastMessage?.timestamp ?? c?.updatedAt ?? null
                    };
                }).filter(Boolean); // Filtrar conversaciones nulas

                // DEBUG-LOG-START(conversations-front)
                if (import.meta.env.VITE_LOG_VERBOSE_CONVERSATIONS === 'true') {
                    const requiredKeys = ['id', 'lastMessage', 'createdAt'];
                    const firstItem = normalized[0];
                    const missingKeys = firstItem ? requiredKeys.filter(key => !(key in firstItem)) : requiredKeys;
                    const requiredKeysPresent = firstItem ? requiredKeys.filter(key => key in firstItem) : [];

                    console.debug('[CONV][state][state:set]', {
                        event: 'state:set',
                        layer: 'state',
                        request: { url: `/conversations?${params.toString()}`, method: 'GET', queryParams: filters },
                        response: {
                            status: response.status,
                            ok: response.status >= 200 && response.status < 300,
                            itemsLength: normalized.length,
                            keysSample: firstItem ? Object.keys(firstItem).slice(0, 3) : []
                        },
                        clientFilters: { inbox: null, status: null, assignedTo: null, search: null, pagination: null },
                        mapping: { requiredKeysPresent, missingKeys },
                        render: { willShowEmptyState: normalized.length === 0, reason: normalized.length === 0 ? 'data.length === 0' : 'has data' }
                    });
                }
                // DEBUG-LOG-END(conversations-front)

                logApi('loadConversations: API success', {
                    responseTime: `${(endTime - startTime).toFixed(2)}ms`,
                    conversationCount: normalized.length,
                    pagination: paginationData,
                    metadata: metadataData,
                    responseStructure: {
                        hasData: !!response.data.data,
                        hasSuccess: !!response.data.success,
                        hasMessage: !!response.data.message
                    }
                });

                await executeUpdate(() => {
                    update(state => ({
                        ...state,
                        conversations: normalized,
                        pagination: paginationData,
                        filters,
                        loading: false,
                        error: null
                    }));
                });
            } catch (error: unknown) {
                // DEBUG-LOG-START(conversations-front)
                if (import.meta.env.VITE_LOG_VERBOSE_CONVERSATIONS === 'true') {
                    console.debug('[CONV][api][fetch:error]', {
                        event: 'fetch:error',
                        layer: 'api',
                        request: {
                            url: `/conversations?${params.toString()}`,
                            method: 'GET',
                            queryParams: filters
                        },
                        response: {
                            status: (error as any)?.response?.status || null,
                            ok: false,
                            itemsLength: 0,
                            keysSample: []
                        },
                        clientFilters: { inbox: null, status: null, assignedTo: null, search: null, pagination: null },
                        mapping: { requiredKeysPresent: [], missingKeys: [] },
                        render: { willShowEmptyState: true, reason: 'API error' }
                    });
                }
                // DEBUG-LOG-END(conversations-front)

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

        addDemoConversation: (demoConversation: Conversation) => {
            logStore('addDemoConversation', {
                conversationId: demoConversation.id,
                conversationStatus: demoConversation.status
            });

            executeUpdate(() => {
                update(state => ({
                    ...state,
                    conversations: [demoConversation, ...state.conversations],
                    selectedConversation: demoConversation
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