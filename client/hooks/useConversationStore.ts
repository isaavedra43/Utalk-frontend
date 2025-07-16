import { create } from 'zustand';
import type { Conversation, Message } from '@/types/api';

interface ConversationState {
  conversations: Conversation[];
  messagesByConversation: Record<string, Message[]>;
  activeConversationId: string | null;

  setConversations: (conversations: Conversation[]) => void;
  addMessage: (message: Message) => void;
  setActiveConversationId: (conversationId: string | null) => void;
  setMessagesForConversation: (conversationId: string, messages: Message[]) => void;
  updateConversation: (updatedConversation: Partial<Conversation> & { id: string }) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  messagesByConversation: {},
  activeConversationId: null,

  setConversations: (conversations) => set({ conversations }),
  
  addMessage: (message) => set((state) => {
    const { conversationId } = message;
    const newMessages = [...(state.messagesByConversation[conversationId] || []), message];
    return {
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: newMessages,
      },
      // Actualizar el último mensaje en la lista de conversaciones
      conversations: state.conversations.map(c => 
        c.id === conversationId ? { ...c, lastMessage: message.content, timestamp: message.timestamp } : c
      )
    };
  }),

  setActiveConversationId: (conversationId) => set({ activeConversationId: conversationId }),

  setMessagesForConversation: (conversationId, messages) => set((state) => ({
    messagesByConversation: {
      ...state.messagesByConversation,
      [conversationId]: messages,
    },
  })),
  
  updateConversation: (updatedConversation) => set((state) => ({
      conversations: state.conversations.map(c => 
        c.id === updatedConversation.id ? { ...c, ...updatedConversation } : c
      )
  })),

})); 