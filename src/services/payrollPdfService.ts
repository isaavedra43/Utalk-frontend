import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extender jsPDF para incluir tipos de autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface PayrollPdfData {
  employee: {
    id: string;
    name: string;
    position: string;
    department: string;
  };
  period: {
    startDate: string;
    endDate: string;
    frequency: string;
    status: string;
  };
  payroll: {
    baseSalary: number;
    totalPerceptions: number;
    totalDeductions: number;
    netSalary: number;
  };
  perceptions: Array<{
    concept: string;
    description: string;
    amount: number;
  }>;
  deductions: Array<{
    concept: string;
    description: string;
    amount: number;
  }>;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

class PayrollPdfService {
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private getFrequencyLabel(frequency: string): string {
    switch (frequency) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'biweekly': return 'Quincenal';
      case 'monthly': return 'Mensual';
      default: return frequency;
    }
  }

  private getStatusLabel(status: string): string {
    switch (status) {
      case 'calculated': return 'Calculado';
      case 'approved': return 'Aprobado';
      case 'paid': return 'Pagado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }

  generatePayrollPdf(data: PayrollPdfData): void {
    try {
      console.log('🔄 Iniciando generación de PDF...');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Configurar colores
      const primaryColor = [31, 81, 255]; // Azul
      const secondaryColor = [107, 114, 128]; // Gris
      const successColor = [34, 197, 94]; // Verde
      const dangerColor = [239, 68, 68]; // Rojo

      // === HEADER ===
      // Logo/Company Name
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(data.company.name || 'UTALK', 20, yPosition);
      
      // Company Info
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(data.company.address || 'Dirección de la empresa', 20, yPosition + 6);
      doc.text(`Tel: ${data.company.phone || 'N/A'} | Email: ${data.company.email || 'N/A'}`, 20, yPosition + 10);

      // Title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('RECIBO DE NÓMINA', pageWidth - 20, yPosition, { align: 'right' });
      
      yPosition += 20;

      // === EMPLOYEE INFO ===
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN DEL EMPLEADO', 20, yPosition);
      yPosition += 6;

      // Employee details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Nombre: ${data.employee.name}`, 20, yPosition);
      yPosition += 4;
      doc.text(`Puesto: ${data.employee.position}`, 20, yPosition);
      yPosition += 4;
      doc.text(`Departamento: ${data.employee.department}`, 20, yPosition);
      yPosition += 4;
      doc.text(`ID: ${data.employee.id}`, 20, yPosition);
      yPosition += 8;

      // === PERIOD INFO ===
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('PERÍODO DE PAGO', 20, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Período: ${this.formatDate(data.period.startDate)} - ${this.formatDate(data.period.endDate)}`, 20, yPosition);
      yPosition += 4;
      doc.text(`Frecuencia: ${this.getFrequencyLabel(data.period.frequency)}`, 20, yPosition);
      yPosition += 4;
      doc.text(`Estado: ${this.getStatusLabel(data.period.status)}`, 20, yPosition);
      yPosition += 4;
      doc.text(`Emisión: ${new Date().toLocaleDateString('es-MX')}`, 20, yPosition);
      yPosition += 12;

      // === PERCEPTIONS ===
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(successColor[0], successColor[1], successColor[2]);
      doc.text('PERCEPCIONES', 20, yPosition);
      yPosition += 6;

      if (data.perceptions.length > 0) {
        // Crear tabla de percepciones manualmente
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        
        // Headers
        doc.setFont('helvetica', 'bold');
        doc.text('Concepto', 20, yPosition);
        doc.text('Descripción', 70, yPosition);
        doc.text('Importe', 160, yPosition);
        
        // Línea separadora
        doc.line(20, yPosition + 2, 190, yPosition + 2);
        yPosition += 6;
        
        // Filas de percepciones
        doc.setFont('helvetica', 'normal');
        data.perceptions.forEach(perception => {
          doc.text(perception.concept, 20, yPosition);
          doc.text(perception.description.length > 30 ? perception.description.substring(0, 30) + '...' : perception.description, 70, yPosition);
          doc.text(this.formatCurrency(perception.amount), 160, yPosition);
          yPosition += 4;
        });
        yPosition += 6;
      } else {
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('No hay percepciones registradas', 20, yPosition);
        yPosition += 8;
      }

      // === DEDUCTIONS ===
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2]);
      doc.text('DEDUCCIONES', 20, yPosition);
      yPosition += 6;

      if (data.deductions.length > 0) {
        // Crear tabla de deducciones manualmente
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        
        // Headers
        doc.setFont('helvetica', 'bold');
        doc.text('Concepto', 20, yPosition);
        doc.text('Descripción', 70, yPosition);
        doc.text('Importe', 160, yPosition);
        
        // Línea separadora
        doc.line(20, yPosition + 2, 190, yPosition + 2);
        yPosition += 6;
        
        // Filas de deducciones
        doc.setFont('helvetica', 'normal');
        data.deductions.forEach(deduction => {
          doc.text(deduction.concept, 20, yPosition);
          doc.text(deduction.description.length > 30 ? deduction.description.substring(0, 30) + '...' : deduction.description, 70, yPosition);
          doc.text(this.formatCurrency(deduction.amount), 160, yPosition);
          yPosition += 4;
        });
        yPosition += 6;
      } else {
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('No hay deducciones registradas', 20, yPosition);
        yPosition += 8;
      }

      // === SUMMARY ===
      yPosition += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('RESUMEN DE NÓMINA', 20, yPosition);
      yPosition += 10;

      // Summary boxes más pequeñas
      const summaryData = [
        { label: 'Salario Bruto', amount: data.payroll.totalPerceptions, color: [107, 114, 128] },
        { label: 'Deducciones', amount: data.payroll.totalDeductions, color: [239, 68, 68] },
        { label: 'Salario Neto', amount: data.payroll.netSalary, color: [34, 197, 94] }
      ];

      const boxWidth = 45;
      const boxHeight = 18;
      const boxSpacing = 55;

      summaryData.forEach((item, index) => {
        const x = 20 + (index * boxSpacing);
        
        // Box background
        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        doc.rect(x, yPosition, boxWidth, boxHeight, 'F');
        
        // Box border
        doc.setDrawColor(item.color[0], item.color[1], item.color[2]);
        doc.setLineWidth(0.5);
        doc.rect(x, yPosition, boxWidth, boxHeight, 'S');
        
        // Label
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 255, 255);
        doc.text(item.label, x + 3, yPosition + 6);
        
        // Amount
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(this.formatCurrency(item.amount), x + 3, yPosition + 14);
      });

      yPosition += boxHeight + 15;

      // === SIGNATURE SECTION ===
      // Optimizar para que quepa en una sola hoja
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('CONSTANCIA DE RECIBO', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('El empleado declara haber recibido la cantidad neta especificada en este recibo,', 20, yPosition);
      yPosition += 4;
      doc.text('correspondiente al período de trabajo indicado. Este documento es válido como', 20, yPosition);
      yPosition += 4;
      doc.text('constancia de pago y aceptación de la nómina.', 20, yPosition);
      yPosition += 10;

      // Solo firma del empleado
      doc.setFontSize(9);
      doc.text('Firma del Empleado:', 20, yPosition);
      doc.line(65, yPosition - 2, 110, yPosition - 2);
      doc.text('Fecha:', 130, yPosition);
      doc.line(150, yPosition - 2, 180, yPosition - 2);

      // === FOOTER ===
      const footerY = pageHeight - 15;
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Este documento fue generado automáticamente por el sistema UTALK', pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Página 1 de 1 - Generado el ${new Date().toLocaleString('es-MX')}`, pageWidth / 2, footerY + 5, { align: 'center' });

      // Descargar el PDF
      const fileName = `Nomina_${data.employee.name.replace(/\s+/g, '_')}_${data.period.startDate}_${data.period.endDate}.pdf`;
      doc.save(fileName);
      
      console.log('✅ PDF generado exitosamente:', fileName);
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      throw error;
    }
  }

  // Función helper para crear datos de prueba
  createSampleData(): PayrollPdfData {
    return {
      employee: {
        id: 'EMP001',
        name: 'Juan Pérez García',
        position: 'Desarrollador Senior',
        department: 'Tecnología'
      },
      period: {
        startDate: '2025-09-14',
        endDate: '2025-09-20',
        frequency: 'weekly',
        status: 'approved'
      },
      payroll: {
        baseSalary: 3056.00,
        totalPerceptions: 3132.39,
        totalDeductions: 0.00,
        netSalary: 3132.39
      },
      perceptions: [
        {
          concept: 'Sueldo Base',
          description: 'Salario mensual base calculado para frecuencia weekly',
          amount: 3056.00
        },
        {
          concept: 'Horas Extra',
          description: '4 horas extra @ $50.93/h',
          amount: 76.39
        }
      ],
      deductions: [],
      company: {
        name: 'UTALK S.A. de C.V.',
        address: 'Av. Reforma 123, Col. Centro, CDMX',
        phone: '+52 55 1234-5678',
        email: 'contacto@utalk.com'
      }
    };
  }
}

export const payrollPdfService = new PayrollPdfService();
export default payrollPdfService;
