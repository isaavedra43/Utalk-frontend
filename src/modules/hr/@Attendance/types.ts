// ============================================================================
// TIPOS PARA EL MÓDULO DE ASISTENCIA
// ============================================================================

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'vacation' | 'sick_leave' | 'personal_leave' | 'maternity_leave' | 'paternity_leave';
  clockIn?: string; // HH:mm
  clockOut?: string; // HH:mm
  totalHours?: number;
  overtimeHours?: number;
  breakHours?: number;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceReport {
  id: string;
  date: string; // YYYY-MM-DD
  createdBy: string;
  createdAt: string;
  status: 'draft' | 'completed' | 'approved' | 'rejected';
  notes?: string;
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  vacationCount: number;
  sickLeaveCount: number;
  personalLeaveCount: number;
  maternityLeaveCount: number;
  paternityLeaveCount: number;
  overtimeHours: number;
  totalHours: number;
  exceptions: AttendanceException[];
  movements: AttendanceMovement[];
  // Campos de aprobación
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  updatedAt: string;
}

export interface AttendanceException {
  id: string;
  employeeId: string;
  type: 'late' | 'early_leave' | 'break_violation' | 'missing_clock_in' | 'missing_clock_out';
  description: string;
  time?: string;
  duration?: number;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface AttendanceMovement {
  id: string;
  employeeId: string;
  type: 'overtime' | 'absence' | 'loan' | 'bonus' | 'deduction' | 'vacation' | 'incident';
  description: string;
  amount?: number;
  hours?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface EmployeeAttendance {
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  department: string;
  position: string;
  status: 'present' | 'absent' | 'late' | 'vacation' | 'sick_leave' | 'personal_leave' | 'maternity_leave' | 'paternity_leave';
  clockIn?: string;
  clockOut?: string;
  totalHours?: number;
  overtimeHours?: number;
  breakHours?: number;
  notes?: string;
  exceptions: AttendanceException[];
  movements: AttendanceMovement[];
  hasOvertime: boolean;
  hasLoans: boolean;
  hasIncidents: boolean;
  hasVacation: boolean;
  hasAbsences: boolean;
}

export interface AttendanceFilters {
  date?: string;
  department?: string;
  status?: string;
  employee?: string;
  hasExceptions?: boolean;
  hasMovements?: boolean;
}

export interface AttendanceStats {
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  vacationCount: number;
  sickLeaveCount: number;
  personalLeaveCount: number;
  maternityLeaveCount: number;
  paternityLeaveCount: number;
  averageHours: number;
  totalOvertime: number;
  totalMovements: number;
  exceptionsCount: number;
}

export interface CreateAttendanceReportRequest {
  date: string;
  employees: Array<{
    employeeId: string;
    status: AttendanceRecord['status'];
    clockIn?: string;
    clockOut?: string;
    totalHours?: number;
    overtimeHours?: number;
    notes?: string;
    exceptions?: Omit<AttendanceException, 'id' | 'resolved' | 'resolvedBy' | 'resolvedAt'>[];
    movements?: Omit<AttendanceMovement, 'id' | 'approvedBy' | 'approvedAt'>[];
  }>;
  notes?: string;
}

export interface AttendanceReportResponse {
  success: boolean;
  message: string;
  data: AttendanceReport;
}

export interface AttendanceListResponse {
  reports: AttendanceReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: AttendanceFilters;
}

// Interfaces para acciones de aprobación
export interface ApprovalRequest {
  reportId: string;
  action: 'approve' | 'reject';
  reason?: string;
  approvedBy: string;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  data: AttendanceReport;
}

// Interface para permisos de usuario
export interface AttendancePermissions {
  canCreate: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canDelete: boolean;
  canView: boolean;
  isAdmin: boolean;
}

export interface AttendanceDetailResponse {
  report: AttendanceReport;
  employees: EmployeeAttendance[];
  stats: AttendanceStats;
}
