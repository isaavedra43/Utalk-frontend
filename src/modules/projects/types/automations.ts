// Automatizaciones

export type TriggerType = 
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_status_changed'
  | 'task_assigned'
  | 'task_overdue'
  | 'phase_started'
  | 'phase_completed'
  | 'milestone_reached'
  | 'budget_threshold'
  | 'expense_created'
  | 'document_uploaded'
  | 'document_approved'
  | 'inspection_completed'
  | 'risk_identified'
  | 'team_member_added'
  | 'time_entry_submitted'
  | 'schedule_delay'
  | 'material_low_stock'
  | 'custom';

export type ActionType = 
  | 'send_notification'
  | 'send_email'
  | 'assign_task'
  | 'create_task'
  | 'update_field'
  | 'move_to_phase'
  | 'create_document'
  | 'request_approval'
  | 'update_budget'
  | 'update_timeline'
  | 'create_risk'
  | 'create_nonconformity'
  | 'trigger_webhook'
  | 'run_script'
  | 'custom';

export interface ProjectAutomation {
  id: string;
  projectId: string;
  
  // Básico
  name: string;
  description: string;
  enabled: boolean;
  
  // Trigger (cuándo se activa)
  trigger: AutomationTrigger;
  
  // Condiciones (validaciones adicionales)
  conditions: AutomationCondition[];
  
  // Acciones (qué hace)
  actions: AutomationAction[];
  
  // Configuración
  runOnce: boolean; // Solo ejecutar una vez por trigger
  delay?: number; // Minutos de delay antes de ejecutar
  
  // Logs
  executionLogs: AutomationLog[];
  lastExecuted?: Date;
  executionCount: number;
  successCount: number;
  failureCount: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  
  // Testing
  testMode: boolean; // No ejecutar acciones reales
}

export interface AutomationTrigger {
  type: TriggerType;
  
  // Configuración específica del trigger
  config: TriggerConfig;
  
  // Filtros del trigger
  filters?: {
    taskTypes?: string[];
    statuses?: string[];
    priorities?: string[];
    assignees?: string[];
    tags?: string[];
    customFields?: { [fieldId: string]: any };
  };
}

export interface TriggerConfig {
  // Para task_status_changed
  fromStatus?: string;
  toStatus?: string;
  
  // Para budget_threshold
  threshold?: number;
  thresholdType?: 'percentage' | 'amount';
  categoryId?: string;
  
  // Para schedule_delay
  delayDays?: number;
  
  // Para time-based triggers
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:mm
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  
  // Para material_low_stock
  minQuantity?: number;
  
  // Custom
  customConfig?: { [key: string]: any };
}

export interface AutomationCondition {
  id: string;
  
  // Campo a evaluar
  field: string;
  fieldType: string;
  
  // Operador
  operator: ConditionOperator;
  
  // Valor a comparar
  value: any;
  value2?: any; // Para 'between'
  
  // Lógica
  logicOperator?: 'AND' | 'OR';
}

export type ConditionOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'between'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty'
  | 'in_array'
  | 'not_in_array';

export interface AutomationAction {
  id: string;
  type: ActionType;
  order: number; // Orden de ejecución
  
  // Configuración de la acción
  config: ActionConfig;
  
  // Retry en caso de fallo
  retryOnFailure: boolean;
  maxRetries: number;
  
  // Condicional
  runIf?: AutomationCondition[];
}

export interface ActionConfig {
  // Para send_notification
  notification?: {
    recipients: string[]; // User IDs o roles
    recipientType: 'user' | 'role' | 'custom';
    title: string;
    message: string;
    priority: 'low' | 'normal' | 'high';
    channels: ('in_app' | 'email' | 'sms' | 'push')[];
  };
  
  // Para send_email
  email?: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    bodyTemplate?: string;
    attachments?: string[];
  };
  
  // Para assign_task
  assignTask?: {
    taskId?: string;
    assignTo: string; // User ID o rol
    assignmentType: 'user' | 'role' | 'round_robin' | 'least_busy';
    notifyAssignee: boolean;
  };
  
  // Para create_task
  createTask?: {
    name: string;
    description: string;
    phaseId?: string;
    assignTo?: string;
    dueInDays?: number;
    priority?: string;
    customFields?: { [key: string]: any };
  };
  
  // Para update_field
  updateField?: {
    targetType: 'task' | 'project' | 'phase' | 'custom';
    targetId?: string;
    field: string;
    value: any;
    operator?: 'set' | 'increment' | 'decrement' | 'append' | 'prepend';
  };
  
  // Para request_approval
  requestApproval?: {
    workflowId: string;
    approvers: string[];
    message?: string;
    dueInHours?: number;
  };
  
  // Para trigger_webhook
  webhook?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH';
    headers?: { [key: string]: string };
    body?: any;
    timeout?: number; // Segundos
  };
  
  // Para run_script
  script?: {
    code: string;
    language: 'javascript' | 'python';
    timeout?: number; // Segundos
    parameters?: { [key: string]: any };
  };
  
  // Custom
  customConfig?: { [key: string]: any };
}

export interface AutomationLog {
  id: string;
  automationId: string;
  
  // Ejecución
  triggeredAt: Date;
  triggeredBy?: string; // User ID si fue manual
  triggerEvent: string;
  
  // Contexto
  context: {
    projectId: string;
    taskId?: string;
    phaseId?: string;
    documentId?: string;
    [key: string]: any;
  };
  
  // Resultados
  status: 'success' | 'partial' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  duration: number; // Milisegundos
  
  // Acciones ejecutadas
  actionsExecuted: ActionLog[];
  
  // Errores
  errors: AutomationError[];
  
  // Output
  output?: any;
}

export interface ActionLog {
  actionId: string;
  actionType: ActionType;
  status: 'success' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  duration: number;
  result?: any;
  error?: string;
}

export interface AutomationError {
  actionId?: string;
  error: string;
  stack?: string;
  timestamp: Date;
}

// Automatizaciones predefinidas
export interface PresetAutomation {
  name: string;
  description: string;
  category: string;
  
  // Template de la automatización
  template: Omit<ProjectAutomation, 'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'createdBy'>;
  
  // Popularidad
  timesUsed: number;
  rating: number;
  
  // Tags
  tags: string[];
  
  // Requisitos
  requiresFeatures: string[];
  requiresIntegrations: string[];
}

// Variables disponibles en automatizaciones
export interface AutomationVariable {
  name: string;
  type: string;
  description: string;
  example: any;
  availableIn: TriggerType[];
}

// Testing de automatizaciones
export interface AutomationTest {
  automationId: string;
  testDate: Date;
  testedBy: string;
  
  // Escenario de prueba
  scenario: {
    trigger: any;
    context: any;
    expectedActions: number;
  };
  
  // Resultados
  passed: boolean;
  actionsExecuted: number;
  expectedActionsExecuted: boolean;
  errors: string[];
  
  // Log
  executionLog: AutomationLog;
  
  // Notas
  notes?: string;
}

