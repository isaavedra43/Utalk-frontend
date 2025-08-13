import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AppState, User, Conversation, Message, Contact } from '../types';

interface AppStore extends AppState {
  // Actions
  setUser: (user: User | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  setContacts: (contacts: Contact[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: AppState = {
  user: null,
  conversations: [],
  activeConversation: null,
  messages: {},
  contacts: [],
  loading: false,
  error: null,
};

export const useAppStore = create<AppStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      setConversations: (conversations) => set({ conversations }),

      addConversation: (conversation) =>
        set((state) => ({
          conversations: [conversation, ...state.conversations],
        })),

      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, ...updates } : conv
          ),
          activeConversation:
            state.activeConversation?.id === id
              ? { ...state.activeConversation, ...updates }
              : state.activeConversation,
        })),

      removeConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== id),
          activeConversation:
            state.activeConversation?.id === id ? null : state.activeConversation,
        })),

      setActiveConversation: (conversation) => set({ activeConversation: conversation }),

      setMessages: (conversationId, messages) =>
        set((state) => ({
          messages: { ...state.messages, [conversationId]: messages },
        })),

      addMessage: (conversationId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [...(state.messages[conversationId] || []), message],
          },
        })),

      updateMessage: (conversationId, messageId, updates) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: (state.messages[conversationId] || []).map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
          },
        })),

      setContacts: (contacts) => set({ contacts }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    {
      name: 'utalk-store',
    }
  )
); 