import api from './api';

// Interfaces para tipos de datos
export interface Employee {
  id: string;
  employeeNumber: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: 'M' | 'F' | 'O';
    maritalStatus?: string;
    nationality?: string;
    rfc?: string;
    curp?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };
  position: {
    title: string;
    department: string;
    level: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Manager' | 'Director';
    reportsTo?: string;
    jobDescription?: string;
    startDate: string;
    endDate?: string;
  };
  location: {
    office: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    timezone?: string;
  };
  contract: {
    type: 'permanent' | 'temporary' | 'intern' | 'contractor';
    startDate: string;
    endDate?: string;
    salary: number;
    currency: string;
    workingDays: string;
    workingHoursRange: string;
    customSchedule?: {
      enabled: boolean;
      days: {
        lunes: { enabled: boolean; startTime: string; endTime: string; };
        martes: { enabled: boolean; startTime: string; endTime: string; };
        miercoles: { enabled: boolean; startTime: string; endTime: string; };
        jueves: { enabled: boolean; startTime: string; endTime: string; };
        viernes: { enabled: boolean; startTime: string; endTime: string; };
        sabado: { enabled: boolean; startTime: string; endTime: string; };
        domingo: { enabled: boolean; startTime: string; endTime: string; };
      };
    };
    benefits?: string[];
    notes?: string;
  };
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PayrollPeriod {
  id: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  weekNumber: number;
  year: number;
  grossSalary: number;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  commissions: number;
  taxes: number;
  socialSecurity: number;
  healthInsurance: number;
  retirement: number;
  otherDeductions: number;
  netSalary: number;
  status: 'draft' | 'calculated' | 'approved' | 'paid';
  paidDate?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  breakHours: number;
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'half_day';
  isHoliday: boolean;
  isWeekend: boolean;
  justification?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface VacationRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  type: 'vacation' | 'sick_leave' | 'personal' | 'maternity' | 'paternity' | 'other';
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  category: 'contract' | 'identification' | 'medical' | 'academic' | 'performance' | 'disciplinary' | 'personal' | 'other';
  description?: string;
  tags?: string[];
  isConfidential: boolean;
  uploadedBy: string;
  uploadedAt: string;
  expiresAt?: string;
  version: number;
  previousVersionId?: string;
}

export interface Incident {
  id: string;
  employeeId: string;
  type: 'administrative' | 'theft' | 'accident' | 'injury' | 'disciplinary' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  date: string;
  location: string;
  witnesses?: string[];
  reportedBy: string;
  reportedAt: string;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  assignedTo?: string;
  investigationNotes?: string;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Evaluation {
  id: string;
  employeeId: string;
  type: 'annual' | 'quarterly' | 'monthly' | 'performance' | 'objectives' | 'competencies';
  period: string;
  evaluatorId: string;
  overallScore: number;
  status: 'draft' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'archived';
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
  goals: string[];
  completedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  employeeId: string;
  name: string;
  category: 'technical' | 'soft' | 'leadership' | 'language' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  score: number;
  lastEvaluated: string;
  evidence: string;
  isRequired: boolean;
  developmentPlan: string;
  resources: string[];
  targetLevel?: string;
  targetDate?: string;
}

export interface EmployeeHistory {
  id: string;
  employeeId: string;
  type: string;
  description: string;
  changedBy: string;
  changedAt: string;
  details: Record<string, any>;
  module: string;
  action: string;
  oldValue?: any;
  newValue?: any;
}

// Respuestas de la API
export interface GetEmployeesResponse {
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
}

export interface GetEmployeeResponse {
  employee: Employee;
  relatedData: {
    payroll: PayrollPeriod[];
    attendance: {
      employeeId: string;
      periodStart: string;
      periodEnd: string;
      totalDays: number;
      presentDays: number;
      absentDays: number;
      lateDays: number;
      totalHours: number;
      overtimeHours: number;
      punctualityScore: number;
    };
    vacations: {
      employeeId: string;
      year: number;
      totalDays: number;
      usedDays: number;
      pendingDays: number;
      availableDays: number;
      carriedOverDays: number;
      expiresAt: string;
    };
    documents: EmployeeDocument[];
    incidents: Incident[];
    evaluations: Evaluation[];
    skills: Skill[];
    certifications: any[];
    history: EmployeeHistory[];
  };
}

// Servicio API para empleados
class EmployeesApiService {
  // Gestión de empleados
  async getEmployees(params: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    status?: string;
    position?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<GetEmployeesResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/employees?${searchParams.toString()}`);
    return response.data;
  }

  async getEmployee(id: string): Promise<GetEmployeeResponse> {
    const response = await api.get(`/api/employees/${id}`);
    return response.data;
  }

  async createEmployee(employeeData: Partial<Employee>): Promise<{ employee: Employee; message: string }> {
    const response = await api.post('/api/employees', employeeData);
    return response.data;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<{ employee: Employee; message: string }> {
    const response = await api.put(`/api/employees/${id}`, updates);
    return response.data;
  }

  async deleteEmployee(id: string): Promise<{ message: string; deletedAt: string }> {
    const response = await api.delete(`/api/employees/${id}`);
    return response.data;
  }

  async importEmployees(file: File, options: {
    updateExisting: boolean;
    skipErrors: boolean;
    validateData: boolean;
  }): Promise<{
    success: boolean;
    imported: number;
    updated: number;
    errors: Array<{ row: number; field: string; message: string }>;
    message: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    const response = await api.post('/api/employees/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async exportEmployees(params: {
    format: 'excel' | 'csv' | 'pdf';
    filters?: Record<string, any>;
    fields?: string[];
  }): Promise<Blob> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object') {
          searchParams.append(key, JSON.stringify(value));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(`/api/employees/export?${searchParams.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Gestión de nómina
  async getEmployeePayroll(employeeId: string, params: {
    year?: number;
    month?: number;
    week?: number;
    periodStart?: string;
    periodEnd?: string;
  } = {}): Promise<{
    periods: PayrollPeriod[];
    summary: {
      totalGross: number;
      totalNet: number;
      totalDeductions: number;
      averageGross: number;
      averageNet: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/employees/${employeeId}/payroll?${searchParams.toString()}`);
    return response.data;
  }

  async getWeeklyPayroll(params: {
    week: number;
    year: number;
    department?: string;
  }): Promise<{
    weekNumber: number;
    startDate: string;
    endDate: string;
    totalEmployees: number;
    totalCost: number;
    averagePerEmployee: number;
    status: string;
    details: Array<{
      employee: Employee;
      gross: number;
      net: number;
      deductions: number;
    }>;
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/payroll/weekly?${searchParams.toString()}`);
    return response.data;
  }

  // Gestión de asistencia
  async getEmployeeAttendance(employeeId: string, params: {
    startDate: string;
    endDate: string;
    includeWeekends?: boolean;
    includeHolidays?: boolean;
  }): Promise<{
    records: AttendanceRecord[];
    summary: {
      employeeId: string;
      periodStart: string;
      periodEnd: string;
      totalDays: number;
      presentDays: number;
      absentDays: number;
      lateDays: number;
      totalHours: number;
      overtimeHours: number;
      punctualityScore: number;
    };
    trends: Array<{
      date: string;
      hours: number;
      status: string;
    }>;
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/employees/${employeeId}/attendance?${searchParams.toString()}`);
    return response.data;
  }

  // Gestión de vacaciones
  async getEmployeeVacations(employeeId: string, params: {
    year?: number;
    status?: string;
  } = {}): Promise<{
    balance: {
      employeeId: string;
      year: number;
      totalDays: number;
      usedDays: number;
      pendingDays: number;
      availableDays: number;
      carriedOverDays: number;
      expiresAt: string;
    };
    requests: VacationRequest[];
    summary: {
      totalDays: number;
      usedDays: number;
      availableDays: number;
      pendingDays: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/employees/${employeeId}/vacations?${searchParams.toString()}`);
    return response.data;
  }

  async createVacationRequest(employeeId: string, requestData: {
    startDate: string;
    endDate: string;
    type: string;
    reason?: string;
  }): Promise<{ request: VacationRequest; message: string }> {
    const response = await api.post(`/api/employees/${employeeId}/vacations`, requestData);
    return response.data;
  }

  // Gestión de documentos
  async getEmployeeDocuments(employeeId: string, params: {
    category?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    documents: EmployeeDocument[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalFiles: number;
      totalSize: number;
      categories: Record<string, number>;
    };
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/employees/${employeeId}/documents?${searchParams.toString()}`);
    return response.data;
  }

  async uploadDocument(employeeId: string, file: File, metadata: {
    category: string;
    description?: string;
    tags?: string[];
    isConfidential?: boolean;
    expiresAt?: string;
  }): Promise<{ document: EmployeeDocument; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post(`/api/employees/${employeeId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteDocument(employeeId: string, documentId: string): Promise<{ message: string; deletedAt: string }> {
    const response = await api.delete(`/api/employees/${employeeId}/documents/${documentId}`);
    return response.data;
  }

  // Gestión de incidencias
  async getEmployeeIncidents(employeeId: string, params: {
    type?: string;
    severity?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    incidents: Incident[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      total: number;
      open: number;
      closed: number;
      critical: number;
      byType: Record<string, number>;
      bySeverity: Record<string, number>;
    };
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/employees/${employeeId}/incidents?${searchParams.toString()}`);
    return response.data;
  }

  async createIncident(employeeId: string, incidentData: {
    type: string;
    severity: string;
    title: string;
    description: string;
    date: string;
    location: string;
    witnesses?: string[];
    attachments?: string[];
  }): Promise<{ incident: Incident; message: string }> {
    const response = await api.post(`/api/employees/${employeeId}/incidents`, incidentData);
    return response.data;
  }

  // Gestión de evaluaciones
  async getEmployeeEvaluations(employeeId: string, params: {
    type?: string;
    status?: string;
    year?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    evaluations: Evaluation[];
    objectives: any[];
    competencies: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalEvaluations: number;
      averageScore: number;
      objectivesCompleted: string;
      competenciesMastered: number;
      byType: Record<string, number>;
      byStatus: Record<string, number>;
    };
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/employees/${employeeId}/evaluations?${searchParams.toString()}`);
    return response.data;
  }

  // Gestión de habilidades
  async getEmployeeSkills(employeeId: string, params: {
    category?: string;
    level?: string;
    required?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    skills: Skill[];
    certifications: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalSkills: number;
      averageLevel: number;
      certifications: number;
      coreSkills: number;
      byCategory: Record<string, number>;
      byLevel: Record<string, number>;
    };
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/employees/${employeeId}/skills?${searchParams.toString()}`);
    return response.data;
  }

  async createSkill(employeeId: string, skillData: {
    name: string;
    category: string;
    level: string;
    score: number;
    evidence: string;
    isRequired: boolean;
    developmentPlan: string;
    resources: string[];
    targetLevel?: string;
    targetDate?: string;
  }): Promise<{ skill: Skill; message: string }> {
    const response = await api.post(`/api/employees/${employeeId}/skills`, skillData);
    return response.data;
  }

  // Gestión de historial
  async getEmployeeHistory(employeeId: string, params: {
    type?: string;
    module?: string;
    dateFrom?: string;
    dateTo?: string;
    changedBy?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    history: EmployeeHistory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalEvents: number;
      lastUpdate: string;
      recentEvents: number;
      activeUsers: number;
      affectedModules: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/employees/${employeeId}/history?${searchParams.toString()}`);
    return response.data;
  }
}

export const employeesApi = new EmployeesApiService();
