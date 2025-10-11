// ============================================================================
// SERVICIO DE ASISTENCIA - CON DATOS REALES DEL BACKEND
// ============================================================================

import {
  AttendanceReport,
  AttendanceRecord,
  EmployeeAttendance,
  AttendanceFilters,
  AttendanceStats,
  CreateAttendanceReportRequest,
  AttendanceReportResponse,
  AttendanceListResponse,
  AttendanceDetailResponse,
  ApprovalRequest,
  ApprovalResponse,
  AttendancePermissions,
  QuickReportResponse
} from './types';
import { api } from '@/config/api';

class AttendanceService {
  private baseEndpoint = '/api/attendance';

  private async makeRequest<T>(endpoint: string, options: any = {}): Promise<T> {
    try {
      const response = await api({
        url: `${this.baseEndpoint}${endpoint}`,
        ...options
      });
      
      // El backend devuelve la estructura: { success: true, data: {...} }
      // Devolvemos directamente response.data que contiene la estructura esperada
      return response.data;
    } catch (error: any) {
      console.error(`Error en ${endpoint}:`, error);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // Error de respuesta del servidor
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `Error ${error.response.status}: ${error.response.statusText}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // Error de red
        throw new Error('Error de conexión con el servidor');
      } else {
        // Error de configuración
        throw new Error(error.message || 'Error en la solicitud');
      }
    }
  }

  // ===== MÉTODOS PRINCIPALES =====

  /**
   * Listar reportes de asistencia con filtros y paginación
   */
  async listReports(filters: AttendanceFilters = {}, page = 1, limit = 20): Promise<AttendanceListResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
      ...(filters.status && { status: filters.status }),
      ...(filters.createdBy && { createdBy: filters.createdBy })
    });

    return await this.makeRequest<AttendanceListResponse>(`/reports?${queryParams}`);
  }

  /**
   * Obtener detalle de un reporte de asistencia
   */
  async getReportDetail(reportId: string): Promise<AttendanceDetailResponse> {
    return await this.makeRequest<AttendanceDetailResponse>(`/reports/${reportId}`);
  }

  /**
   * Crear nuevo reporte de asistencia
   */
  async createReport(data: CreateAttendanceReportRequest): Promise<AttendanceReportResponse> {
    // Validar datos antes de enviar
    this.validateAttendanceData(data);

    return await this.makeRequest<AttendanceReportResponse>('/reports', {
      method: 'POST',
      data
    });
  }

  /**
   * Validar datos de asistencia antes de enviar
   */
  private validateAttendanceData(data: CreateAttendanceReportRequest): void {
    if (!data.date) {
      throw new Error('La fecha es requerida');
    }

    if (!data.employees || data.employees.length === 0) {
      throw new Error('Debe incluir al menos un empleado');
    }

    // Validar cada empleado
    data.employees.forEach((employee, index) => {
      if (!employee.employeeId) {
        throw new Error(`Empleado ${index + 1}: ID de empleado es requerido`);
      }

      if (!employee.status) {
        throw new Error(`Empleado ${index + 1}: Estado es requerido`);
      }

      const validStatuses = ['present', 'absent', 'late', 'vacation', 'sick_leave', 'personal_leave', 'maternity_leave', 'paternity_leave'];
      if (!validStatuses.includes(employee.status)) {
        throw new Error(`Empleado ${index + 1}: Estado inválido`);
      }

      // Validar horarios para empleados presentes
      if (employee.status === 'present' || employee.status === 'late') {
        if (!employee.clockIn) {
          throw new Error(`Empleado ${index + 1}: Hora de entrada es requerida`);
        }
        if (!employee.clockOut) {
          throw new Error(`Empleado ${index + 1}: Hora de salida es requerida`);
        }
        if (employee.clockIn >= employee.clockOut) {
          throw new Error(`Empleado ${index + 1}: Hora de salida debe ser posterior a la entrada`);
        }
      }
    });
  }

  /**
   * Actualizar reporte de asistencia
   */
  async updateReport(reportId: string, data: Partial<CreateAttendanceReportRequest>): Promise<AttendanceReportResponse> {
    // Validar datos si se están enviando empleados
    if (data.employees) {
      this.validateAttendanceData(data as CreateAttendanceReportRequest);
    }

    return await this.makeRequest<AttendanceReportResponse>(`/reports/${reportId}`, {
      method: 'PUT',
      data
    });
  }

  /**
   * Eliminar reporte de asistencia
   */
  async deleteReport(reportId: string): Promise<{ success: boolean; message: string }> {
    return await this.makeRequest<{ success: boolean; message: string }>(`/reports/${reportId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Generar reporte rápido con plantilla
   */
  async generateQuickReport(date: string, template: 'normal' | 'weekend' | 'holiday' = 'normal'): Promise<QuickReportResponse> {
    return await this.makeRequest<QuickReportResponse>('/reports/generate-quick', {
      method: 'POST',
      data: { date, template }
    });
  }

  /**
   * Obtener estadísticas generales de asistencia
   */
  async getAttendanceStats(filters: AttendanceFilters = {}): Promise<AttendanceStats> {
    const queryParams = new URLSearchParams({
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
      ...(filters.departmentId && { departmentId: filters.departmentId }),
      ...(filters.employeeId && { employeeId: filters.employeeId })
    });

    return await this.makeRequest<AttendanceStats>(`/stats?${queryParams}`);
  }

  // ===== MÉTODOS DE APROBACIÓN =====

  /**
   * Aprobar o rechazar un reporte de asistencia
   */
  async approveReport(request: ApprovalRequest): Promise<ApprovalResponse> {
    const endpoint = request.action === 'approve' 
      ? `/reports/${request.reportId}/approve`
      : `/reports/${request.reportId}/reject`;

    const data = request.action === 'approve' 
      ? { comments: request.reason }
      : { reason: request.reason };

    return await this.makeRequest<ApprovalResponse>(endpoint, {
      method: 'POST',
      data
    });
  }

  /**
   * Obtener permisos del usuario actual
   */
  async getUserPermissions(): Promise<AttendancePermissions> {
    return await this.makeRequest<AttendancePermissions>('/permissions');
  }

  // ===== MÉTODOS ADICIONALES PARA BACKEND =====

  /**
   * Obtener dashboard de asistencia
   */
  async getDashboard(date?: string): Promise<any> {
    const queryParams = date ? `?date=${date}` : '';
    return await this.makeRequest(`/dashboard${queryParams}`);
  }

  /**
   * Obtener métricas avanzadas
   */
  async getMetrics(period: 'week' | 'month' | 'quarter' = 'month', date?: string): Promise<any> {
    const queryParams = new URLSearchParams({
      period,
      ...(date && { date })
    });

    return await this.makeRequest(`/metrics?${queryParams}`);
  }

  /**
   * Obtener estado de empleado específico
   */
  async getEmployeeStatus(employeeId: string, date: string): Promise<any> {
    return await this.makeRequest(`/employee/${employeeId}/status?date=${date}`);
  }

  /**
   * Exportar reporte de asistencia como PDF (Cliente)
   */
  async exportReportAsPdf(reportId: string, options: {
    creator?: string;
    approver?: string;
    mobileOptimized?: boolean;
  } = {}): Promise<void> {
    try {
      console.log('📄 AttendanceService - Exportando reporte como PDF (cliente):', reportId);
      
      // Obtener datos del reporte
      const reportDetail = await this.getReportDetail(reportId);
      
      // Importar dinámicamente el servicio de exportación
      const { ExportService } = await import('./services/exportService');
      
      // Preparar datos para exportación
      const exportData = {
        report: reportDetail.report,
        employees: reportDetail.employees || [],
        stats: reportDetail.stats
      };
      
      // Exportar usando el servicio del cliente
      await ExportService.exportToPDF(exportData, {
        ...options,
        mobileOptimized: true,
        maxEmployeesPerPage: 20
      });
      
      console.log('✅ AttendanceService - PDF exportado exitosamente (cliente)');
    } catch (error: any) {
      console.error('❌ AttendanceService - Error exportando PDF:', error);
      throw new Error('Error al exportar reporte como PDF');
    }
  }

  /**
   * Exportar reporte de asistencia como Excel (Cliente)
   */
  async exportReportAsExcel(reportId: string, options: {
    creator?: string;
    approver?: string;
  } = {}): Promise<void> {
    try {
      console.log('📊 AttendanceService - Exportando reporte como Excel (cliente):', reportId);
      
      // Obtener datos del reporte
      const reportDetail = await this.getReportDetail(reportId);
      
      // Importar dinámicamente el servicio de exportación
      const { ExportService } = await import('./services/exportService');
      
      // Preparar datos para exportación
      const exportData = {
        report: reportDetail.report,
        employees: reportDetail.employees || [],
        stats: reportDetail.stats
      };
      
      // Exportar usando el servicio del cliente
      await ExportService.exportToExcel(exportData, options);
      
      console.log('✅ AttendanceService - Excel exportado exitosamente (cliente)');
    } catch (error: any) {
      console.error('❌ AttendanceService - Error exportando Excel:', error);
      throw new Error('Error al exportar reporte como Excel');
    }
  }

  /**
   * Exportar reporte de asistencia como Imagen (Cliente)
   */
  async exportReportAsImage(reportId: string, options: {
    creator?: string;
    approver?: string;
    format?: 'png' | 'jpg';
  } = {}): Promise<void> {
    try {
      console.log('🖼️ AttendanceService - Exportando reporte como imagen (cliente):', reportId);
      
      // Obtener datos del reporte
      const reportDetail = await this.getReportDetail(reportId);
      
      // Importar dinámicamente el servicio de exportación
      const { ExportService } = await import('./services/exportService');
      
      // Preparar datos para exportación
      const exportData = {
        report: reportDetail.report,
        employees: reportDetail.employees || [],
        stats: reportDetail.stats
      };
      
      // Exportar usando el servicio del cliente
      await ExportService.exportToImage(exportData, options);
      
      console.log('✅ AttendanceService - Imagen exportada exitosamente (cliente)');
    } catch (error: any) {
      console.error('❌ AttendanceService - Error exportando imagen:', error);
      throw new Error('Error al exportar reporte como imagen');
    }
  }

  /**
   * Método legacy para compatibilidad
   */
  async exportReport(reportId: string, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<any> {
    console.log('⚠️ AttendanceService - Usando método legacy exportReport, considere usar métodos específicos');
    return await this.makeRequest(`/reports/${reportId}/export?format=${format}`);
  }

  /**
   * Obtener lista de empleados para enriquecer datos de asistencia
   */
  async getEmployees(): Promise<any> {
    try {
      const response = await api({
        url: '/api/employees?page=1&limit=100&sortBy=createdAt&sortOrder=desc'
      });
      console.log('✅ AttendanceService - Empleados obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ AttendanceService - Error obteniendo empleados:', error);
      throw new Error('Error al obtener lista de empleados');
    }
  }
}

export const attendanceService = new AttendanceService();