import api from './api';

// Interfaces para tipos de datos
export interface EmployeePayrollDetail {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    location: string;
    avatar?: string;
    status: 'active' | 'inactive' | 'on_leave';
  };
  payrollInfo: {
    baseSalary: number;
    grossSalary: number;
    netSalary: number;
    overtime: number;
    bonuses: number;
    deductions: number;
    taxes: number;
    benefits: number;
    currency: string;
  };
  period: {
    startDate: string;
    endDate: string;
    type: 'monthly' | 'biweekly' | 'weekly';
    status: 'paid' | 'pending' | 'processing' | 'cancelled';
  };
  performance: {
    rating: number;
    attendance: number;
    productivity: number;
  };
  lastUpdated: string;
}

export interface PayrollSummary {
  totalEmployees: number;
  totalGrossPayroll: number;
  totalNetPayroll: number;
  averageSalary: number;
  totalOvertime: number;
  totalBonuses: number;
  totalDeductions: number;
  totalTaxes: number;
}

export interface PayrollFilters {
  search?: string;
  status?: string;
  department?: string;
  salaryMin?: number;
  salaryMax?: number;
  periodStart?: string;
  periodEnd?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PayrollListResponse {
  employees: EmployeePayrollDetail[];
  summary: PayrollSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  includePersonalInfo?: boolean;
  includePerformance?: boolean;
  includeDetailedBreakdown?: boolean;
  employeeIds?: string[];
  periodStart?: string;
  periodEnd?: string;
}

class EmployeePayrollDetailApi {
  private baseUrl = '/api/payroll/employees';

  // Obtener lista de empleados con detalles de nómina
  async getEmployeePayrollList(filters: PayrollFilters = {}): Promise<PayrollListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/list`, { params: filters });
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo lista de empleados:', error);
      throw error;
    }
  }

  // Obtener resumen de nómina
  async getPayrollSummary(filters: PayrollFilters = {}): Promise<PayrollSummary> {
    try {
      const response = await api.get(`${this.baseUrl}/summary`, { params: filters });
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo resumen de nómina:', error);
      throw error;
    }
  }

  // Obtener detalles de un empleado específico
  async getEmployeePayrollDetail(employeeId: string, periodId?: string): Promise<EmployeePayrollDetail> {
    try {
      const params = periodId ? { periodId } : {};
      const response = await api.get(`${this.baseUrl}/${employeeId}`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo detalles del empleado:', error);
      throw error;
    }
  }

  // Actualizar información de nómina de un empleado
  async updateEmployeePayroll(employeeId: string, data: Partial<EmployeePayrollDetail>): Promise<EmployeePayrollDetail> {
    try {
      const response = await api.put(`${this.baseUrl}/${employeeId}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error actualizando nómina del empleado:', error);
      throw error;
    }
  }

  // Procesar nómina para empleados seleccionados
  async processPayrollForEmployees(employeeIds: string[], options: {
    periodId: string;
    includeOvertime?: boolean;
    includeBonuses?: boolean;
    includeDeductions?: boolean;
  }): Promise<{
    processed: number;
    failed: number;
    results: Array<{
      employeeId: string;
      status: 'success' | 'error';
      message?: string;
    }>;
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/process`, {
        employeeIds,
        ...options
      });
      return response.data.data;
    } catch (error) {
      console.error('Error procesando nómina:', error);
      throw error;
    }
  }

  // Exportar datos de nómina
  async exportPayrollData(options: ExportOptions): Promise<Blob> {
    try {
      const response = await api.post(`${this.baseUrl}/export`, options, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exportando datos:', error);
      throw error;
    }
  }

  // Generar reporte de nómina
  async generatePayrollReport(options: {
    type: 'summary' | 'detailed' | 'comparative' | 'trends';
    format: 'pdf' | 'excel';
    periodStart: string;
    periodEnd: string;
    departmentIds?: string[];
    employeeIds?: string[];
  }): Promise<{
    reportId: string;
    downloadUrl: string;
    generatedAt: string;
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/reports`, options);
      return response.data.data;
    } catch (error) {
      console.error('Error generando reporte:', error);
      throw error;
    }
  }

  // Obtener estadísticas de nómina
  async getPayrollStatistics(filters: {
    periodStart?: string;
    periodEnd?: string;
    departmentIds?: string[];
  }): Promise<{
    averageSalary: number;
    medianSalary: number;
    salaryDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    departmentBreakdown: Array<{
      department: string;
      totalEmployees: number;
      totalPayroll: number;
      averageSalary: number;
    }>;
    trends: Array<{
      period: string;
      totalPayroll: number;
      averageSalary: number;
      employeeCount: number;
    }>;
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/statistics`, { params: filters });
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // Compartir datos de nómina
  async sharePayrollData(options: {
    employeeIds: string[];
    recipients: string[];
    message?: string;
    accessLevel: 'view' | 'edit' | 'admin';
    expiresAt?: string;
  }): Promise<{
    shareId: string;
    shareUrl: string;
    expiresAt: string;
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/share`, options);
      return response.data.data;
    } catch (error) {
      console.error('Error compartiendo datos:', error);
      throw error;
    }
  }

  // Obtener historial de cambios de nómina
  async getPayrollHistory(employeeId: string, options: {
    periodStart?: string;
    periodEnd?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    history: Array<{
      id: string;
      changeType: 'salary_adjustment' | 'bonus' | 'deduction' | 'status_change';
      oldValue: any;
      newValue: any;
      reason: string;
      changedBy: string;
      changedAt: string;
    }>;
    total: number;
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/${employeeId}/history`, { params: options });
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  }

  // Validar datos de nómina
  async validatePayrollData(employeeIds: string[], periodId: string): Promise<{
    valid: boolean;
    errors: Array<{
      employeeId: string;
      field: string;
      message: string;
      severity: 'error' | 'warning' | 'info';
    }>;
    warnings: Array<{
      employeeId: string;
      field: string;
      message: string;
    }>;
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/validate`, {
        employeeIds,
        periodId
      });
      return response.data.data;
    } catch (error) {
      console.error('Error validando datos:', error);
      throw error;
    }
  }

  // Aprobar nómina
  async approvePayroll(employeeIds: string[], periodId: string, options: {
    approvedBy: string;
    notes?: string;
    sendNotifications?: boolean;
  }): Promise<{
    approved: number;
    failed: number;
    results: Array<{
      employeeId: string;
      status: 'approved' | 'error';
      message?: string;
    }>;
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/approve`, {
        employeeIds,
        periodId,
        ...options
      });
      return response.data.data;
    } catch (error) {
      console.error('Error aprobando nómina:', error);
      throw error;
    }
  }

  // Obtener departamentos disponibles
  async getDepartments(): Promise<Array<{
    id: string;
    name: string;
    employeeCount: number;
    averageSalary: number;
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/departments`);
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo departamentos:', error);
      throw error;
    }
  }

  // Obtener períodos de nómina disponibles
  async getPayrollPeriods(): Promise<Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    type: 'monthly' | 'biweekly' | 'weekly';
    status: 'open' | 'closed' | 'processing';
    employeeCount: number;
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/periods`);
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo períodos:', error);
      throw error;
    }
  }
}

export const employeePayrollDetailApi = new EmployeePayrollDetailApi();
export default employeePayrollDetailApi;
