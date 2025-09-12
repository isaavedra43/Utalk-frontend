import { useEffect } from 'react';
import { useMonitoring } from './MonitoringContext';

// Hook para integrar monitoreo con stores de Zustand
export const useZustandMonitoring = () => {
  const { addStateChange } = useMonitoring();

  useEffect(() => {
    // Función para interceptar cambios de estado de Zustand
    const originalCreate = (window as any).zustand?.create;
    
    if (originalCreate) {
      (window as any).zustand.create = function(stateCreator: any, ...args: any[]) {
        return originalCreate((set: any, get: any, api: any) => {
          const state = stateCreator(
            (partial: any, replace?: boolean) => {
              const previousState = get();
              
              // Llamar al set original
              const result = set(partial, replace);
              
              const newState = get();
              
              // Detectar qué store cambió basado en las propiedades
              let storeName = 'unknown';
              if (newState.user !== undefined || newState.isAuthenticated !== undefined) {
                storeName = 'authStore';
              } else if (newState.conversations !== undefined || newState.selectedConversation !== undefined) {
                storeName = 'chatStore';
              } else if (newState.clients !== undefined) {
                storeName = 'clientStore';
              } else if (newState.dashboardData !== undefined) {
                storeName = 'dashboardStore';
              } else if (newState.teamMembers !== undefined) {
                storeName = 'teamStore';
              } else if (newState.isSidebarOpen !== undefined) {
                storeName = 'uiStore';
              }
              
              // Calcular diferencias
              const diff = calculateDiff(previousState, newState);
              
              // Detectar acción basada en los cambios
              let action = 'setState';
              if (typeof partial === 'function') {
                action = 'updateFunction';
              } else if (Object.keys(diff).length === 1) {
                action = `update_${Object.keys(diff)[0]}`;
              }
              
              // Agregar al monitoreo
              addStateChange({
                store: storeName,
                action,
                previousState: previousState,
                newState: newState,
                diff: diff
              });
              
              return result;
            },
            get,
            api
          );
          
          return state;
        }, ...args);
      };
    }

    // Interceptar eventos de validación si existen
    const handleValidation = (event: CustomEvent) => {
      // Ya está manejado por el interceptor principal
    };

    // Escuchar eventos de monitoreo personalizados
    window.addEventListener('monitoring:clear-data', () => {
      // Limpiar datos si es necesario
    });

    window.addEventListener('monitoring:export-data', (event: CustomEvent) => {
      // Exportar datos si es necesario
    });

    return () => {
      // Cleanup si es necesario
      window.removeEventListener('monitoring:clear-data', () => {});
      window.removeEventListener('monitoring:export-data', () => {});
    };
  }, [addStateChange]);
};

// Función helper para calcular diferencias entre objetos
function calculateDiff(prev: any, next: any): Record<string, any> {
  const diff: Record<string, any> = {};
  
  // Comparar propiedades del objeto siguiente
  for (const key in next) {
    if (next.hasOwnProperty(key)) {
      if (prev[key] !== next[key]) {
        diff[key] = {
          from: prev[key],
          to: next[key]
        };
      }
    }
  }
  
  // Verificar propiedades eliminadas
  for (const key in prev) {
    if (prev.hasOwnProperty(key) && !next.hasOwnProperty(key)) {
      diff[key] = {
        from: prev[key],
        to: undefined
      };
    }
  }
  
  return diff;
}
