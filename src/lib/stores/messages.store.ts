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
import { sendOutboundMessage } from '$lib/services/messageTransport';
import { normalizeConvId } from '$lib/services/transport';
import type {
    Message,
    MessageFilters,
    MessagesState
} from '$lib/types';
import { devLogger } from '$lib/utils/dev-logger';
import { logApi, logError, logStore } from '$lib/utils/logger';
import {
    buildMessageMetadata,
    buildRecipientIdentifier,
    validateMessageContent
} from '$lib/utils/message-helpers';
import { extractApiError, get } from '$lib/utils/store-helpers';
import { toDateSafe } from '$lib/utils/time';
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

    const { subscribe, update } = writable<MessagesState>(initialState);

    // Writable para trigger de auto-scroll
    const { subscribe: subscribeLastAdded, set: setLastAdded } = writable<number>(0);

    // Estado de envío por conversación para prevenir doble envío
    const sendingByConv = new Map<string, boolean>();

    // Mutex para evitar race conditions
    let isUpdating = false;
    const updateQueue: Array<() => void> = [];

    const executeUpdate = async (updateFn: () => void): Promise<void> => {
        if (isUpdating) {
            updateQueue.push(updateFn);
            return;
        }
        isUpdating = true;
        try {
            updateFn();
        } finally {
            isUpdating = false;
            if (updateQueue.length > 0) {
                const nextUpdate = updateQueue.shift();
                if (nextUpdate) {
                    setTimeout(() => executeUpdate(nextUpdate), 100);
                }
            }
        }
    };

    // Helpers para control de envío
    const isSending = (conversationId: string): boolean => {
        return sendingByConv.get(normalizeConvId(conversationId)) || false;
    };

    const setSending = (conversationId: string, sending: boolean): void => {
        const normalizedId = normalizeConvId(conversationId);
        if (sending) {
            sendingByConv.set(normalizedId, true);
        } else {
            sendingByConv.delete(normalizedId);
        }
    };

    // Helper para verificar si un mensaje ya existe
    const has = (messageId: string): boolean => {
        let exists = false;
        subscribe(state => {
            exists = state.messages.some(m => m.id === messageId);
        })();
        return exists;
    };

    // Función para marcar conversación como leída
    const markAsRead = (conversationId: string) => {
        const normalizedId = normalizeConvId(conversationId);
        // TODO: Implementar markAsRead en conversationsStore
        devLogger.debug('RT:MARK_READ', { conversationId: normalizedId });
    };

    return {
        subscribe,
        subscribeLastAdded,
        isSending,
        has,
        markAsRead,

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
                const response = await api.get<unknown>(`/messages?${params.toString()}`);
                const endTime = performance.now();

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                logApi('loadMessages: API success', {
                    responseTime: `${(endTime - startTime).toFixed(2)}ms`,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    messageCount: (response as any).data.data.messages.length,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    pagination: (response as any).data.data.pagination,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    metadata: (response as any).data.data.metadata
                });

                // Ordenar mensajes cronológicamente (más viejo arriba, más nuevo abajo)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sortedMessages = (response as any).data.data.messages.sort((a: unknown, b: unknown) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const dateA = new Date(toDateSafe((a as any).timestamp || (a as any).createdAt) || 0);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const dateB = new Date(toDateSafe((b as any).timestamp || (b as any).createdAt) || 0);
                    return dateA.getTime() - dateB.getTime();
                });

                await executeUpdate(() => {
                    update(state => ({
                        ...state,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        messages: sortedMessages as Message[],
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        pagination: (response as any).data.data.pagination || null,
                        filters,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        hasMore: (response as any).data.data.pagination?.hasMore || false,
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

                const response = await api.get<unknown>(`/messages?${params.toString()}`);

                await executeUpdate(() => {
                    update(state => {
                                        // Ordenar todos los mensajes cronológicamente
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const allMessages = [...state.messages, ...(response as any).data.data.messages];
                const sortedMessages = allMessages.sort((a: unknown, b: unknown) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const dateA = new Date(toDateSafe((a as any).timestamp || (a as any).createdAt) || 0);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const dateB = new Date(toDateSafe((b as any).timestamp || (b as any).createdAt) || 0);
                    return dateA.getTime() - dateB.getTime();
                });

                        return {
                            ...state,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            messages: sortedMessages as Message[],
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            pagination: (response as any).data.data.pagination || null,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            hasMore: (response as any).data.data.pagination?.hasMore || false,
                            loading: false
                        };
                    });
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

        sendMessage: async (conversationId: string, content: string, files: File[] = []) => {
            const convId = normalizeConvId(conversationId);

            logStore('sendMessage: start', {
                conversationId: convId,
                contentLength: content.length,
                fileCount: files.length
            });

            // Anti-doble envío
            if (isSending(convId)) {
                logStore('sendMessage: already sending', { conversationId: convId });
                return;
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const agentEmail = (auth as any)?.user?.email;
                if (!agentEmail) {
                    notificationsStore.error('No hay sesión de agente');
                    throw new Error('agent_email_missing');
                }

                // Obtener conversación para recipientIdentifier y payload
                const currentState = get(conversationsStore);
                const conversation = currentState.conversations.find(c => normalizeConvId(c.id) === convId);
                if (!conversation) {
                    notificationsStore.error('Conversación no encontrada');
                    throw new Error('conversation_not_found');
                }

                // Normalizar teléfono del cliente
                const e164 = buildRecipientIdentifier(conversation).replace('whatsapp:', '');
                if (!e164 || !/^\+\d{7,15}$/.test(e164)) {
                    notificationsStore.error('Teléfono de cliente inválido');
                    throw new Error('invalid_customer_phone');
                }

                // Construcción del payload canónico
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const payload: any = {
                    messageId: generateUUID(),
                    type: 'text',
                    content: (content || '').trim(),
                    senderIdentifier: `agent:${agentEmail}`,
                    recipientIdentifier: `whatsapp:${e164}`,
                    metadata: buildMessageMetadata(conversation)
                };

                // Upload de archivos si existen
                if (files.length > 0) {
                    const { uploadFiles } = await import('$lib/services/files');
                    
                    const attachments = await uploadFiles(files, {
                        onProgress: (percent) => {
                            logStore('sendMessage: upload progress', { percent, fileCount: files.length });
                        }
                    });

                    payload.attachments = attachments.map(a => ({ id: a.id }));
                    payload.type = 'file';
                }

                // Inserción optimista
                const tempId = 'tmp_' + crypto.randomUUID();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const optimisticMessage: any = {
                    id: tempId,
                    conversationId: convId,
                    content: payload.content,
                    type: payload.type,
                    direction: 'outbound' as const,
                    status: 'pending' as const,
                    senderIdentifier: payload.senderIdentifier,
                    recipientIdentifier: payload.recipientIdentifier,
                    timestamp: new Date().toISOString(),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    metadata: { ...payload.metadata, localOnly: true } as any,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    sender: { type: 'agent' },
                    recipient: { type: 'whatsapp' }
                };

                await executeUpdate(() => {
                    update(state => {
                        // Agregar mensaje optimista y ordenar cronológicamente
                        const newMessages = [...state.messages, optimisticMessage];
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const sortedMessages = newMessages.sort((a: any, b: any) => {
                            const dateA = new Date(a.timestamp || a.createdAt || 0);
                            const dateB = new Date(b.timestamp || b.createdAt || 0);
                            return dateA.getTime() - dateB.getTime();
                        });

                        return {
                            ...state,
                            messages: sortedMessages
                        };
                    });
                });

                // Marcar como enviando
                setSending(convId, true);

                try {
                    // Enviar usando la nueva capa de transporte
                    const result = await sendOutboundMessage(convId, payload);

                    // Actualizar mensaje optimista con respuesta real
                    if (result.message) {
                        await executeUpdate(() => {
                            update(state => ({
                                ...state,
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                messages: state.messages.map(m =>
                                    m.id === tempId
                                        ? { ...result.message, status: 'sent' } as any
                                        : m
                                )
                            }));
                        });
                    } else {
                        // Si no hay message pero fue exitoso, marcar como enviado
                        await executeUpdate(() => {
                            update(state => ({
                                ...state,
                                messages: state.messages.map(m =>
                                    m.id === tempId
                                        ? { ...m, status: 'sent' }
                                        : m
                                )
                            }));
                        });
                    }

                    // Actualizar conversación si viene en la respuesta
                    if (result.conversation) {
                        conversationsStore.updateConversation(convId, result.conversation);
                    }

                    logStore('sendMessage: success', {
                        messageId: result.message?.id || tempId,
                        conversationId: convId
                    });

                    await executeUpdate(() => {
                        update(state => ({ ...state, loading: false }));
                    });

                    return result.message || optimisticMessage;
                } finally {
                    setSending(convId, false);
                }
            } catch (error: unknown) {
                // Marcar mensaje optimista como fallido
                await executeUpdate(() => {
                    update(state => ({
                        ...state,
                        messages: state.messages.map(m =>
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (m.metadata as any)?.localOnly
                                ? { ...m, status: 'failed' }
                                : m
                        ),
                        loading: false,
                        error: error instanceof Error ? error.message : 'Error desconocido'
                    }));
                });

                setSending(convId, false);
                throw error;
            }
        },

        addMessage: (message: Message) => {
            const normalizedConvId = normalizeConvId(message.conversationId);

            // De-duplicación por ID
            if (has(message.id)) {
                logStore('addMessage: duplicate ignored', { messageId: message.id });
                return;
            }

            executeUpdate(() => {
                update(state => {
                    // Agregar mensaje y ordenar cronológicamente
                    const newMessages = [...state.messages, { ...message, conversationId: normalizedConvId }];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const sortedMessages = newMessages.sort((a: any, b: any) => {
                        const dateA = new Date(a.timestamp || a.createdAt || 0);
                        const dateB = new Date(b.timestamp || b.createdAt || 0);
                        return dateA.getTime() - dateB.getTime();
                    });

                    return {
                        ...state,
                        messages: sortedMessages
                    };
                });
            });

            // Trigger auto-scroll si es la conversación activa
            const currentState = get(messagesStore);
            if (currentState.currentConversationId === normalizedConvId) {
                setLastAdded(Date.now());
                markAsRead(normalizedConvId);
            }
        },

        updateMessage: (messageId: string, updates: Partial<Message>) => {
            executeUpdate(() => {
                update(state => ({
                    ...state,
                    messages: state.messages.map(m =>
                        m.id === messageId ? { ...m, ...updates } : m
                    )
                }));
            });
        },

        removeMessage: (messageId: string) => {
            executeUpdate(() => {
                update(state => ({
                    ...state,
                    messages: state.messages.filter(m => m.id !== messageId)
                }));
            });
        },

        clearMessages: () => {
            executeUpdate(() => {
                update(state => ({
                    ...state,
                    messages: [],
                    pagination: null,
                    hasMore: true
                }));
            });
        },

        setError: (error: string | null) => {
            executeUpdate(() => {
                update(state => ({ ...state, error }));
            });
        },

        setLoading: (loading: boolean) => {
            update(state => ({ ...state, loading }));
        }
    };
};

export const messagesStore = createMessagesStore(); 