import { useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/utils';

// 🔧 TIPOS DE PERMISOS SEGÚN ROLES UTalk
export type Permission = 
  // Permisos de lectura
  | 'read_conversations' 
  | 'read_messages'
  | 'read_contacts'
  | 'read_campaigns'
  | 'read_team'
  | 'read_dashboard'
  | 'read_knowledge_base'
  
  // Permisos de escritura/envío
  | 'send_messages'
  | 'create_contacts'
  | 'edit_contacts'
  | 'delete_contacts'
  
  // Permisos de gestión de conversaciones
  | 'assign_conversations'
  | 'close_conversations'
  | 'mark_as_read'
  
  // Permisos de campañas
  | 'create_campaigns'
  | 'edit_campaigns'
  | 'send_campaigns'
  | 'delete_campaigns'
  
  // Permisos administrativos
  | 'manage_team'
  | 'manage_settings'
  | 'view_analytics'
  | 'access_knowledge_base_admin'
  | 'manage_permissions';

// 🔧 DEFINICIÓN DE ROLES Y SUS PERMISOS
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // 👁️ VIEWER: Solo puede ver mensajes/conversaciones, NO puede enviar ni administrar
  viewer: [
    'read_conversations',
    'read_messages',
    'read_contacts',
    'read_dashboard',
    'read_knowledge_base'
    // ❌ NO PUEDE: send_messages, assign_conversations, create_*, manage_*
  ],
  
  // 📝 AGENT: Acceso completo a mensajería y contactos
  agent: [
    // Permisos de lectura
    'read_conversations',
    'read_messages',
    'read_contacts',
    'read_campaigns',
    'read_dashboard',
    'read_knowledge_base',
    
    // Permisos de escritura
    'send_messages',
    'create_contacts',
    'edit_contacts',
    'mark_as_read',
    
    // Gestión de conversaciones
    'assign_conversations',
    'close_conversations',
    
    // Campañas básicas
    'create_campaigns',
    'edit_campaigns',
    'send_campaigns'
  ],
  
  // 👑 ADMIN: Acceso total
  admin: [
    // Todos los permisos de agent
    'read_conversations',
    'read_messages',
    'read_contacts',
    'read_campaigns',
    'read_team',
    'read_dashboard',
    'read_knowledge_base',
    'send_messages',
    'create_contacts',
    'edit_contacts',
    'delete_contacts',
    'assign_conversations',
    'close_conversations',
    'mark_as_read',
    'create_campaigns',
    'edit_campaigns',
    'send_campaigns',
    'delete_campaigns',
    
    // Permisos administrativos exclusivos
    'manage_team',
    'manage_settings',
    'view_analytics',
    'access_knowledge_base_admin',
    'manage_permissions'
  ]
};

/**
 * 🔧 Hook principal para gestión de permisos UTalk
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  // Si no está autenticado, no tiene permisos
  if (!isAuthenticated || !user) {
    return {
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      canSendMessages: false,
      canAssignConversations: false,
      canManageTeam: false,
      canAccessAdmin: false,
      isViewer: false,
      isAgent: false,
      isAdmin: false,
      role: null,
      permissions: [] as Permission[]
    };
  }

  const userRole = user.role?.toLowerCase() || 'viewer';
  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.viewer;

  logger.auth('Evaluando permisos de usuario', { 
    userId: user.id, 
    role: userRole, 
    permissionsCount: permissions.length 
  });

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: Permission): boolean => {
    const hasIt = permissions.includes(permission);
    
    if (!hasIt) {
      logger.auth('Permiso denegado', { 
        userId: user.id, 
        role: userRole, 
        permission, 
        available: permissions 
      });
    }
    
    return hasIt;
  };

  /**
   * Verificar si el usuario tiene al menos uno de los permisos dados
   */
  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  /**
   * Verificar si el usuario tiene todos los permisos dados
   */
  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every(permission => hasPermission(permission));
  };

  // 🔧 Permisos específicos más comunes (para facilitar uso en componentes)
  const canSendMessages = hasPermission('send_messages');
  const canAssignConversations = hasPermission('assign_conversations');
  const canManageTeam = hasPermission('manage_team');
  const canAccessAdmin = hasPermission('manage_settings') || hasPermission('manage_permissions');

  // 🔧 Identificadores de rol
  const isViewer = userRole === 'viewer';
  const isAgent = userRole === 'agent';
  const isAdmin = userRole === 'admin';

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canSendMessages,
    canAssignConversations,
    canManageTeam,
    canAccessAdmin,
    isViewer,
    isAgent,
    isAdmin,
    role: userRole,
    permissions
  };
}

/**
 * 🔧 Hook para proteger componentes según permisos
 */
export function usePermissionGuard(requiredPermissions: Permission | Permission[]) {
  const { hasPermission, hasAnyPermission } = usePermissions();
  
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  const isAllowed = permissions.length === 1 
    ? hasPermission(permissions[0])
    : hasAnyPermission(permissions);

  return {
    isAllowed,
    isDenied: !isAllowed
  };
}

/**
 * 🔧 Componente HOC para proteger componentes con permisos
 */
export function withPermissions<T extends object>(
  Component: React.ComponentType<T>,
  requiredPermissions: Permission | Permission[],
  fallback?: React.ComponentType | null
) {
  return function ProtectedComponent(props: T) {
    const { isAllowed } = usePermissionGuard(requiredPermissions);
    
    if (!isAllowed) {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent />;
      }
      
      // Fallback por defecto
      return (
        <div className="flex items-center justify-center p-8 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-medium mb-2">Acceso Restringido</h3>
            <p className="text-sm">No tienes permisos para acceder a esta funcionalidad.</p>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

/**
 * 🔧 Componente para mostrar contenido condicional según permisos
 */
interface PermissionGateProps {
  permissions: Permission | Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // true = requiere TODOS los permisos, false = requiere AL MENOS UNO
}

export function PermissionGate({ 
  permissions, 
  children, 
  fallback = null, 
  requireAll = false 
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
  
  const isAllowed = requireAll 
    ? hasAllPermissions(permissionArray)
    : permissionArray.length === 1 
      ? hasPermission(permissionArray[0])
      : hasAnyPermission(permissionArray);

  return isAllowed ? <>{children}</> : <>{fallback}</>;
}

/**
 * 🔧 Utilidades para validación de permisos en formularios y acciones
 */
export const PermissionUtils = {
  /**
   * Obtener mensaje de error personalizado según el rol
   */
  getAccessDeniedMessage: (role: string, feature: string): string => {
    switch (role) {
      case 'viewer':
        return `Como ${role}, solo puedes ver ${feature} pero no realizar cambios. Contacta al administrador para más permisos.`;
      case 'agent':
        return `Esta funcionalidad de ${feature} requiere permisos administrativos.`;
      default:
        return `No tienes permisos suficientes para acceder a ${feature}.`;
    }
  }
};

/**
 * 🔧 Hook para validar acciones con permisos
 */
export function usePermissionValidator() {
  const { hasPermission, role } = usePermissions();

  const validateAction = (permission: Permission, actionName: string): boolean => {
    if (!hasPermission(permission)) {
      const error = `Acción '${actionName}' denegada para rol '${role}'. Permiso requerido: ${permission}`;
      logger.auth('Acción bloqueada por permisos', { actionName, permission, role }, true);
      throw new Error(error);
    }
    
    logger.auth('Acción autorizada', { actionName, permission, role });
    return true;
  };

  return { validateAction };
} 