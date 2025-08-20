import { create } from 'zustand';
import { infoLog } from '../config/logger';
import { devtools } from 'zustand/middleware';

interface UIState {
  currentModule: string;
  moduleHistory: string[];
  loading: boolean;
  error: string | null;
  sidebarOpen?: boolean; // Opcional para compatibilidad futura
}

interface UIStore extends UIState {
  // Navegación
  setCurrentModule: (module: string) => void;
  navigateToModule: (module: string) => void;
  goBack: () => void;
  
  // Estado global
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Sidebar (futuro)
  toggleSidebar?: () => void;
  
  // Utilidades
  reset: () => void;
  invalidateQueryCache: () => void;
  
  // Sincronización multi-tab (futuro)
  syncWithOtherTabs?: () => void;
  persistCriticalState?: () => void;
  restoreCriticalState?: () => void;
}

const initialState: UIState = {
  currentModule: 'chat',
  moduleHistory: [],
  loading: false,
  error: null,
  sidebarOpen: false,
};

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      ...initialState,

      // Navegación
      setCurrentModule: (module) => set({ currentModule: module }),

      navigateToModule: (module) => set((state) => ({
        currentModule: module,
        moduleHistory: [...state.moduleHistory, state.currentModule].slice(-10) // Mantener solo los últimos 10
      })),

      goBack: () => set((state) => {
        const previousModule = state.moduleHistory[state.moduleHistory.length - 1];
        if (previousModule) {
          return {
            currentModule: previousModule,
            moduleHistory: state.moduleHistory.slice(0, -1)
          };
        }
        return state;
      }),

      // Estado global
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Sidebar (futuro)
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      
      // Utilidades
      reset: () => set(initialState),
      
      invalidateQueryCache: () => {
        // FUTURO: Implementar invalidación real de React Query
        // queryClient.invalidateQueries(['conversations']);
      },
      
      // Sincronización multi-tab (futuro)
      syncWithOtherTabs: () => {
        // FUTURO: Implementar sincronización con otras pestañas
        infoLog('🔄 useUIStore - Sincronización multi-tab no implementada aún');
      },
      
      persistCriticalState: () => {
        // FUTURO: Persistir estado crítico en localStorage
        infoLog('💾 useUIStore - Persistencia de estado no implementada aún');
      },
      
      restoreCriticalState: () => {
        // FUTURO: Restaurar estado crítico desde localStorage
        infoLog('🔄 useUIStore - Restauración de estado no implementada aún');
        return null;
      },
    }),
    { name: 'ui-store' }
  )
); 