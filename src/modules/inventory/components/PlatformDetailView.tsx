import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
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
  User,
  Camera
} from 'lucide-react';
import type { Platform, Evidence } from '../types';
import { useInventory } from '../hooks/useInventory';
import { SimpleExportService } from '../services/simpleExportService';
import { EvidenceUpload } from './EvidenceUpload';
import { validateLength } from '../utils/calculations';
import { QuickCaptureInput } from './QuickCaptureInput';
import { PiecesTable } from './PiecesTable';

interface PlatformDetailViewProps {
  platform: Platform;
  onBack: () => void;
}

export const PlatformDetailView: React.FC<PlatformDetailViewProps> = ({
  platform: initialPlatform,
  onBack
}: PlatformDetailViewProps) => {
  const { platforms, updatePlatform, deletePlatform, addPiece, addMultiplePieces, updatePiece, deletePiece, changeStandardWidth, syncPendingPlatforms, syncStatus, updatePlatformEvidence } = useInventory();
  
  // Obtener la plataforma actualizada desde el estado global
  const platform = platforms.find((p: Platform) => p.id === initialPlatform.id) || initialPlatform;
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lastAction, setLastAction] = useState<{ type: 'add' | 'delete'; pieceId?: string } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showEvidenceSection, setShowEvidenceSection] = useState(false);
  const [exporting, setExporting] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Función para mostrar notificación
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Función para eliminar plataforma
  const handleDeletePlatform = async () => {
    try {
      await deletePlatform(platform.id);
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
    }
  };

  // Función para compartir
  const handleShare = async () => {
    try {
      // Generar texto para compartir
      const shareText = generateShareText(platform);
      
      // Verificar si el navegador soporta Web Share API
      if (navigator.share) {
        // Crear archivos para compartir
        const files = await createShareFiles(platform);
        
        // Compartir con archivos
        await navigator.share({
          title: `Plataforma ${platform.platformNumber}`,
          text: shareText,
          files: files
        });
        
        showNotification('success', 'Compartido exitosamente');
      } else {
        // Fallback: mostrar opciones de compartir
        showShareOptions(platform, shareText);
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      // Fallback: mostrar opciones de compartir
      showShareOptions(platform, generateShareText(platform));
    }
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

  // Crear archivos para compartir
  const createShareFiles = async (platform: Platform): Promise<File[]> => {
    const files: File[] = [];
    
    try {
      // Crear archivo CSV
      const csvContent = generateCSVContent(platform);
      const csvBlob = new Blob([csvContent], { type: 'text/csv' });
      const csvFile = new File([csvBlob], `Plataforma_${platform.platformNumber}_${getDateString()}.csv`, { type: 'text/csv' });
      files.push(csvFile);
      
      // Crear archivo de imagen
      const imageBlob = await createImageBlob(platform);
      if (imageBlob) {
        const imageFile = new File([imageBlob], `Plataforma_${platform.platformNumber}_${getDateString()}.png`, { type: 'image/png' });
        files.push(imageFile);
      }
    } catch (error) {
      console.error('Error creando archivos:', error);
    }
    
    return files;
  };

  // Generar contenido CSV
  const generateCSVContent = (platform: Platform): string => {
    const rows: string[] = [];
    
    // Encabezados
    rows.push('No.,Material,Longitud (m),Ancho (m),Metros Lineales');
    
    // Datos
    platform.pieces.forEach(piece => {
      rows.push([
        piece.number,
        `"${piece.material}"`,
        piece.length.toFixed(2),
        piece.standardWidth.toFixed(2),
        piece.linearMeters.toFixed(3)
      ].join(','));
    });
    
    // Totales
    rows.push('');
    rows.push([
      'TOTAL',
      '—',
      platform.totalLength.toFixed(2),
      platform.standardWidth.toFixed(2),
      platform.totalLinearMeters.toFixed(3)
    ].join(','));
    
    return rows.join('\n');
  };

  // Crear imagen como blob
  const createImageBlob = async (platform: Platform): Promise<Blob | null> => {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = 800;
        canvas.height = 600;
        
        // Fondo blanco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Título
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Plataforma ${platform.platformNumber}`, canvas.width / 2, 40);
        
        // Información básica
        ctx.font = '16px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(`Materiales: ${platform.materialTypes.join(', ')}`, canvas.width / 2, 70);
        ctx.fillText(`Proveedor: ${platform.provider}`, canvas.width / 2, 95);
        ctx.fillText(`Chofer: ${platform.driver}`, canvas.width / 2, 120);
        
        // Tabla simplificada
        let y = 160;
        const rowHeight = 25;
        
        // Encabezados
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('No.', 50, y);
        ctx.fillText('Material', 100, y);
        ctx.fillText('Longitud', 250, y);
        ctx.fillText('Metros Lineales', 450, y);
        
        y += rowHeight;
        
        // Datos
        ctx.fillStyle = '#374151';
        ctx.font = '14px Arial';
        
        platform.pieces.forEach((piece) => {
          ctx.fillText(piece.number.toString(), 50, y);
          ctx.fillText(piece.material.substring(0, 15), 100, y);
          ctx.fillText(piece.length.toFixed(2), 250, y);
          ctx.fillText(piece.linearMeters.toFixed(3), 450, y);
          y += rowHeight;
        });
        
        // Totales
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('TOTAL', 50, y);
        ctx.fillText(platform.totalLength.toFixed(2), 250, y);
        ctx.fillText(platform.totalLinearMeters.toFixed(3), 450, y);
        
        // Resumen
        y += 40;
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`METROS TOTALES DE LA CARGA: ${platform.totalLinearMeters.toFixed(2)} m²`, canvas.width / 2, y);
        
        // Convertir a blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
        
      } catch (error) {
        console.error('Error creando imagen:', error);
        resolve(null);
      }
    });
  };

  // Mostrar opciones de compartir (fallback)
  const showShareOptions = (platform: Platform, shareText: string) => {
    // Crear modal de opciones de compartir
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    `;
    
    content.innerHTML = `
      <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: bold; color: #1f2937;">Compartir Plataforma ${platform.platformNumber}</h3>
      
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button id="share-whatsapp" style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background-color: #25D366;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        " onmouseover="this.style.backgroundColor='#20b358'" onmouseout="this.style.backgroundColor='#25D366'">
          📱 WhatsApp
        </button>
        
        <button id="share-email" style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        " onmouseover="this.style.backgroundColor='#2563eb'" onmouseout="this.style.backgroundColor='#3b82f6'">
          📧 Email
        </button>
        
        <button id="share-sms" style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        " onmouseover="this.style.backgroundColor='#059669'" onmouseout="this.style.backgroundColor='#10b981'">
          💬 SMS
        </button>
        
        <button id="share-copy" style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background-color: #6b7280;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        " onmouseover="this.style.backgroundColor='#4b5563'" onmouseout="this.style.backgroundColor='#6b7280'">
          📋 Copiar Texto
        </button>
        
        <button id="share-close" style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background-color: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        " onmouseover="this.style.backgroundColor='#dc2626'" onmouseout="this.style.backgroundColor='#ef4444'">
          ❌ Cerrar
        </button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('share-whatsapp')?.addEventListener('click', () => {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
      document.body.removeChild(modal);
    });
    
    document.getElementById('share-email')?.addEventListener('click', () => {
      const subject = `Plataforma ${platform.platformNumber} - Cuantificación de Metros Lineales`;
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`;
      window.open(mailtoUrl);
      document.body.removeChild(modal);
    });
    
    document.getElementById('share-sms')?.addEventListener('click', () => {
      const smsUrl = `sms:?body=${encodeURIComponent(shareText)}`;
      window.open(smsUrl);
      document.body.removeChild(modal);
    });
    
    document.getElementById('share-copy')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(shareText);
        showNotification('success', 'Texto copiado al portapapeles');
      } catch {
        showNotification('error', 'Error al copiar texto');
      }
      document.body.removeChild(modal);
    });
    
    document.getElementById('share-close')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };

  // Función auxiliar para obtener fecha
  const getDateString = (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const statusColors: Record<string, string> = {
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    exported: 'bg-blue-100 text-blue-800'
  };

  const statusLabels: Record<string, string> = {
    in_progress: 'En Proceso',
    completed: 'Completada',
    exported: 'Exportada'
  };

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto pb-24 sm:pb-6">
      {/* Header - OPTIMIZADO PARA MÓVIL */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          {/* VISTA MÓVIL: Header compacto */}
          <div className="block lg:hidden">
            {/* Primera fila: Navegación */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 rounded-xl shadow-sm hover:from-gray-100 hover:to-gray-200 hover:shadow-md transition-all duration-200 active:scale-95 active:shadow-lg"
              >
                <div className="p-1 bg-gray-100 rounded-lg">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">Volver</span>
              </button>

              <span className={`px-3 py-1.5 rounded-2xl text-xs font-bold ${statusColors[platform.status]} text-center shadow-sm border`}>
                {statusLabels[platform.status]}
              </span>
            </div>

            {/* Segunda fila: Acciones principales - OPTIMIZADO SIN SCROLL */}
            <div className="space-y-3 mt-3">
              {/* Fila 1: Botones prioritarios con mejor espaciado */}
              <div className="flex items-center justify-between gap-3">
                {platform.status === 'in_progress' && platform.pieces.length > 0 && (
                  <button
                    onClick={handleComplete}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-600 rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transition-all duration-200 active:scale-95 active:shadow-2xl"
                  >
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-semibold">Completar</span>
                  </button>
                )}

                <div className="flex flex-col items-end">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 rounded-lg shadow-sm hover:from-red-100 hover:to-red-200 hover:shadow-md transition-all duration-200 active:scale-95 active:shadow-lg"
                    title="⚠️ Eliminar plataforma permanentemente"
                  >
                    <Trash className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">Eliminar</span>
                  </button>
                  <span className="text-xs text-red-500 mt-1 text-right">
                    ⚠️ Acción irreversible
                  </span>
                </div>
              </div>

              {/* Fila 2: Botones secundarios (solo si existen) */}
              {lastAction?.type === 'add' && platform.pieces.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUndo}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200 rounded-xl shadow-sm hover:from-orange-100 hover:to-orange-200 hover:shadow-md transition-all duration-200 active:scale-95 active:shadow-lg"
                    title="Deshacer última acción"
                  >
                    <Undo className="h-4 w-4" />
                    <span className="text-sm font-semibold">Deshacer</span>
                  </button>
                  
                  {/* Espacio vacío para mantener consistencia */}
                  <div className="flex-1"></div>
                </div>
              )}

              {/* Fila 3: Botones de Exportación y Evidencias */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  disabled={platform.pieces.length === 0 || exporting}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 rounded-xl shadow-sm hover:from-green-100 hover:to-green-200 hover:shadow-md transition-all duration-200 active:scale-95 active:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Exportar a Excel"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="text-sm font-semibold">Excel</span>
                </button>

                <button
                  onClick={handleExportPDF}
                  disabled={platform.pieces.length === 0 || exporting}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 rounded-xl shadow-sm hover:from-red-100 hover:to-red-200 hover:shadow-md transition-all duration-200 active:scale-95 active:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Exportar a PDF"
                >
                  <Printer className="h-4 w-4" />
                  <span className="text-sm font-semibold">PDF</span>
                </button>

                <button
                  onClick={() => setShowEvidenceSection(!showEvidenceSection)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl shadow-sm hover:from-indigo-100 hover:to-indigo-200 hover:shadow-md transition-all duration-200 active:scale-95 active:shadow-lg"
                  title="Gestionar Evidencias"
                >
                  <Camera className="h-4 w-4" />
                  <span className="text-sm font-semibold">Evidencias</span>
                </button>
              </div>
            </div>
          </div>

          {/* VISTA DESKTOP: Header original */}
          <div className="hidden lg:block">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 rounded-xl shadow-sm hover:from-gray-100 hover:to-gray-200 hover:shadow-md transition-all duration-200 active:scale-95 active:shadow-lg self-start"
              >
                <div className="p-1 bg-gray-100 rounded-lg">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm sm:text-base">Volver</span>
              </button>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {lastAction?.type === 'add' && platform.pieces.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200 rounded-xl shadow-sm hover:from-orange-100 hover:to-orange-200 hover:shadow-md transition-all duration-200 flex-shrink-0 active:scale-95 active:shadow-lg"
                  >
                    <div className="p-1 bg-orange-100 rounded-lg">
                      <Undo className="h-4 w-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">Deshacer</span>
                  </button>
                )}

                {platform.status === 'in_progress' && platform.pieces.length > 0 && (
                  <button
                    onClick={handleComplete}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-600 rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transition-all duration-200 flex-shrink-0 active:scale-95 active:shadow-2xl"
                  >
                    <div className="p-1 bg-green-600 rounded-lg">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">Completar</span>
                  </button>
                )}

                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 rounded-lg shadow-sm hover:from-red-100 hover:to-red-200 hover:shadow-md transition-all duration-200 flex-shrink-0 active:scale-95 active:shadow-lg"
                    title="⚠️ Eliminar plataforma permanentemente"
                  >
                    <Trash className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">Eliminar</span>
                  </button>
                  <span className="text-xs text-red-500 mt-1 text-center">
                    ⚠️ Irreversible
                  </span>
                </div>

                {/* Botones de Exportación y Evidencias */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={handleExportExcel}
                    disabled={platform.pieces.length === 0 || exporting}
                    className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:shadow-2xl disabled:active:scale-100"
                    title="Exportar a Excel (CSV)"
                  >
                    <div className="p-1.5 bg-green-600 rounded-xl">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                  </button>
                  
                  <button
                    onClick={handleExportPDF}
                    disabled={platform.pieces.length === 0 || exporting}
                    className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:shadow-2xl disabled:active:scale-100"
                    title="Exportar a PDF"
                  >
                    <div className="p-1.5 bg-red-600 rounded-xl">
                      <Printer className="h-4 w-4" />
                    </div>
                  </button>
                  
                  <button
                    onClick={handleExportImage}
                    disabled={platform.pieces.length === 0 || exporting}
                    className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg hover:from-purple-600 hover:to-purple-700 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:shadow-2xl disabled:active:scale-100"
                    title="Exportar como Imagen"
                  >
                    <div className="p-1.5 bg-purple-600 rounded-xl">
                      <FileImage className="h-4 w-4" />
                    </div>
                  </button>

                  {/* Botón de Evidencias */}
                  <button
                    onClick={() => setShowEvidenceSection(!showEvidenceSection)}
                    className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-lg hover:from-indigo-600 hover:to-indigo-700 hover:shadow-xl transition-all duration-200 active:scale-95 active:shadow-2xl"
                    title="Gestionar Evidencias"
                  >
                    <div className="p-1.5 bg-indigo-600 rounded-xl">
                      <Camera className="h-4 w-4" />
                    </div>
                  </button>

                  {/* Botón de Compartir */}
                  <button
                    onClick={handleShare}
                    disabled={platform.pieces.length === 0}
                    className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:shadow-2xl disabled:active:scale-100"
                    title="Compartir tabla en WhatsApp, Email, SMS, etc."
                  >
                    <div className="p-1.5 bg-blue-600 rounded-xl">
                      <span className="text-lg">📤</span>
                    </div>
                  </button>
                </div>
          </div>
        </div>
      </div>

      {/* Indicador de Sincronización */}
      {platform.needsSync && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200 px-3 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm text-orange-700 font-medium">
                Esta plataforma necesita sincronización
              </span>
            </div>
            {syncStatus.isOnline && (
              <button
                onClick={() => {
                  updatePlatform(platform.id, {});
                  syncPendingPlatforms();
                }}
                className="text-xs text-orange-600 hover:text-orange-800 font-medium underline"
              >
                Sincronizar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Platform Info - VISTA MÓVIL ULTRA COMPACTA */}
          <div className="block lg:hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
              <h1 className="text-lg font-bold text-gray-900 mb-2">
                Plataforma {platform.platformNumber}
              </h1>
              
              {/* Información ultra compacta en una sola línea */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                  <span className="truncate max-w-[120px]">
                    {platform.materialTypes.length > 0 
                      ? platform.materialTypes.join(', ')
                      : 'Sin materiales'
                    }
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  <span>
                    {new Date(platform.receptionDate).toLocaleDateString('es-MX', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                  <span>{platform.pieces.length} pz</span>
                </div>

                <div className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                  <span className="truncate max-w-[100px]">{platform.provider || 'Sin prov.'}</span>
                </div>

                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-teal-500 flex-shrink-0" />
                  <span className="truncate max-w-[80px]">{platform.driver || 'Sin chofer'}</span>
                </div>

                {platform.createdBy && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Edit className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-xs">Creada por: {platform.createdBy}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Platform Info - VISTA DESKTOP */}
          <div className="hidden lg:block">
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
      </div>

      {/* Barra de botones de exportar fija - Solo en móvil */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30 p-3">
        <div className="flex justify-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={platform.pieces.length === 0 || exporting}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:shadow-2xl disabled:active:scale-100"
            title="Exportar a Excel"
          >
            <FileSpreadsheet className="h-6 w-6" />
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={platform.pieces.length === 0 || exporting}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:shadow-2xl disabled:active:scale-100"
            title="Exportar a PDF"
          >
            <Printer className="h-6 w-6" />
          </button>
          
          <button
            onClick={handleExportImage}
            disabled={platform.pieces.length === 0 || exporting}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg hover:from-purple-600 hover:to-purple-700 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:shadow-2xl disabled:active:scale-100"
            title="Exportar como Imagen"
          >
            <FileImage className="h-6 w-6" />
          </button>

          <button
            onClick={handleShare}
            disabled={platform.pieces.length === 0}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:shadow-2xl disabled:active:scale-100"
            title="Compartir"
          >
            <span className="text-xl">📤</span>
          </button>
        </div>
      </div>

      {/* Main Content - VISTA MÓVIL OPTIMIZADA */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* VISTA MÓVIL: Capturador primero, luego tabla */}
        <div className="block lg:hidden">
          {/* 1. CAPTURADOR RÁPIDO - PRIMERO EN MÓVIL */}
          <div className="mb-3">
            <QuickCaptureInput
              standardWidth={platform.standardWidth}
              availableMaterials={platform.materialTypes}
              onAddPiece={handleAddPiece}
              onAddMultiplePieces={handleAddMultiplePieces}
              onChangeWidth={(newWidth: number) => changeStandardWidth(platform.id, newWidth)}
            />
          </div>

          {/* 2. RESUMEN COMPACTO - SEGUNDO EN MÓVIL */}
          <div className="bg-white rounded-xl shadow-lg p-3 mb-3 border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
              📊 Resumen
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">Total Piezas</div>
                <div className="text-xl font-bold text-blue-900">{platform.pieces.length}</div>
              </div>

              <div className="bg-purple-50 rounded-lg p-2 text-center">
                <div className="text-xs text-purple-600 font-medium mb-1">Longitud Total</div>
                <div className="text-xl font-bold text-purple-900">{platform.totalLength.toFixed(2)} m</div>
              </div>

              <div className="bg-green-50 rounded-lg p-2 text-center border-2 border-green-300">
                <div className="text-xs text-green-600 font-medium mb-1">Metros Lineales</div>
                <div className="text-xl font-bold text-green-900">{platform.totalLinearMeters.toFixed(3)}</div>
              </div>

              <div className="bg-orange-50 rounded-lg p-2 text-center border-2 border-orange-300">
                <div className="text-xs text-orange-600 font-medium mb-1">Metros Totales</div>
                <div className="text-xl font-bold text-orange-900">{platform.totalLinearMeters.toFixed(2)} m²</div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-200 text-center">
              <span className="text-xs text-gray-500">
                Ancho estándar: <span className="font-semibold text-gray-700">{platform.standardWidth.toFixed(2)} m</span>
              </span>
            </div>
          </div>

          {/* 3. TABLA DE PIEZAS - TERCERO EN MÓVIL */}
          <div ref={tableRef}>
            <PiecesTable
              pieces={platform.pieces}
              standardWidth={platform.standardWidth}
              onDeletePiece={handleDeletePiece}
              onUpdatePiece={(pieceId: string, updates: Partial<{ length: number; material: string; standardWidth: number }>) => updatePiece(platform.id, pieceId, updates)}
            />
          </div>
        </div>

        {/* VISTA DESKTOP: Layout original */}
        <div className="hidden lg:grid grid-cols-3 gap-6">
          {/* Left Column - Quick Capture */}
          <div className="col-span-1">
            <QuickCaptureInput
              standardWidth={platform.standardWidth}
              availableMaterials={platform.materialTypes}
              onAddPiece={handleAddPiece}
              onAddMultiplePieces={handleAddMultiplePieces}
              onChangeWidth={(newWidth: number) => changeStandardWidth(platform.id, newWidth)}
            />

            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-600 font-medium">Total Piezas</span>
                  <span className="text-2xl font-bold text-blue-900">{platform.pieces.length}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-purple-600 font-medium">Longitud Total</span>
                  <span className="text-2xl font-bold text-purple-900">{platform.totalLength.toFixed(2)} m</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-2 border-green-300">
                  <span className="text-sm text-green-600 font-medium">Metros Lineales</span>
                  <span className="text-3xl font-bold text-green-900">{platform.totalLinearMeters.toFixed(3)}</span>
                </div>

                {/* METROS TOTALES DE LA CARGA - DESTACADO */}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-2 border-orange-300 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-base text-orange-700 font-semibold">Metros Totales de la Carga</span>
                  </div>
                  <span className="text-3xl font-bold text-orange-800">{platform.totalLinearMeters.toFixed(2)} m²</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Ancho estándar</span>
                    <span className="font-medium text-gray-700">{platform.standardWidth.toFixed(2)} m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Table */}
          <div className="col-span-2" ref={tableRef}>
            <PiecesTable
              pieces={platform.pieces}
              standardWidth={platform.standardWidth}
              onDeletePiece={handleDeletePiece}
              onUpdatePiece={(pieceId: string, updates: Partial<{ length: number; material: string; standardWidth: number }>) => updatePiece(platform.id, pieceId, updates)}
            />
          </div>
        </div>
      </div>

      {/* Sección de Evidencias - Solo visible cuando se activa */}
      {showEvidenceSection && (
        <div className="mt-8">
          <EvidenceUpload
            platformId={platform.id}
            providerId={platform.providerId}  // ⭐ AGREGADO - Requerido por backend
            existingEvidence={platform.evidence || []}
            onEvidenceUpdated={(evidence: Evidence[]) => updatePlatformEvidence(platform.id, evidence)}
          />
        </div>
      )}

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

