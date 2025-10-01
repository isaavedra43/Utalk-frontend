import React from 'react';
import { FileText, FileSpreadsheet, Share2, Image, Loader2, Download } from 'lucide-react';

interface ExportMenuProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  onExportImage: () => void;
  onShareText: () => void;
  onShareImage: () => void;
  onSharePDF: () => void;
  onShareExcel: () => void;
  onClose: () => void;
  exporting: boolean;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExportPDF,
  onExportExcel,
  onExportImage,
  onShareText,
  onShareImage,
  onSharePDF,
  onShareExcel,
  onClose,
  exporting
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Menu - OPTIMIZADO PARA MÓVIL */}
      <div className="absolute right-0 sm:mt-2 w-full sm:w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2 max-w-xs sm:max-w-none max-h-96 overflow-y-auto">
        {/* SECCIÓN EXPORTAR */}
        <div className="px-3 py-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Descargar</h4>
        </div>
        
        <button
          onClick={onExportPDF}
          disabled={exporting}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100"
        >
          {exporting ? (
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
          ) : (
            <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Exportar a PDF</p>
            <p className="text-xs text-gray-500 truncate">Documento imprimible</p>
          </div>
        </button>

        <button
          onClick={onExportExcel}
          disabled={exporting}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100"
        >
          {exporting ? (
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
          ) : (
            <FileSpreadsheet className="h-5 w-5 text-green-600 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Exportar a Excel</p>
            <p className="text-xs text-gray-500 truncate">Formato CSV para Excel</p>
          </div>
        </button>

        <button
          onClick={onExportImage}
          disabled={exporting}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100"
        >
          {exporting ? (
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
          ) : (
            <Image className="h-5 w-5 text-purple-600 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Exportar como Imagen</p>
            <p className="text-xs text-gray-500 truncate">PNG de alta calidad</p>
          </div>
        </button>

        <div className="border-t border-gray-200 my-2"></div>

        {/* SECCIÓN COMPARTIR */}
        <div className="px-3 py-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Compartir</h4>
        </div>

        <button
          onClick={onShareText}
          disabled={exporting}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100"
        >
          <Share2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Compartir como Texto</p>
            <p className="text-xs text-gray-500 truncate">Resumen por WhatsApp, etc.</p>
          </div>
        </button>

        <button
          onClick={onShareImage}
          disabled={exporting}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100"
        >
          <Image className="h-5 w-5 text-purple-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Compartir Imagen</p>
            <p className="text-xs text-gray-500 truncate">PNG por apps sociales</p>
          </div>
        </button>

        <button
          onClick={onSharePDF}
          disabled={exporting}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100"
        >
          <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Compartir PDF</p>
            <p className="text-xs text-gray-500 truncate">Documento por email</p>
          </div>
        </button>

        <button
          onClick={onShareExcel}
          disabled={exporting}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100"
        >
          <FileSpreadsheet className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Compartir Excel</p>
            <p className="text-xs text-gray-500 truncate">CSV por email</p>
          </div>
        </button>
      </div>
    </>
  );
};

