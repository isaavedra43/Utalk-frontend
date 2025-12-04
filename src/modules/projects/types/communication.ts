// Comunicación, colaboración y flujos de aprobación

export interface ProjectChat {
  channelId: string;
  channelName: string;
  
  // Miembros
  members: string[];
  
  // Configuración
  allowFileSharing: boolean;
  allowMentions: boolean;
  allowReactions: boolean;
  
  // Integración
  integrationEnabled: boolean;
  syncWithInternalChat: boolean;
}

export interface Comment {
  id: string;
  
  // Contexto
  projectId: string;
  contextType: 'project' | 'task' | 'document' | 'phase' | 'milestone' | 'expense' | 'risk' | 'inspection';
  contextId: string;
  
  // Contenido
  text: string;
  richText?: string; // HTML
  
  // Autor
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  
  // Thread
  replyTo?: string; // ID del comentario padre
  replies: Comment[];
  threadId?: string;
  
  // Menciones
  mentions: Mention[];
  
  // Adjuntos
  attachments: CommentAttachment[];
  
  // Reacciones
  reactions: Reaction[];
  
  // Estado
  edited: boolean;
  editedAt?: Date;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  
  // Resolución (para comentarios que requieren acción)
  requiresAction: boolean;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt?: Date;
  
  // Privacidad
  isPrivate: boolean;
  visibleTo?: string[];
}

export interface Mention {
  id: string;
  mentionedUserId: string;
  mentionedUserName: string;
  position: number; // Posición en el texto
  notified: boolean;
  notifiedAt?: Date;
  read: boolean;
  readAt?: Date;
}

export interface CommentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

// Flujos de aprobación
export interface ApprovalWorkflow {
  id: string;
  projectId?: string; // Si es específico de un proyecto
  
  // Básico
  name: string;
  description?: string;
  code?: string; // Código único
  
  // Tipo
  type: 'sequential' | 'parallel' | 'conditional' | 'hybrid';
  
  // Pasos del flujo
  steps: ApprovalStep[];
  
  // Aplicable a
  appliesTo: ('task' | 'document' | 'expense' | 'change_order' | 'material_request' | 'custom')[];
  
  // Condiciones para activar
  triggers: WorkflowTrigger[];
  
  // Automatización
  autoTriggers: boolean;
  autoComplete: boolean;
  
  // Notificaciones
  notifications: WorkflowNotification[];
  
  // Timeout global
  timeout?: number; // Horas
  timeoutAction: 'escalate' | 'auto_approve' | 'auto_reject' | 'notify';
  
  // Estado
  active: boolean;
  
  // Uso
  timesUsed: number;
  avgCompletionTime: number; // Horas
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Template
  isTemplate: boolean;
  templateCategory?: string;
}

export interface ApprovalStep {
  id: string;
  stepNumber: number;
  name: string;
  description?: string;
  
  // Aprobadores
  approvers: ApproverConfig[];
  
  // Reglas
  approvalRule: 'any' | 'all' | 'majority' | 'custom'; // Cuántos deben aprobar
  minimumApprovals?: number; // Para 'custom'
  
  // Comportamiento
  required: boolean;
  canSkip: boolean;
  skipConditions?: SkipCondition[];
  
  // Timeout
  timeout?: number; // Horas
  escalation?: EscalationRule;
  
  // Siguiente paso (para flujos condicionales)
  nextStepIf?: ConditionalNextStep[];
  
  // Acciones al aprobar/rechazar
  onApprove?: StepAction[];
  onReject?: StepAction[];
  
  // Metadata
  order: number;
}

export interface ApproverConfig {
  type: 'user' | 'role' | 'group' | 'dynamic';
  
  // Para type = 'user'
  userId?: string;
  
  // Para type = 'role'
  role?: string;
  
  // Para type = 'group'
  groupId?: string;
  
  // Para type = 'dynamic'
  dynamicRule?: string; // Ej: "project_manager", "task_owner", etc.
  
  // Delegación
  canDelegate: boolean;
  delegatedTo?: string;
  
  // Backup
  backupApprover?: string;
  backupAfterHours?: number;
}

export interface SkipCondition {
  field: string;
  operator: string;
  value: any;
}

export interface EscalationRule {
  escalateAfterHours: number;
  escalateTo: string[]; // User IDs
  notifyOriginalApprover: boolean;
  escalationMessage?: string;
}

export interface ConditionalNextStep {
  condition: {
    field: string;
    operator: string;
    value: any;
  };
  nextStepId: string;
}

export interface StepAction {
  type: 'send_notification' | 'update_field' | 'create_task' | 'trigger_automation' | 'custom';
  config: any;
}

export interface WorkflowTrigger {
  event: string;
  conditions?: any[];
}

export interface WorkflowNotification {
  event: 'started' | 'step_completed' | 'approved' | 'rejected' | 'timeout' | 'escalated';
  recipients: string[];
  template: string;
  channels: ('email' | 'push' | 'in_app')[];
}

// Instancia de aprobación
export interface ApprovalInstance {
  id: string;
  workflowId: string;
  workflowName: string;
  
  // Recurso que se aprueba
  resourceType: string;
  resourceId: string;
  resourceName: string;
  
  // Solicitante
  requestedBy: string;
  requestedByName: string;
  requestedAt: Date;
  
  // Estado general
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  
  // Paso actual
  currentStep: number;
  totalSteps: number;
  
  // Aprobaciones por paso
  stepApprovals: StepApprovalStatus[];
  
  // Timeline
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // Horas
  
  // Resultado final
  finalDecision?: 'approved' | 'rejected';
  finalDecisionBy?: string;
  finalDecisionAt?: Date;
  finalComments?: string;
  
  // Historial
  history: ApprovalHistory[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface StepApprovalStatus {
  stepId: string;
  stepNumber: number;
  stepName: string;
  
  // Aprobadores
  approvers: ApproverStatus[];
  
  // Estado del paso
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'skipped';
  
  // Resultado
  approvalsRequired: number;
  approvalsReceived: number;
  rejectionsReceived: number;
  
  // Timeline
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // Horas
  
  // Escalación
  escalated: boolean;
  escalatedAt?: Date;
  escalatedTo?: string[];
}

export interface ApproverStatus {
  userId: string;
  userName: string;
  userRole: string;
  
  // Respuesta
  status: 'pending' | 'approved' | 'rejected' | 'delegated' | 'expired';
  respondedAt?: Date;
  comments?: string;
  
  // Delegación
  delegatedTo?: string;
  delegatedAt?: Date;
  
  // Notificaciones
  notifiedAt?: Date;
  remindersSent: number;
  lastReminderAt?: Date;
  
  // Timeout
  dueAt?: Date;
  isOverdue: boolean;
}

export interface ApprovalHistory {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  
  // Evento
  event: 'started' | 'step_completed' | 'approved' | 'rejected' | 'escalated' | 'expired' | 'cancelled';
  
  // Detalles
  details: string;
  stepNumber?: number;
  comments?: string;
  
  // Cambios
  before?: any;
  after?: any;
}

// Notificaciones del proyecto
export interface ProjectNotification {
  id: string;
  projectId: string;
  
  // Tipo
  type: NotificationType;
  
  // Contenido
  title: string;
  message: string;
  
  // Destinatarios
  recipients: string[];
  
  // Prioridad
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Canal
  channels: ('email' | 'push' | 'sms' | 'in_app')[];
  
  // Contexto
  contextType?: string;
  contextId?: string;
  contextUrl?: string;
  
  // Acción sugerida
  actionLabel?: string;
  actionUrl?: string;
  
  // Estado
  sent: boolean;
  sentAt?: Date;
  delivered: boolean;
  deliveredAt?: Date;
  read: boolean;
  readAt?: Date;
  
  // Agrupación
  groupKey?: string; // Para agrupar notificaciones similares
  
  // Metadata
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType = 
  | 'task_assigned'
  | 'task_completed'
  | 'task_overdue'
  | 'task_commented'
  | 'task_mentioned'
  | 'milestone_reached'
  | 'phase_completed'
  | 'budget_alert'
  | 'budget_exceeded'
  | 'schedule_delay'
  | 'document_uploaded'
  | 'document_approved'
  | 'approval_required'
  | 'approval_approved'
  | 'approval_rejected'
  | 'team_member_added'
  | 'risk_identified'
  | 'inspection_scheduled'
  | 'inspection_failed'
  | 'material_delivered'
  | 'material_low_stock'
  | 'custom';

// Actualizaciones del proyecto
export interface ProjectUpdate {
  id: string;
  projectId: string;
  
  // Contenido
  title: string;
  content: string;
  richContent?: string; // HTML
  
  // Tipo
  type: 'general' | 'milestone' | 'issue' | 'success' | 'alert' | 'custom';
  
  // Autor
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  
  // Adjuntos
  attachments: UpdateAttachment[];
  photos: string[];
  
  // Visibilidad
  visibility: 'team' | 'stakeholders' | 'client' | 'public';
  visibleTo?: string[];
  
  // Reacciones y comentarios
  reactions: Reaction[];
  comments: Comment[];
  
  // Metadata
  createdAt: Date;
  updatedAt?: Date;
  pinned: boolean;
  pinnedAt?: Date;
  tags: string[];
}

export interface UpdateAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

// Reuniones del proyecto
export interface ProjectMeeting {
  id: string;
  projectId: string;
  
  // Básico
  title: string;
  description?: string;
  type: 'standup' | 'review' | 'planning' | 'retrospective' | 'client' | 'custom';
  
  // Fecha y hora
  startTime: Date;
  endTime: Date;
  duration: number; // Minutos
  timezone: string;
  
  // Ubicación
  location?: string;
  isVirtual: boolean;
  meetingUrl?: string;
  
  // Participantes
  organizer: string;
  required: string[];
  optional: string[];
  attendees: MeetingAttendee[];
  
  // Agenda
  agenda: AgendaItem[];
  
  // Notas
  notes?: string;
  richNotes?: string;
  
  // Grabación
  recordingUrl?: string;
  recordingDuration?: number;
  
  // Seguimiento
  actionItems: ActionItem[];
  decisions: Decision[];
  
  // Recordatorios
  reminders: MeetingReminder[];
  
  // Recurrente
  isRecurring: boolean;
  recurrence?: RecurrencePattern;
  
  // Estado
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface MeetingAttendee {
  userId: string;
  userName: string;
  status: 'invited' | 'accepted' | 'declined' | 'tentative' | 'attended' | 'absent';
  respondedAt?: Date;
  joinedAt?: Date;
  leftAt?: Date;
  durationAttended?: number; // Minutos
}

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  duration: number; // Minutos
  presenter?: string;
  order: number;
  completed: boolean;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
  taskId?: string; // Si se convirtió en tarea
}

export interface Decision {
  id: string;
  decision: string;
  rationale?: string;
  decidedBy: string[];
  impact: string;
  relatedTo?: string; // ID de tarea, documento, etc.
}

export interface MeetingReminder {
  type: 'email' | 'push' | 'sms';
  sendBefore: number; // Minutos antes
  sent: boolean;
  sentAt?: Date;
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  endsOn?: Date;
  occurrences?: number;
  daysOfWeek?: number[]; // Para weekly
  dayOfMonth?: number; // Para monthly
}

