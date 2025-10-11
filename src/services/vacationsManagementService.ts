import api from './api';
import { handleApiError } from '../config/apiConfig';

// ============================================================================
// COMPREHENSIVE VACATIONS MANAGEMENT SERVICE
// ============================================================================

// ============================================================================
// TYPES (Re-export for convenience)
// ============================================================================

export type {
  VacationRequest,
  VacationBalance,
  VacationPayment,
  VacationEvidence,
  VacationAnalytics,
  VacationReport,
  VacationPolicy,
  VacationAlert,
  VacationConflict,
  VacationDashboard,
  VacationFilters,
  VacationSearchParams,
  BulkVacationOperation,
  VacationCalendarView,
  VacationExportOptions,
  VacationApiResponse,
  VacationSummary,
  CreateVacationRequestForm,
  UpdateVacationRequestForm,
  VacationPaymentForm,
  VacationViewMode,
  VacationTabType,
  VacationNavigationState
} from '../types/vacations';

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

class VacationsManagementService {
  private baseEndpoint = '/api/vacations/management';
  private requestsEndpoint = '/api/vacations/requests';
  private paymentsEndpoint = '/api/vacations/payments';
  private evidencesEndpoint = '/api/vacations/evidences';
  private analyticsEndpoint = '/api/vacations/analytics';
  private policiesEndpoint = '/api/vacations/policies';
  private alertsEndpoint = '/api/vacations/alerts';

  // Helper para manejar errores
  private handleError(error: unknown, context: string): never {
    const errorMessage = handleApiError(error);
    console.error(`❌ VacationsManagementService.${context}:`, errorMessage);
    throw new Error(errorMessage);
  }

  // ============================================================================
  // DASHBOARD AND OVERVIEW
  // ============================================================================

  /**
   * Obtener dashboard principal de vacaciones
   */
  async getDashboard(): Promise<VacationDashboard> {
    try {
      console.log('📊 Obteniendo dashboard de vacaciones');
      const response = await api.get(`${this.baseEndpoint}/dashboard`);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getDashboard');
    }
  }

  /**
   * Obtener resumen ejecutivo
   */
  async getSummary(filters: VacationFilters = {}): Promise<VacationSummary> {
    try {
      console.log('📈 Obteniendo resumen de vacaciones:', filters);
      const response = await api.get(`${this.baseEndpoint}/summary`, { params: filters });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getSummary');
    }
  }

  // ============================================================================
  // VACATION REQUESTS MANAGEMENT
  // ============================================================================

  /**
   * Obtener todas las solicitudes de vacaciones con filtros
   */
  async getAllRequests(params: VacationSearchParams = { filters: {} }): Promise<{
    requests: VacationRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      console.log('📋 Obteniendo solicitudes de vacaciones:', params);
      const response = await api.get(`${this.requestsEndpoint}`, { params });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getAllRequests');
    }
  }

  /**
   * Obtener solicitud específica por ID
   */
  async getRequestById(requestId: string): Promise<VacationRequest> {
    try {
      console.log('🔍 Obteniendo solicitud:', requestId);
      const response = await api.get(`${this.requestsEndpoint}/${requestId}`);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getRequestById');
    }
  }

  /**
   * Crear nueva solicitud de vacaciones
   */
  async createRequest(requestData: CreateVacationRequestForm): Promise<VacationRequest> {
    try {
      console.log('📝 Creando solicitud de vacaciones:', requestData);
      const response = await api.post(`${this.requestsEndpoint}`, requestData);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'createRequest');
    }
  }

  /**
   * Actualizar solicitud de vacaciones
   */
  async updateRequest(requestId: string, updateData: UpdateVacationRequestForm): Promise<VacationRequest> {
    try {
      console.log('📝 Actualizando solicitud:', requestId, updateData);
      const response = await api.put(`${this.requestsEndpoint}/${requestId}`, updateData);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'updateRequest');
    }
  }

  /**
   * Aprobar solicitud de vacaciones
   */
  async approveRequest(requestId: string, comments?: string): Promise<VacationRequest> {
    try {
      console.log('✅ Aprobando solicitud:', requestId);
      const response = await api.put(`${this.requestsEndpoint}/${requestId}/approve`, { comments });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'approveRequest');
    }
  }

  /**
   * Rechazar solicitud de vacaciones
   */
  async rejectRequest(requestId: string, reason: string): Promise<VacationRequest> {
    try {
      console.log('❌ Rechazando solicitud:', requestId, reason);
      const response = await api.put(`${this.requestsEndpoint}/${requestId}/reject`, { reason });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'rejectRequest');
    }
  }

  /**
   * Cancelar solicitud de vacaciones
   */
  async cancelRequest(requestId: string, reason?: string): Promise<VacationRequest> {
    try {
      console.log('🚫 Cancelando solicitud:', requestId);
      const response = await api.put(`${this.requestsEndpoint}/${requestId}/cancel`, { reason });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'cancelRequest');
    }
  }

  /**
   * Eliminar solicitud de vacaciones
   */
  async deleteRequest(requestId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando solicitud:', requestId);
      await api.delete(`${this.requestsEndpoint}/${requestId}`);
    } catch (error) {
      this.handleError(error, 'deleteRequest');
    }
  }

  /**
   * Operaciones en lote
   */
  async bulkOperation(operation: BulkVacationOperation): Promise<{
    success: number;
    failed: number;
    results: Array<{ requestId: string; success: boolean; message?: string }>;
  }> {
    try {
      console.log('🔄 Ejecutando operación en lote:', operation);
      const response = await api.post(`${this.requestsEndpoint}/bulk`, operation);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'bulkOperation');
    }
  }

  /**
   * Obtener conflictos de fechas
   */
  async getConflicts(dateRange?: { startDate: string; endDate: string }): Promise<VacationConflict[]> {
    try {
      console.log('⚠️ Obteniendo conflictos de vacaciones');
      const response = await api.get(`${this.requestsEndpoint}/conflicts`, {
        params: dateRange
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getConflicts');
    }
  }

  /**
   * Resolver conflicto
   */
  async resolveConflict(conflictId: string, resolution: {
    action: string;
    targetEmployee?: string;
    newDate?: { startDate: string; endDate: string };
    comments?: string;
  }): Promise<VacationConflict> {
    try {
      console.log('✅ Resolviendo conflicto:', conflictId, resolution);
      const response = await api.put(`${this.requestsEndpoint}/conflicts/${conflictId}/resolve`, resolution);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'resolveConflict');
    }
  }

  // ============================================================================
  // CALENDAR AND SCHEDULING
  // ============================================================================

  /**
   * Obtener vista de calendario
   */
  async getCalendarView(year: number, month: number): Promise<VacationCalendarView> {
    try {
      console.log('📅 Obteniendo vista de calendario:', { year, month });
      const response = await api.get(`${this.baseEndpoint}/calendar`, {
        params: { year, month }
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getCalendarView');
    }
  }

  /**
   * Obtener eventos de calendario por rango de fechas
   */
  async getCalendarEvents(startDate: string, endDate: string): Promise<VacationCalendarView['events']> {
    try {
      console.log('📅 Obteniendo eventos de calendario:', { startDate, endDate });
      const response = await api.get(`${this.baseEndpoint}/calendar/events`, {
        params: { startDate, endDate }
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getCalendarEvents');
    }
  }

  /**
   * Verificar capacidad de fechas
   */
  async checkCapacity(startDate: string, endDate: string): Promise<{
    available: boolean;
    capacity: number;
    currentUsage: number;
    conflicts: string[];
    suggestions?: Array<{ startDate: string; endDate: string; capacity: number }>;
  }> {
    try {
      console.log('🔍 Verificando capacidad:', { startDate, endDate });
      const response = await api.post(`${this.baseEndpoint}/capacity/check`, {
        startDate,
        endDate
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'checkCapacity');
    }
  }

  // ============================================================================
  // PAYMENTS MANAGEMENT
  // ============================================================================

  /**
   * Obtener todos los pagos de vacaciones
   */
  async getAllPayments(params: VacationSearchParams = { filters: {} }): Promise<{
    payments: VacationPayment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      console.log('💰 Obteniendo pagos de vacaciones:', params);
      const response = await api.get(`${this.paymentsEndpoint}`, { params });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getAllPayments');
    }
  }

  /**
   * Crear pago de vacaciones
   */
  async createPayment(paymentData: VacationPaymentForm): Promise<VacationPayment> {
    try {
      console.log('💰 Creando pago de vacaciones:', paymentData);
      const response = await api.post(`${this.paymentsEndpoint}`, paymentData);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'createPayment');
    }
  }

  /**
   * Procesar pago
   */
  async processPayment(paymentId: string): Promise<VacationPayment> {
    try {
      console.log('💰 Procesando pago:', paymentId);
      const response = await api.put(`${this.paymentsEndpoint}/${paymentId}/process`);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'processPayment');
    }
  }

  /**
   * Cancelar pago
   */
  async cancelPayment(paymentId: string, reason?: string): Promise<VacationPayment> {
    try {
      console.log('💰 Cancelando pago:', paymentId);
      const response = await api.put(`${this.paymentsEndpoint}/${paymentId}/cancel`, { reason });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'cancelPayment');
    }
  }

  /**
   * Obtener pagos pendientes
   */
  async getPendingPayments(): Promise<VacationPayment[]> {
    try {
      console.log('💰 Obteniendo pagos pendientes');
      const response = await api.get(`${this.paymentsEndpoint}/pending`);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getPendingPayments');
    }
  }

  // ============================================================================
  // EVIDENCES MANAGEMENT
  // ============================================================================

  /**
   * Obtener todas las evidencias
   */
  async getAllEvidences(params: VacationSearchParams = { filters: {} }): Promise<{
    evidences: VacationEvidence[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      console.log('📄 Obteniendo evidencias de vacaciones:', params);
      const response = await api.get(`${this.evidencesEndpoint}`, { params });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getAllEvidences');
    }
  }

  /**
   * Subir evidencia
   */
  async uploadEvidence(evidenceData: VacationEvidenceUpload): Promise<VacationEvidence[]> {
    try {
      console.log('📄 Subiendo evidencia:', evidenceData);
      const formData = new FormData();
      formData.append('vacationRequestId', evidenceData.vacationRequestId);
      formData.append('type', evidenceData.type);
      if (evidenceData.description) {
        formData.append('description', evidenceData.description);
      }
      if (evidenceData.tags) {
        formData.append('tags', JSON.stringify(evidenceData.tags));
      }

      evidenceData.files.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post(`${this.evidencesEndpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'uploadEvidence');
    }
  }

  /**
   * Verificar evidencia
   */
  async verifyEvidence(evidenceId: string, verified: boolean, comments?: string): Promise<VacationEvidence> {
    try {
      console.log('✅ Verificando evidencia:', evidenceId, verified);
      const response = await api.put(`${this.evidencesEndpoint}/${evidenceId}/verify`, {
        verified,
        comments
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'verifyEvidence');
    }
  }

  /**
   * Eliminar evidencia
   */
  async deleteEvidence(evidenceId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando evidencia:', evidenceId);
      await api.delete(`${this.evidencesEndpoint}/${evidenceId}`);
    } catch (error) {
      this.handleError(error, 'deleteEvidence');
    }
  }

  // ============================================================================
  // ANALYTICS AND REPORTING
  // ============================================================================

  /**
   * Obtener análisis completo
   */
  async getAnalytics(filters: VacationFilters = {}, period?: { startDate: string; endDate: string }): Promise<VacationAnalytics> {
    try {
      console.log('📊 Obteniendo análisis de vacaciones:', { filters, period });
      const response = await api.get(`${this.analyticsEndpoint}`, {
        params: { ...filters, ...period }
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getAnalytics');
    }
  }

  /**
   * Obtener métricas por departamento
   */
  async getDepartmentMetrics(departmentId?: string): Promise<VacationAnalytics['byDepartment']> {
    try {
      console.log('📊 Obteniendo métricas por departamento:', departmentId);
      const response = await api.get(`${this.analyticsEndpoint}/departments`, {
        params: departmentId ? { departmentId } : {}
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getDepartmentMetrics');
    }
  }

  /**
   * Obtener tendencias históricas
   */
  async getTrends(period: 'month' | 'quarter' | 'year', count: number = 12): Promise<VacationAnalytics['trends']> {
    try {
      console.log('📈 Obteniendo tendencias históricas:', { period, count });
      const response = await api.get(`${this.analyticsEndpoint}/trends`, {
        params: { period, count }
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getTrends');
    }
  }

  /**
   * Generar reporte personalizado
   */
  async generateReport(reportType: VacationReport['type'], options: VacationExportOptions): Promise<VacationReport> {
    try {
      console.log('📋 Generando reporte:', reportType, options);
      const response = await api.post(`${this.analyticsEndpoint}/reports`, {
        type: reportType,
        options
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'generateReport');
    }
  }

  /**
   * Obtener reportes generados
   */
  async getGeneratedReports(): Promise<VacationReport[]> {
    try {
      console.log('📋 Obteniendo reportes generados');
      const response = await api.get(`${this.analyticsEndpoint}/reports`);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getGeneratedReports');
    }
  }

  /**
   * Descargar reporte
   */
  async downloadReport(reportId: string): Promise<Blob> {
    try {
      console.log('📥 Descargando reporte:', reportId);
      const response = await api.get(`${this.analyticsEndpoint}/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'downloadReport');
    }
  }

  // ============================================================================
  // POLICIES MANAGEMENT
  // ============================================================================

  /**
   * Obtener todas las políticas de vacaciones
   */
  async getAllPolicies(): Promise<VacationPolicy[]> {
    try {
      console.log('📋 Obteniendo políticas de vacaciones');
      const response = await api.get(`${this.policiesEndpoint}`);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getAllPolicies');
    }
  }

  /**
   * Crear nueva política
   */
  async createPolicy(policyData: VacationPolicyForm): Promise<VacationPolicy> {
    try {
      console.log('📋 Creando política de vacaciones:', policyData);
      const response = await api.post(`${this.policiesEndpoint}`, policyData);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'createPolicy');
    }
  }

  /**
   * Actualizar política
   */
  async updatePolicy(policyId: string, policyData: Partial<VacationPolicyForm>): Promise<VacationPolicy> {
    try {
      console.log('📋 Actualizando política:', policyId, policyData);
      const response = await api.put(`${this.policiesEndpoint}/${policyId}`, policyData);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'updatePolicy');
    }
  }

  /**
   * Eliminar política
   */
  async deletePolicy(policyId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando política:', policyId);
      await api.delete(`${this.policiesEndpoint}/${policyId}`);
    } catch (error) {
      this.handleError(error, 'deletePolicy');
    }
  }

  /**
   * Asignar política a empleado
   */
  async assignPolicy(assignmentData: VacationPolicyAssignment): Promise<VacationPolicyAssignment> {
    try {
      console.log('📋 Asignando política:', assignmentData);
      const response = await api.post(`${this.policiesEndpoint}/assignments`, assignmentData);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'assignPolicy');
    }
  }

  // ============================================================================
  // ALERTS AND NOTIFICATIONS
  // ============================================================================

  /**
   * Obtener todas las alertas
   */
  async getAllAlerts(filters: { status?: 'unread' | 'read' | 'resolved' } = {}): Promise<VacationAlert[]> {
    try {
      console.log('🚨 Obteniendo alertas de vacaciones:', filters);
      const response = await api.get(`${this.alertsEndpoint}`, { params: filters });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getAllAlerts');
    }
  }

  /**
   * Marcar alerta como leída
   */
  async markAlertAsRead(alertId: string): Promise<VacationAlert> {
    try {
      console.log('✅ Marcando alerta como leída:', alertId);
      const response = await api.put(`${this.alertsEndpoint}/${alertId}/read`);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'markAlertAsRead');
    }
  }

  /**
   * Resolver alerta
   */
  async resolveAlert(alertId: string, resolution?: string): Promise<VacationAlert> {
    try {
      console.log('✅ Resolviendo alerta:', alertId);
      const response = await api.put(`${this.alertsEndpoint}/${alertId}/resolve`, { resolution });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'resolveAlert');
    }
  }

  /**
   * Crear alerta manual
   */
  async createAlert(alertData: Partial<VacationAlert>): Promise<VacationAlert> {
    try {
      console.log('🚨 Creando alerta manual:', alertData);
      const response = await api.post(`${this.alertsEndpoint}`, alertData);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'createAlert');
    }
  }

  // ============================================================================
  // BULK OPERATIONS AND UTILITIES
  // ============================================================================

  /**
   * Recalcular balances de vacaciones
   */
  async recalculateBalances(year?: number): Promise<{
    success: number;
    failed: number;
    message: string;
  }> {
    try {
      console.log('🔄 Recalculando balances de vacaciones:', { year });
      const response = await api.post(`${this.baseEndpoint}/recalculate-balances`, { year });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'recalculateBalances');
    }
  }


  /**
   * Sincronizar con calendario externo
   */
  async syncWithCalendar(provider: 'google' | 'outlook', direction: 'import' | 'export' | 'bidirectional'): Promise<{
    syncedEvents: number;
    errors: string[];
    message: string;
  }> {
    try {
      console.log('🔄 Sincronizando calendario:', { provider, direction });
      const response = await api.post(`${this.baseEndpoint}/sync/calendar`, {
        provider,
        direction
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'syncWithCalendar');
    }
  }

  /**
   * Obtener estadísticas de uso del sistema
   */
  async getSystemUsage(): Promise<{
    totalRequests: number;
    totalPayments: number;
    totalEvidences: number;
    totalPolicies: number;
    activeAlerts: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
    lastSync: string;
    performance: {
      averageResponseTime: number;
      errorRate: number;
      uptime: number;
    };
  }> {
    try {
      console.log('📊 Obteniendo estadísticas del sistema');
      const response = await api.get(`${this.baseEndpoint}/system/usage`);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getSystemUsage');
    }
  }

  // ============================================================================
  // EXPORT AND BACKUP
  // ============================================================================

  /**
   * Exportar datos completos
   */
  async exportData(options: VacationExportOptions): Promise<Blob> {
    try {
      console.log('📤 Exportando datos de vacaciones:', options);
      const response = await api.post(`${this.baseEndpoint}/export`, options, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'exportData');
    }
  }

  /**
   * Importar datos
   */
  async importData(file: File, options: {
    overwrite: boolean;
    validateOnly: boolean;
    skipDuplicates: boolean;
  }): Promise<VacationImportResult> {
    try {
      console.log('📥 Importando datos de vacaciones:', options);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));

      const response = await api.post(`${this.baseEndpoint}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'importData');
    }
  }

  /**
   * Crear respaldo del sistema
   */
  async createBackup(includeFiles: boolean = true): Promise<{
    backupId: string;
    fileName: string;
    fileSize: number;
    expiresAt: string;
    downloadUrl: string;
  }> {
    try {
      console.log('💾 Creando respaldo del sistema');
      const response = await api.post(`${this.baseEndpoint}/backup`, { includeFiles });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'createBackup');
    }
  }

  /**
   * Restaurar desde respaldo
   */
  async restoreFromBackup(backupId: string, options: {
    restorePolicies: boolean;
    restoreRequests: boolean;
    restorePayments: boolean;
    restoreEvidences: boolean;
    dryRun: boolean;
  }): Promise<VacationImportResult> {
    try {
      console.log('🔄 Restaurando desde respaldo:', backupId, options);
      const response = await api.post(`${this.baseEndpoint}/restore`, {
        backupId,
        options
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'restoreFromBackup');
    }
  }
}

// ============================================================================
// EXPORT INSTANCE
// ============================================================================

export const vacationsManagementService = new VacationsManagementService();
export default vacationsManagementService;
