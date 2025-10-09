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
   * Exporta a PDF completamente offline usando APIs nativas del navegador
   */
  static exportToPDF(platform: Platform): void {
    try {
      console.log('📄 Generando PDF offline...');
      
      // Generar contenido HTML optimizado para impresión
      const printContent = this.generatePrintContent(platform);
      
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
        this.downloadFile(printContent, `Reporte_Inventario_${platform.platformNumber}_${this.getDateString()}.html`, 'text/html');
      };
      
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      this.showError('Error al exportar a PDF');
    }
  }

  /**
   * Exporta como imagen usando canvas completamente offline
   */
  static exportToImage(platform: Platform): void {
    try {
      console.log('🖼️ Generando imagen offline...');
      
      // Verificar si hay materiales especificados
      const hasMaterials = platform.pieces.some(piece => piece.material && piece.material !== 'Sin especificar');
      
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
      ctx.fillText(`PLATAFORMA ${platform.platformNumber}`, canvas.width / 2, 45);
      
      // Subtítulo
      ctx.font = '18px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('Reporte de Inventario', canvas.width / 2, 75);
      
      // Información de la plataforma
      let y = 160;
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillStyle = '#2d3748';
      ctx.textAlign = 'left';
      
      // Información condicional según el tipo
      const entityName = platform.platformType === 'client' 
        ? `Cliente: ${platform.client || 'No especificado'}`
        : `Proveedor: ${platform.provider || 'No especificado'}`;
      
      ctx.fillText(entityName, 50, y);
      y += 25;
      
      // Información de materiales solo si es proveedor
      if (platform.platformType === 'provider' && platform.materialTypes.length > 0) {
        ctx.fillText(`Materiales: ${platform.materialTypes.join(', ')}`, 50, y);
        y += 25;
      }
      
      ctx.fillText(`Chofer: ${platform.driver || 'No especificado'}`, 50, y);
      y += 25;
      ctx.fillText(`Fecha: ${new Date(platform.receptionDate).toLocaleDateString('es-MX')}`, 50, y);
      y += 25;
      ctx.fillText(`Ancho Estándar: ${platform.standardWidth.toFixed(2)} m`, 50, y);
      y += 25;
      ctx.fillText(`Total Líneas: ${platform.pieces.length}`, 50, y);
      
      // Tabla
      y += 40;
      const rowHeight = 35;
      const cellPadding = 10;
      
      // Calcular posiciones de columnas
      const colNo = 50;
      const colMaterial = hasMaterials ? 120 : 0;
      const colLength = hasMaterials ? 350 : 200;
      const colWidth = hasMaterials ? 500 : 350;
      const colLinear = hasMaterials ? 650 : 500;
      
      // Fondo de la tabla
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(40, y - 10, canvas.width - 80, (platform.pieces.length + 2) * rowHeight + 20);
      
      // Borde de la tabla
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, y - 10, canvas.width - 80, (platform.pieces.length + 2) * rowHeight + 20);
      
      // Encabezados con gradiente
      const headerGrad = ctx.createLinearGradient(0, 0, 0, rowHeight);
      headerGrad.addColorStop(0, '#4f46e5');
      headerGrad.addColorStop(1, '#7c3aed');
      ctx.fillStyle = headerGrad;
      ctx.fillRect(40, y - 10, canvas.width - 80, rowHeight);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('No.', colNo + cellPadding, y + 20);
      if (hasMaterials) {
        ctx.fillText('Material', colMaterial + cellPadding, y + 20);
      }
      ctx.fillText('Longitud (m)', colLength + cellPadding, y + 20);
      ctx.fillText('Ancho (m)', colWidth + cellPadding, y + 20);
      ctx.fillText('Metros Lineales', colLinear + cellPadding, y + 20);
      
      y += rowHeight;
      
      // Línea separadora
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, y - 10);
      ctx.lineTo(canvas.width - 40, y - 10);
      ctx.stroke();
      
      // Datos de las líneas
      ctx.fillStyle = '#374151';
      ctx.font = '14px Arial, sans-serif';
      
      platform.pieces.forEach((piece, index) => {
        // Fondo alternado para filas
        if (index % 2 === 0) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(40, y - 10, canvas.width - 80, rowHeight);
        }
        
        ctx.fillStyle = '#374151';
        ctx.fillText(piece.number.toString(), colNo + cellPadding, y + 20);
        if (hasMaterials) {
          ctx.fillText(piece.material, colMaterial + cellPadding, y + 20);
        }
        ctx.fillText(piece.length.toFixed(2), colLength + cellPadding, y + 20);
        ctx.fillText(piece.standardWidth.toFixed(2), colWidth + cellPadding, y + 20);
        ctx.fillText(piece.linearMeters.toFixed(3), colLinear + cellPadding, y + 20);
        
        y += rowHeight;
      });
      
      // Fila de totales con gradiente
      const totalGrad = ctx.createLinearGradient(0, 0, 0, rowHeight);
      totalGrad.addColorStop(0, '#059669');
      totalGrad.addColorStop(1, '#047857');
      ctx.fillStyle = totalGrad;
      ctx.fillRect(40, y - 10, canvas.width - 80, rowHeight);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText('TOTAL', colNo + cellPadding, y + 20);
      if (hasMaterials) {
        ctx.fillText('—', colMaterial + cellPadding, y + 20);
      }
      ctx.fillText(platform.totalLength.toFixed(2), colLength + cellPadding, y + 20);
      ctx.fillText(platform.standardWidth.toFixed(2), colWidth + cellPadding, y + 20);
      ctx.fillText(platform.totalLinearMeters.toFixed(3), colLinear + cellPadding, y + 20);
      
      // Resumen ejecutivo
      y += 60;
      ctx.fillStyle = '#2d3748';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RESUMEN EJECUTIVO', canvas.width / 2, y);
      
      y += 40;
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText(`Total Líneas: ${platform.pieces.length}`, canvas.width / 2, y);
      y += 30;
      ctx.fillText(`Longitud Total: ${platform.totalLength.toFixed(2)} m`, canvas.width / 2, y);
      y += 30;
      ctx.fillText(`Metros Totales de la Carga: ${platform.totalLinearMeters.toFixed(2)} m²`, canvas.width / 2, y);
      
      // Footer
      y += 50;
      ctx.fillStyle = '#718096';
      ctx.font = '12px Arial, sans-serif';
      ctx.fillText(`Documento generado el ${new Date().toLocaleString('es-MX')}`, canvas.width / 2, y);
      y += 20;
      ctx.fillText('Sistema de Inventario UTalk - Reporte Profesional', canvas.width / 2, y);
      
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
    
    // Verificar si hay materiales especificados
    const hasMaterials = platform.pieces.some(piece => piece.material && piece.material !== 'Sin especificar');
    
    // Encabezados condicionales
    const headers = hasMaterials 
      ? 'No.,Material,Longitud (m),Ancho (m),Metros Lineales'
      : 'No.,Longitud (m),Ancho (m),Metros Lineales';
    rows.push(headers);
    
    // Datos
    platform.pieces.forEach(piece => {
      const rowData = hasMaterials 
        ? [
            piece.number,
            `"${piece.material}"`,
            piece.length.toFixed(2),
            piece.standardWidth.toFixed(2),
            piece.linearMeters.toFixed(3)
          ]
        : [
            piece.number,
            piece.length.toFixed(2),
            piece.standardWidth.toFixed(2),
            piece.linearMeters.toFixed(3)
          ];
      rows.push(rowData.join(','));
    });
    
    // Totales
    rows.push('');
    const totalData = hasMaterials 
      ? [
          'TOTAL',
          '—',
          platform.totalLength.toFixed(2),
          platform.standardWidth.toFixed(2),
          platform.totalLinearMeters.toFixed(3)
        ]
      : [
          'TOTAL',
          platform.totalLength.toFixed(2),
          platform.standardWidth.toFixed(2),
          platform.totalLinearMeters.toFixed(3)
        ];
    rows.push(totalData.join(','));
    
    // Información adicional
    rows.push('');
    rows.push('INFORMACIÓN DE LA PLATAFORMA');
    rows.push(`Número de Plataforma,${platform.platformNumber}`);
    rows.push(`Tipo de Plataforma,${platform.platformType === 'client' ? 'Cliente' : 'Proveedor'}`);
    
    if (platform.platformType === 'client') {
      rows.push(`Cliente,${platform.client || 'No especificado'}`);
    } else {
      rows.push(`Proveedor,${platform.provider || 'No especificado'}`);
      if (platform.materialTypes.length > 0) {
        rows.push(`Materiales,${platform.materialTypes.join('; ')}`);
      }
    }
    
    rows.push(`Chofer,${platform.driver || 'No especificado'}`);
    rows.push(`Fecha de Recepción,${new Date(platform.receptionDate).toLocaleDateString('es-MX')}`);
    rows.push(`Total Líneas,${platform.pieces.length}`);
    rows.push(`Metros Totales de la Carga,${platform.totalLinearMeters.toFixed(2)} m²`);
    
    return rows.join('\n');
  }

  /**
   * Genera contenido para impresión/PDF
   */
  private static generatePrintContent(platform: Platform): string {
    // Verificar si hay materiales especificados
    const hasMaterials = platform.pieces.some(piece => piece.material && piece.material !== 'Sin especificar');
    
    // Información condicional según el tipo de plataforma
    const entityInfo = platform.platformType === 'client' 
      ? `<div class="info">Cliente: ${platform.client || 'No especificado'}</div>`
      : `<div class="info">Proveedor: ${platform.provider || 'No especificado'}</div>`;
    
    // Información de materiales solo si es proveedor
    const materialsInfo = platform.platformType === 'provider' && platform.materialTypes.length > 0
      ? `<div class="info">Materiales: ${platform.materialTypes.join(', ')}</div>`
      : '';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Plataforma ${platform.platformNumber}</title>
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
        /* Barra móvil con acciones */
        .mobile-toolbar { position: sticky; top: 0; z-index: 9999; display: none; gap: 8px; padding: 10px; background: #ffffffcc; backdrop-filter: blur(8px); border-bottom: 1px solid #e2e8f0; }
        .toolbar-btn { flex: 1; padding: 10px 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; color: #111827; font-weight: 600; font-size: 14px; }
        .toolbar-btn.primary { background: linear-gradient(135deg, var(--primary), var(--primary2)); color: #fff; border: none; }
        @media (max-width: 768px) { .mobile-toolbar { display: flex; } }
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
        .subtitle {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 300;
        }
        .info { 
            font-size: 12px; 
            margin: 4px 0; 
            font-weight: 500;
        }
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
        .info-item {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .info-label {
            font-weight: 600;
            color: #4a5568;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-value {
            font-size: 12px;
            color: #2d3748;
            font-weight: 500;
        }
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
        tr:nth-child(even) {
            background: #f8fafc;
        }
        tr:hover {
            background: #f1f5f9;
        }
        .total-row { 
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white; 
            font-weight: 700;
            font-size: 12px;
        }
        .total-row td {
            border: none;
            padding: 8px 6px;
        }
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
        .summary-label {
            font-weight: 600;
            color: #4a5568;
            font-size: 10px;
            margin-bottom: 2px;
        }
        .summary-value {
            font-size: 12px;
            color: #2d3748;
            font-weight: 700;
        }
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
            .no-print { display: none; }
            .mobile-toolbar { display: none !important; }
            .header { background: #4f46e5 !important; -webkit-print-color-adjust: exact; }
            .total-row { background: #059669 !important; -webkit-print-color-adjust: exact; }
            th { background: #4f46e5 !important; -webkit-print-color-adjust: exact; }
            .info-grid { margin: 10px 0; padding: 10px; }
            .summary { margin-top: 15px; padding: 10px; }
            .footer { margin-top: 15px; padding: 8px; }
        }
    </style>
    <!-- Sistema completamente offline - sin dependencias externas -->
</head>
<body>
    <div class="mobile-toolbar no-print">
      <button id="backBtn" class="toolbar-btn">Volver</button>
      <button id="printBtn" class="toolbar-btn primary">Imprimir</button>
      <button id="shareBtn" class="toolbar-btn">Compartir</button>
    </div>
    <div class="header">
        <div class="title">PLATAFORMA ${platform.platformNumber}</div>
        <div class="subtitle">Reporte de Inventario</div>
    </div>

    <div class="info-grid">
        ${entityInfo}
        ${materialsInfo}
        <div class="info-item">
            <div class="info-label">Chofer</div>
            <div class="info-value">${platform.driver || 'No especificado'}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Fecha de Recepción</div>
            <div class="info-value">${new Date(platform.receptionDate).toLocaleDateString('es-MX', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Ancho Estándar</div>
            <div class="info-value">${platform.standardWidth.toFixed(2)} m</div>
        </div>
        <div class="info-item">
            <div class="info-label">Total de Líneas</div>
            <div class="info-value">${platform.pieces.length}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                ${hasMaterials ? '<th>Material</th>' : ''}
                <th>Longitud (m)</th>
                <th>Ancho (m)</th>
                <th>Metros Lineales</th>
            </tr>
        </thead>
        <tbody>
            ${platform.pieces.map(piece => `
                <tr>
                    <td>${piece.number}</td>
                    ${hasMaterials ? `<td>${piece.material}</td>` : ''}
                    <td>${piece.length.toFixed(2)}</td>
                    <td>${piece.standardWidth.toFixed(2)}</td>
                    <td>${piece.linearMeters.toFixed(3)}</td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td>TOTAL</td>
                ${hasMaterials ? '<td>—</td>' : ''}
                <td>${platform.totalLength.toFixed(2)}</td>
                <td>${platform.standardWidth.toFixed(2)}</td>
                <td>${platform.totalLinearMeters.toFixed(3)}</td>
            </tr>
        </tbody>
    </table>

    <div class="summary">
        <h3>RESUMEN EJECUTIVO</h3>
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
        <p>Documento generado el ${new Date().toLocaleString('es-MX')}</p>
        <p>Sistema de Inventario UTalk - Reporte Profesional</p>
    </div>

    <script>
      (function(){
        const backBtn = document.getElementById('backBtn');
        const printBtn = document.getElementById('printBtn');
        const shareBtn = document.getElementById('shareBtn');
        if(backBtn){ backBtn.onclick = () => { window.close(); } }
        if(printBtn){ printBtn.onclick = () => { window.print(); } }
        if(shareBtn){
          shareBtn.onclick = async () => {
            try {
              // ✅ SISTEMA COMPLETAMENTE OFFLINE - Sin dependencias externas
              // Generar PDF/HTML para compartir
              const htmlContent = document.documentElement.outerHTML;
              const blob = new Blob([htmlContent], { type: 'text/html' });
              const file = new File([blob], 'Reporte_Plataforma_${platform.platformNumber}.html', { type: 'text/html' });
              
              if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                  files: [file],
                  title: 'Reporte de Inventario',
                  text: 'Reporte Plataforma ${platform.platformNumber}'
                });
              } else {
                // Fallback: descargar el archivo HTML
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; 
                a.download = 'Reporte_Plataforma_${platform.platformNumber}.html';
                document.body.appendChild(a); 
                a.click(); 
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }
            } catch (e) {
              console.error('Error compartiendo reporte:', e);
              alert('No se pudo compartir el reporte. Intenta descargarlo directamente.');
            }
          }
        }
      })();
    </script>
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
