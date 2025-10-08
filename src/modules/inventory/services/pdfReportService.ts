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

      // Validar datos requeridos
      if (!platform) {
        throw new Error('Plataforma no proporcionada');
      }

      if (!platform.platformNumber) {
        throw new Error('Número de plataforma no válido');
      }

      if (!platform.pieces || !Array.isArray(platform.pieces)) {
        throw new Error('Lista de piezas no válida');
      }

      console.log('Iniciando generación de PDF para plataforma:', platform.platformNumber);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let yPosition = 20;

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

      console.log('PDF generado exitosamente');
      return doc.output('blob');
    } catch (error) {
      console.error('Error en generateProfessionalReport:', error);
      throw error;
    }
  }

  private static addHeader(doc: jsPDF, platform: Platform) {
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

    const cargaInfo = `Carga: ${platform.platformNumber}`;
    const cargaInfoWidth = doc.getTextWidth(cargaInfo);
    const cargaInfoX = (pageWidth - cargaInfoWidth) / 2;

    doc.text(cargaInfo, cargaInfoX, 30);

    // Fecha del reporte
    const reportDate = `Fecha del reporte: ${new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    doc.setFontSize(this.FONTS.small);
    doc.text(reportDate, 20, 40);
  }

  private static addPlatformInfo(doc: jsPDF, platform: Platform, yPosition: number) {
    try {
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

      // Información en formato de tabla
      doc.setFontSize(this.FONTS.normal);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.text);

      const infoData = [
        ['Número de Carga', platform.platformNumber || 'N/A'],
        ['Tipo de Plataforma', platform.platformType === 'provider' ? 'Proveedor' : 'Cliente'],
        ['Estado', platform.status === 'in_progress' ? 'En Proceso' :
                  platform.status === 'completed' ? 'Completada' : 'Exportada'],
        ['Fecha de Recepción', platform.receptionDate ? new Date(platform.receptionDate).toLocaleDateString('es-MX') : 'N/A'],
        ['Materiales', platform.materialTypes && platform.materialTypes.length > 0 ? platform.materialTypes.join(', ') : 'Sin especificar'],
        [platform.platformType === 'provider' ? 'Proveedor' : 'Cliente',
         platform.provider || platform.client || 'No especificado'],
        ['Chofer', platform.driver || 'No especificado'],
        ...(platform.platformType === 'client' && platform.ticketNumber ?
          [['Número de Ticket', platform.ticketNumber]] : []),
        ['Observaciones', platform.notes || 'Sin observaciones'],
        ['Creado por', platform.createdByName || platform.createdBy || 'Sistema'],
      ];

      doc.autoTable({
        startY: currentY,
        head: [],
        body: infoData,
        theme: 'plain',
        styles: {
          fontSize: this.FONTS.normal,
          cellPadding: 3,
        },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: this.COLORS.light, textColor: this.COLORS.primary, cellWidth: 40 },
          1: { textColor: this.COLORS.text, cellWidth: 'auto' },
        },
        margin: { left: 20, right: 20 },
        tableWidth: pageWidth - 40,
      });

      return (doc.lastAutoTable?.finalY || currentY) + 15;
    } catch (error) {
      console.error('Error en addPlatformInfo:', error);
      throw error;
    }
  }

  private static addPiecesTable(doc: jsPDF, platform: Platform, yPosition: number) {
    try {
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

      // Preparar datos de la tabla
      const tableData = platform.pieces.map((piece, index) => [
        (index + 1).toString(),
        piece.material || 'Sin especificar',
        (piece.length || 0).toFixed(2),
        (piece.standardWidth || 0).toFixed(2),
        (piece.linearMeters || 0).toFixed(3),
      ]);

      // Agregar fila de totales
      tableData.push([
        'TOTAL',
        '',
        (platform.totalLength || 0).toFixed(2),
        (platform.standardWidth || 0).toFixed(2),
        (platform.totalLinearMeters || 0).toFixed(3),
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['No.', 'Material', 'Longitud (m)', 'Ancho (m)', 'Metros Lineales']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: this.COLORS.secondary,
          textColor: 'white',
          fontSize: this.FONTS.normal,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: this.FONTS.small,
          cellPadding: 4,
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 50 },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
        },
        alternateRowStyles: {
          fillColor: this.COLORS.light,
        },
        footStyles: {
          fillColor: this.COLORS.success,
          textColor: 'white',
          fontStyle: 'bold',
        },
        margin: { left: 20, right: 20 },
        tableWidth: doc.internal.pageSize.getWidth() - 40,
        didParseCell: function(data) {
          // Colorear la fila de totales
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fillColor = [16, 185, 129]; // emerald-500
            data.cell.styles.textColor = 'white';
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });

      // Agregar resumen destacado
      const summaryY = (doc.lastAutoTable?.finalY || yPosition) + 15;

      doc.setFontSize(this.FONTS.subtitle);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.warning);

      const summaryText = `METROS TOTALES DE LA CARGA: ${(platform.totalLinearMeters || 0).toFixed(2)} m²`;
      const summaryWidth = doc.getTextWidth(summaryText);
      const summaryX = (doc.internal.pageSize.getWidth() - summaryWidth) / 2;

      // Fondo del resumen
      doc.setFillColor(251, 191, 36, 0.1); // amber-200 con opacidad
      doc.rect(summaryX - 5, summaryY - 5, summaryWidth + 10, 12, 'F');

      doc.text(summaryText, summaryX, summaryY + 3);

      return summaryY + 25;
    } catch (error) {
      console.error('Error en addPiecesTable:', error);
      throw error;
    }
  }

  private static addEvidenceSection(doc: jsPDF, evidence: Evidence[], yPosition: number): number {
    try {
      if (!evidence || !Array.isArray(evidence) || evidence.length === 0) return yPosition;

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

        // Información de la evidencia
        doc.setFontSize(this.FONTS.small);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(this.COLORS.text);

        const evidenceInfo = [
          ['Archivo', evidenceItem.fileName || 'Sin nombre'],
          ['Tipo', evidenceItem.fileType || 'Desconocido'],
          ['Tamaño', this.formatFileSize(evidenceItem.fileSize || 0)],
          ...(evidenceItem.description ? [['Descripción', evidenceItem.description]] : []),
        ];

        doc.autoTable({
          startY: currentY,
          head: [],
          body: evidenceInfo,
          theme: 'plain',
          styles: {
            fontSize: this.FONTS.small,
            cellPadding: 2,
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 25, fillColor: this.COLORS.light },
            1: { cellWidth: 'auto' },
          },
          margin: { left: 20, right: 20 },
          tableWidth: doc.internal.pageSize.getWidth() - 40,
        });

        currentY = (doc.lastAutoTable?.finalY || currentY) + 10;

        // Si es una imagen, intentar incluirla
        if (evidenceItem.fileType && evidenceItem.fileType.startsWith('image/') && evidenceItem.url) {
          try {
            // Aquí podríamos incluir la imagen si tenemos acceso a ella
            // Por ahora, agregamos una nota
            doc.setFontSize(this.FONTS.small);
            doc.setTextColor(this.COLORS.textLight);
            doc.text('📷 Imagen adjunta disponible en el archivo original', 25, currentY);
            currentY += 8;
          } catch (error) {
            console.warn('No se pudo incluir la imagen en el PDF:', error);
          }
        }
      }

      return currentY + 10;
    } catch (error) {
      console.error('Error en addEvidenceSection:', error);
      throw error;
    }
  }

  private static addSignatureSection(doc: jsPDF, signature: { name: string; date: string; signatureImage?: string }, yPosition: number) {
    try {
      if (!signature || !signature.name) return yPosition;

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

      doc.text(`Firmado por: ${signature.name || 'N/A'}`, 20, currentY);
      currentY += 8;

      const signatureDate = signature.date ? new Date(signature.date).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) : 'N/A';

      doc.text(`Fecha: ${signatureDate}`, 20, currentY);
      currentY += 15;

      // Área para la firma
      doc.setDrawColor(this.COLORS.border);
      doc.rect(20, currentY, 80, 30);

      if (signature.signatureImage) {
        try {
          // Aquí podríamos incluir la imagen de la firma
          doc.text('Firma digital', 25, currentY + 10);
        } catch (error) {
          console.warn('No se pudo incluir la imagen de la firma:', error);
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
      doc.text(authText, (pageWidth - doc.getTextWidth(authText)) / 2, currentY + 8);

      return currentY + 20;
    } catch (error) {
      console.error('Error en addSignatureSection:', error);
      throw error;
    }
  }

  private static addFooter(doc: jsPDF, platform: Platform) {
    try {
      const pageCount = doc.internal.pages.length - 1;
      const pageWidth = doc.internal.pageSize.getWidth();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Línea separadora del footer
        doc.setDrawColor(this.COLORS.border);
        doc.line(20, doc.internal.pageSize.getHeight() - 25, pageWidth - 20, doc.internal.pageSize.getHeight() - 25);

        // Información del footer
        doc.setFontSize(this.FONTS.small);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(this.COLORS.textLight);

        const platformNumber = platform.platformNumber || 'N/A';
        const footerText = `Reporte generado automáticamente - Carga ${platformNumber} - Página ${i} de ${pageCount}`;
        const footerWidth = doc.getTextWidth(footerText);
        const footerX = (pageWidth - footerWidth) / 2;

        doc.text(footerText, footerX, doc.internal.pageSize.getHeight() - 15);

        // Timestamp en la esquina inferior derecha
        const timestamp = new Date().toLocaleString('es-MX');
        doc.text(timestamp, pageWidth - 20 - doc.getTextWidth(timestamp), doc.internal.pageSize.getHeight() - 15);
      }
    } catch (error) {
      console.error('Error en addFooter:', error);
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
