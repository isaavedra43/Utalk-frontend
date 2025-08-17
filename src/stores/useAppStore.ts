import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AppState, User, Conversation, Message, Contact, DashboardData, DashboardUpdate, TeamState, ClientState } from '../types';
import { getTabSyncManager } from '../utils/tabSync';

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
  // NUEVAS acciones para mensajes sin leer
  calculateUnreadCount: (conversationId: string) => number;
  markConversationAsRead: (conversationId: string) => void;
  markMessageAsRead: (conversationId: string, messageId: string) => void;
  // FASE 1: Nuevas acciones para sincronización con React Query
  syncConversationsWithQuery: (conversations: Conversation[]) => void;
  invalidateQueryCache: () => void;
  // FASE 5: Funciones de sincronización multi-tab
  syncWithOtherTabs: () => void;
  persistCriticalState: () => void;
  restoreCriticalState: () => unknown;
  // NUEVAS acciones de navegación
  setCurrentModule: (module: string) => void;
  navigateToModule: (module: string) => void;
  goBack: () => void;
  // NUEVAS acciones del dashboard
  setDashboardData: (data: DashboardData | null) => void;
  updateDashboardData: (update: DashboardUpdate) => void;
  setDashboardLoading: (loading: boolean) => void;
  setDashboardError: (error: string | null) => void;
  refreshDashboard: () => void;
  // NUEVAS acciones del equipo
  setTeamData: (data: TeamState | null) => void;
  setTeamLoading: (loading: boolean) => void;
  setTeamError: (error: string | null) => void;
  refreshTeam: () => void;
  // NUEVAS acciones de clientes
  setClientData: (data: ClientState | null) => void;
  setClientLoading: (loading: boolean) => void;
  setClientError: (error: string | null) => void;
  refreshClients: () => void;
}

const initialState: AppState = {
  user: null,
  conversations: [],
  activeConversation: null,
  messages: {},
  contacts: [],
  loading: false,
  error: null,
  // NUEVO: Estado inicial de navegación
  currentModule: 'chat',
  moduleHistory: [],
  // NUEVO: Estado inicial del dashboard
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,
  // NUEVO: Estado inicial del equipo
  teamData: null,
  teamLoading: false,
  teamError: null,
  // NUEVO: Estado inicial de clientes
  clientData: null,
  clientLoading: false,
  clientError: null,
};

export const useAppStore = create<AppStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      setConversations: (conversations) => set({ conversations }),

      addConversation: (conversation) =>
        set((state: AppState) => ({
          conversations: [conversation, ...state.conversations],
        })),

      updateConversation: (id, updates) =>
        set((state: AppState) => ({
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

      // FASE 1: Nuevas acciones para sincronización con React Query
      syncConversationsWithQuery: (conversations) => set((state) => {
        // Combinar conversaciones del store con las de React Query
        const existingIds = new Set(state.conversations.map(c => c.id));
        const newConversations = conversations.filter(c => !existingIds.has(c.id));
        
        if (newConversations.length > 0) {
          console.log('🔄 useAppStore - Sincronizando nuevas conversaciones:', newConversations.length);
          return {
            conversations: [...state.conversations, ...newConversations]
          };
        }
        return state;
      }),

      invalidateQueryCache: () => {
        // FASE 1: Invalidar cache de React Query cuando sea necesario
        // Por ahora solo log, se implementará cuando sea necesario
        console.log('🔄 useAppStore - Cache invalidation request');
        
        // FUTURO: Implementar invalidación real de React Query
        // queryClient.invalidateQueries(['conversations']);
      },

      // FASE 5: Funciones de sincronización multi-tab
      syncWithOtherTabs: () => {
        try {
          const tabSync = getTabSyncManager();
          const state = useAppStore.getState();
          
          // Sincronizar conversaciones
          tabSync.updateConversations(state.conversations);
          
          // Sincronizar conversación activa
          tabSync.selectConversation(state.activeConversation?.id || null);
          
          console.log('🔄 useAppStore - Estado sincronizado con otras pestañas');
        } catch (error) {
          console.warn('⚠️ useAppStore - Error sincronizando con otras pestañas:', error);
        }
      },

      // FASE 5: Persistir estado crítico en localStorage
      persistCriticalState: () => {
        try {
          const state = useAppStore.getState();
          const criticalState = {
            activeConversationId: state.activeConversation?.id,
            lastSync: Date.now(),
            conversationsCount: state.conversations.length
          };
          
          localStorage.setItem('utalk-critical-state', JSON.stringify(criticalState));
          console.log('💾 useAppStore - Estado crítico persistido');
        } catch (error) {
          console.warn('⚠️ useAppStore - Error persistiendo estado:', error);
        }
      },

      // FASE 5: Restaurar estado crítico desde localStorage
      restoreCriticalState: () => {
        try {
          const stored = localStorage.getItem('utalk-critical-state');
          if (stored) {
            const criticalState = JSON.parse(stored);
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 horas
            
            if (now - criticalState.lastSync < maxAge) {
              console.log('🔄 useAppStore - Estado crítico restaurado:', criticalState);
              return criticalState;
            } else {
              localStorage.removeItem('utalk-critical-state');
              console.log('🧹 useAppStore - Estado crítico expirado, eliminado');
            }
          }
        } catch (error) {
          console.warn('⚠️ useAppStore - Error restaurando estado:', error);
        }
        return null;
      },

      // NUEVAS acciones de navegación
      setCurrentModule: (module) => set({ currentModule: module as AppState['currentModule'] }),

      navigateToModule: (module) => set((state) => ({
        currentModule: module as AppState['currentModule'],
        moduleHistory: [...state.moduleHistory, state.currentModule].slice(-10) // Mantener solo los últimos 10
      })),

      goBack: () => set((state) => {
        const previousModule = state.moduleHistory[state.moduleHistory.length - 1];
        if (previousModule) {
          return {
            currentModule: previousModule as AppState['currentModule'],
            moduleHistory: state.moduleHistory.slice(0, -1)
          };
        }
        return state;
      }),

      // NUEVAS acciones del dashboard
      setDashboardData: (data) => set({ 
        dashboardData: data,
        dashboardLoading: false,
        dashboardError: null 
      }),

      updateDashboardData: (update) => set((state) => {
        if (!state.dashboardData) return state;
        
        return {
          dashboardData: {
            ...state.dashboardData,
            ...update.data,
            lastUpdated: update.timestamp
          }
        };
      }),

      setDashboardLoading: (loading) => set({ dashboardLoading: loading }),

      setDashboardError: (error) => set({ 
        dashboardError: error,
        dashboardLoading: false 
      }),

      refreshDashboard: () => set({
        dashboardLoading: true,
        dashboardError: null
      }),

      // NUEVAS acciones del equipo
      setTeamData: (data: TeamState | null) => set({ 
        teamData: data,
        teamLoading: false,
        teamError: null 
      }),

      setTeamLoading: (loading: boolean) => set({ teamLoading: loading }),

      setTeamError: (error: string | null) => set({ 
        teamError: error,
        teamLoading: false 
      }),

      refreshTeam: () => set({
        teamLoading: true,
        teamError: null
      }),

      // NUEVAS acciones de clientes
      setClientData: (data: ClientState | null) => set({ 
        clientData: data,
        clientLoading: false,
        clientError: null 
      }),

      setClientLoading: (loading: boolean) => set({ clientLoading: loading }),

      setClientError: (error: string | null) => set({ 
        clientError: error,
        clientLoading: false 
      }),

      refreshClients: () => set({
        clientLoading: true,
        clientError: null
      }),

      // NUEVAS acciones para mensajes sin leer
      calculateUnreadCount: (conversationId: string) => {
        const state = useAppStore.getState() as AppState;
        const messages = state.messages[conversationId] || [];
        
        // Contar mensajes entrantes no leídos
        const unreadCount = messages.filter((message: Message) => 
          message.direction === 'inbound' && 
          message.status !== 'read'
        ).length;
        
        return unreadCount;
      },

      markConversationAsRead: (conversationId: string) => {
        set((state) => {
          const messages = state.messages[conversationId] || [];
          const updatedMessages = messages.map((message: Message) => ({
            ...message,
            status: message.direction === 'inbound' ? 'read' as const : message.status
          }));
          
          return {
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
    }),
    {
      name: 'utalk-store',
    }
  )
); 