// Permisos granulares y control de acceso

export type PermissionAction = 
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'manage'
  | 'export'
  | 'configure';

export type ResourceType = 
  | 'project'
  | 'task'
  | 'phase'
  | 'milestone'
  | 'document'
  | 'budget'
  | 'expense'
  | 'team'
  | 'material'
  | 'inspection'
  | 'risk'
  | 'report'
  | 'custom';

export interface ProjectPermissions {
  projectId: string;
  
  // Permisos a nivel de proyecto
  projectLevel: ProjectLevelPermissions;
  
  // Permisos a nivel de módulo
  moduleLevel: ModuleLevelPermissions;
  
  // Permisos a nivel de recurso
  resourceLevel: ResourcePermission[];
  
  // Roles personalizados del proyecto
  customRoles: CustomRole[];
  
  // Políticas de acceso
  accessPolicies: AccessPolicy[];
  
  // Metadata
  updatedAt: Date;
  updatedBy: string;
}

export interface ProjectLevelPermissions {
  // Quién puede ver el proyecto
  canView: string[]; // User IDs o roles
  
  // Quién puede editar información básica
  canEdit: string[];
  
  // Quién puede eliminar el proyecto
  canDelete: string[];
  
  // Quién puede gestionar el proyecto
  canManage: string[];
  
  // Quién puede exportar datos
  canExport: string[];
  
  // Quién puede configurar
  canConfigure: string[];
  
  // Quién puede invitar miembros
  canInviteMembers: string[];
  
  // Es público (visible para todos en la organización)
  isPublic: boolean;
  
  // Requiere aprobación para acceso
  requiresAccessApproval: boolean;
  approvers: string[];
}

export interface ModuleLevelPermissions {
  tasks: ModulePermissions;
  timeline: ModulePermissions;
  budget: ModulePermissions;
  team: ModulePermissions;
  materials: ModulePermissions;
  documents: ModulePermissions;
  quality: ModulePermissions;
  risks: ModulePermissions;
  reports: ModulePermissions;
  automations: ModulePermissions;
  integrations: ModulePermissions;
}

export interface ModulePermissions {
  enabled: boolean; // Si el módulo está habilitado
  
  // Permisos por acción
  canView: string[];
  canCreate: string[];
  canEdit: string[];
  canDelete: string[];
  canApprove?: string[];
  canConfigure?: string[];
  canExport?: string[];
  
  // Restricciones
  viewOwnOnly?: boolean; // Solo ver los propios
  editOwnOnly?: boolean; // Solo editar los propios
  
  // Campos restringidos
  restrictedFields?: FieldRestriction[];
}

export interface FieldRestriction {
  fieldId: string;
  fieldName: string;
  canView: string[];
  canEdit: string[];
  masked: boolean; // Mostrar parcialmente (ej: ****1234)
}

export interface ResourcePermission {
  resourceType: ResourceType;
  resourceId: string;
  
  // Permisos específicos del recurso
  permissions: {
    [userId: string]: PermissionAction[];
  };
  
  // Heredar permisos del padre
  inheritFromParent: boolean;
  parentType?: ResourceType;
  parentId?: string;
  
  // Owner del recurso
  owner: string;
  
  // Permisos por defecto
  defaultPermissions: PermissionAction[];
}

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  
  // Permisos del rol
  permissions: RolePermissions;
  
  // Herencia
  inheritsFrom?: string; // ID de otro rol
  
  // Miembros
  members: string[]; // User IDs
  
  // Configuración
  isDefault: boolean;
  canBeDeleted: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface RolePermissions {
  // Permisos generales
  project: PermissionAction[];
  
  // Por módulo
  tasks: PermissionAction[];
  timeline: PermissionAction[];
  budget: PermissionAction[];
  team: PermissionAction[];
  materials: PermissionAction[];
  documents: PermissionAction[];
  quality: PermissionAction[];
  risks: PermissionAction[];
  reports: PermissionAction[];
  
  // Permisos especiales
  canManagePermissions: boolean;
  canManageRoles: boolean;
  canManageIntegrations: boolean;
  canManageAutomations: boolean;
  canViewAuditLog: boolean;
  canExportAllData: boolean;
  canDeleteProject: boolean;
  
  // Restricciones
  maxBudgetApproval?: number;
  maxExpenseApproval?: number;
  canApproveOwnTimeEntries?: boolean;
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  
  // Condiciones
  conditions: PolicyCondition[];
  
  // Acciones permitidas/denegadas
  allow: PermissionAction[];
  deny: PermissionAction[];
  
  // Aplicable a
  appliesTo: string[]; // User IDs o roles
  
  // Recursos afectados
  resourceTypes: ResourceType[];
  specificResources?: string[];
  
  // Prioridad
  priority: number; // Mayor número = mayor prioridad
  
  // Estado
  enabled: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface PolicyCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
}

// Auditoría de acceso
export interface AccessLog {
  id: string;
  projectId: string;
  
  // Quién
  userId: string;
  userName: string;
  userRole: string;
  
  // Qué
  action: PermissionAction;
  resourceType: ResourceType;
  resourceId: string;
  resourceName?: string;
  
  // Cuándo y dónde
  timestamp: Date;
  ipAddress?: string;
  device?: string;
  location?: string;
  
  // Resultado
  success: boolean;
  deniedReason?: string;
  
  // Cambios (para edit/delete)
  changesBefore?: any;
  changesAfter?: any;
  
  // Contexto
  sessionId?: string;
  requestId?: string;
}

// Solicitud de acceso
export interface AccessRequest {
  id: string;
  projectId: string;
  
  // Solicitante
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  
  // Acceso solicitado
  requestedPermissions: PermissionAction[];
  resourceType?: ResourceType;
  specificResources?: string[];
  
  // Justificación
  reason: string;
  durationDays?: number; // Acceso temporal
  
  // Estado
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  
  // Aprobación
  approver?: string;
  approverName?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // Expiración (para acceso temporal)
  expiresAt?: Date;
  
  // Metadata
  requestedAt: Date;
  processedAt?: Date;
}

// Configuración de seguridad
export interface SecuritySettings {
  projectId: string;
  
  // Autenticación
  requireMFA: boolean;
  allowedIPs?: string[];
  blockedIPs?: string[];
  
  // Sesiones
  sessionTimeout: number; // Minutos
  maxConcurrentSessions: number;
  
  // Datos
  encryptSensitiveData: boolean;
  sensitiveFields: string[];
  
  // Auditoría
  enableAuditLog: boolean;
  auditLogRetention: number; // Días
  logAllActions: boolean;
  logDetailLevel: 'minimal' | 'normal' | 'detailed';
  
  // Restricciones
  allowDownload: boolean;
  allowPrint: boolean;
  allowCopy: boolean;
  allowExport: boolean;
  
  // Watermarks
  addWatermarkToDocuments: boolean;
  watermarkText?: string;
  
  // Notificaciones de seguridad
  notifyOnSuspiciousActivity: boolean;
  notifyRecipients: string[];
  
  // Metadata
  updatedAt: Date;
  updatedBy: string;
}

// Roles predefinidos del sistema
export const SYSTEM_ROLES = {
  PROJECT_MANAGER: 'project_manager',
  TEAM_LEAD: 'team_lead',
  TEAM_MEMBER: 'team_member',
  STAKEHOLDER: 'stakeholder',
  CLIENT: 'client',
  VIEWER: 'viewer',
} as const;

// Permisos predefinidos por rol
export const ROLE_PERMISSIONS: { [role: string]: RolePermissions } = {
  project_manager: {
    project: ['view', 'edit', 'delete', 'manage', 'export', 'configure'],
    tasks: ['view', 'create', 'edit', 'delete', 'approve'],
    timeline: ['view', 'edit', 'configure'],
    budget: ['view', 'create', 'edit', 'approve', 'configure'],
    team: ['view', 'create', 'edit', 'delete', 'manage'],
    materials: ['view', 'create', 'edit', 'approve'],
    documents: ['view', 'create', 'edit', 'delete', 'approve'],
    quality: ['view', 'create', 'edit', 'approve'],
    risks: ['view', 'create', 'edit', 'approve'],
    reports: ['view', 'create', 'export'],
    canManagePermissions: true,
    canManageRoles: true,
    canManageIntegrations: true,
    canManageAutomations: true,
    canViewAuditLog: true,
    canExportAllData: true,
    canDeleteProject: true,
    maxBudgetApproval: undefined, // Sin límite
    maxExpenseApproval: undefined,
    canApproveOwnTimeEntries: false,
  },
  // ... otros roles predefinidos
};

