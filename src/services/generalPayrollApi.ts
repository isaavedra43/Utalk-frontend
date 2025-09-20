import api from './api';

// Interfaces para tipos de datos
export interface PayrollPeriod {
  id: string;
  period: string;
  type: 'Mensual' | 'Semanal' | 'Quincenal';
  status: 'cerrado' | 'aprobado' | 'calculado' | 'pendiente';
  employees: number;
  estimatedCost: number;
  realCost?: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollMetrics {
  pendingOvertimeHours: number;
  periodIncidents: number;
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
  private baseUrl = '/api/payroll';

  // Obtener métricas generales de nómina
  async getGeneralMetrics(): Promise<PayrollMetrics> {
    try {
      const response = await api.get(`${this.baseUrl}/metrics`);
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo métricas generales:', error);
      throw error;
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
      const response = await api.get(`${this.baseUrl}/periods`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo períodos de nómina:', error);
      throw error;
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
}

export const generalPayrollApi = new GeneralPayrollApi();
export default generalPayrollApi;
