// Servicio API para nómina individual - alineado con especificaciones del backend
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'https://utalk-backend-production.up.railway.app';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

// Tipos alineados con el backend
export interface PayrollConfig {
  id: string;
  employeeId: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  baseSalary: number;
  sbc: number;
  workingDaysPerWeek: number;
  workingHoursPerDay: number;
  overtimeRate: number;
  paymentMethod: 'transfer' | 'cash' | 'check';
  bankAccount?: string;
  taxRegime?: string;
  notes?: string;
  isActive: boolean;
  startDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PayrollPeriod {
  id: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  baseSalary: number;
  calculatedSalary: number;
  grossSalary: number;
  totalPerceptions: number;
  totalDeductions: number;
  netSalary: number;
  status: 'calculated' | 'approved' | 'paid' | 'cancelled';
  weekNumber?: number;
  year: number;
  month: number;
  approvedBy?: string;
  approvedAt?: string;
  paymentDate?: string;
  paidBy?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PayrollDetail {
  id: string;
  payrollId: string;
  type: 'perception' | 'deduction';
  concept: string;
  amount: number;
  description: string;
  category: 'salary' | 'overtime' | 'absence' | 'loan' | 'advance' | 'bonus' | 'allowance';
  isFixed: boolean;
  isTaxable: boolean;
  extraId?: string;
}

export interface PendingExtra {
  id: string;
  type: 'overtime' | 'absence' | 'loan' | 'advance' | 'bonus';
  date: string;
  amount: number;
  calculatedAmount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedToPayroll: boolean;
  impactType: 'add' | 'subtract';
}

export interface PendingExtrasResponse {
  period: {
    startDate: string;
    endDate: string;
  };
  extras: PendingExtra[];
  perceptions: PendingExtra[];
  deductions: PendingExtra[];
  summary: {
    totalExtras: number;
    totalPerceptions: number;
    totalDeductions: number;
    totalToAdd: number;
    totalToSubtract: number;
    netImpact: number;
  };
}

export interface PayrollGenerationResponse {
  payroll: PayrollPeriod;
  details: {
    perceptions: PayrollDetail[];
    deductions: PayrollDetail[];
  };
  summary: {
    totalPerceptions: number;
    totalDeductions: number;
    netSalary: number;
    extrasApplied: number;
    perceptionsCount: number;
    deductionsCount: number;
  };
}

export interface PayrollPeriodsResponse {
  periods: PayrollPeriod[];
  summary: {
    totalPeriods: number;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    averageGross: number;
    averageNet: number;
  };
  filters: {
    limit?: number;
    year?: number;
    month?: number;
    status?: string;
  };
}

export interface PayrollDetailsResponse {
  payroll: PayrollPeriod;
  perceptions: PayrollDetail[];
  deductions: PayrollDetail[];
  summary: {
    totalPerceptions: number;
    totalDeductions: number;
    netSalary: number;
  };
}

export interface PayrollAttachment {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  uploadedAt: string;
  category?: string;
  description?: string;
}

export interface PayrollAttachmentResponse {
  attachments: PayrollAttachment[];
  total: number;
}

// Interfaces para Nómina General
export interface PayrollPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  status: 'draft' | 'calculated' | 'approved' | 'paid' | 'closed';
  configurations: {
    calculateTaxes: boolean;
    includeOvertime: boolean;
    applyAbsenceDeductions: boolean;
    includeLoans: boolean;
  };
  summary: {
    totalEmployees: number;
    totalPayroll: number;
    totalPerceptions: number;
    totalDeductions: number;
    averageSalary: number;
    employeesProcessed: number;
    employeesPending: number;
    employeesApproved: number;
    employeesPaid: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  closedAt?: string;
}

export interface PayrollEmployee {
  employee: {
    id: string;
    employeeNumber: string;
    name: string;
    position: string;
    department: string;
  };
  payroll: {
    id: string;
    grossSalary: number;
    totalPerceptions: number;
    totalDeductions: number;
    netSalary: number;
    status: 'calculated' | 'approved' | 'paid';
    workedDays: number;
  };
  attendance?: {
    workedDays: number;
    totalDays: number;
    absences: number;
    overtimeHours: number;
  };
}

export interface PayrollPeriodResponse {
  period: PayrollPeriod;
  employees: PayrollEmployee[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class PayrollApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || data.message || 'Error en la respuesta del servidor');
    }

    return data.data;
  }

  // CONFIGURACIÓN DE NÓMINA
  async configurePayroll(employeeId: string, configData: Partial<PayrollConfig>): Promise<{ config: PayrollConfig; employee: any }> {
    return this.request(`/api/payroll/config/${employeeId}`, {
      method: 'POST',
      body: JSON.stringify(configData),
    });
  }

  async getPayrollConfig(employeeId: string): Promise<PayrollConfig | null> {
    try {
      const response = await this.request<{ config: PayrollConfig }>(`/api/payroll/config/${employeeId}`);
      return response.config;
    } catch (error) {
      // Si no hay configuración, devolver null en lugar de error
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
        console.log('📋 No hay configuración de nómina para el empleado:', employeeId);
        return null;
      }
      console.error('❌ Error obteniendo configuración de nómina:', error);
      throw error;
    }
  }

  async updatePayrollConfig(employeeId: string, configData: Partial<PayrollConfig>): Promise<{ config: PayrollConfig; previousConfig: PayrollConfig }> {
    return this.request(`/api/payroll/config/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  }

  // GENERACIÓN DE NÓMINA
  async generatePayroll(employeeId: string, options: { periodDate?: string; forceRegenerate?: boolean } = {}): Promise<PayrollGenerationResponse> {
    return this.request(`/api/payroll/generate/${employeeId}`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async getPendingExtras(employeeId: string, periodStart?: string, periodEnd?: string): Promise<PendingExtrasResponse> {
    const params = new URLSearchParams();
    if (periodStart) params.append('periodStart', periodStart);
    if (periodEnd) params.append('periodEnd', periodEnd);
    
    const queryString = params.toString();
    const endpoint = `/api/payroll/extras-pending/${employeeId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  // CONSULTA DE PERÍODOS POR EMPLEADO
  async getEmployeePayrollPeriods(employeeId: string, filters: { limit?: number; year?: number; month?: number; status?: string } = {}): Promise<PayrollPeriodsResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = `/api/payroll/periods/${employeeId}${queryString ? `?${queryString}` : ''}`;
    
    try {
      return await this.request(endpoint);
    } catch (error) {
      // Si no hay períodos, devolver respuesta vacía
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
        console.log('📋 No hay períodos de nómina para el empleado:', employeeId);
        return {
          periods: [],
          summary: {
            totalPeriods: 0,
            totalGross: 0,
            totalDeductions: 0,
            totalNet: 0,
            averageGross: 0,
            averageNet: 0
          },
          filters
        };
      }
      throw error;
    }
  }

  async getPayrollDetails(payrollId: string): Promise<PayrollDetailsResponse> {
    return this.request(`/api/payroll/period/${payrollId}/details`);
  }

  // GESTIÓN DE ESTADOS
  async approvePayroll(payrollId: string): Promise<{ payroll: PayrollPeriod }> {
    return this.request(`/api/payroll/approve/${payrollId}`, {
      method: 'PUT',
    });
  }

  async markAsPaid(payrollId: string, paymentDate?: string): Promise<{ payroll: PayrollPeriod }> {
    return this.request(`/api/payroll/pay/${payrollId}`, {
      method: 'PUT',
      body: JSON.stringify({ paymentDate }),
    });
  }

  async cancelPayroll(payrollId: string, reason?: string): Promise<{ payroll: PayrollPeriod }> {
    return this.request(`/api/payroll/cancel/${payrollId}`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async deletePayroll(payrollId: string): Promise<void> {
    return this.request(`/api/payroll/period/${payrollId}`, {
      method: 'DELETE',
    });
  }

  // GENERACIÓN DE PDF
  async generatePayrollPDF(payrollId: string): Promise<{ pdfUrl: string; fileName: string; size: number; payrollId: string; employeeId: string; employeeName: string }> {
    return this.request(`/api/payroll/pdf/${payrollId}`);
  }

  // ARCHIVOS ADJUNTOS
  async uploadAttachment(payrollId: string, file: File, employeeId: string, category?: string, description?: string): Promise<PayrollAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('employeeId', employeeId);
    if (category) formData.append('category', category);
    if (description) formData.append('description', description);

    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${API_BASE_URL}/api/payroll/${payrollId}/attachments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || data.message || 'Error subiendo archivo');
    }

    return data.data;
  }

  async getAttachments(payrollId: string): Promise<PayrollAttachmentResponse> {
    return this.request(`/api/payroll/${payrollId}/attachments`);
  }

  async deleteAttachment(payrollId: string, attachmentId: string): Promise<void> {
    return this.request(`/api/payroll/${payrollId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  }

  // EDITAR NÓMINA
  async editPayroll(payrollId: string, configData: Partial<PayrollConfig>): Promise<{ payroll: PayrollPeriod; config: PayrollConfig }> {
    return this.request(`/api/payroll/${payrollId}`, {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  }

  // REGENERAR NÓMINA
  async regeneratePayroll(payrollId: string, recalculateExtras: boolean = true): Promise<PayrollGenerationResponse> {
    return this.request(`/api/payroll/${payrollId}/regenerate`, {
      method: 'POST',
      body: JSON.stringify({ recalculateExtras }),
    });
  }

  // ===== MÓDULO DE NÓMINA GENERAL =====

  // GESTIÓN DE PERÍODOS
  async createPayrollPeriod(periodData: {
    name: string;
    startDate: string;
    endDate: string;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    configurations: {
      calculateTaxes: boolean;
      includeOvertime: boolean;
      applyAbsenceDeductions: boolean;
      includeLoans: boolean;
    };
  }): Promise<PayrollPeriod> {
    return this.request('/api/payroll-periods', {
      method: 'POST',
      body: JSON.stringify(periodData),
    });
  }

  async getPayrollPeriods(options: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<{ periods: PayrollPeriod[]; total: number; pagination: any }> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = `/api/payroll-periods${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getPayrollPeriod(periodId: string): Promise<PayrollPeriod> {
    return this.request(`/api/payroll-periods/${periodId}`);
  }

  async getCurrentPayrollPeriod(): Promise<PayrollPeriod | null> {
    try {
      return await this.request('/api/payroll-periods/current');
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async updatePayrollPeriod(periodId: string, periodData: Partial<PayrollPeriod>): Promise<PayrollPeriod> {
    return this.request(`/api/payroll-periods/${periodId}`, {
      method: 'PUT',
      body: JSON.stringify(periodData),
    });
  }

  async deletePayrollPeriod(periodId: string): Promise<void> {
    return this.request(`/api/payroll-periods/${periodId}`, {
      method: 'DELETE',
    });
  }

  // PROCESAMIENTO MASIVO
  async processMassPayroll(periodId: string): Promise<{
    success: boolean;
    period: PayrollPeriod;
    summary: PayrollPeriod['summary'];
    processedCount: number;
    errorsCount: number;
    errors?: Array<{ employeeId: string; employeeName: string; error: string }>;
  }> {
    return this.request(`/api/payroll-periods/${periodId}/process`, {
      method: 'POST',
    });
  }

  async getPeriodEmployees(periodId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    status?: string;
  } = {}): Promise<PayrollPeriodResponse> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = `/api/payroll-periods/${periodId}/employees${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  // ESTADOS Y APROBACIONES
  async approvePeriod(periodId: string): Promise<PayrollPeriod> {
    return this.request(`/api/payroll-periods/${periodId}/approve`, {
      method: 'PUT',
    });
  }

  async markPeriodAsPaid(periodId: string): Promise<PayrollPeriod> {
    return this.request(`/api/payroll-periods/${periodId}/mark-paid`, {
      method: 'PUT',
    });
  }

  async closePeriod(periodId: string): Promise<PayrollPeriod> {
    return this.request(`/api/payroll-periods/${periodId}/close`, {
      method: 'PUT',
    });
  }

  async approveEmployeePayroll(periodId: string, employeeId: string): Promise<{ success: boolean }> {
    return this.request(`/api/payroll-periods/${periodId}/employees/${employeeId}/approve`, {
      method: 'PUT',
    });
  }

  async markEmployeeAsPaid(periodId: string, employeeId: string): Promise<{ success: boolean }> {
    return this.request(`/api/payroll-periods/${periodId}/employees/${employeeId}/mark-paid`, {
      method: 'PUT',
    });
  }

  // REPORTES Y EXPORTACIÓN
  async generatePeriodReport(periodId: string, format: 'pdf' | 'excel' = 'pdf'): Promise<{ reportUrl: string; fileName: string }> {
    return this.request(`/api/payroll-periods/${periodId}/reports/${format}`);
  }

  async exportPeriodData(periodId: string, format: 'excel' | 'csv' = 'excel'): Promise<{ exportUrl: string; fileName: string }> {
    return this.request(`/api/payroll-periods/${periodId}/export/${format}`);
  }

  // UTILIDADES
  calculateDatesByFrequency(frequency: string): { startDate: string; endDate: string } {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (frequency) {
      case 'daily':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'weekly':
        // Semana actual (lunes a domingo)
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajustar si es domingo
        startDate = new Date(today.setDate(diff));
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'biweekly':
        // Quincena actual
        if (today.getDate() <= 15) {
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 15);
        } else {
          startDate = new Date(today.getFullYear(), today.getMonth(), 16);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }
        break;
      case 'monthly':
      default:
        // Mes actual
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  calculateSalaryByFrequency(baseSalary: number, frequency: string): number {
    switch (frequency) {
      case 'daily':
        return baseSalary / 30; // Salario diario
      case 'weekly':
        return baseSalary / 4.33; // Salario semanal (52 semanas / 12 meses)
      case 'biweekly':
        return baseSalary / 2; // Salario quincenal
      case 'monthly':
      default:
        return baseSalary; // Salario mensual completo
    }
  }

  getFrequencyLabel(frequency: string): string {
    switch (frequency) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'biweekly': return 'Quincenal';
      case 'monthly': return 'Mensual';
      default: return frequency;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'calculated': return 'Calculado';
      case 'approved': return 'Aprobado';
      case 'paid': return 'Pagado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'calculated': return 'warning';
      case 'approved': return 'success';
      case 'paid': return 'info';
      case 'cancelled': return 'danger';
      default: return 'light';
    }
  }

  // Métodos para períodos de nómina general
  getPeriodStatusLabel(status: string): string {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'calculated': return 'Calculado';
      case 'approved': return 'Aprobado';
      case 'paid': return 'Pagado';
      case 'closed': return 'Cerrado';
      default: return status;
    }
  }

  getPeriodStatusColor(status: string): string {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'calculated': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  canProcessPeriod(status: string): boolean {
    return status === 'draft';
  }

  canApprovePeriod(status: string): boolean {
    return status === 'calculated';
  }

  canMarkAsPaid(status: string): boolean {
    return status === 'approved';
  }

  canClosePeriod(status: string): boolean {
    return status === 'paid';
  }
}

export const payrollApi = new PayrollApiService();
export default payrollApi;