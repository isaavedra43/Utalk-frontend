// src/lib/bootstrap/chat.ts
import { connectSocket, registerChatListeners } from '$lib/services/socket';
import { normalizeConvId } from '$lib/services/transport';
import { conversationsStore } from '$lib/stores/conversations.store';
import { messagesStore } from '$lib/stores/messages.store';

export function wireChat(): () => void {
    connectSocket();

    const unsubscribe = registerChatListeners({
        onNewMessage: (m: any) => {
            const normalizedConvId = normalizeConvId(m.conversationId);

            // De-duplicación
            if (messagesStore.has(m.id)) {
                return;
            }

            messagesStore.addMessage(m);
            conversationsStore.addMessage?.(normalizedConvId, m);
        },
        onConversationEvent: (e: any) => {
            const normalizedConvId = normalizeConvId(e.conversationId);
            conversationsStore.updateConversation?.(normalizedConvId, e);
        },
        onTypingIndicator: (_t: any) => {
            // no-op en este wiring
        }
    });

    return unsubscribe;
} 