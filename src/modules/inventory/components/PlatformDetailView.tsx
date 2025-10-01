import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Download,
  Share2,
  Printer,
  Settings,
  Check,
  Edit3,
  Trash2,
  Package,
  Layers,
  Calendar,
  AlertCircle,
  Undo,
  FileSpreadsheet,
  FileImage
} from 'lucide-react';
import type { Platform } from '../types';
import { useInventory } from '../hooks/useInventory';
import { ExportService } from '../services/exportService';
import { validateLength } from '../utils/calculations';
import { QuickCaptureInput } from './QuickCaptureInput';
import { PiecesTable } from './PiecesTable';
import { ExportMenu } from './ExportMenu';

interface PlatformDetailViewProps {
  platform: Platform;
  onBack: () => void;
}

export const PlatformDetailView: React.FC<PlatformDetailViewProps> = ({
  platform: initialPlatform,
  onBack
}) => {
  const { platforms, updatePlatform, addPiece, addMultiplePieces, updatePiece, deletePiece, changeStandardWidth } = useInventory();
  
  // Obtener la plataforma actualizada desde el estado global
  const platform = platforms.find(p => p.id === initialPlatform.id) || initialPlatform;
  
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastAction, setLastAction] = useState<{ type: 'add' | 'delete'; pieceId?: string } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Función para mostrar notificación
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Manejar agregar pieza
  const handleAddPiece = (length: number) => {
    const validation = validateLength(length);
    if (!validation.valid) {
      showNotification('error', validation.error!);
      return false;
    }

    addPiece(platform.id, length);
    setLastAction({ type: 'add' });
    showNotification('success', `Pieza agregada: ${length.toFixed(2)}m`);
    return true;
  };

  // Manejar agregar múltiples piezas
  const handleAddMultiplePieces = (lengths: number[]) => {
    addMultiplePieces(platform.id, lengths);
    showNotification('success', `${lengths.length} piezas agregadas`);
  };

  // Manejar eliminar pieza
  const handleDeletePiece = (pieceId: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta pieza?')) {
      deletePiece(platform.id, pieceId);
      setLastAction({ type: 'delete', pieceId });
      showNotification('success', 'Pieza eliminada');
    }
  };

  // Manejar deshacer última acción
  const handleUndo = () => {
    if (lastAction?.type === 'add' && platform.pieces.length > 0) {
      const lastPiece = platform.pieces[platform.pieces.length - 1];
      deletePiece(platform.id, lastPiece.id);
      setLastAction(null);
      showNotification('success', 'Acción deshecha');
    }
  };

  // Completar plataforma
  const handleComplete = () => {
    if (platform.pieces.length === 0) {
      showNotification('error', 'Agrega al menos una pieza antes de completar');
      return;
    }

    updatePlatform(platform.id, { status: 'completed' });
    showNotification('success', 'Plataforma marcada como completada');
  };

  // Exportar a PDF
  const handleExportPDF = async () => {
    try {
      setExporting(true);
      await ExportService.printToPDF(platform);
      updatePlatform(platform.id, { status: 'exported' });
      showNotification('success', 'Exportado a PDF exitosamente');
    } catch (error) {
      showNotification('error', 'Error al exportar a PDF');
      console.error(error);
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  // Exportar a Excel
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await ExportService.exportToExcel(platform);
      updatePlatform(platform.id, { status: 'exported' });
      showNotification('success', 'Exportado a Excel exitosamente');
    } catch (error) {
      showNotification('error', 'Error al exportar a Excel');
      console.error(error);
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  // Compartir
  const handleShare = async () => {
    try {
      await ExportService.share(platform);
      showNotification('success', 'Compartido exitosamente');
    } catch (error) {
      showNotification('error', 'No se pudo compartir');
      console.error(error);
    } finally {
      setShowExportMenu(false);
    }
  };

  const statusColors = {
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    exported: 'bg-blue-100 text-blue-800'
  };

  const statusLabels = {
    in_progress: 'En Proceso',
    completed: 'Completada',
    exported: 'Exportada'
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors active:scale-95 self-start"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium text-sm sm:text-base">Volver</span>
            </button>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {lastAction?.type === 'add' && platform.pieces.length > 0 && (
                <button
                  onClick={handleUndo}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex-shrink-0 active:scale-95"
                >
                  <Undo className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">Deshacer</span>
                </button>
              )}

              {platform.status === 'in_progress' && platform.pieces.length > 0 && (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex-shrink-0 active:scale-95"
                >
                  <Check className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">Completar</span>
                </button>
              )}

              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={platform.pieces.length === 0}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  <span className="font-medium text-xs sm:text-sm">Exportar</span>
                </button>

                {showExportMenu && (
                  <ExportMenu
                    onExportPDF={handleExportPDF}
                    onExportExcel={handleExportExcel}
                    onShare={handleShare}
                    onClose={() => setShowExportMenu(false)}
                    exporting={exporting}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Platform Info */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 truncate">
                Plataforma {platform.platformNumber}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center gap-1 truncate">
                  <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{platform.materialType}</span>
                </span>
                <span className="flex items-center gap-1 truncate">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">
                    {new Date(platform.receptionDate).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>{platform.pieces.length} piezas</span>
                </span>
              </div>
            </div>

            <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${statusColors[platform.status]} flex-shrink-0 text-center`}>
              {statusLabels[platform.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Quick Capture */}
          <div className="lg:col-span-1 order-1 lg:order-none">
            <QuickCaptureInput
              standardWidth={platform.standardWidth}
              onAddPiece={handleAddPiece}
              onAddMultiplePieces={handleAddMultiplePieces}
              onChangeWidth={(newWidth) => changeStandardWidth(platform.id, newWidth)}
            />

            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-4 sm:mt-6 border border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Resumen</h3>
              
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex justify-between items-center p-2.5 sm:p-3 bg-blue-50 rounded-lg">
                  <span className="text-xs sm:text-sm text-blue-600 font-medium">Total Piezas</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-900">{platform.pieces.length}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 sm:p-3 bg-purple-50 rounded-lg">
                  <span className="text-xs sm:text-sm text-purple-600 font-medium">Longitud Total</span>
                  <span className="text-xl sm:text-2xl font-bold text-purple-900">{platform.totalLength.toFixed(2)} m</span>
                </div>

                <div className="flex justify-between items-center p-2.5 sm:p-3 bg-green-50 rounded-lg border-2 border-green-300">
                  <span className="text-xs sm:text-sm text-green-600 font-medium">Metros Lineales</span>
                  <span className="text-2xl sm:text-3xl font-bold text-green-900">{platform.totalLinearMeters.toFixed(3)}</span>
                </div>

                <div className="pt-2.5 sm:pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Ancho estándar</span>
                    <span className="font-medium text-gray-700">{platform.standardWidth.toFixed(2)} m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Table */}
          <div className="lg:col-span-2" ref={tableRef}>
            <PiecesTable
              pieces={platform.pieces}
              standardWidth={platform.standardWidth}
              onDeletePiece={handleDeletePiece}
              onUpdatePiece={(pieceId, length) => updatePiece(platform.id, pieceId, length)}
            />
          </div>
        </div>
      </div>

      {/* Notification - Optimizado para móvil */}
      {notification && (
        <div className={`fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-auto px-4 sm:px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <Check className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="font-medium text-sm sm:text-base flex-1">{notification.message}</span>
        </div>
      )}
    </div>
  );
};

