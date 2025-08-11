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
                const response = await api.get<any>(`/conversations?${params.toString()}`);
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

        updateConversation: (conversationId: string, updates: Partial<Conversation>) => {
            const normalizedId = normalizeConvId(conversationId);

            logStore('updateConversation', {
                conversationId: normalizedId,
                hasUpdates: !!updates,
                updateKeys: Object.keys(updates || {})
            });

            update(state => ({
                ...state,
                conversations: state.conversations.map(conv =>
                    normalizeConvId(conv.id) === normalizedId
                        ? { ...conv, ...updates }
                        : conv
                )
            }));
        },

        addMessage: (conversationId: string, message: any) => {
            const normalizedId = normalizeConvId(conversationId);

            logStore('addMessage to conversation', {
                conversationId: normalizedId,
                messageId: message.id,
                messageType: message.type,
                messageDirection: message.direction
            });

            update(state => ({
                ...state,
                conversations: state.conversations.map(conv => {
                    if (normalizeConvId(conv.id) !== normalizedId) return conv;

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
                        messageCount: (conv.messageCount || 0) + 1
                    };
                })
            }));
        },

        removeConversation: (conversationId: string) => {
            const normalizedId = normalizeConvId(conversationId);

            logStore('removeConversation', { conversationId: normalizedId });

            update(state => ({
                ...state,
                conversations: state.conversations.filter(conv =>
                    normalizeConvId(conv.id) !== normalizedId
                )
            }));
        },

        selectConversation: (conversationId: string) => {
            const normalizedId = normalizeConvId(conversationId);

            logStore('selectConversation', {
                conversationId: normalizedId,
                previousSelection: get(conversationsStore).selectedConversation?.id
            });

            update(state => ({
                ...state,
                selectedConversation: state.conversations.find(conv =>
                    normalizeConvId(conv.id) === normalizedId
                ) || null
            }));
        },

        clearSelection: () => {
            logStore('clearSelection');
            update(state => ({
                ...state,
                selectedConversation: null
            }));
        },

        getConversation: (conversationId: string): Conversation | null => {
            const normalizedId = normalizeConvId(conversationId);
            const state = get(conversationsStore);
            return state.conversations.find(conv =>
                normalizeConvId(conv.id) === normalizedId
            ) || null;
        },

        getSelectedConversation: (): Conversation | null => {
            const state = get(conversationsStore);
            return state.selectedConversation;
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

                const response = await api.get<any>(`/conversations?${params.toString()}`);

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