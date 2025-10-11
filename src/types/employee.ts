// Tipos para el módulo de empleados - COMPLETAMENTE ALINEADOS CON BACKEND

// ===== INTERFACES PRINCIPALES =====

export interface Employee {
  id: string;
  employeeNumber: string;
  personalInfo: PersonalInfo;
  position: Position;
  location: Location;
  contract: Contract;
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  maritalStatus: string;
  nationality: string;
  rfc: string;
  curp: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Position {
  title: string;
  department: string;
  level: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Manager';
  reportsTo?: string;
  jobDescription: string;
  startDate: string;
  endDate?: string;
}

export interface Location {
  office: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  timezone: string;
}

export interface Contract {
  type: 'permanent' | 'temporary' | 'contractor';
  startDate: string;
  endDate?: string;
  salary: number;
  currency: string;
  workingDays: string;
  workingHoursRange: string;
  customSchedule?: {
    enabled: boolean;
    days: Record<string, any>;
  };
  benefits: string[];
  notes?: string;
}



// ===== TIPOS PARA VACACIONES =====

export interface VacationRecord {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  requestedBy: string;
  approvedBy?: string;
  createdAt: string;
}

export interface VacationBalance {
  totalDays: number;
  usedDays: number;
  availableDays: number;
  pendingDays: number;
}

export interface VacationSummary {
  totalDays: number;
  usedDays: number;
  availableDays: number;
}

// ===== TIPOS PARA DOCUMENTOS =====

export interface Document {
  id: string;
  employeeId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  category: 'contract' | 'identification' | 'medical' | 'training' | 'performance' | 'other';
  subcategory?: string;
  isConfidential: boolean;
  tags: string[];
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  version: number;
  status: 'active' | 'archived' | 'deleted';
  downloadCount: number;
  filePath: string;
  thumbnailPath?: string;
  metadata: {
    department?: string;
    position?: string;
    effectiveDate?: string;
    expiryDate?: string;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: string;
  };
}

// ===== TIPOS PARA ORGANIGRAMA =====

export interface OrgChartNode {
  id: string;
  name: string;
  position: string;
  department: string;
  level: string;
  avatar?: string;
  reportsTo?: string;
  children: OrgChartNode[];
}

// ===== TIPOS PARA RESPUESTAS DEL BACKEND =====

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EmployeeListResponse {
  success: boolean;
  data: {
    employees: Employee[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      total: number;
      active: number;
      inactive: number;
      pending: number;
      expired: number;
    };
  };
}

export interface EmployeeDetailResponse {
  success: boolean;
  data: {
    employee: Employee;
    relatedData: {
      vacations: VacationSummary;
      documents: Document[];
      incidents: any[];
      evaluations: any[];
      skills: any[];
      certifications: any[];
      history: any[];
    };
  };
}

export interface EmployeeSearchResponse {
  success: boolean;
  data: {
    employees: Employee[];
    total: number;
  };
}

export interface EmployeeStatsResponse {
  success: boolean;
  data: {
    summary: {
      total: number;
      active: number;
      inactive: number;
      terminated: number;
      on_leave: number;
    };
    byDepartment: Record<string, number>;
    byLevel: Record<string, number>;
  };
}



export interface VacationResponse {
  success: boolean;
  data: {
    vacations: VacationRecord[];
  };
}

export interface VacationBalanceResponse {
  success: boolean;
  data: {
    balance: VacationBalance;
  };
}

export interface DocumentResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    documents: Document[];
    totalCount: number;
    categories: string[];
    confidentialCount: number;
    publicCount: number;
  };
}

export interface OrgChartResponse {
  success: boolean;
  data: {
    orgChart: OrgChartNode[];
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  deletedAt: string;
}


// ===== TIPOS PARA FILTROS Y BÚSQUEDA =====

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  department?: string;
  status?: 'active' | 'inactive' | 'terminated' | 'on_leave';
  search?: string;
  level?: string;
  sortBy?: 'name' | 'department' | 'position' | 'hireDate';
  sortOrder?: 'asc' | 'desc';
}

// ===== TIPOS PARA CREAR/ACTUALIZAR EMPLEADOS =====

export interface CreateEmployeeData {
  personalInfo: Omit<PersonalInfo, 'avatar'> & { avatar?: string };
  position: Omit<Position, 'endDate'> & { endDate?: string };
  location: Location;
  contract: Omit<Contract, 'endDate' | 'customSchedule' | 'notes'> & {
    endDate?: string;
    customSchedule?: any;
    notes?: string;
  };
}

export interface UpdateEmployeeData {
  personalInfo?: Partial<PersonalInfo>;
  position?: Partial<Position>;
  location?: Partial<Location>;
  contract?: Partial<Contract>;
  status?: Employee['status'];
}


export interface VacationRequestData {
  startDate: string;
  endDate: string;
  type: VacationRecord['type'];
  reason?: string;
}

export interface DocumentMetadata {
  category: Document['category'];
  description?: string;
  tags?: string;
  isConfidential?: string;
}

// ===== TIPOS PARA ROLES Y PERMISOS HR =====

export interface HRRole {
  role: 'HR_ADMIN' | 'HR_MANAGER' | 'HR_USER' | 'EMPLOYEE';
  hrRole: 'HR_ADMIN' | 'HR_MANAGER' | 'HR_USER';
  employeeId?: string;
}

export interface HRPermissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canViewDocuments: boolean;
  canApproveVacations: boolean;
  scope: 'all' | 'department' | 'self';
}

// ===== FUNCIONES HELPER =====

// Convertir Employee a TeamMember para compatibilidad con componentes existentes
export function employeeToTeamMember(employee: Employee): TeamMember {
  return {
    ...employee,
    name: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
    email: employee.personalInfo.email,
    phone: employee.personalInfo.phone,
    position: employee.position.title,
    department: employee.position.department,
    avatar: employee.personalInfo.avatar,
    role: employee.position.title,
    permissions: [], // Se llenarán según los permisos HR
    skills: [], // Se pueden obtener de relatedData.skills
    experience: 0, // Se puede calcular desde position.startDate
    salary: employee.contract.salary,
    hireDate: employee.position.startDate,
    lastLogin: '', // No disponible en el backend de empleados
    performance: {
      rating: 0,
      completedTasks: 0,
      averageResponseTime: 0,
      customerSatisfaction: 0,
      totalConversations: 0,
      resolvedIssues: 0,
      escalations: 0,
      responseTime: { average: 0, median: 0, percentile95: 0 },
      availability: { online: 0, busy: 0, away: 0, offline: 0 },
      trends: []
    },
    workload: {
      activeChats: 0,
      dailyLimit: 0,
      utilization: 0
    },
    schedule: {
      timezone: employee.location?.timezone || employee.settings?.timezone || 'America/Mexico_City',
      workingHours: parseWorkingHours(employee.contract.workingHoursRange),
      workingDays: employee.contract.workingDays.split(',').map(d => d.trim())
    }
  };
}

// Helper para parsear horarios de trabajo
function parseWorkingHours(range: string): { start: string; end: string } {
  const [start, end] = range.split('-');
  return { start: start.trim(), end: end.trim() };
}

// ===== TIPOS LEGACY PARA COMPATIBILIDAD =====

export interface TeamMember extends Employee {
  name: string;
  role: string;
  permissions: string[];
  skills: string[];
  experience: number;
  hireDate: string;
  lastLogin: string;
  performance: PerformanceMetrics;
  workload: {
    activeChats: number;
    dailyLimit: number;
    utilization: number;
  };
  schedule: {
    timezone: string;
    workingHours: {
      start: string;
      end: string;
    };
    workingDays: string[];
  };
}

export interface PerformanceMetrics {
  rating: number;
  completedTasks: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  totalConversations: number;
  resolvedIssues: number;
  escalations: number;
  responseTime: {
    average: number;
    median: number;
    percentile95: number;
  };
  availability: {
    online: number;
    busy: number;
    away: number;
    offline: number;
  };
  trends: {
    period: string;
    change: number;
    direction: 'up' | 'down' | 'stable';
  }[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  level: 'read' | 'write' | 'admin';
}

export interface CoachingPlan {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  goals: string[];
  milestones: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    completed: boolean;
    completedAt?: string;
  }[];
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  progress: number;
}

export interface TeamFilters {
  search: string;
  department: string;
  status: string;
  role: string;
  skills: string[];
  experience: {
    min: number;
    max: number;
  };
  performance: {
    min: number;
    max: number;
  };
  sortBy: 'name' | 'department' | 'performance' | 'hireDate';
  sortOrder: 'asc' | 'desc';
}

export interface TeamState {
  members: TeamMember[];
  selectedMember: TeamMember | null;
  filters: TeamFilters;
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
    averagePerformance: number;
    totalExperience: number;
  };
}
