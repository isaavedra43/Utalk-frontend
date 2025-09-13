// Tipos para el módulo de Recursos Humanos

export type EmployeeStatus = 'active' | 'inactive' | 'terminated' | 'on_leave';
export type DocumentStatus = 'pending' | 'verified' | 'expired' | 'rejected';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type EvaluationType = '360' | 'okr' | 'performance' | 'skills';
export type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
export type AbsenceType = 'sick_leave' | 'vacation' | 'personal' | 'maternity' | 'paternity' | 'unpaid';
export type OvertimeType = 'regular' | 'double' | 'triple' | 'holiday';

// Interfaces principales
export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: EmployeeStatus;
  hireDate: Date;
  terminationDate?: Date;
  
  // Información personal
  personalInfo: PersonalInfo;
  
  // Información laboral
  position: Position;
  location: Location;
  contract: Contract;
  
  // Información salarial
  salary: SalaryInfo;
  sbc: number; // Salario Base de Cotización
  
  // Vacaciones y tiempo
  vacationBalance: number;
  sickLeaveBalance: number;
  
  // Métricas
  metrics: EmployeeMetrics;
  
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface PersonalInfo {
  rfc: string;
  curp: string;
  nss: string; // Número de Seguro Social
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: Address;
  emergencyContact: EmergencyContact;
  bankInfo: BankInfo;
}

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  clabe: string;
  accountType: 'checking' | 'savings';
}

export interface Position {
  id: string;
  title: string;
  department: string;
  level: string;
  reportsTo?: string;
  jobDescription: string;
  requirements: string[];
  skills: string[];
  salaryRange: {
    min: number;
    max: number;
  };
}

export interface Location {
  id: string;
  name: string;
  address: Address;
  timezone: string;
  isRemote: boolean;
}

export interface Contract {
  id: string;
  type: 'permanent' | 'temporary' | 'intern' | 'contractor';
  startDate: Date;
  endDate?: Date;
  workingHours: number;
  schedule: string;
  benefits: string[];
  clauses: string[];
}

export interface SalaryInfo {
  baseSalary: number;
  currency: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  paymentMethod: 'bank_transfer' | 'cash' | 'check';
  allowances: Allowance[];
  deductions: Deduction[];
}

export interface Allowance {
  id: string;
  name: string;
  amount: number;
  isTaxable: boolean;
  isImss: boolean; // Integra IMSS
  isInfonavit: boolean; // Integra INFONAVIT
}

export interface Deduction {
  id: string;
  name: string;
  amount: number;
  isPercentage: boolean;
  isVoluntary: boolean;
}

export interface EmployeeMetrics {
  // Información salarial
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  
  // Asistencia
  attendanceRate: number;
  lateArrivals: number;
  absences: number;
  
  // Vacaciones
  vacationDaysUsed: number;
  vacationDaysRemaining: number;
  
  // Horas extra
  overtimeHours: number;
  overtimeAmount: number;
  
  // Incidencias
  incidentsCount: number;
  incidentsLast30Days: number;
  
  // Cumplimiento
  documentCompliance: number;
  trainingCompletion: number;
  
  // Desempeño
  performanceScore: number;
  lastEvaluationDate?: Date;
}


// Catálogos fiscales
export interface TaxCatalog {
  id: string;
  name: string;
  year: number;
  values: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UMA extends TaxCatalog {
  dailyAmount: number;
  monthlyAmount: number;
}

export interface SMG extends TaxCatalog {
  dailyAmount: number;
  monthlyAmount: number;
}

export interface ISRTable extends TaxCatalog {
  brackets: ISRBracket[];
}

export interface ISRBracket {
  minIncome: number;
  maxIncome: number;
  fixedAmount: number;
  percentage: number;
}

export interface IMSSRates extends TaxCatalog {
  employeeRate: number;
  employerRate: number;
  totalRate: number;
}

export interface InfonavitConfig extends TaxCatalog {
  vsmPercentage: number;
  fixedAmount: number;
  maxAmount: number;
}

// Asistencia
export interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  hoursWorked: number;
  isLate: boolean;
  isAbsent: boolean;
  absenceType?: AbsenceType;
  notes?: string;
  location?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Absence {
  id: string;
  employeeId: string;
  type: AbsenceType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

export interface Overtime {
  id: string;
  employeeId: string;
  date: Date;
  hours: number;
  type: OvertimeType;
  rate: number;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  createdBy: string;
}

// Vacaciones
export interface VacationRequest {
  id: string;
  employeeId: string;
  startDate: Date;
  endDate: Date;
  days: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  createdAt: Date;
  createdBy: string;
}

export interface VacationBalance {
  id: string;
  employeeId: string;
  year: number;
  earnedDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
  lastUpdated: Date;
}

// Documentos
export interface Document {
  id: string;
  employeeId?: string;
  type: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  issuedBy: string;
  issuedDate: Date;
  expirationDate?: Date;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  ocrData?: Record<string, any>;
  version: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

// Incidencias
export interface Incident {
  id: string;
  employeeId: string;
  type: 'accident' | 'disciplinary' | 'recognition' | 'training' | 'other';
  severity: IncidentSeverity;
  title: string;
  description: string;
  date: Date;
  location?: string;
  witnesses?: string[];
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  assignedTo?: string;
  resolution?: string;
  capa?: string; // Corrective and Preventive Actions
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

// Evaluaciones
export interface Evaluation {
  id: string;
  employeeId: string;
  type: EvaluationType;
  title: string;
  description: string;
  period: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'in_progress' | 'completed' | 'closed';
  evaluators: Evaluator[];
  criteria: EvaluationCriteria[];
  overallScore: number;
  feedback: string;
  goals: string[];
  developmentPlan: string[];
  createdAt: Date;
  createdBy: string;
  completedAt?: Date;
}

export interface Evaluator {
  id: string;
  employeeId: string;
  name: string;
  role: 'self' | 'peer' | 'manager' | 'subordinate' | 'hr';
  weight: number;
  completed: boolean;
  completedAt?: Date;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  score: number;
  maxScore: number;
  comments?: string;
}

// Habilidades
export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  isRequired: boolean;
}

export interface EmployeeSkill {
  id: string;
  employeeId: string;
  skillId: string;
  skill: Skill;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  proficiency: number; // 1-100
  lastAssessed: Date;
  assessedBy: string;
  evidence?: string[];
  targetLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  gapAnalysis?: string;
}

// Reclutamiento (ATS)
export interface Vacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full_time' | 'part_time' | 'contract' | 'intern';
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  status: 'draft' | 'open' | 'paused' | 'closed' | 'filled';
  hiringManager: string;
  recruiter: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetStartDate?: Date;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  experience: number; // years
  education: Education[];
  skills: string[];
  languages: Language[];
  availability: Date;
  expectedSalary?: number;
  currentSalary?: number;
  noticePeriod?: number; // days
  source: 'linkedin' | 'indeed' | 'referral' | 'career_page' | 'recruiter' | 'other';
  status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  score: number; // 1-100
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  isCompleted: boolean;
}

export interface Language {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
  certification?: string;
}

export interface Application {
  id: string;
  vacancyId: string;
  candidateId: string;
  vacancy: Vacancy;
  candidate: Candidate;
  status: ApplicationStatus;
  stage: string;
  appliedDate: Date;
  lastActivity: Date;
  score: number;
  notes: string;
  interviews: Interview[];
  assessments: Assessment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Interview {
  id: string;
  applicationId: string;
  type: 'phone' | 'video' | 'in_person' | 'technical' | 'panel';
  scheduledDate: Date;
  duration: number; // minutes
  interviewers: string[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  feedback: string;
  rating: number; // 1-5
  notes: string;
  createdAt: Date;
  createdBy: string;
}

export interface Assessment {
  id: string;
  applicationId: string;
  type: 'technical' | 'personality' | 'cognitive' | 'language';
  name: string;
  score: number;
  maxScore: number;
  completedDate: Date;
  results: Record<string, any>;
  notes: string;
}

// Analítica
export interface HRMetrics {
  // Headcount
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  terminations: number;
  turnoverRate: number;
  
  // Información salarial
  totalSalaryCost: number;
  averageSalary: number;
  salaryGrowth: number;
  
  // Asistencia
  attendanceRate: number;
  absenteeismRate: number;
  overtimeHours: number;
  
  // Vacaciones
  vacationUtilization: number;
  pendingVacationDays: number;
  
  // Reclutamiento
  openVacancies: number;
  averageTimeToHire: number;
  offerAcceptanceRate: number;
  
  // Cumplimiento
  documentCompliance: number;
  trainingCompletion: number;
  
  // Desempeño
  averagePerformanceScore: number;
  evaluationsCompleted: number;
  
  // Riesgos
  highRiskEmployees: number;
  criticalVacancies: number;
  complianceAlerts: number;
}

export interface TrendData {
  date: Date;
  value: number;
  label?: string;
}

export interface CohortData {
  cohort: string;
  period: number;
  value: number;
  percentage: number;
}

// Cumplimiento
export interface ComplianceAlert {
  id: string;
  type: 'document_expiry' | 'training_overdue' | 'evaluation_due' | 'contract_renewal' | 'policy_update';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  employeeId?: string;
  dueDate: Date;
  status: 'open' | 'in_progress' | 'resolved' | 'overdue';
  assignedTo?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceReport {
  id: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  period: string;
  startDate: Date;
  endDate: Date;
  metrics: ComplianceMetrics;
  findings: ComplianceFinding[];
  recommendations: string[];
  status: 'draft' | 'review' | 'approved' | 'published';
  createdAt: Date;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface ComplianceMetrics {
  totalEmployees: number;
  documentCompliance: number;
  trainingCompliance: number;
  policyAcknowledgment: number;
  incidentCount: number;
  auditFindings: number;
}

export interface ComplianceFinding {
  id: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedEmployees: number;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved';
  dueDate: Date;
  assignedTo?: string;
}

// Copiloto RH
export interface CopilotSuggestion {
  id: string;
  type: 'promotion_recommendation' | 'retention_risk' | 'succession_planning' | 'document_expiry' | 'training_gap';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  employeeId?: string;
  data: Record<string, any>;
  confidence: number; // 0-100
  action: string;
  impact: 'positive' | 'negative' | 'neutral';
  createdAt: Date;
  appliedAt?: Date;
  appliedBy?: string;
}

export interface CopilotAnalysis {
  id: string;
  type: 'performance_analysis' | 'retention_analysis' | 'succession_analysis';
  employeeId?: string;
  periodId?: string;
  query: string;
  response: string;
  data: Record<string, any>;
  confidence: number;
  createdAt: Date;
}

// Auditoría
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: 'employee' | 'document' | 'evaluation' | 'vacancy';
  resourceId: string;
  changes: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Notificaciones
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
}

// Configuración
export interface HRSettings {
  id: string;
  organizationId: string;
  attendance: AttendanceSettings;
  compliance: ComplianceSettings;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
  updatedAt: Date;
  updatedBy: string;
}


export interface OvertimeRule {
  type: OvertimeType;
  multiplier: number;
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  requiresApproval: boolean;
}

export interface HolidayRule {
  date: Date;
  name: string;
  isPaid: boolean;
  multiplier: number;
}


export interface AttendanceSettings {
  workingHours: number;
  breakTime: number;
  lateThreshold: number; // minutes
  absenceTypes: AbsenceType[];
  geofencing: boolean;
  qrCode: boolean;
  biometric: boolean;
}

export interface ComplianceSettings {
  documentRetention: number; // years
  evaluationFrequency: number; // months
  trainingFrequency: number; // months
  alertThresholds: Record<string, number>;
  autoReminders: boolean;
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  type: string;
  threshold: number;
  escalationLevel: number;
  notifyUsers: string[];
  autoAction?: string;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  push: boolean;
  channels: NotificationChannel[];
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  enabled: boolean;
  template: string;
  recipients: string[];
}

export interface IntegrationSettings {
  sso: SSOConfig;
  attendance: AttendanceIntegration;
  storage: StorageConfig;
  webhooks: WebhookConfig[];
}

export interface SSOConfig {
  provider: 'google' | 'microsoft' | 'okta' | 'custom';
  enabled: boolean;
  config: Record<string, any>;
}


export interface AttendanceIntegration {
  provider: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface StorageConfig {
  provider: 's3' | 'gcs' | 'azure' | 'local';
  bucket: string;
  region: string;
  config: Record<string, any>;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  retryCount: number;
  timeout: number;
}

// Filtros y búsqueda
export interface EmployeeFilter {
  search?: string;
  status?: EmployeeStatus[];
  department?: string[];
  location?: string[];
  position?: string[];
  hireDateFrom?: Date;
  hireDateTo?: Date;
  salaryFrom?: number;
  salaryTo?: number;
  complianceFrom?: number;
  complianceTo?: number;
}


export interface AttendanceFilter {
  employeeId?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  type?: AbsenceType[];
  status?: string[];
  department?: string[];
}

export interface VacancyFilter {
  status?: string[];
  department?: string[];
  location?: string[];
  type?: string[];
  priority?: string[];
  hiringManager?: string[];
}

// Respuestas de API
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Estados de UI
export interface UIState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export interface TableState {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, any>;
  selectedRows: string[];
}

export interface FormState {
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}
