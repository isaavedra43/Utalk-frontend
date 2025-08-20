import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { TeamState } from '../types';

interface TeamStoreState {
  teamData: TeamState | null;
  loading: boolean;
  error: string | null;
}

interface TeamStore extends TeamStoreState {
  setTeamData: (data: TeamState | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshTeam: () => void;
  clearError: () => void;
}

export const useTeamStore = create<TeamStore>()(
  devtools(
    (set) => ({
      // Estado inicial
      teamData: null,
      loading: false,
      error: null,

      // Acciones
      setTeamData: (data) => set({ 
        teamData: data,
        loading: false,
        error: null 
      }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ 
        error,
        loading: false 
      }),

      clearError: () => set({ error: null }),

      refreshTeam: () => set({
        loading: true,
        error: null
      }),
    }),
    { name: 'team-store' }
  )
); 