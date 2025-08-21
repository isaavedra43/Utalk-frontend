import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Conversation, Message, Contact } from '../types';

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>;
  contacts: Contact[];
  loading: boolean;
  error: string | null;
}

interface ChatStore extends ChatState {
  // Conversaciones
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  
  // Mensajes
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  
  // Contactos
  setContacts: (contacts: Contact[]) => void;
  
  // Estado
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Utilidades
  calculateUnreadCount: (conversationId: string) => number;
  markConversationAsRead: (conversationId: string) => void;
  markMessageAsRead: (conversationId: string, messageId: string) => void;
  updateConversationUnreadCount: (conversationId: string, unreadCount: number) => void;
  syncConversationsWithQuery: (conversations: Conversation[]) => void;
}

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      conversations: [],
      activeConversation: null,
      messages: {},
      contacts: [],
      loading: false,
      error: null,

      // Conversaciones
      setConversations: (conversations) => set({ conversations }),
      
      addConversation: (conversation) =>
        set((state) => ({
          conversations: [conversation, ...state.conversations],
        })),

      updateConversation: (id, updates) =>
        set((state) => {
          const sanitizeObj = <T>(obj: T | undefined): Partial<T> => {
            if (!obj) return {} as Partial<T>;
            const result: Partial<T> = {} as Partial<T>;
            const entries = Object.entries(obj as Record<string, unknown>);
            for (const [k, v] of entries) {
              const _k = k;
              if (v === undefined || v === null) continue;
              if (typeof v === 'string' && v.trim() === '') continue;
              (result as Record<string, unknown>)[_k] = v;
            }
            return result;
          };

          return {
            conversations: state.conversations.map((conv) => {
              if (conv.id !== id) return conv;

              const cleanUpdates = sanitizeObj<Partial<Conversation>>(updates);
              const contactUpdates = sanitizeObj<NonNullable<Conversation['contact']>>(updates.contact as NonNullable<Conversation['contact']> | undefined);

              let mergedContact: Conversation['contact'];
              if (updates.contact === undefined) {
                mergedContact = conv.contact;
              } else if (conv.contact) {
                mergedContact = { ...conv.contact, ...contactUpdates };
              } else {
                const cu = contactUpdates as Partial<NonNullable<Conversation['contact']>>;
                if (cu && (cu.name || cu.phoneNumber)) {
                  mergedContact = {
                    name: (cu.name as string) || conv.customerPhone,
                    phoneNumber: (cu.phoneNumber as string) || conv.customerPhone,
                  };
                } else {
                  mergedContact = {
                    name: conv.customerPhone,
                    phoneNumber: conv.customerPhone
                  };
                }
              }

              const merged: Conversation = {
                ...conv,
                ...cleanUpdates,
                id: conv.id,
                contact: mergedContact,
              };

              const computedName = merged.contact?.name || merged.customerName || merged.customerPhone;
              merged.customerName = computedName;

              return merged;
            }),
            activeConversation:
              state.activeConversation?.id === id
                ? (() => {
                    const conv = state.activeConversation!;
                    const cleanUpdates = sanitizeObj<Partial<Conversation>>(updates);
                    const contactUpdates = sanitizeObj<NonNullable<Conversation['contact']>>(updates.contact as NonNullable<Conversation['contact']> | undefined);
                    let mergedContact: Conversation['contact'];
                    if (updates.contact === undefined) {
                      mergedContact = conv.contact;
                    } else if (conv.contact) {
                      mergedContact = { ...conv.contact, ...contactUpdates };
                    } else {
                      const cu = contactUpdates as Partial<NonNullable<Conversation['contact']>>;
                      if (cu && (cu.name || cu.phoneNumber)) {
                        mergedContact = {
                          name: (cu.name as string) || conv.customerPhone,
                          phoneNumber: (cu.phoneNumber as string) || conv.customerPhone,
                        };
                      } else {
                        mergedContact = {
                          name: conv.customerPhone,
                          phoneNumber: conv.customerPhone
                        };
                      }
                    }
                    const merged: Conversation = { ...conv, ...cleanUpdates, id: conv.id, contact: mergedContact };
                    const computedName = merged.contact?.name || merged.customerName || merged.customerPhone;
                    merged.customerName = computedName;
                    return merged;
                  })()
                : state.activeConversation,
          };
        }),

      removeConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== id),
          activeConversation:
            state.activeConversation?.id === id ? null : state.activeConversation,
        })),

      setActiveConversation: (conversation) => set({ activeConversation: conversation }),

      // Mensajes
      setMessages: (conversationId, messages) =>
        set((state) => ({
          messages: { ...state.messages, [conversationId]: messages },
        })),

      addMessage: (conversationId, message) =>
        set((state) => {
          const currentMessages = state.messages[conversationId] || [];
          const updatedMessages = [...currentMessages, message];
          
          // NO actualizar conversation.unreadCount aquí para evitar duplicación
          // El calculateUnreadCount se encargará de contar los mensajes correctamente
          
          return {
            messages: {
              ...state.messages,
              [conversationId]: updatedMessages,
            },
          };
        }),

      updateMessage: (conversationId, messageId, updates) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: (state.messages[conversationId] || []).map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
          },
        })),

      // Contactos
      setContacts: (contacts) => set({ contacts }),

      // Estado
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Utilidades
      calculateUnreadCount: (conversationId: string) => {
        const state = get();
        const messages = state.messages[conversationId] || [];
        
        // Calcular mensajes no leídos del store
        const storeUnreadCount = messages.filter((message: Message) => 
          message.direction === 'inbound' && 
          message.status !== 'read'
        ).length;
        
        // También verificar si hay un unreadCount en la conversación del store
        const conversation = state.conversations.find(c => c.id === conversationId);
        const conversationUnreadCount = conversation?.unreadCount || 0;
        
        // Si hay mensajes en el store, usar ese valor (más preciso)
        // Si no hay mensajes pero hay un unreadCount en la conversación, usar ese
        if (storeUnreadCount > 0) {
          return storeUnreadCount;
        }
        
        return conversationUnreadCount;
      },

      markConversationAsRead: (conversationId: string) => {
        set((state) => {
          const messages = state.messages[conversationId] || [];
          const updatedMessages = messages.map((message: Message) => ({
            ...message,
            status: message.direction === 'inbound' ? 'read' as const : message.status
          }));
          
          // También actualizar el unreadCount de la conversación
          const updatedConversations = state.conversations.map((conversation) => {
            if (conversation.id === conversationId) {
              return {
                ...conversation,
                unreadCount: 0
              };
            }
            return conversation;
          });
          
          return {
            conversations: updatedConversations,
            messages: {
              ...state.messages,
              [conversationId]: updatedMessages
            }
          };
        });
      },

      markMessageAsRead: (conversationId: string, messageId: string) => {
        set((state) => {
          const messages = state.messages[conversationId] || [];
          const updatedMessages = messages.map((message: Message) => 
            message.id === messageId 
              ? { ...message, status: 'read' as const }
              : message
          );
          
          return {
            messages: {
              ...state.messages,
              [conversationId]: updatedMessages
            }
          };
        });
      },

      updateConversationUnreadCount: (conversationId: string, unreadCount: number) => {
        set((state) => {
          const updatedConversations = state.conversations.map((conversation) => {
            if (conversation.id === conversationId) {
              return {
                ...conversation,
                unreadCount
              };
            }
            return conversation;
          });
          
          return {
            conversations: updatedConversations
          };
        });
      },

      syncConversationsWithQuery: (conversations) => set((state) => {
        const existingIds = new Set(state.conversations.map(c => c.id));
        const newConversations = conversations.filter(c => !existingIds.has(c.id));
        
        if (newConversations.length > 0) {
          return {
            conversations: [...state.conversations, ...newConversations]
          };
        }
        return state;
      }),
    }),
    { name: 'chat-store' }
  )
); 