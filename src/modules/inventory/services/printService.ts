// Servicio para impresión directa de PDF e imágenes

import { Platform } from '../types';

export class PrintService {
  /**
   * Imprime un PDF directamente
   */
  static async printPDF(platform: Platform): Promise<void> {
    try {
      // ✅ VALIDAR PRIMERO antes de acceder a propiedades
      if (!platform) {
        throw new Error('No se proporcionó información de la carga');
      }
      
      if (!platform.cargaNumber) {
        throw new Error('La carga no tiene número de carga válido');
      }
      
      console.log('🖨️ Iniciando impresión de PDF para carga:', platform.cargaNumber);
      
      // Generar el PDF
      const pdfBlob = await this.generatePDF(platform);
      
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('No se pudo generar el PDF');
      }
      
      console.log('✅ PDF generado exitosamente, tamaño:', pdfBlob.size, 'bytes');
      
      // Crear URL del blob
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Abrir en nueva ventana para impresión
      const printWindow = window.open(pdfUrl, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          console.log('📄 Ventana de impresión cargada');
          // Esperar a que el PDF se cargue completamente
          setTimeout(() => {
            try {
              printWindow.print();
              console.log('🖨️ Comando de impresión enviado');
              // Limpiar la URL después de un tiempo
              setTimeout(() => {
                URL.revokeObjectURL(pdfUrl);
                console.log('🧹 URL del PDF limpiada');
              }, 1000);
            } catch (printError) {
              console.error('Error al enviar a impresión:', printError);
              URL.revokeObjectURL(pdfUrl);
            }
          }, 500);
        };
        
        printWindow.onerror = () => {
          console.error('Error cargando ventana de impresión');
          URL.revokeObjectURL(pdfUrl);
        };
      } else {
        console.warn('⚠️ No se pudo abrir ventana de impresión, usando fallback');
        // Fallback para dispositivos que bloquean popups
        this.fallbackPrint(pdfBlob, 'application/pdf');
      }
    } catch (error) {
      console.error('❌ Error printing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al imprimir PDF';
      throw new Error(`Error al generar el PDF para impresión: ${errorMessage}`);
    }
  }

  /**
   * Imprime una imagen directamente
   */
  static async printImage(platform: Platform): Promise<void> {
    try {
      // ✅ VALIDAR PRIMERO antes de acceder a propiedades
      if (!platform) {
        throw new Error('No se proporcionó información de la carga');
      }
      
      if (!platform.cargaNumber) {
        throw new Error('La carga no tiene número de carga válido');
      }
      
      console.log('🖼️ Iniciando impresión de imagen para carga:', platform.cargaNumber);
      
      // Generar la imagen
      const imageBlob = await this.generateImage(platform);
      
      if (!imageBlob || imageBlob.size === 0) {
        throw new Error('No se pudo generar la imagen');
      }
      
      console.log('✅ Imagen generada exitosamente, tamaño:', imageBlob.size, 'bytes');
      
      // Crear URL del blob
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Crear ventana de impresión con la imagen
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Imprimir Carga - ${platform.cargaNumber}</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                }
                img {
                  max-width: 100%;
                  max-height: 100%;
                  object-fit: contain;
                }
                @media print {
                  body { margin: 0; padding: 0; }
                  img { max-width: 100%; max-height: 100vh; }
                }
              </style>
            </head>
            <body>
              <img src="${imageUrl}" alt="Carga ${platform.cargaNumber}" />
            </body>
          </html>
        `);
        
        printWindow.document.close();
        
        // Esperar a que la imagen se cargue
        printWindow.onload = () => {
          console.log('🖼️ Ventana de impresión de imagen cargada');
          setTimeout(() => {
            try {
              printWindow.print();
              console.log('🖨️ Comando de impresión de imagen enviado');
              // Limpiar la URL después de un tiempo
              setTimeout(() => {
                URL.revokeObjectURL(imageUrl);
                console.log('🧹 URL de la imagen limpiada');
              }, 1000);
            } catch (printError) {
              console.error('Error al enviar imagen a impresión:', printError);
              URL.revokeObjectURL(imageUrl);
            }
          }, 500);
        };
        
        printWindow.onerror = () => {
          console.error('Error cargando ventana de impresión de imagen');
          URL.revokeObjectURL(imageUrl);
        };
      } else {
        console.warn('⚠️ No se pudo abrir ventana de impresión, usando fallback');
        // Fallback para dispositivos que bloquean popups
        this.fallbackPrint(imageBlob, 'image/png');
      }
    } catch (error) {
      console.error('❌ Error printing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al imprimir imagen';
      throw new Error(`Error al generar la imagen para impresión: ${errorMessage}`);
    }
  }

  /**
   * Genera un PDF de la carga
   */
  private static async generatePDF(platform: Platform): Promise<Blob> {
    try {
      // Crear contenido HTML para el PDF
      const htmlContent = this.generatePDFContent(platform);
      
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
        const timeout = setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          reject(new Error('Timeout generando PDF'));
        }, 5000);
        
        iframe.onload = () => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              iframeDoc.open();
              iframeDoc.write(htmlContent);
              iframeDoc.close();
              
              // Esperar a que se renderice
              setTimeout(() => {
                try {
                  // Crear un blob con el HTML para simular el PDF
                  const blob = new Blob([htmlContent], { type: 'application/pdf' });
                  clearTimeout(timeout);
                  if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                  }
                  resolve(blob);
                } catch (error) {
                  clearTimeout(timeout);
                  if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                  }
                  reject(error);
                }
              }, 1000);
            } else {
              clearTimeout(timeout);
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
              reject(new Error('No se pudo acceder al documento del iframe'));
            }
          } catch (error) {
            clearTimeout(timeout);
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            reject(error);
          }
        };
        
        iframe.onerror = () => {
          clearTimeout(timeout);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          reject(new Error('Error cargando iframe para PDF'));
        };
      });
    } catch (error) {
      console.error('Error en generatePDF:', error);
      throw new Error(`Error generando PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Genera una imagen de la carga
   */
  private static async generateImage(platform: Platform): Promise<Blob> {
    // Crear un canvas para generar la imagen
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No se pudo crear el contexto del canvas');
    }
    
    // Configurar el canvas
    canvas.width = 800;
    canvas.height = 1000;
    
    // Configurar el contexto
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar el contenido
    this.drawImageContent(ctx, platform, canvas.width, canvas.height);
    
    // Convertir a blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/png', 0.9);
    });
  }

  /**
   * Dibuja el contenido en el canvas
   */
  private static drawImageContent(ctx: CanvasRenderingContext2D, platform: Platform, width: number, height: number): void {
    try {
      console.log('🖼️ [drawImageContent] Dibujando contenido para:', platform.cargaNumber);
      
      // ✅ VALIDAR datos de la plataforma
      if (!platform) {
        throw new Error('Plataforma no proporcionada para dibujar imagen');
      }
      
      const cargaNumber = platform.cargaNumber || 'Sin número';
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
      throw new Error(`Error dibujando contenido de imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Genera el contenido HTML para el PDF
   */
  private static generatePDFContent(platform: Platform): string {
    try {
      console.log('📄 [generatePDFContent] Generando contenido para:', platform.cargaNumber);
      
      // ✅ VALIDAR que la plataforma tiene los datos necesarios
      if (!platform) {
        throw new Error('Plataforma no proporcionada');
      }
      
      if (!platform.cargaNumber) {
        throw new Error('Número de carga no disponible');
      }
      
      const cargaNumber = platform.cargaNumber || 'Sin número';
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
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
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
            <h1 class="title">CARGA ${platform.cargaNumber}</h1>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Fecha:</span>
              <span class="info-value">${platform.receptionDate.toLocaleDateString('es-MX')}</span>
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
      throw new Error(`Error generando contenido PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
}
