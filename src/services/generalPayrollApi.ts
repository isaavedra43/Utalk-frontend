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
  createdBy: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
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
      
      // Generar más períodos para demostrar paginación
      const mockPeriods: PayrollPeriod[] = [];
      const agents = [
        { id: '1', name: 'Ana García López', role: 'Gerente de RH', avatar: '👩‍💼' },
        { id: '2', name: 'Carlos Mendoza Ruiz', role: 'Analista de Nómina', avatar: '👨‍💻' },
        { id: '3', name: 'María Elena Torres', role: 'Especialista en RH', avatar: '👩‍💼' },
        { id: '4', name: 'Roberto Silva', role: 'Coordinador de Nómina', avatar: '👨‍💼' },
        { id: '5', name: 'Laura Jiménez', role: 'Supervisora de RH', avatar: '👩‍💼' }
      ];
      
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      
      const statuses: Array<'cerrado' | 'aprobado' | 'calculado' | 'pendiente'> = ['cerrado', 'aprobado', 'calculado', 'pendiente'];
      
      // Generar períodos para los últimos 2 años
      for (let year = 2022; year <= 2024; year++) {
        for (let month = 0; month < 12; month++) {
          const periodId = `${year}-${month + 1}`;
          const isCurrentYear = year === 2024;
          const isCurrentMonth = month === 0 && year === 2024; // Enero 2024
          
          mockPeriods.push({
            id: periodId,
            period: `${months[month]} ${year}`,
            type: 'Mensual',
            status: isCurrentMonth ? 'pendiente' : statuses[Math.floor(Math.random() * statuses.length)],
            employees: 20 + Math.floor(Math.random() * 10),
            estimatedCost: 200000 + Math.floor(Math.random() * 100000),
            realCost: isCurrentMonth ? undefined : 200000 + Math.floor(Math.random() * 100000),
            startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
            endDate: `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`,
            createdAt: `${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00Z`,
            updatedAt: `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}T00:00:00Z`,
            createdBy: agents[Math.floor(Math.random() * agents.length)]
          });
        }
      }
      
      // Ordenar por fecha más reciente primero
      mockPeriods.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      // Aplicar filtros si se proporcionan
      let filteredPeriods = [...mockPeriods];
      
      if (params?.status) {
        filteredPeriods = filteredPeriods.filter(p => p.status === params.status);
      }
      
      if (params?.type) {
        filteredPeriods = filteredPeriods.filter(p => p.type === params.type);
      }
      
      if (params?.year) {
        filteredPeriods = filteredPeriods.filter(p => new Date(p.startDate).getFullYear() === params.year);
      }
      
      if (params?.month) {
        filteredPeriods = filteredPeriods.filter(p => new Date(p.startDate).getMonth() + 1 === params.month);
      }
      
      // Aplicar paginación
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPeriods = filteredPeriods.slice(startIndex, endIndex);
      
      return {
        periods: paginatedPeriods,
        pagination: {
          page,
          limit,
          total: filteredPeriods.length,
          totalPages: Math.ceil(filteredPeriods.length / limit)
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
