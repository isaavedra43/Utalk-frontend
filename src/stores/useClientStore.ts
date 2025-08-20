import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ClientState } from '../types';

interface ClientStoreState {
  clientData: ClientState | null;
  loading: boolean;
  error: string | null;
}

interface ClientStore extends ClientStoreState {
  setClientData: (data: ClientState | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshClients: () => void;
  clearError: () => void;
}

export const useClientStore = create<ClientStore>()(
  devtools(
    (set) => ({
      // Estado inicial
      clientData: null,
      loading: false,
      error: null,

      // Acciones
      setClientData: (data) => set({ 
        clientData: data,
        loading: false,
        error: null 
      }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ 
        error,
        loading: false 
      }),

      clearError: () => set({ error: null }),

      refreshClients: () => set({
        loading: true,
        error: null
      }),
    }),
    { name: 'client-store' }
  )
); 