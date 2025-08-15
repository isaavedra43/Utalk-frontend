// Tipos de notificación - Sistema de Centro de Notificaciones
// Basado en las especificaciones del diseño del Centro de Notificaciones

// Tipos de notificación
export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'conversation' | 'meeting' | 'sla' | 'churn' | 'system' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  category: 'today' | 'unread' | 'actionable' | 'urgent';
  timestamp: string; // "hace 14m", "hace 35m"
  createdAt: Date;
  isNew: boolean;
  icon: NotificationIconType;
  tags: NotificationTag[];
  relatedTo?: string; // "Ana Martínez (WhatsApp)"
  context?: NotificationContext;
  aiRecommendation?: NotificationAIRecommendation;
  quickActions: QuickAction[];
  timeline?: TimelineEvent[];
  relatedLinks?: RelatedLink[];
}

// Tags de notificación
export interface NotificationTag {
  label: string;
  type: 'contact' | 'topic' | 'priority' | 'channel';
  color?: 'grey' | 'red' | 'orange' | 'blue' | 'green';
}

// Contexto de la notificación
export interface NotificationContext {
  originalMessage?: string;
  slaExceededSince?: string;
  meetingTime?: string;
  clientName?: string;
}

// Recomendación de IA
export interface NotificationAIRecommendation {
  recommendation: string;
  confidence: 'low' | 'medium' | 'high';
  suggestedSteps: string[];
}

// Acción rápida
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: 'primary' | 'secondary' | 'danger' | 'success';
  action: () => void;
}

// Evento de timeline
export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

// Enlace relacionado
export interface RelatedLink {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

// Tipos de iconos de notificación
export type NotificationIconType = 
  | 'conversation-assigned'
  | 'meeting-reminder'
  | 'sla-expired'
  | 'churn-risk'
  | 'system-alert'
  | 'urgent';

// Filtros de notificación
export interface NotificationFilters {
  category: 'today' | 'unread' | 'actionable' | 'urgent' | 'all';
  priority: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  type: 'all' | 'conversation' | 'meeting' | 'sla' | 'churn' | 'system' | 'alert';
  search: string;
}

// Estadísticas de notificaciones
export interface NotificationStats {
  total: number;
  new: number;
  unread: number;
  actionable: number;
  urgent: number;
}

// Configuración de notificaciones
export interface NotificationModuleSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  desktop: boolean;
  categories: {
    conversation: boolean;
    meeting: boolean;
    sla: boolean;
    churn: boolean;
    system: boolean;
    alert: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "08:00"
  };
}

// Estado del módulo de notificaciones
export interface NotificationState {
  notifications: Notification[];
  selectedNotification: Notification | null;
  filters: NotificationFilters;
  stats: NotificationStats;
  loading: boolean;
  error: string | null;
  isPaused: boolean;
  settings: NotificationModuleSettings;
}

// Acciones de notificación
export interface NotificationAction {
  type: string;
  payload?: unknown;
}

// Respuesta de la API de notificaciones
export interface NotificationAPIResponse {
  success: boolean;
  data?: Notification[] | Notification | NotificationStats;
  error?: string;
  message?: string;
}

// WebSocket events para notificaciones en tiempo real
export interface NotificationWebSocketEvent {
  type: 'notification_created' | 'notification_updated' | 'notification_deleted' | 'notification_read';
  data: Notification;
  timestamp: string;
}

// Tipos de exportación
export interface NotificationExportOptions {
  format: 'csv' | 'json' | 'pdf';
  dateRange: {
    start: Date;
    end: Date;
  };
  filters?: NotificationFilters;
  includeDetails?: boolean;
}

// Tipos de búsqueda avanzada
export interface NotificationSearchQuery {
  text: string;
  from?: string;
  type?: Notification['type'];
  priority?: Notification['priority'];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

// Tipos de agrupación
export interface NotificationGroup {
  key: string;
  label: string;
  notifications: Notification[];
  count: number;
}

// Tipos de ordenamiento
export type NotificationSortField = 'createdAt' | 'priority' | 'type' | 'status' | 'title';
export type NotificationSortOrder = 'asc' | 'desc';

export interface NotificationSortOptions {
  field: NotificationSortField;
  order: NotificationSortOrder;
}

// Tipos de paginación
export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Tipos de respuesta paginada
export interface NotificationPaginatedResponse {
  notifications: Notification[];
  pagination: NotificationPagination;
  stats: NotificationStats;
}

// Tipos de bulk actions
export interface NotificationBulkAction {
  type: 'mark_read' | 'mark_unread' | 'archive' | 'delete' | 'change_priority';
  notificationIds: string[];
  data?: Record<string, unknown>;
}

// Tipos de templates de notificación
export interface NotificationTemplate {
  id: string;
  name: string;
  type: Notification['type'];
  title: string;
  description: string;
  tags: NotificationTag[];
  quickActions: QuickAction[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de reglas de notificación
export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  conditions: NotificationRuleCondition[];
  actions: NotificationRuleAction[];
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationRuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | boolean | string[] | number[];
}

export interface NotificationRuleAction {
  type: 'create_notification' | 'send_email' | 'assign_to' | 'change_priority';
  data: Record<string, unknown>;
}

// Tipos de métricas y analytics
export interface NotificationMetrics {
  totalNotifications: number;
  unreadCount: number;
  responseTime: {
    average: number;
    median: number;
    p95: number;
  };
  byType: Record<Notification['type'], number>;
  byPriority: Record<Notification['priority'], number>;
  byStatus: Record<Notification['status'], number>;
  timeDistribution: {
    hourly: Record<string, number>;
    daily: Record<string, number>;
    weekly: Record<string, number>;
  };
}

// Tipos de integración con otros módulos
export interface NotificationIntegration {
  module: 'chat' | 'clients' | 'team' | 'dashboard';
  action: string;
  data: Record<string, unknown>;
  notification: Partial<Notification>;
}

// Tipos de auditoría
export interface NotificationAuditLog {
  id: string;
  notificationId: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: Date;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
} 