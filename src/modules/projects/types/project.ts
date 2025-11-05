// Tipos de proyecto principal

import { CustomField, CustomFieldValue } from './customFields';
import { ProjectTimeline, ProjectPhase, Milestone } from './timeline';
import { ProjectTeam } from './team';
import { ProjectBudget, Expense, Invoice } from './budget';
import { ProjectInventory } from './materials';
import { ProjectDocuments } from './documents';
import { QualityManagement } from './quality';
import { ProjectRisk } from './risks';
import { ProjectView } from './views';
import { ProjectIntegrations } from './integrations';
import { ProjectPermissions } from './permissions';
import { ProjectMetrics } from './analytics';

export type ProjectType = 
  | 'construction'
  | 'software'
  | 'manufacturing'
  | 'services'
  | 'marketing'
  | 'events'
  | 'research'
  | 'custom';

export type ProjectStatus = 
  | 'planning'        // Planificación
  | 'design'          // Diseño
  | 'permits'         // Tramitando permisos
  | 'procurement'     // Adquisiciones
  | 'construction'    // En construcción/desarrollo
  | 'inspection'      // En inspección
  | 'closeout'        // Cierre
  | 'completed'       // Completado
  | 'on_hold'         // En espera
  | 'cancelled';      // Cancelado

export type ProjectPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'custom';

export interface Project {
  // Información básica
  id: string;
  name: string;
  code: string; // Código único autogenerado (ej: PROJ-2025-001)
  description?: string;
  
  // Clasificación
  type: ProjectType;
  category: string; // Subcategoría personalizable
  status: ProjectStatus;
  priority: ProjectPriority;
  customPriority?: string;
  
  // Cliente
  clientId?: string;
  clientName?: string;
  
  // Personalización total (como Notion)
  customFields: CustomField[];
  customFieldValues: { [fieldId: string]: any };
  
  // Workspace personalizado
  workspace: ProjectWorkspace;
  
  // Vistas guardadas
  views: ProjectView[];
  defaultViewId?: string;
  
  // Fechas y timeline
  timeline: ProjectTimeline;
  
  // Fases y milestones
  phases: ProjectPhase[];
  milestones: Milestone[];
  
  // Equipo y recursos
  team: ProjectTeam;
  
  // Financiero
  budget: ProjectBudget;
  expenses: Expense[];
  invoices: Invoice[];
  
  // Materiales e inventario
  inventory?: ProjectInventory;
  
  // Documentación y archivos
  documents: ProjectDocuments;
  
  // Calidad
  qualityManagement?: QualityManagement;
  
  // Riesgos
  risks: ProjectRisk[];
  
  // Integración con otros módulos
  integrations: ProjectIntegrations;
  
  // Permisos y seguridad
  permissions: ProjectPermissions;
  
  // Métricas y KPIs
  metrics: ProjectMetrics;
  
  // Configuración
  settings: ProjectSettings;
  
  // Metadata y permisos
  owner: string;
  ownerName: string;
  managers: string[];
  tags: string[];
  color?: string;
  icon?: string;
  coverImage?: string;
  
  // Favorito
  isFavorite: boolean;
  favoriteOrder?: number;
  
  // Archivo
  isArchived: boolean;
  archivedAt?: Date;
  archivedBy?: string;
  archiveReason?: string;
  
  // Plantilla
  templateId?: string; // Si fue creado desde plantilla
  
  // Auditoría
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  lastActivityAt: Date;
  
  // Estado de sincronización
  needsSync?: boolean;
  lastSynced?: Date;
  syncErrors?: string[];
}

export interface ProjectWorkspace {
  id: string;
  
  // Layout
  layout: WorkspaceLayout;
  
  // Tabs visibles
  enabledTabs: WorkspaceTab[];
  
  // Dashboard
  dashboardId?: string;
  
  // Sidebar
  sidebarConfig: SidebarConfig;
  
  // Tema
  theme: 'light' | 'dark' | 'auto';
  accentColor?: string;
  
  // Configuración
  compactMode: boolean;
  showBreadcrumbs: boolean;
  showQuickActions: boolean;
}

export type WorkspaceTab = 
  | 'dashboard'
  | 'tasks'
  | 'timeline'
  | 'gantt'
  | 'budget'
  | 'team'
  | 'materials'
  | 'documents'
  | 'quality'
  | 'risks'
  | 'reports'
  | 'settings'
  | 'custom';

export interface WorkspaceLayout {
  type: 'sidebar_left' | 'sidebar_right' | 'no_sidebar' | 'custom';
  
  // Sections
  sections: LayoutSection[];
  
  // Responsive
  mobileLayout?: 'stack' | 'tabs' | 'collapse';
}

export interface LayoutSection {
  id: string;
  type: 'header' | 'sidebar' | 'content' | 'footer' | 'custom';
  visible: boolean;
  collapsible: boolean;
  collapsed: boolean;
  width?: string;
  height?: string;
  order: number;
}

export interface SidebarConfig {
  visible: boolean;
  position: 'left' | 'right';
  width: number; // Pixels
  collapsible: boolean;
  defaultCollapsed: boolean;
  
  // Contenido
  showProjectInfo: boolean;
  showQuickStats: boolean;
  showRecentActivity: boolean;
  showUpcomingTasks: boolean;
  showTeamMembers: boolean;
  
  // Navegación
  showNavigation: boolean;
  navigationItems: string[];
}

export interface ProjectSettings {
  // General
  defaultCurrency: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  
  // Calendario laboral
  workingDays: number[]; // 0-6 (0 = Domingo)
  workHoursPerDay: number;
  weekStartsOn: number; // 0-6
  
  // Notificaciones
  enableNotifications: boolean;
  notificationChannels: ('email' | 'push' | 'sms' | 'in_app')[];
  
  // Numeración automática
  taskNumberFormat: string; // Ej: "TASK-{number}"
  startTaskNumber: number;
  
  // Presupuesto
  budgetContingency: number; // % para contingencia
  requireBudgetApproval: boolean;
  budgetApprovalThreshold: number;
  
  // Timeline
  autoCalculateSchedule: boolean;
  showCriticalPath: boolean;
  baselineEnabled: boolean;
  
  // Tareas
  allowSubtasks: boolean;
  maxSubtaskLevels: number;
  autoAssignTaskNumber: boolean;
  requireTaskApproval: boolean;
  
  // Documentos
  requireDocumentApproval: boolean;
  enableVersionControl: boolean;
  maxFileSize: number; // MB
  allowedFileTypes: string[];
  
  // Calidad
  enableQualityManagement: boolean;
  requireInspections: boolean;
  
  // Riesgos
  enableRiskManagement: boolean;
  riskReviewFrequency: 'weekly' | 'biweekly' | 'monthly';
  
  // Integraciones
  enabledIntegrations: {
    hr: boolean;
    inventory: boolean;
    providers: boolean;
    clients: boolean;
    internalChat: boolean;
  };
  
  // Features habilitados
  enabledFeatures: {
    customFields: boolean;
    automations: boolean;
    timeTracking: boolean;
    budgetTracking: boolean;
    materialTracking: boolean;
    qualityManagement: boolean;
    riskManagement: boolean;
    documentManagement: boolean;
    reporting: boolean;
    ai: boolean;
  };
  
  // Automatizaciones
  enableAutomations: boolean;
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // Segundos
  
  // Privacidad
  requireApprovalToJoin: boolean;
  allowGuestAccess: boolean;
  
  // Exportación
  allowExport: boolean;
  exportFormats: string[];
  
  // Metadata
  updatedAt: Date;
  updatedBy: string;
}

// Filtros de proyectos
export interface ProjectFilters {
  search?: string;
  type?: ProjectType[];
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  owner?: string[];
  manager?: string[];
  client?: string[];
  tags?: string[];
  
  // Fechas
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
  
  // Progreso
  progressMin?: number;
  progressMax?: number;
  
  // Presupuesto
  budgetMin?: number;
  budgetMax?: number;
  
  // Estado
  isArchived?: boolean;
  isFavorite?: boolean;
  isOverdue?: boolean;
  isOnTrack?: boolean;
  isOverBudget?: boolean;
  
  // Custom fields
  customFields?: {
    [fieldId: string]: any;
  };
}

// Lista de proyectos con paginación
export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  
  // Agregaciones
  aggregations?: {
    byType: { [type: string]: number };
    byStatus: { [status: string]: number };
    byPriority: { [priority: string]: number };
  };
}

// Actividad del proyecto
export interface ProjectActivity {
  id: string;
  projectId: string;
  
  // Tipo de actividad
  type: ActivityType;
  
  // Descripción
  action: string;
  description: string;
  
  // Actor
  userId: string;
  userName: string;
  userAvatar?: string;
  
  // Recurso afectado
  resourceType: string;
  resourceId: string;
  resourceName: string;
  
  // Cambios
  changes?: ActivityChange[];
  
  // Metadata
  timestamp: Date;
  ipAddress?: string;
  device?: string;
}

export type ActivityType = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'completed'
  | 'assigned'
  | 'commented'
  | 'uploaded'
  | 'approved'
  | 'rejected'
  | 'archived'
  | 'restored';

export interface ActivityChange {
  field: string;
  oldValue: any;
  newValue: any;
  displayName: string;
}

// Estadísticas del proyecto
export interface ProjectStats {
  projectId: string;
  
  // Conteos
  totalTasks: number;
  totalPhases: number;
  totalMilestones: number;
  totalDocuments: number;
  totalTeamMembers: number;
  totalRisks: number;
  
  // Estados
  tasksByStatus: { [status: string]: number };
  phasesByStatus: { [status: string]: number };
  
  // Financiero
  budgetUtilization: number; // %
  totalSpent: number;
  totalRemaining: number;
  
  // Tiempo
  timeElapsed: number; // %
  daysRemaining: number;
  
  // Progreso
  overallProgress: number; // 0-100
  
  // Health
  healthScore: number; // 0-100
  
  lastCalculated: Date;
}

