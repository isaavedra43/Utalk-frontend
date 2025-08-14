import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AppState, User, Conversation, Message, Contact, DashboardData, DashboardUpdate, TeamState } from '../types';

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
    }),
    {
      name: 'utalk-store',
    }
  )
); 