/**
 * Tipos TypeScript para Módulo de Equipo & Performance - UTalk
 * Basados en las especificaciones detalladas del diseño
 */

// ============================================================================
// TIPOS PRINCIPALES DEL AGENTE
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  metrics: AgentMetrics;
  permissions: AgentPermissions;
  coaching: CoachingData;
  insights: InsightData[];
  trends: TrendData;
  lastActivity: Date;
}

// ============================================================================
// MÉTRICAS DEL AGENTE
// ============================================================================

export interface AgentMetrics {
  // Métricas principales (mostradas en cards)
  chatsHandled: number;
  csatScore: number; // 0-5 escala
  conversionRate: number; // porcentaje
  avgResponseTime: string; // formato "2:15"
  chatsClosedWithoutEscalation: number;

  // Métricas adicionales (tab KPIs)
  totalTimeInChats: string; // formato "34:25"
  firstTimeResolution: number; // porcentaje
  upsellCrossSellRate: number; // porcentaje
  aiQualityScore: number; // 0-5 escala

  // Tendencias y cambios
  chatsHandledChange: number; // porcentaje
  csatScoreChange: number; // porcentaje
  conversionRateChange: number; // porcentaje
  avgResponseTimeChange: number; // porcentaje
  chatsClosedWithoutEscalationChange: number; // porcentaje
}

// ============================================================================
// PERMISOS DEL AGENTE
// ============================================================================

export interface AgentPermissions {
  read: PermissionLevel;
  write: PermissionLevel;
  approve: PermissionLevel;
  configure: PermissionLevel;
  lastModified: Date;
  totalActivePermissions: number;
}

export type PermissionLevel = 'basic' | 'intermediate' | 'advanced';

// ============================================================================
// DATOS DE COACHING
// ============================================================================

export interface CoachingData {
  strengths: CoachingStrength[];
  areasToImprove: CoachingArea[];
  suggestedPlan: CoachingTask[];
  aiScore: number; // 0-100
  confidence: number; // 0-100
}

export interface CoachingStrength {
  id: string;
  title: string;
  description: string;
  category: 'communication' | 'efficiency' | 'quality' | 'sales';
}

export interface CoachingArea {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'communication' | 'efficiency' | 'quality' | 'sales';
}

export interface CoachingTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number; // en minutos
  status: 'pending' | 'completed';
  category: 'training' | 'practice' | 'development';
}

// ============================================================================
// INSIGHTS Y ANÁLISIS
// ============================================================================

export interface InsightData {
  id: string;
  type: 'achievement' | 'alert' | 'recommendation' | 'trend';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  actionLabel?: string;
  actionUrl?: string;
  createdAt: Date;
  category: 'performance' | 'behavior' | 'system' | 'coaching';
}

// ============================================================================
// DATOS DE TENDENCIAS
// ============================================================================

export interface TrendData {
  chatsVsSales: ChartDataPoint[];
  responseTimeByHour: ChartDataPoint[];
  channelDistribution: ChannelData[];
  csatLast30Days: number;
  activityByHour: ChartDataPoint[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  previousValue?: number;
  change?: number; // porcentaje
}

export interface ChannelData {
  channel: 'whatsapp' | 'facebook' | 'webchat' | 'email';
  percentage: number;
  totalMessages: number;
}

// ============================================================================
// ESTADO DEL MÓDULO
// ============================================================================

export interface TeamState {
  // Datos principales
  agents: Agent[];
  selectedAgentId: string | null;

  // Filtros y búsqueda
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'inactive';
  sortBy: 'name' | 'performance' | 'lastActivity';
  sortOrder: 'asc' | 'desc';

  // UI State
  activeTab: 'overview' | 'kpis' | 'trends';
  rightPanelTab: 'actions' | 'insights';

  // Estados de carga
  loading: LoadingStates;

  // Estadísticas
  stats: TeamStats;
}

export interface LoadingStates {
  agents: boolean;
  details: boolean;
  actions: boolean;
  insights: boolean;
}

export interface TeamStats {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  averagePerformance: number;
  topPerformer: string | null;
}

// ============================================================================
// ACCIONES IA
// ============================================================================

export interface AIAction {
  id: string;
  type: 'suggest_improvement' | 'send_reminder' | 'analyze' | 'insert_template';
  title: string;
  description: string;
  icon: string;
  loading: boolean;
  completed: boolean;
  result?: AIActionResult;
}

export interface AIActionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  confidence?: number;
}

// ============================================================================
// FILTROS Y CONFIGURACIÓN
// ============================================================================

export interface TeamFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  role?: string;
  performance?: 'high' | 'medium' | 'low';
  lastActivity?: 'today' | 'week' | 'month';
}

export interface TeamConfig {
  autoRefresh: boolean;
  refreshInterval: number; // milisegundos
  showInactiveAgents: boolean;
  defaultSort: 'name' | 'performance' | 'lastActivity';
  defaultTab: 'overview' | 'kpis' | 'trends';
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

export type AgentStatus = 'active' | 'inactive';
export type PerformanceStatus = 'improving' | 'stable' | 'attention';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// TIPOS PARA COMPONENTES UI
// ============================================================================

export interface AgentCardProps {
  agent: Agent;
  selected: boolean;
  onSelect: (agentId: string) => void;
  onAction: (action: string, agentId: string) => void;
}

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  status: PerformanceStatus;
  icon: string;
  loading?: boolean;
}

export interface PermissionCardProps {
  type: keyof AgentPermissions;
  level: PermissionLevel;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

// ============================================================================
// TIPOS PARA EVENTOS
// ============================================================================

export interface TeamEvents {
  agentSelected: (agentId: string) => void;
  agentUpdated: (agent: Agent) => void;
  filterChanged: (filters: TeamFilters) => void;
  actionExecuted: (action: AIAction) => void;
  permissionChanged: (agentId: string, permissions: AgentPermissions) => void;
}

// ============================================================================
// TIPOS PARA BACKEND SERVICE
// ============================================================================

export type AgentRole =
  | 'Ejecutivo WhatsApp Senior'
  | 'Ejecutivo WhatsApp Junior'
  | 'Supervisor de Ventas'
  | 'Agente de Soporte'
  | 'Especialista en Chat'
  | 'Coordinador de Equipo';

export interface AgentAction {
  id: string;
  type: string;
  title: string;
  description: string;
  agentId: string;
  parameters?: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  createdAt: Date;
  executedAt?: Date;
  result?: unknown;
  executionTime?: number;
  confidence?: number;
}

export interface AgentInsight {
  id: string;
  type: 'achievement' | 'trend' | 'alert' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: 'performance' | 'behavior' | 'coaching' | 'sales';
  actionable: boolean;
  actionLabel?: string;
  agentId: string;
  createdAt: Date;
  data?: Record<string, unknown>;
}
