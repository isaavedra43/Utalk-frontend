import type { Platform } from '../types';
import { hasMaterialsSpecified } from '../utils/calculations';

/**
 * Servicio de exportación PDF - VERSIÓN ALTERNATIVA
 * Diseño de 3 columnas + ocultar columna de materiales
 */
export class PdfExportService {
  
  private static readonly VERSION = '2.0.0-ALT';
  
  static {
    console.log(`🚀 PdfExportService v${this.VERSION} inicializado - ${new Date().toLocaleString()}`);
  }
  
  /**
   * Exporta a PDF con diseño de 3 columnas
   */
  static exportToPDF(platform: Platform): void {
    try {
      console.log(`📄 PdfExportService v${this.VERSION} - Generando PDF...`);
      
      const htmlContent = this.generateHTML(platform);
      
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      
      if (!printWindow) {
        throw new Error('No se pudo abrir la ventana de impresión');
      }
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          setTimeout(() => printWindow.close(), 1000);
        }, 500);
      };
      
    } catch (error) {
      console.error('Error generando PDF:', error);
    }
  }
  
  /**
   * Genera HTML con diseño de 3 columnas
   */
  private static generateHTML(platform: Platform): string {
    const hasMaterials = hasMaterialsSpecified(platform.pieces);
    console.log('📊 Has materials specified:', hasMaterials);
    
    // Dividir en 3 columnas
    const totalPieces = platform.pieces.length;
    const piecesPerColumn = Math.ceil(totalPieces / 3);
    
    const column1 = platform.pieces.slice(0, piecesPerColumn);
    const column2 = platform.pieces.slice(piecesPerColumn, piecesPerColumn * 2);
    const column3 = platform.pieces.slice(piecesPerColumn * 2);
    
    console.log(`📋 Distribución: Total=${totalPieces}, Col1=${column1.length}, Col2=${column2.length}, Col3=${column3.length}`);
    
    const timestamp = Date.now();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reporte de Carga ${platform.platformNumber}</title>
    <!-- PdfExportService v${this.VERSION} - ${timestamp} -->
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            font-size: 11px; 
            line-height: 1.3; 
            color: #333; 
            padding: 8px; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 15px; 
            padding: 12px; 
            background: #4f46e5; 
            color: white; 
            border-radius: 6px; 
        }
        .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .subtitle { font-size: 14px; opacity: 0.9; }
        .version-info { font-size: 10px; opacity: 0.7; margin-top: 5px; }
        
        .info-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
            gap: 8px; 
            margin: 10px 0; 
            padding: 10px; 
            background: #f8fafc; 
            border-radius: 6px; 
        }
        .info-item { display: flex; flex-direction: column; gap: 2px; }
        .info-label { font-weight: bold; color: #4a5568; font-size: 9px; }
        .info-value { font-size: 10px; color: #2d3748; }
        
        /* DISEÑO DE 3 COLUMNAS */
        .table-container { 
            display: flex; 
            gap: 6px; 
            margin: 10px 0; 
            width: 100%; 
            align-items: flex-start; 
        }
        .table-column { 
            flex: 1; 
            min-width: 0; 
            border: 1px solid #e2e8f0; 
            border-radius: 4px; 
            overflow: hidden; 
            background: white;
        }
        .column-header {
            text-align: center; 
            margin-bottom: 4px; 
            font-weight: bold; 
            font-size: 9px; 
            color: #4f46e5; 
            background: #f0f4ff; 
            padding: 4px;
            border-bottom: 1px solid #e2e8f0;
        }
        .empty-column {
            text-align: center; 
            padding: 20px; 
            color: #9ca3af; 
            font-size: 8px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            background: white; 
            font-size: 8px; 
        }
        th { 
            background: #4f46e5; 
            color: white; 
            padding: 4px 3px; 
            text-align: center; 
            font-weight: bold; 
            font-size: 8px; 
            border-right: 1px solid #3b82f6; 
        }
        th:last-child { border-right: none; }
        td { 
            padding: 3px 2px; 
            border-bottom: 1px solid #e2e8f0; 
            border-right: 1px solid #e2e8f0; 
            font-size: 7px; 
            line-height: 1.3; 
            text-align: center; 
        }
        td:last-child { border-right: none; }
        .number-cell { font-family: monospace; font-weight: bold; }
        .material-cell { text-align: left; padding-left: 4px; }
        .meters-cell { font-family: monospace; font-weight: bold; color: #059669; }
        tr:nth-child(even) { background: #f8fafc; }
        
        /* FILA DE TOTALES */
        .total-section {
            margin-top: 10px; 
            border: 2px solid #059669; 
            border-radius: 6px; 
            overflow: hidden;
        }
        .total-row { 
            background: #059669; 
            color: white; 
            font-weight: bold; 
            font-size: 9px; 
        }
        .total-row td { 
            border: none; 
            padding: 8px 4px; 
            text-align: center;
            font-family: monospace;
        }
        .total-label { font-size: 10px; }
        .total-value { font-size: 10px; background: #047857 !important; }
        
        .summary { 
            margin-top: 15px; 
            padding: 10px; 
            background: #f8fafc; 
            border-radius: 6px; 
        }
        .summary h3 { 
            color: #2d3748; 
            margin-bottom: 8px; 
            font-size: 12px; 
            text-align: center; 
        }
        .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); 
            gap: 6px; 
        }
        .summary-item { 
            padding: 6px; 
            background: white; 
            border-radius: 4px; 
            border-left: 3px solid #4f46e5; 
        }
        .summary-label { 
            font-weight: bold; 
            color: #4a5568; 
            font-size: 8px; 
            margin-bottom: 2px; 
        }
        .summary-value { 
            font-size: 10px; 
            color: #2d3748; 
            font-weight: bold; 
        }
        .footer { 
            margin-top: 15px; 
            text-align: center; 
            padding: 8px; 
            color: #718096; 
            font-size: 8px; 
            border-top: 1px solid #e2e8f0; 
        }
        
        @media print {
            body { margin: 0; padding: 6px; }
            .header { background: #4f46e5 !important; -webkit-print-color-adjust: exact; }
            .total-row { background: #059669 !important; -webkit-print-color-adjust: exact; }
            th { background: #4f46e5 !important; -webkit-print-color-adjust: exact; }
            .table-container { 
                page-break-inside: avoid; 
                display: flex !important; 
                gap: 4px !important; 
                margin: 8px 0 !important; 
            }
            .table-column { 
                flex: 1 !important; 
                page-break-inside: avoid; 
                border: 1px solid #ccc !important; 
            }
            table { 
                font-size: 7px !important; 
                page-break-inside: avoid; 
            }
            th { 
                padding: 2px 1px !important; 
                font-size: 7px !important; 
                background: #4f46e5 !important; 
                -webkit-print-color-adjust: exact; 
            }
            td { 
                padding: 1px 1px !important; 
                font-size: 6px !important; 
                line-height: 1.2 !important; 
            }
            .summary { 
                page-break-inside: avoid; 
                margin-top: 10px !important; 
            }
        }
    </style>
</head>
<body>
    <!-- PdfExportService v${this.VERSION} - DISEÑO 3 COLUMNAS -->
    <div class="header">
        <div class="title">REPORTE DE CARGA</div>
        <div class="subtitle">CUANTIFICACIÓN DE MATERIALES</div>
        <div class="version-info">
            PdfExportService v${this.VERSION} - Diseño 3 Columnas - ${new Date().toLocaleString()}
        </div>
    </div>

    <div class="info-grid">
        <div class="info-item">
            <div class="info-label">Número de Carga</div>
            <div class="info-value">${platform.platformNumber}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Tipo de Plataforma</div>
            <div class="info-value">${platform.platformType === 'client' ? 'Cliente' : 'Proveedor'}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Estado</div>
            <div class="info-value">${platform.status === 'in_progress' ? 'En Proceso' : platform.status === 'completed' ? 'Completada' : 'Exportada'}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Fecha de Recepción</div>
            <div class="info-value">${new Date(platform.receptionDate).toLocaleDateString('es-MX')}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Materiales</div>
            <div class="info-value">${platform.materialTypes.length > 0 ? platform.materialTypes.join(', ') : 'Sin especificar'}</div>
        </div>
        <div class="info-item">
            <div class="info-label">${platform.platformType === 'client' ? 'Cliente' : 'Proveedor'}</div>
            <div class="info-value">${platform.platformType === 'client' ? (platform.client || 'No especificado') : (platform.provider || 'No especificado')}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Chofer</div>
            <div class="info-value">${platform.driver || 'No especificado'}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Número de Ticket</div>
            <div class="info-value">${platform.ticketNumber || 'Sin número'}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Observaciones</div>
            <div class="info-value">${platform.notes || 'Sin observaciones'}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Creado por</div>
            <div class="info-value">${platform.createdBy || 'Sistema'}</div>
        </div>
    </div>

    <!-- DISEÑO DE 3 COLUMNAS -->
    <div class="table-container">
        ${this.generateColumn(column1, hasMaterials, `Parte 1 (${column1.length} registros)`)}
        ${this.generateColumn(column2, hasMaterials, `Parte 2 (${column2.length} registros)`)}
        ${this.generateColumn(column3, hasMaterials, `Parte 3 (${column3.length} registros)`)}
    </div>
    
    <!-- Fila de totales -->
    <div class="total-section">
        <table style="font-size: 9px; width: 100%;">
            <tbody>
                <tr class="total-row">
                    <td class="total-label" style="width: 15%;">TOTAL GENERAL</td>
                    ${hasMaterials ? '<td class="total-label" style="width: 25%;">—</td>' : ''}
                    <td class="total-label" style="width: 20%;">${platform.totalLength.toFixed(2)}</td>
                    <td class="total-label" style="width: 20%;">${platform.standardWidth.toFixed(2)}</td>
                    <td class="total-value" style="width: 20%;">${platform.totalLinearMeters.toFixed(3)}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="summary">
        <h3>RESUMEN</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Líneas</div>
                <div class="summary-value">${platform.pieces.length}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Longitud Total</div>
                <div class="summary-value">${platform.totalLength.toFixed(2)} m</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Ancho Estándar</div>
                <div class="summary-value">${platform.standardWidth.toFixed(2)} m</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Metros Lineales</div>
                <div class="summary-value">${platform.totalLinearMeters.toFixed(3)} m</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Metros Totales de la Carga</div>
                <div class="summary-value">${platform.totalLinearMeters.toFixed(2)} m²</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Fecha del reporte: ${new Date().toLocaleString('es-MX')}</p>
        <p>Reporte de Carga ${platform.platformNumber} | Página 1 de 1</p>
        <p>${new Date().toLocaleString('es-MX')}</p>
    </div>
</body>
</html>`;
  }
  
  /**
   * Genera una columna de la tabla
   */
  private static generateColumn(pieces: Platform['pieces'], hasMaterials: boolean, title: string): string {
    if (pieces.length === 0) {
      return `
        <div class="table-column">
          <div class="column-header">${title}</div>
          <div class="empty-column">Sin registros</div>
        </div>
      `;
    }
    
    return `
      <div class="table-column">
        <div class="column-header">${title}</div>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              ${hasMaterials ? '<th>Material</th>' : ''}
              <th>Long. (m)</th>
              <th>Ancho (m)</th>
              <th>Metros</th>
            </tr>
          </thead>
          <tbody>
            ${pieces.map(piece => `
              <tr>
                <td class="number-cell">${piece.number}</td>
                ${hasMaterials ? `<td class="material-cell">${piece.material || 'Sin especificar'}</td>` : ''}
                <td class="number-cell">${piece.length.toFixed(2)}</td>
                <td class="number-cell">${piece.standardWidth.toFixed(2)}</td>
                <td class="meters-cell">${piece.linearMeters.toFixed(3)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}
