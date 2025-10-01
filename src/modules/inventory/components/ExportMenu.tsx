import React from 'react';
import { FileText, FileSpreadsheet, Share2, Printer, Loader2 } from 'lucide-react';

interface ExportMenuProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  onShare: () => void;
  onClose: () => void;
  exporting: boolean;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExportPDF,
  onExportExcel,
  onShare,
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
      <div className="absolute right-0 sm:mt-2 w-full sm:w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2 max-w-xs sm:max-w-none">
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
            <p className="text-xs text-gray-500 truncate">Generar documento imprimible</p>
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

        <div className="border-t border-gray-200 my-2"></div>

        <button
          onClick={onShare}
          disabled={exporting}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100"
        >
          <Share2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Compartir</p>
            <p className="text-xs text-gray-500 truncate">Compartir vía apps</p>
          </div>
        </button>
      </div>
    </>
  );
};

