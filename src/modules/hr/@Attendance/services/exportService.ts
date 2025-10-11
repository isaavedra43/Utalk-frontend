// ============================================================================
// SERVICIO DE EXPORTACIÓN SIMPLE Y CONFIABLE - ASISTENCIA
// ============================================================================

import { AttendanceDetailResponse, EmployeeAttendance } from '../types';

interface ExportOptions {
  creator?: string;
  approver?: string;
  mobileOptimized?: boolean;
  format?: 'png' | 'jpg';
}

interface ExportData {
  report: any;
  employees: EmployeeAttendance[];
  stats?: any;
}

export class ExportService {
  /**
   * Exportar reporte como PDF completamente offline usando APIs nativas del navegador
   */
  static async exportToPDF(data: ExportData, options: ExportOptions = {}): Promise<void> {
    try {
      console.log('📄 ExportService - Generando PDF offline...');
      
      // Generar contenido HTML optimizado para impresión
      const printContent = this.generatePrintContent(data, options);
      
      // Crear ventana de impresión
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        throw new Error('No se pudo abrir la ventana de impresión. Verifica los permisos del navegador.');
      }
      
      // Escribir contenido en la ventana
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Esperar a que se cargue y luego imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();
            
            // Cerrar ventana después de imprimir
            setTimeout(() => {
              printWindow.close();
            }, 1000);
            
            console.log('✅ PDF generado exitosamente');
          } catch (printError) {
            console.error('Error al imprimir:', printError);
            this.showError('Error al generar PDF. Intenta descargar el archivo HTML.');
          }
        }, 500);
      };
      
      // Fallback: Si falla la impresión, descargar como HTML
      printWindow.onerror = () => {
        console.log('🔄 Fallback: Descargando como archivo HTML...');
        this.downloadFile(printContent, `Reporte_Asistencia_${data.report.date}_${this.getDateString()}.html`, 'text/html');
      };
      
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      this.showError('Error al exportar a PDF');
    }
  }

  /**
   * Exportar reporte como Excel usando CSV (compatible con Excel)
   */
  static async exportToExcel(data: ExportData, options: ExportOptions = {}): Promise<void> {
    try {
      console.log('📊 ExportService - Generando Excel...');
      
      const csvContent = this.generateCSVContent(data, options);
      this.downloadFile(csvContent, `Reporte_Asistencia_${data.report.date}_${this.getDateString()}.csv`, 'text/csv');
      
      console.log('✅ Excel exportado exitosamente');
    } catch (error) {
      console.error('❌ Error exportando Excel:', error);
      this.showError('Error al exportar a Excel');
    }
  }

  /**
   * Exportar reporte como imagen usando canvas completamente offline
   */
  static async exportToImage(data: ExportData, options: ExportOptions = {}): Promise<void> {
    try {
      console.log('🖼️ ExportService - Generando imagen offline...');
      
      const { format = 'png' } = options;
      
      // Crear canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo crear contexto del canvas');
      }

      // Configurar canvas con mejor resolución
      canvas.width = 1000;
      canvas.height = 800;
      
      // Fondo con gradiente sutil
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#f8fafc');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Header con gradiente
      const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      headerGradient.addColorStop(0, '#667eea');
      headerGradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = headerGradient;
      ctx.fillRect(0, 0, canvas.width, 120);
      
      // Título principal
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('REPORTE DE ASISTENCIA', canvas.width / 2, 45);
      
      // Subtítulo
      ctx.font = '18px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(`Fecha: ${data.report.date}`, canvas.width / 2, 75);
      
      // Información del reporte
      let y = 160;
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillStyle = '#2d3748';
      ctx.textAlign = 'left';
      
      ctx.fillText(`Estado: ${data.report.status === 'approved' ? 'Aprobado' : 'Borrador'}`, 50, y);
      y += 25;
      ctx.fillText(`Total Empleados: ${data.employees.length}`, 50, y);
      y += 25;
      ctx.fillText(`Presentes: ${data.stats?.presentCount || 0}`, 50, y);
      y += 25;
      ctx.fillText(`Ausentes: ${data.stats?.absentCount || 0}`, 50, y);
      y += 25;
      ctx.fillText(`Horas Totales: ${data.stats?.totalHours || 0}h`, 50, y);
      
      // Tabla de empleados
      y += 40;
      const rowHeight = 35;
      const cellPadding = 10;
      
      // Calcular posiciones de columnas
      const colName = 50;
      const colStatus = 300;
      const colHours = 450;
      const colExtra = 600;
      
      // Fondo de la tabla
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(40, y - 10, canvas.width - 80, (Math.min(data.employees.length, 10) + 2) * rowHeight + 20);
      
      // Borde de la tabla
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, y - 10, canvas.width - 80, (Math.min(data.employees.length, 10) + 2) * rowHeight + 20);
      
      // Encabezados con gradiente
      const headerGrad = ctx.createLinearGradient(0, 0, 0, rowHeight);
      headerGrad.addColorStop(0, '#4f46e5');
      headerGrad.addColorStop(1, '#7c3aed');
      ctx.fillStyle = headerGrad;
      ctx.fillRect(40, y - 10, canvas.width - 80, rowHeight);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Empleado', colName + cellPadding, y + 20);
      ctx.fillText('Estado', colStatus + cellPadding, y + 20);
      ctx.fillText('Horas', colHours + cellPadding, y + 20);
      ctx.fillText('Extra', colExtra + cellPadding, y + 20);
      
      y += rowHeight;
      
      // Línea separadora
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, y - 10);
      ctx.lineTo(canvas.width - 40, y - 10);
      ctx.stroke();
      
      // Datos de los empleados (máximo 10 para que quepa)
      ctx.fillStyle = '#374151';
      ctx.font = '14px Arial, sans-serif';
      
      data.employees.slice(0, 10).forEach((employee, index) => {
        // Fondo alternado para filas
        if (index % 2 === 0) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(40, y - 10, canvas.width - 80, rowHeight);
        }
        
        ctx.fillStyle = '#374151';
        const employeeName = employee.employeeName || `Empleado ${employee.employeeId.slice(0, 8)}`;
        ctx.fillText(employeeName.length > 25 ? employeeName.substring(0, 22) + '...' : employeeName, colName + cellPadding, y + 20);
        ctx.fillText(this.getStatusText(employee.status), colStatus + cellPadding, y + 20);
        ctx.fillText(`${employee.totalHours || 0}h`, colHours + cellPadding, y + 20);
        ctx.fillText(`${employee.overtimeHours || 0}h`, colExtra + cellPadding, y + 20);
        
        y += rowHeight;
      });
      
      // Footer
      y += 50;
      ctx.fillStyle = '#718096';
      ctx.font = '12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Documento generado el ${new Date().toLocaleString('es-MX')}`, canvas.width / 2, y);
      y += 20;
      ctx.fillText('Sistema de Asistencia UTalk - Reporte Profesional', canvas.width / 2, y);
      
      // Convertir a blob y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Reporte_Asistencia_${data.report.date}_${this.getDateString()}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('❌ Error exportando imagen:', error);
      this.showError('Error al exportar como imagen');
    }
  }

  /**
   * Genera contenido CSV
   */
  private static generateCSVContent(data: ExportData, options: ExportOptions): string {
    const { creator = 'Sistema', approver = 'Pendiente' } = options;
    const rows: string[] = [];
    
    // Encabezados
    rows.push('REPORTE DE ASISTENCIA');
    rows.push('');
    rows.push('INFORMACIÓN DEL REPORTE');
    rows.push(`Fecha,${data.report.date}`);
    rows.push(`Estado,${data.report.status === 'approved' ? 'Aprobado' : 'Borrador'}`);
    rows.push(`Creado por,${creator}`);
    rows.push(`Autorizado por,${approver}`);
    if (data.report.notes) {
      rows.push(`Notas,"${data.report.notes}"`);
    }
    rows.push('');
    
    // Resumen general
    rows.push('RESUMEN GENERAL');
    rows.push(`Total Empleados,${data.employees.length}`);
    rows.push(`Presentes,${data.stats?.presentCount || 0}`);
    rows.push(`Ausentes,${data.stats?.absentCount || 0}`);
    rows.push(`Tardes,${data.stats?.lateCount || 0}`);
    rows.push(`Vacaciones,${data.stats?.vacationCount || 0}`);
    rows.push(`Horas Totales,${data.stats?.totalHours || 0}h`);
    rows.push(`Horas Extra,${data.stats?.overtimeHours || 0}h`);
    rows.push('');
    
    // Detalle de empleados
    rows.push('DETALLE DE EMPLEADOS');
    rows.push('Empleado,ID,Estado,Hora Entrada,Hora Salida,Horas Totales,Horas Extra,Notas');
    
    data.employees.forEach(employee => {
      rows.push([
        `"${employee.employeeName || `Empleado ${employee.employeeId.slice(0, 8)}`}"`,
        `"${employee.employeeNumber || employee.employeeId.slice(0, 8)}"`,
        this.getStatusText(employee.status),
        employee.clockIn || '-',
        employee.clockOut || '-',
        employee.totalHours || 0,
        employee.overtimeHours || 0,
        `"${employee.notes || ''}"`
      ].join(','));
    });
    
    return rows.join('\n');
  }

  /**
   * Genera contenido para impresión/PDF
   */
  private static generatePrintContent(data: ExportData, options: ExportOptions): string {
    const { creator = 'Sistema', approver = 'Pendiente' } = options;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reporte de Asistencia ${data.report.date}</title>
    <style>
        :root { --primary:#4f46e5; --primary2:#7c3aed; --success:#059669; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 15px; 
            background: #ffffff;
            color: #1a1a1a;
            line-height: 1.3;
            font-size: 12px;
        }
        .header { 
            text-align: center; 
            margin-bottom: 20px; 
            padding: 15px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .title { 
            font-size: 20px; 
            font-weight: 700; 
            margin-bottom: 8px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        .subtitle { font-size: 14px; opacity: 0.9; font-weight: 300; }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin: 15px 0;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .info-item { display: flex; flex-direction: column; gap: 2px; }
        .info-label { font-weight: 600; color: #4a5568; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-value { font-size: 12px; color: #2d3748; font-weight: 500; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        th { 
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white; 
            padding: 8px 6px; 
            text-align: left; 
            font-weight: 600;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td { 
            padding: 6px 6px; 
            border-bottom: 1px solid #e2e8f0; 
            font-size: 11px;
        }
        tr:nth-child(even) { background: #f8fafc; }
        .summary { 
            margin-top: 20px; 
            padding: 15px; 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 8px;
            border: 1px solid #cbd5e0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .summary h3 { 
            color: #2d3748; 
            margin-bottom: 10px; 
            font-size: 16px;
            font-weight: 700;
            text-align: center;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 8px;
        }
        .summary-item { 
            padding: 8px;
            background: white;
            border-radius: 6px;
            border-left: 3px solid #4f46e5;
            box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .summary-label { font-weight: 600; color: #4a5568; font-size: 10px; margin-bottom: 2px; }
        .summary-value { font-size: 12px; color: #2d3748; font-weight: 700; }
        .footer {
            margin-top: 20px;
            text-align: center;
            padding: 10px;
            color: #718096;
            font-size: 10px;
            border-top: 1px solid #e2e8f0;
        }
        @media print {
            body { margin: 0; padding: 10px; }
            .header { background: #4f46e5 !important; -webkit-print-color-adjust: exact; }
            th { background: #4f46e5 !important; -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">REPORTE DE ASISTENCIA</div>
        <div class="subtitle">${data.report.date}</div>
    </div>

    <div class="info-grid">
        <div class="info-item">
            <div class="info-label">Estado</div>
            <div class="info-value">${data.report.status === 'approved' ? 'Aprobado' : 'Borrador'}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Creado por</div>
            <div class="info-value">${creator}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Autorizado por</div>
            <div class="info-value">${approver}</div>
        </div>
        ${data.report.notes ? `
        <div class="info-item">
            <div class="info-label">Notas</div>
            <div class="info-value">${data.report.notes}</div>
        </div>
        ` : ''}
    </div>

    ${data.stats ? `
    <div class="summary">
        <h3>RESUMEN GENERAL</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Empleados</div>
                <div class="summary-value">${data.employees.length}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Presentes</div>
                <div class="summary-value">${data.stats.presentCount || 0}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Ausentes</div>
                <div class="summary-value">${data.stats.absentCount || 0}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Tardes</div>
                <div class="summary-value">${data.stats.lateCount || 0}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Horas Totales</div>
                <div class="summary-value">${data.stats.totalHours || 0}h</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Horas Extra</div>
                <div class="summary-value">${data.stats.overtimeHours || 0}h</div>
            </div>
        </div>
    </div>
    ` : ''}

    <table>
        <thead>
            <tr>
                <th>Empleado</th>
                <th>Estado</th>
                <th>Horario</th>
                <th>Horas</th>
                <th>Extra</th>
            </tr>
        </thead>
        <tbody>
            ${data.employees.map(employee => `
                <tr>
                    <td>
                        <strong>${employee.employeeName || `Empleado ${employee.employeeId.slice(0, 8)}`}</strong><br>
                        <small style="color: #6b7280;">${employee.employeeNumber || employee.employeeId.slice(0, 8)}</small>
                    </td>
                    <td>
                        <span style="background: ${this.getStatusColor(employee.status)}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
                            ${this.getStatusText(employee.status)}
                        </span>
                    </td>
                    <td>
                        ${employee.clockIn && employee.clockOut 
                            ? `${employee.clockIn}<br>${employee.clockOut}`
                            : '-'
                        }
                    </td>
                    <td>${employee.totalHours ? `${employee.totalHours}h` : '-'}</td>
                    <td>${employee.overtimeHours ? `${employee.overtimeHours}h` : '0h'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Documento generado el ${new Date().toLocaleString('es-MX')}</p>
        <p>Sistema de Asistencia UTalk - Reporte Profesional</p>
    </div>
</body>
</html>`;
  }

  /**
   * Descarga un archivo
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL después de un tiempo
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      throw error;
    }
  }

  /**
   * Obtiene string de fecha para nombres de archivo
   */
  private static getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Muestra error al usuario
   */
  private static showError(message: string): void {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #ef4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover después de 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
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
