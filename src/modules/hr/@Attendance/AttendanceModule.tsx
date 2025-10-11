// ============================================================================
// MÓDULO PRINCIPAL DE ASISTENCIA
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Download,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { AttendanceList } from './components/AttendanceList';
import { AttendanceDetail } from './components/AttendanceDetail';
import { AttendanceForm } from './components/AttendanceForm';
import { useAttendance } from './hooks/useAttendance';
import { AttendanceReport, ApprovalRequest, CreateAttendanceReportRequest } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatHours } from '@/utils/dateUtils';

// Error Boundary para el módulo de asistencia
interface AttendanceErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface AttendanceErrorBoundaryProps {
  children: React.ReactNode;
}

class AttendanceErrorBoundary extends React.Component<
  AttendanceErrorBoundaryProps,
  AttendanceErrorBoundaryState
> {
  constructor(props: AttendanceErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AttendanceErrorBoundaryState {
    // Solo capturar errores reales, no objetos vacíos o errores sin mensaje
    if (error &&
        error.message &&
        error.message.trim() !== '' &&
        error.message !== '{}' &&
        error.message !== 'undefined' &&
        !error.message.includes('Minified React error')) {
      return { hasError: true, error };
    }
    return { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Solo loggear errores reales
    if (error && error.message && error.message.trim() !== '' && error.message !== '{}') {
      console.error('Error en módulo de asistencia:', error, errorInfo);
    } else {
      // No loggear errores vacíos para evitar spam en la consola
      return;
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error en el módulo de asistencia
            </h2>
            <p className="text-red-600 mb-4">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Recargar página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AttendanceModule: React.FC = () => {
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
    loadReports();
    loadPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateReport = () => {
    console.log('🔄 Iniciando creación de reporte de asistencia...');
    try {
      setSelectedReport(null);
      setActiveView('form');
      console.log('✅ Vista cambiada a formulario exitosamente');
    } catch (error) {
      console.error('❌ Error al cambiar a vista de formulario:', error);
    }
  };

  const handleViewReport = (report: AttendanceReport) => {
    setSelectedReport(report);
    setActiveView('detail');
  };

  const handleEditReport = (report: AttendanceReport) => {
    setSelectedReport(report);
    setActiveView('form');
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      await deleteReport(reportId);
      loadReports();
    }
  };

  const handleApproveReport = async (reportId: string) => {
    const request: ApprovalRequest = {
      reportId,
      action: 'approve',
      approvedBy: 'current_user' // En implementación real vendría del contexto de autenticación
    };
    await approveReport(request);
    loadReports();
  };

  const handleRejectReport = async (reportId: string, reason?: string) => {
    const request: ApprovalRequest = {
      reportId,
      action: 'reject',
      reason: reason || 'Reporte rechazado por el supervisor',
      approvedBy: 'current_user' // En implementación real vendría del contexto de autenticación
    };
    await approveReport(request);
    loadReports();
  };

  const handleFormSubmit = async (data: CreateAttendanceReportRequest) => {
    try {
      console.log('📝 Enviando reporte de asistencia:', data);
      if (selectedReport) {
        await updateReport(selectedReport.id, data);
        console.log('✅ Reporte actualizado exitosamente');
      } else {
        await createReport(data);
        console.log('✅ Reporte creado exitosamente');
      }
      setActiveView('list');
      setSelectedReport(null);
      loadReports();
    } catch (error) {
      console.error('❌ Error en reporte de asistencia:', error);
      // No recargar la página, solo mostrar error
    }
  };

  const handleFormCancel = () => {
    console.log('🔄 Cancelando formulario de asistencia...');
    try {
      setActiveView('list');
      setSelectedReport(null);
      console.log('✅ Vista cambiada a lista exitosamente');
    } catch (error) {
      console.error('❌ Error al cambiar a vista de lista:', error);
    }
  };

  const filteredReports = reports.filter((report: AttendanceReport) => {
    const matchesSearch = report.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar datos</h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={loadReports} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (activeView === 'form') {
    return (
      <AttendanceErrorBoundary>
        <AttendanceForm
          report={selectedReport}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </AttendanceErrorBoundary>
    );
  }

  if (activeView === 'detail' && selectedReport) {
    return (
      <AttendanceErrorBoundary>
        <AttendanceDetail
          reportId={selectedReport.id}
          onBack={() => {
            console.log('🔄 Regresando a vista de lista desde detalle...');
            setActiveView('list');
          }}
        />
      </AttendanceErrorBoundary>
    );
  }

  return (
    <AttendanceErrorBoundary>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Asistencia</h1>
          <p className="text-gray-600 mt-1">
            Gestión diaria de asistencia y movimientos de empleados
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button
            onClick={handleCreateReport}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'Cargando...' : 'Nuevo Reporte'}
          </Button>
          <Button
            onClick={() => {
              console.log('🧪 Prueba del módulo de asistencia');
              console.log('📊 Reportes actuales:', reports.length);
              console.log('🔐 Permisos:', permissions);
              console.log('⏳ Loading:', loading);
              console.log('❌ Error:', error);
              console.log('🔄 Vista actual:', activeView);
              console.log('📋 Reporte seleccionado:', selectedReport?.id || 'ninguno');

              // Probar creación de reporte
              if (activeView === 'list') {
                console.log('🔄 Probando cambio a formulario...');
                handleCreateReport();
              } else if (activeView === 'form') {
                console.log('🔄 Probando regreso a lista...');
                handleFormCancel();
              }
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            🧪 Prueba
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Empleados Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.reduce((sum: number, r: AttendanceReport) => sum + (r.totalEmployees || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Asistencias Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports[0]?.presentCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Horas Extra Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatHours(reports[0]?.overtimeHours)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reportes Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar por fecha o notas..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="approved">Aprobado</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Reportes de Asistencia ({filteredReports.length})
          </h3>
        </div>

        <AttendanceList
          reports={filteredReports}
          permissions={permissions}
          onView={handleViewReport}
          onEdit={handleEditReport}
          onDelete={handleDeleteReport}
          onApprove={handleApproveReport}
          onReject={handleRejectReport}
        />
      </div>
      </div>
    </AttendanceErrorBoundary>
  );
};

export default AttendanceModule;
