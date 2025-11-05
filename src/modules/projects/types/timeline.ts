// Timeline, fases y milestones

export type PhaseStatus = 
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export interface ProjectTimeline {
  // Fechas clave
  startDate: Date;
  plannedEndDate: Date;
  forecastEndDate?: Date;
  actualEndDate?: Date;
  
  // Fases del proyecto
  phases: ProjectPhase[];
  
  // Hitos importantes
  milestones: Milestone[];
  
  // Calendario laboral
  workingCalendar: WorkingCalendar;
  holidays: Holiday[];
  nonWorkingDays: Date[];
  
  // Análisis de tiempo
  criticalPath: string[]; // IDs de tareas en ruta crítica
  slack: { [taskId: string]: number }; // Holgura por tarea
  forecast: TimelineForecast;
  
  // Baseline y comparación
  baselines: TimelineBaseline[];
  variance: TimelineVariance;
  
  // Configuración
  defaultWorkHoursPerDay: number;
  defaultWorkDaysPerWeek: number;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  description: string;
  code?: string; // Código único
  
  // Fechas
  startDate: Date;
  endDate: Date;
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Estado
  status: PhaseStatus;
  progress: number; // 0-100
  
  // Entregables de la fase
  deliverables: Deliverable[];
  
  // Tareas de la fase
  taskIds: string[];
  
  // Aprobaciones
  approvals: PhaseApproval[];
  requiresApproval: boolean;
  approvedAt?: Date;
  approvedBy?: string;
  
  // Presupuesto de la fase
  budgetAllocated: number;
  budgetSpent: number;
  
  // Dependencias
  predecessorIds: string[]; // Fases que deben completarse primero
  
  // Custom fields
  customFields: { [key: string]: any };
  
  // Metadata
  color?: string;
  icon?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  phaseId?: string;
  name: string;
  description: string;
  
  // Fecha
  date: Date;
  plannedDate?: Date;
  actualDate?: Date;
  
  // Estado
  status: 'pending' | 'achieved' | 'missed' | 'cancelled';
  isBaseline: boolean; // Si es un hito del baseline
  
  // Criterios de éxito
  criteria: string[];
  criteriaMet: boolean[];
  
  // Entregables asociados
  deliverableIds: string[];
  
  // Aprobaciones
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Metadata
  color?: string;
  icon?: string;
  critical: boolean; // Si es crítico para el proyecto
  createdAt: Date;
  updatedAt: Date;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  type: 'document' | 'product' | 'service' | 'approval' | 'other';
  
  // Estado
  status: 'pending' | 'in_progress' | 'review' | 'approved' | 'delivered' | 'rejected';
  dueDate: Date;
  deliveredDate?: Date;
  
  // Responsable
  owner: string;
  reviewers: string[];
  
  // Documentos asociados
  documentIds: string[];
  
  // Aprobación
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Calidad
  qualityChecks: QualityCheck[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityCheck {
  id: string;
  criterion: string;
  passed: boolean;
  checkedBy?: string;
  checkedAt?: Date;
  notes?: string;
}

export interface PhaseApproval {
  id: string;
  approver: string;
  required: boolean;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  comments?: string;
  order: number; // Para aprobaciones secuenciales
}

export interface WorkingCalendar {
  id: string;
  name: string;
  workingDays: WorkingDay[];
  timezone: string;
  defaultStartTime: string; // HH:mm
  defaultEndTime: string; // HH:mm
}

export interface WorkingDay {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo
  isWorking: boolean;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  breaks: TimeBreak[];
}

export interface TimeBreak {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  name: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: Date;
  recurring: boolean; // Se repite cada año
  type: 'national' | 'regional' | 'company' | 'project';
}

export interface TimelineForecast {
  estimatedEndDate: Date;
  confidence: number; // 0-100
  delayDays: number;
  atRiskTasks: string[]; // IDs de tareas en riesgo
  reasoning: string;
  lastCalculated: Date;
}

export interface TimelineBaseline {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  createdBy: string;
  
  // Snapshot de fechas
  projectStartDate: Date;
  projectEndDate: Date;
  phases: {
    id: string;
    startDate: Date;
    endDate: Date;
  }[];
  tasks: {
    id: string;
    startDate: Date;
    endDate: Date;
  }[];
  milestones: {
    id: string;
    date: Date;
  }[];
  
  // Es el baseline activo
  isActive: boolean;
}

export interface TimelineVariance {
  baselineId: string;
  
  // Varianza general
  overallDelayDays: number;
  overallVariancePercentage: number;
  
  // Varianza por fase
  phaseVariances: {
    phaseId: string;
    phaseName: string;
    plannedStart: Date;
    actualStart: Date;
    plannedEnd: Date;
    actualEnd: Date;
    delayDays: number;
  }[];
  
  // Varianza por milestone
  milestoneVariances: {
    milestoneId: string;
    milestoneName: string;
    plannedDate: Date;
    actualDate: Date;
    delayDays: number;
  }[];
  
  // Análisis
  majorDelays: string[]; // IDs de elementos con mayor retraso
  lastCalculated: Date;
}

// Configuración de vista Gantt
export interface GanttViewConfig {
  zoom: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  showBaseline: boolean;
  showCriticalPath: boolean;
  showDependencies: boolean;
  showProgress: boolean;
  showMilestones: boolean;
  showToday: boolean;
  groupBy?: 'phase' | 'status' | 'assignee' | 'none';
  filters?: {
    phaseIds?: string[];
    assignees?: string[];
    statuses?: string[];
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
}

