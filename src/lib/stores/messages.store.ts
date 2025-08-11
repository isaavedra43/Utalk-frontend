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
import {
    buildMessageMetadata,
    validateMessageContent
} from '$lib/utils/message-helpers';
import { extractApiError, get } from '$lib/utils/store-helpers';
import { generateUUID } from '$lib/utils/uuid';
import { writable } from 'svelte/store';
import { authStore } from './auth.store';
import { conversationsStore } from './conversations.store';
import { notificationsStore } from './notifications.store';

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

            function toE164(raw: string): string {
                if (!raw) return '';
                let p = String(raw).trim().replace(/[\s\-\(\)]/g, '');
                if (p.startsWith('00')) p = '+' + p.slice(2);
                if (!p.startsWith('+')) p = '+' + p;
                return p;
            }

            await executeUpdate(() => {
                update(state => ({ ...state, loading: true, error: null }));
            });

            try {
                // Validar contenido del mensaje si no hay media
                const contentValidation = validateMessageContent(content);
                if (!contentValidation.valid && files.length === 0) {
                    notificationsStore.error('El mensaje de texto debe tener entre 1 y 1000 caracteres.');
                    throw new Error(contentValidation.error);
                }

                // Usuario autenticado para senderIdentifier
                const auth = get(authStore);
                const agentEmail = (auth as any)?.user?.email;
                if (!agentEmail) {
                    notificationsStore.error('No hay sesión de agente');
                    throw new Error('agent_email_missing');
                }

                // Obtener conversación para recipientIdentifier y payload
                const currentState = get(conversationsStore);
                const conversation = currentState.conversations.find(c => c.id === conversationId);
                if (!conversation) {
                    notificationsStore.error('Conversación no encontrada');
                    throw new Error('conversation_not_found');
                }

                // Normalizar teléfono del cliente
                const customerPhone = (conversation as any)?.customerPhone || (conversation as any)?.contact?.phone;
                const e164 = toE164(customerPhone);
                if (!e164 || !/^\+\d{7,15}$/.test(e164)) {
                    notificationsStore.error('Teléfono de cliente inválido');
                    throw new Error('invalid_customer_phone');
                }

                // Construcción base del payload canónico
                const basePayload: any = {
                    messageId: generateUUID(),
                    type: 'text',
                    content: (content || '').trim(),
                    senderIdentifier: `agent:${agentEmail}`,
                    recipientIdentifier: `whatsapp:${e164}`,
                    metadata: buildMessageMetadata(conversation)
                };

                // Upload de media si existen archivos (1 por mensaje)
                let mediaPayload: any | null = null;
                if (files.length > 0) {
                    const { uploadFile } = await import('$lib/services/files');
                    const controller = new AbortController();
                    const file = files[0];

                    const uploadResult = await uploadFile(file, {
                        signal: controller.signal,
                        onProgress: (percent) => {
                            logStore('sendMessage: upload progress', { percent, filename: file.name });
                        }
                    });

                    mediaPayload = {
                        fileId: uploadResult.fileId,
                        mediaUrl: uploadResult.mediaUrl,
                        mimeType: uploadResult.mimeType,
                        fileName: uploadResult.fileName,
                        fileSize: uploadResult.fileSize,
                        ...(uploadResult.durationMs ? { durationMs: uploadResult.durationMs } : {})
                    };

                    if (uploadResult.mimeType.startsWith('image/')) basePayload.type = 'image';
                    else if (uploadResult.mimeType.startsWith('audio/')) basePayload.type = 'audio';
                    else basePayload.type = 'document';
                }

                const messageData = mediaPayload ? { ...basePayload, media: mediaPayload } : basePayload;

                if (import.meta.env.DEV) {
                    const preview = { ...messageData };
                    if (preview.content && preview.content.length > 100) preview.content = preview.content.slice(0, 100) + '...';
                    logStore('sendMessage: payload', preview as any);
                }

                const startTime = performance.now();
                const response = await api.post<{
                    success: boolean;
                    data: {
                        message: Message;
                        conversation: any;
                    }
                }>(
                    `/conversations/${encodeURIComponent(conversationId)}/messages`,
                    messageData,
                    { headers: { 'Content-Type': 'application/json' } }
                );
                const endTime = performance.now();

                logStore('sendMessage: success', {
                    messageId: response.data.data.message.id,
                    conversationId,
                    responseTime: `${(endTime - startTime).toFixed(2)}ms`,
                    requestId: response.headers['x-request-id'] || 'unknown'
                });

                messagesStore.addMessage(response.data.data.message);

                if (response.data.data.conversation) {
                    conversationsStore.updateConversation(conversationId, response.data.data.conversation);
                }

                await executeUpdate(() => {
                    update(state => ({ ...state, loading: false }));
                });
                return response.data.data.message;
            } catch (error: unknown) {
                const apiError = extractApiError(error);

                if (apiError.status === 400 && (error as any)?.response?.data?.code === 'validation_error') {
                    const details = (error as any)?.response?.data?.details || [];
                    const fields = details.map((d: any) => d.field).join(', ');
                    notificationsStore.error(`Validación: revisar campos → ${fields}`);
                    await executeUpdate(() => {
                        update(state => ({ ...state, loading: false, error: `validation_error: ${fields}` }));
                    });
                    throw new Error('validation_error');
                }

                if (apiError.status === 413) {
                    notificationsStore.error('El archivo es demasiado grande.');
                    await executeUpdate(() => { update(state => ({ ...state, loading: false, error: '413_oversize' })); });
                    throw new Error('413_oversize');
                }

                if (apiError.status && apiError.status >= 500) {
                    notificationsStore.error('Error del servidor. Intenta nuevamente.');
                    await executeUpdate(() => { update(state => ({ ...state, loading: false, error: 'server_error' })); });
                    throw new Error('server_error');
                }

                notificationsStore.error(apiError.message);
                await executeUpdate(() => { update(state => ({ ...state, loading: false, error: apiError.message })); });
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