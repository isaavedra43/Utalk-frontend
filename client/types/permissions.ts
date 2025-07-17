/**
 * Sistema de Roles y Permisos para UTalk
 * 
 * Define claramente qué puede hacer cada tipo de usuario
 */

// 🔐 Roles principales del sistema
export type UserRole = 'admin' | 'agent' | 'viewer';

// 🛡 Permisos granulares
export interface UserPermissions {
  // 👁 Permisos de lectura
  read: boolean;           // Ver conversaciones, contactos, reportes
  
  // ✍️ Permisos de escritura  
  write: boolean;          // Enviar mensajes, crear/editar contactos
  
  // ✅ Permisos de aprobación
  approve: boolean;        // Aprobar campañas, acciones masivas
  
  // 👑 Permisos administrativos
  admin: boolean;          // Gestionar equipo, configuraciones, facturación
}

// 🎭 Definición completa de roles
export interface RoleDefinition {
  role: UserRole;
  name: string;
  description: string;
  permissions: UserPermissions;
  allowedActions: string[];
  restrictedActions: string[];
}

// 📋 Configuración de roles predefinidos
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  // 👑 ADMINISTRADOR - Acceso completo
  admin: {
    role: 'admin',
    name: 'Administrador',
    description: 'Acceso completo al sistema',
    permissions: {
      read: true,
      write: true,
      approve: true,
      admin: true
    },
    allowedActions: [
      'view_all_conversations',
      'send_messages',
      'create_contacts',
      'edit_contacts',
      'delete_contacts',
      'create_campaigns',
      'edit_campaigns',
      'approve_campaigns',
      'delete_campaigns',
      'view_team',
      'manage_team',
      'edit_user_permissions',
      'view_system_settings',
      'edit_system_settings',
      'view_billing',
      'manage_billing',
      'export_data',
      'view_analytics',
      'manage_integrations'
    ],
    restrictedActions: []
  },

  // 🤝 AGENTE - Operación diaria
  agent: {
    role: 'agent',
    name: 'Agente',
    description: 'Manejo de conversaciones y contactos',
    permissions: {
      read: true,
      write: true,
      approve: false,
      admin: false
    },
    allowedActions: [
      'view_assigned_conversations',
      'view_all_conversations',
      'send_messages',
      'create_contacts',
      'edit_contacts',
      'view_contacts',
      'create_campaigns',
      'edit_campaigns',
      'view_team_basic',
      'view_basic_analytics',
      'export_own_data'
    ],
    restrictedActions: [
      'approve_campaigns',
      'delete_campaigns',
      'manage_team',
      'edit_user_permissions',
      'edit_system_settings',
      'view_billing',
      'manage_billing',
      'manage_integrations'
    ]
  },

  // 👁 VIEWER - Solo lectura
  viewer: {
    role: 'viewer',
    name: 'Observador',
    description: 'Solo lectura de datos y reportes',
    permissions: {
      read: true,
      write: false,
      approve: false,
      admin: false
    },
    allowedActions: [
      'view_conversations',
      'view_contacts',
      'view_campaigns',
      'view_team_basic',
      'view_basic_analytics',
      'export_reports'
    ],
    restrictedActions: [
      'send_messages',
      'create_contacts',
      'edit_contacts',
      'delete_contacts',
      'create_campaigns',
      'edit_campaigns',
      'approve_campaigns',
      'delete_campaigns',
      'manage_team',
      'edit_user_permissions',
      'edit_system_settings',
      'view_billing',
      'manage_billing',
      'manage_integrations'
    ]
  }
};

// 🔍 Funciones de utilidad para permisos
export class PermissionChecker {
  
  /**
   * Verifica si un usuario tiene un permiso específico
   */
  static hasPermission(permissions: UserPermissions, permission: keyof UserPermissions): boolean {
    return permissions[permission] === true;
  }

  /**
   * Verifica si un usuario puede realizar una acción específica
   */
  static canPerformAction(role: UserRole, action: string): boolean {
    const roleDefinition = ROLE_DEFINITIONS[role];
    return roleDefinition.allowedActions.includes(action);
  }

  /**
   * Obtiene las acciones permitidas para un rol
   */
  static getAllowedActions(role: UserRole): string[] {
    return ROLE_DEFINITIONS[role].allowedActions;
  }

  /**
   * Obtiene las acciones restringidas para un rol
   */
  static getRestrictedActions(role: UserRole): string[] {
    return ROLE_DEFINITIONS[role].restrictedActions;
  }

  /**
   * Verifica si un rol puede acceder a una ruta específica
   */
  static canAccessRoute(role: UserRole, route: string): boolean {
    const routePermissions: Record<string, UserRole[]> = {
      '/': ['admin', 'agent', 'viewer'],
      '/dashboard': ['admin', 'agent', 'viewer'],
      '/mensajes': ['admin', 'agent', 'viewer'],
      '/contactos': ['admin', 'agent', 'viewer'],
      '/campañas': ['admin', 'agent'],  // viewer NO puede acceder
      '/conocimiento': ['admin', 'agent', 'viewer'],
      '/equipo': ['admin'],  // Solo admin
      '/configuración': ['admin']  // Solo admin
    };

    const allowedRoles = routePermissions[route] || [];
    return allowedRoles.includes(role);
  }

  /**
   * Verifica permisos para operaciones HTTP
   */
  static canPerformHttpMethod(role: UserRole, method: 'GET' | 'POST' | 'PUT' | 'DELETE', resource: string): boolean {
    const roleDefinition = ROLE_DEFINITIONS[role];
    
    // GET siempre permitido si tiene permiso de lectura
    if (method === 'GET') {
      return roleDefinition.permissions.read;
    }
    
    // POST/PUT requieren permisos de escritura
    if (method === 'POST' || method === 'PUT') {
      return roleDefinition.permissions.write;
    }
    
    // DELETE requiere permisos administrativos
    if (method === 'DELETE') {
      return roleDefinition.permissions.admin;
    }
    
    return false;
  }

  /**
   * Genera un reporte de permisos para un rol
   */
  static getPermissionReport(role: UserRole): {
    role: RoleDefinition;
    summary: {
      totalPermissions: number;
      activePermissions: number;
      permissionLevel: string;
    };
  } {
    const roleDefinition = ROLE_DEFINITIONS[role];
    const activePermissions = Object.values(roleDefinition.permissions).filter(Boolean).length;
    const totalPermissions = Object.keys(roleDefinition.permissions).length;
    
    let permissionLevel = 'Sin acceso';
    if (activePermissions === 1) permissionLevel = 'Básico';
    else if (activePermissions === 2) permissionLevel = 'Intermedio';
    else if (activePermissions === 3) permissionLevel = 'Avanzado';
    else if (activePermissions === 4) permissionLevel = 'Administrador';

    return {
      role: roleDefinition,
      summary: {
        totalPermissions,
        activePermissions,
        permissionLevel
      }
    };
  }
}

// 🧪 Funciones para testing y validación
export const PermissionTestUtils = {
  
  /**
   * Valida que todos los roles estén correctamente definidos
   */
  validateRoles(): boolean {
    return Object.values(ROLE_DEFINITIONS).every(role => 
      role.role && 
      role.name && 
      role.description &&
      role.permissions &&
      Array.isArray(role.allowedActions) &&
      Array.isArray(role.restrictedActions)
    );
  },

  /**
   * Busca inconsistencias en los permisos
   */
  findPermissionInconsistencies(): string[] {
    const issues: string[] = [];
    
    Object.values(ROLE_DEFINITIONS).forEach(role => {
      // Verificar que las acciones restringidas no estén en las permitidas
      const intersection = role.allowedActions.filter(action => 
        role.restrictedActions.includes(action)
      );
      
      if (intersection.length > 0) {
        issues.push(`${role.role}: Acciones en conflicto: ${intersection.join(', ')}`);
      }
    });

    return issues;
  }
}; 