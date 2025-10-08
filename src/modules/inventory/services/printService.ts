// Servicio para impresión directa de PDF e imágenes

import { Platform } from '../types';

export class PrintService {
  /**
   * Imprime un PDF directamente
   */
  static async printPDF(platform: Platform): Promise<void> {
    try {
      // Generar el PDF
      const pdfBlob = await this.generatePDF(platform);
      
      // Crear URL del blob
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Abrir en nueva ventana para impresión
      const printWindow = window.open(pdfUrl, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          // Esperar a que el PDF se cargue completamente
          setTimeout(() => {
            printWindow.print();
            // Limpiar la URL después de un tiempo
            setTimeout(() => {
              URL.revokeObjectURL(pdfUrl);
            }, 1000);
          }, 500);
        };
      } else {
        // Fallback para dispositivos que bloquean popups
        this.fallbackPrint(pdfBlob, 'application/pdf');
      }
    } catch (error) {
      console.error('Error printing PDF:', error);
      throw new Error('Error al generar el PDF para impresión');
    }
  }

  /**
   * Imprime una imagen directamente
   */
  static async printImage(platform: Platform): Promise<void> {
    try {
      // Generar la imagen
      const imageBlob = await this.generateImage(platform);
      
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
          setTimeout(() => {
            printWindow.print();
            // Limpiar la URL después de un tiempo
            setTimeout(() => {
              URL.revokeObjectURL(imageUrl);
            }, 1000);
          }, 500);
        };
      } else {
        // Fallback para dispositivos que bloquean popups
        this.fallbackPrint(imageBlob, 'image/png');
      }
    } catch (error) {
      console.error('Error printing image:', error);
      throw new Error('Error al generar la imagen para impresión');
    }
  }

  /**
   * Genera un PDF de la carga
   */
  private static async generatePDF(platform: Platform): Promise<Blob> {
    // Crear contenido HTML para el PDF
    const htmlContent = this.generatePDFContent(platform);
    
    // Crear un iframe oculto para generar el PDF
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '210mm'; // A4 width
    iframe.style.height = '297mm'; // A4 height
    document.body.appendChild(iframe);
    
    return new Promise((resolve, reject) => {
      iframe.onload = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();
            
            // Esperar a que se renderice
            setTimeout(() => {
              // En un entorno real, aquí usarías una librería como jsPDF o html2pdf
              // Por ahora, creamos un blob con el HTML para simular el PDF
              const blob = new Blob([htmlContent], { type: 'application/pdf' });
              document.body.removeChild(iframe);
              resolve(blob);
            }, 1000);
          }
        } catch (error) {
          document.body.removeChild(iframe);
          reject(error);
        }
      };
    });
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
    const padding = 40;
    let y = padding;
    
    // Título
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`CARGA ${platform.cargaNumber}`, width / 2, y);
    y += 50;
    
    // Información de la carga
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#374151';
    
    const info = [
      `Fecha: ${platform.receptionDate.toLocaleDateString('es-MX')}`,
      `Tipo: ${platform.platformType === 'provider' ? 'Proveedor' : 'Cliente'}`,
      `Proveedor: ${platform.provider || 'No especificado'}`,
      `Cliente: ${platform.client || 'No especificado'}`,
      `Chofer: ${platform.driver || 'No especificado'}`,
      `Ticket: ${platform.ticketNumber || 'No especificado'}`,
      `Ancho estándar: ${platform.standardWidth}m`,
      `Total piezas: ${platform.pieces.length}`,
      `Metros lineales: ${platform.totalLinearMeters.toFixed(2)}m`,
      `Longitud total: ${platform.totalLength.toFixed(2)}m`
    ];
    
    info.forEach((line) => {
      ctx.fillText(line, padding, y);
      y += 25;
    });
    
    // Piezas
    if (platform.pieces.length > 0) {
      y += 20;
      ctx.font = 'bold 18px Arial';
      ctx.fillText('PIEZAS:', padding, y);
      y += 30;
      
      ctx.font = '14px Arial';
      platform.pieces.forEach((piece, index) => {
        const pieceText = `Pieza ${piece.number}: ${piece.length.toFixed(2)}m - ${piece.material}`;
        ctx.fillText(pieceText, padding, y);
        y += 20;
      });
    }
    
    // Notas
    if (platform.notes) {
      y += 20;
      ctx.font = 'bold 16px Arial';
      ctx.fillText('NOTAS:', padding, y);
      y += 25;
      ctx.font = '14px Arial';
      ctx.fillText(platform.notes, padding, y);
    }
  }

  /**
   * Genera el contenido HTML para el PDF
   */
  private static generatePDFContent(platform: Platform): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Carga ${platform.cargaNumber}</title>
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
          
          ${platform.pieces.length > 0 ? `
            <div class="pieces-section">
              <h2 class="pieces-title">PIEZAS (${platform.pieces.length})</h2>
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
                  ${platform.pieces.map(piece => `
                    <tr>
                      <td>${piece.number}</td>
                      <td>${piece.length.toFixed(2)}m</td>
                      <td>${piece.material}</td>
                      <td>${piece.linearMeters.toFixed(2)}m</td>
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
              <span><strong>${platform.pieces.length}</strong></span>
            </div>
            <div class="summary-item">
              <span>Metros lineales totales:</span>
              <span><strong>${platform.totalLinearMeters.toFixed(2)}m</strong></span>
            </div>
            <div class="summary-item">
              <span>Longitud total:</span>
              <span><strong>${platform.totalLength.toFixed(2)}m</strong></span>
            </div>
          </div>
          
          ${platform.notes ? `
            <div style="margin-top: 30px;">
              <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 10px;">NOTAS</h3>
              <p style="color: #6b7280; line-height: 1.5;">${platform.notes}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;
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
