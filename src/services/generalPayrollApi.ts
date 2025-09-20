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
      // Usar datos mock para desarrollo
      console.log('📊 Usando datos mock para métricas generales');
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        pendingOvertimeHours: 125,
        periodIncidents: 18,
        totalEmployees: 25,
        activePeriods: 3,
        totalCost: 750000
      };
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
      // Usar datos mock para desarrollo
      console.log('📅 Usando datos mock para períodos de nómina');
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockPeriods: PayrollPeriod[] = [
        {
          id: '1',
          period: 'Enero 2024',
          type: 'Mensual',
          status: 'pendiente',
          employees: 25,
          estimatedCost: 250000.00,
          realCost: 0,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          period: 'Diciembre 2023',
          type: 'Mensual',
          status: 'cerrado',
          employees: 25,
          estimatedCost: 240000.00,
          realCost: 245000.50,
          startDate: '2023-12-01',
          endDate: '2023-12-31',
          createdAt: '2023-12-01T00:00:00Z',
          updatedAt: '2023-12-31T00:00:00Z'
        },
        {
          id: '3',
          period: 'Noviembre 2023',
          type: 'Mensual',
          status: 'aprobado',
          employees: 25,
          estimatedCost: 235000.00,
          realCost: 238000.00,
          startDate: '2023-11-01',
          endDate: '2023-11-30',
          createdAt: '2023-11-01T00:00:00Z',
          updatedAt: '2023-11-30T00:00:00Z'
        },
        {
          id: '4',
          period: 'Octubre 2023',
          type: 'Mensual',
          status: 'calculado',
          employees: 24,
          estimatedCost: 230000.00,
          realCost: 232500.00,
          startDate: '2023-10-01',
          endDate: '2023-10-31',
          createdAt: '2023-10-01T00:00:00Z',
          updatedAt: '2023-10-31T00:00:00Z'
        }
      ];
      
      return {
        periods: mockPeriods,
        pagination: {
          page: 1,
          limit: 10,
          total: mockPeriods.length,
          totalPages: 1
        }
      };
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
