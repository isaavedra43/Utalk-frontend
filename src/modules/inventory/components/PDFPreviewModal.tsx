import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Printer, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { PDFReportService } from '../services/pdfReportService';
import type { Platform, Evidence } from '../types';

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
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [isOpen, platform, signature, includeEvidence]);

  const generatePreview = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validar datos requeridos
      if (!platform || !platform.platformNumber || !platform.pieces) {
        throw new Error('Datos de la plataforma incompletos');
      }

      const pdfOptions = {
        platform,
        signature,
        includeEvidence,
      };

      console.log('Generando PDF con opciones:', pdfOptions);

      const previewUrl = await PDFReportService.previewReport(pdfOptions);
      setPdfUrl(previewUrl);
      console.log('PDF generado exitosamente');
    } catch (err) {
      console.error('Error generando vista previa del PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al generar el PDF';
      setError(`Error al generar la vista previa del PDF: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);

      const pdfOptions = {
        platform,
        signature,
        includeEvidence,
      };

      await PDFReportService.downloadReport(pdfOptions);
    } catch (err) {
      console.error('Error descargando PDF:', err);
      setError('Error al descargar el PDF');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!pdfUrl) return;

    try {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (err) {
      console.error('Error al imprimir:', err);
      setError('Error al imprimir el PDF');
    }
  };

  const handleShare = async () => {
    if (!pdfUrl || !platform) return;

    try {
      const shareData = {
        title: `Reporte de Carga ${platform.platformNumber}`,
        text: `Reporte PDF de la carga ${platform.platformNumber} - Sistema de Inventario`,
        url: pdfUrl,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copiar URL al portapapeles
        await navigator.clipboard.writeText(pdfUrl);
        alert('Enlace del PDF copiado al portapapeles');
      }
    } catch (err) {
      console.error('Error al compartir:', err);
      setError('Error al compartir el PDF');
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
                <div className="flex flex-col items-center gap-3 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                  <p className="text-red-600 font-medium">{error}</p>
                  <button
                    onClick={generatePreview}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reintentar
                  </button>
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

            {/* Información adicional */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Firma electrónica incluida
                </span>
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
