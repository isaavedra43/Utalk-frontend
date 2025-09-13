import api from './api';

// ==========================================
// INTERFACES PARA NÓMINA - ALINEADAS CON BACKEND
// ==========================================

export interface PayrollConfig {
  id: string;
  employeeId: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'hourly';
  baseSalary: number;
  sbc: number; // Salario Base de Cotización
  workingDaysPerWeek: number;
  workingHoursPerDay: number;
  overtimeRate: number;
  currency: string;
  paymentMethod: 'transfer' | 'cash' | 'check';
  bankAccount?: string;
  taxRegime: string;
  notes?: string;
  startDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollPeriod {
  id: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  frequency: string;
  baseSalary: number;
  calculatedSalary: number;
  grossSalary: number;
  totalPerceptions: number;
  totalDeductions: number;
  netSalary: number;
  status: 'calculated' | 'approved' | 'paid' | 'cancelled';
  year: number;
  month: number;
  weekNumber?: number;
  paymentDate?: string;
  paidBy?: string;
  paidAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancelReason?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollDetail {
  id: string;
  payrollPeriodId: string;
  type: 'perception' | 'deduction';
  concept: string;
  amount: number;
  description: string;
  category: string;
  isFixed: boolean;
  isTaxable: boolean;
  extraId?: string; // Referencia al extra si aplica
  createdAt: string;
}

export interface PayrollSummary {
  totalPeriods: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  averageNet: number;
  byStatus: {
    calculated: number;
    approved: number;
    paid: number;
    cancelled?: number;
  };
  byFrequency?: {
    daily?: number;
    weekly?: number;
    biweekly?: number;
    monthly?: number;
    hourly?: number;
  };
}

export interface PayrollStats {
  totalPeriods: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  averageGross: number;
  averageNet: number;
  byFrequency: Record<string, number>;
  byStatus: Record<string, number>;
  byMonth: Record<string, number>;
}

// ==========================================
// REQUESTS Y RESPONSES
// ==========================================

export interface CreatePayrollConfigRequest {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'hourly';
  baseSalary: number;
  sbc: number;
  workingDaysPerWeek?: number;
  workingHoursPerDay?: number;
  overtimeRate?: number;
  currency?: string;
  paymentMethod?: 'transfer' | 'cash' | 'check';
  bankAccount?: string;
  taxRegime?: string;
  notes?: string;
}

export interface GeneratePayrollRequest {
  periodDate?: string; // Fecha base para calcular período
  forceRegenerate?: boolean; // Forzar regeneración si ya existe
}

export interface AutoGeneratePayrollRequest {
  frequency?: string; // Generar por frecuencia
  employeeIds?: string[]; // Generar por empleados específicos
}

export interface PayrollConfigResponse {
  success: boolean;
  message: string;
  data: {
    config: PayrollConfig;
    employee: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface PayrollGenerationResponse {
  success: boolean;
  message: string;
  data: {
    payroll: PayrollPeriod;
    details: {
      perceptions: PayrollDetail[];
      deductions: PayrollDetail[];
      all: PayrollDetail[];
    };
    summary: {
      totalPerceptions: number;
      totalDeductions: number;
      perceptionsCount: number;
      deductionsCount: number;
    };
  };
}

export interface PayrollPeriodsResponse {
  success: boolean;
  data: {
    periods: PayrollPeriod[];
    summary: PayrollSummary;
    filters: Record<string, any>;
  };
}

export interface PayrollDetailsResponse {
  success: boolean;
  data: {
    payroll: PayrollPeriod;
    perceptions: PayrollDetail[];
    deductions: PayrollDetail[];
    summary: {
      totalPerceptions: number;
      totalDeductions: number;
      perceptionsCount: number;
      deductionsCount: number;
    };
  };
}

export interface PayrollStatsResponse {
  success: boolean;
  data: {
    stats: PayrollStats;
    filters: Record<string, any>;
  };
}

export interface AutoGenerationResult {
  employeeId: string;
  success: boolean;
  payrollId?: string;
  netSalary?: number;
  error?: string;
}

export interface AutoGenerationResponse {
  success: boolean;
  message: string;
  data: {
    results: AutoGenerationResult[];
    summary: {
      total: number;
      successful: number;
      failed: number;
      successRate: number;
    };
  };
}

// ==========================================
// SERVICIO API PARA NÓMINA
// ==========================================

class PayrollApiService {
  
  // ==========================================
  // CONFIGURACIÓN DE NÓMINA
  // ==========================================

  /**
   * Configurar nómina de empleado
   */
  async createPayrollConfig(employeeId: string, configData: CreatePayrollConfigRequest): Promise<PayrollConfigResponse> {
    try {
      console.log('🔧 Configurando nómina para empleado:', employeeId, configData);
      
      const response = await api.post(`/api/payroll/config/${employeeId}`, configData);
      
      console.log('✅ Configuración creada exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error configurando nómina:', error);
      throw new Error(error.response?.data?.message || 'Error configurando nómina');
    }
  }

  /**
   * Obtener configuración de nómina
   */
  async getPayrollConfig(employeeId: string): Promise<PayrollConfig | null> {
    try {
      console.log('📋 Obteniendo configuración de nómina para:', employeeId);
      
      const response = await api.get(`/api/payroll/config/${employeeId}`);
      
      if (response.data && response.data.success && response.data.data) {
        console.log('✅ Configuración obtenida:', response.data.data.config);
        return response.data.data.config;
      }
      
      return null;
    } catch (error: any) {
      console.log('⚠️ No hay configuración de nómina para este empleado');
      if (error.response?.status === 404) {
        return null; // No existe configuración
      }
      throw new Error(error.response?.data?.message || 'Error obteniendo configuración');
    }
  }

  /**
   * Actualizar configuración de nómina
   */
  async updatePayrollConfig(employeeId: string, updates: Partial<CreatePayrollConfigRequest>): Promise<PayrollConfigResponse> {
    try {
      console.log('🔄 Actualizando configuración de nómina:', employeeId, updates);
      
      const response = await api.put(`/api/payroll/config/${employeeId}`, updates);
      
      console.log('✅ Configuración actualizada exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error actualizando configuración:', error);
      throw new Error(error.response?.data?.message || 'Error actualizando configuración');
    }
  }

  // ==========================================
  // GENERACIÓN DE NÓMINA
  // ==========================================

  /**
   * Generar nómina individual
   */
  async generatePayroll(employeeId: string, requestData: GeneratePayrollRequest = {}): Promise<PayrollGenerationResponse> {
    try {
      console.log('💰 Generando nómina para empleado:', employeeId, requestData);
      
      const response = await api.post(`/api/payroll/generate/${employeeId}`, requestData);
      
      console.log('✅ Nómina generada exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error generando nómina:', error);
      throw new Error(error.response?.data?.message || 'Error generando nómina');
    }
  }

  /**
   * Generación automática masiva
   */
  async autoGeneratePayroll(requestData: AutoGeneratePayrollRequest): Promise<AutoGenerationResponse> {
    try {
      console.log('🤖 Iniciando generación automática:', requestData);
      
      const response = await api.post('/api/payroll/auto-generate', requestData);
      
      console.log('✅ Generación automática completada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en generación automática:', error);
      throw new Error(error.response?.data?.message || 'Error en generación automática');
    }
  }

  // ==========================================
  // CONSULTAS DE NÓMINA
  // ==========================================

  /**
   * Obtener períodos de nómina de empleado
   */
  async getPayrollPeriods(employeeId: string, params: {
    limit?: number;
    year?: number;
    month?: number;
    status?: string;
  } = {}): Promise<PayrollPeriodsResponse> {
    try {
      console.log('📊 Obteniendo períodos de nómina:', employeeId, params);
      
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await api.get(`/api/payroll/periods/${employeeId}?${searchParams.toString()}`);
      
      console.log('✅ Períodos obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo períodos:', error);
      throw new Error(error.response?.data?.message || 'Error obteniendo períodos de nómina');
    }
  }

  /**
   * Obtener detalles de período específico
   */
  async getPayrollDetails(payrollId: string): Promise<PayrollDetailsResponse> {
    try {
      console.log('📋 Obteniendo detalles del período:', payrollId);
      
      const response = await api.get(`/api/payroll/period/${payrollId}/details`);
      
      console.log('✅ Detalles obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo detalles:', error);
      throw new Error(error.response?.data?.message || 'Error obteniendo detalles del período');
    }
  }

  /**
   * Obtener períodos pendientes de pago
   */
  async getPendingPayrolls(params: { limit?: number } = {}): Promise<{
    success: boolean;
    data: {
      periods: Array<PayrollPeriod & { employee: { id: string; name: string; email: string; department: string } }>;
      summary: {
        totalPending: number;
        totalAmount: number;
        byStatus: Record<string, number>;
      };
      pagination: {
        total: number;
        shown: number;
        limit: number;
      };
    };
  }> {
    try {
      console.log('⏳ Obteniendo períodos pendientes:', params);
      
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await api.get(`/api/payroll/pending?${searchParams.toString()}`);
      
      console.log('✅ Períodos pendientes obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo períodos pendientes:', error);
      throw new Error(error.response?.data?.message || 'Error obteniendo períodos pendientes');
    }
  }

  // ==========================================
  // GESTIÓN DE ESTADOS
  // ==========================================

  /**
   * Aprobar período de nómina
   */
  async approvePayroll(payrollId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      payroll: Partial<PayrollPeriod>;
    };
  }> {
    try {
      console.log('✅ Aprobando período:', payrollId);
      
      const response = await api.put(`/api/payroll/approve/${payrollId}`);
      
      console.log('✅ Período aprobado exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error aprobando período:', error);
      throw new Error(error.response?.data?.message || 'Error aprobando período');
    }
  }

  /**
   * Marcar período como pagado
   */
  async markAsPaid(payrollId: string, paymentDate?: string): Promise<{
    success: boolean;
    message: string;
    data: {
      payroll: Partial<PayrollPeriod>;
    };
  }> {
    try {
      console.log('💰 Marcando como pagado:', payrollId, paymentDate);
      
      const requestBody = paymentDate ? { paymentDate } : {};
      const response = await api.put(`/api/payroll/pay/${payrollId}`, requestBody);
      
      console.log('✅ Período marcado como pagado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error marcando como pagado:', error);
      throw new Error(error.response?.data?.message || 'Error marcando como pagado');
    }
  }

  /**
   * Cancelar período de nómina
   */
  async cancelPayroll(payrollId: string, reason: string): Promise<{
    success: boolean;
    message: string;
    data: {
      payroll: Partial<PayrollPeriod>;
    };
  }> {
    try {
      console.log('❌ Cancelando período:', payrollId, reason);
      
      const response = await api.put(`/api/payroll/cancel/${payrollId}`, { reason });
      
      console.log('✅ Período cancelado exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error cancelando período:', error);
      throw new Error(error.response?.data?.message || 'Error cancelando período');
    }
  }

  /**
   * Eliminar período de nómina
   */
  async deletePayroll(payrollId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('🗑️ Eliminando período:', payrollId);
      
      const response = await api.delete(`/api/payroll/period/${payrollId}`);
      
      console.log('✅ Período eliminado exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error eliminando período:', error);
      throw new Error(error.response?.data?.message || 'Error eliminando período');
    }
  }

  // ==========================================
  // ESTADÍSTICAS Y REPORTES
  // ==========================================

  /**
   * Obtener estadísticas de nómina
   */
  async getPayrollStats(params: {
    year?: number;
    month?: number;
    employeeId?: string;
  } = {}): Promise<PayrollStatsResponse> {
    try {
      console.log('📈 Obteniendo estadísticas de nómina:', params);
      
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await api.get(`/api/payroll/stats?${searchParams.toString()}`);
      
      console.log('✅ Estadísticas obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw new Error(error.response?.data?.message || 'Error obteniendo estadísticas');
    }
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  /**
   * Calcular salario por frecuencia
   */
  calculateSalaryByFrequency(baseSalary: number, frequency: string): number {
    switch (frequency) {
      case 'daily':
        return baseSalary / 30; // 30 días por mes
      case 'weekly':
        return baseSalary / 4; // 4 semanas por mes
      case 'biweekly':
        return baseSalary / 2; // 2 quincenas por mes
      case 'monthly':
        return baseSalary;
      case 'hourly':
        return baseSalary / 160; // 160 horas por mes (8h x 20 días)
      default:
        return baseSalary;
    }
  }

  /**
   * Obtener etiqueta de frecuencia
   */
  getFrequencyLabel(frequency: string): string {
    switch (frequency) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'biweekly': return 'Quincenal';
      case 'monthly': return 'Mensual';
      case 'hourly': return 'Por Hora';
      default: return 'Mensual';
    }
  }

  /**
   * Calcular fechas por frecuencia
   */
  calculateDatesByFrequency(frequency: string, baseDate?: Date): { startDate: string; endDate: string } {
    const today = baseDate || new Date();
    let startDate: Date;
    let endDate: Date;

    switch (frequency) {
      case 'daily':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'weekly':
        const dayOfWeek = today.getDay();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek + 1); // Lunes
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Domingo
        break;
      case 'biweekly':
        const dayOfMonth = today.getDate();
        if (dayOfMonth <= 15) {
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 15);
        } else {
          startDate = new Date(today.getFullYear(), today.getMonth(), 16);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }
        break;
      case 'monthly':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'hourly':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }
}

export const payrollApi = new PayrollApiService();
