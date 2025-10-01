import type { Platform } from '../types';

/**
 * Servicio de exportación simple y confiable
 * Siempre funciona sin dependencias complejas
 */
export class SimpleExportService {
  
  /**
   * Exporta a CSV (Excel compatible)
   */
  static exportToCSV(platform: Platform): void {
    try {
      const csvContent = this.generateCSVContent(platform);
      this.downloadFile(csvContent, `Plataforma_${platform.platformNumber}_${this.getDateString()}.csv`, 'text/csv');
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      this.showError('Error al exportar a CSV');
    }
  }

  /**
   * Exporta a PDF usando window.print
   */
  static exportToPDF(platform: Platform): void {
    try {
      const printContent = this.generatePrintContent(platform);
      
      // Crear ventana de impresión
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('No se pudo abrir ventana de impresión');
      }

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Imprimir después de cargar
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      };
      
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      this.showError('Error al exportar a PDF. Usa Ctrl+P para imprimir manualmente.');
    }
  }

  /**
   * Exporta como imagen usando canvas
   */
  static exportToImage(platform: Platform): void {
    try {
      // Crear canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo crear contexto del canvas');
      }

      // Configurar canvas
      canvas.width = 800;
      canvas.height = 600;
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Título
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Plataforma ${platform.platformNumber}`, canvas.width / 2, 40);
      
      // Información básica
      ctx.font = '16px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(`Materiales: ${platform.materialTypes.join(', ')}`, canvas.width / 2, 70);
      ctx.fillText(`Proveedor: ${platform.provider}`, canvas.width / 2, 95);
      ctx.fillText(`Chofer: ${platform.driver}`, canvas.width / 2, 120);
      ctx.fillText(`Fecha: ${new Date(platform.receptionDate).toLocaleDateString('es-MX')}`, canvas.width / 2, 145);
      
      // Tabla
      let y = 180;
      const rowHeight = 25;
      
      // Encabezados
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('No.', 50, y);
      ctx.fillText('Material', 100, y);
      ctx.fillText('Longitud', 250, y);
      ctx.fillText('Ancho', 350, y);
      ctx.fillText('Metros Lineales', 450, y);
      
      y += rowHeight;
      
      // Datos
      ctx.fillStyle = '#374151';
      ctx.font = '14px Arial';
      
      platform.pieces.forEach((piece, index) => {
        ctx.fillText(piece.number.toString(), 50, y);
        ctx.fillText(piece.material, 100, y);
        ctx.fillText(piece.length.toFixed(2), 250, y);
        ctx.fillText(piece.standardWidth.toFixed(2), 350, y);
        ctx.fillText(piece.linearMeters.toFixed(3), 450, y);
        y += rowHeight;
      });
      
      // Totales
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('TOTAL', 50, y);
      ctx.fillText('—', 100, y);
      ctx.fillText(platform.totalLength.toFixed(2), 250, y);
      ctx.fillText(platform.standardWidth.toFixed(2), 350, y);
      ctx.fillText(platform.totalLinearMeters.toFixed(3), 450, y);
      
      // Resumen
      y += 40;
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('RESUMEN', canvas.width / 2, y);
      
      y += 30;
      ctx.font = '14px Arial';
      ctx.fillText(`Total Piezas: ${platform.pieces.length}`, canvas.width / 2, y);
      y += 25;
      ctx.fillText(`Metros Totales de la Carga: ${platform.totalLinearMeters.toFixed(2)} m²`, canvas.width / 2, y);
      
      // Convertir a blob y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Plataforma_${platform.platformNumber}_${this.getDateString()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Error al exportar imagen:', error);
      this.showError('Error al exportar como imagen');
    }
  }

  /**
   * Genera contenido CSV
   */
  private static generateCSVContent(platform: Platform): string {
    const rows: string[] = [];
    
    // Encabezados
    rows.push('No.,Material,Longitud (m),Ancho (m),Metros Lineales');
    
    // Datos
    platform.pieces.forEach(piece => {
      rows.push([
        piece.number,
        `"${piece.material}"`,
        piece.length.toFixed(2),
        piece.standardWidth.toFixed(2),
        piece.linearMeters.toFixed(3)
      ].join(','));
    });
    
    // Totales
    rows.push('');
    rows.push([
      'TOTAL',
      '—',
      platform.totalLength.toFixed(2),
      platform.standardWidth.toFixed(2),
      platform.totalLinearMeters.toFixed(3)
    ].join(','));
    
    // Información adicional
    rows.push('');
    rows.push('INFORMACIÓN DE LA PLATAFORMA');
    rows.push(`Número de Plataforma,${platform.platformNumber}`);
    rows.push(`Materiales,${platform.materialTypes.join('; ')}`);
    rows.push(`Proveedor,${platform.provider}`);
    rows.push(`Chofer,${platform.driver}`);
    rows.push(`Fecha de Recepción,${new Date(platform.receptionDate).toLocaleDateString('es-MX')}`);
    rows.push(`Total Piezas,${platform.pieces.length}`);
    rows.push(`Metros Totales de la Carga,${platform.totalLinearMeters.toFixed(2)} m²`);
    
    return rows.join('\n');
  }

  /**
   * Genera contenido para impresión/PDF
   */
  private static generatePrintContent(platform: Platform): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Plataforma ${platform.platformNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: bold; color: #1f2937; }
        .info { font-size: 16px; color: #6b7280; margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        th { background-color: #3b82f6; color: white; font-weight: bold; }
        .total-row { background-color: #059669; color: white; font-weight: bold; }
        .summary { margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 8px; }
        .summary h3 { color: #1f2937; margin-bottom: 15px; }
        .summary-item { margin: 5px 0; }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">PLATAFORMA ${platform.platformNumber}</div>
        <div class="info">Materiales: ${platform.materialTypes.join(', ')}</div>
        <div class="info">Proveedor: ${platform.provider}</div>
        <div class="info">Chofer: ${platform.driver}</div>
        <div class="info">Fecha: ${new Date(platform.receptionDate).toLocaleDateString('es-MX')}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Material</th>
                <th>Longitud (m)</th>
                <th>Ancho (m)</th>
                <th>Metros Lineales</th>
            </tr>
        </thead>
        <tbody>
            ${platform.pieces.map(piece => `
                <tr>
                    <td>${piece.number}</td>
                    <td>${piece.material}</td>
                    <td>${piece.length.toFixed(2)}</td>
                    <td>${piece.standardWidth.toFixed(2)}</td>
                    <td>${piece.linearMeters.toFixed(3)}</td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td>TOTAL</td>
                <td>—</td>
                <td>${platform.totalLength.toFixed(2)}</td>
                <td>${platform.standardWidth.toFixed(2)}</td>
                <td>${platform.totalLinearMeters.toFixed(3)}</td>
            </tr>
        </tbody>
    </table>

    <div class="summary">
        <h3>RESUMEN</h3>
        <div class="summary-item"><strong>Total Piezas:</strong> ${platform.pieces.length}</div>
        <div class="summary-item"><strong>Longitud Total:</strong> ${platform.totalLength.toFixed(2)} m</div>
        <div class="summary-item"><strong>Ancho Estándar:</strong> ${platform.standardWidth.toFixed(2)} m</div>
        <div class="summary-item"><strong>Metros Lineales:</strong> ${platform.totalLinearMeters.toFixed(3)} m</div>
        <div class="summary-item"><strong>METROS TOTALES DE LA CARGA:</strong> ${platform.totalLinearMeters.toFixed(2)} m²</div>
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
}
