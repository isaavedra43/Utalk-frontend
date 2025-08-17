import { create } from 'zustand';
import { clientProfileService, type ClientProfile } from '../services/clientProfile';

interface ClientProfileState {
  // Cache de perfiles
  profiles: Map<string, { data: ClientProfile; timestamp: number }>;
  
  // Estados de carga
  loadingStates: Map<string, boolean>;
  
  // Acciones
  getProfile: (conversationId: string) => Promise<ClientProfile | null>;
  clearCache: () => void;
  clearProfile: (conversationId: string) => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useClientProfileStore = create<ClientProfileState>((set, get) => ({
  profiles: new Map(),
  loadingStates: new Map(),

  getProfile: async (conversationId: string) => {
    const { profiles, loadingStates } = get();
    
    // Verificar si ya está cargando
    if (loadingStates.get(conversationId)) {
      console.log('🔄 Perfil ya se está cargando, esperando...');
      return null;
    }
    
    // Verificar cache
    const cached = profiles.get(conversationId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ Usando perfil desde cache');
      return cached.data;
    }
    
    // Marcar como cargando
    set(state => {
      const newLoadingStates = new Map(state.loadingStates);
      newLoadingStates.set(conversationId, true);
      return { loadingStates: newLoadingStates };
    });
    
    try {
      console.log('🔄 Cargando perfil del cliente:', conversationId);
      const profile = await clientProfileService.getCompleteClientProfile(conversationId);
      
      if (profile) {
        // Guardar en cache
        set(state => {
          const newProfiles = new Map(state.profiles);
          newProfiles.set(conversationId, {
            data: profile,
            timestamp: Date.now()
          });
          return { profiles: newProfiles };
        });
        
        console.log('✅ Perfil cargado exitosamente');
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error cargando perfil:', error);
      return null;
    } finally {
      // Marcar como no cargando
      set(state => {
        const newLoadingStates = new Map(state.loadingStates);
        newLoadingStates.delete(conversationId);
        return { loadingStates: newLoadingStates };
      });
    }
  },

  clearCache: () => {
    set({ profiles: new Map(), loadingStates: new Map() });
    console.log('🧹 Cache de perfiles limpiado');
  },

  clearProfile: (conversationId: string) => {
    set(state => {
      const newProfiles = new Map(state.profiles);
      const newLoadingStates = new Map(state.loadingStates);
      newProfiles.delete(conversationId);
      newLoadingStates.delete(conversationId);
      return { profiles: newProfiles, loadingStates: newLoadingStates };
    });
  }
})); 