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
   * Dibuja el contenido en el canvas
   */
  private static drawImageContent(ctx: CanvasRenderingContext2D, platform: Platform, width: number, height: number): void {
    try {
      console.log('🖼️ [drawImageContent] Dibujando contenido para:', platform.platformNumber);
      
      // ✅ VALIDAR datos de la plataforma
      if (!platform) {
        throw new Error('Plataforma no proporcionada para dibujar imagen');
      }
      
      const cargaNumber = platform.platformNumber || 'Sin número';
      const provider = platform.provider || 'Sin proveedor';
      const client = platform.client || 'Sin cliente';
      const driver = platform.driver || 'Sin chofer';
      const ticketNumber = platform.ticketNumber || 'Sin ticket';
      const pieces = platform.pieces || [];
      const totalLinearMeters = platform.totalLinearMeters || 0;
      const totalLength = platform.totalLength || 0;
      
      const padding = 40;
      let y = padding;
      
      // Título
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`CARGA ${cargaNumber}`, width / 2, y);
      y += 50;
    
      // Información de la carga
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#374151';
      
      const receptionDate = platform.receptionDate ? new Date(platform.receptionDate).toLocaleDateString('es-MX') : 'No especificada';
      const standardWidth = platform.standardWidth || 0;
      
      const info = [
        `Fecha: ${receptionDate}`,
        `Tipo: ${platform.platformType === 'provider' ? 'Proveedor' : 'Cliente'}`,
        `Proveedor: ${provider}`,
        `Cliente: ${client}`,
        `Chofer: ${driver}`,
        `Ticket: ${ticketNumber}`,
        `Ancho estándar: ${standardWidth}m`,
        `Total piezas: ${pieces.length}`,
        `Metros lineales: ${totalLinearMeters.toFixed(2)}m`,
        `Longitud total: ${totalLength.toFixed(2)}m`
      ];
    
    info.forEach((line) => {
      ctx.fillText(line, padding, y);
      y += 25;
    });
    
      // Piezas
      if (pieces.length > 0) {
        y += 20;
        ctx.font = 'bold 18px Arial';
        ctx.fillText('PIEZAS:', padding, y);
        y += 30;
        
        ctx.font = '14px Arial';
        pieces.forEach((piece, index) => {
          const pieceNumber = piece.number || 'N/A';
          const pieceLength = piece.length ? piece.length.toFixed(2) : '0.00';
          const pieceMaterial = piece.material || 'Sin especificar';
          const pieceText = `Pieza ${pieceNumber}: ${pieceLength}m - ${pieceMaterial}`;
          ctx.fillText(pieceText, padding, y);
          y += 20;
        });
      }
    
      // Notas
      const notes = platform.notes;
      if (notes && notes !== 'Sin notas') {
        y += 20;
        ctx.font = 'bold 16px Arial';
        ctx.fillText('NOTAS:', padding, y);
        y += 25;
        ctx.font = '14px Arial';
        ctx.fillText(notes, padding, y);
      }
    } catch (error) {
      console.error('❌ [drawImageContent] Error dibujando contenido:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al dibujar imagen';
      throw new Error(`Error dibujando contenido de imagen: ${errorMessage}`);
    }
  }

  /**
   * Genera el contenido HTML para el PDF
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
      const provider = platform.provider || 'Sin proveedor';
      const client = platform.client || 'Sin cliente';
      const driver = platform.driver || 'Sin chofer';
      const ticketNumber = platform.ticketNumber || 'Sin ticket';
      const notes = platform.notes || 'Sin notas';
      const pieces = platform.pieces || [];
      const totalLinearMeters = platform.totalLinearMeters || 0;
      const totalLength = platform.totalLength || 0;
      
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
          <title>Carga ${cargaNumber}</title>
          <style>
            @media print {
              body { margin: 0; padding: 10px; }
              .header { page-break-after: avoid; }
              .pieces-section { page-break-inside: avoid; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
              margin: 0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: bold;
              color: #374151;
            }
            .info-value {
              color: #6b7280;
            }
            .pieces-section {
              margin-top: 30px;
            }
            .pieces-title {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
            }
            .pieces-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .pieces-table th,
            .pieces-table td {
              border: 1px solid #d1d5db;
              padding: 8px 12px;
              text-align: left;
            }
            .pieces-table th {
              background-color: #f3f4f6;
              font-weight: bold;
              color: #374151;
            }
            .summary {
              background-color: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .summary-title {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }
            .summary-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              .info-grid { grid-template-columns: 1fr; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">CARGA ${platform.platformNumber}</h1>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Fecha:</span>
              <span class="info-value">${platform.receptionDate ? new Date(platform.receptionDate).toLocaleDateString('es-MX') : 'No especificada'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tipo:</span>
              <span class="info-value">${platform.platformType === 'provider' ? 'Proveedor' : 'Cliente'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Proveedor:</span>
              <span class="info-value">${platform.provider || 'No especificado'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Cliente:</span>
              <span class="info-value">${platform.client || 'No especificado'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Chofer:</span>
              <span class="info-value">${platform.driver || 'No especificado'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ticket:</span>
              <span class="info-value">${platform.ticketNumber || 'No especificado'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ancho estándar:</span>
              <span class="info-value">${platform.standardWidth}m</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado:</span>
              <span class="info-value">${platform.status === 'completed' ? 'Completada' : 'En progreso'}</span>
            </div>
          </div>
          
          ${pieces.length > 0 ? `
            <div class="pieces-section">
              <h2 class="pieces-title">PIEZAS (${pieces.length})</h2>
              <table class="pieces-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Longitud</th>
                    <th>Material</th>
                    <th>Metros Lineales</th>
                  </tr>
                </thead>
                <tbody>
                  ${pieces.map(piece => `
                    <tr>
                      <td>${piece.number || 'N/A'}</td>
                      <td>${piece.length ? piece.length.toFixed(2) : '0.00'}m</td>
                      <td>${piece.material || 'Sin especificar'}</td>
                      <td>${piece.linearMeters ? piece.linearMeters.toFixed(2) : '0.00'}m</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
          
          <div class="summary">
            <h3 class="summary-title">RESUMEN</h3>
            <div class="summary-item">
              <span>Total de piezas:</span>
              <span><strong>${pieces.length}</strong></span>
            </div>
            <div class="summary-item">
              <span>Metros lineales totales:</span>
              <span><strong>${totalLinearMeters.toFixed(2)}m</strong></span>
            </div>
            <div class="summary-item">
              <span>Longitud total:</span>
              <span><strong>${totalLength.toFixed(2)}m</strong></span>
            </div>
          </div>
          
          ${notes && notes !== 'Sin notas' ? `
            <div style="margin-top: 30px;">
              <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 10px;">NOTAS</h3>
              <p style="color: #6b7280; line-height: 1.5;">${notes}</p>
            </div>
          ` : ''}
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
