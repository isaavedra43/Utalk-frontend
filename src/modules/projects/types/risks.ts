// Gestión de riesgos

export type RiskCategory = 
  | 'technical'
  | 'schedule'
  | 'budget'
  | 'resource'
  | 'quality'
  | 'safety'
  | 'legal'
  | 'environmental'
  | 'stakeholder'
  | 'external'
  | 'other';

export type RiskProbability = 
  | 'very_low'   // 0-20%
  | 'low'        // 21-40%
  | 'medium'     // 41-60%
  | 'high'       // 61-80%
  | 'very_high'; // 81-100%

export type RiskImpact = 
  | 'very_low'
  | 'low'
  | 'medium'
  | 'high'
  | 'very_high';

export type RiskResponse = 
  | 'avoid'      // Evitar
  | 'mitigate'   // Mitigar
  | 'transfer'   // Transferir
  | 'accept';    // Aceptar

export type RiskStatus = 
  | 'identified'
  | 'analyzing'
  | 'response_planning'
  | 'mitigating'
  | 'monitoring'
  | 'closed'
  | 'occurred';

export interface ProjectRisk {
  id: string;
  projectId: string;
  riskNumber: string; // RISK-001
  
  // Básico
  name: string;
  description: string;
  category: RiskCategory;
  
  // Evaluación
  probability: RiskProbability;
  probabilityScore: number; // 1-5
  impact: RiskImpact;
  impactScore: number; // 1-5
  riskScore: number; // probability × impact (1-25)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Respuesta al riesgo
  response: RiskResponse;
  mitigationPlan: string;
  contingencyPlan: string;
  responseActions: RiskAction[];
  
  // Responsable
  owner: string;
  ownerName: string;
  
  // Estado
  status: RiskStatus;
  
  // Probabilidad de ocurrencia
  triggers: RiskTrigger[];
  earlyWarningSignals: string[];
  
  // Impacto detallado
  impactOnSchedule: number; // Días de retraso potencial
  impactOnBudget: number; // Costo potencial
  impactOnQuality: string;
  impactOnScope: string;
  
  // Áreas afectadas
  affectedAreas: string[];
  affectedTasks: string[];
  affectedPhases: string[];
  affectedResources: string[];
  
  // Seguimiento
  updates: RiskUpdate[];
  reviewDate: Date;
  lastReviewDate?: Date;
  reviewFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  
  // Residual risk (después de mitigación)
  residualProbability?: RiskProbability;
  residualImpact?: RiskImpact;
  residualScore?: number;
  
  // Documentación
  attachments: string[];
  relatedDocuments: string[];
  
  // Lecciones aprendidas
  lessonsLearned?: string;
  
  // Metadata
  identifiedBy: string;
  identifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  closedBy?: string;
  closeReason?: string;
  tags: string[];
  notes?: string;
}

export interface RiskAction {
  id: string;
  description: string;
  type: 'preventive' | 'corrective' | 'contingent';
  responsible: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completedAt?: Date;
  effectivenessRating?: number; // 1-5
  cost: number;
  notes?: string;
}

export interface RiskTrigger {
  id: string;
  description: string;
  threshold?: string;
  monitoring: boolean;
  monitoringFrequency?: string;
  lastChecked?: Date;
  triggered: boolean;
  triggeredAt?: Date;
}

export interface RiskUpdate {
  id: string;
  updateDate: Date;
  updatedBy: string;
  
  // Cambios
  probabilityChange?: RiskProbability;
  impactChange?: RiskImpact;
  statusChange?: RiskStatus;
  
  // Notas
  notes: string;
  actions: string[];
  
  // Evidencia
  attachments: string[];
}

// Matriz de riesgos
export interface RiskMatrix {
  projectId: string;
  
  // Configuración de la matriz
  config: RiskMatrixConfig;
  
  // Riesgos en cada celda
  cells: RiskMatrixCell[][];
  
  // Estadísticas
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  
  // Distribución
  byCategory: { [category: string]: number };
  byStatus: { [status: string]: number };
  
  lastCalculated: Date;
}

export interface RiskMatrixConfig {
  probabilityLevels: MatrixLevel[];
  impactLevels: MatrixLevel[];
  thresholds: {
    critical: number; // >= este score
    high: number;
    medium: number;
    low: number;
  };
  colors: {
    critical: string;
    high: string;
    medium: string;
    low: string;
  };
}

export interface MatrixLevel {
  value: number;
  label: string;
  description: string;
}

export interface RiskMatrixCell {
  probability: number;
  impact: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  risks: string[]; // IDs de riesgos en esta celda
  count: number;
}

// Análisis de riesgos
export interface RiskAnalysis {
  projectId: string;
  
  // Top riesgos
  topRisks: ProjectRisk[];
  
  // Tendencias
  trends: RiskTrend[];
  
  // Riesgos materializados
  occurredRisks: OccurredRisk[];
  
  // Efectividad de mitigación
  mitigationEffectiveness: number; // 0-100
  
  // Exposición total
  totalExposure: {
    schedule: number; // Días
    budget: number; // Costo
    quality: string;
  };
  
  // Recomendaciones
  recommendations: string[];
  
  // Comparación con baseline
  baselineComparison?: {
    risksAdded: number;
    risksClosed: number;
    averageScoreChange: number;
  };
  
  lastAnalyzed: Date;
}

export interface RiskTrend {
  period: Date;
  totalRisks: number;
  averageScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  newRisks: number;
  closedRisks: number;
  occurredRisks: number;
}

export interface OccurredRisk {
  risk: ProjectRisk;
  occurredAt: Date;
  actualImpact: {
    schedule: number;
    budget: number;
    quality: string;
    description: string;
  };
  wasPlanned: boolean;
  contingencyUsed: boolean;
  lessonsLearned: string;
}

// Reportes de riesgos
export interface RiskReport {
  projectId: string;
  reportDate: Date;
  period: {
    start: Date;
    end: Date;
  };
  
  // Resumen ejecutivo
  executiveSummary: string;
  
  // Métricas clave
  keyMetrics: {
    totalActiveRisks: number;
    criticalRisks: number;
    risksOccurred: number;
    risksMitigated: number;
    averageRiskScore: number;
    exposureValue: number;
  };
  
  // Secciones del reporte
  risksByCategory: { [category: string]: ProjectRisk[] };
  topRisks: ProjectRisk[];
  recentChanges: RiskUpdate[];
  upcomingReviews: ProjectRisk[];
  
  // Recomendaciones
  recommendations: string[];
  actionItems: string[];
  
  // Anexos
  matrix: RiskMatrix;
  charts: ReportChart[];
  
  // Metadata
  preparedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface ReportChart {
  type: 'pie' | 'bar' | 'line' | 'scatter' | 'heatmap';
  title: string;
  data: any;
  config?: any;
}

