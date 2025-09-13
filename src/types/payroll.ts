// ===================================================================
// TIPOS DE DATOS PARA EL MÓDULO DE NÓMINA GENERAL
// ===================================================================

export interface PayrollPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  status: 'draft' | 'calculated' | 'approved' | 'paid' | 'closed';
  
  configurations: {
    calculateTaxes: boolean;
    includeOvertime: boolean;
    applyAbsenceDeductions: boolean;
    includeLoans: boolean;
  };
  
  summary: {
    totalEmployees: number;
    totalPayroll: number;
    totalPerceptions: number;
    totalDeductions: number;
    averageSalary: number;
    employeesProcessed: number;
    employeesPending: number;
    employeesApproved: number;
    employeesPaid: number;
  };
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  closedAt?: string;
}

export interface PayrollEmployee {
  id: string;
  employeeId: string;
  periodId: string;
  periodStart: string;
  periodEnd: string;
  frequency: string;
  
  baseSalary: number;
  calculatedSalary: number;
  totalPerceptions: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
  
  workedDays: number;
  status: 'calculated' | 'approved' | 'paid' | 'error';
  
  fiscalDeductions?: {
    isr: number;
    seguridadSocial: {
      imssEnfermedadMaternidad: number;
      imssInvalidezVida: number;
      imssCesantiaVejez: number;
      afore: number;
      infonavit: number;
      totalImss: number;
      total: number;
    };
    totalFiscal: number;
  };
  
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  paidAt?: string;
}

export interface PayrollMovement {
  id: string;
  employeeId: string;
  type: 'overtime' | 'bonus' | 'commission' | 'loan' | 'advance' | 'absence' | 'other';
  impactType: 'add' | 'subtract';
  amount: number;
  calculatedAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  appliedToPayroll: boolean;
  payrollId?: string;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollAttachment {
  id: string;
  payrollId: string;
  employeeId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  category: 'general' | 'comprobante' | 'documento';
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  isActive: boolean;
}

export interface PayrollCalculation {
  employeeId: string;
  baseSalary: number;
  workedDays: number;
  totalDays: number;
  
  perceptions: {
    salary: number;
    overtime: number;
    bonuses: number;
    commissions: number;
    other: number;
    total: number;
  };
  
  deductions: {
    isr: number;
    imss: number;
    afore: number;
    infonavit: number;
    loans: number;
    absences: number;
    other: number;
    total: number;
  };
  
  grossSalary: number;
  netSalary: number;
}

export interface PayrollFilters {
  search?: string;
  department?: string;
  status?: string;
  position?: string;
}

export interface PayrollPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PayrollSummary {
  totalEmployees: number;
  totalPayroll: number;
  totalPerceptions: number;
  totalDeductions: number;
  averageSalary: number;
  highestSalary: number;
  lowestSalary: number;
  employeesByStatus: {
    calculated: number;
    approved: number;
    paid: number;
    error: number;
  };
}

export interface PayrollExport {
  format: 'excel' | 'pdf' | 'csv';
  includeDetails: boolean;
  includeFiscalBreakdown: boolean;
  includeMovements: boolean;
}

export interface PayrollValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PayrollBulkOperation {
  action: 'approve' | 'reject' | 'regenerate' | 'export';
  employeeIds: string[];
  periodId: string;
}

export interface PayrollStats {
  periodId: string;
  totalEmployees: number;
  processedEmployees: number;
  successRate: number;
  totalPayroll: number;
  averageProcessingTime: number;
  errors: Array<{
    employeeId: string;
    employeeName: string;
    error: string;
  }>;
}

// Estados disponibles para períodos
export const PAYROLL_PERIOD_STATUSES = {
  DRAFT: 'draft' as const,
  CALCULATED: 'calculated' as const,
  APPROVED: 'approved' as const,
  PAID: 'paid' as const,
  CLOSED: 'closed' as const
};

// Estados disponibles para nóminas individuales
export const PAYROLL_STATUSES = {
  CALCULATED: 'calculated' as const,
  APPROVED: 'approved' as const,
  PAID: 'paid' as const,
  ERROR: 'error' as const
};

// Frecuencias de nómina
export const PAYROLL_FREQUENCIES = {
  WEEKLY: 'weekly' as const,
  BIWEEKLY: 'biweekly' as const,
  MONTHLY: 'monthly' as const
};

// Tipos de movimientos
export const MOVEMENT_TYPES = {
  OVERTIME: 'overtime' as const,
  BONUS: 'bonus' as const,
  COMMISSION: 'commission' as const,
  LOAN: 'loan' as const,
  ADVANCE: 'advance' as const,
  ABSENCE: 'absence' as const,
  OTHER: 'other' as const
};

// Tipos de impacto
export const IMPACT_TYPES = {
  ADD: 'add' as const,
  SUBTRACT: 'subtract' as const
};
