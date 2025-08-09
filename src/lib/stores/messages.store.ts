/**
 * Store de Mensajes para UTalk Frontend
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "📊 ESTRUCTURAS DE DATOS EXACTAS"
 * 
 * Modelos JSON exactos del backend:
 * - Mensaje completo con sender, recipient, metadata, etc.
 * - Estados: sent, delivered, read, failed
 * - Tipos: text, image, audio, video, document, location
 * - Paginación con hasMore, nextCursor, totalResults
 */

import { api } from '$lib/services/axios';
import type {
    Message,
    MessageFilters,
    MessagesState
} from '$lib/types';
import { logApi, logError, logStore } from '$lib/utils/logger';
import { extractApiError, get } from '$lib/utils/store-helpers';
import { writable } from 'svelte/store';

const createMessagesStore = () => {
    const initialState: MessagesState = {
        messages: [],
        currentConversationId: null,
        loading: false,
        error: null,
        pagination: null,
        filters: {},
        hasMore: true
    };

    const { subscribe, set, update } = writable<MessagesState>(initialState);

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

        loadMessages: async (conversationId: string, filters: MessageFilters = {}) => {
            logStore('loadMessages: start', {
                conversationId,
                filters,
                timestamp: new Date().toISOString()
            });

            await executeUpdate(() => {
                update(state => ({
                    ...state,
                    loading: true,
                    error: null,
                    currentConversationId: conversationId
                }));
            });

            try {
                // Usar el nuevo endpoint GET /api/messages
                const params = new URLSearchParams();
                params.set('conversationId', conversationId);

                if (filters.limit) params.append('limit', filters.limit.toString());
                if (filters.cursor) params.append('cursor', filters.cursor);
                if (filters.direction) params.append('direction', filters.direction);
                if (filters.status) params.append('status', filters.status);
                if (filters.type) params.append('type', filters.type);
                if (filters.startDate) params.append('startDate', filters.startDate);
                if (filters.endDate) params.append('endDate', filters.endDate);

                const startTime = performance.now();
                const response = await api.get<any>(`/messages?${params.toString()}`);
                const endTime = performance.now();

                logApi('loadMessages: API success', {
                    responseTime: `${(endTime - startTime).toFixed(2)}ms`,
                    messageCount: response.data.data.messages.length,
                    pagination: response.data.data.pagination,
                    metadata: response.data.data.metadata
                });

                await executeUpdate(() => {
                    update(state => ({
                        ...state,
                        messages: response.data.data.messages,
                        pagination: response.data.data.pagination || null,
                        filters,
                        hasMore: response.data.data.pagination?.hasMore || false,
                        loading: false,
                        error: null
                    }));
                });
            } catch (error: unknown) {
                const apiError = extractApiError(error);
                logError('loadMessages: API error', 'MESSAGES', new Error(apiError.message));

                await executeUpdate(() => {
                    update(state => ({
                        ...state,
                        loading: false,
                        error: apiError.message
                    }));
                });
            }
        },

        loadMoreMessages: async () => {
            const currentState = get(messagesStore);
            if (!currentState.hasMore || currentState.loading || !currentState.currentConversationId) return;

            logStore('loadMoreMessages: start', {
                conversationId: currentState.currentConversationId,
                currentCount: currentState.messages.length,
                hasMore: currentState.hasMore
            });

            await executeUpdate(() => {
                update(state => ({ ...state, loading: true }));
            });

            try {
                const params = new URLSearchParams();
                params.set('conversationId', currentState.currentConversationId);

                if (currentState.pagination?.nextCursor) {
                    params.append('cursor', currentState.pagination.nextCursor);
                }
                params.append('limit', currentState.pagination?.limit.toString() || '20');

                const response = await api.get<any>(`/messages?${params.toString()}`);

                await executeUpdate(() => {
                    update(state => ({
                        ...state,
                        messages: [...state.messages, ...response.data.data.messages],
                        pagination: response.data.data.pagination || null,
                        hasMore: response.data.data.pagination?.hasMore || false,
                        loading: false
                    }));
                });
            } catch (error: unknown) {
                const apiError = extractApiError(error);
                logError('loadMoreMessages: API error', 'MESSAGES', new Error(apiError.message));

                await executeUpdate(() => {
                    update(state => ({
                        ...state,
                        loading: false,
                        error: apiError.message
                    }));
                });
            }
        },

        addMessage: (message: Message) => {
            logStore('addMessage', {
                messageId: message.id,
                conversationId: message.conversationId,
                messageType: message.type,
                messageDirection: message.direction,
                messageStatus: message.status,
                hasMedia: !!message.mediaUrl,
                senderType: message.sender.type,
                currentConversationId: get(messagesStore).currentConversationId
            });

            update(state => {
                // Solo agregar si pertenece a la conversación actual
                if (state.currentConversationId === message.conversationId) {
                    // Verificar si el mensaje ya existe para evitar duplicados
                    const existingMessageIndex = state.messages.findIndex(msg => msg.id === message.id);

                    if (existingMessageIndex !== -1) {
                        // Actualizar mensaje existente
                        const updatedMessages = [...state.messages];
                        updatedMessages[existingMessageIndex] = { ...updatedMessages[existingMessageIndex], ...message };

                        return {
                            ...state,
                            messages: updatedMessages
                        };
                    } else {
                        // Agregar nuevo mensaje al inicio
                        return {
                            ...state,
                            messages: [message, ...state.messages]
                        };
                    }
                }
                return state;
            });
        },

        updateMessageStatus: (messageId: string, status: Message['status'], metadata?: Record<string, unknown>) => {
            logStore('updateMessageStatus', {
                messageId,
                newStatus: status,
                hasMetadata: !!metadata
            });

            update(state => ({
                ...state,
                messages: state.messages.map(msg =>
                    msg.id === messageId
                        ? { ...msg, status, metadata: { ...msg.metadata, ...metadata } }
                        : msg
                )
            }));
        },

        markMessageAsRead: (messageId: string) => {
            logStore('markMessageAsRead', { messageId });

            update(state => ({
                ...state,
                messages: state.messages.map(msg =>
                    msg.id === messageId
                        ? { ...msg, status: 'read' as const }
                        : msg
                )
            }));
        },

        clear: () => {
            logStore('clear messages store');
            set(initialState);
        },

        // Función de cleanup específica para logout
        cleanup: () => {
            logStore('messages: cleanup - limpiando estado');
            set(initialState);
        },

        setError: (error: string) => {
            logStore('setError', { error });
            update(state => ({ ...state, error, loading: false }));
        },

        setLoading: (loading: boolean) => {
            update(state => ({ ...state, loading }));
        },

        sendMessage: async (conversationId: string, content: string, files: File[] = []) => {
            logStore('sendMessage: start', {
                conversationId,
                contentLength: content.length,
                fileCount: files.length
            });

            await executeUpdate(() => {
                update(state => ({ ...state, loading: true, error: null }));
            });

            try {
                const formData = new FormData();
                formData.append('content', content);
                formData.append('type', 'text');

                files.forEach((file, index) => {
                    formData.append(`attachments`, file);
                });

                const response = await api.post<{ success: boolean; data: Message }>(
                    `/conversations/${conversationId}/messages`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                logStore('sendMessage: success', {
                    messageId: response.data.data.id,
                    conversationId
                });

                // Agregar el mensaje enviado al store
                messagesStore.addMessage(response.data.data);

                await executeUpdate(() => {
                    update(state => ({ ...state, loading: false }));
                });
                return response.data.data;
            } catch (error: unknown) {
                const apiError = extractApiError(error);
                logError('sendMessage: API error', 'MESSAGES', new Error(apiError.message));

                await executeUpdate(() => {
                    update(state => ({
                        ...state,
                        loading: false,
                        error: apiError.message
                    }));
                });

                throw new Error(apiError.message);
            }
        },

        retryMessage: async (messageId: string) => {
            logStore('retryMessage: start', { messageId });

            await executeUpdate(() => {
                update(state => ({ ...state, loading: true, error: null }));
            });

            try {
                const response = await api.post<{ success: boolean; data: Message }>(
                    `/messages/${messageId}/retry`
                );

                logStore('retryMessage: success', {
                    messageId,
                    newMessageId: response.data.data.id
                });

                // Actualizar el mensaje en el store
                await executeUpdate(() => {
                    update(state => ({
                        ...state,
                        messages: state.messages.map(msg =>
                            msg.id === messageId
                                ? { ...response.data.data, id: messageId } // Mantener el ID original
                                : msg
                        ),
                        loading: false
                    }));
                });

                return response.data.data;
            } catch (error: unknown) {
                const apiError = extractApiError(error);
                logError('retryMessage: API error', 'MESSAGES', new Error(apiError.message));

                await executeUpdate(() => {
                    update(state => ({
                        ...state,
                        loading: false,
                        error: apiError.message
                    }));
                });

                throw new Error(apiError.message);
            }
        }
    };
};

export const messagesStore = createMessagesStore(); 