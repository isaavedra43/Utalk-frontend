// ============================================================================
// SERVICIO DE EXPORTACIÓN DEL LADO DEL CLIENTE - ASISTENCIA
// ============================================================================

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { AttendanceDetailResponse, EmployeeAttendance } from '../types';

// Extender jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

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
        mobileOptimized = true
      } = options;

      // Crear PDF con orientación portrait para móvil
      const doc = new jsPDF('portrait', 'mm', 'a4');
      
      // Configuración de colores y estilos
      const primaryColor = [59, 130, 246]; // azul
      const secondaryColor = [249, 250, 251]; // gris claro
      const successColor = [34, 197, 94]; // verde
      const warningColor = [245, 158, 11]; // amarillo
      const dangerColor = [239, 68, 68]; // rojo
      
      // Header del reporte
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE ASISTENCIA', 14, 20);
      
      // Información del reporte
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${data.report.date}`, 14, 30);
      doc.text(`Creado por: ${creator}`, 14, 35);
      doc.text(`Autorizado por: ${approver}`, 14, 40);
      doc.text(`Estado: ${data.report.status === 'approved' ? 'Aprobado' : 'Borrador'}`, 14, 45);
      
      if (data.report.notes) {
        doc.text(`Notas: ${data.report.notes}`, 14, 50);
      }
      
      // Línea separadora
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(14, 55, 196, 55);
      
      // Estadísticas resumidas
      if (data.stats) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN GENERAL', 14, 65);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        const statsData = [
          ['Total Empleados', data.employees.length.toString()],
          ['Presentes', (data.stats.presentCount || 0).toString()],
          ['Ausentes', (data.stats.absentCount || 0).toString()],
          ['Tardes', (data.stats.lateCount || 0).toString()],
          ['Vacaciones', (data.stats.vacationCount || 0).toString()],
          ['Horas Totales', `${data.stats.totalHours || 0}h`],
          ['Horas Extra', `${data.stats.overtimeHours || 0}h`]
        ];
        
        // Crear tabla de estadísticas
        doc.autoTable({
          startY: 70,
          head: [['Métrica', 'Valor']],
          body: statsData,
          theme: 'grid',
          headStyles: {
            fillColor: primaryColor,
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: secondaryColor
          },
          margin: { top: 70, right: 14, bottom: 14, left: 14 },
          styles: {
            fontSize: 9,
            cellPadding: 3
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 30 }
          }
        });
      }
      
      // Preparar datos para la tabla principal
      const tableHeaders = ['Empleado', 'Estado', 'Horario', 'Horas', 'Extra'];
      const tableData = data.employees.map(employee => {
        const employeeName = employee.employeeName || `Empleado ${employee.employeeId.slice(0, 8)}`;
        const employeeNumber = employee.employeeNumber || employee.employeeId.slice(0, 8);
        const statusText = this.getStatusText(employee.status);
        const schedule = employee.clockIn && employee.clockOut 
          ? `${employee.clockIn}-${employee.clockOut}`
          : '-';
        const hours = employee.totalHours ? `${employee.totalHours}h` : '-';
        const overtime = employee.overtimeHours ? `${employee.overtimeHours}h` : '0h';
        
        return [
          `${employeeName}\n${employeeNumber}`,
          statusText,
          schedule,
          hours,
          overtime
        ];
      });
      
      // Configurar tabla principal
      const finalY = (doc as any).lastAutoTable?.finalY || 120;
      
      doc.autoTable({
        startY: finalY + 10,
        head: [tableHeaders],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: secondaryColor
        },
        margin: { top: finalY + 10, right: 14, bottom: 14, left: 14 },
        styles: {
          fontSize: mobileOptimized ? 7 : 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 45 }, // Empleado
          1: { cellWidth: 25 }, // Estado
          2: { cellWidth: 30 }, // Horario
          3: { cellWidth: 20 }, // Horas
          4: { cellWidth: 20 }  // Extra
        },
        didDrawCell: (data: any) => {
          // Colorear estados
          if (data.column.index === 1 && data.cell.text[0]) {
            const status = data.cell.text[0];
            let color = primaryColor;
            
            if (status === 'Presente') color = successColor;
            else if (status === 'Ausente') color = dangerColor;
            else if (status === 'Tarde') color = warningColor;
            else if (status === 'Vacaciones') color = primaryColor;
            
            doc.setFillColor(...color);
            doc.rect(data.cell.x + 1, data.cell.y + 1, data.cell.width - 2, data.cell.height - 2, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(mobileOptimized ? 6 : 7);
            doc.text(status, data.cell.x + 3, data.cell.y + 6);
            doc.setTextColor(0, 0, 0);
          }
        }
      });

      // Footer con información de generación
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Generado el ${new Date().toLocaleDateString('es-MX')} - Página ${i} de ${pageCount}`,
          14,
          290
        );
      }

      // Descargar PDF
      const filename = `reporte-asistencia-${data.report.date}.pdf`;
      doc.save(filename);
      
      console.log('✅ PDF exportado exitosamente');
    } catch (error) {
      console.error('❌ Error exportando PDF:', error);
      throw new Error('Error al exportar reporte como PDF');
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
      throw new Error('Error al exportar reporte como Excel');
    }
  }

  /**
   * Exportar reporte como imagen
   */
  static async exportToImage(data: ExportData, options: ExportOptions = {}): Promise<void> {
    try {
      console.log('🖼️ ExportService - Generando imagen...');
      
      const { format = 'png' } = options;
      const { creator = 'Sistema', approver = 'Pendiente' } = options;

      // Crear elemento temporal para renderizar
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.top = '-9999px';
      tempElement.style.width = '800px';
      tempElement.style.backgroundColor = 'white';
      tempElement.style.padding = '20px';
      tempElement.style.fontFamily = 'Arial, sans-serif';
      tempElement.style.fontSize = '14px';
      tempElement.style.lineHeight = '1.4';
      
      // Generar HTML del reporte
      const reportHTML = `
        <div style="font-family: Arial, sans-serif; line-height: 1.4;">
          <h1 style="color: #2563eb; margin-bottom: 10px; text-align: center;">REPORTE DE ASISTENCIA</h1>
          
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
      
      tempElement.innerHTML = reportHTML;
      document.body.appendChild(tempElement);

      // Usar html2canvas para generar imagen
      const { default: html2canvas } = await import('html2canvas');
      
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempElement.scrollHeight
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
      throw new Error('Error al exportar reporte como imagen');
    }
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
