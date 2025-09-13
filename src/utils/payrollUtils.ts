// ===================================================================
// UTILIDADES PARA EL MÓDULO DE NÓMINA GENERAL
// ===================================================================

import { PayrollPeriod, PayrollEmployee, PayrollCalculation, PAYROLL_PERIOD_STATUSES } from '../types/payroll';

// ===================================================================
// FORMATEO DE MONEDA Y NÚMEROS
// ===================================================================

/**
 * Formatear cantidad como moneda mexicana
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Formatear número con separadores de miles
 */
export const formatNumber = (number: number, decimals = 2): string => {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Formatear porcentaje
 */
export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

// ===================================================================
// FORMATEO DE FECHAS
// ===================================================================

/**
 * Formatear fecha para mostrar
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formatear fecha corta
 */
export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Formatear rango de fechas
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startFormatted = start.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short'
  });
  
  const endFormatted = end.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  return `${startFormatted} - ${endFormatted}`;
};

// ===================================================================
// CÁLCULOS DE NÓMINA
// ===================================================================

/**
 * Calcular días trabajados en un período
 */
export const calculateWorkedDays = (
  startDate: string,
  endDate: string,
  excludeWeekends = true
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workDays = 0;
  
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    
    if (excludeWeekends) {
      // Excluir sábados (6) y domingos (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
    } else {
      workDays++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workDays;
};

/**
 * Calcular salario proporcional por días trabajados
 */
export const calculateProportionalSalary = (
  baseSalary: number,
  workedDays: number,
  totalDays: number
): number => {
  if (totalDays === 0) return 0;
  return (baseSalary * workedDays) / totalDays;
};

/**
 * Calcular ISR básico (aproximado)
 */
export const calculateBasicISR = (monthlyGrossSalary: number): number => {
  // Tabla ISR 2025 simplificada para cálculos rápidos
  const annualSalary = monthlyGrossSalary * 12;
  
  if (annualSalary <= 416220) return 0;
  if (annualSalary <= 624329) return (annualSalary - 416220) * 0.15 / 12;
  if (annualSalary <= 867123) return ((annualSalary - 624329) * 0.20 + 31216) / 12;
  if (annualSalary <= 1000000) return ((annualSalary - 867123) * 0.25 + 79776) / 12;
  if (annualSalary <= 1200000) return ((annualSalary - 1000000) * 0.30 + 133095) / 12;
  if (annualSalary <= 1500000) return ((annualSalary - 1200000) * 0.32 + 193095) / 12;
  if (annualSalary <= 2000000) return ((annualSalary - 1500000) * 0.34 + 289095) / 12;
  if (annualSalary <= 3000000) return ((annualSalary - 2000000) * 0.35 + 459095) / 12;
  
  return ((annualSalary - 3000000) * 0.36 + 809095) / 12;
};

/**
 * Calcular deducciones de seguridad social
 */
export const calculateSocialSecurityDeductions = (sbc: number): {
  imss: number;
  afore: number;
  total: number;
} => {
  // Tope de cotización 25 UMAs (aproximado para 2025)
  const maxSBC = 82419;
  const limitedSBC = Math.min(sbc, maxSBC);
  
  const imss = limitedSBC * 0.04; // 4% aproximado total IMSS empleado
  const afore = limitedSBC * 0.01125; // 1.125% AFORE
  
  return {
    imss: Math.round(imss * 100) / 100,
    afore: Math.round(afore * 100) / 100,
    total: Math.round((imss + afore) * 100) / 100
  };
};

/**
 * Calcular nómina completa de un empleado
 */
export const calculateEmployeePayroll = (
  baseSalary: number,
  workedDays: number,
  totalDays: number,
  perceptions = 0,
  otherDeductions = 0,
  sbc?: number
): PayrollCalculation => {
  // Salario proporcional
  const proportionalSalary = calculateProportionalSalary(baseSalary, workedDays, totalDays);
  
  // Salario bruto
  const grossSalary = proportionalSalary + perceptions;
  
  // Deducciones fiscales
  const isr = calculateBasicISR(grossSalary);
  const socialSecurity = calculateSocialSecurityDeductions(sbc || grossSalary);
  
  // Total deducciones
  const totalDeductions = isr + socialSecurity.total + otherDeductions;
  
  // Salario neto
  const netSalary = Math.max(0, grossSalary - totalDeductions);
  
  return {
    employeeId: '',
    baseSalary,
    workedDays,
    totalDays,
    perceptions: {
      salary: proportionalSalary,
      overtime: 0,
      bonuses: perceptions,
      commissions: 0,
      other: 0,
      total: proportionalSalary + perceptions
    },
    deductions: {
      isr: Math.round(isr * 100) / 100,
      imss: socialSecurity.imss,
      afore: socialSecurity.afore,
      infonavit: 0,
      loans: otherDeductions,
      absences: 0,
      other: 0,
      total: Math.round(totalDeductions * 100) / 100
    },
    grossSalary: Math.round(grossSalary * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100
  };
};

// ===================================================================
// VALIDACIONES
// ===================================================================

/**
 * Validar que un período puede ser procesado
 */
export const canPeriodBeProcessed = (period: PayrollPeriod): boolean => {
  return period.status === PAYROLL_PERIOD_STATUSES.DRAFT;
};

/**
 * Validar que un período puede ser aprobado
 */
export const canPeriodBeApproved = (period: PayrollPeriod): boolean => {
  return period.status === PAYROLL_PERIOD_STATUSES.CALCULATED;
};

/**
 * Validar que un período puede ser marcado como pagado
 */
export const canPeriodBePaid = (period: PayrollPeriod): boolean => {
  return period.status === PAYROLL_PERIOD_STATUSES.APPROVED;
};

/**
 * Validar que un período puede ser cerrado
 */
export const canPeriodBeClosed = (period: PayrollPeriod): boolean => {
  return period.status === PAYROLL_PERIOD_STATUSES.PAID;
};

/**
 * Validar rango de fechas
 */
export const validateDateRange = (startDate: string, endDate: string): {
  isValid: boolean;
  error?: string;
} => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    return {
      isValid: false,
      error: 'La fecha de inicio debe ser anterior a la fecha de fin'
    };
  }
  
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 31) {
    return {
      isValid: false,
      error: 'El período no puede ser mayor a 31 días'
    };
  }
  
  if (daysDiff < 1) {
    return {
      isValid: false,
      error: 'El período debe ser de al menos 1 día'
    };
  }
  
  return { isValid: true };
};

// ===================================================================
// ESTADOS Y ETIQUETAS
// ===================================================================

/**
 * Obtener etiqueta legible para estado de período
 */
export const getPeriodStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: 'Borrador',
    calculated: 'Calculado',
    approved: 'Aprobado',
    paid: 'Pagado',
    closed: 'Cerrado'
  };
  
  return labels[status] || status;
};

/**
 * Obtener color para estado de período
 */
export const getPeriodStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'gray',
    calculated: 'blue',
    approved: 'green',
    paid: 'purple',
    closed: 'slate'
  };
  
  return colors[status] || 'gray';
};

/**
 * Obtener etiqueta para frecuencia de nómina
 */
export const getFrequencyLabel = (frequency: string): string => {
  const labels: Record<string, string> = {
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual'
  };
  
  return labels[frequency] || frequency;
};

// ===================================================================
// EXPORTACIÓN Y UTILIDADES DE ARCHIVO
// ===================================================================

/**
 * Generar nombre de archivo para exportación
 */
export const generateExportFileName = (
  periodName: string,
  format: 'excel' | 'pdf' | 'csv'
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const cleanPeriodName = periodName.replace(/[^a-zA-Z0-9]/g, '_');
  
  const extensions: Record<string, string> = {
    excel: 'xlsx',
    pdf: 'pdf',
    csv: 'csv'
  };
  
  return `nomina_${cleanPeriodName}_${timestamp}.${extensions[format]}`;
};

/**
 * Descargar archivo blob
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ===================================================================
// RESUMEN Y ESTADÍSTICAS
// ===================================================================

/**
 * Calcular resumen de nóminas
 */
export const calculatePayrollSummary = (payrolls: PayrollEmployee[]): {
  totalEmployees: number;
  totalPayroll: number;
  totalPerceptions: number;
  totalDeductions: number;
  averageSalary: number;
  highestSalary: number;
  lowestSalary: number;
} => {
  if (payrolls.length === 0) {
    return {
      totalEmployees: 0,
      totalPayroll: 0,
      totalPerceptions: 0,
      totalDeductions: 0,
      averageSalary: 0,
      highestSalary: 0,
      lowestSalary: 0
    };
  }
  
  const totalPayroll = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const totalPerceptions = payrolls.reduce((sum, p) => sum + (p.totalPerceptions || 0), 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + (p.totalDeductions || 0), 0);
  
  const salaries = payrolls.map(p => p.netSalary || 0);
  const highestSalary = Math.max(...salaries);
  const lowestSalary = Math.min(...salaries);
  const averageSalary = totalPayroll / payrolls.length;
  
  return {
    totalEmployees: payrolls.length,
    totalPayroll: Math.round(totalPayroll * 100) / 100,
    totalPerceptions: Math.round(totalPerceptions * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    averageSalary: Math.round(averageSalary * 100) / 100,
    highestSalary: Math.round(highestSalary * 100) / 100,
    lowestSalary: Math.round(lowestSalary * 100) / 100
  };
};

/**
 * Obtener progreso del período
 */
export const getPeriodProgress = (period: PayrollPeriod): {
  percentage: number;
  label: string;
  color: string;
} => {
  const { summary } = period;
  const total = summary.totalEmployees;
  
  if (total === 0) {
    return { percentage: 0, label: 'Sin empleados', color: 'gray' };
  }
  
  switch (period.status) {
    case 'draft':
      return { 
        percentage: 0, 
        label: `0 de ${total} procesados`, 
        color: 'gray' 
      };
    case 'calculated':
      return { 
        percentage: 100, 
        label: `${summary.employeesProcessed} de ${total} calculados`, 
        color: 'blue' 
      };
    case 'approved':
      return { 
        percentage: 100, 
        label: `${summary.employeesApproved} de ${total} aprobados`, 
        color: 'green' 
      };
    case 'paid':
      return { 
        percentage: 100, 
        label: `${summary.employeesPaid} de ${total} pagados`, 
        color: 'purple' 
      };
    case 'closed':
      return { 
        percentage: 100, 
        label: 'Período cerrado', 
        color: 'slate' 
      };
    default:
      return { percentage: 0, label: 'Estado desconocido', color: 'gray' };
  }
};
