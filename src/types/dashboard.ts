// Tipos para el módulo de Dashboard
// Basados en el análisis de las imágenes del dashboard

// Tipos de métricas principales (KPIs)
export interface DashboardMetrics {
  globalSentiment: SentimentMetric;
  averageResponseTime: TimeMetric;
  resolvedConversations: CountMetric;
  salesFromChats: RevenueMetric;
}

export interface SentimentMetric {
  value: number; // 78%
  previousValue: number; // 72%
  trend: number; // +8.3%
  description: string;
  icon: string;
  color: 'green' | 'red' | 'blue' | 'purple';
}

export interface TimeMetric {
  value: string; // "2.4 min"
  previousValue: string; // "3.1 min"
  trend: number; // -22.6%
  description: string;
  icon: string;
  color: 'green' | 'red' | 'blue' | 'purple';
}

export interface CountMetric {
  value: number; // 147
  previousValue: number; // 132
  trend: number; // +11.4%
  description: string;
  icon: string;
  color: 'green' | 'red' | 'blue' | 'purple';
}

export interface RevenueMetric {
  value: string; // "€12,450"
  previousValue: string; // "€9,800"
  trend: number; // +27.0%
  description: string;
  icon: string;
  color: 'green' | 'red' | 'blue' | 'purple';
}

// Tipos para análisis de sentimiento
export interface SentimentAnalysis {
  distribution: SentimentDistribution;
  byChannel: ChannelSentiment[];
  totalMessages: number;
}

export interface SentimentDistribution {
  positive: SentimentCategory;
  neutral: SentimentCategory;
  negative: SentimentCategory;
}

export interface SentimentCategory {
  count: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface ChannelSentiment {
  channel: 'WhatsApp' | 'Facebook' | 'Web Chat';
  messageCount: number;
  positivePercentage: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

// Tipos para ranking de agentes
export interface AgentRanking {
  agents: AgentPerformance[];
  totalAgents: number;
  date: string;
}

export interface AgentPerformance {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  rank: number;
  conversations: number;
  responseTime: string;
  resolvedCount: number;
  status: 'active' | 'busy' | 'absent' | 'offline';
  performance: number; // 96%
  lastActivity: string;
  isTopPerformer?: boolean;
  crown?: boolean;
}

// Tipos para actividad diaria
export interface DailyActivity {
  title: string;
  subtitle: string;
  totalMessages: number;
  comparison: string;
  peakHour: string;
  chartData: HourlyActivity[];
}

export interface HourlyActivity {
  hour: string;
  messages: number;
  isPeak: boolean;
  color: string;
}

// Tipos para temas y alertas
export interface ThemesAlerts {
  themes: ThemeAlert[];
  totalThemes: number;
  activeTab: 'themes' | 'customers';
}

export interface ThemeAlert {
  id: string;
  title: string;
  icon: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'Complaint' | 'Question' | 'Compliment' | 'Request';
  keywords: string[];
  color: string;
}

// Tipos para calendario de actividad
export interface ActivityCalendar {
  month: string;
  year: number;
  totalMessages: number;
  days: CalendarDay[];
  legend: ActivityLegend;
}

export interface CalendarDay {
  date: Date;
  messageCount: number;
  intensity: number; // 0-4 para colores
  isCurrentMonth: boolean;
}

export interface ActivityLegend {
  levels: ActivityLevel[];
}

export interface ActivityLevel {
  intensity: number;
  color: string;
  label: string;
}

// Tipos para insights de IA
export interface AIInsights {
  dailySummary: DailySummary;
  recommendations: AIRecommendation[];
  totalRecommendations: number;
}

export interface DailySummary {
  content: string;
  confidence: number;
  timestamp: string;
  metrics: {
    totalMessages: number;
    positiveSentiment: number;
    fastestAgent: string;
    peakHour: string;
    peakReason: string;
  };
}

export interface AIRecommendation {
  id: string;
  type: 'alert' | 'recommendation' | 'trend';
  title: string;
  content: string;
  confidence: number;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
  actions: {
    action: boolean;
    copy: boolean;
    details: boolean;
  };
  icon: string;
  color: string;
}

// Tipos para el header del dashboard
export interface DashboardHeader {
  greeting: string;
  currentTime: string;
  lastUpdated: string;
  searchPlaceholder: string;
  user: {
    name: string;
    avatar: string;
  };
  actions: {
    aiView: boolean;
    refresh: boolean;
    notifications: number;
  };
}

// Tipo principal del dashboard
export interface DashboardData {
  header: DashboardHeader;
  metrics: DashboardMetrics;
  sentimentAnalysis: SentimentAnalysis;
  agentRanking: AgentRanking;
  dailyActivity: DailyActivity;
  themesAlerts: ThemesAlerts;
  activityCalendar: ActivityCalendar;
  aiInsights: AIInsights;
  lastUpdated: string;
}

// Tipos para filtros del dashboard
export interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  channels: string[];
  agents: string[];
  sentiment: ('positive' | 'neutral' | 'negative')[];
}

// Tipos para actualizaciones en tiempo real
export interface DashboardUpdate {
  type: 'metrics' | 'sentiment' | 'agents' | 'activity' | 'themes' | 'insights';
  data: Partial<DashboardData>;
  timestamp: string;
} 