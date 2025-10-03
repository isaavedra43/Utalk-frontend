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
  
  // Hook para manejar incidencias
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

  // Estado local
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

  const handleSubmitIncident = async (incidentData: IncidentRequest, attachments: File[]) => {
    try {
      let attachmentIds: string[] = [];
      if (attachments.length > 0) {
        attachmentIds = await uploadAttachments(attachments);
      }

      if (selectedIncident) {
        await updateIncident(selectedIncident.id, {
          ...incidentData as any,
          attachments: attachmentIds
        });
        showSuccess('Incidencia actualizada exitosamente');
      } else {
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

  const handleEditIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setShowNewIncident(true);
  };

  const handleDeleteIncident = async (incidentId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta incidencia? Esta acción no se puede deshacer.')) return;

    try {
      await deleteIncident(incidentId);
      showSuccess('Incidencia eliminada exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error eliminando incidencia');
    }
  };

  const handleApproveIncident = async (incidentId: string) => {
    try {
      await approveIncident(incidentId);
      showSuccess('Incidencia aprobada exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error aprobando incidencia');
    }
  };

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
  // FILTERS & DATA PROCESSING
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

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

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
  // RENDER STATES
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

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal */}
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
                onClick={() => setShowNewIncident(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Nueva Incidencia</span>
              </button>
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
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

        {/* Tabs */}
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

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
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

        {activeTab === 'incidents' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Buscar incidencias..."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severidad</label>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Incidents List */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Incidencias Registradas ({filteredIncidents.length})</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredIncidents.map((incident) => (
                  <div key={incident.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getTypeIcon(incident.type)}
                          <h4 className="text-lg font-medium text-gray-900">{incident.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(incident.severity)}`}>
                            {getSeverityText(incident.severity)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                            {getStatusText(incident.status)}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{incident.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(incident.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{incident.location}</span>
                          </div>
                          {incident.cost && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>${incident.cost.toLocaleString('es-MX')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditIncident(incident)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteIncident(incident.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredIncidents.length === 0 && (
                  <div className="p-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron incidencias</h3>
                    <p className="text-gray-600 mb-4">
                      {incidents.length === 0 
                        ? 'No hay incidencias registradas para este empleado.'
                        : 'Intenta ajustar los filtros de búsqueda.'
                      }
                    </p>
                    {incidents.length === 0 && (
                      <button 
                        onClick={() => setShowNewIncident(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Registrar Primera Incidencia
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generar Reportes</h3>
            <p className="text-gray-600 mb-6">Selecciona una incidencia y el tipo de reporte que deseas generar.</p>
            
            {incidents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay incidencias para generar reportes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Incidencia</label>
                  <select
                    value={selectedIncident?.id || ''}
                    onChange={(e) => {
                      const incident = incidents.find(inc => inc.id === e.target.value);
                      setSelectedIncident(incident || null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una incidencia</option>
                    {incidents.map((incident) => (
                      <option key={incident.id} value={incident.id}>
                        {incident.title} - {formatDate(incident.date)}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedIncident && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { type: 'acta', label: 'Acta Administrativa' },
                      { type: 'robo', label: 'Reporte de Robo' },
                      { type: 'accidente', label: 'Reporte de Accidente' },
                      { type: 'lesion', label: 'Reporte de Lesión' },
                      { type: 'disciplinario', label: 'Reporte Disciplinario' },
                      { type: 'equipo', label: 'Reporte de Equipo' }
                    ].map(({ type, label }) => (
                      <button
                        key={type}
                        onClick={() => handleGenerateReport(type as any)}
                        className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <FileText className="h-6 w-6 text-blue-600 mb-2" />
                        <p className="text-sm font-medium text-gray-900">{label}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis y Estadísticas</h3>
            <p className="text-gray-600">Vista de análisis avanzado de incidencias (próximamente).</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeIncidentsView;