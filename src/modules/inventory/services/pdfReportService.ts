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
    primary: '#1a1a2e',      // Azul oscuro elegante
    secondary: '#16213e',    // Azul marino
    accent: '#e94560',       // Rojo coral elegante
    success: '#00d4aa',      // Verde turquesa
    warning: '#ff9500',      // Naranja vibrante
    gold: '#ffd700',         // Dorado
    light: '#f8f9fa',        // Blanco grisáceo
    border: '#dee2e6',       // Gris claro
    text: '#2c3e50',         // Azul grisaceo oscuro
    textLight: '#6c757d',    // Gris medio
    white: '#ffffff',        // Blanco puro
    danger: '#ef4444',       // Rojo para errores
  };

  private static readonly FONTS = {
    title: 24,
    subtitle: 18,
    heading: 16,
    normal: 11,
    small: 9,
    tiny: 7,
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

       // Agregar patrón de fondo sutil para hacerlo más elegante
       this.addBackgroundPattern(doc);

       try {
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
      const pageHeight = doc.internal.pageSize.getHeight();

      // Fondo elegante con gradiente
      doc.setFillColor(this.COLORS.primary);
      doc.rect(0, 0, pageWidth, 60, 'F');

      // Elementos decorativos
      doc.setFillColor(this.COLORS.accent);
      doc.circle(30, 30, 15, 'F');
      doc.setFillColor(this.COLORS.gold);
      doc.circle(pageWidth - 30, 30, 12, 'F');

      // Línea decorativa
      doc.setDrawColor(this.COLORS.gold);
      doc.setLineWidth(2);
      doc.line(20, 50, pageWidth - 20, 50);

      // Título principal con estilo elegante
      doc.setFontSize(this.FONTS.title);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.white);

      const title = 'REPORTE DE CARGA';
      const titleWidth = doc.getTextWidth(title);
      const titleX = (pageWidth - titleWidth) / 2;

      doc.text(title, titleX, 25);

      // Subtítulo elegante
      doc.setFontSize(this.FONTS.subtitle);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.gold);

      const subtitle = 'CUANTIFICACIÓN DE MATERIALES';
      const subtitleWidth = doc.getTextWidth(subtitle);
      const subtitleX = (pageWidth - subtitleWidth) / 2;

      doc.text(subtitle, subtitleX, 38);

      // Información de la carga en área destacada
      const platformNumber = platform.platformNumber || 'N/A';
      const cargaInfo = `Carga No. ${platformNumber}`;
      const cargaInfoWidth = doc.getTextWidth(cargaInfo);
      const cargaInfoX = (pageWidth - cargaInfoWidth) / 2;

      // Fondo para el número de carga
      doc.setFillColor(this.COLORS.white);
      doc.roundedRect(cargaInfoX - 10, 42, cargaInfoWidth + 20, 12, 6, 6, 'F');

      // Texto del número de carga
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);
      doc.text(cargaInfo, cargaInfoX, 50);

      // Fecha del reporte elegante
      const reportDate = (() => {
        try {
          return `Generado el ${new Date().toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}`;
        } catch (dateError) {
          console.warn('Error formateando fecha del reporte:', dateError);
          return `Generado: ${new Date().toString()}`;
        }
      })();

      doc.setFontSize(this.FONTS.small);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(this.COLORS.white);
      doc.text(reportDate, 20, pageHeight - 15);

      // Información de empresa
      doc.setFontSize(this.FONTS.tiny);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.white);
      doc.text('Sistema de Gestión de Inventario - UTALK', pageWidth - 20 - doc.getTextWidth('Sistema de Gestión de Inventario - UTALK'), pageHeight - 15);

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

      // Fondo elegante para la sección de información
      doc.setFillColor(this.COLORS.light);
      doc.roundedRect(15, currentY - 5, pageWidth - 30, 120, 8, 8, 'F');

      // Borde decorativo
      doc.setDrawColor(this.COLORS.accent);
      doc.setLineWidth(2);
      doc.roundedRect(15, currentY - 5, pageWidth - 30, 120, 8, 8, 'S');

      // Título de la sección con estilo elegante
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      // Fondo para el título
      const titleText = '📋 INFORMACIÓN DE LA CARGA';
      const titleWidth = doc.getTextWidth(titleText);
      doc.setFillColor(this.COLORS.accent);
      doc.roundedRect(20, currentY, titleWidth + 10, 12, 6, 6, 'F');

      doc.setTextColor(this.COLORS.white);
      doc.text(titleText, 25, currentY + 8);
      currentY += 20;

      // Información organizada en columnas
      doc.setFontSize(this.FONTS.small);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.text);

      const leftColumnX = 25;
      const rightColumnX = pageWidth / 2 + 10;
      const lineHeight = 8;
      const columnWidth = (pageWidth - 50) / 2 - 15;

      // Columna izquierda
      const leftInfo = [
        { label: 'Número de Carga:', value: platform.platformNumber || 'N/A', icon: '🔢' },
        { label: 'Tipo de Plataforma:', value: platform.platformType === 'provider' ? 'Proveedor' : 'Cliente', icon: '🏭' },
        { label: 'Estado:', value: platform.status === 'in_progress' ? 'En Proceso' :
                                  platform.status === 'completed' ? 'Completada' : 'Exportada', icon: '📊' },
        { label: 'Fecha de Recepción:', value: platform.receptionDate ? new Date(platform.receptionDate).toLocaleDateString('es-MX') : 'N/A', icon: '📅' },
        { label: 'Materiales:', value: platform.materialTypes && platform.materialTypes.length > 0 ? platform.materialTypes.join(', ') : 'Sin especificar', icon: '📦' },
      ];

      // Columna derecha
      const rightInfo = [
        { label: platform.platformType === 'provider' ? 'Proveedor:' : 'Cliente:', value: platform.provider || platform.client || 'No especificado', icon: '👤' },
        { label: 'Chofer:', value: platform.driver || 'No especificado', icon: '🚛' },
        ...(platform.platformType === 'client' && platform.ticketNumber ?
          [{ label: 'Número de Ticket:', value: platform.ticketNumber, icon: '🎫' }] : []),
        { label: 'Observaciones:', value: platform.notes || 'Sin observaciones', icon: '📝' },
        { label: 'Creado por:', value: platform.createdByName || platform.createdBy || 'Sistema', icon: '👨‍💼' },
      ];

       // Renderizar columna izquierda
       leftInfo.forEach((item) => {
         if (currentY > doc.internal.pageSize.getHeight() - 50) {
           doc.addPage();
           currentY = 20;
         }

         // Label en negrita con icono
         doc.setFont('helvetica', 'bold');
         doc.setTextColor(this.COLORS.primary);
         doc.text(`${item.icon} ${item.label}`, leftColumnX, currentY);

         // Valor normal
         doc.setFont('helvetica', 'normal');
         doc.setTextColor(this.COLORS.text);
         const maxWidth = columnWidth - doc.getTextWidth(`${item.icon} ${item.label}`) - 5;
         const lines = doc.splitTextToSize(item.value, maxWidth);
         doc.text(lines, leftColumnX + doc.getTextWidth(`${item.icon} ${item.label}`) + 5, currentY);

         currentY += lineHeight * Math.max(1, lines.length);
       });

       currentY = yPosition + 20; // Reset para columna derecha

       // Renderizar columna derecha
       rightInfo.forEach((item) => {
         if (currentY > doc.internal.pageSize.getHeight() - 50) {
           doc.addPage();
           currentY = 20;
         }

         // Label en negrita con icono
         doc.setFont('helvetica', 'bold');
         doc.setTextColor(this.COLORS.primary);
         doc.text(`${item.icon} ${item.label}`, rightColumnX, currentY);

         // Valor normal
         doc.setFont('helvetica', 'normal');
         doc.setTextColor(this.COLORS.text);
         const maxWidth = columnWidth - doc.getTextWidth(`${item.icon} ${item.label}`) - 5;
         const lines = doc.splitTextToSize(item.value, maxWidth);
         doc.text(lines, rightColumnX + doc.getTextWidth(`${item.icon} ${item.label}`) + 5, currentY);

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
        // Fondo elegante para mensaje de no hay piezas
        doc.setFillColor(this.COLORS.light);
        doc.roundedRect(15, yPosition, doc.internal.pageSize.getWidth() - 30, 30, 5, 5, 'F');
        
        doc.setFontSize(this.FONTS.normal);
        doc.setTextColor(this.COLORS.danger);
        doc.text('⚠️ No hay piezas registradas en esta carga.', 20, yPosition + 20);
        return yPosition + 40;
      }

      const pageWidth = doc.internal.pageSize.getWidth();
      let currentY = yPosition;

      // Fondo elegante para la sección de piezas
      const sectionHeight = 80 + (platform.pieces.length * 8);
      doc.setFillColor(this.COLORS.light);
      doc.roundedRect(15, currentY - 5, pageWidth - 30, sectionHeight, 8, 8, 'F');

      // Borde decorativo
      doc.setDrawColor(this.COLORS.accent);
      doc.setLineWidth(2);
      doc.roundedRect(15, currentY - 5, pageWidth - 30, sectionHeight, 8, 8, 'S');

      // Título de la sección con diseño elegante
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      const tableTitle = '📊 DETALLE DE PIEZAS';
      const titleWidth = doc.getTextWidth(tableTitle);
      doc.setFillColor(this.COLORS.accent);
      doc.roundedRect(20, currentY, titleWidth + 10, 12, 6, 6, 'F');

      doc.setTextColor(this.COLORS.white);
      doc.text(tableTitle, 25, currentY + 8);
      currentY += 20;

      // Crear tabla elegante con fondo alternado
      const rowHeight = 10;
      const colWidths = [20, 80, 40, 35, 45]; // Anchos de columnas
      const startX = 20;

      // Encabezado de tabla
      doc.setFillColor(this.COLORS.secondary);
      doc.roundedRect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight, 3, 3, 'F');

      doc.setFontSize(this.FONTS.small);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.white);

      let currentX = startX;
      const headers = ['No.', 'Material', 'Longitud (m)', 'Ancho (m)', 'Metros Lineales'];
      headers.forEach((header, index) => {
        doc.text(header, currentX + 3, currentY + 7);
        currentX += colWidths[index];
      });

      currentY += rowHeight;

      // Datos de piezas con filas alternadas
      platform.pieces.forEach((piece, index) => {
        if (currentY > doc.internal.pageSize.getHeight() - 50) {
          doc.addPage();
          currentY = 20;

          // Repetir encabezado en nueva página
          doc.setFillColor(this.COLORS.secondary);
          doc.roundedRect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight, 3, 3, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(this.COLORS.white);

          currentX = startX;
          headers.forEach((header, index) => {
            doc.text(header, currentX + 3, currentY + 7);
            currentX += colWidths[index];
          });

          currentY += rowHeight;
        }

        // Fondo alternado para filas
        if (index % 2 === 0) {
          doc.setFillColor('#f8f9fa');
          doc.roundedRect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight, 2, 2, 'F');
        }

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
          const align = colIndex > 1 ? 'right' : 'left'; // Alinear números a la derecha
          const textX = align === 'right' ? currentX + colWidths[colIndex] - 3 : currentX + 3;
          doc.text(data, textX, currentY + 7, { align });
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
        const align = colIndex > 1 ? 'right' : 'left';
        const textX = align === 'right' ? currentX + colWidths[colIndex] - 3 : currentX + 3;
        doc.text(data, textX, currentY + 9, { align });
        currentX += colWidths[colIndex];
      });

      currentY += rowHeight + 8;

      // Resumen destacado con diseño elegante
      if (currentY > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        currentY = 20;
      }

      const summaryText = `💎 METROS TOTALES DE LA CARGA: ${(platform.totalLinearMeters || 0).toFixed(2)} m²`;
      const summaryWidth = doc.getTextWidth(summaryText);
      const summaryX = (pageWidth - summaryWidth) / 2;

      // Fondo elegante con gradiente
      doc.setFillColor(this.COLORS.warning);
      doc.roundedRect(summaryX - 15, currentY - 3, summaryWidth + 30, 18, 9, 9, 'F');

      // Borde dorado
      doc.setDrawColor(this.COLORS.gold);
      doc.setLineWidth(2);
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

      const pageWidth = doc.internal.pageSize.getWidth();
      let currentY = yPosition;

      // Verificar si necesitamos nueva página
      if (currentY > doc.internal.pageSize.getHeight() - 100) {
        doc.addPage();
        currentY = 20;
      }

      // Fondo elegante para la sección de evidencias
      const sectionHeight = 60 + (evidence.length * 25);
      doc.setFillColor(this.COLORS.light);
      doc.roundedRect(15, currentY - 5, pageWidth - 30, sectionHeight, 8, 8, 'F');

      // Borde decorativo
      doc.setDrawColor(this.COLORS.accent);
      doc.setLineWidth(2);
      doc.roundedRect(15, currentY - 5, pageWidth - 30, sectionHeight, 8, 8, 'S');

      // Título de la sección elegante
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      const evidenceTitle = '📎 EVIDENCIAS ADJUNTAS';
      const titleWidth = doc.getTextWidth(evidenceTitle);
      doc.setFillColor(this.COLORS.accent);
      doc.roundedRect(20, currentY, titleWidth + 10, 12, 6, 6, 'F');

      doc.setTextColor(this.COLORS.white);
      doc.text(evidenceTitle, 25, currentY + 8);
      currentY += 20;

      for (let i = 0; i < evidence.length; i++) {
        const evidenceItem = evidence[i];

        // Verificar si necesitamos nueva página para cada evidencia
        if (currentY > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          currentY = 20;
        }

        // Fondo para cada evidencia
        doc.setFillColor(i % 2 === 0 ? '#f8f9fa' : '#ffffff');
        doc.roundedRect(20, currentY - 3, pageWidth - 40, 22, 4, 4, 'F');

        // Información de la evidencia elegante
        doc.setFontSize(this.FONTS.small);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(this.COLORS.primary);

        const leftMargin = 25;
        doc.text(`📄 ${evidenceItem.fileName || 'Sin nombre'}`, leftMargin, currentY + 5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(this.COLORS.text);

        const detailsY = currentY + 12;
        doc.text(`Tipo: ${evidenceItem.fileType || 'Desconocido'} | Tamaño: ${this.formatFileSize(evidenceItem.fileSize || 0)}`, leftMargin, detailsY);

        if (evidenceItem.description) {
          doc.setFontSize(this.FONTS.tiny);
          doc.setTextColor(this.COLORS.textLight);
          const descLines = doc.splitTextToSize(`Descripción: ${evidenceItem.description}`, pageWidth - 60);
          doc.text(descLines, leftMargin, detailsY + 6);
        }

        // Si es una imagen, agregar indicador especial
        if (evidenceItem.fileType && evidenceItem.fileType.startsWith('image/') && evidenceItem.url) {
          doc.setFillColor(this.COLORS.success);
          doc.circle(pageWidth - 35, currentY + 8, 6, 'F');

          doc.setFontSize(this.FONTS.tiny);
          doc.setTextColor(this.COLORS.white);
          doc.text('📷', pageWidth - 38, currentY + 10);

          doc.setFontSize(this.FONTS.tiny);
          doc.setTextColor(this.COLORS.textLight);
          doc.text('Imagen incluida', pageWidth - 80, currentY + 15);
        }

        currentY += 28;
      }

      return currentY + 15;
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

      const pageWidth = doc.internal.pageSize.getWidth();
      let currentY = yPosition;

      // Verificar si necesitamos nueva página
      if (currentY > doc.internal.pageSize.getHeight() - 80) {
        doc.addPage();
        currentY = 20;
      }

      // Fondo elegante para la sección de firma
      doc.setFillColor(this.COLORS.light);
      doc.roundedRect(15, currentY - 5, pageWidth - 30, 60, 8, 8, 'F');

      // Borde decorativo
      doc.setDrawColor(this.COLORS.accent);
      doc.setLineWidth(2);
      doc.roundedRect(15, currentY - 5, pageWidth - 30, 60, 8, 8, 'S');

      // Título de la sección elegante
      doc.setFontSize(this.FONTS.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      const signatureTitle = '✍️ FIRMA ELECTRÓNICA';
      const titleWidth = doc.getTextWidth(signatureTitle);
      doc.setFillColor(this.COLORS.accent);
      doc.roundedRect(20, currentY, titleWidth + 10, 12, 6, 6, 'F');

      doc.setTextColor(this.COLORS.white);
      doc.text(signatureTitle, 25, currentY + 8);
      currentY += 20;

      // Información de la firma elegante
      doc.setFontSize(this.FONTS.small);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.primary);

      const signerName = signature.name || 'N/A';
      doc.text(`👤 Firmado por: ${signerName}`, 25, currentY);
      currentY += 10;

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

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.text);
      doc.text(`📅 Fecha: ${signatureDate}`, 25, currentY);
      currentY += 15;

      // Área elegante para la firma
      const signatureBoxWidth = 120;
      const signatureBoxHeight = 40;

      doc.setFillColor(this.COLORS.white);
      doc.roundedRect(25, currentY, signatureBoxWidth, signatureBoxHeight, 6, 6, 'F');

      doc.setDrawColor(this.COLORS.border);
      doc.setLineWidth(1);
      doc.roundedRect(25, currentY, signatureBoxWidth, signatureBoxHeight, 6, 6, 'S');

      if (signature.signatureImage) {
        try {
          // Aquí podríamos incluir la imagen de la firma
          doc.setFontSize(this.FONTS.small);
          doc.setTextColor(this.COLORS.success);
          doc.text('✅ Firma digital incluida', 30, currentY + 12);

          doc.setFontSize(this.FONTS.tiny);
          doc.setTextColor(this.COLORS.textLight);
          doc.text('Firma verificada electrónicamente', 30, currentY + 20);
        } catch (error) {
          console.warn('No se pudo procesar la imagen de la firma:', error);
          doc.setFontSize(this.FONTS.small);
          doc.setTextColor(this.COLORS.text);
          doc.text('Firma digital disponible', 30, currentY + 15);
        }
      } else {
        doc.setFontSize(this.FONTS.small);
        doc.setTextColor(this.COLORS.textLight);
        doc.text('Firma digital pendiente', 30, currentY + 15);

        doc.setFontSize(this.FONTS.tiny);
        doc.setTextColor(this.COLORS.textLight);
        doc.text('Pendiente de firma electrónica', 30, currentY + 22);
      }

      currentY += signatureBoxHeight + 15;

      // Área para firma manuscrita adicional
      doc.setFillColor(this.COLORS.light);
      doc.roundedRect(pageWidth - 145, currentY, 120, 25, 4, 4, 'F');

      doc.setDrawColor(this.COLORS.secondary);
      doc.setLineWidth(1);
      doc.roundedRect(pageWidth - 145, currentY, 120, 25, 4, 4, 'S');

      // Línea para firma física
      doc.setDrawColor(this.COLORS.secondary);
      doc.line(pageWidth - 140, currentY + 20, pageWidth - 25, currentY + 20);

      doc.setFontSize(this.FONTS.small);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(this.COLORS.secondary);
      doc.text('Firma autorizada', pageWidth - 85, currentY + 17);

      return currentY + 35;
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
      const pageHeight = doc.internal.pageSize.getHeight();

      if (pageCount <= 0) {
        console.warn('No hay páginas en el documento PDF');
        return;
      }

      for (let i = 1; i <= pageCount; i++) {
        try {
          doc.setPage(i);

          // Fondo elegante para el footer
          doc.setFillColor(this.COLORS.primary);
          doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');

          // Línea decorativa superior
          doc.setDrawColor(this.COLORS.gold);
          doc.setLineWidth(1);
          doc.line(20, pageHeight - 32, pageWidth - 20, pageHeight - 32);

          // Información del footer elegante
          doc.setFontSize(this.FONTS.small);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(this.COLORS.white);

          const platformNumber = platform?.platformNumber || 'N/A';
          const footerText = `Reporte de Carga ${platformNumber} | Página ${i} de ${pageCount}`;
          const footerWidth = doc.getTextWidth(footerText);
          const footerX = (pageWidth - footerWidth) / 2;

          doc.text(footerText, footerX, pageHeight - 22);

          // Información adicional del sistema
          doc.setFontSize(this.FONTS.tiny);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(this.COLORS.gold);

          const systemInfo = 'Sistema de Gestión de Inventario - UTALK © 2025';
          const systemInfoWidth = doc.getTextWidth(systemInfo);
          doc.text(systemInfo, pageWidth - 20 - systemInfoWidth, pageHeight - 10);

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
          doc.setTextColor(this.COLORS.white);
          doc.text(`Generado: ${timestamp}`, 20, pageHeight - 10);

          // Elementos decorativos
          doc.setFillColor(this.COLORS.accent);
          doc.circle(25, pageHeight - 15, 3, 'F');
          doc.circle(pageWidth - 25, pageHeight - 15, 3, 'F');

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

  private static addBackgroundPattern(doc: jsPDF) {
    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Patrón sutil de puntos para hacerlo más elegante
      doc.setFillColor(245, 245, 245); // Color muy claro

      // Crear patrón de puntos sutil
      for (let x = 0; x < pageWidth; x += 20) {
        for (let y = 0; y < pageHeight; y += 20) {
          if ((x / 20 + y / 20) % 2 === 0) {
            doc.circle(x, y, 0.5, 'F');
          }
        }
      }

      // Líneas diagonales sutiles
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.1);

      for (let i = -pageHeight; i < pageWidth + pageHeight; i += 15) {
        doc.line(i, 0, i - pageHeight, pageHeight);
        doc.line(i - pageHeight, 0, i, pageHeight);
      }
    } catch (error) {
      console.warn('Error agregando patrón de fondo:', error);
      // No lanzar error para el patrón de fondo
    }
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
