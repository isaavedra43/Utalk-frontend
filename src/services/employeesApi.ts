import api from './api';

// Interfaces para tipos de datos - ALINEADAS 100% CON BACKEND
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
    nss?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
      number?: string;
      neighborhood?: string;
      zipCode?: string;
    };
    emergencyContact?: any;
    bankInfo?: any;
  };
  position: {
    id?: string;
    title: string;
    department: string;
    level: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Manager' | 'Director';
    reportsTo?: string;
    jobDescription?: string;
    startDate?: string;
    endDate?: string;
    requirements?: any[];
    skills?: any[];
    salaryRange?: {
      min: number;
      max: number;
    };
  };
  location: {
    id?: string;
    name?: string;
    office: string;
    address?: {
      street?: string;
      number?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    zipCode?: string;
    timezone?: string;
    isRemote?: boolean;
  };
  contract: {
    type: 'permanent' | 'temporary' | 'intern' | 'contractor';
    startDate: string;
    endDate?: string;
    salary?: number;
    currency?: string;
    workingDays?: string;
    workingHoursRange?: string;
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
    benefits?: string;
    clauses?: any[];
    schedule?: string;
    notes?: string;
  };
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  salary?: {
    baseSalary?: number;
    currency?: string;
    frequency?: string;
    paymentMethod?: string;
    allowances?: any[];
    deductions?: any[];
  };
  sbc?: number;
  vacationBalance?: number;
  sickLeaveBalance?: number;
  metrics?: {
    totalEarnings?: number;
    totalDeductions?: number;
    netPay?: number;
    lateArrivals?: number;
    absences?: number;
    vacationDaysUsed?: number;
    vacationDaysRemaining?: number;
    overtimeHours?: number;
    overtimeAmount?: number;
    incidentsCount?: number;
    incidentsLast30Days?: number;
    documentCompliance?: number;
    trainingCompletion?: number;
    performanceScore?: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
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
  private requestCache = new Map<string, { data: GetEmployeesResponse; timestamp: number }>();
  private pendingRequests = new Map<string, Promise<GetEmployeesResponse>>();
  private readonly CACHE_DURATION = 30000; // 30 segundos

  // Gestión de empleados con cache y deduplicación
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
    // Crear clave única para el cache
    const cacheKey = JSON.stringify(params);
    const now = Date.now();

    // Verificar cache
    const cached = this.requestCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      console.log('🎯 Usando cache para empleados:', cacheKey);
      return cached.data;
    }

    // Verificar si ya hay una petición en curso para estos parámetros
    if (this.pendingRequests.has(cacheKey)) {
      console.log('⏳ Esperando petición en curso para empleados:', cacheKey);
      return this.pendingRequests.get(cacheKey)!;
    }

    // Crear nueva petición
    const requestPromise = this.performEmployeesRequest(params, cacheKey);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Limpiar petición pendiente
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async performEmployeesRequest(params: any, cacheKey: string, retryCount = 0): Promise<GetEmployeesResponse> {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 segundo

    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });

      console.log('🌐 Realizando petición real a API de empleados:', params);
      const response = await api.get(`/api/employees?${searchParams.toString()}`);
      
      // El backend devuelve { success: true, data: { employees, pagination, summary } }
      // Necesitamos extraer solo la parte 'data'
      let result: GetEmployeesResponse;
      if (response.data && response.data.success && response.data.data) {
        result = response.data.data;
      } else {
        // Fallback por si la estructura es diferente
        result = response.data;
      }

      // Guardar en cache
      this.requestCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      // Limpiar cache viejo (más de 5 minutos)
      this.cleanOldCache();

      return result;
    } catch (error: any) {
      // Verificar si es un error de rate limit
      const isRateLimitError = error.message?.includes('Rate limit exceeded') || 
                              error.message?.includes('rate limit') ||
                              error.response?.status === 429;

      if (isRateLimitError && retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.warn(`⚠️ Rate limit excedido. Reintentando en ${delay/1000} segundos... (Intento ${retryCount + 1}/${maxRetries})`);
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Reintentar
        return this.performEmployeesRequest(params, cacheKey, retryCount + 1);
      }

      // Si no es rate limit o se agotaron los reintentos, lanzar el error
      console.error('❌ Error en petición de empleados:', error);
      throw error;
    }
  }

  private cleanOldCache() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutos
    
    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.requestCache.delete(key);
      }
    }
  }

  // Limpiar cache manualmente
  clearCache() {
    this.requestCache.clear();
    this.pendingRequests.clear();
    console.log('🧹 Cache de empleados limpiado');
  }

  async getEmployee(id: string): Promise<GetEmployeeResponse> {
    const response = await api.get(`/api/employees/${id}`);
    
    // El backend devuelve { success: true, data: { employee, relatedData } }
    // Necesitamos extraer solo la parte 'data'
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback por si la estructura es diferente
    return response.data;
  }

  async createEmployee(employeeData: Partial<Employee>): Promise<{ employee: Employee; message: string }> {
    const response = await api.post('/api/employees', employeeData);
    
    // El backend devuelve { success: true, data: { employee }, message }
    // Necesitamos extraer solo la parte 'data' si existe
    if (response.data && response.data.success && response.data.data) {
      return {
        employee: response.data.data.employee,
        message: response.data.message || 'Empleado creado exitosamente'
      };
    }
    
    // Fallback por si la estructura es diferente
    return response.data;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<{ employee: Employee; message: string }> {
    const response = await api.put(`/api/employees/${id}`, updates);
    
    // El backend devuelve { success: true, data: { employee }, message }
    // Necesitamos extraer solo la parte 'data' si existe
    if (response.data && response.data.success && response.data.data) {
      return {
        employee: response.data.data.employee,
        message: response.data.message || 'Empleado actualizado exitosamente'
      };
    }
    
    // Fallback por si la estructura es diferente
    return response.data;
  }

  async deleteEmployee(id: string): Promise<{ message: string; deletedAt: string }> {
    const response = await api.delete(`/api/employees/${id}`);
    
    // El backend devuelve { success: true, message, data: { deletedAt } }
    // Necesitamos extraer la información correctamente
    if (response.data && response.data.success) {
      return {
        message: response.data.message || 'Empleado eliminado exitosamente',
        deletedAt: response.data.data?.deletedAt || new Date().toISOString()
      };
    }
    
    // Fallback por si la estructura es diferente
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
    
    // El backend devuelve { success: true/false, data: { imported, updated, errors, ... }, message }
    // Necesitamos mantener toda la estructura para importEmployees
    if (response.data && response.data.data) {
      return {
        success: response.data.success,
        imported: response.data.data.imported || 0,
        updated: response.data.data.updated || 0,
        errors: response.data.data.errors || [],
        message: response.data.message || 'Importación completada'
      };
    }
    
    // Fallback por si la estructura es diferente
    return response.data;
  }

  async exportEmployees(params: {
    format: 'xlsx' | 'csv' | 'pdf';
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

    // Asegurar que el formato sea correcto
    const format = params.format === 'excel' ? 'xlsx' : params.format;
    searchParams.set('format', format);

    console.log('📤 Exportando empleados con parámetros:', {
      format,
      filters: params.filters,
      fields: params.fields
    });

    const response = await api.get(`/api/employees/export?${searchParams.toString()}`, {
      responseType: 'blob',
      headers: {
        'Accept': format === 'xlsx' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : format === 'csv' 
          ? 'text/csv'
          : 'application/pdf'
      }
    });
    
    console.log('✅ Archivo exportado exitosamente');
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
    
    // Manejar la estructura real de respuesta del backend
    if (response.data && response.data.data) {
      const backendData = response.data.data;
      return {
        incidents: backendData.incidents || [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: backendData.count || 0,
          totalPages: Math.ceil((backendData.count || 0) / (params.limit || 20))
        },
        summary: backendData.summary || {
          total: 0,
          open: 0,
          closed: 0,
          critical: 0,
          byType: {},
          bySeverity: {}
        }
      };
    }
    
    // Fallback si la estructura es diferente
    return {
      incidents: [],
      pagination: {
        page: params.page || 1,
        limit: params.limit || 20,
        total: 0,
        totalPages: 0
      },
      summary: {
        total: 0,
        open: 0,
        closed: 0,
        critical: 0,
        byType: {},
        bySeverity: {}
      }
    };
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

  async updateSkill(employeeId: string, skillId: string, skillData: Partial<{
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
  }>): Promise<{ skill: Skill; message: string }> {
    const response = await api.put(`/api/employees/${employeeId}/skills/${skillId}`, skillData);
    return response.data;
  }

  async deleteSkill(employeeId: string, skillId: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/employees/${employeeId}/skills/${skillId}`);
    return response.data;
  }

  // Gestión de certificaciones
  async getEmployeeCertifications(employeeId: string, params: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    certifications: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalCertifications: number;
      activeCertifications: number;
      expiringSoon: number;
      byCategory: Record<string, number>;
      byStatus: Record<string, number>;
    };
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/employees/${employeeId}/certifications?${searchParams.toString()}`);
    return response.data;
  }

  async createCertification(employeeId: string, certificationData: {
    name: string;
    issuer: string;
    issueDate: string;
    expirationDate?: string;
    credentialId: string;
    credentialUrl?: string;
    description?: string;
    category: string;
    level: string;
    documents?: string[];
  }): Promise<{ certification: any; message: string }> {
    const response = await api.post(`/api/employees/${employeeId}/certifications`, certificationData);
    return response.data;
  }

  async updateCertification(employeeId: string, certificationId: string, certificationData: Partial<{
    name: string;
    issuer: string;
    issueDate: string;
    expirationDate?: string;
    credentialId: string;
    credentialUrl?: string;
    description?: string;
    category: string;
    level: string;
    documents?: string[];
  }>): Promise<{ certification: any; message: string }> {
    const response = await api.put(`/api/employees/${employeeId}/certifications/${certificationId}`, certificationData);
    return response.data;
  }

  async deleteCertification(employeeId: string, certificationId: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/employees/${employeeId}/certifications/${certificationId}`);
    return response.data;
  }

  // Gestión de planes de desarrollo
  async getEmployeeDevelopmentPlans(employeeId: string, params: {
    status?: string;
    skillId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    developmentPlans: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalPlans: number;
      activePlans: number;
      completedPlans: number;
      averageProgress: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/employees/${employeeId}/development-plans?${searchParams.toString()}`);
    return response.data;
  }

  async createDevelopmentPlan(employeeId: string, planData: {
    skillId: string;
    skillName: string;
    currentLevel: string;
    targetLevel: string;
    activities: any[];
    startDate: string;
    targetDate: string;
    mentor?: string;
    notes?: string;
  }): Promise<{ developmentPlan: any; message: string }> {
    const response = await api.post(`/api/employees/${employeeId}/development-plans`, planData);
    return response.data;
  }

  async updateDevelopmentPlan(employeeId: string, planId: string, planData: Partial<{
    skillId: string;
    skillName: string;
    currentLevel: string;
    targetLevel: string;
    activities: any[];
    startDate: string;
    targetDate: string;
    status: string;
    progress: number;
    mentor?: string;
    notes?: string;
  }>): Promise<{ developmentPlan: any; message: string }> {
    const response = await api.put(`/api/employees/${employeeId}/development-plans/${planId}`, planData);
    return response.data;
  }

  async deleteDevelopmentPlan(employeeId: string, planId: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/employees/${employeeId}/development-plans/${planId}`);
    return response.data;
  }

  // Gestión de evaluaciones de habilidades
  async getEmployeeSkillEvaluations(employeeId: string, params: {
    skillId?: string;
    evaluationType?: string;
    status?: string;
    year?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    evaluations: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalEvaluations: number;
      averageScore: number;
      byType: Record<string, number>;
      byStatus: Record<string, number>;
      recentEvaluations: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/employees/${employeeId}/skill-evaluations?${searchParams.toString()}`);
    return response.data;
  }

  async createSkillEvaluation(employeeId: string, evaluationData: {
    skillId: string;
    skillName: string;
    evaluationType: string;
    level: string;
    score: number;
    feedback?: string;
    strengths?: string[];
    improvements?: string[];
    developmentSuggestions?: string[];
    evidence?: string[];
  }): Promise<{ evaluation: any; message: string }> {
    const response = await api.post(`/api/employees/${employeeId}/skill-evaluations`, evaluationData);
    return response.data;
  }

  async updateSkillEvaluation(employeeId: string, evaluationId: string, evaluationData: Partial<{
    skillId: string;
    skillName: string;
    evaluationType: string;
    level: string;
    score: number;
    feedback?: string;
    strengths?: string[];
    improvements?: string[];
    developmentSuggestions?: string[];
    evidence?: string[];
    status: string;
  }>): Promise<{ evaluation: any; message: string }> {
    const response = await api.put(`/api/employees/${employeeId}/skill-evaluations/${evaluationId}`, evaluationData);
    return response.data;
  }

  async deleteSkillEvaluation(employeeId: string, evaluationId: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/employees/${employeeId}/skill-evaluations/${evaluationId}`);
    return response.data;
  }

  // Subida de archivos para habilidades
  async uploadSkillFiles(files: File[], type: 'evidence' | 'certification' | 'evaluation'): Promise<string[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('type', type);

    const response = await api.post('/api/skills/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.fileIds || [];
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
    
    // Manejar la estructura real de respuesta del backend
    if (response.data && response.data.data) {
      const backendData = response.data.data;
      return {
        history: backendData.history || [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 100,
          total: backendData.history?.length || 0,
          totalPages: 1
        },
        summary: {
          totalEvents: backendData.history?.length || 0,
          lastUpdate: new Date().toISOString(),
          recentEvents: backendData.history?.length || 0,
          activeUsers: 1,
          affectedModules: 1
        }
      };
    }
    
    // Fallback si la estructura es diferente
    return {
      history: [],
      pagination: {
        page: params.page || 1,
        limit: params.limit || 100,
        total: 0,
        totalPages: 0
      },
      summary: {
        totalEvents: 0,
        lastUpdate: new Date().toISOString(),
        recentEvents: 0,
        activeUsers: 0,
        affectedModules: 0
      }
    };
  }
}

export const employeesApi = new EmployeesApiService();
