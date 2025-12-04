// Gestión de equipo y recursos

export interface ProjectTeam {
  projectId: string;
  
  // Miembros del equipo
  members: TeamMember[];
  roles: ProjectRole[];
  
  // Integración con módulo HR
  employees: ProjectEmployees;
  
  // Organigrama del proyecto
  hierarchy: TeamHierarchy;
  
  // Permisos granulares
  permissions: MemberPermissions[];
  
  // Comunicación
  chatChannelId?: string;
  notifications: NotificationSettings;
  mentions: Mention[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  employeeId: string;
  projectId: string;
  
  // Info básica (copiada del módulo HR)
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  
  // Rol en el proyecto
  role: string;
  roleId?: string;
  title?: string;
  
  // Asignación
  allocation: number; // % de tiempo asignado (0-100)
  hourlyRate: number;
  costRate: number;
  startDate: Date;
  endDate?: Date;
  
  // Estado
  status: 'active' | 'inactive' | 'on_leave' | 'completed';
  
  // Habilidades relevantes
  skills: string[];
  certifications: string[];
  experience: string;
  
  // Performance en el proyecto
  hoursWorked: number;
  tasksCompleted: number;
  tasksInProgress: number;
  avgTaskCompletionTime: number; // Días
  performanceRating?: number; // 1-5
  
  // Disponibilidad
  availability: EmployeeAvailability[];
  
  // Metadata
  addedBy: string;
  addedAt: Date;
  notes?: string;
}

export interface ProjectRole {
  id: string;
  name: string;
  description: string;
  level: 'lead' | 'senior' | 'mid' | 'junior' | 'support';
  
  // Responsabilidades
  responsibilities: string[];
  
  // Permisos por defecto
  defaultPermissions: string[];
  
  // Configuración
  maxMembers?: number; // Máximo de personas con este rol
  requiresCertification?: string[];
  requiredSkills?: string[];
  
  // Metadata
  color?: string;
  icon?: string;
  order: number;
}

export interface ProjectEmployees {
  assigned: string[]; // IDs de empleados asignados
  availability: EmployeeAvailability[];
  workload: EmployeeWorkload[];
  costs: EmployeeCost[];
  timeEntries: TimeEntry[];
}

export interface EmployeeAvailability {
  employeeId: string;
  date: Date;
  availableHours: number;
  assignedHours: number;
  conflictingProjects: string[]; // IDs de otros proyectos
  onLeave: boolean;
  leaveType?: string;
  notes?: string;
}

export interface EmployeeWorkload {
  employeeId: string;
  employeeName: string;
  totalCapacity: number; // Horas por semana
  assignedHours: number;
  availableHours: number;
  utilizationPercentage: number;
  
  // Desglose por proyecto
  projects: {
    projectId: string;
    projectName: string;
    hours: number;
    percentage: number;
  }[];
  
  // Tendencia
  trend: 'increasing' | 'stable' | 'decreasing';
  isOverallocated: boolean;
  
  periodStart: Date;
  periodEnd: Date;
}

export interface EmployeeCost {
  employeeId: string;
  baseSalary: number;
  hourlyRate: number;
  overtimeRate: number;
  
  // Costos del proyecto
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  totalCost: number;
  
  // Presupuesto
  budgetedHours: number;
  budgetedCost: number;
  variance: number;
  variancePercentage: number;
  
  periodStart: Date;
  periodEnd: Date;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  projectId: string;
  taskId?: string;
  
  // Tiempo
  date: Date;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  hours: number;
  isOvertime: boolean;
  
  // Descripción
  description: string;
  type: 'regular' | 'overtime' | 'travel' | 'training' | 'other';
  
  // Estado
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'billed';
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  
  // Facturación
  billable: boolean;
  billedAt?: Date;
  invoiceId?: string;
  rate: number;
  amount: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface TeamHierarchy {
  projectManager: string; // Employee ID
  leads: {
    role: string;
    employeeId: string;
    reportsTo: string;
  }[];
  reporting: {
    [employeeId: string]: string; // Reporta a (employee ID)
  };
}

export interface MemberPermissions {
  memberId: string;
  
  // Qué puede ver
  canView: PermissionScope[];
  
  // Qué puede editar
  canEdit: PermissionScope[];
  
  // Qué puede eliminar
  canDelete: PermissionScope[];
  
  // Qué puede aprobar
  canApprove: PermissionScope[];
  
  // Qué puede gestionar
  canManage: PermissionScope[];
  
  // Permisos especiales
  canExportData: boolean;
  canManageTeam: boolean;
  canManageBudget: boolean;
  canManageTimeline: boolean;
  
  // Overrides
  deniedActions?: string[];
  customPermissions?: { [key: string]: boolean };
}

export type PermissionScope = 
  | 'all'
  | 'own_tasks'
  | 'team_tasks'
  | 'documents'
  | 'budget'
  | 'timeline'
  | 'team'
  | 'quality'
  | 'risks'
  | 'reports';

export interface NotificationSettings {
  projectId: string;
  
  // Notificaciones globales
  enabled: boolean;
  
  // Por tipo de evento
  taskAssigned: boolean;
  taskCompleted: boolean;
  taskOverdue: boolean;
  taskCommented: boolean;
  taskMentioned: boolean;
  
  budgetAlert: boolean;
  budgetExceeded: boolean;
  
  scheduleDelay: boolean;
  milestoneReached: boolean;
  
  documentUploaded: boolean;
  documentApproved: boolean;
  
  teamMemberAdded: boolean;
  
  // Canal de notificación
  channels: ('email' | 'push' | 'sms' | 'in_app')[];
  
  // Frecuencia
  digestFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'never';
  digestTime?: string; // HH:mm
  
  // Horario de no molestar
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string; // HH:mm
}

export interface Mention {
  id: string;
  mentionedBy: string;
  mentionedUser: string;
  context: 'task' | 'comment' | 'document' | 'chat' | 'other';
  contextId: string;
  text: string;
  createdAt: Date;
  read: boolean;
  readAt?: Date;
}

// Sugerencias de asignación (IA)
export interface AssignmentSuggestion {
  employeeId: string;
  employeeName: string;
  confidence: number; // 0-100
  reasons: string[];
  
  // Factores
  skillMatch: number; // 0-100
  availability: number; // 0-100
  workload: number; // 0-100 (lower is better)
  cost: number; // 0-100 (lower is better)
  pastPerformance: number; // 0-100
  
  // Detalles
  availableHours: number;
  currentUtilization: number;
  costPerHour: number;
  relevantSkills: string[];
  relevantExperience: string;
  
  // Alertas
  warnings: string[];
  conflicts: string[];
}

