// Tipos para el módulo de nómina general
export interface PayrollPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  status: 'draft' | 'processing' | 'completed' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export interface EmployeePayrollData {
  employeeId: string;
  employeeNumber: string;
  fullName: string;
  position: string;
  department: string;
  avatar?: string;
  
  // Información salarial
  baseSalary: number;
  dailySalary: number;
  hourlyRate: number;
  
  // Asistencia y faltas
  workDays: number;
  workedDays: number;
  absentDays: number;
  lateArrivals: number;
  overtime: number;
  
  // Percepciones
  basePay: number;
  overtimePay: number;
  bonuses: number;
  allowances: number;
  totalPerceptions: number;
  
  // Deducciones
  taxes: number;
  socialSecurity: number;
  loans: number;
  advances: number;
  absenceDeductions: number;
  otherDeductions: number;
  totalDeductions: number;
  
  // Total neto
  netPay: number;
  
  // Estado
  status: 'pending' | 'approved' | 'paid';
  notes?: string;
}

export interface PayrollGeneralSummary {
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  totalAbsences: number;
  totalLoans: number;
  averageSalary: number;
  
  // Desglose por departamento
  departmentBreakdown: {
    department: string;
    employees: number;
    totalPay: number;
  }[];
  
  // Desglose por estado
  statusBreakdown: {
    pending: number;
    approved: number;
    paid: number;
  };
}

export interface PayrollVoucher {
  employeeId: string;
  periodId: string;
  voucherNumber: string;
  employee: {
    fullName: string;
    employeeNumber: string;
    position: string;
    department: string;
  };
  period: {
    name: string;
    startDate: string;
    endDate: string;
  };
  
  // Percepciones detalladas
  perceptions: {
    basePay: number;
    overtime: number;
    bonuses: number;
    allowances: number;
    total: number;
  };
  
  // Deducciones detalladas
  deductions: {
    taxes: number;
    socialSecurity: number;
    loans: number;
    advances: number;
    absences: number;
    other: number;
    total: number;
  };
  
  netPay: number;
  generatedAt: string;
  signedAt?: string;
  signature?: string;
}

export interface PayrollGeneralFilters {
  department?: string;
  status?: 'pending' | 'approved' | 'paid' | 'all';
  search?: string;
  minSalary?: number;
  maxSalary?: number;
}

export interface PayrollGeneralConfig {
  periodId: string;
  autoCalculateDeductions: boolean;
  includeOvertime: boolean;
  includeBonuses: boolean;
  taxRate: number;
  socialSecurityRate: number;
  defaultWorkDays: number;
}
