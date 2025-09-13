// Servicio para la gestión de nómina general
import { 
  PayrollPeriod, 
  EmployeePayrollData, 
  PayrollGeneralSummary, 
  PayrollVoucher,
  PayrollGeneralConfig 
} from '../types/payrollGeneral';

class PayrollGeneralService {
  private baseUrl = '/api/payroll-general';

  // Gestión de Períodos
  async createPeriod(periodData: Partial<PayrollPeriod>): Promise<{ success: boolean; data: PayrollPeriod; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/periods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(periodData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al crear período');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, data: {} as PayrollPeriod, error: error.message };
    }
  }

  async updatePeriod(periodId: string, periodData: Partial<PayrollPeriod>): Promise<{ success: boolean; data: PayrollPeriod; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/periods/${periodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(periodData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar período');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, data: {} as PayrollPeriod, error: error.message };
    }
  }

  async getPeriods(): Promise<{ success: boolean; data: PayrollPeriod[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/periods`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener períodos');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    }
  }

  async getPeriod(periodId: string): Promise<{ success: boolean; data: PayrollPeriod; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/periods/${periodId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener período');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, data: {} as PayrollPeriod, error: error.message };
    }
  }

  // Gestión de Nómina por Período
  async getPayrollByPeriod(periodId: string): Promise<{ success: boolean; data: { employees: EmployeePayrollData[]; summary: PayrollGeneralSummary }; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/periods/${periodId}/payroll`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener nómina del período');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { 
        success: false, 
        data: { employees: [], summary: {} as PayrollGeneralSummary }, 
        error: error.message 
      };
    }
  }

  // Obtener extras de empleados para un período específico
  async getEmployeeExtrasForPeriod(employeeId: string, periodId: string): Promise<{ success: boolean; data: { overtime: any[]; absences: any[]; loans: any[]; advances: any[] }; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/periods/${periodId}/employees/${employeeId}/extras`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener extras del empleado');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { 
        success: false, 
        data: { overtime: [], absences: [], loans: [], advances: [] }, 
        error: error.message 
      };
    }
  }

  // Obtener todos los extras para un período (todos los empleados)
  async getAllExtrasForPeriod(periodId: string): Promise<{ success: boolean; data: { [employeeId: string]: { overtime: any[]; absences: any[]; loans: any[]; advances: any[] } }; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/periods/${periodId}/extras`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener extras del período');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { 
        success: false, 
        data: {}, 
        error: error.message 
      };
    }
  }

  async processPayroll(periodId: string, config?: PayrollGeneralConfig): Promise<{ success: boolean; data: { processId: string }; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/periods/${periodId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ config })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar nómina');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, data: { processId: '' }, error: error.message };
    }
  }

  async approvePayroll(periodId: string, employeeIds?: string[]): Promise<{ success: boolean; data: { approvedCount: number }; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/periods/${periodId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ employeeIds })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al aprobar nómina');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, data: { approvedCount: 0 }, error: error.message };
    }
  }

  async payPayroll(periodId: string, employeeIds?: string[]): Promise<{ success: boolean; data: { paidCount: number }; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/periods/${periodId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ employeeIds })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al pagar nómina');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, data: { paidCount: 0 }, error: error.message };
    }
  }

  // Gestión de Vales
  async generateVoucher(employeeId: string, periodId: string): Promise<{ success: boolean; data: PayrollVoucher; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/vouchers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ employeeId, periodId })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al generar vale');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, data: {} as PayrollVoucher, error: error.message };
    }
  }

  async signVoucher(voucherId: string, signature: string): Promise<{ success: boolean; data: PayrollVoucher; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/vouchers/${voucherId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ signature })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al firmar vale');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, data: {} as PayrollVoucher, error: error.message };
    }
  }

  async generateVouchersPDF(periodId: string, employeeIds?: string[]): Promise<{ success: boolean; data: { downloadUrl: string }; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/periods/${periodId}/vouchers/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ employeeIds })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al generar PDFs');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, data: { downloadUrl: '' }, error: error.message };
    }
  }

  // Reportes
  async generateReport(periodId: string, format: 'pdf' | 'excel' = 'pdf'): Promise<{ success: boolean; data: { downloadUrl: string }; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/periods/${periodId}/report?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al generar reporte');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, data: { downloadUrl: '' }, error: error.message };
    }
  }

  // Estadísticas y Resúmenes
  async getEmployeeCount(): Promise<{ success: boolean; data: { count: number }; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats/employees`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener estadísticas');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, data: { count: 0 }, error: error.message };
    }
  }

  async getAverageSalary(): Promise<{ success: boolean; data: { average: number }; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats/salary-average`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener promedio salarial');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, data: { average: 0 }, error: error.message };
    }
  }

  // Configuración
  async getConfig(): Promise<{ success: boolean; data: PayrollGeneralConfig; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener configuración');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { 
        success: false, 
        data: {} as PayrollGeneralConfig, 
        error: error.message 
      };
    }
  }

  async updateConfig(config: Partial<PayrollGeneralConfig>): Promise<{ success: boolean; data: PayrollGeneralConfig; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(config)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar configuración');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      return { 
        success: false, 
        data: {} as PayrollGeneralConfig, 
        error: error.message 
      };
    }
  }
}

export const payrollGeneralService = new PayrollGeneralService();
export default payrollGeneralService;
