import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extender jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export interface ExportOptions {
  filename: string;
  title: string;
  headers: string[];
  data: any[][];
  columns?: any[];
  format: 'excel' | 'pdf' | 'csv';
}

export class ExportService {
  /**
   * Exporta datos a Excel
   */
  static async exportToExcel(options: ExportOptions): Promise<void> {
    try {
      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      
      // Preparar datos para Excel
      const excelData = [options.headers, ...options.data];
      
      // Crear hoja de trabajo
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Configurar ancho de columnas
      const colWidths = options.headers.map(() => ({ wch: 15 }));
      ws['!cols'] = colWidths;
      
      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Datos');
      
      // Descargar archivo
      XLSX.writeFile(wb, `${options.filename}.xlsx`);
      
      console.log(`✅ Archivo Excel exportado: ${options.filename}.xlsx`);
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      throw new Error('Error al exportar a Excel');
    }
  }

  /**
   * Exporta datos a PDF
   */
  static async exportToPDF(options: ExportOptions): Promise<void> {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Agregar título
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(options.title, 14, 15);
      
      // Agregar fecha de exportación
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Exportado el: ${new Date().toLocaleDateString('es-MX')}`, 14, 25);
      
      // Configurar tabla
      const tableConfig = {
        startY: 30,
        head: [options.headers],
        body: options.data,
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246], // azul
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251] // gris muy claro
        },
        margin: { top: 30, right: 14, bottom: 14, left: 14 },
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {}
      };

      // Configurar ancho de columnas
      const pageWidth = doc.internal.pageSize.width - 28; // margenes
      const columnWidth = pageWidth / options.headers.length;
      
      options.headers.forEach((_, index) => {
        tableConfig.columnStyles[index] = { cellWidth: columnWidth };
      });

      // Generar tabla
      doc.autoTable(tableConfig);

      // Descargar archivo
      doc.save(`${options.filename}.pdf`);
      
      console.log(`✅ Archivo PDF exportado: ${options.filename}.pdf`);
    } catch (error) {
      console.error('Error exportando a PDF:', error);
      throw new Error('Error al exportar a PDF');
    }
  }

  /**
   * Exporta datos a CSV
   */
  static async exportToCSV(options: ExportOptions): Promise<void> {
    try {
      // Preparar datos CSV
      const csvData = [options.headers, ...options.data];
      
      // Convertir a string CSV
      const csvContent = csvData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');
      
      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${options.filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      console.log(`✅ Archivo CSV exportado: ${options.filename}.csv`);
    } catch (error) {
      console.error('Error exportando a CSV:', error);
      throw new Error('Error al exportar a CSV');
    }
  }

  /**
   * Exporta datos según el formato especificado
   */
  static async export(options: ExportOptions): Promise<void> {
    switch (options.format) {
      case 'excel':
        return this.exportToExcel(options);
      case 'pdf':
        return this.exportToPDF(options);
      case 'csv':
        return this.exportToCSV(options);
      default:
        throw new Error('Formato de exportación no soportado');
    }
  }

  /**
   * Formatea fecha para exportación
   */
  static formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-MX');
  }

  /**
   * Formatea moneda para exportación
   */
  static formatCurrency(amount: number, currency: string = 'MXN'): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Formatea número para exportación
   */
  static formatNumber(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
  }

  /**
   * Limpia texto para exportación (remueve HTML y caracteres especiales)
   */
  static cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remover HTML tags
      .replace(/&nbsp;/g, ' ') // Reemplazar &nbsp;
      .replace(/&amp;/g, '&') // Reemplazar &amp;
      .replace(/&lt;/g, '<') // Reemplazar &lt;
      .replace(/&gt;/g, '>') // Reemplazar &gt;
      .trim();
  }
}

export default ExportService;
