import { useState, useEffect, useCallback } from 'react';
import {
  vacationsManagementService,
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
  VacationSummary,
  CreateVacationRequestForm,
  UpdateVacationRequestForm,
  VacationPaymentForm,
  VacationEvidenceUpload,
  VacationTabType,
  VacationViewMode,
  VacationNavigationState
} from '../services/vacationsManagementService';

// ============================================================================
// HOOK OPTIONS
// ============================================================================

interface UseVacationsManagementOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialTab?: VacationTabType;
  initialFilters?: VacationFilters;
  enableRealTimeUpdates?: boolean;
}

// ============================================================================
// RETURN TYPE
// ============================================================================

interface UseVacationsManagementReturn {
  // ============================================================================
  // STATE
  // ============================================================================

  // Navigation and UI State
  navigation: VacationNavigationState;
  setActiveTab: (tab: VacationTabType) => void;
  setActiveView: (view: VacationViewMode) => void;
  setSelectedEmployee: (employeeId?: string) => void;
  setSelectedRequest: (requestId?: string) => void;
  setFilters: (filters: VacationFilters) => void;
  setSearchQuery: (query: string) => void;
  setDateRange: (startDate: string, endDate: string) => void;

  // Data State
  dashboard: VacationDashboard | null;
  summary: VacationSummary | null;
  requests: VacationRequest[];
  payments: VacationPayment[];
  evidences: VacationEvidence[];
  analytics: VacationAnalytics | null;
  policies: VacationPolicy[];
  alerts: VacationAlert[];
  conflicts: VacationConflict[];
  calendarView: VacationCalendarView | null;

  // Pagination State
  requestsPagination: { page: number; limit: number; total: number; totalPages: number };
  paymentsPagination: { page: number; limit: number; total: number; totalPages: number };
  evidencesPagination: { page: number; limit: number; total: number; totalPages: number };

  // Loading States
  loading: {
    dashboard: boolean;
    summary: boolean;
    requests: boolean;
    payments: boolean;
    evidences: boolean;
    analytics: boolean;
    policies: boolean;
    alerts: boolean;
    conflicts: boolean;
    calendar: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
  };

  // Error States
  errors: {
    dashboard: string | null;
    summary: string | null;
    requests: string | null;
    payments: string | null;
    evidences: string | null;
    analytics: string | null;
    policies: string | null;
    alerts: string | null;
    conflicts: string | null;
    calendar: string | null;
  };

  // ============================================================================
  // ACTIONS
  // ============================================================================

  // Dashboard and Overview Actions
  refreshDashboard: () => Promise<void>;
  refreshSummary: () => Promise<void>;

  // Request Management Actions
  loadRequests: (params?: VacationSearchParams) => Promise<void>;
  createRequest: (requestData: CreateVacationRequestForm) => Promise<VacationRequest>;
  updateRequest: (requestId: string, updateData: UpdateVacationRequestForm) => Promise<VacationRequest>;
  approveRequest: (requestId: string, comments?: string) => Promise<VacationRequest>;
  rejectRequest: (requestId: string, reason: string) => Promise<VacationRequest>;
  cancelRequest: (requestId: string, reason?: string) => Promise<VacationRequest>;
  deleteRequest: (requestId: string) => Promise<void>;
  bulkOperation: (operation: BulkVacationOperation) => Promise<void>;

  // Calendar and Scheduling Actions
  loadCalendarView: (year: number, month: number) => Promise<void>;
  checkCapacity: (startDate: string, endDate: string) => Promise<any>;
  resolveConflict: (conflictId: string, resolution: any) => Promise<VacationConflict>;

  // Payment Management Actions
  loadPayments: (params?: VacationSearchParams) => Promise<void>;
  createPayment: (paymentData: VacationPaymentForm) => Promise<VacationPayment>;
  processPayment: (paymentId: string) => Promise<VacationPayment>;
  cancelPayment: (paymentId: string, reason?: string) => Promise<VacationPayment>;

  // Evidence Management Actions
  loadEvidences: (params?: VacationSearchParams) => Promise<void>;
  uploadEvidence: (evidenceData: VacationEvidenceUpload) => Promise<VacationEvidence[]>;
  verifyEvidence: (evidenceId: string, verified: boolean, comments?: string) => Promise<VacationEvidence>;
  deleteEvidence: (evidenceId: string) => Promise<void>;

  // Analytics and Reporting Actions
  loadAnalytics: (filters?: VacationFilters, period?: { startDate: string; endDate: string }) => Promise<void>;
  generateReport: (reportType: VacationReport['type'], options: VacationExportOptions) => Promise<VacationReport>;
  downloadReport: (reportId: string) => Promise<Blob>;

  // Policy Management Actions
  loadPolicies: () => Promise<void>;
  createPolicy: (policyData: any) => Promise<VacationPolicy>;
  updatePolicy: (policyId: string, policyData: any) => Promise<VacationPolicy>;
  deletePolicy: (policyId: string) => Promise<void>;

  // Alert Management Actions
  loadAlerts: (filters?: any) => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<VacationAlert>;
  resolveAlert: (alertId: string, resolution?: string) => Promise<VacationAlert>;

  // Utility Actions
  refreshAll: () => Promise<void>;
  exportData: (options: VacationExportOptions) => Promise<Blob>;
  importData: (file: File, options: any) => Promise<any>;
  recalculateBalances: (year?: number) => Promise<void>;

  // ============================================================================
  // PAGINATION HELPERS
  // ============================================================================

  goToRequestsPage: (page: number) => Promise<void>;
  goToPaymentsPage: (page: number) => Promise<void>;
  goToEvidencesPage: (page: number) => Promise<void>;
  changeRequestsPageSize: (limit: number) => Promise<void>;
  changePaymentsPageSize: (limit: number) => Promise<void>;
  changeEvidencesPageSize: (limit: number) => Promise<void>;

  // ============================================================================
  // SEARCH AND FILTER HELPERS
  // ============================================================================

  searchRequests: (query: string) => Promise<void>;
  filterRequests: (filters: VacationFilters) => Promise<void>;
  clearFilters: () => void;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useVacationsManagement = (options: UseVacationsManagementOptions = {}): UseVacationsManagementReturn => {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    initialTab = 'overview',
    initialFilters = {},
    enableRealTimeUpdates = false
  } = options;

  // ============================================================================
  // NAVIGATION STATE
  // ============================================================================

  const [navigation, setNavigation] = useState<VacationNavigationState>({
    activeTab: initialTab,
    activeView: 'list',
    filters: initialFilters,
    searchQuery: '',
    dateRange: {
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
  });

  // Navigation helpers
  const setActiveTab = useCallback((tab: VacationTabType) => {
    setNavigation(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const setActiveView = useCallback((view: VacationViewMode) => {
    setNavigation(prev => ({ ...prev, activeView: view }));
  }, []);

  const setSelectedEmployee = useCallback((employeeId?: string) => {
    setNavigation(prev => ({ ...prev, selectedEmployee: employeeId }));
  }, []);

  const setSelectedRequest = useCallback((requestId?: string) => {
    setNavigation(prev => ({ ...prev, selectedRequest: requestId }));
  }, []);

  const setFilters = useCallback((filters: VacationFilters) => {
    setNavigation(prev => ({ ...prev, filters }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setNavigation(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setDateRange = useCallback((startDate: string, endDate: string) => {
    setNavigation(prev => ({
      ...prev,
      dateRange: { startDate, endDate }
    }));
  }, []);

  // ============================================================================
  // DATA STATE
  // ============================================================================

  const [dashboard, setDashboard] = useState<VacationDashboard | null>(null);
  const [summary, setSummary] = useState<VacationSummary | null>(null);
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [payments, setPayments] = useState<VacationPayment[]>([]);
  const [evidences, setEvidences] = useState<VacationEvidence[]>([]);
  const [analytics, setAnalytics] = useState<VacationAnalytics | null>(null);
  const [policies, setPolicies] = useState<VacationPolicy[]>([]);
  const [alerts, setAlerts] = useState<VacationAlert[]>([]);
  const [conflicts, setConflicts] = useState<VacationConflict[]>([]);
  const [calendarView, setCalendarView] = useState<VacationCalendarView | null>(null);

  // ============================================================================
  // PAGINATION STATE
  // ============================================================================

  const [requestsPagination, setRequestsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const [paymentsPagination, setPaymentsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const [evidencesPagination, setEvidencesPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  const [loading, setLoading] = useState({
    dashboard: true,
    summary: true,
    requests: true,
    payments: true,
    evidences: true,
    analytics: true,
    policies: true,
    alerts: true,
    conflicts: true,
    calendar: true,
    creating: false,
    updating: false,
    deleting: false
  });

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  const [errors, setErrors] = useState({
    dashboard: null as string | null,
    summary: null as string | null,
    requests: null as string | null,
    payments: null as string | null,
    evidences: null as string | null,
    analytics: null as string | null,
    policies: null as string | null,
    alerts: null as string | null,
    conflicts: null as string | null,
    calendar: null as string | null
  });

  // ============================================================================
  // DASHBOARD ACTIONS
  // ============================================================================

  const refreshDashboard = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, dashboard: true }));
      setErrors(prev => ({ ...prev, dashboard: null }));

      const data = await vacationsManagementService.getDashboard();
      setDashboard(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading dashboard';
      setErrors(prev => ({ ...prev, dashboard: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  }, []);

  const refreshSummary = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, summary: true }));
      setErrors(prev => ({ ...prev, summary: null }));

      const data = await vacationsManagementService.getSummary(navigation.filters);
      setSummary(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading summary';
      setErrors(prev => ({ ...prev, summary: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  }, [navigation.filters]);

  // ============================================================================
  // REQUESTS MANAGEMENT ACTIONS
  // ============================================================================

  const loadRequests = useCallback(async (params?: VacationSearchParams) => {
    try {
      setLoading(prev => ({ ...prev, requests: true }));
      setErrors(prev => ({ ...prev, requests: null }));

      const searchParams = params || {
        filters: navigation.filters,
        sortBy: 'startDate',
        sortOrder: 'desc',
        page: requestsPagination.page,
        limit: requestsPagination.limit
      };

      const response = await vacationsManagementService.getAllRequests(searchParams);
      setRequests(response.requests);
      setRequestsPagination(response.pagination);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading requests';
      setErrors(prev => ({ ...prev, requests: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, requests: false }));
    }
  }, [navigation.filters, requestsPagination.page, requestsPagination.limit]);

  const createRequest = useCallback(async (requestData: CreateVacationRequestForm): Promise<VacationRequest> => {
    try {
      setLoading(prev => ({ ...prev, creating: true }));
      const result = await vacationsManagementService.createRequest(requestData);

      // Refresh data after creation
      await Promise.all([
        loadRequests(),
        refreshDashboard(),
        refreshSummary()
      ]);

      return result;
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  }, [loadRequests, refreshDashboard, refreshSummary]);

  const updateRequest = useCallback(async (requestId: string, updateData: UpdateVacationRequestForm): Promise<VacationRequest> => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      const result = await vacationsManagementService.updateRequest(requestId, updateData);

      // Update local state
      setRequests(prev => prev.map(req => req.id === requestId ? result : req));

      // Refresh dashboard and summary
      await Promise.all([
        refreshDashboard(),
        refreshSummary()
      ]);

      return result;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, [refreshDashboard, refreshSummary]);

  const approveRequest = useCallback(async (requestId: string, comments?: string): Promise<VacationRequest> => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      const result = await vacationsManagementService.approveRequest(requestId, comments);

      // Update local state
      setRequests(prev => prev.map(req => req.id === requestId ? result : req));

      // Refresh related data
      await Promise.all([
        refreshDashboard(),
        refreshSummary(),
        loadConflicts()
      ]);

      return result;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, [refreshDashboard, refreshSummary]);

  const rejectRequest = useCallback(async (requestId: string, reason: string): Promise<VacationRequest> => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      const result = await vacationsManagementService.rejectRequest(requestId, reason);

      // Update local state
      setRequests(prev => prev.map(req => req.id === requestId ? result : req));

      // Refresh related data
      await Promise.all([
        refreshDashboard(),
        refreshSummary()
      ]);

      return result;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, [refreshDashboard, refreshSummary]);

  const cancelRequest = useCallback(async (requestId: string, reason?: string): Promise<VacationRequest> => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      const result = await vacationsManagementService.cancelRequest(requestId, reason);

      // Update local state
      setRequests(prev => prev.map(req => req.id === requestId ? result : req));

      // Refresh related data
      await Promise.all([
        refreshDashboard(),
        refreshSummary(),
        loadConflicts()
      ]);

      return result;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, [refreshDashboard, refreshSummary]);

  const deleteRequest = useCallback(async (requestId: string): Promise<void> => {
    try {
      setLoading(prev => ({ ...prev, deleting: true }));
      await vacationsManagementService.deleteRequest(requestId);

      // Remove from local state
      setRequests(prev => prev.filter(req => req.id !== requestId));

      // Refresh related data
      await Promise.all([
        refreshDashboard(),
        refreshSummary()
      ]);
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, [refreshDashboard, refreshSummary]);

  const bulkOperation = useCallback(async (operation: BulkVacationOperation): Promise<void> => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      await vacationsManagementService.bulkOperation(operation);

      // Refresh all data
      await refreshAll();
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, []);

  // ============================================================================
  // CALENDAR AND SCHEDULING ACTIONS
  // ============================================================================

  const loadCalendarView = useCallback(async (year: number, month: number) => {
    try {
      setLoading(prev => ({ ...prev, calendar: true }));
      setErrors(prev => ({ ...prev, calendar: null }));

      const data = await vacationsManagementService.getCalendarView(year, month);
      setCalendarView(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading calendar';
      setErrors(prev => ({ ...prev, calendar: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, calendar: false }));
    }
  }, []);

  const checkCapacity = useCallback(async (startDate: string, endDate: string) => {
    return await vacationsManagementService.checkCapacity(startDate, endDate);
  }, []);

  const loadConflicts = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, conflicts: true }));
      setErrors(prev => ({ ...prev, conflicts: null }));

      const data = await vacationsManagementService.getConflicts(navigation.dateRange);
      setConflicts(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading conflicts';
      setErrors(prev => ({ ...prev, conflicts: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, conflicts: false }));
    }
  }, [navigation.dateRange]);

  const resolveConflict = useCallback(async (conflictId: string, resolution: any): Promise<VacationConflict> => {
    const result = await vacationsManagementService.resolveConflict(conflictId, resolution);

    // Update local state
    setConflicts(prev => prev.map(conflict =>
      conflict.id === conflictId ? { ...conflict, resolved: true, resolvedAt: new Date().toISOString() } : conflict
    ));

    // Refresh related data
    await Promise.all([
      refreshDashboard(),
      loadRequests()
    ]);

    return result;
  }, [refreshDashboard, loadRequests]);

  // ============================================================================
  // PAYMENTS MANAGEMENT ACTIONS
  // ============================================================================

  const loadPayments = useCallback(async (params?: VacationSearchParams) => {
    try {
      setLoading(prev => ({ ...prev, payments: true }));
      setErrors(prev => ({ ...prev, payments: null }));

      const searchParams = params || {
        filters: navigation.filters,
        sortBy: 'paymentDate',
        sortOrder: 'desc',
        page: paymentsPagination.page,
        limit: paymentsPagination.limit
      };

      const response = await vacationsManagementService.getAllPayments(searchParams);
      setPayments(response.payments);
      setPaymentsPagination(response.pagination);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading payments';
      setErrors(prev => ({ ...prev, payments: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, payments: false }));
    }
  }, [navigation.filters, paymentsPagination.page, paymentsPagination.limit]);

  const createPayment = useCallback(async (paymentData: VacationPaymentForm): Promise<VacationPayment> => {
    try {
      setLoading(prev => ({ ...prev, creating: true }));
      const result = await vacationsManagementService.createPayment(paymentData);

      // Refresh payments
      await loadPayments();

      return result;
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  }, [loadPayments]);

  const processPayment = useCallback(async (paymentId: string): Promise<VacationPayment> => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      const result = await vacationsManagementService.processPayment(paymentId);

      // Update local state
      setPayments(prev => prev.map(payment =>
        payment.id === paymentId ? result : payment
      ));

      return result;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, []);

  const cancelPayment = useCallback(async (paymentId: string, reason?: string): Promise<VacationPayment> => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      const result = await vacationsManagementService.cancelPayment(paymentId, reason);

      // Update local state
      setPayments(prev => prev.map(payment =>
        payment.id === paymentId ? result : payment
      ));

      return result;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, []);

  // ============================================================================
  // EVIDENCES MANAGEMENT ACTIONS
  // ============================================================================

  const loadEvidences = useCallback(async (params?: VacationSearchParams) => {
    try {
      setLoading(prev => ({ ...prev, evidences: true }));
      setErrors(prev => ({ ...prev, evidences: null }));

      const searchParams = params || {
        filters: navigation.filters,
        sortBy: 'uploadDate',
        sortOrder: 'desc',
        page: evidencesPagination.page,
        limit: evidencesPagination.limit
      };

      const response = await vacationsManagementService.getAllEvidences(searchParams);
      setEvidences(response.evidences);
      setEvidencesPagination(response.pagination);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading evidences';
      setErrors(prev => ({ ...prev, evidences: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, evidences: false }));
    }
  }, [navigation.filters, evidencesPagination.page, evidencesPagination.limit]);

  const uploadEvidence = useCallback(async (evidenceData: VacationEvidenceUpload): Promise<VacationEvidence[]> => {
    try {
      setLoading(prev => ({ ...prev, creating: true }));
      const result = await vacationsManagementService.uploadEvidence(evidenceData);

      // Refresh evidences
      await loadEvidences();

      return result;
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  }, [loadEvidences]);

  const verifyEvidence = useCallback(async (evidenceId: string, verified: boolean, comments?: string): Promise<VacationEvidence> => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      const result = await vacationsManagementService.verifyEvidence(evidenceId, verified, comments);

      // Update local state
      setEvidences(prev => prev.map(evidence =>
        evidence.id === evidenceId ? result : evidence
      ));

      return result;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, []);

  const deleteEvidence = useCallback(async (evidenceId: string): Promise<void> => {
    try {
      setLoading(prev => ({ ...prev, deleting: true }));
      await vacationsManagementService.deleteEvidence(evidenceId);

      // Remove from local state
      setEvidences(prev => prev.filter(evidence => evidence.id !== evidenceId));
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, []);

  // ============================================================================
  // ANALYTICS AND REPORTING ACTIONS
  // ============================================================================

  const loadAnalytics = useCallback(async (filters?: VacationFilters, period?: { startDate: string; endDate: string }) => {
    try {
      setLoading(prev => ({ ...prev, analytics: true }));
      setErrors(prev => ({ ...prev, analytics: null }));

      const analyticsFilters = filters || navigation.filters;
      const analyticsPeriod = period || navigation.dateRange;

      const data = await vacationsManagementService.getAnalytics(analyticsFilters, analyticsPeriod);
      setAnalytics(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading analytics';
      setErrors(prev => ({ ...prev, analytics: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, analytics: false }));
    }
  }, [navigation.filters, navigation.dateRange]);

  const generateReport = useCallback(async (reportType: VacationReport['type'], options: VacationExportOptions): Promise<VacationReport> => {
    return await vacationsManagementService.generateReport(reportType, options);
  }, []);

  const downloadReport = useCallback(async (reportId: string): Promise<Blob> => {
    return await vacationsManagementService.downloadReport(reportId);
  }, []);

  // ============================================================================
  // POLICIES MANAGEMENT ACTIONS
  // ============================================================================

  const loadPolicies = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, policies: true }));
      setErrors(prev => ({ ...prev, policies: null }));

      const data = await vacationsManagementService.getAllPolicies();
      setPolicies(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading policies';
      setErrors(prev => ({ ...prev, policies: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, policies: false }));
    }
  }, []);

  const createPolicy = useCallback(async (policyData: any): Promise<VacationPolicy> => {
    try {
      setLoading(prev => ({ ...prev, creating: true }));
      const result = await vacationsManagementService.createPolicy(policyData);

      // Refresh policies
      await loadPolicies();

      return result;
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  }, [loadPolicies]);

  const updatePolicy = useCallback(async (policyId: string, policyData: any): Promise<VacationPolicy> => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      const result = await vacationsManagementService.updatePolicy(policyId, policyData);

      // Update local state
      setPolicies(prev => prev.map(policy =>
        policy.id === policyId ? result : policy
      ));

      return result;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, []);

  const deletePolicy = useCallback(async (policyId: string): Promise<void> => {
    try {
      setLoading(prev => ({ ...prev, deleting: true }));
      await vacationsManagementService.deletePolicy(policyId);

      // Remove from local state
      setPolicies(prev => prev.filter(policy => policy.id !== policyId));
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, []);

  // ============================================================================
  // ALERTS MANAGEMENT ACTIONS
  // ============================================================================

  const loadAlerts = useCallback(async (filters?: any) => {
    try {
      setLoading(prev => ({ ...prev, alerts: true }));
      setErrors(prev => ({ ...prev, alerts: null }));

      const data = await vacationsManagementService.getAllAlerts(filters);
      setAlerts(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading alerts';
      setErrors(prev => ({ ...prev, alerts: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, alerts: false }));
    }
  }, []);

  const markAlertAsRead = useCallback(async (alertId: string): Promise<VacationAlert> => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      const result = await vacationsManagementService.markAlertAsRead(alertId);

      // Update local state
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));

      return result;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, []);

  const resolveAlert = useCallback(async (alertId: string, resolution?: string): Promise<VacationAlert> => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      const result = await vacationsManagementService.resolveAlert(alertId, resolution);

      // Update local state
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, isResolved: true, resolvedAt: new Date().toISOString() } : alert
      ));

      return result;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, []);

  // ============================================================================
  // UTILITY ACTIONS
  // ============================================================================

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshDashboard(),
      refreshSummary(),
      loadRequests(),
      loadPayments(),
      loadEvidences(),
      loadAnalytics(),
      loadPolicies(),
      loadAlerts(),
      loadConflicts()
    ]);
  }, [refreshDashboard, refreshSummary, loadRequests, loadPayments, loadEvidences, loadAnalytics, loadPolicies, loadAlerts, loadConflicts]);

  const exportData = useCallback(async (options: VacationExportOptions): Promise<Blob> => {
    return await vacationsManagementService.exportData(options);
  }, []);

  const importData = useCallback(async (file: File, options: any): Promise<any> => {
    return await vacationsManagementService.importData(file, options);
  }, []);

  const recalculateBalances = useCallback(async (year?: number) => {
    return await vacationsManagementService.recalculateBalances(year);
  }, []);

  // ============================================================================
  // PAGINATION HELPERS
  // ============================================================================

  const goToRequestsPage = useCallback(async (page: number) => {
    setRequestsPagination(prev => ({ ...prev, page }));
    await loadRequests();
  }, [loadRequests]);

  const goToPaymentsPage = useCallback(async (page: number) => {
    setPaymentsPagination(prev => ({ ...prev, page }));
    await loadPayments();
  }, [loadPayments]);

  const goToEvidencesPage = useCallback(async (page: number) => {
    setEvidencesPagination(prev => ({ ...prev, page }));
    await loadEvidences();
  }, [loadEvidences]);

  const changeRequestsPageSize = useCallback(async (limit: number) => {
    setRequestsPagination(prev => ({ ...prev, limit, page: 1 }));
    await loadRequests();
  }, [loadRequests]);

  const changePaymentsPageSize = useCallback(async (limit: number) => {
    setPaymentsPagination(prev => ({ ...prev, limit, page: 1 }));
    await loadPayments();
  }, [loadPayments]);

  const changeEvidencesPageSize = useCallback(async (limit: number) => {
    setEvidencesPagination(prev => ({ ...prev, limit, page: 1 }));
    await loadEvidences();
  }, [loadEvidences]);

  // ============================================================================
  // SEARCH AND FILTER HELPERS
  // ============================================================================

  const searchRequests = useCallback(async (query: string) => {
    setSearchQuery(query);
    setRequestsPagination(prev => ({ ...prev, page: 1 }));

    const searchParams: VacationSearchParams = {
      query,
      filters: navigation.filters,
      sortBy: 'startDate',
      sortOrder: 'desc',
      page: 1,
      limit: requestsPagination.limit
    };

    await loadRequests(searchParams);
  }, [navigation.filters, requestsPagination.limit, loadRequests]);

  const filterRequests = useCallback(async (filters: VacationFilters) => {
    setFilters(filters);
    setRequestsPagination(prev => ({ ...prev, page: 1 }));

    const searchParams: VacationSearchParams = {
      filters,
      sortBy: 'startDate',
      sortOrder: 'desc',
      page: 1,
      limit: requestsPagination.limit
    };

    await loadRequests(searchParams);
  }, [requestsPagination.limit, loadRequests]);

  const clearFilters = useCallback(() => {
    const defaultFilters: VacationFilters = {};
    setFilters(defaultFilters);
    setSearchQuery('');
    setRequestsPagination(prev => ({ ...prev, page: 1 }));
    loadRequests();
  }, [loadRequests]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh de gestión de vacaciones');
      refreshAll();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshAll]);

  // Real-time updates for specific events
  useEffect(() => {
    if (!enableRealTimeUpdates) return;

    // This would be implemented with WebSocket or Server-Sent Events
    // For now, we'll use polling for critical updates
    const criticalUpdateInterval = setInterval(() => {
      loadConflicts(); // Check for new conflicts every 30 seconds
      loadAlerts();    // Check for new alerts every 30 seconds
    }, 30000);

    return () => clearInterval(criticalUpdateInterval);
  }, [enableRealTimeUpdates, loadConflicts, loadAlerts]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Navigation and UI State
    navigation,
    setActiveTab,
    setActiveView,
    setSelectedEmployee,
    setSelectedRequest,
    setFilters,
    setSearchQuery,
    setDateRange,

    // Data State
    dashboard,
    summary,
    requests,
    payments,
    evidences,
    analytics,
    policies,
    alerts,
    conflicts,
    calendarView,

    // Pagination State
    requestsPagination,
    paymentsPagination,
    evidencesPagination,

    // Loading States
    loading,

    // Error States
    errors,

    // Actions
    refreshDashboard,
    refreshSummary,
    loadRequests,
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    cancelRequest,
    deleteRequest,
    bulkOperation,
    loadCalendarView,
    checkCapacity,
    resolveConflict,
    loadPayments,
    createPayment,
    processPayment,
    cancelPayment,
    loadEvidences,
    uploadEvidence,
    verifyEvidence,
    deleteEvidence,
    loadAnalytics,
    generateReport,
    downloadReport,
    loadPolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,
    loadAlerts,
    markAlertAsRead,
    resolveAlert,
    refreshAll,
    exportData,
    importData,
    recalculateBalances,

    // Pagination Helpers
    goToRequestsPage,
    goToPaymentsPage,
    goToEvidencesPage,
    changeRequestsPageSize,
    changePaymentsPageSize,
    changeEvidencesPageSize,

    // Search and Filter Helpers
    searchRequests,
    filterRequests,
    clearFilters
  };
};

export default useVacationsManagement;
