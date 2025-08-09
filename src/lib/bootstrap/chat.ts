// src/lib/bootstrap/chat.ts
import { connectSocket, registerChatListeners } from '$lib/services/socket';
import { conversationsStore } from '$lib/stores/conversations.store';
import { messagesStore } from '$lib/stores/messages.store';

export function wireChat() {
    connectSocket();

    registerChatListeners({
        onNewMessage: (m: any) => {
            messagesStore.addMessage?.(m);
            conversationsStore.addMessage?.(m.conversationId, m);
        },
        onConversationEvent: (e: any) => {
            conversationsStore.updateConversation?.(e.conversationId, e);
        },
        onTypingIndicator: (_t: any) => {
            // no-op en este wiring
        }
    });
} 