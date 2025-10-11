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
  AttendanceDetailResponse
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

  // ===== MÉTODOS PRINCIPALES =====

  /**
   * Listar reportes de asistencia con filtros y paginación
   */
  async listReports(filters: AttendanceFilters = {}, page = 1, limit = 20): Promise<AttendanceListResponse> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

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
    await new Promise(resolve => setTimeout(resolve, 300));

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
    await new Promise(resolve => setTimeout(resolve, 800));

    const newReport: AttendanceReport = {
      id: `report_${Date.now()}`,
      date: data.date,
      createdBy: 'admin@company.com',
      createdAt: new Date().toISOString(),
      status: 'draft',
      notes: data.notes,
      totalEmployees: data.employees.length,
      presentCount: data.employees.filter(e => e.status === 'present').length,
      absentCount: data.employees.filter(e => e.status === 'absent').length,
      lateCount: data.employees.filter(e => e.status === 'late').length,
      vacationCount: data.employees.filter(e => e.status === 'vacation').length,
      sickLeaveCount: data.employees.filter(e => e.status === 'sick_leave').length,
      personalLeaveCount: data.employees.filter(e => e.status === 'personal_leave').length,
      maternityLeaveCount: data.employees.filter(e => e.status === 'maternity_leave').length,
      paternityLeaveCount: data.employees.filter(e => e.status === 'paternity_leave').length,
      overtimeHours: data.employees.reduce((sum, e) => sum + (e.overtimeHours || 0), 0),
      totalHours: data.employees.reduce((sum, e) => sum + (e.totalHours || 0), 0),
      exceptions: [],
      movements: []
    };

    return {
      success: true,
      message: 'Reporte de asistencia creado exitosamente',
      data: newReport
    };
  }

  /**
   * Actualizar reporte de asistencia
   */
  async updateReport(reportId: string, data: Partial<AttendanceReport>): Promise<AttendanceReportResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simular actualización
    return {
      success: true,
      message: 'Reporte actualizado exitosamente',
      data: { ...this.generateMockReports().find(r => r.id === reportId)!, ...data } as AttendanceReport
    };
  }

  /**
   * Eliminar reporte de asistencia
   */
  async deleteReport(reportId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      success: true,
      message: 'Reporte eliminado exitosamente'
    };
  }

  /**
   * Aprobar reporte de asistencia
   */
  async approveReport(reportId: string): Promise<AttendanceReportResponse> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const report = this.generateMockReports().find(r => r.id === reportId);
    if (!report) {
      throw new Error('Reporte no encontrado');
    }

    const approvedReport: AttendanceReport = {
      ...report,
      status: 'approved'
    };

    return {
      success: true,
      message: 'Reporte aprobado exitosamente',
      data: approvedReport
    };
  }

  /**
   * Generar reporte rápido con plantilla
   */
  async generateQuickReport(date: string, template: 'normal' | 'weekend' | 'holiday' = 'normal'): Promise<CreateAttendanceReportRequest> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const employees = MOCK_EMPLOYEES.map(emp => {
      let status: AttendanceRecord['status'] = 'present';
      let overtimeHours = 0;

      // Aplicar plantilla
      if (template === 'weekend') {
        status = Math.random() > 0.3 ? 'absent' : 'present';
      } else if (template === 'holiday') {
        status = Math.random() > 0.5 ? 'vacation' : 'present';
      } else {
        // Día normal - algunos ausentes y algunos con overtime
        if (Math.random() < 0.1) status = 'absent';
        if (Math.random() < 0.15) status = 'vacation';
        if (Math.random() < 0.05) status = 'sick_leave';
        if (Math.random() < 0.3 && status === 'present') overtimeHours = Math.floor(Math.random() * 4) + 1;
      }

      return {
        employeeId: emp.id,
        status,
        clockIn: status === 'present' ? `${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : undefined,
        clockOut: status === 'present' ? `${17 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : undefined,
        totalHours: status === 'present' ? 8 + Math.random() * 2 : 0,
        overtimeHours,
        notes: status === 'absent' ? 'Ausencia justificada' : undefined
      };
    });

    return {
      date,
      employees,
      notes: `Reporte generado automáticamente con plantilla: ${template}`
    };
  }

  /**
   * Obtener estadísticas generales de asistencia
   */
  async getAttendanceStats(filters: AttendanceFilters = {}): Promise<AttendanceStats> {
    await new Promise(resolve => setTimeout(resolve, 200));

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
        overtimeHours: employees.reduce((sum, e) => sum + (e.overtimeHours || 0), 0),
        totalHours: employees.reduce((sum, e) => sum + (e.totalHours || 0), 0),
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
        totalHours: status === 'present' ? 8 + Math.random() * 2 : 0,
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
      averageHours: employees.reduce((sum, e) => sum + (e.totalHours || 0), 0) / employees.length,
      totalOvertime: employees.reduce((sum, e) => sum + (e.overtimeHours || 0), 0),
      totalMovements: employees.reduce((sum, e) => sum + e.movements.length, 0),
      exceptionsCount: employees.reduce((sum, e) => sum + e.exceptions.length, 0)
    };
  }
}

export const attendanceService = new AttendanceService();
