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
  clearMessages: (conversationId: string) => void;
  getConversation: (conversationId: string) => Conversation | undefined;
  getMessages: (conversationId: string) => Message[];
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  messagesByConversation: {},
  activeConversationId: null,

  setConversations: (conversations) => {
    console.log("🏪 Store: Actualizando", conversations.length, "conversaciones");
    set({ conversations });
  },
  
  addMessage: (message) => {
    console.log("📨 Store: Agregando mensaje:", message.id, "a conversación:", message.conversationId);
    
    set((state) => {
      const { conversationId } = message;
      const existingMessages = state.messagesByConversation[conversationId] || [];
      
      // Evitar duplicados por ID
      const messageExists = existingMessages.some(m => m.id === message.id);
      if (messageExists) {
        console.log("⚠️ Store: Mensaje ya existe, ignorando duplicado:", message.id);
        return state;
      }
      
      const newMessages = [...existingMessages, message].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: newMessages,
        },
        // Actualizar el último mensaje en la lista de conversaciones
        conversations: state.conversations.map(c => 
          c.id === conversationId 
            ? { 
                ...c, 
                lastMessage: message.content, 
                timestamp: message.timestamp,
                isUnread: message.sender !== "agent" // Solo marcar como no leído si es del cliente
              } 
            : c
        )
      };
    });
  },

  setActiveConversationId: (conversationId) => {
    console.log("🎯 Store: Conversación activa:", conversationId);
    set({ activeConversationId: conversationId });
  },

  setMessagesForConversation: (conversationId, messages) => {
    console.log("📦 Store: Configurando", messages.length, "mensajes para conversación:", conversationId);
    
    set((state) => {
      // Ordenar mensajes por timestamp
      const sortedMessages = [...messages].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: sortedMessages,
        },
      };
    });
  },
  
  updateConversation: (updatedConversation) => {
    console.log("🔄 Store: Actualizando conversación:", updatedConversation.id);
    
    set((state) => ({
      conversations: state.conversations.map(c => 
        c.id === updatedConversation.id ? { ...c, ...updatedConversation } : c
      )
    }));
  },

  clearMessages: (conversationId) => {
    console.log("🗑️ Store: Limpiando mensajes de conversación:", conversationId);
    
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [],
      },
    }));
  },

  // Métodos de utilidad (getters)
  getConversation: (conversationId) => {
    const state = get();
    return state.conversations.find(c => c.id === conversationId);
  },

  getMessages: (conversationId) => {
    const state = get();
    return state.messagesByConversation[conversationId] || [];
  },
})); 