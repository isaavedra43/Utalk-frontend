// Reportes, dashboards y analíticas

export type DashboardWidgetType = 
  | 'kpi_card'
  | 'chart'
  | 'table'
  | 'gantt'
  | 'timeline'
  | 'progress_bar'
  | 'gauge'
  | 'heatmap'
  | 'list'
  | 'calendar'
  | 'custom';

export type ChartType = 
  | 'bar'
  | 'line'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'area'
  | 'radar'
  | 'bubble'
  | 'waterfall'
  | 'funnel';

export type ReportType = 
  | 'status'
  | 'financial'
  | 'time'
  | 'resource'
  | 'quality'
  | 'risk'
  | 'executive'
  | 'custom';

export interface ProjectDashboard {
  id: string;
  projectId: string;
  
  // Básico
  name: string;
  description?: string;
  
  // Layout
  layout: DashboardLayout;
  
  // Widgets
  widgets: DashboardWidget[];
  
  // Filtros globales
  filters: DashboardFilter[];
  
  // Período de tiempo
  timePeriod: TimePeriod;
  
  // Refrescar automático
  autoRefresh: boolean;
  refreshInterval: number; // Segundos
  lastRefreshed?: Date;
  
  // Compartir
  isPublic: boolean;
  sharedWith: string[];
  isDefault: boolean;
  
  // Exportar
  canExport: boolean;
  exportFormats: ('pdf' | 'excel' | 'image' | 'json')[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DashboardLayout {
  type: 'grid' | 'freeform';
  columns: number;
  rowHeight: number;
  gap: number;
  responsive: boolean;
}

export interface DashboardWidget {
  id: string;
  type: DashboardWidgetType;
  title: string;
  description?: string;
  
  // Posición y tamaño
  position: WidgetPosition;
  
  // Configuración del widget
  dataSource: DataSource;
  visualization: VisualizationConfig;
  
  // Filtros específicos del widget
  filters: WidgetFilter[];
  
  // Interactividad
  interactive: boolean;
  drillDownEnabled: boolean;
  
  // Actualización
  autoRefresh: boolean;
  refreshInterval?: number;
  lastUpdated?: Date;
  
  // Formato
  showHeader: boolean;
  showFooter: boolean;
  theme?: 'light' | 'dark' | 'auto';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number; // Grid units
  height: number; // Grid units
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  locked: boolean; // No se puede mover/redimensionar
}

export interface DataSource {
  type: 'project' | 'tasks' | 'budget' | 'team' | 'materials' | 'quality' | 'risks' | 'custom';
  
  // Query
  query?: DataQuery;
  
  // Agregaciones
  aggregation?: DataAggregation;
  
  // Transformaciones
  transformations?: DataTransformation[];
  
  // Cache
  cacheEnabled: boolean;
  cacheDuration?: number; // Segundos
}

export interface DataQuery {
  entity: string;
  fields: string[];
  filters: any[];
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

export interface DataAggregation {
  groupBy: string[];
  aggregates: {
    field: string;
    function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
    alias: string;
  }[];
}

export interface DataTransformation {
  type: 'filter' | 'map' | 'reduce' | 'sort' | 'group' | 'join' | 'pivot' | 'custom';
  config: any;
}

export interface VisualizationConfig {
  // Para charts
  chart?: ChartConfig;
  
  // Para KPI cards
  kpi?: KPIConfig;
  
  // Para tables
  table?: TableConfig;
  
  // Para gauges
  gauge?: GaugeConfig;
  
  // Para progress bars
  progressBar?: ProgressBarConfig;
  
  // Común
  colors?: string[];
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
}

export interface ChartConfig {
  type: ChartType;
  
  // Ejes
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  
  // Series
  series: SeriesConfig[];
  
  // Estilo
  colors: string[];
  showGrid: boolean;
  showLegend: boolean;
  stacked?: boolean;
  
  // Interactividad
  animations: boolean;
  clickable: boolean;
  zoomable: boolean;
}

export interface AxisConfig {
  label: string;
  field: string;
  type: 'category' | 'value' | 'time' | 'log';
  format?: string;
  min?: number;
  max?: number;
  showGridLines: boolean;
}

export interface SeriesConfig {
  name: string;
  field: string;
  type?: ChartType; // Para gráficos mixtos
  color?: string;
  stack?: string;
  showValues: boolean;
  valueFormat?: string;
}

export interface KPIConfig {
  value: string; // Campo a mostrar
  format: 'number' | 'currency' | 'percentage' | 'duration' | 'custom';
  prefix?: string;
  suffix?: string;
  decimals: number;
  
  // Comparación
  comparisonValue?: string;
  comparisonLabel?: string;
  showTrend: boolean;
  trendDirection?: 'up' | 'down' | 'neutral';
  trendColor?: string;
  
  // Rangos
  ranges?: KPIRange[];
  
  // Estilo
  size: 'small' | 'medium' | 'large';
  icon?: string;
  color?: string;
}

export interface KPIRange {
  min: number;
  max: number;
  color: string;
  label: string;
}

export interface TableConfig {
  columns: DashboardTableColumn[];
  pagination: boolean;
  pageSize: number;
  sortable: boolean;
  filterable: boolean;
  exportable: boolean;
  rowActions?: RowAction[];
}

export interface DashboardTableColumn {
  field: string;
  header: string;
  type: 'text' | 'number' | 'date' | 'status' | 'progress' | 'user' | 'badge';
  format?: string;
  sortable: boolean;
  filterable: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface RowAction {
  label: string;
  icon?: string;
  action: string;
  requiresConfirmation: boolean;
}

export interface GaugeConfig {
  value: string;
  min: number;
  max: number;
  target?: number;
  unit?: string;
  
  // Rangos de color
  ranges: GaugeRange[];
  
  // Estilo
  showValue: boolean;
  showTarget: boolean;
  size: number;
}

export interface GaugeRange {
  from: number;
  to: number;
  color: string;
  label?: string;
}

export interface ProgressBarConfig {
  value: string; // Current value field
  total: string; // Total value field
  format: 'number' | 'percentage';
  
  // Estilo
  showPercentage: boolean;
  showValues: boolean;
  color?: string;
  height: number;
  
  // Segmentos
  segments?: ProgressSegment[];
}

export interface ProgressSegment {
  value: number;
  color: string;
  label: string;
}

export interface LegendConfig {
  show: boolean;
  position: 'top' | 'right' | 'bottom' | 'left';
  align: 'start' | 'center' | 'end';
  clickable: boolean;
}

export interface TooltipConfig {
  enabled: boolean;
  format?: string;
  showTitle: boolean;
  shared: boolean; // Compartir entre series
}

export interface DashboardFilter {
  id: string;
  field: string;
  label: string;
  type: 'select' | 'multiselect' | 'date_range' | 'number_range' | 'text';
  options?: any[];
  defaultValue?: any;
  appliesTo: string[]; // IDs de widgets afectados
}

export interface WidgetFilter {
  field: string;
  operator: string;
  value: any;
}

export interface TimePeriod {
  type: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom' | 'all_time';
  customStart?: Date;
  customEnd?: Date;
  compareWithPrevious: boolean;
}

// Reportes
export interface ProjectReport {
  id: string;
  projectId: string;
  type: ReportType;
  
  // Básico
  name: string;
  description?: string;
  
  // Configuración
  config: ReportConfig;
  
  // Período
  period: TimePeriod;
  
  // Secciones del reporte
  sections: ReportSection[];
  
  // Generación
  generatedAt?: Date;
  generatedBy?: string;
  status: 'draft' | 'generating' | 'ready' | 'error';
  
  // Exportación
  exportFormats: string[];
  exportedFiles: ExportedFile[];
  
  // Programación
  isScheduled: boolean;
  schedule?: ReportSchedule;
  
  // Distribución
  recipients: string[];
  autoSend: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ReportConfig {
  // Secciones a incluir
  includeSummary: boolean;
  includeCharts: boolean;
  includeTables: boolean;
  includeDetails: boolean;
  
  // Formato
  pageSize: 'letter' | 'a4' | 'legal';
  orientation: 'portrait' | 'landscape';
  
  // Branding
  includeLogo: boolean;
  logoUrl?: string;
  headerText?: string;
  footerText?: string;
  
  // Estilo
  theme: 'professional' | 'modern' | 'minimal' | 'custom';
  colorScheme: string[];
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'chart' | 'table' | 'text' | 'image' | 'custom';
  order: number;
  
  // Contenido
  content?: any;
  
  // Configuración
  config?: any;
  
  // Visibilidad
  showIf?: any[];
  
  pageBreakBefore: boolean;
  pageBreakAfter: boolean;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string; // HH:mm
  dayOfWeek?: number; // Para weekly
  dayOfMonth?: number; // Para monthly
  timezone: string;
  
  // Siguiente ejecución
  nextRun?: Date;
  lastRun?: Date;
  
  // Destinatarios
  recipients: string[];
  includeAttachment: boolean;
}

export interface ExportedFile {
  format: string;
  url: string;
  size: number;
  generatedAt: Date;
  expiresAt?: Date;
}

// Métricas y KPIs
export interface ProjectMetrics {
  projectId: string;
  
  // Progreso general
  overallProgress: number; // 0-100
  
  // Timeline
  daysElapsed: number;
  daysRemaining: number;
  daysTotal: number;
  percentageTimeElapsed: number;
  onSchedule: boolean;
  scheduleVarianceDays: number;
  
  // Tareas
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  avgTaskCompletionTime: number; // Días
  
  // Presupuesto
  totalBudget: number;
  spentBudget: number;
  committedBudget: number;
  remainingBudget: number;
  percentageSpent: number;
  budgetVariance: number;
  budgetVariancePercentage: number;
  onBudget: boolean;
  
  // Equipo
  totalTeamMembers: number;
  activeMembers: number;
  totalHoursWorked: number;
  avgUtilization: number; // %
  
  // Calidad
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  qualityScore: number; // 0-100
  openNonConformities: number;
  
  // Riesgos
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  totalExposure: number;
  
  // Materiales
  totalMaterials: number;
  deliveredMaterials: number;
  materialCost: number;
  wastePercentage: number;
  
  // Documentos
  totalDocuments: number;
  pendingApprovals: number;
  
  // Health score
  projectHealth: ProjectHealth;
  
  // Última actualización
  calculatedAt: Date;
}

export interface ProjectHealth {
  overallScore: number; // 0-100
  status: 'excellent' | 'good' | 'at_risk' | 'critical';
  
  // Scores por área
  scheduleHealth: number;
  budgetHealth: number;
  qualityHealth: number;
  resourceHealth: number;
  riskHealth: number;
  
  // Factores críticos
  criticalFactors: string[];
  
  // Recomendaciones
  recommendations: string[];
  
  // Tendencia
  trend: 'improving' | 'stable' | 'declining';
}

// Analíticas predictivas
export interface PredictiveAnalytics {
  projectId: string;
  
  // Predicciones
  predictions: {
    completionDate: DatePrediction;
    finalBudget: BudgetPrediction;
    successProbability: number; // 0-100
  };
  
  // Riesgos identificados por IA
  identifiedRisks: AIRisk[];
  
  // Optimizaciones sugeridas
  optimizations: Optimization[];
  
  // Comparación con proyectos similares
  benchmarking: Benchmarking;
  
  // Confianza del modelo
  confidence: number; // 0-100
  modelVersion: string;
  
  // Última actualización
  lastCalculated: Date;
}

export interface DatePrediction {
  predictedDate: Date;
  confidence: number; // 0-100
  earliestDate: Date;
  latestDate: Date;
  mostLikelyDate: Date;
  
  // Factores
  factors: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }[];
  
  reasoning: string[];
}

export interface BudgetPrediction {
  predictedTotal: number;
  confidence: number;
  minBudget: number;
  maxBudget: number;
  mostLikely: number;
  
  // Factores de riesgo
  riskFactors: {
    factor: string;
    impact: number;
    probability: number;
  }[];
  
  reasoning: string[];
}

export interface AIRisk {
  id: string;
  title: string;
  description: string;
  category: string;
  probability: number; // 0-100
  impact: number; // 0-100
  confidence: number; // Confianza de la IA 0-100
  
  // Evidencia
  indicators: string[];
  patterns: string[];
  
  // Recomendación
  recommendation: string;
  
  // Tendencia detectada
  trend: string;
}

export interface Optimization {
  id: string;
  type: 'schedule' | 'budget' | 'resource' | 'quality' | 'risk';
  title: string;
  description: string;
  
  // Impacto esperado
  impact: {
    schedule?: number; // Días ahorrados
    budget?: number; // Costo ahorrado
    quality?: number; // Mejora en score
    description: string;
  };
  
  // Implementación
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedEffort: string;
  steps: string[];
  
  // Prioridad
  priority: number;
  confidence: number;
  
  // Estado
  status: 'suggested' | 'accepted' | 'rejected' | 'implemented';
  implementedAt?: Date;
  implementedBy?: string;
}

export interface Benchmarking {
  // Proyectos similares
  similarProjects: SimilarProject[];
  
  // Comparaciones
  avgCompletionTime: number;
  avgBudget: number;
  avgTeamSize: number;
  
  // Ranking
  performanceRanking: number; // Percentil
  
  // Insights
  insights: string[];
  
  lastUpdated: Date;
}

export interface SimilarProject {
  id: string;
  name: string;
  type: string;
  
  // Similitud
  similarityScore: number; // 0-100
  similarityFactors: string[];
  
  // Métricas
  duration: number;
  budget: number;
  teamSize: number;
  successRate: number;
  
  // Lecciones aprendidas
  lessons: string[];
}

// Tendencias
export interface ProjectTrends {
  projectId: string;
  
  // Período analizado
  period: {
    start: Date;
    end: Date;
  };
  
  // Tendencias por métrica
  progressTrend: TrendData;
  budgetTrend: TrendData;
  teamTrend: TrendData;
  qualityTrend: TrendData;
  riskTrend: TrendData;
  
  // Análisis
  overallTrend: 'positive' | 'neutral' | 'negative';
  keyInsights: string[];
  
  lastCalculated: Date;
}

export interface TrendData {
  metric: string;
  dataPoints: DataPoint[];
  trend: 'increasing' | 'stable' | 'decreasing';
  trendStrength: number; // 0-100
  projection: DataPoint[]; // Proyección futura
  
  // Estadísticas
  average: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  
  // Cambios significativos
  significantChanges: {
    date: Date;
    value: number;
    change: number;
    reason?: string;
  }[];
}

export interface DataPoint {
  date: Date;
  value: number;
  label?: string;
  metadata?: any;
}

// Exportación de reportes
export interface ReportExport {
  reportId: string;
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
  
  // Configuración
  includeCharts: boolean;
  includeRawData: boolean;
  includeAttachments: boolean;
  
  // Resultado
  fileUrl?: string;
  fileSize?: number;
  generatedAt: Date;
  expiresAt?: Date;
  
  // Estado
  status: 'pending' | 'generating' | 'ready' | 'error';
  error?: string;
}

