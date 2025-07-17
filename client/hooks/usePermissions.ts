import { useMemo } from 'react';
import { 
  UserRole, 
  UserPermissions, 
  PermissionChecker, 
  ROLE_DEFINITIONS 
} from '@/types/permissions';
import { logger } from '@/lib/utils';

/**
 * Hook para manejar permisos y roles de usuario
 */
export function usePermissions() {
  
  // Obtener rol actual del usuario desde localStorage/contexto
  const getCurrentUserRole = (): UserRole => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        // Decodificar JWT para obtener rol
        const payload = JSON.parse(atob(authToken.split('.')[1]));
        const role = payload.role || payload.userRole || 'viewer';
        
        // Validar que el rol sea válido
        if (['admin', 'agent', 'viewer'].includes(role)) {
          return role as UserRole;
        }
      }
    } catch (error) {
      logger.auth('Error obteniendo rol del usuario', { error }, true);
    }
    
    // Fallback a viewer si no se puede determinar
    return 'viewer';
  };

  const currentRole = getCurrentUserRole();
  const roleDefinition = ROLE_DEFINITIONS[currentRole];

  // Memoizar permisos para optimizar rendimiento
  const permissions = useMemo(() => {
    return roleDefinition.permissions;
  }, [roleDefinition.permissions]);

  // Funciones de utilidad
  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return PermissionChecker.hasPermission(permissions, permission);
  };

  const canPerformAction = (action: string): boolean => {
    return PermissionChecker.canPerformAction(currentRole, action);
  };

  const canAccessRoute = (route: string): boolean => {
    return PermissionChecker.canAccessRoute(currentRole, route);
  };

  const canPerformHttpMethod = (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    resource: string
  ): boolean => {
    return PermissionChecker.canPerformHttpMethod(currentRole, method, resource);
  };

  // Verificaciones específicas para UI
  const uiPermissions = useMemo(() => ({
    // 👁 Visualización
    canViewConversations: hasPermission('read'),
    canViewContacts: hasPermission('read'),
    canViewCampaigns: hasPermission('read'),
    canViewAnalytics: hasPermission('read'),
    canViewTeam: currentRole === 'admin' || canPerformAction('view_team_basic'),
    
    // ✍️ Edición y creación
    canSendMessages: hasPermission('write') && canPerformAction('send_messages'),
    canCreateContacts: hasPermission('write') && canPerformAction('create_contacts'),
    canEditContacts: hasPermission('write') && canPerformAction('edit_contacts'),
    canCreateCampaigns: hasPermission('write') && canPerformAction('create_campaigns'),
    canEditCampaigns: hasPermission('write') && canPerformAction('edit_campaigns'),
    
    // ✅ Aprobación
    canApproveCampaigns: hasPermission('approve'),
    
    // 🗑 Eliminación
    canDeleteContacts: hasPermission('admin') && canPerformAction('delete_contacts'),
    canDeleteCampaigns: hasPermission('admin') && canPerformAction('delete_campaigns'),
    
    // 👑 Administración
    canManageTeam: hasPermission('admin') && canPerformAction('manage_team'),
    canEditSettings: hasPermission('admin') && canPerformAction('edit_system_settings'),
    canViewBilling: hasPermission('admin') && canPerformAction('view_billing'),
    
    // 📊 Exportación
    canExportData: currentRole === 'admin' || canPerformAction('export_own_data') || canPerformAction('export_reports'),
    
    // 🛡 Acceso a rutas
    canAccessCampaigns: canAccessRoute('/campañas'),
    canAccessTeam: canAccessRoute('/equipo'),
    canAccessSettings: canAccessRoute('/configuración'),
  }), [currentRole, permissions]);

  // Información del rol actual
  const roleInfo = useMemo(() => {
    const report = PermissionChecker.getPermissionReport(currentRole);
    return {
      role: currentRole,
      name: roleDefinition.name,
      description: roleDefinition.description,
      permissionLevel: report.summary.permissionLevel,
      activePermissions: report.summary.activePermissions,
      totalPermissions: report.summary.totalPermissions
    };
  }, [currentRole, roleDefinition]);

  // Logging para debugging
  logger.auth('Permisos del usuario cargados', {
    role: currentRole,
    permissionLevel: roleInfo.permissionLevel,
    key_permissions: {
      read: permissions.read,
      write: permissions.write,
      approve: permissions.approve,
      admin: permissions.admin
    }
  });

  return {
    // Información básica
    currentRole,
    permissions,
    roleInfo,
    
    // Funciones de verificación
    hasPermission,
    canPerformAction,
    canAccessRoute,
    canPerformHttpMethod,
    
    // Permisos específicos para UI
    ...uiPermissions,
    
    // Utilidades
    getAllowedActions: () => PermissionChecker.getAllowedActions(currentRole),
    getRestrictedActions: () => PermissionChecker.getRestrictedActions(currentRole),
    
    // Para debugging
    debug: {
      roleDefinition,
      allPermissions: permissions,
      report: PermissionChecker.getPermissionReport(currentRole)
    }
  };
}

/**
 * Hook para verificar un permiso específico (conveniente para componentes)
 */
export function useHasPermission(permission: keyof UserPermissions): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

/**
 * Hook para verificar si se puede realizar una acción específica
 */
export function useCanPerformAction(action: string): boolean {
  const { canPerformAction } = usePermissions();
  return canPerformAction(action);
}

/**
 * Hook para verificar acceso a rutas
 */
export function useCanAccessRoute(route: string): boolean {
  const { canAccessRoute } = usePermissions();
  return canAccessRoute(route);
} 