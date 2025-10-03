import React, { useState } from 'react';
import { 
  AlertTriangle, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Share2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  MapPin, 
  Shield, 
  Car, 
  Heart, 
  DollarSign, 
  Briefcase, 
  ChevronDown, 
  MoreHorizontal, 
  Archive, 
  AlertCircle, 
  BarChart3, 
  Activity,
  CreditCard
} from 'lucide-react';
import { useIncidents } from '../../../hooks/useIncidents';
import { useNotifications } from '../../../contexts/NotificationContext';
import IncidentModal from './IncidentModal';
import type { Incident, IncidentRequest } from '../../../services/incidentsService';

// ============================================================================
// TYPES
// ============================================================================

interface EmployeeIncidentsViewProps {
  employeeId: string;
  employeeName?: string;
  onBack: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const EmployeeIncidentsView: React.FC<EmployeeIncidentsViewProps> = ({ 
  employeeId, 
  employeeName = 'Empleado',
  onBack 
}) => {
  const { showSuccess, showError } = useNotifications();
  
  // Usar hook de incidencias
  const {
    incidents,
    summary,
    loading,
    error,
    createIncident,
    updateIncident,
    deleteIncident,
    approveIncident,
    rejectIncident,
    closeIncident,
    markCostAsPaid,
    uploadAttachments,
    exportIncidents,
    generateReport,
    refreshData
  } = useIncidents({ employeeId, autoRefresh: false });

  // Estado local de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'incidents' | 'reports' | 'analytics'>('overview');
  const [showNewIncident, setShowNewIncident] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Manejar creación/edición de incidencia
  const handleSubmitIncident = async (incidentData: IncidentRequest, attachments: File[]) => {
    try {
      // Subir archivos primero
      let attachmentIds: string[] = [];
      if (attachments.length > 0) {
        attachmentIds = await uploadAttachments(attachments);
      }

      if (selectedIncident) {
        // Modo edición
        await updateIncident(selectedIncident.id, {
          ...incidentData as any,
          attachments: attachmentIds
        });
        showSuccess('Incidencia actualizada exitosamente');
      } else {
        // Modo creación
        await createIncident({
          ...incidentData,
          attachments: attachmentIds
        });
        showSuccess('Incidencia creada exitosamente');
      }

      setShowNewIncident(false);
      setSelectedIncident(null);
      await refreshData();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error procesando incidencia');
      throw error;
    }
  };

  // Manejar apertura de modal de edición
  const handleEditIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setShowNewIncident(true);
  };

  // Manejar eliminación de incidencia
  const handleDeleteIncident = async (incidentId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta incidencia? Esta acción no se puede deshacer.')) return;

    try {
      await deleteIncident(incidentId);
      showSuccess('Incidencia eliminada exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error eliminando incidencia');
    }
  };

  // Manejar aprobación
  const handleApproveIncident = async (incidentId: string) => {
    try {
      await approveIncident(incidentId);
      showSuccess('Incidencia aprobada exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error aprobando incidencia');
    }
  };

  // Manejar rechazo
  const handleRejectIncident = async (incidentId: string) => {
    const comments = prompt('Motivo del rechazo:');
    if (!comments) return;

    try {
      await rejectIncident(incidentId, comments);
      showSuccess('Incidencia rechazada');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error rechazando incidencia');
    }
  };

  // Manejar cierre
  const handleCloseIncident = async (incidentId: string) => {
    const resolution = prompt('Resolución final de la incidencia:');
    if (!resolution) return;

    try {
      await closeIncident(incidentId, resolution);
      showSuccess('Incidencia cerrada exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error cerrando incidencia');
    }
  };

  // Manejar marcar como pagado
  const handleMarkAsPaid = async (incidentId: string) => {
    const paidBy = prompt('Nombre de quien realizó el pago:');
    if (!paidBy) return;

    try {
      await markCostAsPaid(incidentId, paidBy);
      showSuccess('Costo marcado como pagado exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error marcando como pagado');
    }
  };

  // Manejar exportación
  const handleExport = async () => {
    try {
      const blob = await exportIncidents('excel');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incidencias_${employeeId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('Incidencias exportadas exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error exportando incidencias');
    }
  };

  // Manejar generación de reportes
  const handleGenerateReport = async (reportType: 'acta' | 'robo' | 'accidente' | 'lesion' | 'disciplinario' | 'equipo') => {
    if (!selectedIncident) {
      showError('Selecciona una incidencia primero');
      return;
    }

    try {
      const blob = await generateReport(selectedIncident.id, reportType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${reportType}_${selectedIncident.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('Reporte generado exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error generando reporte');
    }
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const criticalIncidents = incidents.filter(
    inc => inc.severity === 'high' || inc.severity === 'critical'
  );

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || incident.type === filterType;
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    return matchesSearch && matchesType && matchesStatus && matchesSeverity;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'administrative': return <FileText className="h-4 w-4" />;
      case 'theft': return <Shield className="h-4 w-4" />;
      case 'accident': return <Car className="h-4 w-4" />;
      case 'injury': return <Heart className="h-4 w-4" />;
      case 'disciplinary': return <AlertTriangle className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'equipment': return <Briefcase className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'administrative': return 'Administrativa';
      case 'theft': return 'Robo';
      case 'accident': return 'Accidente';
      case 'injury': return 'Lesión';
      case 'disciplinary': return 'Disciplinaria';
      case 'security': return 'Seguridad';
      case 'equipment': return 'Equipo';
      default: return 'Otro';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'low': return 'Baja';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return 'Desconocida';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'pending': return 'Pendiente';
      case 'in_review': return 'En Revisión';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'closed': return 'Cerrado';
      default: return 'Desconocido';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de incidencias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar incidencias</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refreshData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de Nueva/Editar Incidencia */}
      <IncidentModal
        isOpen={showNewIncident}
        onClose={() => {
          setShowNewIncident(false);
          setSelectedIncident(null);
        }}
        onSubmit={handleSubmitIncident}
        employeeId={employeeId}
        employeeName={employeeName}
        incident={selectedIncident}
        mode={selectedIncident ? 'edit' : 'create'}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronDown className="h-5 w-5 text-gray-600 rotate-90" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Incidencias</h1>
                <p className="text-gray-600">{employeeName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidencias</p>
                <p className="text-2xl font-bold text-blue-600">{summary?.totalIncidents || 0}</p>
                <p className="text-xs text-gray-500">registradas</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abiertas</p>
                <p className="text-2xl font-bold text-orange-600">{summary?.openIncidents || 0}</p>
                <p className="text-xs text-gray-500">pendientes</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cerradas</p>
                <p className="text-2xl font-bold text-green-600">{summary?.closedIncidents || 0}</p>
                <p className="text-xs text-gray-500">resueltas</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Críticas</p>
                <p className="text-2xl font-bold text-red-600">{criticalIncidents.length}</p>
                <p className="text-xs text-gray-500">alta prioridad</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Resumen', icon: BarChart3 },
                { id: 'incidents', label: 'Incidencias', icon: AlertTriangle },
                { id: 'reports', label: 'Reportes', icon: FileText },
                { id: 'analytics', label: 'Análisis', icon: Activity }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Estadísticas por tipo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Incidencias por Tipo</h4>
                  <div className="space-y-3">
                    {summary && Object.entries(summary.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(type)}
                          <span className="text-sm text-gray-600">{getTypeText(type)}</span>
                        </div>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Incidencias por Severidad</h4>
                  <div className="space-y-3">
                    {summary && Object.entries(summary.bySeverity).map(([severity, count]) => (
                      <div key={severity} className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(severity)}`}>
                          {getSeverityText(severity)}
                        </span>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Costos */}
            {summary && summary.totalCost > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Costos por Incidencias</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 mb-1">Total</p>
                      <p className="text-2xl font-bold text-blue-900">
                        ${summary.totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600 mb-1">Pagado</p>
                      <p className="text-2xl font-bold text-green-900">
                        ${summary.paidCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-600 mb-1">Pendiente</p>
                      <p className="text-2xl font-bold text-orange-900">
                        ${summary.unpaidCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Incidencias críticas */}
            {criticalIncidents.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Incidencias Críticas</h4>
                  <div className="space-y-4">
                    {criticalIncidents.map((incident) => (
                      <div key={incident.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-red-900">{incident.title}</h5>
                            <p className="text-sm text-red-700 mt-1">{incident.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-red-600">
                                {formatDate(incident.date)} a las {incident.time}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                                {getStatusText(incident.status)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleEditIncident(incident)}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Incidencias */}
        {activeTab === 'incidents' && (
          <div className="space-y-6">
            {/* Filtros y botón de nueva incidencia */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Incidencias Registradas</h3>
                  <button 
                    onClick={() => {
                      setSelectedIncident(null);
                      setShowNewIncident(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nueva Incidencia</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar incidencias..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  
                  <div className="relative">
                    <Filter className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los tipos</option>
                      <option value="administrative">Administrativa</option>
                      <option value="theft">Robo</option>
                      <option value="accident">Accidente</option>
                      <option value="injury">Lesión</option>
                      <option value="disciplinary">Disciplinaria</option>
                      <option value="security">Seguridad</option>
                      <option value="equipment">Equipo</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-4 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="draft">Borrador</option>
                      <option value="pending">Pendiente</option>
                      <option value="in_review">En Revisión</option>
                      <option value="approved">Aprobado</option>
                      <option value="rejected">Rechazado</option>
                      <option value="closed">Cerrado</option>
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="pl-4 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todas las severidades</option>
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lista de incidencias */}
              <div className="p-6">
                {filteredIncidents.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No se encontraron incidencias</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {incidents.length === 0 
                        ? 'Agrega la primera incidencia haciendo clic en "Nueva Incidencia"'
                        : 'Intenta ajustar los filtros de búsqueda'
                      }
                    </p>
                  </div>
                ) : (
                <div className="space-y-4">
                  {filteredIncidents.map((incident) => (
                    <div key={incident.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getTypeIcon(incident.type)}
                            <h4 className="font-medium text-gray-900">{incident.title}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(incident.severity)}`}>
                              {getSeverityText(incident.severity)}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                              {getStatusText(incident.status)}
                            </span>
                              {incident.cost && incident.cost > 0 && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  incident.costPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  ${incident.cost.toLocaleString('es-MX')} {incident.costPaid ? '(Pagado)' : '(Pendiente)'}
                                </span>
                              )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{incident.description}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                                <span>{formatDate(incident.date)} a las {incident.time}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{incident.location}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                                <span>Reportado por: {incident.reportedByName || incident.reportedBy}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                            <button 
                              onClick={() => handleEditIncident(incident)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                              title="Editar"
                            >
                            <Edit className="h-4 w-4" />
                          </button>
                            
                            {incident.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleApproveIncident(incident.id)}
                                  className="p-1 hover:bg-green-100 rounded text-green-600"
                                  title="Aprobar"
                                >
                                  <CheckCircle className="h-4 w-4" />
                          </button>
                                <button 
                                  onClick={() => handleRejectIncident(incident.id)}
                                  className="p-1 hover:bg-red-100 rounded text-red-600"
                                  title="Rechazar"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}

                            {incident.status === 'approved' && !incident.costPaid && incident.cost && incident.cost > 0 && (
                              <button 
                                onClick={() => handleMarkAsPaid(incident.id)}
                                className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                title="Marcar como pagado"
                              >
                                <CreditCard className="h-4 w-4" />
                              </button>
                            )}

                            {(incident.status === 'approved' || incident.status === 'in_review') && (
                              <button 
                                onClick={() => handleCloseIncident(incident.id)}
                                className="p-1 hover:bg-purple-100 rounded text-purple-600"
                                title="Cerrar incidencia"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                            )}
                            
                            <button 
                              onClick={() => handleDeleteIncident(incident.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Reportes */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generar Reportes</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona una incidencia de la lista y luego elige el tipo de reporte a generar
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button 
                    onClick={() => handleGenerateReport('acta')}
                    disabled={!selectedIncident}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Acta Administrativa</span>
                    </div>
                    <p className="text-sm text-gray-600">Generar acta administrativa formal</p>
                  </button>
                  
                  <button 
                    onClick={() => handleGenerateReport('robo')}
                    disabled={!selectedIncident}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-gray-900">Reporte de Robo</span>
                    </div>
                    <p className="text-sm text-gray-600">Reporte de robo o hurto</p>
                  </button>
                  
                  <button 
                    onClick={() => handleGenerateReport('accidente')}
                    disabled={!selectedIncident}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Car className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-gray-900">Reporte de Accidente</span>
                    </div>
                    <p className="text-sm text-gray-600">Accidente laboral o de trabajo</p>
                  </button>
                  
                  <button 
                    onClick={() => handleGenerateReport('lesion')}
                    disabled={!selectedIncident}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Heart className="h-5 w-5 text-pink-600" />
                      <span className="font-medium text-gray-900">Reporte de Lesión</span>
                    </div>
                    <p className="text-sm text-gray-600">Lesión o herida en el trabajo</p>
                  </button>
                  
                  <button 
                    onClick={() => handleGenerateReport('disciplinario')}
                    disabled={!selectedIncident}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-gray-900">Reporte Disciplinario</span>
                    </div>
                    <p className="text-sm text-gray-600">Falta disciplinaria</p>
                  </button>
                  
                  <button 
                    onClick={() => handleGenerateReport('equipo')}
                    disabled={!selectedIncident}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Reporte de Equipo</span>
                    </div>
                    <p className="text-sm text-gray-600">Daño o pérdida de equipo</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Incidencias</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Gráficos de análisis</p>
                    <p className="text-sm text-gray-500">Se mostrarán aquí gráficos de tendencias y análisis de incidencias</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { EmployeeIncidentsView };
export default EmployeeIncidentsView;
