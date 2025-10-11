// ============================================================================
// SERVICIO DE EXPORTACIÓN DEL LADO DEL CLIENTE
// ============================================================================

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { AttendanceDetailResponse, EmployeeAttendance } from '../types';

interface ExportOptions {
  creator?: string;
  approver?: string;
  mobileOptimized?: boolean;
  maxEmployeesPerPage?: number;
}

interface ExportData {
  report: any;
  employees: EmployeeAttendance[];
  stats?: any;
}

export class ExportService {
  /**
   * Exportar reporte como PDF optimizado para móvil
   */
  static async exportToPDF(data: ExportData, options: ExportOptions = {}): Promise<void> {
    try {
      console.log('📄 ExportService - Generando PDF...');
      
      const {
        creator = 'Sistema',
        approver = 'Pendiente',
        mobileOptimized = true,
        maxEmployeesPerPage = 20
      } = options;

      // Crear PDF con orientación portrait para móvil
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configuración de fuente y tamaños
      const fontSize = mobileOptimized ? 8 : 10;
      const headerFontSize = mobileOptimized ? 12 : 14;
      const lineHeight = fontSize * 0.4;
      
      let yPosition = 20;

      // Función para agregar texto con wrap
      const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize?: number) => {
        if (fontSize) pdf.setFontSize(fontSize);
        if (maxWidth) {
          const lines = pdf.splitTextToSize(text, maxWidth);
          pdf.text(lines, x, y);
          return y + (lines.length * lineHeight);
        } else {
          pdf.text(text, x, y);
          return y + lineHeight;
        }
      };

      // Función para agregar línea
      const addLine = (y: number) => {
        pdf.line(20, y, 190, y);
        return y + 2;
      };

      // Header del reporte
      pdf.setFontSize(headerFontSize);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('REPORTE DE ASISTENCIA', 20, yPosition);
      
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(`Fecha: ${data.report.date}`, 20, yPosition + 2);
      yPosition = addText(`Creado por: ${creator}`, 20, yPosition);
      yPosition = addText(`Autorizado por: ${approver}`, 20, yPosition);
      yPosition = addText(`Estado: ${data.report.status === 'approved' ? 'Aprobado' : 'Borrador'}`, 20, yPosition);
      
      if (data.report.notes) {
        yPosition = addText(`Notas: ${data.report.notes}`, 20, yPosition);
      }
      
      yPosition = addLine(yPosition + 5);

      // Estadísticas resumidas
      if (data.stats) {
        pdf.setFont('helvetica', 'bold');
        yPosition = addText('RESUMEN GENERAL', 20, yPosition + 5);
        pdf.setFont('helvetica', 'normal');
        
        const statsText = [
          `Total Empleados: ${data.employees.length}`,
          `Presentes: ${data.stats.presentCount || 0}`,
          `Ausentes: ${data.stats.absentCount || 0}`,
          `Tardes: ${data.stats.lateCount || 0}`,
          `Vacaciones: ${data.stats.vacationCount || 0}`,
          `Horas Totales: ${data.stats.totalHours || 0}h`,
          `Horas Extra: ${data.stats.overtimeHours || 0}h`
        ];
        
        statsText.forEach(stat => {
          yPosition = addText(stat, 20, yPosition);
        });
        
        yPosition = addLine(yPosition + 3);
      }

      // Tabla de empleados
      const employeesPerPage = mobileOptimized ? maxEmployeesPerPage : 15;
      const totalReportPages = Math.ceil(data.employees.length / employeesPerPage);
      
      for (let page = 0; page < totalReportPages; page++) {
        if (page > 0) {
          pdf.addPage();
          yPosition = 20;
        }

        // Header de la tabla
        pdf.setFont('helvetica', 'bold');
        yPosition = addText(`DETALLE DE EMPLEADOS - Página ${page + 1} de ${totalReportPages}`, 20, yPosition + 5);
        pdf.setFont('helvetica', 'normal');
        yPosition = addLine(yPosition + 3);

        // Columnas de la tabla
        const colWidths = mobileOptimized ? [40, 25, 25, 20, 15] : [50, 30, 30, 25, 20];
        const headers = ['Empleado', 'Estado', 'Horario', 'Horas', 'Extra'];
        
        // Header de columnas
        let xPos = 20;
        headers.forEach((header, index) => {
          pdf.setFont('helvetica', 'bold');
          pdf.rect(xPos, yPosition - 5, colWidths[index], 8);
          addText(header, xPos + 2, yPosition - 1);
          xPos += colWidths[index];
        });
        pdf.setFont('helvetica', 'normal');
        yPosition += 8;

        // Datos de empleados
        const startIndex = page * employeesPerPage;
        const endIndex = Math.min(startIndex + employeesPerPage, data.employees.length);
        
        for (let i = startIndex; i < endIndex; i++) {
          const employee = data.employees[i];
          
          // Verificar si hay espacio en la página
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }

          xPos = 20;
          
          // Nombre del empleado
          const employeeName = employee.employeeName || `Empleado ${employee.employeeId.slice(0, 8)}`;
          const employeeNumber = employee.employeeNumber || employee.employeeId.slice(0, 8);
          const employeeText = `${employeeName}\n${employeeNumber}`;
          
          pdf.rect(xPos, yPosition - 5, colWidths[0], 12);
          addText(employeeText, xPos + 1, yPosition + 2, colWidths[0] - 2);
          xPos += colWidths[0];

          // Estado
          const statusText = this.getStatusText(employee.status);
          pdf.rect(xPos, yPosition - 5, colWidths[1], 12);
          addText(statusText, xPos + 2, yPosition + 2, colWidths[1] - 4);
          xPos += colWidths[1];

          // Horario
          const scheduleText = employee.clockIn && employee.clockOut 
            ? `${employee.clockIn}\n${employee.clockOut}`
            : '-';
          pdf.rect(xPos, yPosition - 5, colWidths[2], 12);
          addText(scheduleText, xPos + 2, yPosition + 2, colWidths[2] - 4);
          xPos += colWidths[2];

          // Horas
          const hoursText = employee.totalHours ? `${employee.totalHours}h` : '-';
          pdf.rect(xPos, yPosition - 5, colWidths[3], 12);
          addText(hoursText, xPos + 2, yPosition + 2, colWidths[3] - 4);
          xPos += colWidths[3];

          // Horas extra
          const overtimeText = employee.overtimeHours ? `${employee.overtimeHours}h` : '0h';
          pdf.rect(xPos, yPosition - 5, colWidths[4], 12);
          addText(overtimeText, xPos + 2, yPosition + 2, colWidths[4] - 4);

          yPosition += 12;
        }
      }

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(
          `Generado el ${new Date().toLocaleDateString()} - Página ${i} de ${totalPages}`,
          20,
          290
        );
      }

      // Descargar PDF
      const filename = `reporte-asistencia-${data.report.date}.pdf`;
      pdf.save(filename);
      
      console.log('✅ PDF exportado exitosamente');
    } catch (error) {
      console.error('❌ Error exportando PDF:', error);
      throw error;
    }
  }

  /**
   * Exportar reporte como Excel
   */
  static async exportToExcel(data: ExportData, options: ExportOptions = {}): Promise<void> {
    try {
      console.log('📊 ExportService - Generando Excel...');
      
      const { creator = 'Sistema', approver = 'Pendiente' } = options;

      // Crear workbook
      const workbook = XLSX.utils.book_new();

      // Hoja de resumen
      const summaryData = [
        ['REPORTE DE ASISTENCIA'],
        [''],
        ['Fecha:', data.report.date],
        ['Creado por:', creator],
        ['Autorizado por:', approver],
        ['Estado:', data.report.status === 'approved' ? 'Aprobado' : 'Borrador'],
        ['Notas:', data.report.notes || ''],
        [''],
        ['RESUMEN GENERAL'],
        ['Total Empleados:', data.employees.length],
        ['Presentes:', data.stats?.presentCount || 0],
        ['Ausentes:', data.stats?.absentCount || 0],
        ['Tardes:', data.stats?.lateCount || 0],
        ['Vacaciones:', data.stats?.vacationCount || 0],
        ['Horas Totales:', `${data.stats?.totalHours || 0}h`],
        ['Horas Extra:', `${data.stats?.overtimeHours || 0}h`]
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

      // Hoja de detalle de empleados
      const employeeData = [
        ['Empleado', 'ID', 'Estado', 'Hora Entrada', 'Hora Salida', 'Horas Totales', 'Horas Extra', 'Notas']
      ];

      data.employees.forEach(employee => {
        employeeData.push([
          employee.employeeName || `Empleado ${employee.employeeId.slice(0, 8)}`,
          employee.employeeNumber || employee.employeeId.slice(0, 8),
          this.getStatusText(employee.status),
          employee.clockIn || '-',
          employee.clockOut || '-',
          employee.totalHours || 0,
          employee.overtimeHours || 0,
          employee.notes || ''
        ]);
      });

      const employeeSheet = XLSX.utils.aoa_to_sheet(employeeData);
      
      // Ajustar ancho de columnas
      employeeSheet['!cols'] = [
        { width: 25 }, // Empleado
        { width: 15 }, // ID
        { width: 12 }, // Estado
        { width: 12 }, // Hora Entrada
        { width: 12 }, // Hora Salida
        { width: 12 }, // Horas Totales
        { width: 12 }, // Horas Extra
        { width: 30 }  // Notas
      ];

      XLSX.utils.book_append_sheet(workbook, employeeSheet, 'Empleados');

      // Descargar Excel
      const filename = `reporte-asistencia-${data.report.date}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
      console.log('✅ Excel exportado exitosamente');
    } catch (error) {
      console.error('❌ Error exportando Excel:', error);
      throw error;
    }
  }

  /**
   * Exportar reporte como imagen
   */
  static async exportToImage(data: ExportData, options: ExportOptions = {}): Promise<void> {
    try {
      console.log('🖼️ ExportService - Generando imagen...');
      
      const { format = 'png' } = options;

      // Crear elemento temporal para renderizar
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.top = '-9999px';
      tempElement.style.width = '800px';
      tempElement.style.backgroundColor = 'white';
      tempElement.style.padding = '20px';
      tempElement.style.fontFamily = 'Arial, sans-serif';
      
      // Generar HTML del reporte
      const reportHTML = this.generateReportHTML(data, options);
      tempElement.innerHTML = reportHTML;
      
      document.body.appendChild(tempElement);

      // Convertir a canvas
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Limpiar elemento temporal
      document.body.removeChild(tempElement);

      // Convertir a blob y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const filename = `reporte-asistencia-${data.report.date}.${format}`;
          saveAs(blob, filename);
          console.log('✅ Imagen exportada exitosamente');
        } else {
          throw new Error('Error generando imagen');
        }
      }, `image/${format}`);

    } catch (error) {
      console.error('❌ Error exportando imagen:', error);
      throw error;
    }
  }

  /**
   * Generar HTML para la imagen
   */
  private static generateReportHTML(data: ExportData, options: ExportOptions): string {
    const { creator = 'Sistema', approver = 'Pendiente' } = options;
    
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.4;">
        <h1 style="color: #2563eb; margin-bottom: 10px;">REPORTE DE ASISTENCIA</h1>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p><strong>Fecha:</strong> ${data.report.date}</p>
          <p><strong>Creado por:</strong> ${creator}</p>
          <p><strong>Autorizado por:</strong> ${approver}</p>
          <p><strong>Estado:</strong> ${data.report.status === 'approved' ? 'Aprobado' : 'Borrador'}</p>
          ${data.report.notes ? `<p><strong>Notas:</strong> ${data.report.notes}</p>` : ''}
        </div>

        ${data.stats ? `
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #059669; margin-top: 0;">RESUMEN GENERAL</h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            <p><strong>Total Empleados:</strong> ${data.employees.length}</p>
            <p><strong>Presentes:</strong> ${data.stats.presentCount || 0}</p>
            <p><strong>Ausentes:</strong> ${data.stats.absentCount || 0}</p>
            <p><strong>Tardes:</strong> ${data.stats.lateCount || 0}</p>
            <p><strong>Vacaciones:</strong> ${data.stats.vacationCount || 0}</p>
            <p><strong>Horas Totales:</strong> ${data.stats.totalHours || 0}h</p>
            <p><strong>Horas Extra:</strong> ${data.stats.overtimeHours || 0}h</p>
          </div>
        </div>
        ` : ''}

        <h3 style="color: #374151;">DETALLE DE EMPLEADOS</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Empleado</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Estado</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Horario</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Horas</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Extra</th>
            </tr>
          </thead>
          <tbody>
            ${data.employees.map(employee => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 8px;">
                  <strong>${employee.employeeName || `Empleado ${employee.employeeId.slice(0, 8)}`}</strong><br>
                  <small style="color: #6b7280;">${employee.employeeNumber || employee.employeeId.slice(0, 8)}</small>
                </td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">
                  <span style="background: ${this.getStatusColor(employee.status)}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
                    ${this.getStatusText(employee.status)}
                  </span>
                </td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">
                  ${employee.clockIn && employee.clockOut 
                    ? `${employee.clockIn}<br>${employee.clockOut}`
                    : '-'
                  }
                </td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${employee.totalHours ? `${employee.totalHours}h` : '-'}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${employee.overtimeHours ? `${employee.overtimeHours}h` : '0h'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Obtener texto del estado
   */
  private static getStatusText(status: string): string {
    switch (status) {
      case 'present': return 'Presente';
      case 'absent': return 'Ausente';
      case 'late': return 'Tarde';
      case 'vacation': return 'Vacaciones';
      case 'sick_leave': return 'Enfermedad';
      case 'personal_leave': return 'Permiso';
      case 'maternity_leave': return 'Maternidad';
      case 'paternity_leave': return 'Paternidad';
      default: return status;
    }
  }

  /**
   * Obtener color del estado
   */
  private static getStatusColor(status: string): string {
    switch (status) {
      case 'present': return '#10b981';
      case 'absent': return '#ef4444';
      case 'late': return '#f59e0b';
      case 'vacation': return '#3b82f6';
      case 'sick_leave': return '#8b5cf6';
      case 'personal_leave': return '#6b7280';
      case 'maternity_leave': return '#ec4899';
      case 'paternity_leave': return '#6366f1';
      default: return '#6b7280';
    }
  }
}
