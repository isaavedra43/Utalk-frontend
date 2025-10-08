import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Printer, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { PDFReportService } from '../services/pdfReportService';
import type { Platform } from '../types';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: Platform;
  signature?: {
    name: string;
    date: string;
    signatureImage?: string;
  };
  includeEvidence: boolean;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  platform,
  signature,
  includeEvidence,
}: PDFPreviewModalProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('PDFPreviewModal - Iniciando generación de vista previa');
      console.log('Datos de plataforma:', {
        id: platform?.id,
        platformNumber: platform?.platformNumber,
        piecesCount: platform?.pieces?.length,
        evidenceCount: platform?.evidence?.length,
        hasSignature: !!signature?.name
      });

      // Validar datos requeridos
      if (!platform) {
        throw new Error('No se proporcionaron datos de la plataforma');
      }

      if (!platform.platformNumber) {
        throw new Error('Número de plataforma no válido');
      }

      if (!platform.pieces || !Array.isArray(platform.pieces)) {
        throw new Error('Lista de piezas no válida');
      }

      const pdfOptions = {
        platform,
        signature,
        includeEvidence,
      };

      console.log('Generando PDF con opciones:', pdfOptions);

      const previewUrl = await PDFReportService.previewReport(pdfOptions);
      setPdfUrl(previewUrl);
      console.log('Vista previa del PDF generada exitosamente');
    } catch (err) {
      console.error('Error generando vista previa del PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al generar el PDF';
      setError(`Error al generar la vista previa del PDF: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [platform, signature, includeEvidence]);

  useEffect(() => {
    if (isOpen && platform) {
      generatePreview();
    }

    return () => {
      // Limpiar URL del PDF cuando se cierra el modal
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, platform, signature, includeEvidence, generatePreview, pdfUrl]);


  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('PDFPreviewModal - Iniciando descarga de PDF');

      if (!platform) {
        throw new Error('No se proporcionaron datos de la plataforma');
      }

      const pdfOptions = {
        platform,
        signature,
        includeEvidence,
      };

      await PDFReportService.downloadReport(pdfOptions);
      console.log('PDF descargado exitosamente');
    } catch (err) {
      console.error('Error descargando PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al descargar el PDF';
      setError(`Error al descargar el PDF: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!pdfUrl) {
      setError('No hay PDF disponible para imprimir');
      return;
    }

    try {
      console.log('PDFPreviewModal - Iniciando impresión de PDF');

      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          try {
            printWindow.print();
            console.log('Impresión iniciada exitosamente');
          } catch (printError) {
            console.error('Error durante la impresión:', printError);
            setError('Error durante la impresión del PDF');
          }
        };

        // Timeout por si la ventana no carga
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 10000);
      } else {
        throw new Error('No se pudo abrir la ventana de impresión');
      }
    } catch (err) {
      console.error('Error al imprimir:', err);
      setError('Error al imprimir el PDF. Verifica que los pop-ups estén habilitados.');
    }
  };

  const handleShare = async () => {
    if (!pdfUrl || !platform) {
      setError('No hay PDF disponible para compartir');
      return;
    }

    try {
      console.log('PDFPreviewModal - Iniciando compartir PDF');

      const shareData = {
        title: `Reporte de Carga ${platform.platformNumber || 'N/A'}`,
        text: `Reporte PDF de la carga ${platform.platformNumber || 'N/A'} - Sistema de Inventario`,
        url: pdfUrl,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        console.log('PDF compartido exitosamente vía Web Share API');
      } else {
        // Fallback: copiar URL al portapapeles
        try {
          await navigator.clipboard.writeText(pdfUrl);
          alert('✅ Enlace del PDF copiado al portapapeles. Puedes compartirlo manualmente.');
          console.log('URL del PDF copiada al portapapeles');
        } catch (clipboardError) {
          console.error('Error copiando al portapapeles:', clipboardError);
          alert('Error copiando el enlace. Puedes compartir manualmente desde la barra de direcciones.');
        }
      }
    } catch (err) {
      console.error('Error al compartir:', err);
      setError('Error al compartir el PDF. Puedes intentar descargar el archivo directamente.');
    }
  };

  const handleClose = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Vista Previa - Reporte PDF
              </h3>
              <span className="text-sm text-gray-500">
                Carga {platform.platformNumber}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600">Generando vista previa...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3 text-center max-w-md px-4">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                  <div>
                    <p className="text-red-600 font-medium mb-2">Error generando el PDF</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Se produjo un error al generar el reporte PDF. Esto puede deberse a datos incompletos o problemas técnicos.
                    </p>
                    <details className="text-left mb-4">
                      <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                        Ver detalles del error
                      </summary>
                      <p className="text-xs text-gray-500 mt-2 font-mono bg-gray-50 p-2 rounded">
                        {error}
                      </p>
                    </details>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={generatePreview}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Reintentar
                    </button>
                    <button
                      onClick={() => setError(null)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            ) : pdfUrl ? (
              <div className="h-96 bg-gray-100">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title="Vista previa del PDF"
                />
              </div>
            ) : null}
          </div>

          {/* Footer con acciones */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={handleShare}
                disabled={!pdfUrl}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Compartir</span>
              </button>

              <button
                onClick={handlePrint}
                disabled={!pdfUrl}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Printer className="h-4 w-4" />
                <span className="text-sm">Imprimir</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={!pdfUrl || loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">Descargar PDF</span>
              </button>

              <button
                onClick={handleClose}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm">Cerrar</span>
              </button>
            </div>

             {/* Información adicional con diseño elegante */}
             <div className="mt-3 pt-3 border-t border-gray-200">
               <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-3">
                 <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 mb-2">
                   <span className="text-lg">✨</span>
                   <span>Diseño Profesional Premium</span>
                   <span className="text-lg">✨</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                   <div className="flex items-center gap-1">
                     <span className="text-green-500">🎨</span>
                     <span>Colores corporativos</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <span className="text-blue-500">📊</span>
                     <span>Tablas elegantes</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <span className="text-purple-500">📋</span>
                     <span>Información organizada</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <span className="text-orange-500">🏆</span>
                     <span>Diseño premium</span>
                   </div>
                 </div>
               </div>

               <div className="flex items-center gap-4 text-xs text-gray-500">
                 {signature && (
                   <span className="flex items-center gap-1">
                     <CheckCircle className="h-3 w-3 text-green-500" />
                     Firma electrónica incluida
                   </span>
                 )}
                 {includeEvidence && (
                   <span className="flex items-center gap-1">
                     <CheckCircle className="h-3 w-3 text-green-500" />
                     Evidencias incluídas
                   </span>
                 )}
                 <span className="flex items-center gap-1">
                   <CheckCircle className="h-3 w-3 text-green-500" />
                   Información completa de la carga
                 </span>
               </div>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
