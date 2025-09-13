/**
 * API Service para Nómina General
 * Servicios específicos para el manejo de períodos de nómina y procesamiento masivo
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://utalk-backend-production.up.railway.app';

class PayrollGeneralApiService {
  private getAuthToken(): string {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado. Por favor, inicia sesión nuevamente.');
    }
    return token;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // ==========================================
  // GESTIÓN DE PERÍODOS DE NÓMINA
  // ==========================================

  /**
   * Obtener el período de nómina actual
   */
  async getCurrentPeriod(): Promise<any> {
    try {
      const data = await this.request('/api/payroll-periods/current');
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error obteniendo período actual:', error);
      return null;
    }
  }

  /**
   * Obtener todos los períodos de nómina
   */
  async getAllPeriods(page: number = 1, limit: number = 20): Promise<any> {
    const data = await this.request(`/api/payroll-periods?page=${page}&limit=${limit}`);
    return data.success ? data.data : { periods: [], pagination: {} };
  }

  /**
   * Crear un nuevo período de nómina
   */
  async createPeriod(periodData: {
    name: string;
    startDate: string;
    endDate: string;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    configurations?: {
      calculateTaxes?: boolean;
      includeOvertime?: boolean;
      applyAbsenceDeductions?: boolean;
      includeLoans?: boolean;
    };
  }): Promise<any> {
    const data = await this.request('/api/payroll-periods', {
      method: 'POST',
      body: JSON.stringify(periodData),
    });
    return data.success ? data.data : null;
  }

  // ==========================================
  // PROCESAMIENTO MASIVO DE NÓMINA
  // ==========================================

  /**
   * Procesar nómina masiva del período
   * Asigna empleados y calcula nóminas automáticamente
   */
  async processPeriodPayroll(periodId: string, options: {
    assignAllEmployees?: boolean;
    calculatePayroll?: boolean;
    employeeIds?: string[];
  } = {}): Promise<any> {
    const data = await this.request(`/api/payroll-periods/${periodId}/process`, {
      method: 'POST',
      body: JSON.stringify({
        assignAllEmployees: options.assignAllEmployees ?? true,
        calculatePayroll: options.calculatePayroll ?? true,
        employeeIds: options.employeeIds,
      }),
    });
    return data.success ? data.data : null;
  }

  /**
   * Aprobar período de nómina
   */
  async approvePeriod(periodId: string): Promise<any> {
    const data = await this.request(`/api/payroll-periods/${periodId}/approve`, {
      method: 'PUT',
    });
    return data.success ? data.data : null;
  }

  /**
   * Marcar período como pagado
   */
  async markPeriodAsPaid(periodId: string): Promise<any> {
    const data = await this.request(`/api/payroll-periods/${periodId}/pay`, {
      method: 'PUT',
    });
    return data.success ? data.data : null;
  }

  /**
   * Cerrar período de nómina
   */
  async closePeriod(periodId: string): Promise<any> {
    const data = await this.request(`/api/payroll-periods/${periodId}/close`, {
      method: 'PUT',
    });
    return data.success ? data.data : null;
  }

  // ==========================================
  // EMPLEADOS DEL PERÍODO
  // ==========================================

  /**
   * Obtener empleados asignados a un período específico
   */
  async getPeriodEmployees(periodId: string): Promise<any[]> {
    try {
      const data = await this.request(`/api/payroll-periods/${periodId}/employees`);
      return data.success ? data.data.employees || [] : [];
    } catch (error) {
      console.error('Error obteniendo empleados del período:', error);
      return [];
    }
  }

  /**
   * Asignar empleados específicos a un período
   */
  async assignEmployeesToPeriod(periodId: string, employeeIds: string[]): Promise<any> {
    const data = await this.request(`/api/payroll-periods/${periodId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ employeeIds }),
    });
    return data.success ? data.data : null;
  }

  /**
   * Remover empleados de un período
   */
  async removeEmployeesFromPeriod(periodId: string, employeeIds: string[]): Promise<any> {
    const data = await this.request(`/api/payroll-periods/${periodId}/remove`, {
      method: 'POST',
      body: JSON.stringify({ employeeIds }),
    });
    return data.success ? data.data : null;
  }

  // ==========================================
  // ESTADÍSTICAS Y REPORTES
  // ==========================================

  /**
   * Obtener estadísticas del período
   */
  async getPeriodStats(periodId: string): Promise<any> {
    try {
      const data = await this.request(`/api/payroll-periods/${periodId}/stats`);
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error obteniendo estadísticas del período:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas generales de nómina
   */
  async getGeneralStats(): Promise<any> {
    try {
      const data = await this.request('/api/payroll/stats');
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error obteniendo estadísticas generales:', error);
      return null;
    }
  }

  /**
   * Generar reporte del período
   */
  async generatePeriodReport(periodId: string, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/payroll-periods/${periodId}/report?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.blob();
  }

  // ==========================================
  // EMPLEADOS GENERALES
  // ==========================================

  /**
   * Obtener todos los empleados disponibles para asignar
   */
  async getAllEmployees(page: number = 1, limit: number = 100): Promise<any> {
    try {
      const data = await this.request(`/api/employees?page=${page}&limit=${limit}&status=active`);
      return data.success ? data.data : { employees: [], pagination: {} };
    } catch (error) {
      console.error('Error obteniendo empleados:', error);
      return { employees: [], pagination: {} };
    }
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  /**
   * Validar configuración de período
   */
  validatePeriodData(periodData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!periodData.name?.trim()) {
      errors.push('El nombre del período es requerido');
    }

    if (!periodData.startDate) {
      errors.push('La fecha de inicio es requerida');
    }

    if (!periodData.endDate) {
      errors.push('La fecha de fin es requerida');
    }

    if (periodData.startDate && periodData.endDate) {
      const start = new Date(periodData.startDate);
      const end = new Date(periodData.endDate);
      
      if (start >= end) {
        errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }

    if (!['weekly', 'biweekly', 'monthly'].includes(periodData.frequency)) {
      errors.push('La frecuencia debe ser semanal, quincenal o mensual');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcular duración del período en días
   */
  calculatePeriodDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Formatear moneda mexicana
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }
}

export const payrollGeneralApi = new PayrollGeneralApiService();
export default payrollGeneralApi;
