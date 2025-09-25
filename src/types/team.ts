// Tipos para el módulo de Equipo & Performance

// Tipos de permisos
export interface Permission {
  id: string;
  name: 'read' | 'write' | 'approve' | 'configure';
  displayName: string;
  description: string;
  level: 'basic' | 'intermediate' | 'advanced';
  isActive: boolean;
  icon: string;
}

// Tipos de métricas de rendimiento
export interface PerformanceMetrics {
  chatsAttended: number;
  csatScore: number; // Customer Satisfaction Score
  conversionRate: number; // Porcentaje de conversión
  averageResponseTime: string; // Formato "2:15"
  messagesReplied: number;
  chatsClosedWithoutEscalation: number;
  trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    status: 'improving' | 'declining' | 'stable';
  };
}

// Tipos de fortalezas y áreas de mejora
export interface Strength {
  id: string;
  title: string;
  description: string;
  category: 'ai' | 'communication' | 'technical' | 'sales';
}

export interface ImprovementArea {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'sales' | 'communication' | 'technical' | 'process';
}

// Tipos de tareas del plan de coaching
export interface CoachingTask {
  id: string;
  title: string;
  description: string;
  duration: number; // en minutos
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  category: string;
  dueDate?: Date;
  completedAt?: Date;
}

// Tipos de plan de coaching
export interface CoachingPlan {
  id: string;
  memberId: string;
  title: string;
  duration: number; // días
  progress: number; // 1/3, 2/3, etc.
  tasks: CoachingTask[];
  strengths: Strength[];
  improvementAreas: ImprovementArea[];
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de miembro del equipo (actualizado para coincidir con backend)
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'agent' | 'viewer';
  phone?: string;
  avatar: string;
  isActive: boolean;
  permissions: {
    read: boolean;
    write: boolean;
    approve: boolean;
    configure: boolean;
  };
  performance: {
    totalChats: number;
    csat: number;
    conversionRate: number;
    responseTime: string;
  };
  createdAt: string;
  updatedAt: string;
  
  // DEPRECATED: Campos del sistema anterior (mantener para compatibilidad)
  initials?: string;
  fullName?: string;
  status?: 'active' | 'inactive';
  performanceMetrics?: PerformanceMetrics;
  coachingPlan?: CoachingPlan;
  lastSeen?: Date;
}

// Tipos de filtros
export interface TeamFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  role?: string;
  permissions?: string[];
}

// Tipos de estado del equipo
export interface TeamState {
  members: TeamMember[];
  selectedMember: TeamMember | null;
  filters: TeamFilters;
  loading: boolean;
  error: string | null;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
}

// Tipos de acciones del equipo
export interface TeamActions {
  // Acciones de IA
  suggestImprovement: (memberId: string) => Promise<void>;
  sendReminder: (memberId: string, message: string) => Promise<void>;
  insertTemplateResponse: (memberId: string, templateId: string) => Promise<void>;
  
  // Acciones de gestión
  editProfile: (memberId: string, updates: Partial<TeamMember>) => Promise<void>;
  reassignMember: (memberId: string, newRole: string) => Promise<void>;
  updatePermissions: (memberId: string, permissions: Permission[]) => Promise<void>;
  
  // Acciones de coaching
  createCoachingPlan: (memberId: string, plan: Omit<CoachingPlan, 'id' | 'memberId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCoachingTask: (memberId: string, taskId: string, updates: Partial<CoachingTask>) => Promise<void>;
  completeCoachingTask: (memberId: string, taskId: string) => Promise<void>;
}

// Tipos de respuesta de API (actualizado para coincidir con backend)
export interface TeamApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
}

export interface TeamListResponse {
  agents: TeamMember[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total: number;
    active: number;
    inactive: number;
  };
}

// Tipos para creación de agente
export interface CreateAgentRequest {
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'agent' | 'viewer';
  phone?: string;
  permissions?: {
    read: boolean;
    write: boolean;
    approve: boolean;
    configure: boolean;
  };
  modulePermissions?: {
    modules: {
      [moduleId: string]: {
        read: boolean;
        write: boolean;
        configure: boolean;
      };
    };
  };
}

// Tipos de eventos de WebSocket para el equipo
export interface TeamSocketEvents {
  'team-member-updated': (data: { member: TeamMember }) => void;
  'team-member-status-changed': (data: { memberId: string; status: 'active' | 'inactive' }) => void;
  'performance-metrics-updated': (data: { memberId: string; metrics: PerformanceMetrics }) => void;
  'coaching-plan-updated': (data: { memberId: string; plan: CoachingPlan }) => void;
  'permissions-changed': (data: { memberId: string; permissions: Permission[] }) => void;
}

// Tipos de estadísticas del equipo
export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  averageCSAT: number;
  averageConversionRate: number;
  averageResponseTime: string;
  totalChats: number;
  totalMessages: number;
}

// Tipos de configuración del módulo
export interface TeamModuleConfig {
  enableCoaching: boolean;
  enableAIActions: boolean;
  enablePerformanceTracking: boolean;
  enablePermissionManagement: boolean;
  refreshInterval: number; // en segundos
  maxMembersPerPage: number;
} 