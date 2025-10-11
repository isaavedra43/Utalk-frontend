// ============================================================================
// SERVICIO DE ASISTENCIA - CON DATOS FALSOS PARA DESARROLLO
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
  AttendancePermissions
} from './types';

// Datos falsos para desarrollo
const MOCK_EMPLOYEES = [
  { id: 'emp1', name: 'Juan Pérez', number: 'EMP001', department: 'Ventas', position: 'Ejecutivo de Ventas' },
  { id: 'emp2', name: 'María García', number: 'EMP002', department: 'Marketing', position: 'Especialista en Marketing' },
  { id: 'emp3', name: 'Carlos López', number: 'EMP003', department: 'Desarrollo', position: 'Desarrollador Senior' },
  { id: 'emp4', name: 'Ana Rodríguez', number: 'EMP004', department: 'RH', position: 'Analista de RH' },
  { id: 'emp5', name: 'Roberto Sánchez', number: 'EMP005', department: 'Operaciones', position: 'Supervisor de Operaciones' },
  { id: 'emp6', name: 'Lucía Fernández', number: 'EMP006', department: 'Finanzas', position: 'Contadora' },
  { id: 'emp7', name: 'Miguel Torres', number: 'EMP007', department: 'Ventas', position: 'Gerente de Ventas' },
  { id: 'emp8', name: 'Carmen Morales', number: 'EMP008', department: 'Marketing', position: 'Diseñadora Gráfica' },
  { id: 'emp9', name: 'Fernando Ruiz', number: 'EMP009', department: 'Desarrollo', position: 'Desarrollador Junior' },
  { id: 'emp10', name: 'Isabel Jiménez', number: 'EMP010', department: 'RH', position: 'Gerente de RH' }
];

const MOCK_MOVEMENTS = [
  { type: 'overtime', description: 'Horas extras proyecto urgente', amount: 500 },
  { type: 'loan', description: 'Préstamo personal', amount: 2000 },
  { type: 'bonus', description: 'Bono por desempeño', amount: 1000 },
  { type: 'deduction', description: 'Descuento por atraso', amount: -200 },
  { type: 'vacation', description: 'Vacaciones anuales', hours: 40 },
  { type: 'incident', description: 'Incidente menor', amount: -100 }
];

class AttendanceService {
  private baseEndpoint = '/api/attendance';
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseEndpoint}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // ===== MÉTODOS PRINCIPALES =====

  /**
   * Listar reportes de asistencia con filtros y paginación
   */
  async listReports(filters: AttendanceFilters = {}, page = 1, limit = 20): Promise<AttendanceListResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.status && { status: filters.status }),
        ...(filters.createdBy && { createdBy: filters.createdBy })
      });

      const response = await this.makeRequest(`/reports?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance reports:', error);
      // Fallback a datos mock en caso de error
      return this.getMockReports(filters, page, limit);
    }
  }

  /**
   * Fallback a datos mock en caso de error de API
   */
  private getMockReports(filters: AttendanceFilters = {}, page = 1, limit = 20): AttendanceListResponse {
    const reports = this.generateMockReports();
    const filteredReports = this.applyFilters(reports, filters);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReports = filteredReports.slice(startIndex, endIndex);

    return {
      reports: paginatedReports,
      pagination: {
        page,
        limit,
        total: filteredReports.length,
        totalPages: Math.ceil(filteredReports.length / limit)
      },
      filters
    };
  }

  /**
   * Obtener detalle de un reporte de asistencia
   */
  async getReportDetail(reportId: string): Promise<AttendanceDetailResponse> {
    try {
      const response = await this.makeRequest(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report detail:', error);
      // Fallback a datos mock
      return this.getMockReportDetail(reportId);
    }
  }

  /**
   * Fallback a datos mock para detalle de reporte
   */
  private getMockReportDetail(reportId: string): AttendanceDetailResponse {
    const report = this.generateMockReports().find(r => r.id === reportId);
    if (!report) {
      throw new Error('Reporte no encontrado');
    }

    const employees = this.generateMockEmployeeAttendance(report.date);
    const stats = this.calculateStats(employees);

    return {
      report,
      employees,
      stats
    };
  }

  /**
   * Crear nuevo reporte de asistencia
   */
  async createReport(data: CreateAttendanceReportRequest): Promise<AttendanceReportResponse> {
    try {
      // Validar datos antes de enviar
      this.validateAttendanceData(data);

      const response = await this.makeRequest('/reports', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      return response;
    } catch (error) {
      console.error('Error creating attendance report:', error);
      throw error;
    }
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
    try {
      // Validar datos si se están enviando empleados
      if (data.employees) {
        this.validateAttendanceData(data as CreateAttendanceReportRequest);
      }

      const response = await this.makeRequest(`/reports/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      return response;
    } catch (error) {
      console.error('Error updating attendance report:', error);
      throw error;
    }
  }

  /**
   * Eliminar reporte de asistencia
   */
  async deleteReport(reportId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(`/reports/${reportId}`, {
        method: 'DELETE'
      });

      return response;
    } catch (error) {
      console.error('Error deleting attendance report:', error);
      throw error;
    }
  }


  /**
   * Generar reporte rápido con plantilla
   */
  async generateQuickReport(date: string, template: 'normal' | 'weekend' | 'holiday' = 'normal'): Promise<CreateAttendanceReportRequest> {
    try {
      const response = await this.makeRequest('/reports/generate-quick', {
        method: 'POST',
        body: JSON.stringify({ date, template })
      });

      return response.data;
    } catch (error) {
      console.error('Error generating quick report:', error);
      // Fallback a generación local
      return this.generateLocalQuickReport(date, template);
    }
  }

  /**
   * Fallback a generación local de reporte rápido
   */
  private generateLocalQuickReport(date: string, template: 'normal' | 'weekend' | 'holiday' = 'normal'): CreateAttendanceReportRequest {
    const employees = MOCK_EMPLOYEES.map(emp => {
      // Por defecto, todos los empleados están presentes
      let status: AttendanceRecord['status'] = 'present';
      let overtimeHours = 0;

      // Horarios estándar de trabajo (9:00 AM - 6:00 PM)
      const standardClockIn = '09:00';
      const standardClockOut = '18:00';
      const standardTotalHours = 9; // 9 horas de trabajo

      // Aplicar plantilla - pero mantener la mayoría como presentes
      if (template === 'weekend') {
        // En fin de semana, algunos pueden estar ausentes
        status = Math.random() > 0.8 ? 'absent' : 'present';
      } else if (template === 'holiday') {
        // En días festivos, algunos pueden estar en vacaciones
        status = Math.random() > 0.9 ? 'vacation' : 'present';
      } else {
        // Día normal - todos presentes por defecto, solo algunos casos excepcionales
        if (Math.random() < 0.05) status = 'vacation'; // 5% en vacaciones
        if (Math.random() < 0.03) status = 'sick_leave'; // 3% enfermos
        if (Math.random() < 0.02) status = 'absent'; // 2% ausentes
        // 90% presentes por defecto
      }

      // Calcular horas extra solo para empleados presentes
      if (status === 'present' && Math.random() < 0.2) {
        overtimeHours = Math.floor(Math.random() * 3) + 1; // 1-3 horas extra
      }

      return {
        employeeId: emp.id,
        status,
        // Pre-llenar horarios estándar para empleados presentes
        clockIn: status === 'present' ? standardClockIn : undefined,
        clockOut: status === 'present' ? standardClockOut : undefined,
        totalHours: status === 'present' ? Math.floor(standardTotalHours + overtimeHours) : 0,
        overtimeHours,
        notes: status === 'absent' ? 'Ausencia justificada' : 
               status === 'vacation' ? 'En vacaciones' :
               status === 'sick_leave' ? 'Enfermedad' : undefined
      };
    });

    return {
      date,
      employees,
      notes: `Reporte generado automáticamente con plantilla: ${template}. Todos los empleados marcados como presentes por defecto con horarios estándar.`
    };
  }

  /**
   * Obtener estadísticas generales de asistencia
   */
  async getAttendanceStats(filters: AttendanceFilters = {}): Promise<AttendanceStats> {
    try {
      const queryParams = new URLSearchParams({
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.departmentId && { departmentId: filters.departmentId }),
        ...(filters.employeeId && { employeeId: filters.employeeId })
      });

      const response = await this.makeRequest(`/stats?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      // Fallback a datos mock
      return this.getMockAttendanceStats(filters);
    }
  }

  /**
   * Fallback a estadísticas mock
   */
  private getMockAttendanceStats(filters: AttendanceFilters = {}): AttendanceStats {
    const reports = this.generateMockReports();
    const filteredReports = this.applyFilters(reports, filters);

    const employees = filteredReports.flatMap(report =>
      this.generateMockEmployeeAttendance(report.date)
    );

    return this.calculateStats(employees);
  }

  // ===== MÉTODOS AUXILIARES =====

  private generateMockReports(): AttendanceReport[] {
    const reports: AttendanceReport[] = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dateString = date.toISOString().split('T')[0];
      const employees = this.generateMockEmployeeAttendance(dateString);

      reports.push({
        id: `report_${dateString.replace(/-/g, '_')}`,
        date: dateString,
        createdBy: 'admin@company.com',
        createdAt: date.toISOString(),
        status: i === 0 ? 'completed' : (Math.random() > 0.3 ? 'completed' : 'draft'),
        notes: i === 0 ? 'Reporte del día actual' : undefined,
        totalEmployees: employees.length,
        presentCount: employees.filter(e => e.status === 'present').length,
        absentCount: employees.filter(e => e.status === 'absent').length,
        lateCount: employees.filter(e => e.status === 'late').length,
        vacationCount: employees.filter(e => e.status === 'vacation').length,
        sickLeaveCount: employees.filter(e => e.status === 'sick_leave').length,
        personalLeaveCount: employees.filter(e => e.status === 'personal_leave').length,
        maternityLeaveCount: employees.filter(e => e.status === 'maternity_leave').length,
        paternityLeaveCount: employees.filter(e => e.status === 'paternity_leave').length,
      overtimeHours: Math.floor(employees.reduce((sum, e) => sum + (e.overtimeHours || 0), 0)),
      totalHours: Math.floor(employees.reduce((sum, e) => sum + (e.totalHours || 0), 0)),
        exceptions: [],
        movements: []
      });
    }

    return reports;
  }

  private generateMockEmployeeAttendance(date: string): EmployeeAttendance[] {
    return MOCK_EMPLOYEES.map(emp => {
      const status: EmployeeAttendance['status'] = this.getRandomStatus();
      const hasOvertime = status === 'present' && Math.random() < 0.3;
      const hasLoans = Math.random() < 0.1;
      const hasIncidents = Math.random() < 0.05;
      const hasVacation = status === 'vacation';
      const hasAbsences = status === 'absent';

      const movements: AttendanceMovement[] = [];

      if (hasOvertime) {
        movements.push({
          id: `mov_${emp.id}_${Date.now()}`,
          employeeId: emp.id,
          type: 'overtime',
          description: 'Horas extras autorizadas',
          hours: Math.floor(Math.random() * 4) + 1,
          status: 'approved',
          createdAt: new Date().toISOString()
        });
      }

      if (hasLoans) {
        movements.push({
          id: `mov_loan_${emp.id}_${Date.now()}`,
          employeeId: emp.id,
          type: 'loan',
          description: 'Préstamo personal aprobado',
          amount: 1000 + Math.floor(Math.random() * 4000),
          status: 'approved',
          createdAt: new Date().toISOString()
        });
      }

      if (hasIncidents) {
        movements.push({
          id: `mov_inc_${emp.id}_${Date.now()}`,
          employeeId: emp.id,
          type: 'incident',
          description: 'Incidente reportado',
          amount: -100 - Math.floor(Math.random() * 400),
          status: 'approved',
          createdAt: new Date().toISOString()
        });
      }

      if (hasVacation) {
        movements.push({
          id: `mov_vac_${emp.id}_${Date.now()}`,
          employeeId: emp.id,
          type: 'vacation',
          description: 'Días de vacaciones',
          hours: 8,
          status: 'approved',
          createdAt: new Date().toISOString()
        });
      }

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        employeeNumber: emp.number,
        department: emp.department,
        position: emp.position,
        status,
        clockIn: status === 'present' ? `${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : undefined,
        clockOut: status === 'present' ? `${17 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : undefined,
        totalHours: status === 'present' ? Math.floor(8 + Math.random() * 2) : 0,
        overtimeHours: hasOvertime ? Math.floor(Math.random() * 4) + 1 : 0,
        breakHours: status === 'present' ? 1 : 0,
        notes: status === 'absent' ? 'Ausencia justificada por enfermedad' : undefined,
        exceptions: [],
        movements,
        hasOvertime,
        hasLoans,
        hasIncidents,
        hasVacation,
        hasAbsences
      };
    });
  }

  private getRandomStatus(): EmployeeAttendance['status'] {
    const statuses: EmployeeAttendance['status'][] = ['present', 'absent', 'late', 'vacation', 'sick_leave', 'personal_leave'];
    const weights = [0.7, 0.1, 0.1, 0.05, 0.03, 0.02]; // Probabilidades

    let random = Math.random();
    for (let i = 0; i < statuses.length; i++) {
      random -= weights[i];
      if (random <= 0) return statuses[i];
    }
    return 'present';
  }

  private applyFilters(reports: AttendanceReport[], filters: AttendanceFilters): AttendanceReport[] {
    return reports.filter(report => {
      if (filters.date && report.date !== filters.date) return false;
      if (filters.status && report.status !== filters.status) return false;
      return true;
    });
  }

  private calculateStats(employees: EmployeeAttendance[]): AttendanceStats {
    return {
      totalEmployees: employees.length,
      presentCount: employees.filter(e => e.status === 'present').length,
      absentCount: employees.filter(e => e.status === 'absent').length,
      lateCount: employees.filter(e => e.status === 'late').length,
      vacationCount: employees.filter(e => e.status === 'vacation').length,
      sickLeaveCount: employees.filter(e => e.status === 'sick_leave').length,
      personalLeaveCount: employees.filter(e => e.status === 'personal_leave').length,
      maternityLeaveCount: employees.filter(e => e.status === 'maternity_leave').length,
      paternityLeaveCount: employees.filter(e => e.status === 'paternity_leave').length,
      averageHours: Math.floor(employees.reduce((sum, e) => sum + (e.totalHours || 0), 0) / employees.length),
      totalOvertime: Math.floor(employees.reduce((sum, e) => sum + (e.overtimeHours || 0), 0)),
      totalMovements: employees.reduce((sum, e) => sum + e.movements.length, 0),
      exceptionsCount: employees.reduce((sum, e) => sum + e.exceptions.length, 0)
    };
  }

  // ===== MÉTODOS DE APROBACIÓN =====

  /**
   * Aprobar o rechazar un reporte de asistencia
   */
  async approveReport(request: ApprovalRequest): Promise<ApprovalResponse> {
    try {
      const endpoint = request.action === 'approve' 
        ? `/reports/${request.reportId}/approve`
        : `/reports/${request.reportId}/reject`;

      const body = request.action === 'approve' 
        ? { comments: request.reason }
        : { reason: request.reason };

      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      });

      return response;
    } catch (error) {
      console.error('Error approving/rejecting report:', error);
      // Fallback a simulación local
      return this.getMockApprovalResponse(request);
    }
  }

  /**
   * Fallback a respuesta mock de aprobación
   */
  private getMockApprovalResponse(request: ApprovalRequest): ApprovalResponse {
    const reports = this.generateMockReports();
    const report = reports.find(r => r.id === request.reportId);

    if (!report) {
      return {
        success: false,
        message: 'Reporte no encontrado',
        data: {} as AttendanceReport
      };
    }

    // Simular actualización del reporte
    const updatedReport: AttendanceReport = {
      ...report,
      status: request.action === 'approve' ? 'approved' : 'rejected',
      approvedBy: request.action === 'approve' ? request.approvedBy : undefined,
      approvedAt: request.action === 'approve' ? new Date().toISOString() : undefined,
      rejectedBy: request.action === 'reject' ? request.approvedBy : undefined,
      rejectedAt: request.action === 'reject' ? new Date().toISOString() : undefined,
      rejectionReason: request.action === 'reject' ? request.reason : undefined,
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      message: request.action === 'approve' 
        ? 'Reporte aprobado exitosamente' 
        : 'Reporte rechazado exitosamente',
      data: updatedReport
    };
  }

  /**
   * Obtener permisos del usuario actual
   */
  async getUserPermissions(): Promise<AttendancePermissions> {
    try {
      const response = await this.makeRequest('/permissions');
      return response.data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      // Fallback a permisos basados en rol local
      return this.getMockUserPermissions();
    }
  }

  /**
   * Fallback a permisos mock
   */
  private getMockUserPermissions(): AttendancePermissions {
    // Simular obtención de permisos del usuario actual
    // En una implementación real, esto vendría del backend basado en el rol del usuario
    const currentUser = this.getCurrentUser();
    
    return {
      canCreate: true,
      canEdit: true, // Permitir edición en cualquier estado
      canApprove: currentUser.role === 'admin' || currentUser.role === 'hr_manager',
      canReject: currentUser.role === 'admin' || currentUser.role === 'hr_manager',
      canDelete: currentUser.role === 'admin', // Solo admins pueden eliminar
      canView: true,
      isAdmin: currentUser.role === 'admin'
    };
  }

  /**
   * Simular usuario actual (en implementación real vendría del contexto de autenticación)
   */
  private getCurrentUser() {
    return {
      id: 'current_user',
      email: 'admin@company.com',
      role: 'admin', // Cambiar a 'hr_user' para probar permisos limitados
      name: 'Usuario Actual'
    };
  }

  // ===== MÉTODOS ADICIONALES PARA BACKEND =====

  /**
   * Obtener dashboard de asistencia
   */
  async getDashboard(date?: string): Promise<any> {
    try {
      const queryParams = date ? `?date=${date}` : '';
      const response = await this.makeRequest(`/dashboard${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      // Fallback a dashboard mock
      return this.getMockDashboard(date);
    }
  }

  /**
   * Fallback a dashboard mock
   */
  private getMockDashboard(date?: string): any {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const reports = this.generateMockReports();
    const todayReport = reports.find(r => r.date === targetDate);
    const employees = todayReport ? this.generateMockEmployeeAttendance(targetDate) : [];

    return {
      date: targetDate,
      currentReport: todayReport || null,
      currentStats: {
        presentCount: employees.filter(e => e.status === 'present').length,
        absentCount: employees.filter(e => e.status === 'absent').length,
        lateCount: employees.filter(e => e.status === 'late').length
      },
      generalStats: {
        attendanceRate: 90.5,
        totalHours: employees.reduce((sum, e) => sum + (e.totalHours || 0), 0)
      },
      recentReports: reports.slice(0, 5),
      alerts: [
        {
          type: 'high_absence',
          message: '15% de ausencias hoy - superior al 20% recomendado',
          severity: 'high'
        }
      ]
    };
  }

  /**
   * Obtener métricas avanzadas
   */
  async getMetrics(period: 'week' | 'month' | 'quarter' = 'month', date?: string): Promise<any> {
    try {
      const queryParams = new URLSearchParams({
        period,
        ...(date && { date })
      });

      const response = await this.makeRequest(`/metrics?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      // Fallback a métricas mock
      return this.getMockMetrics(period, date);
    }
  }

  /**
   * Fallback a métricas mock
   */
  private getMockMetrics(period: 'week' | 'month' | 'quarter' = 'month', date?: string): any {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    return {
      period,
      date: targetDate,
      dateFrom: this.getPeriodStartDate(period, targetDate),
      dateTo: targetDate,
      metrics: {
        totalReports: 22,
        totalEmployees: 25,
        attendanceRate: 90.5,
        averageHoursPerDay: 8.2,
        overtimeHours: 120
      },
      trends: {
        attendanceRate: this.generateTrendData('attendanceRate', period),
        overtimeHours: this.generateTrendData('overtimeHours', period)
      }
    };
  }

  /**
   * Obtener estado de empleado específico
   */
  async getEmployeeStatus(employeeId: string, date: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/employee/${employeeId}/status?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee status:', error);
      // Fallback a estado mock
      return this.getMockEmployeeStatus(employeeId, date);
    }
  }

  /**
   * Fallback a estado mock de empleado
   */
  private getMockEmployeeStatus(employeeId: string, date: string): any {
    const employee = MOCK_EMPLOYEES.find(e => e.id === employeeId);
    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    const employees = this.generateMockEmployeeAttendance(date);
    const record = employees.find(e => e.employeeId === employeeId);

    return {
      employeeId,
      date,
      attendanceStatus: record?.status || 'absent',
      record: record || null,
      vacationInfo: {
        status: 'working',
        approved: true
      },
      extrasInfo: {
        overtimeHours: record?.overtimeHours || 0,
        hasLoans: false,
        hasAbsences: false
      }
    };
  }

  /**
   * Exportar reporte
   */
  async exportReport(reportId: string, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<any> {
    try {
      const response = await this.makeRequest(`/reports/${reportId}/export?format=${format}`);
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  // ===== MÉTODOS AUXILIARES ADICIONALES =====

  private getPeriodStartDate(period: 'week' | 'month' | 'quarter', date: string): string {
    const targetDate = new Date(date);
    
    switch (period) {
      case 'week':
        const weekStart = new Date(targetDate);
        weekStart.setDate(targetDate.getDate() - targetDate.getDay());
        return weekStart.toISOString().split('T')[0];
      
      case 'month':
        return new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString().split('T')[0];
      
      case 'quarter':
        const quarterStart = new Date(targetDate.getFullYear(), Math.floor(targetDate.getMonth() / 3) * 3, 1);
        return quarterStart.toISOString().split('T')[0];
      
      default:
        return date;
    }
  }

  private generateTrendData(type: 'attendanceRate' | 'overtimeHours', period: 'week' | 'month' | 'quarter'): any[] {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const data = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: type === 'attendanceRate' 
          ? Math.random() * 20 + 80 // 80-100%
          : Math.random() * 10 + 5  // 5-15 horas
      });
    }

    return data;
  }
}

export const attendanceService = new AttendanceService();
