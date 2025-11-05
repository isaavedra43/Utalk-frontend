// Gestión de calidad e inspecciones

export type InspectionType = 
  | 'initial'
  | 'in_progress'
  | 'final'
  | 'safety'
  | 'quality'
  | 'regulatory'
  | 'custom';

export type InspectionStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'passed'
  | 'failed'
  | 'conditional'
  | 'cancelled';

export type NonConformityStatus = 
  | 'open'
  | 'investigating'
  | 'corrective_action'
  | 'verification'
  | 'closed'
  | 'recurred';

export interface QualityManagement {
  projectId: string;
  
  // Estándares de calidad
  standards: QualityStandard[];
  
  // Inspecciones
  inspections: Inspection[];
  
  // No conformidades
  nonConformities: NonConformity[];
  
  // Acciones correctivas
  correctiveActions: CorrectiveAction[];
  
  // Métricas de calidad
  metrics: QualityMetric[];
  
  // Auditorías
  audits: Audit[];
  
  // Resumen
  summary: QualitySummary;
}

export interface QualityStandard {
  id: string;
  projectId: string;
  
  // Estándar
  name: string;
  code?: string; // ISO 9001, etc.
  description: string;
  category: string;
  
  // Criterios
  criteria: QualityCriterion[];
  
  // Aplicabilidad
  appliesTo: ('task' | 'phase' | 'deliverable' | 'material' | 'process')[];
  specificIds?: string[]; // IDs específicos si no aplica a todos
  
  // Verificación
  verificationMethod: string;
  verificationFrequency?: string;
  
  // Responsable
  owner: string;
  
  // Documentación
  referenceDocuments: string[];
  
  // Metadata
  mandatory: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface QualityCriterion {
  id: string;
  name: string;
  description: string;
  acceptanceCriteria: string;
  measurementMethod: string;
  targetValue?: string;
  tolerance?: string;
  priority: 'critical' | 'major' | 'minor';
}

export interface Inspection {
  id: string;
  projectId: string;
  inspectionNumber: string; // INS-001
  
  // Tipo y nombre
  name: string;
  type: InspectionType;
  category?: string;
  
  // Items a inspeccionar
  inspectionItems: InspectionItem[];
  
  // Inspector
  inspector: string;
  inspectorName: string;
  inspectorCertification?: string;
  
  // Fechas
  scheduledDate: Date;
  scheduledTime?: string;
  startedAt?: Date;
  completedAt?: Date;
  
  // Asociaciones
  taskId?: string;
  phaseId?: string;
  milestoneId?: string;
  location?: string;
  
  // Resultado
  status: InspectionStatus;
  overallResult: 'passed' | 'failed' | 'conditional';
  passRate: number; // Porcentaje de items pasados
  
  // Findings
  findings: Finding[];
  observations: string[];
  recommendations: string[];
  
  // Documentación
  photos: InspectionPhoto[];
  videos: string[];
  reports: string[];
  checklist: InspectionChecklist;
  
  // Firma y aprobación
  signatures: InspectionSignature[];
  requiresReinspection: boolean;
  reinspectionDate?: Date;
  reinspectionReason?: string;
  
  // Seguimiento
  followUpActions: FollowUpAction[];
  nonConformitiesGenerated: string[]; // IDs de no conformidades
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  notes?: string;
}

export interface InspectionItem {
  id: string;
  itemNumber: string;
  description: string;
  standard?: string; // Estándar aplicable
  
  // Criterios
  acceptanceCriteria: string;
  
  // Resultado
  status: 'pass' | 'fail' | 'na' | 'pending';
  actualValue?: string;
  expectedValue?: string;
  deviation?: string;
  
  // Evidencia
  photos: string[];
  measurements: Measurement[];
  
  // Notas
  notes?: string;
  
  // Verificación
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface Measurement {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  tolerance: number;
  inTolerance: boolean;
  measuredBy: string;
  measuredAt: Date;
  instrumentUsed?: string;
}

export interface Finding {
  id: string;
  type: 'observation' | 'minor' | 'major' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Descripción
  title: string;
  description: string;
  location?: string;
  
  // Evidencia
  photos: string[];
  videos: string[];
  
  // Impacto
  impact: string;
  risk: string;
  
  // Corrección
  correctiveAction?: string;
  responsibleParty?: string;
  dueDate?: Date;
  
  // Seguimiento
  status: 'open' | 'in_progress' | 'resolved' | 'verified';
  resolvedAt?: Date;
  resolvedBy?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
}

export interface InspectionPhoto {
  id: string;
  url: string;
  thumbnail: string;
  caption?: string;
  itemId?: string; // Item específico inspeccionado
  
  // Metadata
  takenAt: Date;
  takenBy: string;
  
  // Ubicación
  location?: string;
  gpsCoordinates?: {
    lat: number;
    lng: number;
  };
  
  // Anotaciones
  annotations: PhotoAnnotation[];
}

export interface PhotoAnnotation {
  type: 'arrow' | 'circle' | 'rectangle' | 'text';
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  text?: string;
  color?: string;
}

export interface InspectionChecklist {
  id: string;
  name: string;
  items: ChecklistItem[];
  completionPercentage: number;
  allItemsPassed: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
  checked: boolean;
  passed?: boolean;
  checkedBy?: string;
  checkedAt?: Date;
  notes?: string;
  photos: string[];
}

export interface InspectionSignature {
  role: 'inspector' | 'contractor' | 'client' | 'supervisor' | 'engineer';
  name: string;
  title?: string;
  company?: string;
  signatureUrl: string;
  timestamp: Date;
  ipAddress?: string;
}

export interface FollowUpAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
}

// No conformidades
export interface NonConformity {
  id: string;
  projectId: string;
  ncNumber: string; // NC-001
  
  // Básico
  title: string;
  description: string;
  category: string;
  severity: 'minor' | 'major' | 'critical';
  
  // Origen
  source: 'inspection' | 'audit' | 'complaint' | 'observation' | 'other';
  inspectionId?: string;
  taskId?: string;
  phaseId?: string;
  location?: string;
  
  // Detección
  detectedBy: string;
  detectedByName: string;
  detectedAt: Date;
  
  // Clasificación
  type: 'design' | 'construction' | 'material' | 'workmanship' | 'safety' | 'documentation' | 'other';
  rootCause?: string;
  
  // Estado
  status: NonConformityStatus;
  
  // Responsabilidad
  responsibleParty: string;
  responsiblePartyName: string;
  contractor?: string;
  
  // Plan de corrección
  correctiveActionPlan: string;
  correctiveActionId?: string;
  targetDate: Date;
  
  // Verificación
  verification: NCVerification;
  
  // Impacto
  impactOnSchedule: number; // Días
  impactOnBudget: number;
  impactOnQuality: string;
  
  // Documentación
  photos: string[];
  documents: string[];
  evidenceOfCorrection: string[];
  
  // Recurrencia
  isRecurring: boolean;
  relatedNCIds: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  closedBy?: string;
  tags: string[];
  notes?: string;
}

export interface NCVerification {
  required: boolean;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: Date;
  verificationMethod: string;
  verificationResult: 'satisfactory' | 'unsatisfactory' | 'pending';
  verificationNotes?: string;
  reinspectionRequired: boolean;
  photos: string[];
}

// Acciones correctivas
export interface CorrectiveAction {
  id: string;
  projectId: string;
  actionNumber: string; // CA-001
  
  // Básico
  title: string;
  description: string;
  
  // Origen
  nonConformityId?: string;
  findingId?: string;
  riskId?: string;
  
  // Plan de acción
  actionPlan: string;
  steps: ActionStep[];
  
  // Responsabilidad
  owner: string;
  ownerName: string;
  teamMembers: string[];
  
  // Timeline
  startDate: Date;
  targetDate: Date;
  completedDate?: Date;
  
  // Estado
  status: 'planned' | 'in_progress' | 'completed' | 'verified' | 'cancelled';
  progress: number; // 0-100
  
  // Verificación
  verification: ActionVerification;
  
  // Efectividad
  effectiveness: 'effective' | 'partially_effective' | 'ineffective' | 'pending';
  effectivenessNotes?: string;
  
  // Recursos
  estimatedCost: number;
  actualCost: number;
  resourcesRequired: string[];
  
  // Documentación
  documents: string[];
  photos: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ActionStep {
  id: string;
  stepNumber: number;
  description: string;
  responsible: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
}

export interface ActionVerification {
  required: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  verificationMethod: string;
  result: 'satisfactory' | 'unsatisfactory' | 'pending';
  notes?: string;
}

// Métricas de calidad
export interface QualityMetric {
  id: string;
  name: string;
  description: string;
  
  // Valor
  currentValue: number;
  targetValue: number;
  unit: string;
  
  // Tendencia
  trend: 'improving' | 'stable' | 'declining';
  history: MetricHistory[];
  
  // Evaluación
  status: 'good' | 'acceptable' | 'poor';
  
  // Metadata
  category: string;
  calculatedAt: Date;
  calculatedBy?: string;
}

export interface MetricHistory {
  date: Date;
  value: number;
  notes?: string;
}

// Auditorías
export interface Audit {
  id: string;
  projectId: string;
  auditNumber: string; // AUD-001
  
  // Tipo
  type: 'internal' | 'external' | 'regulatory' | 'client';
  scope: string;
  
  // Auditor
  auditor: string;
  auditorName: string;
  auditorOrganization?: string;
  
  // Fechas
  scheduledDate: Date;
  startDate?: Date;
  endDate?: Date;
  
  // Áreas auditadas
  areasAudited: string[];
  standardsReviewed: string[];
  
  // Resultados
  status: 'scheduled' | 'in_progress' | 'completed' | 'report_issued';
  overallRating: 'excellent' | 'good' | 'acceptable' | 'poor';
  
  // Findings
  findings: AuditFinding[];
  opportunities: string[];
  bestPractices: string[];
  
  // Acciones
  correctiveActionsRequired: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
  
  // Documentos
  auditPlan?: string;
  auditReport?: string;
  evidenceDocuments: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface AuditFinding {
  id: string;
  type: 'major' | 'minor' | 'observation';
  area: string;
  standard: string;
  
  // Descripción
  description: string;
  evidence: string;
  impact: string;
  
  // Corrección
  recommendation: string;
  correctiveActionId?: string;
  
  // Estado
  status: 'open' | 'in_progress' | 'resolved' | 'verified';
  
  // Metadata
  identifiedAt: Date;
  resolvedAt?: Date;
}

// Resumen de calidad
export interface QualitySummary {
  // Inspecciones
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  conditionalInspections: number;
  passRate: number;
  
  // No conformidades
  openNonConformities: number;
  closedNonConformities: number;
  criticalNonConformities: number;
  avgResolutionTime: number; // Días
  
  // Acciones correctivas
  activeCorrectiveActions: number;
  completedCorrectiveActions: number;
  overdueActions: number;
  
  // Métricas
  qualityScore: number; // 0-100
  complianceRate: number; // 0-100
  defectRate: number;
  
  // Tendencias
  trend: 'improving' | 'stable' | 'declining';
  
  // Última actualización
  lastCalculated: Date;
}

