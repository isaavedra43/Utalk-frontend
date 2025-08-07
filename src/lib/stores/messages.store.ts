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

import { logError } from '$lib/utils/logger';
import { writable } from 'svelte/store';
import { api } from '../services/axios';

// Tipos basados en PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "📊 ESTRUCTURAS DE DATOS EXACTAS"
export interface Message {
    id: string;
    conversationId: string;
    content: string;
    mediaUrl?: string;
    senderIdentifier: string;
    recipientIdentifier: string;
    sender: {
        identifier: string;
        type: 'customer' | 'agent';
        name?: string;
    };
    recipient: {
        identifier: string;
        type: 'customer' | 'agent';
        name?: string;
    };
    direction: 'inbound' | 'outbound';
    type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
    metadata?: {
        twilioSid?: string;
        sentViaSocket?: boolean;
        socketId?: string;
        readBy?: string[];
        readAt?: string;
        failureReason?: string;
        retryable?: boolean;
        fileInfo?: {
            filename: string;
            size: number;
            mimeType: string;
            thumbnail?: string;
        };
    };
    createdAt: string;
    updatedAt: string;
}

// Paginación basada en PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "Respuesta Paginada"
export interface Pagination {
    hasMore: boolean;
    nextCursor?: string;
    totalResults: number;
    limit: number;
}

export interface MessagesResponse {
    success: boolean;
    data: Message[];
    pagination: Pagination;
}

// Parámetros de consulta basados en PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "💬 Endpoints de Mensajes"
export interface MessageFilters {
    limit?: number;
    cursor?: string;
    direction?: 'inbound' | 'outbound' | 'all';
    status?: 'sent' | 'delivered' | 'read' | 'failed';
    type?: 'text' | 'image' | 'audio' | 'video' | 'document';
    startDate?: string;
    endDate?: string;
}

// Estado del store
interface MessagesState {
    messages: Message[];
    currentConversationId: string | null;
    loading: boolean;
    error: string | null;
    pagination: Pagination | null;
    filters: MessageFilters;
    hasMore: boolean;
}

const initialState: MessagesState = {
    messages: [],
    currentConversationId: null,
    loading: false,
    error: null,
    pagination: null,
    filters: {},
    hasMore: true
};

// Store de mensajes - PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "3.1 Store de Conversaciones"
const createMessagesStore = () => {
    const { subscribe, set, update } = writable<MessagesState>(initialState);

    return {
        subscribe,

        // Cargar mensajes desde API real - PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "💬 Endpoints de Mensajes"
        loadMessages: async (conversationId: string, filters: MessageFilters = {}) => {
            update(state => ({
                ...state,
                loading: true,
                error: null,
                currentConversationId: conversationId,
                filters
            }));

            try {
                // Construir query params basados en PLAN_FRONTEND_UTALK_COMPLETO.md
                const params = new URLSearchParams();

                if (filters.limit) params.append('limit', filters.limit.toString());
                if (filters.cursor) params.append('cursor', filters.cursor);
                if (filters.direction) params.append('direction', filters.direction);
                if (filters.status) params.append('status', filters.status);
                if (filters.type) params.append('type', filters.type);
                if (filters.startDate) params.append('startDate', filters.startDate);
                if (filters.endDate) params.append('endDate', filters.endDate);

                const response = await api.get<MessagesResponse>(`/conversations/${conversationId}/messages?${params.toString()}`);

                update(state => ({
                    ...state,
                    messages: response.data.data,
                    pagination: response.data.pagination,
                    hasMore: response.data.pagination.hasMore,
                    loading: false,
                    error: null
                }));
            } catch (error: any) {
                logError('Error loading messages:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.response?.data?.message || 'Error al cargar mensajes',
                    messages: []
                }));
            }
        },

        // Cargar más mensajes (paginación) - PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "Respuesta Paginada"
        loadMoreMessages: async () => {
            const state = get(messagesStore);
            if (!state.hasMore || state.loading || !state.currentConversationId) return;

            try {
                update(state => ({ ...state, loading: true }));

                const params = new URLSearchParams();
                if (state.pagination?.nextCursor) params.append('cursor', state.pagination.nextCursor);
                if (state.filters.limit) params.append('limit', state.filters.limit.toString());
                if (state.filters.direction) params.append('direction', state.filters.direction);
                if (state.filters.status) params.append('status', state.filters.status);
                if (state.filters.type) params.append('type', state.filters.type);

                const response = await api.get<MessagesResponse>(`/conversations/${state.currentConversationId}/messages?${params.toString()}`);

                update(state => ({
                    ...state,
                    messages: [...state.messages, ...response.data.data],
                    pagination: response.data.pagination,
                    hasMore: response.data.pagination.hasMore,
                    loading: false
                }));
            } catch (error: any) {
                logError('Error loading more messages:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.response?.data?.message || 'Error al cargar más mensajes'
                }));
            }
        },

        // Agregar mensaje recibido - PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "3.1 Store de Conversaciones"
        addMessage: (message: Message) => {
            update(state => {
                // Solo agregar si pertenece a la conversación actual
                if (state.currentConversationId && message.conversationId === state.currentConversationId) {
                    return {
                        ...state,
                        messages: [...state.messages, message]
                    };
                }
                return state;
            });
        },

        // Actualizar status de mensaje - PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "3.1 Store de Conversaciones"
        updateMessageStatus: (messageId: string, status: Message['status'], metadata?: Message['metadata']) => {
            update(state => ({
                ...state,
                messages: state.messages.map(msg =>
                    msg.id === messageId
                        ? { ...msg, status, metadata: { ...msg.metadata, ...metadata } }
                        : msg
                )
            }));
        },

        // Marcar mensaje como leído
        markMessageAsRead: async (messageId: string, conversationId: string) => {
            try {
                await api.put(`/conversations/${conversationId}/messages/${messageId}/read`, {
                    readAt: new Date().toISOString()
                });

                update(state => ({
                    ...state,
                    messages: state.messages.map(msg =>
                        msg.id === messageId
                            ? { ...msg, status: 'read' as const }
                            : msg
                    )
                }));
            } catch (error: any) {
                logError('Error marking message as read:', error);
            }
        },

        // Enviar mensaje con archivos adjuntos
        sendMessage: async (conversationId: string, content: string, files: File[] = [], type: Message['type'] = 'text') => {
            try {
                update(state => ({ ...state, loading: true, error: null }));

                // Crear FormData para archivos adjuntos
                const formData = new FormData();
                formData.append('content', content);
                formData.append('type', type);

                // Agregar archivos si existen
                files.forEach(file => {
                    formData.append('attachments', file);
                });

                // Enviar mensaje con archivos
                const response = await api.post(`/conversations/${conversationId}/messages`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // El mensaje se agregará automáticamente via socket
                // pero podemos agregarlo optimísticamente al store
                const newMessage = response.data as Message;

                update(state => ({
                    ...state,
                    messages: [...state.messages, newMessage],
                    currentConversationId: conversationId
                }));

                return response.data;
            } catch (error: any) {
                logError('Error sending message:', error);

                // Manejar errores específicos del backend - Documento: info/1.md sección "Casos Especiales"
                if (error.response?.status === 413) {
                    update(state => ({ ...state, error: 'Archivo demasiado grande. Máximo 100MB por archivo.' }));
                } else if (error.response?.status === 415) {
                    update(state => ({ ...state, error: 'Tipo de archivo no permitido.' }));
                } else if (error.response?.status === 403) {
                    update(state => ({ ...state, error: 'No tienes permisos para enviar mensajes a esta conversación.' }));
                } else if (error.response?.status === 429) {
                    const retryAfter = (error.response.data as any)?.retryAfter || 60;
                    update(state => ({ ...state, error: `Has excedido el límite de peticiones. Intenta de nuevo en ${retryAfter} segundos.` }));
                } else {
                    update(state => ({ ...state, error: error.response?.data?.message || 'Error al enviar mensaje' }));
                }

                throw error;
            } finally {
                update(state => ({ ...state, loading: false }));
            }
        },

        // Editar mensaje
        editMessage: async (conversationId: string, messageId: string, content: string, type: Message['type'] = 'text') => {
            try {
                const response = await api.put(`/conversations/${conversationId}/messages/${messageId}`, {
                    content,
                    type
                });

                update(state => ({
                    ...state,
                    messages: state.messages.map(msg =>
                        msg.id === messageId
                            ? { ...msg, content, type, updatedAt: new Date().toISOString() }
                            : msg
                    )
                }));

                return response.data;
            } catch (error: any) {
                logError('Error editing message:', error);
                throw error;
            }
        },

        // Eliminar mensaje
        deleteMessage: async (conversationId: string, messageId: string) => {
            try {
                await api.delete(`/conversations/${conversationId}/messages/${messageId}`);

                update(state => ({
                    ...state,
                    messages: state.messages.filter(msg => msg.id !== messageId)
                }));
            } catch (error: any) {
                logError('Error deleting message:', error);
                throw error;
            }
        },

        // Limpiar mensajes de una conversación
        clearMessages: (conversationId?: string) => {
            update(state => ({
                ...state,
                messages: conversationId && state.currentConversationId === conversationId ? [] : state.messages,
                currentConversationId: conversationId || null,
                pagination: null,
                hasMore: true
            }));
        },

        // Limpiar estado completo
        clear: () => {
            set(initialState);
        },

        // Establecer error
        setError: (error: string | null) => {
            update(state => ({ ...state, error }));
        },

        // Establecer loading
        setLoading: (loading: boolean) => {
            update(state => ({ ...state, loading }));
        },

        // Establecer mensajes (para búsqueda) - Documento: info/3.md sección "GET /api/conversations/:conversationId/messages"
        setMessages: (messages: Message[]) => {
            update(state => ({ ...state, messages, loading: false, error: null }));
        },

        // Obtener mensajes de una conversación específica
        getMessagesForConversation: (conversationId: string) => {
            const state = get(messagesStore);
            return state.currentConversationId === conversationId ? state.messages : [];
        },

        // Verificar si hay mensajes fallidos
        hasFailedMessages: () => {
            const state = get(messagesStore);
            return state.messages.some((msg: Message) => msg.status === 'failed');
        },

        // Obtener mensajes fallidos
        getFailedMessages: () => {
            const state = get(messagesStore);
            return state.messages.filter((msg: Message) => msg.status === 'failed');
        },

        // Reintentar mensaje fallido
        retryMessage: async (messageId: string) => {
            try {
                const state = get(messagesStore);
                const message = state.messages.find((msg: Message) => msg.id === messageId);

                if (!message) {
                    throw new Error('Mensaje no encontrado');
                }

                if (message.status !== 'failed') {
                    throw new Error('Solo se pueden reintentar mensajes fallidos');
                }

                // Reenviar el mensaje
                const response = await api.post(`/conversations/${message.conversationId}/messages`, {
                    content: message.content,
                    type: message.type,
                    mediaUrl: message.mediaUrl,
                    retryMessageId: messageId
                });

                // Actualizar el estado del mensaje
                update(state => ({
                    ...state,
                    messages: state.messages.map(msg =>
                        msg.id === messageId
                            ? { ...msg, status: 'sent', updatedAt: new Date().toISOString() }
                            : msg
                    )
                }));

                return response.data;
            } catch (error: any) {
                logError('Error retrying message:', error);
                throw error;
            }
        }
    };
};

export const messagesStore = createMessagesStore();

// Helper para obtener el estado actual del store
function get(store: any) {
    let value: any;
    store.subscribe((val: any) => value = val)();
    return value;
} 