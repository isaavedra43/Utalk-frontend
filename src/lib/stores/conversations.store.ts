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
import { writable } from 'svelte/store';

// Tipos basados en PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "📊 ESTRUCTURAS DE DATOS EXACTAS"
export interface Contact {
    id: string;
    name?: string;
    phone: string;
    email?: string;
    avatar?: string;
    company?: string;
    notes?: string;
    channel: string;
    isActive: boolean;
    tags: string[];
    metadata?: {
        lastContact?: string;
        totalConversations?: number;
        totalMessages?: number;
        preferredLanguage?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'agent' | 'viewer';
}

export interface Message {
    id: string;
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

export interface Conversation {
    id: string;
    participants: string[];
    customerPhone: string;
    contact?: Contact;
    assignedTo?: User | null;
    status: 'open' | 'pending' | 'resolved' | 'archived';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    tags: string[];
    unreadCount: number;
    messageCount: number;
    lastMessage?: Message | null;
    lastMessageId?: string;
    lastMessageAt?: string;
    createdAt: string;
    updatedAt: string;
    metadata?: {
        source?: string;
        autoAssigned?: boolean;
        favorite?: boolean;
    };
}

// Paginación basada en PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "Respuesta Paginada"
export interface Pagination {
    hasMore: boolean;
    nextCursor?: string;
    totalResults: number;
    limit: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
}

export interface ConversationsResponse {
    success: boolean;
    data: Conversation[];
    pagination: Pagination;
    metadata?: {
        queryTime?: string;
        appliedFilters?: string[];
    };
}

// Parámetros de consulta basados en PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "💬 Endpoints de Conversaciones"
export interface ConversationFilters {
    page?: number;
    limit?: number;
    status?: 'open' | 'pending' | 'resolved' | 'archived';
    assignedTo?: string;
    search?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    tags?: string[];
    startDate?: string;
    endDate?: string;
}

// Estado del store
interface ConversationsState {
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    loading: boolean;
    error: string | null;
    pagination: Pagination | null;
    filters: ConversationFilters;
}

const initialState: ConversationsState = {
    conversations: [],
    selectedConversation: null,
    loading: false,
    error: null,
    pagination: null,
    filters: {}
};

// Store de conversaciones - PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "3.1 Store de Conversaciones"
const createConversationsStore = () => {
    const { subscribe, set, update } = writable<ConversationsState>(initialState);

    return {
        subscribe,

        // Cargar conversaciones desde API real - PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "💬 Endpoints de Conversaciones"
        loadConversations: async (filters: ConversationFilters = {}) => {
            update(state => ({ ...state, loading: true, error: null }));

            try {
                // Construir query params basados en PLAN_FRONTEND_UTALK_COMPLETO.md
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

                const response = await api.get<ConversationsResponse>(`/conversations?${params.toString()}`);

                update(state => ({
                    ...state,
                    conversations: response.data.data,
                    pagination: response.data.pagination,
                    filters,
                    loading: false,
                    error: null
                }));
            } catch (error: any) {
                console.error('Error loading conversations:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.response?.data?.message || 'Error al cargar conversaciones',
                    conversations: []
                }));
            }
        },

        // Seleccionar conversación activa
        selectConversation: (conversation: Conversation | null) => {
            update(state => ({ ...state, selectedConversation: conversation }));
        },

        // Actualizar conversación específica - PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "3.1 Store de Conversaciones"
        updateConversation: (conversationId: string, updates: Partial<Conversation>) => {
            update(state => ({
                ...state,
                conversations: state.conversations.map(conv =>
                    conv.id === conversationId ? { ...conv, ...updates } : conv
                ),
                selectedConversation: state.selectedConversation?.id === conversationId
                    ? { ...state.selectedConversation, ...updates }
                    : state.selectedConversation
            }));
        },

        // Agregar mensaje a conversación - PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "3.1 Store de Conversaciones"
        addMessage: (conversationId: string, message: Message) => {
            update(state => ({
                ...state,
                conversations: state.conversations.map(conv =>
                    conv.id === conversationId
                        ? {
                            ...conv,
                            lastMessage: message,
                            messageCount: conv.messageCount + 1,
                            lastMessageId: message.id,
                            lastMessageAt: message.timestamp,
                            unreadCount: conv.unreadCount + 1
                        }
                        : conv
                ),
                selectedConversation: state.selectedConversation?.id === conversationId
                    ? {
                        ...state.selectedConversation,
                        lastMessage: message,
                        messageCount: state.selectedConversation.messageCount + 1,
                        lastMessageId: message.id,
                        lastMessageAt: message.timestamp,
                        unreadCount: state.selectedConversation.unreadCount + 1
                    }
                    : state.selectedConversation
            }));
        },

        // Marcar conversación como leída
        markConversationAsRead: (conversationId: string) => {
            update(state => ({
                ...state,
                conversations: state.conversations.map(conv =>
                    conv.id === conversationId
                        ? { ...conv, unreadCount: 0 }
                        : conv
                ),
                selectedConversation: state.selectedConversation?.id === conversationId
                    ? { ...state.selectedConversation, unreadCount: 0 }
                    : state.selectedConversation
            }));
        },

        // Cargar más conversaciones (paginación) - PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "Respuesta Paginada"
        loadMoreConversations: async () => {
            const state = get(conversationsStore);
            if (!state.pagination?.hasMore || state.loading) return;

            try {
                const nextFilters = {
                    ...state.filters,
                    cursor: state.pagination.nextCursor
                };

                const params = new URLSearchParams();
                if (nextFilters.cursor) params.append('cursor', nextFilters.cursor);
                if (nextFilters.limit) params.append('limit', nextFilters.limit.toString());

                const response = await api.get<ConversationsResponse>(`/conversations?${params.toString()}`);

                update(state => ({
                    ...state,
                    conversations: [...state.conversations, ...response.data.data],
                    pagination: response.data.pagination,
                    loading: false
                }));
            } catch (error: any) {
                console.error('Error loading more conversations:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.response?.data?.message || 'Error al cargar más conversaciones'
                }));
            }
        },

        // Limpiar estado
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

        // Establecer conversaciones (para búsqueda) - Documento: info/3.md sección "GET /api/conversations"
        setConversations: (conversations: Conversation[]) => {
            update(state => ({ ...state, conversations, loading: false, error: null }));
        }
    };
};

export const conversationsStore = createConversationsStore();

// Helper para obtener el estado actual del store
function get(store: any) {
    let value: any;
    store.subscribe((val: any) => value = val)();
    return value;
} 