// ===================================================================
// SERVICIO DE API PARA EL MÓDULO DE NÓMINA GENERAL
// ===================================================================

import { apiConfig } from '../config/apiConfig';
import { 
  PayrollPeriod, 
  PayrollEmployee, 
  PayrollMovement, 
  PayrollAttachment,
  PayrollFilters,
  PayrollPagination,
  PayrollBulkOperation,
  PayrollExport,
  PayrollStats
} from '../types/payroll';

class PayrollService {
  private baseURL = `${apiConfig.baseURL}/api`;

  // ===================================================================
  // GESTIÓN DE PERÍODOS DE NÓMINA
  // ===================================================================

  /**
   * Obtener todos los períodos de nómina con paginación
   */
  async getPeriods(page = 1, limit = 20, filters?: { status?: string; frequency?: string }): Promise<{
    periods: PayrollPeriod[];
    pagination: PayrollPagination;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await fetch(`${this.baseURL}/payroll-periods?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener períodos: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Obtener período actual activo
   */
  async getCurrentPeriod(): Promise<PayrollPeriod | null> {
    const response = await fetch(`${this.baseURL}/payroll-periods/current`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error al obtener período actual: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Obtener período por ID
   */
  async getPeriodById(periodId: string): Promise<PayrollPeriod> {
    const response = await fetch(`${this.baseURL}/payroll-periods/${periodId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener período: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Crear nuevo período de nómina
   */
  async createPeriod(periodData: Partial<PayrollPeriod>): Promise<PayrollPeriod> {
    const response = await fetch(`${this.baseURL}/payroll-periods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(periodData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al crear período: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Actualizar período de nómina
   */
  async updatePeriod(periodId: string, periodData: Partial<PayrollPeriod>): Promise<PayrollPeriod> {
    const response = await fetch(`${this.baseURL}/payroll-periods/${periodId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(periodData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al actualizar período: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Eliminar período de nómina
   */
  async deletePeriod(periodId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/payroll-periods/${periodId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al eliminar período: ${response.statusText}`);
    }
  }

  // ===================================================================
  // PROCESAMIENTO DE NÓMINA
  // ===================================================================

  /**
   * Procesar nómina masiva para un período
   */
  async processPeriod(periodId: string): Promise<PayrollStats> {
    const response = await fetch(`${this.baseURL}/payroll-periods/${periodId}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al procesar período: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Aprobar período de nómina
   */
  async approvePeriod(periodId: string): Promise<PayrollPeriod> {
    const response = await fetch(`${this.baseURL}/payroll-periods/${periodId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al aprobar período: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Marcar período como pagado
   */
  async markPeriodAsPaid(periodId: string): Promise<PayrollPeriod> {
    const response = await fetch(`${this.baseURL}/payroll-periods/${periodId}/mark-paid`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al marcar período como pagado: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Cerrar período de nómina
   */
  async closePeriod(periodId: string): Promise<PayrollPeriod> {
    const response = await fetch(`${this.baseURL}/payroll-periods/${periodId}/close`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al cerrar período: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  // ===================================================================
  // GESTIÓN DE EMPLEADOS EN NÓMINA
  // ===================================================================

  /**
   * Obtener empleados de un período con sus nóminas
   */
  async getPeriodEmployees(
    periodId: string, 
    page = 1, 
    limit = 20, 
    filters?: PayrollFilters
  ): Promise<{
    period: PayrollPeriod;
    employees: Array<{
      employee: any;
      payroll: PayrollEmployee | null;
    }>;
    pagination: PayrollPagination;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.department && { department: filters.department }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.position && { position: filters.position })
    });

    const response = await fetch(`${this.baseURL}/payroll-periods/${periodId}/employees?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener empleados del período: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Obtener nómina individual por ID
   */
  async getPayrollById(payrollId: string): Promise<PayrollEmployee> {
    const response = await fetch(`${this.baseURL}/payroll/${payrollId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener nómina: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Actualizar nómina individual
   */
  async updatePayroll(payrollId: string, payrollData: Partial<PayrollEmployee>): Promise<PayrollEmployee> {
    const response = await fetch(`${this.baseURL}/payroll/${payrollId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(payrollData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al actualizar nómina: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Regenerar nómina individual
   */
  async regeneratePayroll(payrollId: string, options?: { recalculateExtras?: boolean }): Promise<PayrollEmployee> {
    const response = await fetch(`${this.baseURL}/payroll/${payrollId}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(options || {})
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al regenerar nómina: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Aprobar nómina individual
   */
  async approvePayroll(payrollId: string): Promise<PayrollEmployee> {
    const response = await fetch(`${this.baseURL}/payroll/${payrollId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al aprobar nómina: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  // ===================================================================
  // OPERACIONES MASIVAS
  // ===================================================================

  /**
   * Realizar operación masiva en múltiples nóminas
   */
  async bulkOperation(operation: PayrollBulkOperation): Promise<{
    success: boolean;
    processedCount: number;
    errors: Array<{ employeeId: string; error: string }>;
  }> {
    const response = await fetch(`${this.baseURL}/payroll/bulk-operation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(operation)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error en operación masiva: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  // ===================================================================
  // MOVIMIENTOS Y EXTRAS
  // ===================================================================

  /**
   * Obtener movimientos de un empleado
   */
  async getEmployeeMovements(
    employeeId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<PayrollMovement[]> {
    const params = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    });

    const response = await fetch(`${this.baseURL}/employees/${employeeId}/movements?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener movimientos: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Crear movimiento para empleado
   */
  async createMovement(movementData: Partial<PayrollMovement>): Promise<PayrollMovement> {
    const response = await fetch(`${this.baseURL}/payroll-movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(movementData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al crear movimiento: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  // ===================================================================
  // ARCHIVOS ADJUNTOS
  // ===================================================================

  /**
   * Subir archivo adjunto a nómina
   */
  async uploadAttachment(
    payrollId: string,
    file: File,
    metadata: {
      employeeId: string;
      category: string;
      description?: string;
    }
  ): Promise<PayrollAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('employeeId', metadata.employeeId);
    formData.append('category', metadata.category);
    if (metadata.description) {
      formData.append('description', metadata.description);
    }

    const response = await fetch(`${this.baseURL}/payroll/${payrollId}/attachments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al subir archivo: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Obtener archivos adjuntos de una nómina
   */
  async getAttachments(payrollId: string): Promise<PayrollAttachment[]> {
    const response = await fetch(`${this.baseURL}/payroll/${payrollId}/attachments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener archivos: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Eliminar archivo adjunto
   */
  async deleteAttachment(payrollId: string, attachmentId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/payroll/${payrollId}/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al eliminar archivo: ${response.statusText}`);
    }
  }

  // ===================================================================
  // EXPORTACIÓN Y REPORTES
  // ===================================================================

  /**
   * Exportar período de nómina
   */
  async exportPeriod(periodId: string, options: PayrollExport): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/payroll-periods/${periodId}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al exportar período: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Obtener estadísticas del período
   */
  async getPeriodStats(periodId: string): Promise<PayrollStats> {
    const response = await fetch(`${this.baseURL}/payroll-periods/${periodId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  // ===================================================================
  // UTILIDADES
  // ===================================================================

  /**
   * Obtener token de autenticación
   */
  private getAuthToken(): string {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }
    return token;
  }

  /**
   * Validar período antes de procesamiento
   */
  async validatePeriod(periodId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await fetch(`${this.baseURL}/payroll-periods/${periodId}/validate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error al validar período: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }
}

// Instancia singleton del servicio
export const payrollService = new PayrollService();
export default payrollService;
