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
    primary: '#1e293b',      // slate-800 - Azul gris oscuro profesional
    secondary: '#0f172a',    // slate-900 - Azul muy oscuro para contraste
    accent: '#3b82f6',       // blue-500 - Azul corporativo
    success: '#059669',      // emerald-600 - Verde profesional
    warning: '#d97706',      // amber-600 - Naranja corporativo
    danger: '#dc2626',       // red-600 - Rojo para alertas
    light: '#f8fafc',        // slate-50 - Fondo muy claro
    lightBlue: '#eff6ff',    // blue-50 - Fondo azul claro
    border: '#cbd5e1',       // slate-300 - Bordes suaves
    borderLight: '#e2e8f0',  // slate-200 - Bordes muy claros
    text: '#1e293b',         // slate-800 - Texto principal
    textSecondary: '#475569', // slate-600 - Texto secundario
    textLight: '#64748b',    // slate-500 - Texto claro
    white: '#ffffff',        // Blanco puro
  };

  private static readonly FONTS = {
    title: 20,
    subtitle: 16,
    heading: 14,
    subheading: 12,
    normal: 11,
    small: 9,
    tiny: 8,
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
          yPosition = this.addEvidenceSection(doc, platform.evidence, yPosition);
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

      // Fondo del header con gradiente sutil
      doc.setFillColor(this.COLORS.lightBlue);
      doc.rect(0, 0, pageWidth, 50, 'F');

      // Línea decorativa superior
      doc.setFillColor(this.COLORS.accent);
      doc.rect(0, 0, pageWidth, 4, 'F');

      // Título principal con diseño profesional
      doc.setFontSize(this.FONTS.title);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      const title = 'REPORTE DE CARGA';
      const titleWidth = doc.getTextWidth(title);
      const titleX = (pageWidth - titleWidth) / 2;
      doc.text(title, titleX, 18);

      // Subtítulo elegante
      doc.setFontSize(this.FONTS.subheading);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.textSecondary);

      const subtitle = 'CUANTIFICACIÓN DE MATERIALES';
      const subtitleWidth = doc.getTextWidth(subtitle);
      const subtitleX = (pageWidth - subtitleWidth) / 2;
      doc.text(subtitle, subtitleX, 26);

      // Información de la carga en caja destacada
      const platformNumber = platform.platformNumber || 'N/A';
      
      // Fondo para la información de la carga
      doc.setFillColor(this.COLORS.white);
      doc.setDrawColor(this.COLORS.border);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, 32, pageWidth - 40, 12, 2, 2, 'FD');

      // Texto de la carga
      doc.setFontSize(this.FONTS.normal);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);
      
      const cargaInfo = `Carga: ${platformNumber}`;
      const cargaInfoWidth = doc.getTextWidth(cargaInfo);
      const cargaInfoX = (pageWidth - cargaInfoWidth) / 2;
      doc.text(cargaInfo, cargaInfoX, 40);

      // Fecha del reporte con estilo profesional
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
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.textLight);
      doc.text(`Fecha del reporte: ${reportDate}`, 20, doc.internal.pageSize.getHeight() - 20);

      // Línea separadora después del header
      doc.setDrawColor(this.COLORS.borderLight);
      doc.setLineWidth(0.5);
      doc.line(20, 52, pageWidth - 20, 52);
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

      // Fondo elegante para la sección
      doc.setFillColor(this.COLORS.light);
      doc.setDrawColor(this.COLORS.borderLight);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, currentY - 5, pageWidth - 30, 85, 4, 4, 'FD');

      // Título de la sección con estilo profesional
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      // Icono decorativo para el título
      doc.setFillColor(this.COLORS.accent);
      doc.circle(25, currentY + 2, 3, 'F');

      doc.text('INFORMACIÓN DE LA CARGA', 32, currentY + 4);
      currentY += 15;

      // Línea separadora elegante
      doc.setDrawColor(this.COLORS.accent);
      doc.setLineWidth(1);
      doc.line(20, currentY, pageWidth - 20, currentY);
      currentY += 8;

      // Información organizada en dos columnas
      doc.setFontSize(this.FONTS.small);
      doc.setFont('helvetica', 'normal');
      
      const leftColumnX = 25;
      const rightColumnX = pageWidth / 2 + 10;
      const lineHeight = 7;
      const columnWidth = (pageWidth - 50) / 2 - 15;

      // Columna izquierda
      const leftInfo = [
        { label: 'Número de Carga:', value: platform.platformNumber || 'N/A' },
        { label: 'Tipo de Plataforma:', value: platform.platformType === 'provider' ? 'Proveedor' : 'Cliente' },
        { label: 'Estado:', value: platform.status === 'in_progress' ? 'En Proceso' :
                                   platform.status === 'completed' ? 'Completada' : 'Exportada' },
        { label: 'Fecha de Recepción:', value: platform.receptionDate ? new Date(platform.receptionDate).toLocaleDateString('es-MX') : 'N/A' },
        { label: 'Materiales:', value: platform.materialTypes && platform.materialTypes.length > 0 ? platform.materialTypes.join(', ') : 'Sin especificar' },
      ];

      // Columna derecha
      const rightInfo = [
        { label: platform.platformType === 'provider' ? 'Proveedor:' : 'Cliente:', value: platform.provider || platform.client || 'No especificado' },
        { label: 'Chofer:', value: platform.driver || 'No especificado' },
        ...(platform.platformType === 'client' && platform.ticketNumber ?
          [{ label: 'Número de Ticket:', value: platform.ticketNumber }] : []),
        { label: 'Observaciones:', value: platform.notes || 'Sin observaciones' },
        { label: 'Creado por:', value: platform.createdByName || platform.createdBy || 'Sistema' },
      ];

      // Renderizar columna izquierda
      leftInfo.forEach((item) => {
        if (currentY > doc.internal.pageSize.getHeight() - 50) {
          doc.addPage();
          currentY = 20;
        }

        // Label en negrita
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(this.COLORS.primary);
        doc.text(`${item.label}`, leftColumnX, currentY);

        // Valor normal
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(this.COLORS.textSecondary);
        const maxWidth = columnWidth - doc.getTextWidth(`${item.label} `) - 5;
        const lines = doc.splitTextToSize(item.value, maxWidth);
        doc.text(lines, leftColumnX + doc.getTextWidth(`${item.label} `) + 5, currentY);

        currentY += lineHeight * Math.max(1, lines.length);
      });

      currentY = yPosition + 23; // Reset para columna derecha

      // Renderizar columna derecha
      rightInfo.forEach((item) => {
        if (currentY > doc.internal.pageSize.getHeight() - 50) {
          doc.addPage();
          currentY = 20;
        }

        // Label en negrita
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(this.COLORS.primary);
        doc.text(`${item.label}`, rightColumnX, currentY);

        // Valor normal
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(this.COLORS.textSecondary);
        const maxWidth = columnWidth - doc.getTextWidth(`${item.label} `) - 5;
        const lines = doc.splitTextToSize(item.value, maxWidth);
        doc.text(lines, rightColumnX + doc.getTextWidth(`${item.label} `) + 5, currentY);

        currentY += lineHeight * Math.max(1, lines.length);
      });

      return currentY + 15;
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
        // Fondo para mensaje de no hay piezas
        doc.setFillColor(this.COLORS.light);
        doc.setDrawColor(this.COLORS.border);
        doc.roundedRect(15, yPosition, doc.internal.pageSize.getWidth() - 30, 20, 4, 4, 'FD');
        
        doc.setFontSize(this.FONTS.normal);
        doc.setTextColor(this.COLORS.danger);
        doc.text('No hay piezas registradas en esta carga.', 20, yPosition + 12);
        return yPosition + 30;
      }

      const pageWidth = doc.internal.pageSize.getWidth();
      let currentY = yPosition;

      // Fondo elegante para la sección de piezas
      const sectionHeight = 60 + (platform.pieces.length * 8);
      doc.setFillColor(this.COLORS.light);
      doc.setDrawColor(this.COLORS.borderLight);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, currentY - 5, pageWidth - 30, sectionHeight, 4, 4, 'FD');

      // Título de la sección con estilo profesional
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      // Icono decorativo para el título
      doc.setFillColor(this.COLORS.accent);
      doc.circle(25, currentY + 2, 3, 'F');

      doc.text('DETALLE DE PIEZAS', 32, currentY + 4);
      currentY += 15;

      // Línea separadora elegante
      doc.setDrawColor(this.COLORS.accent);
      doc.setLineWidth(1);
      doc.line(20, currentY, pageWidth - 20, currentY);
      currentY += 10;

      // Crear tabla elegante con fondo alternado
      const rowHeight = 8;
      const colWidths = [15, 60, 30, 25, 35]; // Anchos de columnas
      const startX = 20;

      // Encabezado de tabla con fondo azul
      doc.setFillColor(this.COLORS.accent);
      doc.roundedRect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight + 2, 3, 3, 'F');

      doc.setFontSize(this.FONTS.small);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.white);

      let currentX = startX;
      const headers = ['No.', 'Material', 'Longitud (m)', 'Ancho (m)', 'Metros Lineales'];
      headers.forEach((header, index) => {
        const align = index > 1 ? 'center' : 'left';
        doc.text(header, currentX + 3, currentY + 6, { align });
        currentX += colWidths[index];
      });

      currentY += rowHeight + 3;

      // Datos de piezas con filas alternadas
      platform.pieces.forEach((piece, index) => {
        if (currentY > doc.internal.pageSize.getHeight() - 50) {
          doc.addPage();
          currentY = 20;

          // Repetir encabezado en nueva página
          doc.setFillColor(this.COLORS.accent);
          doc.roundedRect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight + 2, 3, 3, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(this.COLORS.white);

          currentX = startX;
          headers.forEach((header, headerIndex) => {
            const align = headerIndex > 1 ? 'center' : 'left';
            doc.text(header, currentX + 3, currentY + 6, { align });
            currentX += colWidths[headerIndex];
          });

          currentY += rowHeight + 3;
        }

        // Fondo alternado para filas
        if (index % 2 === 0) {
          doc.setFillColor(this.COLORS.lightBlue);
          doc.roundedRect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight, 2, 2, 'F');
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
          doc.text(data, textX, currentY + 5, { align });
          currentX += colWidths[colIndex];
        });

        currentY += rowHeight;
      });

      // Línea separadora antes del total
      doc.setDrawColor(this.COLORS.border);
      doc.setLineWidth(1);
      doc.line(startX, currentY, startX + colWidths.reduce((a, b) => a + b, 0), currentY);
      currentY += 5;

      // Fila de total elegante
      doc.setFillColor(this.COLORS.success);
      doc.roundedRect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight + 2, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.white);

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
        doc.text(data, textX, currentY + 7, { align });
        currentX += colWidths[colIndex];
      });

      currentY += rowHeight + 8;

      // Resumen destacado con diseño elegante
      if (currentY > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        currentY = 20;
      }

      const summaryText = `METROS TOTALES DE LA CARGA: ${(platform.totalLinearMeters || 0).toFixed(2)} m²`;
      const summaryWidth = doc.getTextWidth(summaryText);
      const summaryX = (pageWidth - summaryWidth) / 2;

      // Fondo elegante con gradiente para el resumen
      doc.setFillColor(this.COLORS.warning);
      doc.roundedRect(summaryX - 15, currentY - 3, summaryWidth + 30, 18, 9, 9, 'F');

      // Borde dorado
      doc.setDrawColor(this.COLORS.warning);
      doc.setLineWidth(1);
      doc.roundedRect(summaryX - 15, currentY - 3, summaryWidth + 30, 18, 9, 9, 'S');

      // Texto del resumen
      doc.setFontSize(this.FONTS.subtitle);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.white);
      doc.text(summaryText, summaryX, currentY + 9);

      return currentY + 30;
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
          const pageHeight = doc.internal.pageSize.getHeight();

          // Fondo elegante para el footer
          doc.setFillColor(this.COLORS.primary);
          doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');

          // Línea decorativa superior
          doc.setDrawColor(this.COLORS.accent);
          doc.setLineWidth(1);
          doc.line(20, pageHeight - 26, pageWidth - 20, pageHeight - 26);

          // Información del footer
          doc.setFontSize(this.FONTS.small);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(this.COLORS.white);

          const platformNumber = platform?.platformNumber || 'N/A';
          const footerText = `Reporte de Carga ${platformNumber} | Página ${i} de ${pageCount}`;
          const footerWidth = doc.getTextWidth(footerText);
          const footerX = (pageWidth - footerWidth) / 2;

          doc.text(footerText, footerX, pageHeight - 18);

          // Información del sistema
          doc.setFontSize(this.FONTS.tiny);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(this.COLORS.lightBlue);

          const systemInfo = 'Sistema de Gestión de Inventario - UTALK © 2025';
          const systemInfoWidth = doc.getTextWidth(systemInfo);
          doc.text(systemInfo, pageWidth - 20 - systemInfoWidth, pageHeight - 8);

          // Timestamp elegante
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

          doc.setFontSize(this.FONTS.tiny);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(this.COLORS.lightBlue);
          doc.text(`Generado: ${timestamp}`, 20, pageHeight - 8);

          // Elementos decorativos
          doc.setFillColor(this.COLORS.accent);
          doc.circle(25, pageHeight - 12, 2, 'F');
          doc.circle(pageWidth - 25, pageHeight - 12, 2, 'F');
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
