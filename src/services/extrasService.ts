import { api } from './api';
import { handleApiError } from '../config/apiConfig';
import { logger } from '../utils/logger';

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
  
  // Estado de pago
  paymentStatus: 'unpaid' | 'paid';
  payrollId?: string; // ID de la nómina donde se pagó
  payrollPeriod?: string; // Período de la nómina (ej: "2025-09-14 - 2025-09-20")
  paidAt?: string; // Fecha cuando se pagó
  paidBy?: string; // Quién procesó el pago
  
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
  // Helper para manejar errores de API
  private handleError(error: unknown, context: string): never {
    const errorMessage = handleApiError(error);
    const errorObj = error instanceof Error ? error : new Error('Unknown error');
    const apiError = error as { response?: { status?: number; data?: unknown } };
    
    logger.apiError(`Error en ${context}`, errorObj, {
      status: apiError.response?.status,
      data: apiError.response?.data,
      context
    });
    
    // Crear error con mensaje más descriptivo
    const enhancedError = new Error(errorMessage);
    (enhancedError as Error & { originalError?: unknown; status?: number; context?: string }).originalError = error;
    (enhancedError as Error & { originalError?: unknown; status?: number; context?: string }).status = (error as { response?: { status?: number } })?.response?.status;
    (enhancedError as Error & { originalError?: unknown; status?: number; context?: string }).context = context;
    
    throw enhancedError;
  }

  // Validar fechas antes de enviar
  private validateDateRange(startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        throw new Error('La fecha de inicio no puede ser mayor a la fecha de fin');
      }
      
      // Validar que las fechas no sean futuras
      const today = new Date();
      if (start > today) {
        throw new Error('La fecha de inicio no puede ser futura');
      }
    }
  }

  // MOVIMIENTOS DE EXTRAS
  async registerMovement(employeeId: string, movementData: MovementRequest): Promise<MovementRecord> {
    const maxRetries = 3;
    const baseDelay = 2000; // 2 segundos
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Validar datos antes de enviar
        if (!employeeId) {
          throw new Error('ID de empleado es requerido');
        }
        
        console.log(`🔄 Intento ${attempt}/${maxRetries} - Registrando movimiento:`, movementData.type);
        
        const response = await api.post(`/api/employees/${employeeId}/extras`, movementData);
        
        console.log(`✅ Movimiento registrado exitosamente en intento ${attempt}`);
        return response.data;
        
      } catch (error) {
        const isRateLimitError = error instanceof Error && 
          (error.message.includes('Rate limit exceeded') || 
           error.message.includes('rate limit') ||
           error.message.includes('429'));
        
        if (isRateLimitError && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.warn(`⚠️ Rate limit excedido. Reintentando en ${delay/1000} segundos... (Intento ${attempt}/${maxRetries})`);
          
          // Esperar antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Si no es rate limit o es el último intento, manejar el error
        this.handleError(error, 'registerMovement');
        throw error;
      }
    }
    
    // Esto no debería ejecutarse nunca, pero por seguridad
    throw new Error('Error registrando movimiento después de múltiples intentos');
  }

  async getMovements(employeeId: string, filters: Record<string, string | number> = {}): Promise<MovementRecord[]> {
    try {
      if (!employeeId) {
        throw new Error('ID de empleado es requerido');
      }
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      const url = queryString ? `/api/employees/${employeeId}/extras?${queryString}` : `/api/employees/${employeeId}/extras`;
      const response = await api.get(url);
      
      // El backend devuelve: { success: true, data: { movements: [], statistics: {...} } }
      if (response.data?.success && response.data?.data?.movements) {
        return response.data.data.movements;
      }
      
      // Fallback para formato anterior
      return response.data || [];
    } catch (error) {
      this.handleError(error, 'getMovements');
      return []; // Para satisfacer el tipo de retorno
    }
  }

  async getOvertimeRecords(employeeId: string, filters: Record<string, string | number> = {}): Promise<MovementRecord[]> {
    try {
      if (!employeeId) {
        throw new Error('ID de empleado es requerido');
      }
      
      // Usar el endpoint general de movimientos y filtrar por tipo 'overtime'
      const allMovements = await this.getMovements(employeeId, filters);
      
      // Filtrar solo los movimientos de tipo 'overtime'
      const overtimeMovements = allMovements.filter(movement => movement.type === 'overtime');
      
      console.log('🔍 Movimientos encontrados:', allMovements.length);
      console.log('⏰ Horas extra filtradas:', overtimeMovements.length);
      
      return overtimeMovements;
    } catch (error) {
      console.error('Error en getOvertimeRecords, intentando endpoint específico...', error);
      
      // Fallback al endpoint específico si el general falla
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        const queryString = params.toString();
        const url = queryString ? `/api/employees/${employeeId}/overtime?${queryString}` : `/api/employees/${employeeId}/overtime`;
        const response = await api.get(url);
        
        if (response.data?.success && response.data?.data?.movements) {
          return response.data.data.movements;
        }
        
        return response.data || [];
      } catch (fallbackError) {
        this.handleError(fallbackError, 'getOvertimeRecords');
        return [];
      }
    }
  }

  async getAbsenceRecords(employeeId: string, filters: Record<string, string | number> = {}): Promise<MovementRecord[]> {
    try {
      if (!employeeId) {
        throw new Error('ID de empleado es requerido');
      }
      
      // Usar el endpoint general de movimientos y filtrar por tipo 'absence'
      const allMovements = await this.getMovements(employeeId, filters);
      
      // Filtrar solo los movimientos de tipo 'absence'
      const absenceMovements = allMovements.filter(movement => movement.type === 'absence');
      
      console.log('🔍 Movimientos encontrados:', allMovements.length);
      console.log('🚫 Ausencias filtradas:', absenceMovements.length);
      
      return absenceMovements;
    } catch (error) {
      console.error('Error en getAbsenceRecords, intentando endpoint específico...', error);
      
      // Fallback al endpoint específico si el general falla
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        const queryString = params.toString();
        const url = queryString ? `/api/employees/${employeeId}/absences?${queryString}` : `/api/employees/${employeeId}/absences`;
        const response = await api.get(url);
        
        if (response.data?.success && response.data?.data?.movements) {
          return response.data.data.movements;
        }
        
        return response.data || [];
      } catch (fallbackError) {
        this.handleError(fallbackError, 'getAbsenceRecords');
        return [];
      }
    }
  }

  async getLoanRecords(employeeId: string, filters: Record<string, string | number> = {}): Promise<MovementRecord[]> {
    try {
      if (!employeeId) {
        throw new Error('ID de empleado es requerido');
      }
      
      // Usar el endpoint general de movimientos y filtrar por tipo 'loan'
      // Esto es más confiable que el endpoint específico de loans que puede tener problemas
      const allMovements = await this.getMovements(employeeId, filters);
      
      // Filtrar solo los movimientos de tipo 'loan'
      const loanMovements = allMovements.filter(movement => movement.type === 'loan');
      
      console.log('🔍 Movimientos encontrados:', allMovements.length);
      console.log('💰 Préstamos filtrados:', loanMovements.length);
      
      return loanMovements;
    } catch (error) {
      console.error('Error en getLoanRecords, intentando endpoint específico...', error);
      
      // Fallback al endpoint específico si el general falla
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        const queryString = params.toString();
        const url = queryString ? `/api/employees/${employeeId}/loans?${queryString}` : `/api/employees/${employeeId}/loans`;
        const response = await api.get(url);
        
        // El backend devuelve: { success: true, data: { movements: [], statistics: {...} } }
        if (response.data?.success && response.data?.data?.movements) {
          return response.data.data.movements;
        }
        
        return response.data || [];
      } catch (fallbackError) {
        this.handleError(fallbackError, 'getLoanRecords');
        return [];
      }
    }
  }

  async getBonusRecords(employeeId: string, filters: Record<string, string | number> = {}): Promise<MovementRecord[]> {
    try {
      if (!employeeId) {
        throw new Error('ID de empleado es requerido');
      }
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      const url = queryString ? `/api/employees/${employeeId}/bonuses?${queryString}` : `/api/employees/${employeeId}/bonuses`;
      const response = await api.get(url);
      
      // El backend devuelve: { success: true, data: { movements: [], statistics: {...} } }
      if (response.data?.success && response.data?.data?.movements) {
        return response.data.data.movements;
      }
      
      // Fallback para formato anterior
      return response.data || [];
    } catch (error) {
      this.handleError(error, 'getBonusRecords');
      return [];
    }
  }

  async getDeductionRecords(employeeId: string, filters: Record<string, string | number> = {}): Promise<MovementRecord[]> {
    try {
      if (!employeeId) {
        throw new Error('ID de empleado es requerido');
      }
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      const url = queryString ? `/api/employees/${employeeId}/deductions?${queryString}` : `/api/employees/${employeeId}/deductions`;
      const response = await api.get(url);
      
      // El backend devuelve: { success: true, data: { movements: [], statistics: {...} } }
      if (response.data?.success && response.data?.data?.movements) {
        return response.data.data.movements;
      }
      
      // Fallback para formato anterior
      return response.data || [];
    } catch (error) {
      this.handleError(error, 'getDeductionRecords');
      return [];
    }
  }

  async getDamageRecords(employeeId: string, filters: Record<string, string | number> = {}): Promise<MovementRecord[]> {
    try {
      if (!employeeId) {
        throw new Error('ID de empleado es requerido');
      }
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      const url = queryString ? `/api/employees/${employeeId}/damages?${queryString}` : `/api/employees/${employeeId}/damages`;
      const response = await api.get(url);
      
      // El backend devuelve: { success: true, data: { movements: [], statistics: {...} } }
      if (response.data?.success && response.data?.data?.movements) {
        return response.data.data.movements;
      }
      
      // Fallback para formato anterior
      return response.data || [];
    } catch (error) {
      this.handleError(error, 'getDamageRecords');
      return [];
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
      // Validar parámetros requeridos
      if (!employeeId) {
        throw new Error('ID de empleado es requerido');
      }
      
      // Si no se proporcionan fechas, usar últimos 30 días
      if (!startDate || !endDate) {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        endDate = endDate || today.toISOString().split('T')[0];
        startDate = startDate || thirtyDaysAgo.toISOString().split('T')[0];
      }
      
      // Validar rango de fechas
      this.validateDateRange(startDate, endDate);
      
      const params = new URLSearchParams();
      params.append('startDate', startDate);
      params.append('endDate', endDate);
      
      const response = await api.get(`/api/employees/${employeeId}/movements-summary?${params}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getMovementsSummary');
      throw error; // Re-lanzar para que el caller pueda manejar el error
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
      console.log('📊 Respuesta completa de getChartData:', response.data);
      
      // La API puede devolver datos en diferentes formatos
      if (response.data && response.data.data && response.data.data.chartData) {
        return response.data.data.chartData;
      } else if (response.data && response.data.chartData) {
        return response.data.chartData;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('⚠️ Formato de respuesta no reconocido para chart-data:', response.data);
        return [];
      }
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
    const maxRetries = 3;
    const baseDelay = 1500; // 1.5 segundos
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('employeeId', employeeId);
        formData.append('movementType', movementType);
        if (movementId) formData.append('movementId', movementId);
        
        console.log(`📤 Intento ${attempt}/${maxRetries} - Subiendo ${files.length} archivo(s)...`);
        
        const response = await api.post('/api/attachments', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Manejar diferentes formatos de respuesta del backend
        if (response.data?.success && response.data?.data?.files) {
          const fileIds = response.data.data.files.map((file: { id?: string; path?: string; url?: string }) => file.id || file.path || file.url || '');
          console.log(`✅ Archivos subidos exitosamente en intento ${attempt}:`, fileIds);
          return fileIds;
        } else if (response.data?.filePaths) {
          console.log(`✅ Archivos subidos exitosamente en intento ${attempt}:`, response.data.filePaths);
          return response.data.filePaths;
        } else if (response.data?.files) {
          const fileIds = response.data.files.map((file: { id?: string; path?: string; url?: string }) => file.id || file.path || file.url || '');
          console.log(`✅ Archivos subidos exitosamente en intento ${attempt}:`, fileIds);
          return fileIds;
        } else if (Array.isArray(response.data)) {
          const fileIds = response.data.map((file: { id?: string; path?: string; url?: string }) => file.id || file.path || file.url || '');
          console.log(`✅ Archivos subidos exitosamente en intento ${attempt}:`, fileIds);
          return fileIds;
        }
        
        console.warn('Formato de respuesta inesperado:', response.data);
        return [];
        
      } catch (error) {
        const isRateLimitError = error instanceof Error && 
          (error.message.includes('Rate limit exceeded') || 
           error.message.includes('rate limit') ||
           error.message.includes('429'));
        
        if (isRateLimitError && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.warn(`⚠️ Rate limit excedido en subida de archivos. Reintentando en ${delay/1000} segundos... (Intento ${attempt}/${maxRetries})`);
          
          // Esperar antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Si no es rate limit o es el último intento, manejar el error
        console.error(`❌ Error uploading files en intento ${attempt}:`, error);
        this.handleError(error, 'uploadFiles');
        throw error;
      }
    }
    
    // Esto no debería ejecutarse nunca, pero por seguridad
    throw new Error('Error subiendo archivos después de múltiples intentos');
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
      case 'overtime': {
        const multipliers = { regular: 1.5, weekend: 2.0, holiday: 3.0 };
        const multiplier = multipliers[movementData.overtimeType || 'regular'];
        return (movementData.hours || 0) * hourlyRate * multiplier;
      }
      
      case 'absence': {
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
      }
      
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

  // APROBACIÓN Y RECHAZO DE MOVIMIENTOS
  async approveMovement(movementId: string, employeeId: string, comments?: string): Promise<MovementRecord> {
    try {
      console.log(`✅ Aprobando movimiento ${movementId} para empleado ${employeeId}`);
      
      const response = await api.put(`/api/employees/extras/${movementId}/approve`, {
        employeeId,
        comments: comments || 'Aprobado por supervisor'
      });
      
      console.log(`✅ Movimiento aprobado exitosamente:`, response.data);
      return response.data;
      
    } catch (error) {
      this.handleError(error, 'approveMovement');
      throw error;
    }
  }

  async rejectMovement(movementId: string, employeeId: string, reason: string): Promise<MovementRecord> {
    try {
      console.log(`❌ Rechazando movimiento ${movementId} para empleado ${employeeId}. Razón: ${reason}`);
      
      const response = await api.put(`/api/employees/extras/${movementId}/reject`, {
        employeeId,
        reason
      });
      
      console.log(`✅ Movimiento rechazado exitosamente:`, response.data);
      return response.data;
      
    } catch (error) {
      this.handleError(error, 'rejectMovement');
      throw error;
    }
  }
}

export const extrasService = new ExtrasService();
export default extrasService;
