import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { DashboardData, DashboardUpdate } from '../types';

interface DashboardState {
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
}

interface DashboardStore extends DashboardState {
  setDashboardData: (data: DashboardData | null) => void;
  updateDashboardData: (update: DashboardUpdate) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshDashboard: () => void;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardStore>()(
  devtools(
    (set) => ({
      // Estado inicial
      dashboardData: null,
      loading: false,
      error: null,

      // Acciones
      setDashboardData: (data) => set({ 
        dashboardData: data,
        loading: false,
        error: null 
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

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ 
        error,
        loading: false 
      }),
      
      clearError: () => set({ error: null }),

      refreshDashboard: () => set({
        loading: true,
        error: null
      }),
    }),
    { name: 'dashboard-store' }
  )
); 