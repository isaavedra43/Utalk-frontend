// ============================================================================
// MODAL DE OPCIONES DE EXPORTACIÓN PARA REPORTES DE ASISTENCIA
// ============================================================================

import React, { useState } from 'react';
import {
  Download,
  FileText,
  Table,
  Image,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportPdf: () => Promise<void>;
  onExportExcel: () => Promise<void>;
  onExportImage: () => Promise<void>;
  reportData?: {
    date: string;
    totalEmployees: number;
    creator?: string;
    approver?: string;
    status: string;
  };
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExportPdf,
  onExportExcel,
  onExportImage,
  reportData
}) => {
  const [exporting, setExporting] = useState<{
    pdf: boolean;
    excel: boolean;
    image: boolean;
  }>({
    pdf: false,
    excel: false,
    image: false
  });

  const [exportStatus, setExportStatus] = useState<{
    pdf: 'idle' | 'success' | 'error';
    excel: 'idle' | 'success' | 'error';
    image: 'idle' | 'success' | 'error';
  }>({
    pdf: 'idle',
    excel: 'idle',
    image: 'idle'
  });

  const handleExport = async (type: 'pdf' | 'excel' | 'image', exportFunction: () => Promise<void>) => {
    setExporting(prev => ({ ...prev, [type]: true }));
    setExportStatus(prev => ({ ...prev, [type]: 'idle' }));

    try {
      await exportFunction();
      setExportStatus(prev => ({ ...prev, [type]: 'success' }));
      
      // Auto-close modal after successful export
      setTimeout(() => {
        onClose();
        setExportStatus(prev => ({ ...prev, [type]: 'idle' }));
      }, 2000);
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      setExportStatus(prev => ({ ...prev, [type]: 'error' }));
    } finally {
      setExporting(prev => ({ ...prev, [type]: false }));
    }
  };

  const getStatusIcon = (status: 'idle' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: 'idle' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Exportado</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Download className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-xl">Exportar Reporte de Asistencia</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información del Reporte */}
          {reportData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Información del Reporte</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Fecha:</span>
                  <span className="ml-2 font-medium">{reportData.date}</span>
                </div>
                <div>
                  <span className="text-gray-600">Empleados:</span>
                  <span className="ml-2 font-medium">{reportData.totalEmployees}</span>
                </div>
                {reportData.creator && (
                  <div>
                    <span className="text-gray-600">Creado por:</span>
                    <span className="ml-2 font-medium">{reportData.creator}</span>
                  </div>
                )}
                {reportData.approver && (
                  <div>
                    <span className="text-gray-600">Autorizado por:</span>
                    <span className="ml-2 font-medium">{reportData.approver}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Estado:</span>
                  <Badge className="ml-2" variant={reportData.status === 'approved' ? 'default' : 'secondary'}>
                    {reportData.status === 'approved' ? 'Aprobado' : 'Borrador'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Opciones de Exportación */}
          <div className="grid gap-4">
            {/* Exportar a PDF */}
            <Card className="border-2 hover:border-blue-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FileText className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Exportar a PDF</h4>
                      <p className="text-sm text-gray-600">
                        Perfecto para móvil • Máximo 20 empleados por página • Profesional
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(exportStatus.pdf)}
                    {getStatusBadge(exportStatus.pdf)}
                    <Button
                      onClick={() => handleExport('pdf', onExportPdf)}
                      disabled={exporting.pdf}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {exporting.pdf ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exportar a Excel */}
            <Card className="border-2 hover:border-green-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Table className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Exportar a Excel</h4>
                      <p className="text-sm text-gray-600">
                        Datos editables • Filtros y análisis • Todas las estadísticas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(exportStatus.excel)}
                    {getStatusBadge(exportStatus.excel)}
                    <Button
                      onClick={() => handleExport('excel', onExportExcel)}
                      disabled={exporting.excel}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {exporting.excel ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Excel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exportar como Imagen */}
            <Card className="border-2 hover:border-purple-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Image className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Exportar como Imagen</h4>
                      <p className="text-sm text-gray-600">
                        PNG de alta calidad • Compartir fácil • Optimizado para móvil
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(exportStatus.image)}
                    {getStatusBadge(exportStatus.image)}
                    <Button
                      onClick={() => handleExport('image', onExportImage)}
                      disabled={exporting.image}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {exporting.image ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Imagen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notas de Exportación */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📱 Optimizado para Móvil</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• PDF: Diseño responsivo, máximo 20 empleados por página</li>
              <li>• Excel: Datos completos con filtros y estadísticas</li>
              <li>• Imagen: PNG de alta calidad para compartir</li>
              <li>• Todos los formatos incluyen información del creador y autorizador</li>
            </ul>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
