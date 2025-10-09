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
    const headers = ['No.', 'Material', 'Longitud (m)', 'Ancho (m)', 'Metros Lineales'];
    const rows = platform.pieces.map(piece => [
      piece.number,
      `"${piece.material}"`,
      formatNumber(piece.length, 2),
      formatNumber(piece.standardWidth, 2),
      formatNumber(piece.linearMeters, 3)
    ]);
    
    const totalsRow = [
      'TOTAL',
      '—',
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
    try {
      const csv = this.toCSV(platform);
      const BOM = '\uFEFF'; // Byte Order Mark para Excel
      const filename = `Plataforma_${platform.platformNumber}_${new Date().toISOString().split('T')[0]}.csv`;
      
      // Crear blob y descargar
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      throw new Error('Error al exportar a Excel: ' + error);
    }
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
            padding: 15px;
            background: white;
            font-size: 11px;
            line-height: 1.3;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 1px solid #333;
            padding-bottom: 10px;
          }
          .header h1 {
            font-size: 18px;
            color: #333;
            margin-bottom: 5px;
          }
          .info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px;
            margin-bottom: 15px;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 6px;
          }
          .info-item {
            display: flex;
            gap: 5px;
          }
          .info-label {
            font-weight: bold;
            color: #555;
            font-size: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          th {
            background: #4F46E5;
            color: white;
            padding: 6px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 10px;
          }
          td {
            padding: 4px 6px;
            border-bottom: 1px solid #ddd;
            font-size: 10px;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          .totals {
            background: #4F46E5 !important;
            color: white !important;
            font-weight: bold;
            font-size: 12px;
          }
          .totals td {
            padding: 6px 8px;
            border: none;
          }
          .footer {
            margin-top: 15px;
            text-align: center;
            color: #666;
            font-size: 10px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          @media print {
            body { padding: 10px; }
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
    try {
      const html = this.generatePrintHTML(platform);
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        throw new Error('No se pudo abrir la ventana de impresión. Verifica los permisos del navegador.');
      }
      
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Esperar a que se cargue el contenido
      return new Promise((resolve, reject) => {
        printWindow.onload = () => {
          setTimeout(() => {
            try {
              printWindow.focus();
              printWindow.print();
              setTimeout(() => {
                printWindow.close();
                resolve();
              }, 1000);
            } catch (printError) {
              reject(new Error('Error al imprimir: ' + printError));
            }
          }, 250);
        };
        
        printWindow.onerror = () => {
          reject(new Error('Error al cargar el contenido para impresión'));
        };
        
        // Timeout de seguridad
        setTimeout(() => {
          reject(new Error('Timeout: No se pudo cargar el contenido para impresión'));
        }, 5000);
      });
    } catch (error) {
      throw new Error('Error al generar PDF: ' + error);
    }
  }

  /**
   * Convierte tabla a imagen usando canvas (SIN DEPENDENCIAS EXTERNAS)
   */
  static async exportToImage(platform: Platform): Promise<void> {
    // Crear un canvas para dibujar la tabla
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No se pudo crear el contexto del canvas');
    }

    // Configurar dimensiones del canvas
    const cellHeight = 40;
    const cellWidth = 120;
    const headerHeight = 50;
    const padding = 20;
    const titleHeight = 60;
    
    const tableWidth = 4 * cellWidth + padding * 2;
    const tableHeight = headerHeight + (platform.pieces.length + 2) * cellHeight + padding * 2;
    const totalHeight = titleHeight + tableHeight + 200; // Espacio para resumen
    
    canvas.width = tableWidth;
    canvas.height = totalHeight;

    // Configurar estilos
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Plataforma ${platform.platformNumber}`, canvas.width / 2, 30);

    // Información de la plataforma
    ctx.font = '14px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`${platform.materialType} • ${platform.pieces.length} piezas`, canvas.width / 2, 55);

    let yOffset = titleHeight;

    // Dibujar tabla
    this.drawTableOnCanvas(ctx, platform, padding, yOffset, cellWidth, cellHeight, headerHeight);

    // Dibujar resumen
    yOffset += headerHeight + (platform.pieces.length + 1) * cellHeight + 20;
    this.drawSummaryOnCanvas(ctx, platform, padding, yOffset, cellWidth);

    // Descargar imagen
    const filename = `Plataforma_${platform.platformNumber}_${new Date().toISOString().split('T')[0]}.png`;
    
    return new Promise<void>((resolve, reject) => {
      canvas.toBlob((blob) => {
        try {
          if (!blob) {
            reject(new Error('No se pudo generar la imagen'));
            return;
          }
          
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Limpiar URL después de un tiempo
          setTimeout(() => URL.revokeObjectURL(url), 100);
          resolve();
        } catch (error) {
          reject(new Error('Error al descargar imagen: ' + error));
        }
      }, 'image/png');
    });
  }

  /**
   * Dibuja la tabla en el canvas
   */
  private static drawTableOnCanvas(
    ctx: CanvasRenderingContext2D, 
    platform: Platform, 
    x: number, 
    y: number, 
    cellWidth: number, 
    cellHeight: number, 
    headerHeight: number
  ): void {
    const headers = ['No.', 'Longitud (m)', 'Ancho (m)', 'Metros Lineales'];
    
    // Dibujar encabezados
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(x, y, cellWidth * 4, headerHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    
    headers.forEach((header, index) => {
      const cellX = x + index * cellWidth;
      ctx.fillText(header, cellX + cellWidth / 2, y + headerHeight / 2 + 5);
    });

    // Dibujar filas de datos
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    platform.pieces.forEach((piece, index) => {
      const rowY = y + headerHeight + index * cellHeight;
      const isEven = index % 2 === 0;
      
      // Fondo alternado
      ctx.fillStyle = isEven ? '#f9fafb' : '#ffffff';
      ctx.fillRect(x, rowY, cellWidth * 4, cellHeight);
      
      // Borde
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, rowY, cellWidth * 4, cellHeight);
      
      // Datos
      ctx.fillStyle = '#1f2937';
      const data = [
        piece.number.toString(),
        formatNumber(piece.length, 2),
        formatNumber(piece.standardWidth, 2),
        formatNumber(piece.linearMeters, 3)
      ];
      
      data.forEach((value, colIndex) => {
        const cellX = x + colIndex * cellWidth;
        ctx.fillText(value, cellX + cellWidth / 2, rowY + cellHeight / 2 + 4);
      });
    });

    // Dibujar fila de totales
    const totalY = y + headerHeight + platform.pieces.length * cellHeight;
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(x, totalY, cellWidth * 4, cellHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    const totals = [
      'TOTAL',
      formatNumber(platform.totalLength, 2),
      formatNumber(platform.standardWidth, 2),
      formatNumber(platform.totalLinearMeters, 3)
    ];
    
    totals.forEach((value, index) => {
      const cellX = x + index * cellWidth;
      ctx.fillText(value, cellX + cellWidth / 2, totalY + cellHeight / 2 + 4);
    });
  }

  /**
   * Dibuja el resumen en el canvas
   */
  private static drawSummaryOnCanvas(
    ctx: CanvasRenderingContext2D, 
    platform: Platform, 
    x: number, 
    y: number, 
    cellWidth: number
  ): void {
    const summaryItems = [
      { label: 'Total Piezas', value: platform.pieces.length.toString(), color: '#3b82f6' },
      { label: 'Longitud Total', value: `${formatNumber(platform.totalLength, 2)} m`, color: '#8b5cf6' },
      { label: 'Metros Lineales', value: formatNumber(platform.totalLinearMeters, 3), color: '#10b981' },
      { label: 'Metros Totales de la Carga', value: `${formatNumber(platform.totalLinearMeters, 2)} m²`, color: '#f97316' }
    ];

    summaryItems.forEach((item, index) => {
      const boxX = x + index * (cellWidth + 10);
      const boxY = y;
      const boxWidth = cellWidth;
      const boxHeight = 60;

      // Fondo del recuadro
      ctx.fillStyle = `${item.color}20`; // Color con transparencia
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

      // Borde del recuadro
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      // Texto del label
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, boxX + boxWidth / 2, boxY + 15);

      // Valor
      ctx.fillStyle = item.color;
      ctx.font = 'bold 18px Arial';
      ctx.fillText(item.value, boxX + boxWidth / 2, boxY + 40);
    });

    // Ancho estándar
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Ancho estándar: ${formatNumber(platform.standardWidth, 2)} m`, x, y + 80);
  }

  /**
   * Comparte usando Web Share API con múltiples formatos
   */
  static async share(platform: Platform, format: 'text' | 'image' | 'pdf' | 'excel'): Promise<void> {
    const shareData: any = {
      title: `Plataforma ${platform.platformNumber}`,
      text: this.generateShareText(platform)
    };

    // Generar archivo según el formato
    if (format === 'image') {
      const canvas = await this.generateShareCanvas(platform);
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      shareData.files = [new File([blob], `Plataforma_${platform.platformNumber}.png`, { type: 'image/png' })];
    } else if (format === 'pdf') {
      const html = this.generatePrintHTML(platform);
      const blob = new Blob([html], { type: 'text/html' });
      shareData.files = [new File([blob], `Plataforma_${platform.platformNumber}.html`, { type: 'text/html' })];
    } else if (format === 'excel') {
      const csv = this.toCSV(platform);
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csv], { type: 'text/csv' });
      shareData.files = [new File([blob], `Plataforma_${platform.platformNumber}.csv`, { type: 'text/csv' })];
    }

    // Verificar si el navegador soporta Web Share API
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          // Fallback: descargar archivo
          await this.fallbackDownload(platform, format);
        }
      }
    } else {
      // Fallback: descargar archivo
      await this.fallbackDownload(platform, format);
    }
  }

  /**
   * Genera texto para compartir
   */
  private static generateShareText(platform: Platform): string {
    return `📊 Cuantificación de Metros Lineales
🏭 Plataforma: ${platform.platformNumber}
📦 Materiales: ${platform.materialTypes.join(', ')}
🚛 Proveedor: ${platform.provider}
👤 Chofer: ${platform.driver}
📅 Fecha: ${new Date(platform.receptionDate).toLocaleDateString('es-MX')}
📏 Total Piezas: ${platform.pieces.length}
📐 Longitud Total: ${formatNumber(platform.totalLength, 2)} m
📊 Metros Lineales: ${formatNumber(platform.totalLinearMeters, 3)} m
🚛 METROS TOTALES DE LA CARGA: ${formatNumber(platform.totalLinearMeters, 2)} m²
📏 Ancho Estándar: ${formatNumber(platform.standardWidth, 2)} m

Detalle por pieza:
${platform.pieces.map(p => `• Pieza ${p.number}: ${p.material} - ${formatNumber(p.length, 2)}m → ${formatNumber(p.linearMeters, 3)} m²`).join('\n')}

Generado por Sistema de Inventario`;
  }

  /**
   * Genera canvas para compartir
   */
  private static async generateShareCanvas(platform: Platform): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No se pudo crear el contexto del canvas');
    }

    // Configurar dimensiones del canvas (más pequeño para compartir)
    const cellHeight = 30;
    const cellWidth = 100;
    const headerHeight = 40;
    const padding = 15;
    const titleHeight = 50;
    
    const tableWidth = 4 * cellWidth + padding * 2;
    const tableHeight = headerHeight + (platform.pieces.length + 2) * cellHeight + padding * 2;
    const totalHeight = titleHeight + tableHeight + 150;
    
    canvas.width = tableWidth;
    canvas.height = totalHeight;

    // Configurar estilos
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Plataforma ${platform.platformNumber}`, canvas.width / 2, 25);

    // Información de la plataforma
    ctx.font = '12px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`${platform.materialType} • ${platform.pieces.length} piezas`, canvas.width / 2, 45);

    let yOffset = titleHeight;

    // Dibujar tabla
    this.drawTableOnCanvas(ctx, platform, padding, yOffset, cellWidth, cellHeight, headerHeight);

    // Dibujar resumen
    yOffset += headerHeight + (platform.pieces.length + 1) * cellHeight + 15;
    this.drawSummaryOnCanvas(ctx, platform, padding, yOffset, cellWidth);

    return canvas;
  }

  /**
   * Fallback para descargar archivo cuando no se puede compartir
   */
  private static async fallbackDownload(platform: Platform, format: string): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (format) {
      case 'image':
        await this.exportToImage(platform);
        break;
      case 'pdf':
        await this.printToPDF(platform);
        break;
      case 'excel':
        await this.exportToExcel(platform);
        break;
      case 'text':
        const text = this.generateShareText(platform);
        const filename = `Plataforma_${platform.platformNumber}_${timestamp}.txt`;
        this.downloadFile(text, filename, 'text/plain;charset=utf-8');
        break;
    }
  }
}

