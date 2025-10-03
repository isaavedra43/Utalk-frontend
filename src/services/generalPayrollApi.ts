import api from './api';

// Interfaces para tipos de datos - ALINEADAS CON BACKEND IMPLEMENTADO
export interface GeneralPayroll {
  id: string;
  folio: string;
  period: {
    startDate: string;
    endDate: string;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  };
  status: 'draft' | 'calculated' | 'approved' | 'closed';
  employees: GeneralPayrollEmployee[];
  totals: {
    totalEmployees: number;
    totalGrossSalary: number;
    totalDeductions: number;
    totalNetSalary: number;
    totalOvertime: number;
    totalBonuses: number;
    averageSalary: number;
    totalTaxes: number;
  };
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  closedBy?: string;
  closedAt?: string;
  notes?: string;
}

export interface GeneralPayrollEmployee {
  id: string;
  employeeId: string;
  employee: {
    id: string;
    name: string;
    position: string;
    department: string;
    code: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  // Salarios actuales
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  taxes: number;
  grossSalary: number;
  netSalary: number;
  
  // Salarios originales (antes de ajustes)
  originalSalary?: number;
  originalOvertime?: number;
  originalBonuses?: number;
  originalDeductions?: number;
  originalTaxes?: number;
  originalNetSalary?: number;
  
  // Salarios finales (después de ajustes)
  finalSalary?: number;
  finalDeductions?: number;
  finalNetSalary?: number;
  
  // Estados y metadatos
  status: 'pending' | 'approved' | 'paid';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentMethod?: 'cash' | 'deposit' | 'check' | 'transfer' | 'other';
  receiptStatus?: 'pending' | 'uploaded';
  receiptUrl?: string;
  receiptUploadedAt?: string;
  notes?: string;
  faltas?: number;
  updatedAt?: string;
  
  // Referencias
  individualPayrollId?: string;
  adjustments: PayrollAdjustment[];
  pendingExtras?: Record<string, unknown>[];
}

export interface PayrollAdjustment {
  id: string;
  type: 'bonus' | 'deduction' | 'overtime_adjustment' | 'salary_adjustment';
  concept: string;
  amount: number;
  reason: string;
  appliedBy: string;
  appliedAt: string;
  status: 'active' | 'cancelled';
}

// Interfaces para frontend (compatibilidad)
export interface PayrollPeriod {
  id: string;
  period: string;
  type: 'Mensual' | 'Semanal' | 'Quincenal';
  status: 'Cerrado' | 'Aprobado' | 'Calculado' | 'Pendiente';
  employees: number;
  estimatedCost: number;
  realCost?: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
}

export interface PayrollMetrics {
  totalEmployees: number;
  activePeriods: number;
  totalCost: number;
}

export interface PayrollRunRequest {
  periodId: string;
  employeeIds?: string[];
  includeExtras?: boolean;
  includeDeductions?: boolean;
}

export interface PayrollRunResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  message: string;
  estimatedTime?: number;
}

export interface PayrollReport {
  id: string;
  periodId: string;
  type: 'summary' | 'detailed' | 'tax' | 'employee';
  format: 'pdf' | 'excel' | 'csv';
  url: string;
  generatedAt: string;
}

class GeneralPayrollApi {
  private baseUrl = '/api/payroll/general';

  // Funciones helper para mapear datos
  private formatPeriodLabel(period: { startDate: string; endDate: string; frequency: string }): string {
    const start = new Date(period.startDate);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const end = new Date(period.endDate);
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    if (period.frequency === 'monthly') {
      return `${monthNames[start.getMonth()]} ${start.getFullYear()} (${this.formatDate(period.startDate)} - ${this.formatDate(period.endDate)})`;
    } else if (period.frequency === 'weekly') {
      return `Semana ${this.formatDate(period.startDate)} - ${this.formatDate(period.endDate)}`;
    } else {
      return `Quincena ${this.formatDate(period.startDate)} - ${this.formatDate(period.endDate)}`;
    }
  }

  private mapFrequencyToType(frequency: string): 'Mensual' | 'Semanal' | 'Quincenal' {
    switch (frequency) {
      case 'monthly': return 'Mensual';
      case 'weekly': return 'Semanal';
      case 'biweekly': return 'Quincenal';
      default: return 'Mensual';
    }
  }

  private mapStatusToFrontend(status: string): 'Cerrado' | 'Aprobado' | 'Calculado' | 'Pendiente' {
    switch (status) {
      case 'closed': return 'Cerrado';
      case 'approved': return 'Aprobado';
      case 'calculated': return 'Calculado';
      case 'draft': return 'Pendiente';
      default: return 'Pendiente';
    }
  }

  private extractUserName(userId: string): string {
    // Extraer nombre del ID de usuario o usar valor por defecto
    return userId.includes('@') ? userId.split('@')[0] : 'Usuario';
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Obtener métricas generales de nómina
  async getGeneralMetrics(): Promise<PayrollMetrics> {
    try {
      console.log('📊 Obteniendo métricas generales del backend...');
      
      const response = await api.get(`${this.baseUrl}/stats`);
      
      // Manejar respuesta del backend
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error obteniendo métricas generales:', error);
      throw error; // No usar fallback, dejar que el error se propague
    }
  }

  // Obtener todos los períodos de nómina
  async getPayrollPeriods(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    year?: number;
    month?: number;
  }): Promise<{
    periods: PayrollPeriod[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      console.log('📅 Obteniendo períodos de nómina del backend...');
      
      const response = await api.get(this.baseUrl, { params });
      
      // Manejar respuesta del backend
      if (response.data && response.data.success && response.data.data) {
        const backendData = response.data.data;
        
        // Convertir datos del backend al formato esperado por el frontend
        const periods: PayrollPeriod[] = backendData.payrolls.map((payroll: GeneralPayroll) => ({
          id: payroll.id,
          period: this.formatPeriodLabel(payroll.period),
          type: this.mapFrequencyToType(payroll.period.frequency),
          status: this.mapStatusToFrontend(payroll.status),
          employees: payroll.totals.totalEmployees,
          estimatedCost: payroll.totals.totalGrossSalary,
          realCost: payroll.status === 'closed' ? payroll.totals.totalNetSalary : undefined,
          startDate: payroll.period.startDate,
          endDate: payroll.period.endDate,
          createdAt: payroll.createdAt,
          updatedAt: payroll.createdAt, // Backend no tiene updatedAt separado
          createdBy: {
            id: payroll.createdBy,
            name: this.extractUserName(payroll.createdBy),
            role: 'Coordinador de Nómina',
            avatar: '👨‍💼'
          }
        }));
        
        return {
          periods,
          pagination: backendData.pagination || {
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: periods.length,
            totalPages: Math.ceil(periods.length / (params?.limit || 10))
          }
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error obteniendo períodos de nómina:', error);
      throw error; // No usar fallback, dejar que el error se propague
    }
  }

  // Crear nuevo período de nómina
  async createPayrollPeriod(data: {
    startDate: string;
    endDate: string;
    type: 'Mensual' | 'Semanal' | 'Quincenal';
    description?: string;
  }): Promise<PayrollPeriod> {
    try {
      const response = await api.post(`${this.baseUrl}/periods`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creando período de nómina:', error);
      throw error;
    }
  }

  // Iniciar proceso de payroll run
  async startPayrollRun(data: PayrollRunRequest): Promise<PayrollRunResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/run`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error iniciando payroll run:', error);
      throw error;
    }
  }

  // Obtener estado del payroll run
  async getPayrollRunStatus(runId: string): Promise<PayrollRunResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/run/${runId}/status`);
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo estado del payroll run:', error);
      throw error;
    }
  }

  // Aprobar período de nómina
  async approvePayrollPeriod(periodId: string, data?: {
    notes?: string;
    approvedBy?: string;
  }): Promise<PayrollPeriod> {
    try {
      const response = await api.post(`${this.baseUrl}/periods/${periodId}/approve`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error aprobando período de nómina:', error);
      throw error;
    }
  }

  // Cerrar período de nómina
  async closePayrollPeriod(periodId: string, data?: {
    notes?: string;
    closedBy?: string;
  }): Promise<PayrollPeriod> {
    try {
      const response = await api.post(`${this.baseUrl}/periods/${periodId}/close`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error cerrando período de nómina:', error);
      throw error;
    }
  }

  // Generar reporte de nómina
  async generatePayrollReport(periodId: string, options: {
    type: 'summary' | 'detailed' | 'tax' | 'employee';
    format: 'pdf' | 'excel' | 'csv';
    employeeIds?: string[];
  }): Promise<PayrollReport> {
    try {
      const response = await api.post(`${this.baseUrl}/periods/${periodId}/reports`, options);
      return response.data.data;
    } catch (error) {
      console.error('Error generando reporte de nómina:', error);
      throw error;
    }
  }

  // Descargar reporte
  async downloadPayrollReport(reportId: string): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error descargando reporte:', error);
      throw error;
    }
  }

  // Obtener horas extra pendientes
  async getPendingOvertimeHours(): Promise<{
    totalHours: number;
    employees: Array<{
      id: string;
      name: string;
      hours: number;
      period: string;
    }>;
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/overtime/pending`);
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo horas extra pendientes:', error);
      throw error;
    }
  }

  // Obtener incidencias del período
  async getPeriodIncidents(periodId?: string): Promise<{
    totalIncidents: number;
    incidents: Array<{
      id: string;
      employeeId: string;
      employeeName: string;
      type: string;
      description: string;
      date: string;
      status: string;
    }>;
  }> {
    try {
      const params = periodId ? { periodId } : {};
      const response = await api.get(`${this.baseUrl}/incidents`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo incidencias del período:', error);
      throw error;
    }
  }

  // Obtener resumen de costos
  async getCostSummary(params?: {
    periodId?: string;
    year?: number;
    month?: number;
  }): Promise<{
    estimatedCost: number;
    realCost: number;
    difference: number;
    breakdown: {
      salaries: number;
      overtime: number;
      bonuses: number;
      deductions: number;
      taxes: number;
    };
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/costs/summary`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo resumen de costos:', error);
      throw error;
    }
  }

  // Exportar datos de nómina
  async exportPayrollData(params: {
    periodId?: string;
    format: 'excel' | 'csv';
    includeDetails?: boolean;
    employeeIds?: string[];
  }): Promise<Blob> {
    try {
      const response = await api.post(`${this.baseUrl}/export`, params, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exportando datos de nómina:', error);
      throw error;
    }
  }

  // ===== MÉTODOS PRINCIPALES DEL BACKEND IMPLEMENTADO =====

  // Crear nómina general
  async createGeneralPayroll(data: {
    startDate: string;
    endDate: string;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    includeEmployees: string[];
  }): Promise<string> {
    try {
      console.log('🆕 Creando nómina general...', data);
      
      // Convertir frequency a type según lo que espera el backend
      const typeMapping = {
        'weekly': 'weekly',
        'biweekly': 'biweekly', 
        'monthly': 'monthly'
      };
      
      const requestData = {
        period: {
          type: typeMapping[data.frequency],
          startDate: data.startDate,
          endDate: data.endDate,
          label: `${data.frequency === 'weekly' ? 'Semana' : data.frequency === 'biweekly' ? 'Quincena' : 'Mes'} del ${new Date(data.startDate).getDate()}/${new Date(data.startDate).getMonth() + 1}/${new Date(data.startDate).getFullYear()}`
        },
        includeEmployees: data.includeEmployees,
        options: {
          autoCalculate: true,
          includeExtras: true,
          includeBonuses: true
        }
      };
      
      const response = await api.post(this.baseUrl, requestData);
      
      if (response.data && response.data.success && response.data.data) {
        console.log('✅ Nómina general creada exitosamente con ID:', response.data.data.id);
        return response.data.data.id; // Devolver solo el ID real del backend
      }
      
      throw new Error('No se pudo obtener el ID de la nómina creada');
    } catch (error) {
      console.error('Error creando nómina general:', error);
      throw error;
    }
  }

  // Obtener nómina general específica
  async getGeneralPayroll(id: string): Promise<GeneralPayroll> {
    try {
      console.log('🔍 Obteniendo nómina general:', id);
      
      const response = await api.get(`${this.baseUrl}/${id}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error obteniendo nómina general:', error);
      throw error;
    }
  }

  // Simular cálculos de nómina
  async simulateGeneralPayroll(periodData: {
    startDate: string;
    endDate: string;
    type: string;
    label: string;
  }): Promise<PayrollSimulation> {
    try {
      console.log('🔄 Simulando nómina general...', periodData);
      
      const requestData = {
        period: {
          type: periodData.type,
          startDate: periodData.startDate,
          endDate: periodData.endDate,
          label: periodData.label
        },
        scope: {
          allEmployees: true,
          employeeIds: []
        },
        options: {
          includeExtras: true,
          includeBonuses: true,
          includeAbsencesAndLates: true,
          currency: "MXN",
          roundingMode: "HALF_UP"
        }
      };
      
      const response = await api.post('/api/payroll/simulate', requestData);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error simulando nómina general:', error);
      throw error;
    }
  }

  // Aplicar ajuste a empleado
  async applyEmployeeAdjustment(payrollId: string, employeeId: string, adjustment: {
    type: 'bonus' | 'deduction' | 'overtime_adjustment' | 'salary_adjustment';
    concept: string;
    amount: number;
    reason: string;
  }): Promise<GeneralPayroll> {
    try {
      console.log('⚖️ Aplicando ajuste a empleado:', { payrollId, employeeId, adjustment });
      
      const response = await api.put(`${this.baseUrl}/${payrollId}/employee/${employeeId}/adjust`, adjustment);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error aplicando ajuste:', error);
      throw error;
    }
  }

  // Aprobar empleado específico
  async approveEmployee(payrollId: string, employeeId: string): Promise<GeneralPayroll> {
    try {
      console.log('✅ Aprobando empleado:', { payrollId, employeeId });
      
      const response = await api.post(`${this.baseUrl}/${payrollId}/employee/${employeeId}/approve`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error aprobando empleado:', error);
      throw error;
    }
  }

  // Aprobar nómina general completa
  async approveGeneralPayroll(id: string): Promise<GeneralPayroll> {
    try {
      console.log('✅ Aprobando nómina general:', id);
      
      const response = await api.post(`${this.baseUrl}/${id}/approve`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error aprobando nómina general:', error);
      throw error;
    }
  }

  // Cerrar nómina general y generar individuales
  async closeGeneralPayroll(id: string, notes?: string): Promise<{
    generalPayroll: GeneralPayroll;
    individualPayrolls: Record<string, unknown>[];
    message: string;
  }> {
    try {
      console.log('🔒 Cerrando nómina general y generando individuales:', id);
      
      const response = await api.post(`${this.baseUrl}/${id}/close`, { notes });
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error cerrando nómina general:', error);
      throw error;
    }
  }

  // Obtener empleados disponibles para nómina
  async getAvailableEmployees(startDate?: string, endDate?: string): Promise<{
    employees: Record<string, unknown>[];
    total: number;
  }> {
    try {
      console.log('👥 Obteniendo empleados disponibles...');
      
      const params = startDate && endDate ? { startDate, endDate } : {};
      const response = await api.get(`${this.baseUrl}/available-employees`, { params });
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error obteniendo empleados disponibles:', error);
      throw error;
    }
  }

  // Obtener datos para aprobación
  async getApprovalData(id: string): Promise<{
    totals: {
      totalEmployees: number;
      pending: number;
      approved: number;
      totalAdjustments: number;
    };
    employees: GeneralPayrollEmployee[];
  }> {
    try {
      console.log('📋 Obteniendo datos para aprobación:', id);
      
      const response = await api.get(`${this.baseUrl}/${id}/approval`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error obteniendo datos de aprobación:', error);
      throw error;
    }
  }

  // Obtener nóminas individuales generadas
  async getIndividualPayrolls(id: string): Promise<Record<string, unknown>[]> {
    try {
      console.log('📄 Obteniendo nóminas individuales generadas:', id);
      
      const response = await api.get(`${this.baseUrl}/${id}/individual-payrolls`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.individualPayrolls || [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error obteniendo nóminas individuales:', error);
      throw error;
    }
  }

  // Marcar empleado como pagado
  async markEmployeeAsPaid(payrollId: string, employeeId: string): Promise<GeneralPayroll> {
    try {
      console.log('💰 Marcando empleado como pagado:', { payrollId, employeeId });
      
      const response = await api.post(`${this.baseUrl}/${payrollId}/employee/${employeeId}/mark-paid`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error marcando empleado como pagado:', error);
      throw error;
    }
  }

  // ===================================================================
  // FUNCIONES PARA MANEJO DE IMPUESTOS
  // ===================================================================

  /**
   * Toggle global de impuestos para toda la nómina
   */
  async toggleGlobalTaxes(payrollId: string, taxesEnabled: boolean): Promise<GeneralPayroll> {
    try {
      console.log(`🔄 ${taxesEnabled ? 'Habilitando' : 'Deshabilitando'} impuestos globales para nómina:`, payrollId);
      
      const response = await api.put(`${this.baseUrl}/${payrollId}/taxes/global`, {
        taxesEnabled
      });
      
      if (response.data && response.data.success && response.data.data) {
        console.log(`✅ Impuestos globales ${taxesEnabled ? 'habilitados' : 'deshabilitados'} exitosamente`);
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado global de impuestos:', error);
      throw error;
    }
  }

  /**
   * Toggle individual de impuestos para un empleado específico
   */
  async toggleEmployeeTaxes(payrollId: string, employeeId: string, taxesEnabled: boolean): Promise<GeneralPayroll> {
    try {
      console.log(`🔄 ${taxesEnabled ? 'Habilitando' : 'Deshabilitando'} impuestos para empleado:`, { payrollId, employeeId });
      
      const response = await api.put(`${this.baseUrl}/${payrollId}/employee/${employeeId}/taxes`, {
        taxesEnabled
      });
      
      if (response.data && response.data.success && response.data.data) {
        console.log(`✅ Impuestos para empleado ${taxesEnabled ? 'habilitados' : 'deshabilitados'} exitosamente`);
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado de impuestos del empleado:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración actual de impuestos para una nómina
   */
  async getTaxesConfiguration(payrollId: string): Promise<{
    globalTaxesEnabled: boolean;
    employeeOverrides: Record<string, boolean>;
  }> {
    try {
      console.log('📋 Obteniendo configuración de impuestos para nómina:', payrollId);
      
      const response = await api.get(`${this.baseUrl}/${payrollId}/taxes/configuration`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      // Fallback si el endpoint no existe aún
      return {
        globalTaxesEnabled: false,
        employeeOverrides: {}
      };
    } catch (error) {
      console.error('Error obteniendo configuración de impuestos:', error);
      // Fallback en caso de error
      return {
        globalTaxesEnabled: false,
        employeeOverrides: {}
      };
    }
  }
}

export const generalPayrollApi = new GeneralPayrollApi();
export default generalPayrollApi;
