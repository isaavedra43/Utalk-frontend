import { create } from 'zustand';
import { infoLog } from '../config/logger';
import { clientProfileService, type ClientProfile } from '../services/clientProfile';

interface ClientProfileState {
  // Cache de perfiles
  profiles: Map<string, { data: ClientProfile; timestamp: number }>;
  
  // Estados de carga
  loadingStates: Map<string, boolean>;
  
  // Promesas en curso para evitar duplicados
  pendingRequests: Map<string, Promise<ClientProfile | null>>;
  
  // Acciones
  getProfile: (conversationId: string) => Promise<ClientProfile | null>;
  clearCache: () => void;
  clearProfile: (conversationId: string) => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useClientProfileStore = create<ClientProfileState>((set, get) => ({
  profiles: new Map(),
  loadingStates: new Map(),
  pendingRequests: new Map(),

  getProfile: async (conversationId: string) => {
    const { profiles, pendingRequests } = get();
    
    // REDUCIDO: Solo loggear en desarrollo
    if (import.meta.env.DEV) {
      infoLog('🔍 [DEBUG] useClientProfileStore.getProfile iniciado:', { conversationId });
    }
    
    // Verificar si ya hay una petición en curso para este ID
    const pendingRequest = pendingRequests.get(conversationId);
    if (pendingRequest) {
      if (import.meta.env.DEV) {
        infoLog('🔄 Petición ya en curso, esperando resultado...');
      }
      return pendingRequest;
    }
    
    // Verificar cache
    const cached = profiles.get(conversationId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      if (import.meta.env.DEV) {
        infoLog('✅ Usando perfil desde cache');
      }
      return cached.data;
    }
    
    if (import.meta.env.DEV) {
      infoLog('🔄 [DEBUG] Cache miss en store, creando nueva petición...');
    }
    
    // Crear nueva petición
    const requestPromise = (async () => {
      // Marcar como cargando
      set(state => {
        const newLoadingStates = new Map(state.loadingStates);
        newLoadingStates.set(conversationId, true);
        return { loadingStates: newLoadingStates };
      });
      
      try {
        if (import.meta.env.DEV) {
          infoLog('🔄 Cargando perfil del cliente:', conversationId);
        }
        
        // NUEVO: El servicio ya tiene retry incorporado, solo llamarlo
        const profile = await clientProfileService.getCompleteClientProfile(conversationId);
        
        if (import.meta.env.DEV) {
          infoLog('📊 [DEBUG] Resultado de clientProfileService:', {
            conversationId,
            hasProfile: !!profile,
            profileName: profile?.name,
            profilePhone: profile?.phone
          });
        }
        
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
          
          if (import.meta.env.DEV) {
            infoLog('✅ Perfil cargado exitosamente');
          }
          return profile;
        }
        
        if (import.meta.env.DEV) {
          infoLog('⚠️ [DEBUG] clientProfileService devolvió null');
        }
        return null;
      } catch (error) {
        if (import.meta.env.DEV) {
          infoLog('❌ [DEBUG] Error en useClientProfileStore:', {
            conversationId,
            errorType: typeof error,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorObject: error
          });
        }
        
        // NUEVO: En caso de error, intentar obtener perfil mock del servicio
        try {
          if (import.meta.env.DEV) {
            infoLog('🔄 [DEBUG] Intentando obtener perfil mock como fallback...');
          }
          const mockProfile = await clientProfileService.getCompleteClientProfile(conversationId);
          if (mockProfile) {
            if (import.meta.env.DEV) {
              infoLog('✅ [DEBUG] Perfil mock obtenido exitosamente');
            }
            return mockProfile;
          }
        } catch (mockError) {
          if (import.meta.env.DEV) {
            infoLog('❌ [DEBUG] Error obteniendo perfil mock:', mockError);
          }
        }
        
        return null;
      } finally {
        // Marcar como no cargando y limpiar petición pendiente
        set(state => {
          const newLoadingStates = new Map(state.loadingStates);
          const newPendingRequests = new Map(state.pendingRequests);
          newLoadingStates.delete(conversationId);
          newPendingRequests.delete(conversationId);
          return { loadingStates: newLoadingStates, pendingRequests: newPendingRequests };
        });
        
        if (import.meta.env.DEV) {
          infoLog('🧹 [DEBUG] Limpieza completada para:', conversationId);
        }
      }
    })();
    
    // Guardar la petición en curso
    set(state => {
      const newPendingRequests = new Map(state.pendingRequests);
      newPendingRequests.set(conversationId, requestPromise);
      return { pendingRequests: newPendingRequests };
    });
    
    return requestPromise;
  },

  clearCache: () => {
    set({ profiles: new Map(), loadingStates: new Map(), pendingRequests: new Map() });
    if (import.meta.env.DEV) {
      infoLog('🧹 Cache de perfiles limpiado');
    }
  },

  clearProfile: (conversationId: string) => {
    set(state => {
      const newProfiles = new Map(state.profiles);
      const newLoadingStates = new Map(state.loadingStates);
      const newPendingRequests = new Map(state.pendingRequests);
      newProfiles.delete(conversationId);
      newLoadingStates.delete(conversationId);
      newPendingRequests.delete(conversationId);
      return { profiles: newProfiles, loadingStates: newLoadingStates, pendingRequests: newPendingRequests };
    });
  }
})); 