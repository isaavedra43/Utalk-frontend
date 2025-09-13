// Utilidades para cálculos de nómina basados en extras reales
import { EmployeePayrollData, OvertimeExtra, AbsenceExtra, LoanExtra, AdvanceExtra } from '../types/payrollGeneral';

export interface PayrollCalculationResult {
  basePay: number;
  overtimePay: number;
  bonuses: number;
  allowances: number;
  totalPerceptions: number;
  loans: number;
  advances: number;
  absenceDeductions: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
}

export class PayrollCalculator {
  /**
   * Calcula la nómina de un empleado basada en sus extras del período
   */
  static calculateEmployeePayroll(
    baseSalary: number,
    workDays: number,
    workedDays: number,
    extras: {
      overtime: OvertimeExtra[];
      absences: AbsenceExtra[];
      loans: LoanExtra[];
      advances: AdvanceExtra[];
    },
    bonuses: number = 0,
    allowances: number = 0
  ): PayrollCalculationResult {
    
    // Calcular salario diario y por hora
    const dailySalary = baseSalary / 30; // Asumiendo 30 días por mes
    const hourlyRate = dailySalary / 8; // Asumiendo 8 horas por día
    
    // PERCEPCIONES
    // Sueldo base basado en días trabajados
    const basePay = workedDays * dailySalary;
    
    // Horas extra (solo las aprobadas)
    const overtimePay = extras.overtime
      .filter(ot => ot.status === 'approved')
      .reduce((sum, ot) => sum + ot.totalAmount, 0);
    
    const totalPerceptions = basePay + overtimePay + bonuses + allowances;
    
    // DEDUCCIONES (sin impuestos)
    // Deducciones por faltas (solo las aprobadas)
    const absenceDeductions = extras.absences
      .filter(abs => abs.status === 'approved')
      .reduce((sum, abs) => sum + abs.totalAmount, 0);
    
    // Préstamos activos (pago mensual)
    const loans = extras.loans
      .filter(loan => loan.status === 'active')
      .reduce((sum, loan) => sum + loan.monthlyPayment, 0);
    
    // Adelantos (solo los aprobados)
    const advances = extras.advances
      .filter(adv => adv.status === 'approved')
      .reduce((sum, adv) => sum + adv.amount, 0);
    
    const otherDeductions = 0; // Para futuras deducciones
    const totalDeductions = absenceDeductions + loans + advances + otherDeductions;
    
    // Neto a pagar
    const netPay = totalPerceptions - totalDeductions;
    
    return {
      basePay,
      overtimePay,
      bonuses,
      allowances,
      totalPerceptions,
      loans,
      advances,
      absenceDeductions,
      otherDeductions,
      totalDeductions,
      netPay
    };
  }
  
  /**
   * Calcula estadísticas de asistencia
   */
  static calculateAttendanceStats(
    workDays: number,
    workedDays: number,
    extras: {
      overtime: OvertimeExtra[];
      absences: AbsenceExtra[];
    }
  ) {
    const absentDays = extras.absences
      .filter(abs => abs.status === 'approved')
      .reduce((sum, abs) => sum + abs.days, 0);
    
    const overtimeHours = extras.overtime
      .filter(ot => ot.status === 'approved')
      .reduce((sum, ot) => sum + ot.hours, 0);
    
    return {
      workDays,
      workedDays,
      absentDays,
      overtimeHours,
      attendanceRate: (workedDays / workDays) * 100
    };
  }
  
  /**
   * Valida que los cálculos sean correctos
   */
  static validateCalculation(result: PayrollCalculationResult): boolean {
    const calculatedTotal = result.basePay + result.overtimePay + result.bonuses + result.allowances;
    const calculatedDeductions = result.loans + result.advances + result.absenceDeductions + result.otherDeductions;
    const calculatedNet = calculatedTotal - calculatedDeductions;
    
    return (
      Math.abs(calculatedTotal - result.totalPerceptions) < 0.01 &&
      Math.abs(calculatedDeductions - result.totalDeductions) < 0.01 &&
      Math.abs(calculatedNet - result.netPay) < 0.01
    );
  }
  
  /**
   * Formatea montos para mostrar en la UI
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }
  
  /**
   * Calcula el resumen de nómina para múltiples empleados
   */
  static calculatePayrollSummary(employees: EmployeePayrollData[]) {
    const totalEmployees = employees.length;
    const totalGrossPay = employees.reduce((sum, emp) => sum + emp.totalPerceptions, 0);
    const totalDeductions = employees.reduce((sum, emp) => sum + emp.totalDeductions, 0);
    const totalNetPay = employees.reduce((sum, emp) => sum + emp.netPay, 0);
    const totalAbsences = employees.reduce((sum, emp) => sum + emp.absentDays, 0);
    const totalLoans = employees.reduce((sum, emp) => sum + emp.loans, 0);
    const averageSalary = totalEmployees > 0 ? totalNetPay / totalEmployees : 0;
    
    // Agrupar por departamento
    const departmentBreakdown = employees.reduce((acc, emp) => {
      const existing = acc.find(d => d.department === emp.department);
      if (existing) {
        existing.employees += 1;
        existing.totalPay += emp.netPay;
      } else {
        acc.push({
          department: emp.department,
          employees: 1,
          totalPay: emp.netPay
        });
      }
      return acc;
    }, [] as { department: string; employees: number; totalPay: number }[]);
    
    // Agrupar por estado
    const statusBreakdown = employees.reduce((acc, emp) => {
      acc[emp.status] = (acc[emp.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    return {
      totalEmployees,
      totalGrossPay,
      totalDeductions,
      totalNetPay,
      totalAbsences,
      totalLoans,
      averageSalary,
      departmentBreakdown,
      statusBreakdown: {
        pending: statusBreakdown.pending || 0,
        approved: statusBreakdown.approved || 0,
        paid: statusBreakdown.paid || 0
      }
    };
  }
}
