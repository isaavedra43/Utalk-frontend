import api from './api';
import { handleApiError } from '../config/apiConfig';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface VacationRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  days: number;
  type: 'vacation' | 'personal' | 'sick_leave' | 'maternity' | 'paternity' | 'unpaid' | 'compensatory';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedDate: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectedReason?: string;
  attachments?: string[];
  comments?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVacationRequest {
  startDate: string;
  endDate: string;
  type: VacationRequest['type'];
  reason: string;
  comments?: string;
  attachments?: string[];
}

export interface VacationBalance {
  total: number;
  used: number;
  available: number;
  pending: number;
  expired: number;
  nextExpiration?: string;
}

export interface VacationPayment {
  id: string;
  employeeId: string;
  vacationRequestId: string;
  paymentDate: string;
  days: number;
  dailySalary: number;
  vacationAmount: number; // Salario por días de vacaciones
  primaVacacional: number; // 25% del salario de vacaciones
  totalAmount: number; // Total a pagar
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod: 'cash' | 'bank_transfer' | 'payroll';
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VacationPaymentCalculation {
  employeeId: string;
  employeeName: string;
  dailySalary: number;
  vacationDays: number;
  vacationAmount: number;
  primaVacacional: number;
  totalAmount: number;
  breakdown: {
    baseSalary: number;
    primaVacacional: number;
    total: number;
  };
  legalBasis: {
    law: string;
    article: string;
    percentage: number;
  };
}

export interface VacationPaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalOwed: number;
  paymentsCount: number;
  pendingCount: number;
  lastPaymentDate?: string;
  nextPaymentDue?: string;
}

export interface VacationPolicy {
  annualDays: number;
  accrualRate: number; // días por mes
  maxCarryover: number;
  probationPeriod: number; // meses
  advanceRequest: number; // días de anticipación
  blackoutPeriods: Array<{
    startDate: string;
    endDate: string;
    reason: string;
  }>;
}

export interface VacationsSummary {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  totalDaysUsed: number;
  totalDaysPending: number;
  averageDaysPerRequest: number;
  mostUsedMonth: string;
  lastVacation?: VacationRequest;
  byType: Record<string, number>;
  byMonth: Record<string, number>;
  upcomingVacations: VacationRequest[];
}

export interface VacationsData {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  hireDate: string;
  balance: VacationBalance;
  policy: VacationPolicy;
  requests: VacationRequest[];
  summary: VacationsSummary;
}

// ============================================================================
// VACATIONS SERVICE
// ============================================================================

class VacationsService {
  // Helper para manejar errores de API
  private handleError(error: unknown, context: string): never {
    const errorMessage = handleApiError(error);
    console.error(`❌ VacationsService.${context}:`, errorMessage);
    throw new Error(errorMessage);
  }

  /**
   * Obtener datos completos de vacaciones de un empleado
   */
  async getVacationsData(employeeId: string): Promise<VacationsData> {
    try {
      console.log('🔍 Obteniendo datos de vacaciones:', { employeeId });
      
      const response = await api.get(`/api/employees/${employeeId}/vacations`);
      
      console.log('✅ Datos de vacaciones obtenidos');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getVacationsData');
    }
  }

  /**
   * Obtener balance de vacaciones
   */
  async getBalance(employeeId: string): Promise<VacationBalance> {
    try {
      console.log('🔍 Obteniendo balance de vacaciones:', { employeeId });
      
      const response = await api.get(`/api/employees/${employeeId}/vacations/balance`);
      
      console.log('✅ Balance obtenido');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getBalance');
    }
  }

  /**
   * Obtener solicitudes de vacaciones
   */
  async getRequests(employeeId: string, filters: Record<string, unknown> = {}): Promise<VacationRequest[]> {
    try {
      console.log('🔍 Obteniendo solicitudes:', { employeeId, filters });
      
      const response = await api.get(`/api/employees/${employeeId}/vacations/requests`, { params: filters });
      
      const requests = response.data.data || response.data;
      console.log(`✅ ${requests.length} solicitudes obtenidas`);
      return requests;
    } catch (error) {
      this.handleError(error, 'getRequests');
    }
  }

  /**
   * Crear solicitud de vacaciones
   */
  async createRequest(employeeId: string, requestData: CreateVacationRequest): Promise<VacationRequest> {
    try {
      console.log('📝 Creando solicitud de vacaciones:', { employeeId, requestData });
      
      const response = await api.post(`/api/employees/${employeeId}/vacations/requests`, requestData);
      
      console.log('✅ Solicitud creada exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'createRequest');
    }
  }

  /**
   * Actualizar solicitud de vacaciones
   */
  async updateRequest(
    employeeId: string,
    requestId: string,
    updateData: Partial<CreateVacationRequest>
  ): Promise<VacationRequest> {
    try {
      console.log('📝 Actualizando solicitud:', { employeeId, requestId, updateData });
      
      const response = await api.put(`/api/employees/${employeeId}/vacations/requests/${requestId}`, updateData);
      
      console.log('✅ Solicitud actualizada');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'updateRequest');
    }
  }

  /**
   * Cancelar solicitud de vacaciones
   */
  async cancelRequest(employeeId: string, requestId: string, reason?: string): Promise<VacationRequest> {
    try {
      console.log('❌ Cancelando solicitud:', { employeeId, requestId });
      
      const response = await api.put(`/api/employees/${employeeId}/vacations/requests/${requestId}/cancel`, {
        reason
      });
      
      console.log('✅ Solicitud cancelada');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'cancelRequest');
    }
  }

  /**
   * Eliminar solicitud de vacaciones
   */
  async deleteRequest(employeeId: string, requestId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando solicitud:', { employeeId, requestId });
      
      await api.delete(`/api/employees/${employeeId}/vacations/requests/${requestId}`);
      
      console.log('✅ Solicitud eliminada');
    } catch (error) {
      this.handleError(error, 'deleteRequest');
    }
  }

  /**
   * Aprobar solicitud de vacaciones
   */
  async approveRequest(employeeId: string, requestId: string, comments?: string): Promise<VacationRequest> {
    try {
      console.log('✅ Aprobando solicitud:', { employeeId, requestId });
      
      const response = await api.put(`/api/employees/${employeeId}/vacations/requests/${requestId}/approve`, {
        comments
      });
      
      console.log('✅ Solicitud aprobada');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'approveRequest');
    }
  }

  /**
   * Rechazar solicitud de vacaciones
   */
  async rejectRequest(employeeId: string, requestId: string, reason: string): Promise<VacationRequest> {
    try {
      console.log('❌ Rechazando solicitud:', { employeeId, requestId });
      
      const response = await api.put(`/api/employees/${employeeId}/vacations/requests/${requestId}/reject`, {
        reason
      });
      
      console.log('✅ Solicitud rechazada');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'rejectRequest');
    }
  }

  /**
   * Obtener política de vacaciones
   */
  async getPolicy(employeeId: string): Promise<VacationPolicy> {
    try {
      console.log('🔍 Obteniendo política de vacaciones:', { employeeId });
      
      const response = await api.get(`/api/employees/${employeeId}/vacations/policy`);
      
      console.log('✅ Política obtenida');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getPolicy');
    }
  }

  /**
   * Obtener historial de vacaciones
   */
  async getHistory(employeeId: string, year?: number): Promise<VacationRequest[]> {
    try {
      console.log('📜 Obteniendo historial:', { employeeId, year });
      
      const response = await api.get(`/api/employees/${employeeId}/vacations/history`, {
        params: year ? { year } : {}
      });
      
      const history = response.data.data || response.data;
      console.log(`✅ ${history.length} registros de historial obtenidos`);
      return history;
    } catch (error) {
      this.handleError(error, 'getHistory');
    }
  }

  /**
   * Obtener resumen estadístico
   */
  async getSummary(employeeId: string): Promise<VacationsSummary> {
    try {
      console.log('📊 Obteniendo resumen:', { employeeId });
      
      const response = await api.get(`/api/employees/${employeeId}/vacations/summary`);
      
      console.log('✅ Resumen obtenido');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getSummary');
    }
  }

  /**
   * Calcular días de vacaciones
   */
  async calculateDays(employeeId: string, startDate: string, endDate: string): Promise<number> {
    try {
      console.log('🧮 Calculando días:', { employeeId, startDate, endDate });
      
      const response = await api.post(`/api/employees/${employeeId}/vacations/calculate-days`, {
        startDate,
        endDate
      });
      
      const days = response.data.data?.days || response.data.days || 0;
      console.log('✅ Días calculados:', days);
      return days;
    } catch (error) {
      this.handleError(error, 'calculateDays');
    }
  }

  /**
   * Verificar disponibilidad de fechas
   */
  async checkAvailability(
    employeeId: string,
    startDate: string,
    endDate: string
  ): Promise<{ available: boolean; conflicts: string[]; suggestions?: string[] }> {
    try {
      console.log('🔍 Verificando disponibilidad:', { employeeId, startDate, endDate });
      
      const response = await api.post(`/api/employees/${employeeId}/vacations/check-availability`, {
        startDate,
        endDate
      });
      
      console.log('✅ Disponibilidad verificada');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'checkAvailability');
    }
  }

  /**
   * Subir archivos adjuntos
   */
  async uploadAttachments(files: File[]): Promise<string[]> {
    try {
      console.log('📎 Subiendo archivos adjuntos:', files.length);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await api.post('/api/vacations/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const attachmentIds = response.data.data?.attachmentIds || response.data.attachmentIds || [];
      console.log('✅ Archivos subidos:', attachmentIds);
      return attachmentIds;
    } catch (error) {
      this.handleError(error, 'uploadAttachments');
    }
  }

  // ============================================================================
  // VACATION PAYMENT CALCULATION METHODS
  // ============================================================================

  /**
   * Calcula el pago de vacaciones según la Ley Federal del Trabajo
   */
  async calculateVacationPayment(
    employeeId: string, 
    vacationDays: number, 
    dailySalary?: number
  ): Promise<VacationPaymentCalculation> {
    try {
      console.log('💰 Calculando pago de vacaciones para empleado:', employeeId);
      
      const response = await api.post('/api/vacations/calculate-payment', {
        employeeId,
        vacationDays,
        dailySalary
      });
      
      const calculation = response.data.data || response.data;
      console.log('✅ Cálculo de pago generado:', calculation);
      return calculation;
    } catch (error) {
      this.handleError(error, 'calculateVacationPayment');
    }
  }

  /**
   * Calcula días de vacaciones según antigüedad (Ley Federal del Trabajo)
   */
  calculateVacationDaysBySeniority(yearsOfService: number): number {
    const vacationDaysMap: { [key: number]: number } = {
      0: 6,   // Menos de 1 año
      1: 6,   // 1 año
      2: 8,   // 2 años
      3: 10,  // 3 años
      4: 12,  // 4 años
      5: 14,  // 5-9 años
      6: 14,
      7: 14,
      8: 14,
      9: 14,
      10: 16, // 10-14 años
      11: 16,
      12: 16,
      13: 16,
      14: 16,
      15: 18, // 15-19 años
      16: 18,
      17: 18,
      18: 18,
      19: 18,
      20: 20, // 20-24 años
      21: 20,
      22: 20,
      23: 20,
      24: 20,
      25: 22  // 25+ años
    };

    return vacationDaysMap[Math.min(yearsOfService, 25)] || 22;
  }

  /**
   * Calcula el pago de vacaciones con prima vacacional (25%)
   */
  calculateVacationPaymentAmount(
    dailySalary: number, 
    vacationDays: number
  ): { vacationAmount: number; primaVacacional: number; totalAmount: number } {
    const vacationAmount = dailySalary * vacationDays;
    const primaVacacional = vacationAmount * 0.25; // 25% según LFT
    const totalAmount = vacationAmount + primaVacacional;

    return {
      vacationAmount,
      primaVacacional,
      totalAmount
    };
  }

  /**
   * Obtiene el resumen de pagos de vacaciones de un empleado
   */
  async getVacationPaymentSummary(employeeId: string): Promise<VacationPaymentSummary> {
    try {
      console.log('📊 Obteniendo resumen de pagos de vacaciones:', employeeId);
      
      const response = await api.get(`/api/vacations/payments/summary/${employeeId}`);
      
      const summary = response.data.data || response.data;
      console.log('✅ Resumen de pagos obtenido:', summary);
      return summary;
    } catch (error) {
      this.handleError(error, 'getVacationPaymentSummary');
    }
  }

  /**
   * Obtiene el historial de pagos de vacaciones
   */
  async getVacationPayments(employeeId: string): Promise<VacationPayment[]> {
    try {
      console.log('📋 Obteniendo historial de pagos de vacaciones:', employeeId);
      
      const response = await api.get(`/api/vacations/payments/${employeeId}`);
      
      const payments = response.data.data || response.data;
      console.log('✅ Historial de pagos obtenido:', payments.length, 'registros');
      return payments;
    } catch (error) {
      this.handleError(error, 'getVacationPayments');
    }
  }

  /**
   * Procesa un pago de vacaciones
   */
  async processVacationPayment(paymentData: {
    employeeId: string;
    vacationRequestId: string;
    days: number;
    dailySalary: number;
    paymentMethod: 'cash' | 'bank_transfer' | 'payroll';
    paymentReference?: string;
    notes?: string;
  }): Promise<VacationPayment> {
    try {
      console.log('💳 Procesando pago de vacaciones:', paymentData);
      
      // Calcular montos
      const amounts = this.calculateVacationPaymentAmount(
        paymentData.dailySalary, 
        paymentData.days
      );
      
      const response = await api.post('/api/vacations/payments', {
        ...paymentData,
        vacationAmount: amounts.vacationAmount,
        primaVacacional: amounts.primaVacacional,
        totalAmount: amounts.totalAmount,
        status: 'pending'
      });
      
      const payment = response.data.data || response.data;
      console.log('✅ Pago procesado:', payment.id);
      return payment;
    } catch (error) {
      this.handleError(error, 'processVacationPayment');
    }
  }

  /**
   * Marca un pago como realizado
   */
  async markPaymentAsPaid(
    paymentId: string, 
    paymentReference: string,
    paymentMethod: 'cash' | 'bank_transfer' | 'payroll'
  ): Promise<VacationPayment> {
    try {
      console.log('✅ Marcando pago como realizado:', paymentId);
      
      const response = await api.put(`/api/vacations/payments/${paymentId}/mark-paid`, {
        paymentReference,
        paymentMethod,
        status: 'paid',
        paymentDate: new Date().toISOString()
      });
      
      const payment = response.data.data || response.data;
      console.log('✅ Pago marcado como realizado');
      return payment;
    } catch (error) {
      this.handleError(error, 'markPaymentAsPaid');
    }
  }

  /**
   * Cancela un pago pendiente
   */
  async cancelPayment(paymentId: string, reason: string): Promise<VacationPayment> {
    try {
      console.log('❌ Cancelando pago:', paymentId);
      
      const response = await api.put(`/api/vacations/payments/${paymentId}/cancel`, {
        status: 'cancelled',
        notes: reason
      });
      
      const payment = response.data.data || response.data;
      console.log('✅ Pago cancelado');
      return payment;
    } catch (error) {
      this.handleError(error, 'cancelPayment');
    }
  }

  /**
   * Obtiene todos los pagos pendientes de la empresa
   */
  async getPendingPayments(): Promise<VacationPayment[]> {
    try {
      console.log('⏳ Obteniendo pagos pendientes');
      
      const response = await api.get('/api/vacations/payments/pending');
      
      const payments = response.data.data || response.data;
      console.log('✅ Pagos pendientes obtenidos:', payments.length, 'registros');
      return payments;
    } catch (error) {
      this.handleError(error, 'getPendingPayments');
    }
  }

  /**
   * Genera reporte de pagos de vacaciones
   */
  async generatePaymentReport(params: {
    startDate?: string;
    endDate?: string;
    status?: 'pending' | 'paid' | 'cancelled';
    format?: 'excel' | 'pdf';
  }): Promise<Blob> {
    try {
      console.log('📊 Generando reporte de pagos de vacaciones');
      
      const response = await api.post('/api/vacations/payments/report', params, {
        responseType: 'blob'
      });
      
      console.log('✅ Reporte generado');
      return response.data;
    } catch (error) {
      this.handleError(error, 'generatePaymentReport');
    }
  }

  /**
   * Exportar vacaciones a Excel/PDF
   */
  async exportVacations(
    employeeId: string,
    format: 'excel' | 'pdf' = 'excel',
    year?: number
  ): Promise<Blob> {
    try {
      console.log('📥 Exportando vacaciones:', { employeeId, format, year });
      
      const response = await api.get(`/api/employees/${employeeId}/vacations/export`, {
        params: { format, year },
        responseType: 'blob'
      });
      
      console.log('✅ Vacaciones exportadas');
      return response.data;
    } catch (error) {
      this.handleError(error, 'exportVacations');
    }
  }

  /**
   * Generar calendario de vacaciones
   */
  async getCalendar(employeeId: string, year: number, month: number): Promise<any> {
    try {
      console.log('📅 Obteniendo calendario:', { employeeId, year, month });
      
      const response = await api.get(`/api/employees/${employeeId}/vacations/calendar`, {
        params: { year, month }
      });
      
      console.log('✅ Calendario obtenido');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getCalendar');
    }
  }
}

// Exportar instancia única del servicio
export const vacationsService = new VacationsService();
export default vacationsService;

