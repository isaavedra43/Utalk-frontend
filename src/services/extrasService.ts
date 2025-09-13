import { api } from './api';

// Tipos para los movimientos
export interface LoanPayment {
  id: string;
  payrollPeriod: string;
  paymentDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  payrollId?: string;
}

export interface MovementRecord {
  id: string;
  employeeId: string;
  type: 'overtime' | 'absence' | 'bonus' | 'deduction' | 'loan' | 'damage';
  date: string;
  description: string;
  reason: string;
  amount: number;
  calculatedAmount: number;
  
  // Campos específicos
  hours?: number; // Para overtime
  duration?: number; // Para absences
  totalAmount?: number; // Para loans
  monthlyPayment?: number; // Para loans
  
  // Estado
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  approvedBy?: string;
  approvedAt?: string;
  
  // Metadatos
  location: 'office' | 'remote' | 'field';
  attachments: string[];
  impactType: 'add' | 'subtract';
  createdAt: string;
  registeredBy: string;
}

export interface MovementRequest {
  type: 'overtime' | 'absence' | 'bonus' | 'deduction' | 'loan' | 'damage';
  date: string; // YYYY-MM-DD
  description: string; // Descripción detallada
  reason: string; // Razón del movimiento
  
  // Para horas extra
  hours?: number; // Horas extra trabajadas
  overtimeType?: 'regular' | 'weekend' | 'holiday';
  
  // Para ausencias
  duration?: number; // Duración en días
  absenceType?: 'sick_leave' | 'personal_leave' | 'vacation' | 'emergency' | 'medical_appointment' | 'other';
  
  // Para montos fijos (bonos, deducciones, daños)
  amount?: number; // Monto (opcional si se calcula automáticamente)
  bonusType?: 'performance' | 'attendance' | 'special' | 'holiday';
  deductionType?: 'voluntary' | 'disciplinary' | 'equipment' | 'other';
  damageType?: 'equipment' | 'property' | 'vehicle' | 'other';
  
  // Para préstamos
  totalAmount?: number; // Monto total del préstamo
  totalInstallments?: number; // Número de cuotas
  
  // Campos adicionales
  location?: 'office' | 'remote' | 'field';
  justification?: string; // Para préstamos y daños
  attachments?: string[]; // URLs de archivos subidos
}

export interface AttendanceMetrics {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalHours: number;
  overtimeHours: number;
  attendanceScore: number;
  punctualityScore: number;
}

export interface ChartData {
  date: string;
  present: number;
  late: number;
  absent: number;
  hours: number;
  regularHours: number;
  overtimeHours: number;
}

export interface MovementsSummary {
  totalToAdd: number;
  totalToSubtract: number;
  netImpact: number;
  byType: {
    overtime: { count: number; total: number; hours: number };
    absence: { count: number; total: number; days: number };
    bonus: { count: number; total: number };
    deduction: { count: number; total: number };
    loan: { count: number; total: number };
    damage: { count: number; total: number };
  };
  movements: MovementRecord[];
}

export interface PayrollImpact {
  totalToAdd: number;
  totalToSubtract: number;
  netImpact: number;
  breakdown: {
    overtime: number;
    bonuses: number;
    absences: number;
    deductions: number;
    loanPayments: number;
    damages: number;
  };
  movements: MovementRecord[];
}

class ExtrasService {
  // MOVIMIENTOS DE EXTRAS
  async registerMovement(employeeId: string, movementData: MovementRequest): Promise<MovementRecord> {
    try {
      const response = await api.post(`/api/employees/${employeeId}/extras`, movementData);
      return response.data;
    } catch (error) {
      console.error('Error registering movement:', error);
      throw error;
    }
  }

  async getMovements(employeeId: string, filters: Record<string, string | number> = {}): Promise<MovementRecord[]> {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/api/employees/${employeeId}/extras?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching movements:', error);
      throw error;
    }
  }

  async getOvertimeRecords(employeeId: string, filters: Record<string, string | number> = {}): Promise<MovementRecord[]> {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/api/employees/${employeeId}/overtime?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching overtime records:', error);
      throw error;
    }
  }

  async getAbsenceRecords(employeeId: string, filters: Record<string, string | number> = {}): Promise<MovementRecord[]> {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/api/employees/${employeeId}/absences?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching absence records:', error);
      throw error;
    }
  }

  async getLoanRecords(employeeId: string, filters: Record<string, string | number> = {}): Promise<MovementRecord[]> {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/api/employees/${employeeId}/loans?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching loan records:', error);
      throw error;
    }
  }

  async getBonusRecords(employeeId: string, filters: Record<string, string | number> = {}): Promise<MovementRecord[]> {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/api/employees/${employeeId}/bonuses?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bonus records:', error);
      throw error;
    }
  }

  async getDeductionRecords(employeeId: string, filters: Record<string, string | number> = {}): Promise<MovementRecord[]> {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/api/employees/${employeeId}/deductions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching deduction records:', error);
      throw error;
    }
  }

  async getDamageRecords(employeeId: string, filters: Record<string, string | number> = {}): Promise<MovementRecord[]> {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/api/employees/${employeeId}/damages?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching damage records:', error);
      throw error;
    }
  }

  async updateMovement(employeeId: string, movementId: string, updateData: Partial<MovementRequest>): Promise<MovementRecord> {
    try {
      const response = await api.put(`/api/employees/${employeeId}/extras/${movementId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating movement:', error);
      throw error;
    }
  }

  async deleteMovement(employeeId: string, movementId: string): Promise<void> {
    try {
      await api.delete(`/api/employees/${employeeId}/extras/${movementId}`);
    } catch (error) {
      console.error('Error deleting movement:', error);
      throw error;
    }
  }

  async approveMovement(movementId: string, employeeId: string, comments?: string): Promise<MovementRecord> {
    try {
      const response = await api.put(`/api/extras/${movementId}/approve`, {
        employeeId,
        comments
      });
      return response.data;
    } catch (error) {
      console.error('Error approving movement:', error);
      throw error;
    }
  }

  async rejectMovement(movementId: string, employeeId: string, reason: string): Promise<MovementRecord> {
    try {
      const response = await api.put(`/api/extras/${movementId}/reject`, {
        employeeId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting movement:', error);
      throw error;
    }
  }

  // MÉTRICAS Y RESÚMENES
  async getMovementsSummary(employeeId: string, startDate?: string, endDate?: string): Promise<MovementsSummary> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/api/employees/${employeeId}/movements-summary?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching movements summary:', error);
      throw error;
    }
  }

  async getAttendanceMetrics(employeeId: string, days: number = 30): Promise<AttendanceMetrics> {
    try {
      const response = await api.get(`/api/employees/${employeeId}/attendance-metrics?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance metrics:', error);
      throw error;
    }
  }

  async getChartData(employeeId: string, days: number = 30): Promise<ChartData[]> {
    try {
      const response = await api.get(`/api/employees/${employeeId}/chart-data?days=${days}`);
      return response.data.chartData;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  }

  async getPayrollImpact(employeeId: string, periodStart: string, periodEnd: string): Promise<PayrollImpact> {
    try {
      const response = await api.get(`/api/employees/${employeeId}/payroll-impact?periodStart=${periodStart}&periodEnd=${periodEnd}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll impact:', error);
      throw error;
    }
  }

  // GESTIÓN DE PRÉSTAMOS
  async addLoanPayment(loanId: string, paymentData: {
    payrollPeriod: string;
    paymentDate: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    payrollId?: string;
  }): Promise<{ payment: LoanPayment; loan: MovementRecord }> {
    try {
      const response = await api.post(`/api/loans/${loanId}/payments`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error adding loan payment:', error);
      throw error;
    }
  }

  async updateLoan(loanId: string, updateData: Partial<MovementRequest>): Promise<MovementRecord> {
    try {
      const response = await api.put(`/api/loans/${loanId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating loan:', error);
      throw error;
    }
  }

  async deleteLoanPayment(loanId: string, paymentId: string): Promise<void> {
    try {
      await api.delete(`/api/loans/${loanId}/payments/${paymentId}`);
    } catch (error) {
      console.error('Error deleting loan payment:', error);
      throw error;
    }
  }

  // ARCHIVOS ADJUNTOS
  async uploadFiles(files: File[], employeeId: string, movementType: string, movementId?: string): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('employeeId', employeeId);
      formData.append('movementType', movementType);
      if (movementId) formData.append('movementId', movementId);
      
      const response = await api.post('/api/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.filePaths;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }

  async validateFiles(files: File[]): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const response = await api.post('/api/attachments/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error validating files:', error);
      throw error;
    }
  }

  async downloadFile(fileId: string, filePath: string): Promise<Blob> {
    try {
      const response = await api.get(`/api/attachments/${fileId}/download?filePath=${filePath}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string, filePath: string): Promise<void> {
    try {
      await api.delete(`/api/attachments/${fileId}`, {
        data: { filePath }
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // REPORTES
  async exportMovements(employeeId: string, startDate: string, endDate: string, format: 'json' | 'excel' = 'excel'): Promise<Blob> {
    try {
      const response = await api.get(`/api/reports/employee/${employeeId}/extras?startDate=${startDate}&endDate=${endDate}&format=${format}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting movements:', error);
      throw error;
    }
  }

  async exportAttendance(employeeId: string, startDate: string, endDate: string, format: 'json' | 'excel' = 'excel'): Promise<Blob> {
    try {
      const response = await api.get(`/api/reports/employee/${employeeId}/attendance?startDate=${startDate}&endDate=${endDate}&format=${format}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting attendance:', error);
      throw error;
    }
  }

  // CÁLCULOS AUTOMÁTICOS
  async calculateAmount(employeeId: string, movementData: Partial<MovementRequest>): Promise<{ amount: number; breakdown: Record<string, number> }> {
    try {
      const response = await api.post(`/api/employees/${employeeId}/calculate-movement`, movementData);
      return response.data;
    } catch (error) {
      console.error('Error calculating amount:', error);
      throw error;
    }
  }

  // FUNCIÓN LOCAL PARA CÁLCULOS RÁPIDOS (FALLBACK)
  calculateLocalAmount(baseSalary: number, movementData: Partial<MovementRequest>): number {
    const dailySalary = baseSalary / 30;
    const hourlyRate = dailySalary / 8;

    switch (movementData.type) {
      case 'overtime':
        const multipliers = { regular: 1.5, weekend: 2.0, holiday: 3.0 };
        const multiplier = multipliers[movementData.overtimeType || 'regular'];
        return (movementData.hours || 0) * hourlyRate * multiplier;
      
      case 'absence':
        const deductionRates = {
          sick_leave: 0.4,
          personal_leave: 1.0,
          vacation: 0.0,
          emergency: 0.5,
          medical_appointment: 0.25,
          other: 1.0
        };
        const rate = deductionRates[movementData.absenceType || 'other'];
        return dailySalary * (movementData.duration || 1) * rate;
      
      case 'loan':
        return movementData.totalAmount || 0;
      
      case 'bonus':
      case 'deduction':
      case 'damage':
        return movementData.amount || 0;
      
      default:
        return 0;
    }
  }
}

export const extrasService = new ExtrasService();
export default extrasService;
