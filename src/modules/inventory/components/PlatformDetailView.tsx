import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Download,
  Printer,
  Check,
  Edit,
  Trash,
  Package,
  Layers,
  Calendar,
  AlertCircle,
  Undo,
  FileSpreadsheet,
  FileImage,
  Truck,
  User
} from 'lucide-react';
import type { Platform } from '../types';
import { useInventory } from '../hooks/useInventory';
import { SimpleExportService } from '../services/simpleExportService';
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
  const { platforms, updatePlatform, deletePlatform, addPiece, addMultiplePieces, updatePiece, deletePiece, changeStandardWidth } = useInventory();
  
  // Obtener la plataforma actualizada desde el estado global
  const platform = platforms.find(p => p.id === initialPlatform.id) || initialPlatform;
  
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lastAction, setLastAction] = useState<{ type: 'add' | 'delete'; pieceId?: string } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Función para mostrar notificación
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Función para eliminar plataforma
  const handleDeletePlatform = () => {
    try {
      deletePlatform(platform.id);
      showNotification('success', 'Plataforma eliminada exitosamente');
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (error) {
      showNotification('error', 'Error al eliminar la plataforma');
      console.error(error);
    }
    setShowDeleteModal(false);
  };

  // Manejar agregar pieza
  const handleAddPiece = (length: number, material: string) => {
    const validation = validateLength(length);
    if (!validation.valid) {
      showNotification('error', validation.error!);
      return false;
    }

    addPiece(platform.id, length, material);
    setLastAction({ type: 'add' });
    showNotification('success', `Pieza agregada: ${length.toFixed(2)}m`);
    return true;
  };

  // Manejar agregar múltiples piezas
  const handleAddMultiplePieces = (pieces: { length: number; material: string }[]) => {
    addMultiplePieces(platform.id, pieces);
    showNotification('success', `${pieces.length} piezas agregadas`);
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
  const handleExportPDF = () => {
    try {
      setExporting(true);
      SimpleExportService.exportToPDF(platform);
      updatePlatform(platform.id, { status: 'exported' });
      showNotification('success', 'Exportado a PDF exitosamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      showNotification('error', 'Error al exportar a PDF');
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    try {
      setExporting(true);
      SimpleExportService.exportToCSV(platform);
      updatePlatform(platform.id, { status: 'exported' });
      showNotification('success', 'Exportado a Excel (CSV) exitosamente');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      showNotification('error', 'Error al exportar a Excel');
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  // Exportar como Imagen
  const handleExportImage = () => {
    try {
      setExporting(true);
      SimpleExportService.exportToImage(platform);
      updatePlatform(platform.id, { status: 'exported' });
      showNotification('success', 'Exportado como imagen exitosamente');
    } catch (error) {
      console.error('Error al exportar imagen:', error);
      showNotification('error', 'Error al exportar como imagen');
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  // Compartir como Texto
  const handleShareText = () => {
    try {
      const text = generateShareText(platform);
      if (navigator.share) {
        navigator.share({
          title: `Plataforma ${platform.platformNumber}`,
          text: text
        });
      } else {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(text).then(() => {
          showNotification('success', 'Texto copiado al portapapeles');
        });
      }
    } catch (error) {
      showNotification('error', 'Error al compartir texto');
      console.error(error);
    }
    setShowExportMenu(false);
  };

  // Compartir como Imagen
  const handleShareImage = () => {
    handleExportImage(); // Usar la función de exportar imagen
  };

  // Compartir como PDF
  const handleSharePDF = () => {
    handleExportPDF(); // Usar la función de exportar PDF
  };

  // Compartir como Excel
  const handleShareExcel = () => {
    handleExportExcel(); // Usar la función de exportar Excel
  };

  // Generar texto para compartir
  const generateShareText = (platform: Platform): string => {
    return `📊 Cuantificación de Metros Lineales
🏭 Plataforma: ${platform.platformNumber}
📦 Materiales: ${platform.materialTypes.join(', ')}
🚛 Proveedor: ${platform.provider}
👤 Chofer: ${platform.driver}
📅 Fecha: ${new Date(platform.receptionDate).toLocaleDateString('es-MX')}
📏 Total Piezas: ${platform.pieces.length}
📐 Longitud Total: ${platform.totalLength.toFixed(2)} m
📊 Metros Lineales: ${platform.totalLinearMeters.toFixed(3)} m
🚛 METROS TOTALES DE LA CARGA: ${platform.totalLinearMeters.toFixed(2)} m²
📏 Ancho Estándar: ${platform.standardWidth.toFixed(2)} m

Detalle por pieza:
${platform.pieces.map(p => `• Pieza ${p.number}: ${p.material} - ${p.length.toFixed(2)}m → ${p.linearMeters.toFixed(3)} m²`).join('\n')}

Generado por Sistema de Inventario`;
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
    <div className="h-screen bg-gray-50 overflow-y-auto pb-20 sm:pb-6">
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

                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 active:scale-95"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="text-xs sm:text-sm font-medium">Eliminar</span>
                      </button>

                      {/* Botones de Exportación Rápida */}
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={handleExportExcel}
                          disabled={platform.pieces.length === 0 || exporting}
                          className="flex items-center gap-1 px-2 py-2.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                          title="Exportar a Excel (CSV)"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={handleExportPDF}
                          disabled={platform.pieces.length === 0 || exporting}
                          className="flex items-center gap-1 px-2 py-2.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                          title="Exportar a PDF"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={handleExportImage}
                          disabled={platform.pieces.length === 0 || exporting}
                          className="flex items-center gap-1 px-2 py-2.5 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                          title="Exportar como Imagen"
                        >
                          <FileImage className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Menú de Exportación Completo */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => setShowExportMenu(!showExportMenu)}
                          disabled={platform.pieces.length === 0}
                          className="flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                          title="Más opciones de exportación"
                        >
                          <Download className="h-4 w-4" />
                          <span className="font-medium text-xs sm:text-sm hidden sm:inline">Más</span>
                        </button>

                        {showExportMenu && (
                          <ExportMenu
                            onExportPDF={handleExportPDF}
                            onExportExcel={handleExportExcel}
                            onExportImage={handleExportImage}
                            onShareText={handleShareText}
                            onShareImage={handleShareImage}
                            onSharePDF={handleSharePDF}
                            onShareExcel={handleShareExcel}
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
                  <span className="truncate">
                    {platform.materialTypes.length > 0 
                      ? platform.materialTypes.join(', ')
                      : 'Sin materiales'
                    }
                  </span>
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
                {platform.createdBy && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Creada por: {platform.createdBy}</span>
                  </span>
                )}
              </div>
              
              {/* Información adicional del proveedor y chofer */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-2">
                <span className="flex items-center gap-1 truncate">
                  <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Proveedor: {platform.provider || 'No especificado'}</span>
                </span>
                <span className="flex items-center gap-1 truncate">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Chofer: {platform.driver || 'No especificado'}</span>
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
              availableMaterials={platform.materialTypes}
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

                {/* METROS TOTALES DE LA CARGA - DESTACADO */}
                <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-2 border-orange-300 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm sm:text-base text-orange-700 font-semibold">Metros Totales de la Carga</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold text-orange-800">{platform.totalLinearMeters.toFixed(2)} m²</span>
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
              onUpdatePiece={(pieceId, updates) => updatePiece(platform.id, pieceId, updates)}
            />
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowDeleteModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">Eliminar Plataforma</h3>
                  <p className="text-sm text-gray-500 mt-1">Esta acción no se puede deshacer</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-700">
                  ¿Estás seguro de que quieres eliminar la plataforma <strong>"{platform.platformNumber}"</strong>?
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Se eliminarán todas las piezas registradas ({platform.pieces.length} piezas) y sus datos.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeletePlatform}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors active:scale-95"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

