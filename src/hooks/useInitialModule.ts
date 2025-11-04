import { useCallback } from 'react';
import { useModulePermissions } from './useModulePermissions';
import { infoLog } from '../config/logger';

/**
 * Hook para determinar el módulo inicial basado en los permisos del usuario
 */
export const useInitialModule = () => {
  const { accessibleModules, loading } = useModulePermissions();

  const getInitialModule = useCallback((): string | null => {
    // Si está cargando, retornar null para esperar
    if (loading) {
      infoLog('Permisos cargando, esperando...');
      return null;
    }

    // Si no hay módulos accesibles, retornar null
    if (!accessibleModules || accessibleModules.length === 0) {
      infoLog('No hay módulos accesibles para el usuario');
      return null;
    }

    // Orden de prioridad para módulos iniciales
    const modulePriority = [
      'dashboard',    // 1. Dashboard (preferido)
      'hr',          // 2. Recursos Humanos
      'chat',        // 3. Chat
      'clients',     // 4. Clientes
      'team',        // 5. Equipo
      'notifications', // 6. Notificaciones
      'internal-chat', // 7. Chat Interno
      'campaigns',   // 8. Campañas
      'phone',       // 9. Teléfono
      'knowledge-base', // 10. Base de Conocimiento
      'supervision', // 11. Supervisión
      'copilot',     // 12. Copiloto
      'inventory',   // 13. Inventario
      'services'     // 14. Servicios
    ];

    // Buscar el primer módulo accesible según la prioridad
    for (const moduleId of modulePriority) {
      const hasAccess = accessibleModules.some(module => module.id === moduleId);
      if (hasAccess) {
        infoLog('Módulo inicial seleccionado', { 
          moduleId, 
          accessibleModules: accessibleModules.map(m => m.id) 
        });
        return moduleId;
      }
    }

    // Si no se encuentra ningún módulo de la lista de prioridad,
    // usar el primer módulo accesible
    const firstAccessibleModule = accessibleModules[0];
    if (firstAccessibleModule) {
      infoLog('Usando primer módulo accesible como inicial', { 
        moduleId: firstAccessibleModule.id,
        accessibleModules: accessibleModules.map(m => m.id) 
      });
      return firstAccessibleModule.id;
    }

    // Si no hay módulos accesibles, retornar null
    infoLog('No se encontraron módulos accesibles');
    return null;
  }, [accessibleModules, loading]);

  return {
    getInitialModule,
    loading
  };
};
