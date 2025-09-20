import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(data.company.name || 'UTALK', 20, yPosition);
    
    // Company Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(data.company.address || 'Dirección de la empresa', 20, yPosition + 8);
    doc.text(`Tel: ${data.company.phone || 'N/A'} | Email: ${data.company.email || 'N/A'}`, 20, yPosition + 13);

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('RECIBO DE NÓMINA', pageWidth - 20, yPosition, { align: 'right' });
    
    yPosition += 30;

    // === EMPLOYEE INFO ===
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL EMPLEADO', 20, yPosition);
    yPosition += 10;

    // Employee details table
    const employeeData = [
      ['Nombre:', data.employee.name],
      ['Puesto:', data.employee.position],
      ['Departamento:', data.employee.department],
      ['ID Empleado:', data.employee.id]
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    employeeData.forEach(([label, value]) => {
      doc.text(label, 20, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 80, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 6;
    });

    yPosition += 10;

    // === PERIOD INFO ===
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PERÍODO DE PAGO', 20, yPosition);
    yPosition += 10;

    const periodData = [
      ['Período:', `${this.formatDate(data.period.startDate)} - ${this.formatDate(data.period.endDate)}`],
      ['Frecuencia:', this.getFrequencyLabel(data.period.frequency)],
      ['Estado:', this.getStatusLabel(data.period.status)],
      ['Fecha de Emisión:', new Date().toLocaleDateString('es-MX')]
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    periodData.forEach(([label, value]) => {
      doc.text(label, 20, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 80, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 6;
    });

    yPosition += 15;

    // === PERCEPTIONS ===
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(successColor[0], successColor[1], successColor[2]);
    doc.text('📈 PERCEPCIONES', 20, yPosition);
    yPosition += 10;

    if (data.perceptions.length > 0) {
      const perceptionHeaders = ['Concepto', 'Descripción', 'Importe'];
      const perceptionRows = data.perceptions.map(p => [
        p.concept,
        p.description,
        this.formatCurrency(p.amount)
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [perceptionHeaders],
        body: perceptionRows,
        theme: 'grid',
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          2: { halign: 'right' }
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('No hay percepciones registradas', 20, yPosition);
      yPosition += 15;
    }

    // === DEDUCTIONS ===
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2]);
    doc.text('📉 DEDUCCIONES', 20, yPosition);
    yPosition += 10;

    if (data.deductions.length > 0) {
      const deductionHeaders = ['Concepto', 'Descripción', 'Importe'];
      const deductionRows = data.deductions.map(d => [
        d.concept,
        d.description,
        this.formatCurrency(d.amount)
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [deductionHeaders],
        body: deductionRows,
        theme: 'grid',
        headStyles: {
          fillColor: [239, 68, 68],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          2: { halign: 'right' }
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('No hay deducciones registradas', 20, yPosition);
      yPosition += 15;
    }

    // === SUMMARY ===
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('RESUMEN DE NÓMINA', 20, yPosition);
    yPosition += 15;

    // Summary boxes
    const summaryData = [
      { label: 'Salario Bruto', amount: data.payroll.totalPerceptions, color: [107, 114, 128] },
      { label: 'Deducciones', amount: data.payroll.totalDeductions, color: [239, 68, 68] },
      { label: 'Salario Neto', amount: data.payroll.netSalary, color: [34, 197, 94] }
    ];

    const boxWidth = 50;
    const boxHeight = 25;
    const boxSpacing = 60;

    summaryData.forEach((item, index) => {
      const x = 20 + (index * boxSpacing);
      
      // Box background
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.roundedRect(x, yPosition, boxWidth, boxHeight, 3, 3, 'F');
      
      // Box border
      doc.setDrawColor(item.color[0], item.color[1], item.color[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(x, yPosition, boxWidth, boxHeight, 3, 3, 'S');
      
      // Label
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      doc.text(item.label, x + 5, yPosition + 8);
      
      // Amount
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(item.amount), x + 5, yPosition + 18);
    });

    yPosition += boxHeight + 20;

    // === SIGNATURE SECTION ===
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('CONSTANCIA DE RECIBO', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('El empleado declara haber recibido la cantidad neta especificada en este recibo,', 20, yPosition);
    yPosition += 6;
    doc.text('correspondiente al período de trabajo indicado. Este documento es válido como', 20, yPosition);
    yPosition += 6;
    doc.text('constancia de pago y aceptación de la nómina.', 20, yPosition);
    yPosition += 15;

    // Signature lines
    doc.text('Firma del Empleado:', 20, yPosition);
    doc.line(70, yPosition - 2, 120, yPosition - 2);
    doc.text('Fecha:', 140, yPosition);
    doc.line(160, yPosition - 2, 200, yPosition - 2);
    yPosition += 20;

    doc.text('Firma del Representante:', 20, yPosition);
    doc.line(70, yPosition - 2, 120, yPosition - 2);
    doc.text('Fecha:', 140, yPosition);
    doc.line(160, yPosition - 2, 200, yPosition - 2);

    // === FOOTER ===
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Este documento fue generado automáticamente por el sistema UTALK', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Página 1 de 1 - Generado el ${new Date().toLocaleString('es-MX')}`, pageWidth / 2, footerY + 5, { align: 'center' });

    // Descargar el PDF
    const fileName = `Nomina_${data.employee.name.replace(/\s+/g, '_')}_${data.period.startDate}_${data.period.endDate}.pdf`;
    doc.save(fileName);
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
