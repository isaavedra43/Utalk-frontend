// Servicio para impresión directa de PDF e imágenes

import { Platform } from '../types';

export class PrintService {
  /**
   * Imprime un PDF directamente - VERSIÓN CON NAVEGACIÓN MÓVIL
   */
  static async printPDF(platform: Platform): Promise<void> {
    try {
      console.log('🖨️ [PrintService] Iniciando impresión PDF...');

      // ✅ VALIDAR datos básicos
      if (!platform || !platform.platformNumber) {
        throw new Error('Datos de carga inválidos');
      }

      // ✅ Generar HTML con navegación móvil
      const htmlContent = this.generatePrintHTMLWithNavigation(platform);

      // ✅ Crear ventana de impresión
      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');

      if (!printWindow) {
        throw new Error('No se pudo abrir ventana de impresión. Habilita los popups en tu navegador.');
      }

      // ✅ Escribir contenido y cerrar documento
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // ✅ En dispositivos móviles, no imprimir automáticamente
      if (!this.isMobile()) {
        printWindow.focus();
        printWindow.print();
      }

      console.log('✅ [PrintService] Ventana de impresión abierta y comando enviado');

    } catch (error) {
      console.error('❌ [PrintService] Error:', error);
      throw error;
    }
  }

  /**
   * Imprime una imagen directamente - VERSIÓN CON NAVEGACIÓN MÓVIL
   */
  static async printImage(platform: Platform): Promise<void> {
    try {
      console.log('🖼️ [PrintService] Iniciando impresión imagen...');

      // ✅ VALIDAR datos básicos
      if (!platform || !platform.platformNumber) {
        throw new Error('Datos de carga inválidos');
      }

      // ✅ Generar la imagen
      const imageBlob = await this.generateImage(platform);

      if (!imageBlob || imageBlob.size === 0) {
        throw new Error('No se pudo generar la imagen');
      }

      // ✅ Crear URL del blob
      const imageUrl = URL.createObjectURL(imageBlob);

      // ✅ Crear ventana de impresión
      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');

      if (!printWindow) {
        URL.revokeObjectURL(imageUrl);
        throw new Error('No se pudo abrir ventana de impresión. Habilita los popups en tu navegador.');
      }

      // ✅ HTML con navegación móvil para imagen
      const htmlContent = this.generateImageHTMLWithNavigation(platform, imageUrl);

      // ✅ Escribir contenido
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // ✅ En dispositivos móviles, no imprimir automáticamente
      if (!this.isMobile()) {
        printWindow.focus();
        printWindow.print();
      }

      // ✅ Limpiar URL después de un tiempo
      setTimeout(() => {
        URL.revokeObjectURL(imageUrl);
      }, 10000);

      console.log('✅ [PrintService] Impresión de imagen enviada');

    } catch (error) {
      console.error('❌ [PrintService] Error al imprimir imagen:', error);
      throw error;
    }
  }

  /**
   * Genera un PDF de la carga
   */
  private static async generatePDF(platform: Platform): Promise<Blob> {
    try {
      console.log('📄 [generatePDF] Iniciando generación de PDF para:', platform.platformNumber);
      
      // ✅ VALIDAR datos de la plataforma
      if (!platform) {
        throw new Error('No se proporcionó información de la plataforma');
      }

      if (!platform.platformNumber) {
        throw new Error('La plataforma no tiene número de carga válido');
      }

      if (!platform.receptionDate) {
        console.warn('⚠️ La plataforma no tiene fecha de recepción');
      }
      
      // Crear contenido HTML para el PDF
      console.log('📄 [generatePDF] Generando contenido HTML...');
      const htmlContent = this.generatePDFContent(platform);
      console.log('📄 [generatePDF] Contenido HTML generado, longitud:', htmlContent.length);
      
      // Crear un iframe oculto para generar el PDF
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      iframe.style.width = '210mm'; // A4 width
      iframe.style.height = '297mm'; // A4 height
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);
      
      return new Promise((resolve, reject) => {
        console.log('📄 [generatePDF] Creando Promise para generación de PDF...');
        
        const timeout = setTimeout(() => {
          console.error('⏰ [generatePDF] Timeout generando PDF');
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          reject(new Error('Timeout generando PDF'));
        }, 5000);
        
        iframe.onload = () => {
          try {
            console.log('📄 [generatePDF] Iframe cargado, escribiendo contenido...');
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              iframeDoc.open();
              iframeDoc.write(htmlContent);
              iframeDoc.close();
              
              // Esperar a que se renderice
              setTimeout(() => {
                try {
                  console.log('📄 [generatePDF] Creando blob del HTML para impresión...');
                  // Crear un blob con el HTML para impresión
                  const blob = new Blob([htmlContent], { type: 'text/html' });
                  console.log('✅ [generatePDF] HTML generado exitosamente, tamaño:', blob.size);
                  clearTimeout(timeout);
                  if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                  }
                  resolve(blob);
                } catch (error) {
                  console.error('❌ [generatePDF] Error creando blob:', error);
                  clearTimeout(timeout);
                  if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                  }
                  reject(error);
                }
              }, 1000);
            } else {
              console.error('❌ [generatePDF] No se pudo acceder al documento del iframe');
              clearTimeout(timeout);
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
              reject(new Error('No se pudo acceder al documento del iframe'));
            }
          } catch (error) {
            console.error('❌ [generatePDF] Error en onload:', error);
            clearTimeout(timeout);
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            reject(error);
          }
        };
        
        iframe.onerror = (error) => {
          console.error('❌ [generatePDF] Error cargando iframe:', error);
          clearTimeout(timeout);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          reject(new Error('Error cargando iframe para PDF'));
        };
      });
    } catch (error) {
      console.error('❌ [generatePDF] Error general:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al generar PDF';
      throw new Error(`Error generando PDF: ${errorMessage}`);
    }
  }

  /**
   * Genera una imagen de la carga
   */
  private static async generateImage(platform: Platform): Promise<Blob> {
    try {
      console.log('🖼️ [generateImage] Iniciando generación de imagen para:', platform.platformNumber);
      
      // ✅ VALIDAR datos de la plataforma
      if (!platform) {
        throw new Error('No se proporcionó información de la plataforma');
      }

      if (!platform.platformNumber) {
        throw new Error('La plataforma no tiene número de carga válido');
      }

      if (!platform.receptionDate) {
        console.warn('⚠️ La plataforma no tiene fecha de recepción');
      }
      
      // Crear un canvas para generar la imagen
      console.log('🖼️ [generateImage] Creando canvas...');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo crear el contexto del canvas');
      }
      
      // Configurar el canvas
      canvas.width = 800;
      canvas.height = 1000;
      console.log('🖼️ [generateImage] Canvas configurado:', canvas.width, 'x', canvas.height);
      
      // Configurar el contexto
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Dibujar el contenido
      console.log('🖼️ [generateImage] Dibujando contenido...');
      this.drawImageContent(ctx, platform, canvas.width, canvas.height);
      
      // Convertir a blob
      console.log('🖼️ [generateImage] Convirtiendo a blob...');
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('✅ [generateImage] Imagen generada exitosamente, tamaño:', blob.size);
            resolve(blob);
          } else {
            console.error('❌ [generateImage] Error generando blob de imagen');
            reject(new Error('Error generando blob de imagen'));
          }
        }, 'image/png', 0.9);
      });
    } catch (error) {
      console.error('❌ [generateImage] Error general:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al generar imagen';
      throw new Error(`Error generando imagen: ${errorMessage}`);
    }
  }

  /**
   * Dibuja el contenido en el canvas - DISEÑO UNIFICADO CON PDF
   */
  private static drawImageContent(ctx: CanvasRenderingContext2D, platform: Platform, width: number, height: number): void {
    try {
      console.log('🖼️ [drawImageContent] Dibujando contenido para:', platform.platformNumber);
      
      // ✅ VALIDAR datos de la plataforma
      if (!platform) {
        throw new Error('Plataforma no proporcionada para dibujar imagen');
      }
      
      const cargaNumber = platform.platformNumber || 'Sin número';
      const provider = platform.provider || 'No especificado';
      const client = platform.client || 'No especificado';
      const driver = platform.driver || 'No especificado';
      const ticketNumber = platform.ticketNumber || 'No especificado';
      const notes = platform.notes || '';
      const pieces = platform.pieces || [];
      const totalLinearMeters = platform.totalLinearMeters || 0;
      const totalLength = platform.totalLength || 0;
      const standardWidth = platform.standardWidth || 0;
      
      const receptionDate = platform.receptionDate ? new Date(platform.receptionDate).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) : 'No especificada';
      
      const padding = 30;
      let y = padding;
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      // Header con gradiente simulado
      ctx.fillStyle = '#667eea';
      ctx.fillRect(0, 0, width, 80);
      
      // Título en el header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`PLATAFORMA ${cargaNumber}`, width / 2, 35);
      
      ctx.font = '12px Arial';
      ctx.fillText('Reporte de Inventario', width / 2, 55);
      
      y = 100;
      
      // Información general en formato similar al PDF
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(padding, y, width - (padding * 2), 60);
      
      ctx.fillStyle = '#374151';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      
      // Información en dos columnas
      const leftColumn = [
        `Cliente: ${client}`,
        `CHOFER: ${driver}`,
        `FECHA DE RECEPCIÓN: ${receptionDate}`
      ];
      
      const rightColumn = [
        `ANCHO ESTÁNDAR: ${standardWidth.toFixed(2)} m`,
        `TOTAL DE PIEZAS: ${pieces.length}`
      ];
      
      let infoY = y + 15;
      leftColumn.forEach((line, index) => {
        ctx.fillText(line, padding + 10, infoY);
        if (rightColumn[index]) {
          ctx.fillText(rightColumn[index], width / 2 + 10, infoY);
        }
        infoY += 15;
      });
      
      y += 80;
      
      // Tabla de piezas
      if (pieces.length > 0) {
        // Título de la tabla
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(padding, y, width - (padding * 2), 25);
        
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('DETALLE DE PIEZAS', padding + 10, y + 17);
        
        y += 35;
        
        // Encabezados de tabla
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(padding, y, width - (padding * 2), 25);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        
        const colWidth = (width - (padding * 2)) / 4;
        const headers = ['NO.', 'LONGITUD (M)', 'ANCHO (M)', 'METROS LINEALES'];
        
        headers.forEach((header, index) => {
          ctx.fillText(header, padding + (colWidth * index) + (colWidth / 2), y + 17);
        });
        
        y += 30;
        
        // Datos de las piezas
        ctx.fillStyle = '#374151';
        ctx.font = '10px Arial';
        
        pieces.forEach((piece, index) => {
          // Fondo alternado
          if (index % 2 === 0) {
            ctx.fillStyle = '#f9fafb';
            ctx.fillRect(padding, y - 5, width - (padding * 2), 20);
          }
          
          ctx.fillStyle = '#374151';
          const pieceNumber = piece.number || 'N/A';
          const pieceLength = piece.length ? piece.length.toFixed(2) : '0.00';
          const pieceLinearMeters = piece.linearMeters ? piece.linearMeters.toFixed(3) : '0.000';
          
          ctx.fillText(pieceNumber.toString(), padding + (colWidth * 0) + (colWidth / 2), y + 7);
          ctx.fillText(pieceLength, padding + (colWidth * 1) + (colWidth / 2), y + 7);
          ctx.fillText(standardWidth.toFixed(2), padding + (colWidth * 2) + (colWidth / 2), y + 7);
          ctx.fillText(pieceLinearMeters, padding + (colWidth * 3) + (colWidth / 2), y + 7);
          
          y += 20;
        });
        
        // Fila de totales
        ctx.fillStyle = '#dcfce7';
        ctx.fillRect(padding, y - 5, width - (padding * 2), 20);
        
        ctx.fillStyle = '#166534';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('TOTAL', padding + (colWidth * 0) + (colWidth / 2), y + 7);
        ctx.fillText(totalLength.toFixed(2), padding + (colWidth * 1) + (colWidth / 2), y + 7);
        ctx.fillText(standardWidth.toFixed(2), padding + (colWidth * 2) + (colWidth / 2), y + 7);
        ctx.fillText(totalLinearMeters.toFixed(3), padding + (colWidth * 3) + (colWidth / 2), y + 7);
        
        y += 40;
      }
      
      // Metros totales destacados
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(padding, y, width - (padding * 2), 35);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Metros Totales de la Carga', width / 2, y + 15);
      
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`${totalLinearMeters.toFixed(2)} m²`, width / 2, y + 30);
      
      y += 50;
      
      // Resumen ejecutivo
      ctx.fillStyle = '#10b981';
      ctx.fillRect(padding, y, width - (padding * 2), 80);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('RESUMEN EJECUTIVO', width / 2, y + 15);
      
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      
      const summaryItems = [
        `Total Piezas: ${pieces.length}`,
        `Longitud Total: ${totalLength.toFixed(2)} m`,
        `Ancho Estándar: ${standardWidth.toFixed(2)} m`,
        `Metros Lineales: ${totalLinearMeters.toFixed(3)} m`
      ];
      
      let summaryY = y + 25;
      summaryItems.forEach((item, index) => {
        const x = padding + 10 + ((index % 2) * ((width - (padding * 2)) / 2));
        if (index % 2 === 1) {
          summaryY += 15;
        }
        ctx.fillText(item, x, summaryY);
      });
      
      y += 100;
      
      // Notas si existen
      if (notes && notes.trim() !== '' && notes !== 'Sin notas') {
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(padding, y, width - (padding * 2), 40);
        
        ctx.fillStyle = '#92400e';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('OBSERVACIONES', padding + 10, y + 15);
        
        ctx.font = '10px Arial';
        ctx.fillStyle = '#78350f';
        
        // Dividir notas en líneas si son muy largas
        const maxWidth = width - (padding * 2) - 20;
        const words = notes.split(' ');
        let line = '';
        let noteY = y + 30;
        
        words.forEach((word) => {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line, padding + 10, noteY);
            line = word + ' ';
            noteY += 12;
          } else {
            line = testLine;
          }
        });
        
        if (line) {
          ctx.fillText(line, padding + 10, noteY);
        }
        
        y += 50;
      }
      
      // Footer
      ctx.fillStyle = '#6b7280';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Documento generado el ${new Date().toLocaleDateString('es-MX')}, ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`, width / 2, y + 10);
      ctx.fillText('Sistema de Inventario UTalk - Reporte Profesional', width / 2, y + 22);
      
    } catch (error) {
      console.error('❌ [drawImageContent] Error dibujando contenido:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al dibujar imagen';
      throw new Error(`Error dibujando contenido de imagen: ${errorMessage}`);
    }
  }

  /**
   * Genera el contenido HTML para el PDF - DISEÑO UNIFICADO Y OPTIMIZADO
   */
  private static generatePDFContent(platform: Platform): string {
    try {
      console.log('📄 [generatePDFContent] Generando contenido para:', platform.platformNumber);
      
      // ✅ VALIDAR que la plataforma tiene los datos necesarios
      if (!platform) {
        throw new Error('Plataforma no proporcionada');
      }
      
      if (!platform.platformNumber) {
        throw new Error('Número de carga no disponible');
      }
      
      const cargaNumber = platform.platformNumber || 'Sin número';
      const provider = platform.provider || 'No especificado';
      const client = platform.client || 'No especificado';
      const driver = platform.driver || 'No especificado';
      const ticketNumber = platform.ticketNumber || 'No especificado';
      const notes = platform.notes || '';
      const pieces = platform.pieces || [];
      const totalLinearMeters = platform.totalLinearMeters || 0;
      const totalLength = platform.totalLength || 0;
      const standardWidth = platform.standardWidth || 0;
      const materialTypes = platform.materialTypes || [];
      
      const receptionDate = platform.receptionDate ? new Date(platform.receptionDate).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) : 'No especificada';
      
      console.log('📄 [generatePDFContent] Datos validados:', {
        cargaNumber,
        provider,
        client,
        driver,
        piecesCount: pieces.length,
        totalLinearMeters,
        totalLength
      });
      
      return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Reporte de Inventario - ${cargaNumber}</title>
          <style>
            @media print {
              body { margin: 0; padding: 8mm; }
              .header { page-break-after: avoid; }
              .pieces-section { page-break-inside: avoid; }
              .summary-section { page-break-inside: avoid; }
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 12mm;
              color: #1a1a1a;
              line-height: 1.3;
              font-size: 11px;
              background: white;
            }
            
            /* Header con gradiente */
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 20px;
              border-radius: 8px;
              margin-bottom: 15px;
              text-align: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .header .title {
              font-size: 20px;
              font-weight: 700;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .header .subtitle {
              font-size: 12px;
              margin-top: 4px;
              opacity: 0.9;
            }
            
            /* Información general en grid compacto */
            .info-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
              background: #f8fafc;
              padding: 12px;
              border-radius: 6px;
              border-left: 4px solid #667eea;
            }
            
            .info-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 4px 0;
              font-size: 10px;
            }
            
            .info-label {
              font-weight: 600;
              color: #374151;
              flex: 1;
            }
            
            .info-value {
              color: #6b7280;
              font-weight: 500;
              text-align: right;
              flex: 1;
            }
            
            /* Tabla de piezas optimizada */
            .pieces-section {
              margin-bottom: 15px;
            }
            
            .pieces-title {
              font-size: 14px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 8px;
              padding: 8px 12px;
              background: #f1f5f9;
              border-radius: 4px;
              border-left: 4px solid #3b82f6;
            }
            
            .pieces-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
              font-size: 10px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .pieces-table th {
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
              color: white;
              padding: 8px 6px;
              text-align: center;
              font-weight: 600;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .pieces-table td {
              padding: 6px;
              text-align: center;
              border-bottom: 1px solid #e5e7eb;
              font-size: 10px;
            }
            
            .pieces-table tbody tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            .pieces-table tbody tr:hover {
              background-color: #f3f4f6;
            }
            
            /* Resumen destacado */
            .summary-section {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 12px;
              border-radius: 8px;
              margin-bottom: 10px;
              box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
            }
            
            .summary-title {
              font-size: 14px;
              font-weight: 700;
              margin-bottom: 8px;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .summary-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            
            .summary-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 4px 0;
              font-size: 10px;
            }
            
            .summary-label {
              font-weight: 500;
              opacity: 0.9;
            }
            
            .summary-value {
              font-weight: 700;
              font-size: 11px;
            }
            
            /* Metros totales destacados */
            .total-meters {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              padding: 10px;
              border-radius: 6px;
              text-align: center;
              margin-bottom: 10px;
              box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
            }
            
            .total-meters-label {
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 2px;
            }
            
            .total-meters-value {
              font-size: 16px;
              font-weight: 800;
            }
            
            /* Notas */
            .notes-section {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 8px;
              margin-top: 10px;
            }
            
            .notes-title {
              font-size: 10px;
              font-weight: 600;
              color: #92400e;
              margin-bottom: 4px;
              text-transform: uppercase;
            }
            
            .notes-content {
              font-size: 10px;
              color: #78350f;
              line-height: 1.4;
            }
            
            /* Footer */
            .footer {
              margin-top: 15px;
              text-align: center;
              font-size: 9px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              padding-top: 8px;
            }
            
            /* Responsive para impresión */
            @media print {
              body { 
                margin: 0; 
                padding: 8mm; 
                font-size: 10px;
              }
              .info-section { 
                grid-template-columns: 1fr; 
                gap: 8px;
              }
              .summary-grid {
                grid-template-columns: 1fr;
              }
              .pieces-table {
                font-size: 9px;
              }
              .pieces-table th,
              .pieces-table td {
                padding: 4px 3px;
              }
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header">
            <h1 class="title">PLATAFORMA ${platform.platformNumber}</h1>
            <div class="subtitle">Reporte de Inventario</div>
          </div>
          
          <!-- Información General -->
          <div class="info-section">
            <div class="info-item">
              <span class="info-label">Cliente:</span>
              <span class="info-value">${client}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ANCHO ESTÁNDAR</span>
              <span class="info-value">${standardWidth.toFixed(2)} m</span>
            </div>
            <div class="info-item">
              <span class="info-label">CHOFER</span>
              <span class="info-value">${driver}</span>
            </div>
            <div class="info-item">
              <span class="info-label">FECHA DE RECEPCIÓN</span>
              <span class="info-value">${receptionDate}</span>
            </div>
            <div class="info-item">
              <span class="info-label">TOTAL DE PIEZAS</span>
              <span class="info-value">${pieces.length}</span>
            </div>
          </div>
          
          <!-- Tabla de Piezas -->
          ${pieces.length > 0 ? `
            <div class="pieces-section">
              <div class="pieces-title">DETALLE DE PIEZAS</div>
              <table class="pieces-table">
                <thead>
                  <tr>
                    <th>NO.</th>
                    <th>LONGITUD (M)</th>
                    <th>ANCHO (M)</th>
                    <th>METROS LINEALES</th>
                  </tr>
                </thead>
                <tbody>
                  ${pieces.map(piece => `
                    <tr>
                      <td>${piece.number || 'N/A'}</td>
                      <td>${piece.length ? piece.length.toFixed(2) : '0.00'}</td>
                      <td>${standardWidth.toFixed(2)}</td>
                      <td>${piece.linearMeters ? piece.linearMeters.toFixed(3) : '0.000'}</td>
                    </tr>
                  `).join('')}
                  <tr style="background: #dcfce7; font-weight: 600; color: #166534;">
                    <td>TOTAL</td>
                    <td>${totalLength.toFixed(2)}</td>
                    <td>${standardWidth.toFixed(2)}</td>
                    <td>${totalLinearMeters.toFixed(3)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ` : ''}
          
          <!-- Metros Totales Destacados -->
          <div class="total-meters">
            <div class="total-meters-label">Metros Totales de la Carga</div>
            <div class="total-meters-value">${totalLinearMeters.toFixed(2)} m²</div>
          </div>
          
          <!-- Resumen Ejecutivo -->
          <div class="summary-section">
            <div class="summary-title">Resumen Ejecutivo</div>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Total Piezas</span>
                <span class="summary-value">${pieces.length}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Longitud Total</span>
                <span class="summary-value">${totalLength.toFixed(2)} m</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Ancho Estándar</span>
                <span class="summary-value">${standardWidth.toFixed(2)} m</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Metros Lineales</span>
                <span class="summary-value">${totalLinearMeters.toFixed(3)} m</span>
              </div>
            </div>
          </div>
          
          <!-- Notas -->
          ${notes && notes.trim() !== '' && notes !== 'Sin notas' ? `
            <div class="notes-section">
              <div class="notes-title">Observaciones</div>
              <div class="notes-content">${notes}</div>
            </div>
          ` : ''}
          
          <!-- Footer -->
          <div class="footer">
            <div>Documento generado el ${new Date().toLocaleDateString('es-MX')}, ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
            <div>Sistema de Inventario UTalk - Reporte Profesional</div>
          </div>
        </body>
      </html>
    `;
    } catch (error) {
      console.error('❌ [generatePDFContent] Error generando contenido:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al generar contenido PDF';
      throw new Error(`Error generando contenido PDF: ${errorMessage}`);
    }
  }

  /**
   * Fallback para dispositivos que bloquean popups
   */
  private static fallbackPrint(blob: Blob, mimeType: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `carga-${Date.now()}.${mimeType === 'application/pdf' ? 'pdf' : 'png'}`;
    link.click();
    
    // Mostrar mensaje al usuario
    alert('Se ha descargado el archivo. Por favor, ábrelo e imprímelo manualmente.');
    
    // Limpiar la URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  /**
   * Verifica si el dispositivo soporta impresión directa
   */
  static canPrint(): boolean {
    return typeof window.print === 'function';
  }

  /**
   * Verifica si es un dispositivo móvil
   */
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Genera HTML con navegación móvil para PDF
   */
  private static generatePrintHTMLWithNavigation(platform: Platform): string {
    const pdfContent = this.generatePDFContent(platform);
    
    // Extraer solo el contenido del body del PDF
    const bodyMatch = pdfContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const pdfBody = bodyMatch ? bodyMatch[1] : pdfContent;

    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reporte de Inventario - ${platform.platformNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f5f5f5;
              line-height: 1.4;
            }

            /* Barra de navegación móvil */
            .mobile-nav {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 16px;
              z-index: 1000;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .nav-title {
              font-size: 16px;
              font-weight: 600;
              flex: 1;
              text-align: center;
              margin: 0 16px;
            }

            .nav-buttons {
              display: flex;
              gap: 8px;
            }

            .nav-btn {
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              color: white;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              gap: 4px;
              text-decoration: none;
            }

            .nav-btn:hover {
              background: rgba(255,255,255,0.3);
              transform: translateY(-1px);
            }

            .nav-btn:active {
              transform: translateY(0);
            }

            .nav-btn.primary {
              background: rgba(255,255,255,0.9);
              color: #667eea;
              font-weight: 600;
            }

            .nav-btn.primary:hover {
              background: white;
            }

            /* Contenido del PDF */
            .pdf-container {
              margin-top: 60px;
              background: white;
              min-height: calc(100vh - 60px);
              overflow-x: auto;
            }

            .pdf-content {
              padding: 20px;
              max-width: 100%;
              overflow-x: auto;
            }

            /* Estilos del PDF original */
            .pdf-content .header {
              text-align: center;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }

            .pdf-content .title {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
              margin: 0;
            }

            .pdf-content .info-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 15px;
              margin-bottom: 30px;
            }

            .pdf-content .info-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }

            .pdf-content .info-label {
              font-weight: bold;
              color: #374151;
            }

            .pdf-content .info-value {
              color: #6b7280;
            }

            .pdf-content .pieces-section {
              margin-top: 30px;
            }

            .pdf-content .pieces-title {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
            }

            .pdf-content .pieces-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 14px;
            }

            .pdf-content .pieces-table th,
            .pdf-content .pieces-table td {
              border: 1px solid #d1d5db;
              padding: 8px 12px;
              text-align: left;
            }

            .pdf-content .pieces-table th {
              background-color: #f3f4f6;
              font-weight: bold;
              color: #374151;
            }

            .pdf-content .summary {
              background-color: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
            }

            .pdf-content .summary-title {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }

            .pdf-content .summary-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }

            /* Responsive */
            @media (min-width: 768px) {
              .mobile-nav {
                padding: 16px 24px;
              }

              .nav-title {
                font-size: 18px;
              }

              .nav-btn {
                padding: 10px 16px;
                font-size: 14px;
              }

              .pdf-content .info-grid {
                grid-template-columns: 1fr 1fr;
                gap: 20px;
              }

              .pdf-container {
                margin-top: 80px;
              }

              .pdf-content {
                padding: 30px;
              }
            }

            /* Estilos para impresión */
            @media print {
              .mobile-nav {
                display: none !important;
              }

              .pdf-container {
                margin-top: 0 !important;
              }

              .pdf-content {
                padding: 0 !important;
              }

              body {
                background: white !important;
              }
            }

            /* Animaciones */
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .pdf-container {
              animation: slideIn 0.3s ease-out;
            }
          </style>
        </head>
        <body>
          <!-- Barra de navegación móvil -->
          <div class="mobile-nav">
            <button class="nav-btn" onclick="goBack()">
              ← Volver
            </button>
            
            <div class="nav-title">
              Reporte de Inventario
            </div>
            
            <div class="nav-buttons">
              <button class="nav-btn" onclick="downloadPDF()">
                📥 Descargar
              </button>
              <button class="nav-btn primary" onclick="printPDF()">
                🖨️ Imprimir
              </button>
            </div>
          </div>

          <!-- Contenido del PDF -->
          <div class="pdf-container">
            <div class="pdf-content">
              ${pdfBody}
            </div>
          </div>

          <script>
            // Funciones de navegación
            function goBack() {
              if (window.opener) {
                window.close();
              } else {
                history.back();
              }
            }

            function downloadPDF() {
              try {
                // Crear un blob con el contenido del PDF
                const pdfContent = \`${pdfContent.replace(/`/g, '\\`')}\`;
                const blob = new Blob([pdfContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                
                // Crear enlace de descarga
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Reporte_Inventario_${platform.platformNumber}_${new Date().toISOString().split('T')[0]}.html';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Limpiar URL
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                
                // Mostrar notificación
                showNotification('✅ Archivo descargado exitosamente', 'success');
              } catch (error) {
                console.error('Error descargando PDF:', error);
                showNotification('❌ Error al descargar archivo', 'error');
              }
            }

            function printPDF() {
              try {
                window.print();
                showNotification('🖨️ Enviando a impresión...', 'success');
              } catch (error) {
                console.error('Error imprimiendo:', error);
                showNotification('❌ Error al imprimir', 'error');
              }
            }

            function showNotification(message, type) {
              // Crear notificación
              const notification = document.createElement('div');
              notification.style.cssText = \`
                position: fixed;
                top: 70px;
                left: 50%;
                transform: translateX(-50%);
                background: \${type === 'success' ? '#10b981' : '#ef4444'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                z-index: 1001;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease-out;
              \`;
              notification.textContent = message;
              
              document.body.appendChild(notification);
              
              // Remover después de 3 segundos
              setTimeout(() => {
                if (document.body.contains(notification)) {
                  document.body.removeChild(notification);
                }
              }, 3000);
            }

            // Manejar teclas de acceso rápido
            document.addEventListener('keydown', function(e) {
              if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                  case 'p':
                    e.preventDefault();
                    printPDF();
                    break;
                  case 's':
                    e.preventDefault();
                    downloadPDF();
                    break;
                }
              } else if (e.key === 'Escape') {
                goBack();
              }
            });

            // Auto-focus en el contenido
            document.addEventListener('DOMContentLoaded', function() {
              const container = document.querySelector('.pdf-container');
              if (container) {
                container.focus();
              }
            });
          </script>
        </body>
      </html>
    `;
  }

  /**
   * Genera HTML con navegación móvil para imagen
   */
  private static generateImageHTMLWithNavigation(platform: Platform, imageUrl: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Imagen de Inventario - ${platform.platformNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f5f5f5;
              line-height: 1.4;
            }

            /* Barra de navegación móvil */
            .mobile-nav {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 16px;
              z-index: 1000;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .nav-title {
              font-size: 16px;
              font-weight: 600;
              flex: 1;
              text-align: center;
              margin: 0 16px;
            }

            .nav-buttons {
              display: flex;
              gap: 8px;
            }

            .nav-btn {
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              color: white;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              gap: 4px;
              text-decoration: none;
            }

            .nav-btn:hover {
              background: rgba(255,255,255,0.3);
              transform: translateY(-1px);
            }

            .nav-btn:active {
              transform: translateY(0);
            }

            .nav-btn.primary {
              background: rgba(255,255,255,0.9);
              color: #667eea;
              font-weight: 600;
            }

            .nav-btn.primary:hover {
              background: white;
            }

            /* Contenido de la imagen */
            .image-container {
              margin-top: 60px;
              background: white;
              min-height: calc(100vh - 60px);
              padding: 20px;
              text-align: center;
            }

            .image-header {
              margin-bottom: 20px;
            }

            .image-title {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }

            .image-subtitle {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 20px;
            }

            .report-image {
              max-width: 100%;
              height: auto;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              margin: 0 auto;
              display: block;
            }

            /* Responsive */
            @media (min-width: 768px) {
              .mobile-nav {
                padding: 16px 24px;
              }

              .nav-title {
                font-size: 18px;
              }

              .nav-btn {
                padding: 10px 16px;
                font-size: 14px;
              }

              .image-container {
                margin-top: 80px;
                padding: 30px;
              }

              .image-title {
                font-size: 28px;
              }

              .image-subtitle {
                font-size: 16px;
              }
            }

            /* Estilos para impresión */
            @media print {
              .mobile-nav {
                display: none !important;
              }

              .image-container {
                margin-top: 0 !important;
                padding: 0 !important;
              }

              body {
                background: white !important;
              }
            }

            /* Animaciones */
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .image-container {
              animation: slideIn 0.3s ease-out;
            }
          </style>
        </head>
        <body>
          <!-- Barra de navegación móvil -->
          <div class="mobile-nav">
            <button class="nav-btn" onclick="goBack()">
              ← Volver
            </button>
            
            <div class="nav-title">
              Imagen de Inventario
            </div>
            
            <div class="nav-buttons">
              <button class="nav-btn" onclick="downloadImage()">
                📥 Descargar
              </button>
              <button class="nav-btn primary" onclick="printImage()">
                🖨️ Imprimir
              </button>
            </div>
          </div>

          <!-- Contenido de la imagen -->
          <div class="image-container">
            <div class="image-header">
              <h1 class="image-title">Carga ${platform.platformNumber}</h1>
              <p class="image-subtitle">
                ${platform.materialTypes?.join(', ') || 'Sin materiales'} - ${platform.driver || 'Sin chofer'}
              </p>
            </div>
            
            <img 
              src="${imageUrl}" 
              alt="Reporte de Inventario - Carga ${platform.platformNumber}" 
              class="report-image"
              onload="showNotification('✅ Imagen cargada exitosamente', 'success')"
              onerror="showNotification('❌ Error al cargar imagen', 'error')"
            />
          </div>

          <script>
            // Funciones de navegación
            function goBack() {
              if (window.opener) {
                window.close();
              } else {
                history.back();
              }
            }

            function downloadImage() {
              try {
                // Crear enlace de descarga
                const a = document.createElement('a');
                a.href = '${imageUrl}';
                a.download = 'Reporte_Inventario_${platform.platformNumber}_${new Date().toISOString().split('T')[0]}.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                showNotification('✅ Imagen descargada exitosamente', 'success');
              } catch (error) {
                console.error('Error descargando imagen:', error);
                showNotification('❌ Error al descargar imagen', 'error');
              }
            }

            function printImage() {
              try {
                window.print();
                showNotification('🖨️ Enviando a impresión...', 'success');
              } catch (error) {
                console.error('Error imprimiendo:', error);
                showNotification('❌ Error al imprimir', 'error');
              }
            }

            function showNotification(message, type) {
              // Crear notificación
              const notification = document.createElement('div');
              notification.style.cssText = \`
                position: fixed;
                top: 70px;
                left: 50%;
                transform: translateX(-50%);
                background: \${type === 'success' ? '#10b981' : '#ef4444'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                z-index: 1001;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease-out;
              \`;
              notification.textContent = message;
              
              document.body.appendChild(notification);
              
              // Remover después de 3 segundos
              setTimeout(() => {
                if (document.body.contains(notification)) {
                  document.body.removeChild(notification);
                }
              }, 3000);
            }

            // Manejar teclas de acceso rápido
            document.addEventListener('keydown', function(e) {
              if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                  case 'p':
                    e.preventDefault();
                    printImage();
                    break;
                  case 's':
                    e.preventDefault();
                    downloadImage();
                    break;
                }
              } else if (e.key === 'Escape') {
                goBack();
              }
            });

            // Auto-focus en el contenido
            document.addEventListener('DOMContentLoaded', function() {
              const container = document.querySelector('.image-container');
              if (container) {
                container.focus();
              }
            });
          </script>
        </body>
      </html>
    `;
  }
}
