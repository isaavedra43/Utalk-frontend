// Sistema de plantillas

export type TemplateCategory = 
  | 'construction'
  | 'software'
  | 'manufacturing'
  | 'services'
  | 'marketing'
  | 'events'
  | 'custom';

export type Industry = 
  | 'construction'
  | 'software'
  | 'manufacturing'
  | 'healthcare'
  | 'education'
  | 'finance'
  | 'retail'
  | 'hospitality'
  | 'transportation'
  | 'energy'
  | 'other';

export interface ProjectTemplate {
  id: string;
  
  // Identificación
  name: string;
  description: string;
  code?: string;
  
  // Clasificación
  category: TemplateCategory;
  industry: Industry;
  subcategory?: string;
  
  // Estructura de la plantilla
  structure: TemplateStructure;
  
  // Configuración
  defaultSettings: ProjectSettings;
  
  // Custom fields predefinidos
  customFields: CustomFieldTemplate[];
  
  // Workflows predefinidos
  workflows: WorkflowTemplate[];
  
  // Uso
  timesUsed: number;
  rating: number;
  ratingCount: number;
  reviews: TemplateReview[];
  
  // Preview
  thumbnailUrl?: string;
  screenshotUrls: string[];
  demoUrl?: string;
  
  // Compartir
  isPublic: boolean;
  isPremium: boolean;
  price?: number;
  author: string;
  authorName: string;
  organization?: string;
  
  // Versión
  version: string;
  changelog: string[];
  
  // Tags y búsqueda
  tags: string[];
  searchKeywords: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  deprecatedAt?: Date;
  isDeprecated: boolean;
}

export interface TemplateStructure {
  // Fases predefinidas
  phases: PhaseTemplate[];
  
  // Tareas predefinidas
  tasks: TaskTemplate[];
  
  // Milestones predefinidos
  milestones: MilestoneTemplate[];
  
  // Categorías de presupuesto
  budgetCategories: BudgetCategoryTemplate[];
  
  // Roles del equipo
  roles: RoleTemplate[];
  
  // Estándares de calidad
  qualityStandards: string[];
  
  // Riesgos comunes
  commonRisks: RiskTemplate[];
  
  // Estructura de documentos
  documentFolders: FolderTemplate[];
  documentTemplates: string[];
}

export interface PhaseTemplate {
  name: string;
  description: string;
  durationDays: number;
  order: number;
  
  // Entregables esperados
  deliverables: string[];
  
  // Aprobaciones requeridas
  requiresApproval: boolean;
  approvers: string[]; // Roles
  
  // Dependencias
  dependsOn: string[]; // Nombres de fases predecesoras
  
  // Presupuesto estimado (%)
  budgetPercentage: number;
  
  customFields?: { [key: string]: any };
}

export interface TaskTemplate {
  name: string;
  description: string;
  type: string;
  phaseName?: string;
  
  // Timeline
  durationDays: number;
  offsetFromPhaseStart?: number; // Días desde inicio de fase
  
  // Asignación
  assignedRole?: string;
  estimatedHours: number;
  
  // Dependencias
  dependsOn: string[]; // Nombres de tareas predecesoras
  dependencyType?: string;
  
  // Recursos
  requiredSkills?: string[];
  requiredCertifications?: string[];
  
  // Checklist
  checklist?: string[];
  
  // Prioridad
  priority?: string;
  
  // Custom fields
  customFields?: { [key: string]: any };
}

export interface MilestoneTemplate {
  name: string;
  description: string;
  phaseName?: string;
  offsetDays: number; // Días desde inicio del proyecto
  criteria: string[];
  deliverables: string[];
  requiresApproval: boolean;
}

export interface BudgetCategoryTemplate {
  name: string;
  description?: string;
  percentage: number; // % del presupuesto total
  parentCategory?: string;
  subcategories: BudgetCategoryTemplate[];
}

export interface RoleTemplate {
  name: string;
  description: string;
  level: string;
  responsibilities: string[];
  requiredSkills: string[];
  estimatedAllocation: number; // %
}

export interface RiskTemplate {
  name: string;
  description: string;
  category: string;
  probability: string;
  impact: string;
  mitigationPlan: string;
}

export interface FolderTemplate {
  name: string;
  description?: string;
  parentFolder?: string;
  subfolders: FolderTemplate[];
}

export interface CustomFieldTemplate {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  options?: string[]; // Para select
  validation?: any;
  group?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: 'approval' | 'automation' | 'notification';
  
  // Configuración del workflow
  config: any;
  
  // Aplicable a
  appliesTo: string[];
}

export interface ProjectSettings {
  // General
  defaultCurrency: string;
  timezone: string;
  language: string;
  
  // Fechas
  startDate?: Date;
  endDate?: Date;
  
  // Calendario
  workingDays: number[];
  workHoursPerDay: number;
  
  // Presupuesto
  budgetTotal?: number;
  budgetContingency: number; // %
  
  // Notificaciones
  enableNotifications: boolean;
  notificationChannels: string[];
  
  // Permisos
  defaultPermissions: string[];
  
  // Features habilitados
  enabledFeatures: {
    customFields: boolean;
    automations: boolean;
    timeTracking: boolean;
    budgetTracking: boolean;
    qualityManagement: boolean;
    riskManagement: boolean;
    documentManagement: boolean;
    integrations: {
      hr: boolean;
      inventory: boolean;
      providers: boolean;
      clients: boolean;
    };
  };
}

export interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  userName: string;
  
  // Rating
  rating: number; // 1-5
  
  // Review
  title?: string;
  comment: string;
  
  // Pros/Cons
  pros?: string[];
  cons?: string[];
  
  // Uso
  projectType?: string;
  projectSize?: string;
  
  // Utilidad
  helpful: number; // Votos de útil
  notHelpful: number;
  
  // Metadata
  createdAt: Date;
  updatedAt?: Date;
  
  // Respuesta del autor
  authorResponse?: {
    text: string;
    respondedAt: Date;
  };
}

// Marketplace de plantillas
export interface TemplateMarketplace {
  featured: ProjectTemplate[];
  trending: ProjectTemplate[];
  recent: ProjectTemplate[];
  topRated: ProjectTemplate[];
  byCategory: { [category: string]: ProjectTemplate[] };
  byIndustry: { [industry: string]: ProjectTemplate[] };
}

// Importación/Exportación de plantillas
export interface TemplateExport {
  template: ProjectTemplate;
  format: 'json' | 'yaml' | 'xml';
  includeAssets: boolean;
  exportDate: Date;
  version: string;
}

export interface TemplateImport {
  file: File;
  format: 'json' | 'yaml' | 'xml' | 'mpp' | 'xlsx';
  mapping?: FieldMapping;
  validationResults?: ValidationResult[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: any) => any;
}

export interface ValidationResult {
  field: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

