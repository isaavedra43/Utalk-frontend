import React from 'react';
import { useModulePermissions } from './useModulePermissions';

// Hook para verificar permisos en componentes
export const useProtectedAccess = (moduleId: string, requiredAction: 'read' | 'write' | 'configure' = 'read') => {
  const { canAccessModule, hasPermission, loading } = useModulePermissions();

  const hasAccess = React.useMemo(() => {
    if (loading) return false;
    return canAccessModule(moduleId) && hasPermission(moduleId, requiredAction);
  }, [loading, canAccessModule, hasPermission, moduleId, requiredAction]);

  return {
    hasAccess,
    loading,
    canAccessModule: canAccessModule(moduleId),
    hasPermission: hasPermission(moduleId, requiredAction)
  };
};
