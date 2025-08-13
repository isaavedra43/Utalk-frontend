/**
 * Tipos TypeScript para Dashboard de UTalk
 * Basados en el diseño de referencia y especificaciones del plan de trabajo
 */

// ============================================================================
// TIPOS PARA KPI CARDS
// ============================================================================

export interface KPIData {
  id: string;
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number; // Porcentaje de cambio
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: string; // Nombre del icono Lucide (ej: 'Smile', 'Clock')
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
  description?: string;
}

// ============================================================================
// TIPOS PARA ACTIVITY CHART
// ============================================================================

export interface ActivityData {
  hour: string; // Formato "00:00", "01:00", etc.
  messages: number;
  previousDay: number;
  timestamp: Date;
}

// ============================================================================
// TIPOS PARA AGENT RANKING
// ============================================================================

export interface AgentData {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  conversationsHandled: number;
  averageResponseTime: number; // En minutos
  satisfactionRate: number; // 0-100 porcentaje
  status: 'active' | 'inactive' | 'busy' | 'away';
  lastActivity: Date;
  totalResolved: number;
  rank: number; // Posición en el ranking (1, 2, 3...)
}

// ============================================================================
// TIPOS PARA SENTIMENT ANALYSIS
// ============================================================================

export interface SentimentData {
  channel: 'whatsapp' | 'facebook' | 'webchat' | 'email';
  channelName: string;
  positive: number;
  neutral: number;
  negative: number;
  totalMessages: number;
  color: string; // Color hex para el canal
}

export interface SentimentSummary {
  totalMessages: number;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
  channels: SentimentData[];
}

// ============================================================================
// TIPOS PARA TOPICS & ALERTS IA
// ============================================================================

export interface EmergingTopic {
  id: string;
  topic: string;
  frequency: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: 'complaint' | 'question' | 'compliment' | 'suggestion';
  keywords: string[];
  trend: 'rising' | 'stable' | 'falling';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface RiskCustomer {
  id: string;
  name: string;
  email: string;
  value: number; // Valor económico del cliente
  riskLevel: number; // 0-100 porcentaje de riesgo
  reason: string;
  lastContact: Date;
  daysWithoutContact: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// TIPOS PARA AI INSIGHTS
// ============================================================================

export interface AIInsight {
  id: string;
  type: 'summary' | 'recommendation' | 'alert' | 'trend';
  title: string;
  content: string;
  confidence: number; // 0-100 porcentaje de confianza
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  tags: string[];
}

// ============================================================================
// TIPOS PARA CALENDAR HEATMAP
// ============================================================================

export interface CalendarData {
  date: string; // Formato "2024-01-15"
  messageCount: number;
  conversationCount: number;
  sentimentScore: number; // 0-1 donde 1 = 100% positivo
  hasAlerts: boolean;
}

// ============================================================================
// TIPOS PARA DASHBOARD STATE
// ============================================================================

export interface DashboardState {
  // Datos principales
  kpis: KPIData[];
  activity: ActivityData[];
  agents: AgentData[];
  sentiment: SentimentData[];
  calendar: CalendarData[];
  insights: AIInsight[];
  topics: EmergingTopic[];
  riskCustomers: RiskCustomer[];

  // Estados de la UI
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Filtros y configuración
  selectedPeriod: 'today' | 'week' | 'month';
  selectedChannels: string[];
  autoRefresh: boolean;
}

// ============================================================================
// TIPOS PARA FILTROS Y CONFIGURACIÓN
// ============================================================================

export interface DashboardFilters {
  period: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
  channels: string[];
  agents: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface DashboardConfig {
  autoRefreshInterval: number; // En milisegundos
  defaultPeriod: DashboardFilters['period'];
  enableNotifications: boolean;
  enableSounds: boolean;
  theme: 'light' | 'dark' | 'auto';
}

// ============================================================================
// TIPOS PARA COMPONENTES UI
// ============================================================================

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Record<string, unknown>[];
  label?: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number; // 0-100 para barras de progreso
}

export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
  retryable: boolean;
}

// ============================================================================
// TIPOS PARA EXPORTS Y REPORTES
// ============================================================================

export interface DashboardExport {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  period: DashboardFilters['period'];
  sections: ('kpis' | 'activity' | 'agents' | 'sentiment' | 'insights')[];
  includeCharts: boolean;
  filename?: string;
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

export type DashboardSection =
  | 'kpis'
  | 'activity'
  | 'agents'
  | 'sentiment'
  | 'topics'
  | 'calendar'
  | 'insights';

export type ChartType = 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'heatmap';

export type StatusColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

// ============================================================================
// TIPOS PARA INTEGRACIONES FUTURAS
// ============================================================================

export interface DashboardWidget {
  id: string;
  type: DashboardSection;
  title: string;
  position: { x: number; y: number; w: number; h: number };
  visible: boolean;
  config: Record<string, unknown>;
}

export interface CustomDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  owner: string;
  shared: boolean;
  createdAt: Date;
  updatedAt: Date;
}
