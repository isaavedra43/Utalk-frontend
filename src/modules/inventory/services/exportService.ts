// Servicio para exportación de datos

import type { Platform } from '../types';
import { formatNumber } from '../utils/calculations';

/**
 * Servicio de exportación
 */
export class ExportService {
  /**
   * Exporta una plataforma a CSV
   */
  static toCSV(platform: Platform): string {
    const headers = ['No.', 'Longitud (m)', 'Ancho (m)', 'Metros Lineales'];
    const rows = platform.pieces.map(piece => [
      piece.number,
      formatNumber(piece.length, 2),
      formatNumber(piece.standardWidth, 2),
      formatNumber(piece.linearMeters, 3)
    ]);
    
    const totalsRow = [
      'TOTAL',
      formatNumber(platform.totalLength, 2),
      formatNumber(platform.standardWidth, 2),
      formatNumber(platform.totalLinearMeters, 3)
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      totalsRow.join(',')
    ].join('\n');
    
    return csvContent;
  }

  /**
   * Descarga un archivo
   */
  static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Exporta a Excel (CSV con BOM para Excel)
   */
  static async exportToExcel(platform: Platform): Promise<void> {
    const csv = this.toCSV(platform);
    const BOM = '\uFEFF'; // Byte Order Mark para Excel
    const filename = `Plataforma_${platform.platformNumber}_${new Date().toISOString().split('T')[0]}.csv`;
    
    this.downloadFile(BOM + csv, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Genera HTML para impresión/PDF
   */
  static generatePrintHTML(platform: Platform): string {
    const piecesRows = platform.pieces.map(piece => `
      <tr>
        <td>${piece.number}</td>
        <td>${formatNumber(piece.length, 2)}</td>
        <td>${formatNumber(piece.standardWidth, 2)}</td>
        <td>${formatNumber(piece.linearMeters, 3)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Plataforma ${platform.platformNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            color: #333;
            margin-bottom: 10px;
          }
          .info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 30px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 8px;
          }
          .info-item {
            display: flex;
            gap: 10px;
          }
          .info-label {
            font-weight: bold;
            color: #555;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #4F46E5;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          .totals {
            background: #4F46E5 !important;
            color: white !important;
            font-weight: bold;
            font-size: 16px;
          }
          .totals td {
            padding: 15px 12px;
            border: none;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { padding: 20px; }
            .header { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Cuantificación de Metros Lineales</h1>
          <p>Plataforma ${platform.platformNumber}</p>
        </div>
        
        <div class="info">
          <div class="info-item">
            <span class="info-label">Material:</span>
            <span>${platform.materialType}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Fecha:</span>
            <span>${new Date(platform.receptionDate).toLocaleDateString('es-MX', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Ancho Estándar:</span>
            <span>${formatNumber(platform.standardWidth, 2)} m</span>
          </div>
          <div class="info-item">
            <span class="info-label">Total Piezas:</span>
            <span>${platform.pieces.length}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Longitud (m)</th>
              <th>Ancho (m)</th>
              <th>Metros Lineales</th>
            </tr>
          </thead>
          <tbody>
            ${piecesRows}
            <tr class="totals">
              <td>TOTAL</td>
              <td>${formatNumber(platform.totalLength, 2)}</td>
              <td>${formatNumber(platform.standardWidth, 2)}</td>
              <td>${formatNumber(platform.totalLinearMeters, 3)}</td>
            </tr>
          </tbody>
        </table>

        ${platform.notes ? `
        <div class="info">
          <div class="info-item">
            <span class="info-label">Observaciones:</span>
            <span>${platform.notes}</span>
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <p>Documento generado el ${new Date().toLocaleString('es-MX')}</p>
          <p>Sistema de Inventario - Cuantificación de Metros Lineales</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Imprime una plataforma (o genera PDF si el navegador lo soporta)
   */
  static async printToPDF(platform: Platform): Promise<void> {
    const html = this.generatePrintHTML(platform);
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      throw new Error('No se pudo abrir la ventana de impresión. Verifica los permisos del navegador.');
    }
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Esperar a que se cargue antes de imprimir
    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }

  /**
   * Convierte tabla a imagen usando canvas
   */
  static async exportToImage(elementId: string, filename: string): Promise<void> {
    // Nota: Requiere html2canvas library - se implementará en el componente
    console.log('Exportar a imagen:', elementId, filename);
  }

  /**
   * Comparte usando Web Share API
   */
  static async share(platform: Platform): Promise<void> {
    if (!navigator.share) {
      throw new Error('Tu navegador no soporta la función de compartir');
    }

    const text = `Plataforma ${platform.platformNumber}
Material: ${platform.materialType}
Total Piezas: ${platform.pieces.length}
Metros Lineales: ${formatNumber(platform.totalLinearMeters, 3)} m
Fecha: ${new Date(platform.receptionDate).toLocaleDateString('es-MX')}`;

    try {
      await navigator.share({
        title: `Plataforma ${platform.platformNumber}`,
        text: text
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        throw error;
      }
    }
  }
}

