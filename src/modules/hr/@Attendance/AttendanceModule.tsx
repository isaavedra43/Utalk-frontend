// ============================================================================
// MÓDULO PRINCIPAL DE ASISTENCIA
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  AlertCircle
} from 'lucide-react';
import { AttendanceList } from './components/AttendanceList';
import { AttendanceDetail } from './components/AttendanceDetail';
import { AttendanceForm } from './components/AttendanceForm';
import { useAttendance } from './hooks/useAttendance';
import { AttendanceReport, ApprovalRequest, CreateAttendanceReportRequest } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AttendanceModule: React.FC = () => {
  console.log('🔍 AttendanceModule - Iniciando renderizado');
  
  const [activeView, setActiveView] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedReport, setSelectedReport] = useState<AttendanceReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    reports,
    loading,
    error,
    permissions,
    loadReports,
    createReport,
    updateReport,
    deleteReport,
    approveReport,
    loadPermissions
  } = useAttendance();

  useEffect(() => {
    console.log('🔍 AttendanceModule - Ejecutando useEffect inicial');
    try {
      loadReports();
      loadPermissions();
      console.log('✅ AttendanceModule - Carga de datos iniciada');
    } catch (effectError) {
      console.error('❌ AttendanceModule - Error en useEffect:', effectError);
    }
  }, [loadReports, loadPermissions]);

  // Filtrar reportes según los filtros
  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.date.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateReport = async (data: CreateAttendanceReportRequest) => {
    try {
      console.log('🔍 AttendanceModule - Creando reporte:', data);
      await createReport(data);
      setActiveView('list');
      console.log('✅ AttendanceModule - Reporte creado exitosamente');
    } catch (error) {
      console.error('❌ AttendanceModule - Error creando reporte:', error);
    }
  };

  const handleUpdateReport = async (reportId: string, data: Partial<CreateAttendanceReportRequest>) => {
    try {
      console.log('🔍 AttendanceModule - Actualizando reporte:', reportId, data);
      await updateReport(reportId, data);
      setActiveView('list');
      console.log('✅ AttendanceModule - Reporte actualizado exitosamente');
    } catch (error) {
      console.error('❌ AttendanceModule - Error actualizando reporte:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      console.log('🔍 AttendanceModule - Eliminando reporte:', reportId);
      await deleteReport(reportId);
      console.log('✅ AttendanceModule - Reporte eliminado exitosamente');
    } catch (error) {
      console.error('❌ AttendanceModule - Error eliminando reporte:', error);
    }
  };

  const handleApproveReport = async (request: ApprovalRequest) => {
    try {
      console.log('🔍 AttendanceModule - Aprobando reporte:', request);
      await approveReport(request);
      console.log('✅ AttendanceModule - Reporte aprobado exitosamente');
    } catch (error) {
      console.error('❌ AttendanceModule - Error aprobando reporte:', error);
    }
  };

  const handleViewReport = (report: AttendanceReport) => {
    console.log('🔍 AttendanceModule - Viendo reporte:', report.id);
    setSelectedReport(report);
    setActiveView('detail');
  };

  const handleEditReport = (report: AttendanceReport) => {
    console.log('🔍 AttendanceModule - Editando reporte:', report.id);
    setSelectedReport(report);
    setActiveView('form');
  };

  const handleBackToList = () => {
    console.log('🔍 AttendanceModule - Volviendo a la lista');
    setSelectedReport(null);
    setActiveView('list');
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cargando reportes de asistencia...</h3>
          <p className="text-gray-600">Por favor espera mientras cargamos los datos</p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay uno
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar asistencia</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => loadReports()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Renderizar vista de detalle
  if (activeView === 'detail' && selectedReport) {
    return (
      <AttendanceDetail
        reportId={selectedReport.id}
        onBack={handleBackToList}
      />
    );
  }

  // Renderizar formulario de creación/edición
  if (activeView === 'form') {
    return (
      <AttendanceForm
        report={selectedReport}
        onSubmit={selectedReport ? 
          (data) => handleUpdateReport(selectedReport.id, data) : 
          handleCreateReport
        }
        onCancel={handleBackToList}
      />
    );
  }

  // Vista principal de lista
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes de Asistencia</h1>
          <p className="text-gray-600">Gestiona los reportes de asistencia de los empleados</p>
        </div>
        <Button 
          onClick={() => setActiveView('form')}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Reporte</span>
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar reportes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="approved">Aprobado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Reportes de Asistencia ({filteredReports.length})
          </h3>
        </div>

        {(() => {
          try {
            console.log('🔍 AttendanceModule - Renderizando AttendanceList con datos:', {
              reportsCount: filteredReports.length,
              hasPermissions: !!permissions,
              firstReport: filteredReports[0]
            });
            
            return (
              <AttendanceList
                reports={filteredReports}
                permissions={permissions}
                onView={handleViewReport}
                onEdit={handleEditReport}
                onDelete={handleDeleteReport}
                onApprove={handleApproveReport}
                onReject={handleApproveReport}
              />
            );
          } catch (listError) {
            console.error('❌ AttendanceModule - Error al renderizar AttendanceList:', listError);
            return (
              <div className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">Error al cargar la lista de reportes</p>
                <Button onClick={handleBackToList} className="mt-4">
                  Volver
                </Button>
              </div>
            );
          }
        })()}
      </div>
    </div>
  );
};

export default AttendanceModule;