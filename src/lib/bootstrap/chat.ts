// src/lib/bootstrap/chat.ts
import { page } from '$app/stores';
import { connectSocket, isConnected, joinConversation, leaveConversation, registerChatListeners } from '$lib/services/socket';
import { normalizeConvId } from '$lib/services/transport';
import { conversationsStore } from '$lib/stores/conversations.store';
import { messagesStore } from '$lib/stores/messages.store';

let currentConversationId: string | null = null;
let unsubscribe: (() => void) | null = null;

// Función para manejar cambio de conversación
function handleConversationChange(newConversationId: string | null) {
    // Salir de la conversación anterior
    if (currentConversationId) {
        leaveConversation(currentConversationId);
        console.debug('RT:LEAVE_PREV', { conversationId: currentConversationId });
    }

    // Unirse a la nueva conversación
    if (newConversationId) {
        const normalizedId = normalizeConvId(newConversationId);
        joinConversation(normalizedId);
        console.debug('RT:JOIN_NEW', { conversationId: normalizedId });

        // Marcar como leída
        conversationsStore.markAsRead(normalizedId);
    }

    currentConversationId = newConversationId;
}

// Función para manejar visibilitychange
function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && !isConnected()) {
        console.debug('RT:VISIBILITY_RECONNECT', { timestamp: new Date().toISOString() });
        connectSocket();
    }
}

export function wireChat(): () => void {
    // Conectar socket
    connectSocket();

    // Registrar listeners para eventos de chat
    unsubscribe = registerChatListeners({
        onNewMessage: (message: any) => {
            const normalizedConvId = normalizeConvId(message.conversationId);

            // De-duplicación
            if (messagesStore.has(message.id)) {
                return;
            }

            // Agregar mensaje al store
            messagesStore.addMessage(message);

            // Actualizar conversación
            conversationsStore.addMessage(normalizedConvId, message);
        },
        onConversationEvent: (event: any) => {
            const normalizedConvId = normalizeConvId(event.conversationId);
            conversationsStore.updateConversation(normalizedConvId, event);
        },
        onTypingIndicator: (typing: any) => {
            // TODO: Implementar indicador de escritura
            console.debug('RT:TYPING', {
                conversationId: typing.conversationId,
                isTyping: typing.isTyping
            });
        }
    });

    // Suscribirse a cambios de página para join/leave automático
    const pageUnsubscribe = page.subscribe(($page) => {
        const conversationId = $page.params.id || null;
        if (conversationId !== currentConversationId) {
            handleConversationChange(conversationId);
        }
    });

    // Agregar listener para visibilitychange
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Retornar función de cleanup
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
        pageUnsubscribe();
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        // Salir de la conversación actual al desmontar
        if (currentConversationId) {
            leaveConversation(currentConversationId);
        }
    };
} 