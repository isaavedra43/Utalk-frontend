// ============================================================================
// COMPREHENSIVE VACATIONS MANAGEMENT TYPES
// ============================================================================

// ============================================================================
// CORE VACATION TYPES (Extending base types)
// ============================================================================

export interface VacationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  employeeDepartment: string;
  startDate: string;
  endDate: string;
  days: number;
  type: VacationType;
  reason: string;
  status: VacationStatus;
  requestedDate: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectedReason?: string;
  attachments?: string[];
  comments?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  replacementEmployee?: string;
  replacementEmployeeName?: string;
  workHandover?: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export type VacationType =
  | 'vacation'
  | 'personal'
  | 'sick_leave'
  | 'maternity'
  | 'paternity'
  | 'unpaid'
  | 'compensatory'
  | 'study_leave'
  | 'bereavement'
  | 'jury_duty';

export type VacationStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export interface VacationBalance {
  employeeId: string;
  employeeName: string;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
  carriedOverDays: number;
  expiresAt: string;
  lastUpdated: string;
  byType: Record<VacationType, number>;
}

// ============================================================================
// PAYMENTS MANAGEMENT
// ============================================================================

export interface VacationPayment {
  id: string;
  vacationRequestId: string;
  employeeId: string;
  employeeName: string;
  paymentDate: string;
  amount: number;
  currency: string;
  paymentMethod: 'bank_transfer' | 'check' | 'cash' | 'direct_deposit';
  status: 'pending' | 'processed' | 'cancelled' | 'failed';
  reference?: string;
  notes?: string;
  processedBy?: string;
  processedByName?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
}

export interface VacationPaymentRequest {
  vacationRequestId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: VacationPayment['paymentMethod'];
  reference?: string;
  notes?: string;
  attachments?: File[];
}

// ============================================================================
// EVIDENCES MANAGEMENT
// ============================================================================

export interface VacationEvidence {
  id: string;
  vacationRequestId: string;
  employeeId: string;
  type: 'medical_certificate' | 'travel_ticket' | 'boarding_pass' | 'hotel_reservation' | 'other';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadDate: string;
  description?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedDate?: string;
  tags?: string[];
}

export interface VacationEvidenceUpload {
  vacationRequestId: string;
  type: VacationEvidence['type'];
  files: File[];
  description?: string;
  tags?: string[];
}

// ============================================================================
// ANALYTICS AND REPORTING
// ============================================================================

export interface VacationAnalytics {
  period: {
    startDate: string;
    endDate: string;
    type: 'month' | 'quarter' | 'year' | 'custom';
  };
  overview: {
    totalRequests: number;
    approvedRequests: number;
    pendingRequests: number;
    rejectedRequests: number;
    totalDays: number;
    averageDaysPerRequest: number;
    mostRequestedType: VacationType;
    peakMonth: string;
  };
  byDepartment: Array<{
    department: string;
    totalRequests: number;
    totalDays: number;
    averageDaysPerRequest: number;
    employees: number;
    utilizationRate: number;
  }>;
  byType: Record<VacationType, {
    count: number;
    totalDays: number;
    averageDays: number;
    percentage: number;
  }>;
  trends: Array<{
    period: string;
    totalRequests: number;
    totalDays: number;
    approvedRequests: number;
    pendingRequests: number;
  }>;
  conflicts: Array<{
    date: string;
    employeeCount: number;
    employees: Array<{
      id: string;
      name: string;
      department: string;
      type: VacationType;
    }>;
  }>;
  utilization: {
    overall: number;
    byDepartment: Record<string, number>;
    byPosition: Record<string, number>;
  };
  costs: {
    totalPayments: number;
    averagePaymentPerRequest: number;
    byType: Record<VacationType, number>;
    projections: {
      nextMonth: number;
      nextQuarter: number;
      nextYear: number;
    };
  };
}

export interface VacationReport {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'analytics' | 'payments' | 'conflicts' | 'utilization';
  format: 'pdf' | 'excel' | 'csv';
  parameters: Record<string, any>;
  generatedBy: string;
  generatedByName: string;
  generatedAt: string;
  fileUrl?: string;
  fileSize?: number;
  status: 'generating' | 'completed' | 'failed';
  downloadCount: number;
  expiresAt?: string;
}

// ============================================================================
// POLICIES AND CONFIGURATION
// ============================================================================

export interface VacationPolicy {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  appliesTo: {
    departments?: string[];
    positions?: string[];
    employeeTypes?: string[];
    allEmployees: boolean;
  };
  rules: {
    annualDays: number;
    accrualRate: number; // days per month
    maxCarryover: number;
    probationPeriod: number; // months
    advanceRequest: number; // days required
    maxConsecutiveDays: number;
    minDaysBetweenRequests: number;
    requiresApproval: boolean;
    autoApprovalLimit?: number; // days that can be auto-approved
  };
  blackoutPeriods: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    reason: string;
    isRecurring: boolean;
    recurrenceRule?: string;
  }>;
  restrictions: {
    maxEmployeesOnVacation: number; // percentage or absolute number
    criticalPositions: string[]; // positions that need special approval
    seasonalRestrictions: Array<{
      season: string;
      maxEmployees: number;
      priorityPositions: string[];
    }>;
  };
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface VacationPolicyAssignment {
  id: string;
  policyId: string;
  employeeId: string;
  employeeName: string;
  effectiveDate: string;
  endDate?: string;
  isActive: boolean;
  overrideRules?: Partial<VacationPolicy['rules']>;
  notes?: string;
}

// ============================================================================
// ALERTS AND NOTIFICATIONS
// ============================================================================

export interface VacationAlert {
  id: string;
  type: 'conflict' | 'policy_violation' | 'payment_due' | 'approval_required' | 'system_notification';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  employeeId?: string;
  employeeName?: string;
  vacationRequestId?: string;
  relatedData?: Record<string, any>;
  isRead: boolean;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  createdAt: string;
  expiresAt?: string;
  actions?: Array<{
    label: string;
    action: string;
    data?: Record<string, any>;
  }>;
}

export interface VacationConflict {
  id: string;
  date: string;
  employeeCount: number;
  employees: Array<{
    id: string;
    name: string;
    position: string;
    department: string;
    type: VacationType;
    priority: number;
  }>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: 'department_overlap' | 'position_critical' | 'resource_shortage' | 'policy_violation';
  suggestedActions: Array<{
    type: 'reschedule' | 'reassign' | 'approve_override' | 'reject';
    description: string;
    targetEmployee?: string;
  }>;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

// ============================================================================
// DASHBOARD AND SUMMARY TYPES
// ============================================================================

export interface VacationDashboard {
  summary: {
    totalEmployees: number;
    employeesOnVacation: number;
    pendingRequests: number;
    upcomingVacations: number;
    totalDaysThisMonth: number;
    averageUtilization: number;
    conflictsToday: number;
    pendingPayments: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'request_created' | 'request_approved' | 'request_rejected' | 'payment_processed' | 'conflict_resolved';
    employeeId: string;
    employeeName: string;
    description: string;
    timestamp: string;
    relatedId?: string;
  }>;
  upcomingDeadlines: Array<{
    type: 'payment_due' | 'approval_required' | 'document_expiry';
    title: string;
    dueDate: string;
    employeeId: string;
    employeeName: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  departmentStats: Array<{
    department: string;
    totalEmployees: number;
    onVacation: number;
    pendingRequests: number;
    utilizationRate: number;
    averageDaysPerRequest: number;
  }>;
  alerts: VacationAlert[];
}

// ============================================================================
// SEARCH AND FILTER TYPES
// ============================================================================

export interface VacationFilters {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  status?: VacationStatus[];
  type?: VacationType[];
  departments?: string[];
  positions?: string[];
  employeeIds?: string[];
  priority?: VacationRequest['priority'][];
  hasConflicts?: boolean;
  requiresApproval?: boolean;
  paymentStatus?: VacationPayment['status'][];
  evidenceStatus?: 'verified' | 'pending' | 'rejected';
}

export interface VacationSearchParams {
  query?: string;
  filters: VacationFilters;
  sortBy?: 'startDate' | 'endDate' | 'employeeName' | 'department' | 'priority' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export interface BulkVacationOperation {
  type: 'approve' | 'reject' | 'cancel' | 'reschedule' | 'assign_replacement';
  requestIds: string[];
  reason?: string;
  newDate?: {
    startDate: string;
    endDate: string;
  };
  replacementEmployee?: string;
  comments?: string;
}

export interface BulkPaymentOperation {
  type: 'process' | 'cancel' | 'reschedule';
  paymentIds: string[];
  newPaymentDate?: string;
  reason?: string;
  notes?: string;
}

// ============================================================================
// CALENDAR AND SCHEDULING
// ============================================================================

export interface VacationCalendarEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  startDate: string;
  endDate: string;
  type: VacationType;
  status: VacationStatus;
  department: string;
  position: string;
  isConflict: boolean;
  conflictSeverity?: 'low' | 'medium' | 'high' | 'critical';
  replacementEmployee?: string;
  workHandover?: string;
}

export interface VacationCalendarView {
  year: number;
  month: number;
  events: VacationCalendarEvent[];
  conflicts: VacationConflict[];
  utilization: Record<string, number>; // date -> utilization percentage
  capacity: Record<string, number>; // date -> max capacity
}

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

export interface VacationNotificationSettings {
  email: {
    enabled: boolean;
    requestCreated: boolean;
    requestApproved: boolean;
    requestRejected: boolean;
    paymentProcessed: boolean;
    conflictDetected: boolean;
    policyViolation: boolean;
    upcomingDeadlines: boolean;
  };
  push: {
    enabled: boolean;
    requestCreated: boolean;
    requestApproved: boolean;
    requestRejected: boolean;
    paymentProcessed: boolean;
    conflictDetected: boolean;
    policyViolation: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  recipients: Array<{
    userId: string;
    userName: string;
    roles: string[];
    email?: string;
  }>;
}

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

export interface VacationIntegration {
  payroll: {
    syncPayments: boolean;
    autoCalculateAmount: boolean;
    deductionCodes: Record<string, string>;
  };
  attendance: {
    markAsAbsent: boolean;
    syncWithTimesheet: boolean;
  };
  notifications: {
    slackWebhook?: string;
    teamsWebhook?: string;
    emailTemplates: Record<string, string>;
  };
  calendar: {
    googleCalendar?: {
      enabled: boolean;
      calendarId?: string;
      syncDirection: 'bidirectional' | 'export_only' | 'import_only';
    };
    outlook?: {
      enabled: boolean;
      calendarId?: string;
      syncDirection: 'bidirectional' | 'export_only' | 'import_only';
    };
  };
}

// ============================================================================
// EXPORT AND IMPORT
// ============================================================================

export interface VacationExportOptions {
  format: 'excel' | 'pdf' | 'csv' | 'json';
  include: {
    requests: boolean;
    payments: boolean;
    evidences: boolean;
    analytics: boolean;
    policies: boolean;
  };
  filters: VacationFilters;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  includeInactive: boolean;
}

export interface VacationImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    message: string;
  }>;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface VacationApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metadata?: Record<string, any>;
}

export interface VacationSummary {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  totalDays: number;
  averageDaysPerRequest: number;
  mostRequestedType: VacationType;
  peakMonth: string;
  totalEmployees: number;
  employeesOnVacation: number;
  utilizationRate: number;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateVacationRequestForm {
  employeeId: string;
  startDate: string;
  endDate: string;
  type: VacationType;
  reason: string;
  comments?: string;
  priority?: VacationRequest['priority'];
  replacementEmployee?: string;
  workHandover?: string;
  emergencyContact?: string;
  attachments?: File[];
  tags?: string[];
}

export interface UpdateVacationRequestForm extends Partial<CreateVacationRequestForm> {
  status?: VacationStatus;
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
}

export interface VacationPolicyForm {
  name: string;
  description?: string;
  appliesTo: VacationPolicy['appliesTo'];
  rules: VacationPolicy['rules'];
  blackoutPeriods: VacationPolicy['blackoutPeriods'];
  restrictions: VacationPolicy['restrictions'];
}

export interface VacationPaymentForm {
  vacationRequestId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: VacationPayment['paymentMethod'];
  reference?: string;
  notes?: string;
  attachments?: File[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type VacationViewMode = 'list' | 'calendar' | 'analytics' | 'payments' | 'evidences' | 'policies' | 'reports' | 'alerts';

export type VacationTabType =
  | 'overview'
  | 'requests'
  | 'calendar'
  | 'payments'
  | 'evidences'
  | 'analytics'
  | 'policies'
  | 'reports'
  | 'alerts'
  | 'settings';

export interface VacationNavigationState {
  activeTab: VacationTabType;
  activeView: VacationViewMode;
  selectedEmployee?: string;
  selectedRequest?: string;
  selectedPayment?: string;
  selectedEvidence?: string;
  filters: VacationFilters;
  searchQuery: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}
