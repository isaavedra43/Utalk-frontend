// Sistema de tareas multi-dimensional

import { CustomFieldValue } from './customFields';

export type TaskStatus = 
  | 'not_started'
  | 'in_progress'
  | 'on_hold'
  | 'blocked'
  | 'review'
  | 'completed'
  | 'cancelled';

export type TaskPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'custom';

export type TaskType = 
  | 'milestone'
  | 'phase'
  | 'task'
  | 'subtask'
  | 'inspection'
  | 'approval'
  | 'custom';

export type DependencyType = 
  | 'finish_to_start'   // La tarea A debe terminar antes de que B comience
  | 'start_to_start'    // A y B comienzan al mismo tiempo
  | 'finish_to_finish'  // A y B terminan al mismo tiempo
  | 'start_to_finish';  // B no puede terminar hasta que A comience

export interface Task {
  // Básico
  id: string;
  projectId: string;
  name: string;
  description: string;
  type: TaskType;
  code?: string; // Código único (ej: TASK-001)
  
  // Jerarquía
  parentId?: string;
  parent?: Task;
  subtasks: Task[];
  dependencies: TaskDependency[];
  level: number; // Nivel de anidación
  path: string; // Path jerárquico (ej: "1.2.3")
  
  // Asignación
  assignedTo: string[]; // IDs de empleados
  owner: string; // Responsable principal
  reviewer?: string;
  approver?: string;
  watchers: string[]; // Observadores
  
  // Timeline
  startDate: Date;
  dueDate: Date;
  plannedStartDate?: Date; // Baseline
  plannedDueDate?: Date; // Baseline
  actualStartDate?: Date;
  actualEndDate?: Date;
  duration: number; // Días
  estimatedHours: number;
  actualHours: number;
  
  // Estado y progreso
  status: TaskStatus;
  progress: number; // 0-100
  priority: TaskPriority;
  customPriority?: string;
  
  // Ubicación (para construcción)
  location?: TaskLocation;
  
  // Recursos necesarios
  materials: TaskMaterial[];
  equipment: TaskEquipment[];
  tools: TaskTool[];
  
  // Calidad y verificación
  checklist: ChecklistItem[];
  qualityStandards: QualityStandard[];
  inspections: string[]; // IDs de inspecciones
  
  // Documentación
  attachments: TaskAttachment[];
  photos: Photo[];
  videos: Video[];
  links: string[];
  
  // Custom fields
  customFields: CustomFieldValue[];
  
  // Automatizaciones
  automations: string[]; // IDs de automatizaciones aplicadas
  
  // Comunicación
  comments: TaskComment[];
  mentions: string[]; // IDs de usuarios mencionados
  
  // Fechas calculadas (para Gantt)
  earlyStart?: Date;
  earlyFinish?: Date;
  lateStart?: Date;
  lateFinish?: Date;
  slack?: number; // Días de holgura
  isCritical?: boolean; // En ruta crítica
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  tags: string[];
  color?: string;
  
  // Estado de sincronización
  needsSync?: boolean;
  syncedAt?: Date;
}

export interface TaskDependency {
  id: string;
  predecessorId: string; // Tarea predecesora
  successorId: string; // Tarea sucesora
  type: DependencyType;
  lag: number; // Días de retraso/adelanto (puede ser negativo)
  createdAt: Date;
  createdBy: string;
}

export interface TaskLocation {
  floor?: string;
  zone?: string;
  area?: string;
  building?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
}

export interface TaskMaterial {
  id: string;
  materialId?: string; // ID del material en inventario
  name: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  actualCost?: number;
  status: 'pending' | 'requested' | 'ordered' | 'delivered' | 'used';
  requestedDate?: Date;
  deliveredDate?: Date;
}

export interface TaskEquipment {
  id: string;
  equipmentId?: string;
  name: string;
  quantity: number;
  duration: number; // Horas
  costPerHour: number;
  status: 'pending' | 'reserved' | 'in_use' | 'returned';
}

export interface TaskTool {
  id: string;
  name: string;
  quantity: number;
  assignedTo?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
  required: boolean;
  order: number;
  assignedTo?: string;
  dueDate?: Date;
}

export interface QualityStandard {
  id: string;
  standard: string;
  description: string;
  criteria: string[];
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  notes?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  category?: 'document' | 'image' | 'video' | 'other';
}

export interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  caption?: string;
  takenAt: Date;
  takenBy: string;
  location?: {
    lat: number;
    lng: number;
  };
  tags: string[];
}

export interface Video {
  id: string;
  url: string;
  thumbnail: string;
  duration: number; // segundos
  caption?: string;
  recordedAt: Date;
  recordedBy: string;
}

export interface TaskComment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt?: Date;
  mentions: string[]; // IDs de usuarios mencionados
  attachments: TaskAttachment[];
  replyTo?: string; // ID del comentario padre
  reactions: CommentReaction[];
}

export interface CommentReaction {
  emoji: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

// Filtros de tareas
export interface TaskFilters {
  search?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedTo?: string[];
  owner?: string;
  tags?: string[];
  startDateFrom?: Date;
  startDateTo?: Date;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  progress?: {
    min: number;
    max: number;
  };
  hasAttachments?: boolean;
  hasComments?: boolean;
  isCritical?: boolean;
  isOverdue?: boolean;
  customFields?: {
    [fieldId: string]: any;
  };
}

// Agrupación de tareas
export type TaskGroupBy = 
  | 'status'
  | 'priority'
  | 'assignee'
  | 'dueDate'
  | 'phase'
  | 'type'
  | 'location'
  | 'custom_field';

// Ordenamiento de tareas
export type TaskSortBy = 
  | 'dueDate'
  | 'startDate'
  | 'priority'
  | 'progress'
  | 'name'
  | 'createdAt'
  | 'updatedAt'
  | 'custom_field';

export interface TaskListConfig {
  groupBy?: TaskGroupBy;
  sortBy?: TaskSortBy;
  sortOrder?: 'asc' | 'desc';
  filters?: TaskFilters;
  showSubtasks?: boolean;
  showCompleted?: boolean;
  columnsVisible?: string[];
}

