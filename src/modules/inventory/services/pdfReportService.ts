import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Platform, Evidence } from '../types';

// Extend the jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
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
    primary: '#1f2937',      // gray-800
    secondary: '#3b82f6',    // blue-500
    success: '#10b981',      // emerald-500
    warning: '#f59e0b',      // amber-500
    danger: '#ef4444',       // red-500
    light: '#f9fafb',        // gray-50
    border: '#e5e7eb',       // gray-200
    text: '#374151',         // gray-700
    textLight: '#6b7280',    // gray-500
  };

  private static readonly FONTS = {
    title: 18,
    subtitle: 16,
    heading: 14,
    normal: 10,
    small: 8,
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

      let yPosition = 20;

      try {
        // Header del reporte
        this.addHeader(doc, platform);
        yPosition += 30;

        // Información general de la carga
        yPosition = this.addPlatformInfo(doc, platform, yPosition);

        // Tabla de piezas
        yPosition = this.addPiecesTable(doc, platform, yPosition);

        // Evidencias (si están habilitadas)
        if (includeEvidence && platform.evidence && Array.isArray(platform.evidence) && platform.evidence.length > 0) {
          yPosition = this.addEvidenceSection(doc, platform.evidence, yPosition);
        }

        // Firma electrónica
        if (signature && signature.name) {
          yPosition = this.addSignatureSection(doc, signature, yPosition);
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
          throw new Error(`Error crítico generando PDF: ${fallbackError.message}`);
        }
      }
    } catch (error) {
      console.error('Error crítico en generateProfessionalReport:', error);
      throw new Error(`Error generando reporte PDF: ${error.message || 'Error desconocido'}`);
    }
  }

  private static addHeader(doc: jsPDF, platform: Platform) {
    try {
      const pageWidth = doc.internal.pageSize.getWidth();

      // Logo o título principal
      doc.setFontSize(this.FONTS.title);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      const title = 'REPORTE DE CARGA - CUANTIFICACIÓN DE MATERIALES';
      const titleWidth = doc.getTextWidth(title);
      const titleX = (pageWidth - titleWidth) / 2;

      doc.text(title, titleX, 20);

      // Información de la carga
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.text);

      const platformNumber = platform.platformNumber || 'N/A';
      const cargaInfo = `Carga: ${platformNumber}`;
      const cargaInfoWidth = doc.getTextWidth(cargaInfo);
      const cargaInfoX = (pageWidth - cargaInfoWidth) / 2;

      doc.text(cargaInfo, cargaInfoX, 30);

      // Fecha del reporte
      const reportDate = (() => {
        try {
          return `Fecha del reporte: ${new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}`;
        } catch (dateError) {
          console.warn('Error formateando fecha del reporte:', dateError);
          return `Fecha del reporte: ${new Date().toString()}`;
        }
      })();

      doc.setFontSize(this.FONTS.small);
      doc.text(reportDate, 20, 40);
    } catch (error) {
      console.error('Error en addHeader:', error);
      // No lanzar error para el header, ya que no es crítico
    }
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

      // Título de la sección
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      doc.text('INFORMACIÓN DE LA CARGA', 20, currentY);
      currentY += 10;

      // Línea separadora
      doc.setDrawColor(this.COLORS.border);
      doc.line(20, currentY, pageWidth - 20, currentY);
      currentY += 8;

      // Información en formato de tabla - usando texto simple en lugar de autoTable para evitar problemas
      doc.setFontSize(this.FONTS.small);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.text);

      const lineHeight = 6;
      const leftMargin = 25;
      const rightMargin = pageWidth - 25;

      // Crear información básica como texto simple
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

      infoLines.forEach((line, index) => {
        if (currentY > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage();
          currentY = 20;
        }
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
        doc.setTextColor(this.COLORS.danger);
        doc.text('No hay piezas registradas en esta carga.', 20, yPosition);
        return yPosition + 20;
      }

      // Título de la sección
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      doc.text('DETALLE DE PIEZAS', 20, yPosition);
      yPosition += 10;

      // Línea separadora
      doc.setDrawColor(this.COLORS.border);
      doc.line(20, yPosition, doc.internal.pageSize.getWidth() - 20, yPosition);
      yPosition += 10;

      // Usar texto simple en lugar de tabla para evitar problemas con autoTable
      doc.setFontSize(this.FONTS.small);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.text);

      const lineHeight = 6;
      const leftMargin = 25;

      // Crear encabezado de tabla simple
      if (yPosition > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('No.  Material                    Longitud    Ancho    Metros Lineales', leftMargin, yPosition);
      yPosition += lineHeight + 2;

      // Línea separadora
      doc.setDrawColor(this.COLORS.border);
      doc.line(leftMargin, yPosition, doc.internal.pageSize.getWidth() - 20, yPosition);
      yPosition += lineHeight;

      // Datos de piezas
      platform.pieces.forEach((piece, index) => {
        if (yPosition > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage();
          yPosition = 20;

          // Repetir encabezado en nueva página
          doc.setFont('helvetica', 'bold');
          doc.text('No.  Material                    Longitud    Ancho    Metros Lineales', leftMargin, yPosition);
          yPosition += lineHeight + 2;
          doc.setDrawColor(this.COLORS.border);
          doc.line(leftMargin, yPosition, doc.internal.pageSize.getWidth() - 20, yPosition);
          yPosition += lineHeight;
        }

        doc.setFont('helvetica', 'normal');
        const pieceLine = `${(index + 1).toString().padEnd(3)} ${piece.material?.substring(0, 25)?.padEnd(25) || 'Sin especificar'.padEnd(25)} ${(piece.length || 0).toFixed(2).padStart(8)}   ${(piece.standardWidth || 0).toFixed(2).padStart(6)}   ${(piece.linearMeters || 0).toFixed(3).padStart(12)}`;
        doc.text(pieceLine, leftMargin, yPosition);
        yPosition += lineHeight;
      });

      // Línea separadora antes del total
      if (yPosition > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setDrawColor(this.COLORS.border);
      doc.line(leftMargin, yPosition, doc.internal.pageSize.getWidth() - 20, yPosition);
      yPosition += lineHeight;

      // Total destacado
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.success);
      const totalLine = `TOTAL${''.padEnd(28)}${(platform.totalLength || 0).toFixed(2).padStart(8)}   ${(platform.standardWidth || 0).toFixed(2).padStart(6)}   ${(platform.totalLinearMeters || 0).toFixed(3).padStart(12)}`;
      doc.text(totalLine, leftMargin, yPosition);
      yPosition += lineHeight + 5;

      // Resumen destacado
      if (yPosition > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(this.FONTS.subtitle);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.warning);

      const summaryText = `METROS TOTALES DE LA CARGA: ${(platform.totalLinearMeters || 0).toFixed(2)} m²`;
      const summaryWidth = doc.getTextWidth(summaryText);
      const summaryX = (doc.internal.pageSize.getWidth() - summaryWidth) / 2;

      // Fondo del resumen
      doc.setFillColor(251, 191, 36, 0.1); // amber-200 con opacidad
      doc.rect(summaryX - 5, yPosition - 5, summaryWidth + 10, 12, 'F');

      doc.text(summaryText, summaryX, yPosition + 3);

      return yPosition + 25;
    } catch (error) {
      console.error('Error en addPiecesTable - Datos de piezas:', platform.pieces);
      console.error('Error detallado:', error);
      // En lugar de lanzar el error, devolver la posición actual para continuar
      return yPosition + 50;
    }
  }

  private static addEvidenceSection(doc: jsPDF, evidence: Evidence[], yPosition: number): number {
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
        if (currentY > doc.internal.pageSize.getHeight() - 60) {
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

        // Si es una imagen, agregar nota
        if (evidenceItem.fileType && evidenceItem.fileType.startsWith('image/') && evidenceItem.url) {
          if (currentY > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage();
            currentY = 20;
          }
          doc.setFontSize(this.FONTS.small);
          doc.setTextColor(this.COLORS.textLight);
          doc.text('📷 Imagen adjunta disponible en el archivo original', leftMargin, currentY);
          currentY += lineHeight + 5;
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

  private static addSignatureSection(doc: jsPDF, signature: { name: string; date: string; signatureImage?: string }, yPosition: number) {
    try {
      if (!signature || !signature.name) return yPosition;

      console.log('addSignatureSection - Datos recibidos:', signature);

      let currentY = yPosition;

      // Verificar si necesitamos nueva página
      if (currentY > doc.internal.pageSize.getHeight() - 80) {
        doc.addPage();
        currentY = 20;
      }

      // Título de la sección
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      doc.text('FIRMA ELECTRÓNICA', 20, currentY);
      currentY += 10;

      // Línea separadora
      doc.setDrawColor(this.COLORS.border);
      doc.line(20, currentY, doc.internal.pageSize.getWidth() - 20, currentY);
      currentY += 15;

      const pageWidth = doc.internal.pageSize.getWidth();

      // Información de la firma
      doc.setFontSize(this.FONTS.normal);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.text);

      const signerName = signature.name || 'N/A';
      doc.text(`Firmado por: ${signerName}`, 20, currentY);
      currentY += 8;

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

      doc.text(`Fecha: ${signatureDate}`, 20, currentY);
      currentY += 15;

      // Área para la firma
      doc.setDrawColor(this.COLORS.border);
      doc.rect(20, currentY, 80, 30);

      if (signature.signatureImage) {
        try {
          // Aquí podríamos incluir la imagen de la firma
          doc.setFontSize(this.FONTS.small);
          doc.setTextColor(this.COLORS.text);
          doc.text('Firma digital incluida', 25, currentY + 10);
        } catch (error) {
          console.warn('No se pudo procesar la imagen de la firma:', error);
          doc.setFontSize(this.FONTS.small);
          doc.setTextColor(this.COLORS.textLight);
          doc.text('Firma digital disponible', 25, currentY + 10);
        }
      } else {
        doc.setFontSize(this.FONTS.small);
        doc.setTextColor(this.COLORS.textLight);
        doc.text('Firma digital pendiente', 25, currentY + 10);
      }

      currentY += 40;

      // Línea para firma manuscrita (si fuera física)
      doc.setDrawColor(this.COLORS.secondary);
      doc.line(120, currentY, pageWidth - 20, currentY);

      doc.setFontSize(this.FONTS.small);
      doc.setTextColor(this.COLORS.secondary);
      const authText = 'Firma autorizada';
      const authTextWidth = doc.getTextWidth(authText);
      doc.text(authText, (pageWidth - authTextWidth) / 2, currentY + 8);

      return currentY + 20;
    } catch (error) {
      console.error('Error en addSignatureSection - Datos de firma:', signature);
      console.error('Error detallado:', error);
      // En lugar de lanzar el error, devolver la posición actual para continuar
      return yPosition + 50;
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

          // Línea separadora del footer
          doc.setDrawColor(this.COLORS.border);
          doc.line(20, doc.internal.pageSize.getHeight() - 25, pageWidth - 20, doc.internal.pageSize.getHeight() - 25);

          // Información del footer
          doc.setFontSize(this.FONTS.small);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(this.COLORS.textLight);

          const platformNumber = platform?.platformNumber || 'N/A';
          const footerText = `Reporte generado automáticamente - Carga ${platformNumber} - Página ${i} de ${pageCount}`;
          const footerWidth = doc.getTextWidth(footerText);
          const footerX = (pageWidth - footerWidth) / 2;

          doc.text(footerText, footerX, doc.internal.pageSize.getHeight() - 15);

          // Timestamp en la esquina inferior derecha
          const timestamp = (() => {
            try {
              return new Date().toLocaleString('es-MX');
            } catch (dateError) {
              console.warn('Error formateando timestamp del footer:', dateError);
              return new Date().toString();
            }
          })();

          const timestampWidth = doc.getTextWidth(timestamp);
          doc.text(timestamp, pageWidth - 20 - timestampWidth, doc.internal.pageSize.getHeight() - 15);
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
