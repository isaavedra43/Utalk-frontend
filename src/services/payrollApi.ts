// Servicio API para nómina individual - alineado con especificaciones del backend
const API_BASE_URL = '/api';

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

class PayrollApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
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
    return this.request(`/payroll/config/${employeeId}`, {
      method: 'POST',
      body: JSON.stringify(configData),
    });
  }

  async getPayrollConfig(employeeId: string): Promise<PayrollConfig | null> {
    try {
      const response = await this.request<{ config: PayrollConfig }>(`/payroll/config/${employeeId}`);
      return response.config;
    } catch (error) {
      // Si no hay configuración, devolver null en lugar de error
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async updatePayrollConfig(employeeId: string, configData: Partial<PayrollConfig>): Promise<{ config: PayrollConfig; previousConfig: PayrollConfig }> {
    return this.request(`/payroll/config/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  }

  // GENERACIÓN DE NÓMINA
  async generatePayroll(employeeId: string, options: { periodDate?: string; forceRegenerate?: boolean } = {}): Promise<PayrollGenerationResponse> {
    return this.request(`/payroll/generate/${employeeId}`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async getPendingExtras(employeeId: string, periodStart?: string, periodEnd?: string): Promise<PendingExtrasResponse> {
    const params = new URLSearchParams();
    if (periodStart) params.append('periodStart', periodStart);
    if (periodEnd) params.append('periodEnd', periodEnd);
    
    const queryString = params.toString();
    const endpoint = `/payroll/extras-pending/${employeeId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  // CONSULTA DE PERÍODOS
  async getPayrollPeriods(employeeId: string, filters: { limit?: number; year?: number; month?: number; status?: string } = {}): Promise<PayrollPeriodsResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = `/payroll/periods/${employeeId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getPayrollDetails(payrollId: string): Promise<PayrollDetailsResponse> {
    return this.request(`/payroll/period/${payrollId}/details`);
  }

  // GESTIÓN DE ESTADOS
  async approvePayroll(payrollId: string): Promise<{ payroll: PayrollPeriod }> {
    return this.request(`/payroll/approve/${payrollId}`, {
      method: 'PUT',
    });
  }

  async markAsPaid(payrollId: string, paymentDate?: string): Promise<{ payroll: PayrollPeriod }> {
    return this.request(`/payroll/pay/${payrollId}`, {
      method: 'PUT',
      body: JSON.stringify({ paymentDate }),
    });
  }

  async cancelPayroll(payrollId: string, reason?: string): Promise<{ payroll: PayrollPeriod }> {
    return this.request(`/payroll/cancel/${payrollId}`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async deletePayroll(payrollId: string): Promise<void> {
    return this.request(`/payroll/period/${payrollId}`, {
      method: 'DELETE',
    });
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
}

export const payrollApi = new PayrollApiService();
export default payrollApi;