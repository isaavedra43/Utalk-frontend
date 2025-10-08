import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Platform, Evidence } from '../types';

// Extend the jsPDF type to include autoTable
  declare module 'jspdf' {
    interface jsPDF {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      autoTable: (options: any) => jsPDF;
    }
  }

export interface PDFReportOptions {
  platform: Platform;
  signature?: {
    name: string;
    date: string;
    signatureImage?: string;
  };
  includeEvidence: boolean;
}

export class PDFReportService {
  private static readonly COLORS = {
    primary: '#374151',      // gray-700 - Color principal único
    text: '#374151',         // gray-700 - Texto principal
    textSecondary: '#6b7280', // gray-500 - Texto secundario
    textLight: '#9ca3af',    // gray-400 - Texto claro
    border: '#e5e7eb',       // gray-200 - Bordes sutiles
    background: '#f9fafb',   // gray-50 - Fondo de secciones
    white: '#ffffff',        // Blanco puro
  };

  private static readonly FONTS = {
    title: 18,
    subtitle: 14,
    heading: 12,
    normal: 10,
    small: 9,
  };

  static async generateProfessionalReport(options: PDFReportOptions): Promise<Blob> {
    try {
      const { platform, signature, includeEvidence } = options;

      console.log('generateProfessionalReport - Datos recibidos:', {
        platformNumber: platform?.platformNumber,
        piecesCount: platform?.pieces?.length,
        evidenceCount: platform?.evidence?.length,
        hasSignature: !!signature?.name,
        includeEvidence: includeEvidence
      });

      // Validar datos requeridos con mejor manejo de errores
      if (!platform) {
        console.error('Plataforma no proporcionada');
        throw new Error('Plataforma no proporcionada');
      }

      if (!platform.platformNumber) {
        console.error('Número de plataforma no válido:', platform.platformNumber);
        throw new Error('Número de plataforma no válido');
      }

      // Crear documento PDF básico
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      try {
        // Header del reporte
        this.addHeader(doc, platform);
        let yPosition = 80; // Posición después del header

        // Información general de la carga
        yPosition = this.addPlatformInfo(doc, platform, yPosition);

        // Tabla de piezas
        yPosition = this.addPiecesTable(doc, platform, yPosition);

        // Evidencias (si están habilitadas)
        if (includeEvidence && platform.evidence && Array.isArray(platform.evidence) && platform.evidence.length > 0) {
          yPosition = await this.addEvidenceSection(doc, platform.evidence, yPosition);
        }

        // Firma electrónica
        if (signature && signature.name) {
          this.addSignatureSection(doc, signature, yPosition);
        }

        // Footer
        this.addFooter(doc, platform);

        console.log('PDF generado exitosamente para plataforma:', platform.platformNumber);
        return doc.output('blob');
      } catch (sectionError) {
        console.error('Error generando sección del PDF:', sectionError);
        // Si hay error en alguna sección, intentar generar un PDF básico
        try {
          // Crear PDF básico con información mínima
          const basicDoc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          basicDoc.setFontSize(16);
          basicDoc.setFont('helvetica', 'bold');
          basicDoc.text('REPORTE DE CARGA', 20, 30);

          basicDoc.setFontSize(12);
          basicDoc.setFont('helvetica', 'normal');
          basicDoc.text(`Número de Carga: ${platform.platformNumber || 'N/A'}`, 20, 50);
          basicDoc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 20, 65);

          if (platform.pieces && Array.isArray(platform.pieces) && platform.pieces.length > 0) {
            basicDoc.text(`Total de piezas: ${platform.pieces.length}`, 20, 80);
            basicDoc.text(`Metros lineales: ${(platform.totalLinearMeters || 0).toFixed(2)} m²`, 20, 95);
          }

          basicDoc.text('Error generando reporte completo. Datos básicos incluidos.', 20, 120);

          console.log('PDF básico generado como fallback');
          return basicDoc.output('blob');
        } catch (fallbackError) {
          console.error('Error generando PDF básico de fallback:', fallbackError);
          const errorMessage = fallbackError instanceof Error ? fallbackError.message : 'Error desconocido';
          throw new Error(`Error crítico generando PDF: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Error crítico en generateProfessionalReport:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error generando reporte PDF: ${errorMessage}`);
    }
  }

  private static addHeader(doc: jsPDF, platform: Platform) {
    try {
      const pageWidth = doc.internal.pageSize.getWidth();

      // Título principal minimalista
      doc.setFontSize(this.FONTS.title);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      const title = 'REPORTE DE CARGA';
      const titleWidth = doc.getTextWidth(title);
      const titleX = (pageWidth - titleWidth) / 2;
      doc.text(title, titleX, 25);

      // Subtítulo simple
      doc.setFontSize(this.FONTS.subtitle);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.textSecondary);

      const subtitle = 'CUANTIFICACIÓN DE MATERIALES';
      const subtitleWidth = doc.getTextWidth(subtitle);
      const subtitleX = (pageWidth - subtitleWidth) / 2;
      doc.text(subtitle, subtitleX, 35);

      // Información de la carga simple
      const platformNumber = platform.platformNumber || 'N/A';
      doc.setFontSize(this.FONTS.normal);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.text);
      
      const cargaInfo = `Carga: ${platformNumber}`;
      const cargaInfoWidth = doc.getTextWidth(cargaInfo);
      const cargaInfoX = (pageWidth - cargaInfoWidth) / 2;
      doc.text(cargaInfo, cargaInfoX, 45);

      // Fecha del reporte
      const reportDate = (() => {
        try {
          return new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        } catch (dateError) {
          console.warn('Error formateando fecha del reporte:', dateError);
          return new Date().toString();
        }
      })();

      doc.setFontSize(this.FONTS.small);
      doc.setTextColor(this.COLORS.textLight);
      doc.text(`Fecha del reporte: ${reportDate}`, 20, doc.internal.pageSize.getHeight() - 20);

      // Línea separadora simple
      doc.setDrawColor(this.COLORS.border);
      doc.setLineWidth(0.5);
      doc.line(20, 55, pageWidth - 20, 55);
    } catch (error) {
      console.error('Error en addHeader:', error);
      // No lanzar error para el header, ya que no es crítico
    }
  }

  // Función auxiliar para convertir hex a RGB para jsPDF
  private static hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgb(${r}, ${g}, ${b})`;
    }
    return '#000000';
  }

  private static addPlatformInfo(doc: jsPDF, platform: Platform, yPosition: number) {
    try {
      console.log('addPlatformInfo - Datos recibidos:', {
        platformNumber: platform.platformNumber,
        platformType: platform.platformType,
        status: platform.status,
        receptionDate: platform.receptionDate,
        materialTypes: platform.materialTypes,
        provider: platform.provider,
        client: platform.client,
        driver: platform.driver,
        ticketNumber: platform.ticketNumber,
        notes: platform.notes,
        createdBy: platform.createdBy,
        createdByName: platform.createdByName
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let currentY = yPosition;

      // Título de la sección simple
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      doc.text('INFORMACIÓN DE LA CARGA', 20, currentY);
      currentY += 8;

      // Línea separadora simple
      doc.setDrawColor(this.COLORS.border);
      doc.setLineWidth(0.5);
      doc.line(20, currentY, pageWidth - 20, currentY);
      currentY += 8;

      // Información simple en lista
      doc.setFontSize(this.FONTS.normal);
      doc.setFont('helvetica', 'normal');
      
      const lineHeight = 6;
      const leftMargin = 20;

      // Crear información básica como lista simple
      const infoLines = [
        `Número de Carga: ${platform.platformNumber || 'N/A'}`,
        `Tipo de Plataforma: ${platform.platformType === 'provider' ? 'Proveedor' : 'Cliente'}`,
        `Estado: ${platform.status === 'in_progress' ? 'En Proceso' :
                  platform.status === 'completed' ? 'Completada' : 'Exportada'}`,
        `Fecha de Recepción: ${platform.receptionDate ? new Date(platform.receptionDate).toLocaleDateString('es-MX') : 'N/A'}`,
        `Materiales: ${platform.materialTypes && platform.materialTypes.length > 0 ? platform.materialTypes.join(', ') : 'Sin especificar'}`,
        `${platform.platformType === 'provider' ? 'Proveedor' : 'Cliente'}: ${platform.provider || platform.client || 'No especificado'}`,
        `Chofer: ${platform.driver || 'No especificado'}`,
        ...(platform.platformType === 'client' && platform.ticketNumber ?
          [`Número de Ticket: ${platform.ticketNumber}`] : []),
        `Observaciones: ${platform.notes || 'Sin observaciones'}`,
        `Creado por: ${platform.createdByName || platform.createdBy || 'Sistema'}`,
      ];

      infoLines.forEach((line) => {
        if (currentY > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage();
          currentY = 20;
        }
        doc.setTextColor(this.COLORS.text);
        doc.text(line, leftMargin, currentY);
        currentY += lineHeight;
      });

      return currentY + 10;
    } catch (error) {
      console.error('Error en addPlatformInfo - Datos de plataforma:', platform);
      console.error('Error detallado:', error);
      // En lugar de lanzar el error, devolver la posición actual para continuar
      return yPosition + 50;
    }
  }

  private static addPiecesTable(doc: jsPDF, platform: Platform, yPosition: number) {
    try {
      console.log('addPiecesTable - Datos recibidos:', {
        piecesLength: platform.pieces?.length || 0,
        totalLength: platform.totalLength,
        totalLinearMeters: platform.totalLinearMeters,
        standardWidth: platform.standardWidth
      });

      if (!platform.pieces || !Array.isArray(platform.pieces) || platform.pieces.length === 0) {
        doc.setFontSize(this.FONTS.normal);
        doc.setTextColor(this.COLORS.text);
        doc.text('No hay piezas registradas en esta carga.', 20, yPosition);
        return yPosition + 20;
      }

      const pageWidth = doc.internal.pageSize.getWidth();
      let currentY = yPosition;

      // Título de la sección simple
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      doc.text('DETALLE DE PIEZAS', 20, currentY);
      currentY += 8;

      // Línea separadora simple
      doc.setDrawColor(this.COLORS.border);
      doc.setLineWidth(0.5);
      doc.line(20, currentY, pageWidth - 20, currentY);
      currentY += 8;

      // Crear tabla simple
      const rowHeight = 6;
      const colWidths = [15, 60, 30, 25, 35]; // Anchos de columnas
      const startX = 20;

      // Encabezado de tabla simple
      doc.setFontSize(this.FONTS.small);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      let currentX = startX;
      const headers = ['No.', 'Material', 'Longitud (m)', 'Ancho (m)', 'Metros Lineales'];
      headers.forEach((header, index) => {
        const align = index > 1 ? 'center' : 'left';
        doc.text(header, currentX + 3, currentY + 4, { align });
        currentX += colWidths[index];
      });

      currentY += rowHeight + 2;

      // Línea separadora del encabezado
      doc.setDrawColor(this.COLORS.border);
      doc.setLineWidth(0.5);
      doc.line(startX, currentY, startX + colWidths.reduce((a, b) => a + b, 0), currentY);
      currentY += 2;

      // Datos de piezas simple
      platform.pieces.forEach((piece, index) => {
        if (currentY > doc.internal.pageSize.getHeight() - 50) {
          doc.addPage();
          currentY = 20;

          // Repetir encabezado en nueva página
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(this.COLORS.primary);

          currentX = startX;
          headers.forEach((header, headerIndex) => {
            const align = headerIndex > 1 ? 'center' : 'left';
            doc.text(header, currentX + 3, currentY + 4, { align });
            currentX += colWidths[headerIndex];
          });

          currentY += rowHeight + 2;
          doc.setDrawColor(this.COLORS.border);
          doc.setLineWidth(0.5);
          doc.line(startX, currentY, startX + colWidths.reduce((a, b) => a + b, 0), currentY);
          currentY += 2;
        }

        doc.setFontSize(this.FONTS.small);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(this.COLORS.text);

        currentX = startX;
        const rowData = [
          (index + 1).toString(),
          piece.material?.substring(0, 20) || 'Sin especificar',
          (piece.length || 0).toFixed(2),
          (piece.standardWidth || 0).toFixed(2),
          (piece.linearMeters || 0).toFixed(3)
        ];

        rowData.forEach((data, colIndex) => {
          const align = colIndex > 1 ? 'center' : 'left';
          const textX = align === 'center' ? currentX + colWidths[colIndex] / 2 : currentX + 3;
          doc.text(data, textX, currentY + 4, { align });
          currentX += colWidths[colIndex];
        });

        currentY += rowHeight;
      });

      // Línea separadora antes del total
      doc.setDrawColor(this.COLORS.border);
      doc.setLineWidth(0.5);
      doc.line(startX, currentY, startX + colWidths.reduce((a, b) => a + b, 0), currentY);
      currentY += 2;

      // Fila de total simple
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      currentX = startX;
      const totalData = [
        'TOTAL',
        '',
        (platform.totalLength || 0).toFixed(2),
        (platform.standardWidth || 0).toFixed(2),
        (platform.totalLinearMeters || 0).toFixed(3)
      ];

      totalData.forEach((data, colIndex) => {
        const align = colIndex > 1 ? 'center' : 'left';
        const textX = align === 'center' ? currentX + colWidths[colIndex] / 2 : currentX + 3;
        doc.text(data, textX, currentY + 4, { align });
        currentX += colWidths[colIndex];
      });

      currentY += rowHeight + 5;

      // Resumen simple
      if (currentY > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        currentY = 20;
      }

      const summaryText = `METROS TOTALES DE LA CARGA: ${(platform.totalLinearMeters || 0).toFixed(2)} m²`;
      const summaryWidth = doc.getTextWidth(summaryText);
      const summaryX = (pageWidth - summaryWidth) / 2;

      doc.setFontSize(this.FONTS.subtitle);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);
      doc.text(summaryText, summaryX, currentY);

      return currentY + 15;
    } catch (error) {
      console.error('Error en addPiecesTable - Datos de piezas:', platform.pieces);
      console.error('Error detallado:', error);
      // En lugar de lanzar el error, devolver la posición actual para continuar
      return yPosition + 50;
    }
  }

  private static async addEvidenceSection(doc: jsPDF, evidence: Evidence[], yPosition: number): Promise<number> {
    try {
      if (!evidence || !Array.isArray(evidence) || evidence.length === 0) return yPosition;

      console.log('addEvidenceSection - Datos recibidos:', evidence.length, 'evidencias');

      let currentY = yPosition;

      // Verificar si necesitamos nueva página
      if (currentY > doc.internal.pageSize.getHeight() - 100) {
        doc.addPage();
        currentY = 20;
      }

      // Título de la sección
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      doc.text('EVIDENCIAS ADJUNTAS', 20, currentY);
      currentY += 10;

      // Línea separadora
      doc.setDrawColor(this.COLORS.border);
      doc.line(20, currentY, doc.internal.pageSize.getWidth() - 20, currentY);
      currentY += 10;

      for (let i = 0; i < evidence.length; i++) {
        const evidenceItem = evidence[i];

        // Verificar si necesitamos nueva página para cada evidencia
        if (currentY > doc.internal.pageSize.getHeight() - 80) {
          doc.addPage();
          currentY = 20;
        }

        // Información de la evidencia como texto simple
        doc.setFontSize(this.FONTS.small);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(this.COLORS.text);

        const lineHeight = 6;
        const leftMargin = 25;

        // Crear líneas de evidencia
        const evidenceLines = [
          `Archivo: ${evidenceItem.fileName || 'Sin nombre'}`,
          `Tipo: ${evidenceItem.fileType || 'Desconocido'}`,
          `Tamaño: ${this.formatFileSize(evidenceItem.fileSize || 0)}`,
          ...(evidenceItem.description ? [`Descripción: ${evidenceItem.description}`] : []),
        ];

        evidenceLines.forEach((line) => {
          if (currentY > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(line, leftMargin, currentY);
          currentY += lineHeight;
        });

        // Si es una imagen, agregar la imagen real al PDF
        if (evidenceItem.fileType && evidenceItem.fileType.startsWith('image/') && evidenceItem.url) {
          try {
            // Verificar si necesitamos nueva página para la imagen
            if (currentY > doc.internal.pageSize.getHeight() - 60) {
              doc.addPage();
              currentY = 20;
            }

            console.log('🖼️ Procesando imagen de evidencia:', {
              fileName: evidenceItem.fileName,
              url: evidenceItem.url,
              type: evidenceItem.fileType
            });
            
            // Cargar y agregar la imagen
            await this.addImageToPDF(doc, evidenceItem.url, currentY, leftMargin);
            currentY += 50; // Espacio para la imagen + margen
            
            console.log('✅ Imagen de evidencia procesada exitosamente');
          } catch (imageError) {
            console.warn('⚠️ Error cargando imagen de evidencia:', imageError);
            console.warn('⚠️ Detalles del error:', {
              fileName: evidenceItem.fileName,
              url: evidenceItem.url,
              error: imageError
            });
            
            // Si falla la carga de imagen, agregar nota de error más informativa
            doc.setFontSize(this.FONTS.small);
            doc.setTextColor('#ef4444'); // Rojo para el error
            doc.text(`⚠️ Error cargando imagen: ${evidenceItem.fileName}`, leftMargin, currentY);
            currentY += lineHeight;
            
            doc.setTextColor(this.COLORS.textLight);
            doc.text('Imagen no disponible (problema de CORS o URL)', leftMargin, currentY);
            currentY += lineHeight + 5;
          }
        } else {
          currentY += 5; // Espacio adicional entre evidencias
        }
      }

      return currentY + 10;
    } catch (error) {
      console.error('Error en addEvidenceSection - Datos de evidencias:', evidence);
      console.error('Error detallado:', error);
      // En lugar de lanzar el error, devolver la posición actual para continuar
      return yPosition + 50;
    }
  }

  private static async addImageToPDF(doc: jsPDF, imageUrl: string, yPosition: number, xPosition: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🖼️ Intentando cargar imagen:', imageUrl);
        
        // Crear una imagen
        const img = new Image();
        
        img.onload = () => {
          try {
            const pageWidth = doc.internal.pageSize.getWidth();
            const maxWidth = pageWidth - xPosition - 20; // Margen derecho
            const maxHeight = 50; // Altura máxima para la imagen
            
            // Calcular dimensiones manteniendo proporción
            let imgWidth = img.width;
            let imgHeight = img.height;
            
            // Redimensionar si es necesario
            if (imgWidth > maxWidth) {
              const ratio = maxWidth / imgWidth;
              imgWidth = maxWidth;
              imgHeight = imgHeight * ratio;
            }
            
            if (imgHeight > maxHeight) {
              const ratio = maxHeight / imgHeight;
              imgHeight = maxHeight;
              imgWidth = imgWidth * ratio;
            }
            
            // Dibujar borde alrededor de la imagen
            doc.setDrawColor(this.COLORS.border);
            doc.setLineWidth(0.5);
            doc.rect(xPosition, yPosition, imgWidth, imgHeight);
            
            // Determinar el tipo de imagen basado en la URL o tipo MIME
            let imageFormat = 'PNG';
            if (imageUrl.toLowerCase().includes('.jpg') || imageUrl.toLowerCase().includes('.jpeg')) {
              imageFormat = 'JPEG';
            } else if (imageUrl.toLowerCase().includes('.png')) {
              imageFormat = 'PNG';
            }
            
            // Agregar la imagen al PDF
            doc.addImage(img, imageFormat, xPosition, yPosition, imgWidth, imgHeight);
            
            console.log('✅ Imagen agregada al PDF exitosamente:', {
              url: imageUrl,
              format: imageFormat,
              originalSize: { width: img.width, height: img.height },
              pdfSize: { width: imgWidth, height: imgHeight }
            });
            
            resolve();
          } catch (addImageError) {
            console.error('❌ Error agregando imagen al PDF:', addImageError);
            reject(addImageError);
          }
        };
        
        img.onerror = (error) => {
          console.error('❌ Error cargando imagen (CORS o URL inválida):', error);
          console.error('❌ URL que falló:', imageUrl);
          reject(error);
        };
        
        // Intentar cargar primero sin CORS (para URLs del mismo dominio)
        img.src = imageUrl;
        
        // Si falla, intentar con CORS después de un timeout
        setTimeout(() => {
          if (img.complete && img.naturalHeight === 0) {
            console.log('🔄 Reintentando con CORS...');
            img.crossOrigin = 'anonymous';
            img.src = imageUrl;
          }
        }, 1000);
        
      } catch (error) {
        console.error('❌ Error en addImageToPDF:', error);
        reject(error);
      }
    });
  }

  private static addSignatureSection(doc: jsPDF, signature: { name: string; date: string; signatureImage?: string }, yPosition: number) {
    try {
      if (!signature || !signature.name) return yPosition;

      console.log('addSignatureSection - Datos recibidos:', signature);

      let currentY = yPosition;

      // Verificar si necesitamos nueva página
      if (currentY > doc.internal.pageSize.getHeight() - 100) {
        doc.addPage();
        currentY = 20;
      }

      // Título de la sección
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      doc.text('FIRMA ELECTRÓNICA', 20, currentY);
      currentY += 15;

      // Línea separadora
      doc.setDrawColor(this.COLORS.border);
      doc.line(20, currentY, doc.internal.pageSize.getWidth() - 20, currentY);
      currentY += 20;

      const pageWidth = doc.internal.pageSize.getWidth();

      // Formato profesional como contrato
      // Línea de firma (arriba)
      const signatureLineY = currentY + 25;
      doc.setDrawColor(this.COLORS.border);
      doc.line(20, signatureLineY, pageWidth - 20, signatureLineY);

      // Nombre del firmante (debajo de la línea)
      doc.setFontSize(this.FONTS.normal);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.text);
      
      const signerName = signature.name || 'N/A';
      const nameTextWidth = doc.getTextWidth(signerName);
      doc.text(signerName, (pageWidth - nameTextWidth) / 2, signatureLineY + 8);

      // Fecha de la firma
      const signatureDate = signature.date ? (() => {
        try {
          return new Date(signature.date).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        } catch (dateError) {
          console.warn('Error formateando fecha de firma:', dateError);
          return 'Fecha inválida';
        }
      })() : 'N/A';

      const dateTextWidth = doc.getTextWidth(signatureDate);
      doc.text(signatureDate, (pageWidth - dateTextWidth) / 2, signatureLineY + 16);

      // Imagen de la firma (arriba de la línea)
      if (signature.signatureImage) {
        try {
          console.log('Agregando imagen de firma al PDF');
          
          // Dimensiones para la imagen de firma (arriba de la línea)
          const signatureImgWidth = 60; // Ancho de la imagen de firma
          const signatureImgHeight = 20; // Altura de la imagen de firma
          
          // Posición de la imagen (centrada arriba de la línea)
          const imgX = (pageWidth - signatureImgWidth) / 2;
          const imgY = currentY;
          
          // Agregar la imagen de la firma
          doc.addImage(signature.signatureImage, 'PNG', imgX, imgY, signatureImgWidth, signatureImgHeight);
          console.log('Imagen de firma agregada exitosamente al PDF');
          
        } catch (error) {
          console.error('Error agregando imagen de firma al PDF:', error);
          // Fallback: mostrar texto indicativo
          doc.setFontSize(this.FONTS.small);
          doc.setTextColor(this.COLORS.textLight);
          doc.text('Firma digital incluida', 20, currentY + 10);
        }
      } else {
        // Si no hay imagen, mostrar texto indicativo
        doc.setFontSize(this.FONTS.small);
        doc.setTextColor(this.COLORS.textLight);
        doc.text('Firma digital pendiente', 20, currentY + 10);
      }

      // Texto de autorización (debajo del nombre)
      doc.setFontSize(this.FONTS.small);
      doc.setTextColor(this.COLORS.textLight);
      const authText = 'Firma autorizada';
      const authTextWidth = doc.getTextWidth(authText);
      doc.text(authText, (pageWidth - authTextWidth) / 2, signatureLineY + 24);

      // Espacio final
      currentY = signatureLineY + 40;

      return currentY;
    } catch (error) {
      console.error('Error en addSignatureSection - Datos de firma:', signature);
      console.error('Error detallado:', error);
      // En lugar de lanzar el error, devolver la posición actual para continuar
      return yPosition + 80;
    }
  }

  private static addFooter(doc: jsPDF, platform: Platform) {
    try {
      const pageCount = doc.internal.pages.length - 1;
      const pageWidth = doc.internal.pageSize.getWidth();

      if (pageCount <= 0) {
        console.warn('No hay páginas en el documento PDF');
        return;
      }

      for (let i = 1; i <= pageCount; i++) {
        try {
          doc.setPage(i);
          const pageHeight = doc.internal.pageSize.getHeight();

          // Línea separadora del footer
          doc.setDrawColor(this.COLORS.border);
          doc.setLineWidth(0.5);
          doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

          // Información del footer
          doc.setFontSize(this.FONTS.small);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(this.COLORS.textLight);

          const platformNumber = platform?.platformNumber || 'N/A';
          const footerText = `Reporte de Carga ${platformNumber} | Página ${i} de ${pageCount}`;
          const footerWidth = doc.getTextWidth(footerText);
          const footerX = (pageWidth - footerWidth) / 2;

          doc.text(footerText, footerX, pageHeight - 15);

          // Timestamp
          const timestamp = (() => {
            try {
              return new Date().toLocaleString('es-MX', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
            } catch (dateError) {
              console.warn('Error formateando timestamp del footer:', dateError);
              return new Date().toString();
            }
          })();

          const timestampWidth = doc.getTextWidth(timestamp);
          doc.text(timestamp, pageWidth - 20 - timestampWidth, pageHeight - 15);
        } catch (pageError) {
          console.warn(`Error agregando footer a la página ${i}:`, pageError);
          // Continuar con la siguiente página
        }
      }
    } catch (error) {
      console.error('Error crítico en addFooter:', error);
      // No lanzar error para el footer, ya que no es crítico
    }
  }

  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static async previewReport(options: PDFReportOptions): Promise<string> {
    const blob = await this.generateProfessionalReport(options);
    return URL.createObjectURL(blob);
  }

  static async downloadReport(options: PDFReportOptions, filename?: string): Promise<void> {
    const blob = await this.generateProfessionalReport(options);
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `Reporte_Carga_${options.platform.platformNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}
