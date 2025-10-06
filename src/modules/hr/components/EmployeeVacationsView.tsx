import React, { useState } from 'react';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  Search,
  ChevronDown,
  Eye,
  Plus,
  Calendar,
  Plane,
  Heart,
  Baby,
  User,
  Edit,
  Trash2,
  Send,
  Coffee,
  Home,
  BarChart3,
  FileText,
  Activity
} from 'lucide-react';
import { useVacations } from '../../../hooks/useVacations';
import { useNotifications } from '../../../contexts/NotificationContext';
import VacationRequestModal from './VacationRequestModal';
import VacationsChart from './VacationsChart';
import VacationCalendar from './VacationCalendar';
import VacationRequestDetailsModal from './VacationRequestDetailsModal';
import DayVacationsModal from './DayVacationsModal';
import type { CreateVacationRequest, VacationRequest } from '../../../services/vacationsService';

// ============================================================================
// TYPES
// ============================================================================

interface EmployeeVacationsViewProps {
  employeeId: string;
  employeeName?: string;
  onBack: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const EmployeeVacationsView: React.FC<EmployeeVacationsViewProps> = ({ 
  employeeId, 
  employeeName = 'Empleado',
  onBack 
}) => {
  const { showSuccess, showError } = useNotifications();

  // Validación de props
  if (!employeeId) {
    console.error('❌ EmployeeVacationsView: employeeId es requerido');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error de configuración</h3>
            <p className="text-red-600 mb-4">ID de empleado no proporcionado.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Usar hook de vacaciones con manejo de errores
  let vacationsHook;
  try {
    vacationsHook = useVacations({ employeeId, autoRefresh: false });
  } catch (hookError) {
    console.error('❌ Error en useVacations hook:', hookError);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error interno</h3>
            <p className="text-red-600 mb-4">Error al inicializar el módulo de vacaciones.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    data,
    requests,
    balance,
    policy,
    summary,
    loading,
    error,
    createRequest,
    updateRequest,
    cancelRequest,
    deleteRequest,
    approveRequest,
    rejectRequest,
    calculateDays,
    checkAvailability,
    uploadAttachments,
    exportVacations,
    getCalendar,
    refreshData
  } = vacationsHook;

  // Estado local de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'history' | 'calendar'>('overview');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsRequest, setSelectedDetailsRequest] = useState<VacationRequest | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedDayRequests, setSelectedDayRequests] = useState<VacationRequest[]>([]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Manejar creación/edición de solicitud
  const handleSubmitRequest = async (requestData: CreateVacationRequest, attachments: File[]) => {
    try {
      // Subir archivos primero
      let attachmentIds: string[] = [];
      if (attachments.length > 0) {
        attachmentIds = await uploadAttachments(attachments);
      }

      if (selectedRequest) {
        // Modo edición
        await updateRequest(selectedRequest.id, {
          ...requestData,
          attachments: attachmentIds
        });
        showSuccess('Solicitud actualizada exitosamente');
      } else {
        // Modo creación
        await createRequest({
          ...requestData,
          attachments: attachmentIds
        });
        showSuccess('Solicitud enviada exitosamente');
      }

      setShowNewRequest(false);
      setSelectedRequest(null);
      await refreshData();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error procesando solicitud');
      throw error;
    }
  };

  // Manejar edición
  const handleEditRequest = (request: VacationRequest) => {
    if (request.status !== 'pending') {
      showError('Solo se pueden editar solicitudes pendientes');
      return;
    }
    setSelectedRequest(request);
    setShowNewRequest(true);
  };

  // Manejar cancelación
  const handleCancelRequest = async (requestId: string) => {
    const reason = prompt('Motivo de la cancelación (opcional):');
    
    try {
      await cancelRequest(requestId, reason || undefined);
      showSuccess('Solicitud cancelada exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error cancelando solicitud');
    }
  };

  // Manejar eliminación
  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta solicitud?')) return;

    try {
      await deleteRequest(requestId);
      showSuccess('Solicitud eliminada exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error eliminando solicitud');
    }
  };

  // Manejar aprobación
  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveRequest(requestId);
      showSuccess('Solicitud aprobada exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error aprobando solicitud');
    }
  };

  // Manejar rechazo
  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;

    try {
      await rejectRequest(requestId, reason);
      showSuccess('Solicitud rechazada');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error rechazando solicitud');
    }
  };

  // Manejar exportación
  const handleExport = async () => {
    try {
      const blob = await exportVacations('excel');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vacaciones_${employeeId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('Vacaciones exportadas exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error exportando vacaciones');
    }
  };

  // Manejar visualización de detalles
  const handleViewDetails = (request: VacationRequest) => {
    setSelectedDetailsRequest(request);
    setShowDetailsModal(true);
  };

  // Manejar descarga de archivos adjuntos
  const handleDownloadAttachment = async (attachmentId: string, filename: string) => {
    try {
      // Aquí deberías implementar la lógica para descargar el archivo
      // Por ahora solo mostramos un mensaje
      showSuccess(`Descargando archivo: ${filename}`);
    } catch (error) {
      showError('Error descargando archivo');
    }
  };

  // Manejar clic en día del calendario
  const handleDayClick = (date: Date, dayRequests: VacationRequest[]) => {
    setSelectedDay(date);
    setSelectedDayRequests(dayRequests);
    setShowDayModal(true);
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || request.type === filterType;
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const historyRequests = requests.filter(r => r.status === 'approved' || r.status === 'rejected');

  const getTypeText = (type: string) => {
    switch (type) {
      case 'vacation': return 'Vacaciones';
      case 'personal': return 'Personal';
      case 'sick_leave': return 'Enfermedad';
      case 'maternity': return 'Maternidad';
      case 'paternity': return 'Paternidad';
      case 'unpaid': return 'Sin Goce';
      case 'compensatory': return 'Compensatorio';
      default: return 'Otro';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vacation': return <Plane className="h-4 w-4" />;
      case 'personal': return <User className="h-4 w-4" />;
      case 'sick_leave': return <Heart className="h-4 w-4" />;
      case 'maternity': return <Baby className="h-4 w-4" />;
      case 'paternity': return <Home className="h-4 w-4" />;
      case 'compensatory': return <Coffee className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper para formatear moneda
  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency
    }).format(amount);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de vacaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar vacaciones</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refreshData()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Validación defensiva de datos
  if (!data && !requests && !balance && !summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Sin datos de vacaciones</h3>
            <p className="text-yellow-600 mb-4">No se encontraron datos de vacaciones para este empleado.</p>
            <button
              onClick={() => refreshData()}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de Nueva/Editar Solicitud */}
      <VacationRequestModal
        isOpen={showNewRequest}
        onClose={() => {
          setShowNewRequest(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleSubmitRequest}
        employeeId={employeeId}
        employeeName={employeeName}
        availableDays={balance?.available || 0}
        request={selectedRequest}
        mode={selectedRequest ? 'edit' : 'create'}
        onCalculateDays={calculateDays}
        onCheckAvailability={checkAvailability}
      />

      {/* Modal de detalles */}
      <VacationRequestDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedDetailsRequest(null);
        }}
        request={selectedDetailsRequest}
        onDownloadAttachment={handleDownloadAttachment}
      />

      {/* Modal de solicitudes del día */}
      <DayVacationsModal
        isOpen={showDayModal}
        onClose={() => {
          setShowDayModal(false);
          setSelectedDay(null);
          setSelectedDayRequests([]);
        }}
        date={selectedDay}
        requests={selectedDayRequests}
        onViewDetails={handleViewDetails}
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
                <h1 className="text-2xl font-bold text-gray-900">Vacaciones</h1>
                <p className="text-gray-600">{data?.employeeName || employeeName} - {data?.position || ''}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  setSelectedRequest(null);
                  setShowNewRequest(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Solicitar Vacaciones</span>
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Balance */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Días Disponibles</p>
                <p className="text-3xl font-bold text-green-600">{balance?.available || 0}</p>
                <p className="text-xs text-gray-500">de {balance?.total || 0} días</p>
                {/* Información monetaria para días disponibles */}
                {balance?.available && balance.available > 0 && (
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    {(() => {
                      // Calcular monto basado en salario diario estimado
                      // Si tenemos datos de pago de solicitudes, usamos el salario diario promedio
                      const approvedRequests = requests?.filter(r => r.status === 'approved' && r.payment?.dailySalary) || [];
                      const avgDailySalary = approvedRequests.length > 0 
                        ? approvedRequests.reduce((sum, r) => sum + (r.payment?.dailySalary || 0), 0) / approvedRequests.length
                        : 500; // Valor por defecto si no hay datos
                      
                      const totalAmount = balance.available * avgDailySalary;
                      const vacationPremium = totalAmount * 0.25; // 25% prima vacacional
                      const finalAmount = totalAmount + vacationPremium;
                      
                      return `Pendiente: ${formatCurrency(finalAmount)}`;
                    })()}
                  </p>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CalendarDays className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Días Usados</p>
                <p className="text-3xl font-bold text-blue-600">{balance?.used || 0}</p>
                <p className="text-xs text-gray-500">Este año</p>
                {/* Información monetaria para días usados */}
                {balance?.used && balance.used > 0 && (
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    {(() => {
                      // Calcular monto total pagado por días usados
                      const approvedRequests = requests?.filter(r => r.status === 'approved' && r.payment?.totalAmount) || [];
                      const totalPaid = approvedRequests.reduce((sum, r) => sum + (r.payment?.totalAmount || 0), 0);
                      
                      return totalPaid > 0 ? `Pagado: ${formatCurrency(totalPaid)}` : 'Sin pago registrado';
                    })()}
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Plane className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{balance?.pending || 0}</p>
                <p className="text-xs text-gray-500">Por aprobar</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Vacación</p>
                <p className="text-xl font-bold text-purple-600">
                  {summary?.lastVacation ? formatDate(summary.lastVacation.startDate) : '-'}
                </p>
                <p className="text-xs text-gray-500">Fecha</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navegación por Pestañas */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Resumen', icon: BarChart3 },
                { id: 'requests', label: 'Solicitudes', icon: FileText },
                { id: 'history', label: 'Historial', icon: Clock },
                { id: 'calendar', label: 'Calendario', icon: Calendar }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
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
            {/* Gráfica de Uso */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso de Vacaciones</h3>
                  <VacationsChart 
                  data={Object.entries(summary?.byMonth || {}).map(([month, days]) => ({
                    date: month,
                    days: days,
                    type: 'vacation',
                    status: 'approved'
                    }))}
                    type="usage"
                />
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Estadísticas de Solicitudes</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Solicitudes</span>
                      <span className="font-medium text-gray-900">{summary?.totalRequests || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Aprobadas</span>
                      <span className="font-medium text-green-600">{summary?.approvedRequests || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pendientes</span>
                      <span className="font-medium text-yellow-600">{summary?.pendingRequests || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rechazadas</span>
                      <span className="font-medium text-red-600">{summary?.rejectedRequests || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Distribución por Tipo</h4>
                  <div className="space-y-3">
                    {summary && Object.entries(summary.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(type)}
                          <span className="text-sm text-gray-600">{getTypeText(type)}</span>
                    </div>
                        <span className="font-medium text-gray-900">{count} días</span>
                    </div>
                    ))}
                    </div>
                  </div>
                </div>
              </div>

            {/* Política de Vacaciones */}
            {policy && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Política de Vacaciones</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Días Anuales</p>
                      <p className="text-2xl font-bold text-gray-900">{policy.annualDays}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Acumulación</p>
                      <p className="text-2xl font-bold text-gray-900">{policy.accrualRate.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">días/mes</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Anticipación</p>
                      <p className="text-2xl font-bold text-gray-900">{policy.advanceRequest}</p>
                      <p className="text-xs text-gray-500">días</p>
                    </div>
                  </div>

                  {/* Períodos Restringidos */}
                  {policy.blackoutPeriods && policy.blackoutPeriods.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h5 className="text-sm font-medium text-red-900 mb-2">Períodos Restringidos</h5>
                      <div className="space-y-1">
                        {policy.blackoutPeriods.map((period, index) => (
                          <div key={index} className="text-xs text-red-700">
                            • {formatDate(period.startDate)} - {formatDate(period.endDate)}: {period.reason}
                      </div>
                    ))}
                  </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Solicitudes */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Solicitudes de Vacaciones</h3>
                  <button 
                    onClick={() => {
                      setSelectedRequest(null);
                      setShowNewRequest(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nueva Solicitud</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por razón o fecha..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                    />
                  </div>

                  <div className="relative">
                    <Filter className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">Todos</option>
                      <option value="pending">Pendiente</option>
                      <option value="approved">Aprobado</option>
                      <option value="rejected">Rechazado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No se encontraron solicitudes</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {requests.length === 0 
                        ? 'Crea tu primera solicitud haciendo clic en "Nueva Solicitud"'
                        : 'Intenta ajustar los filtros de búsqueda'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(request.type)}
                                <span className="font-medium text-gray-900">{getTypeText(request.type)}</span>
                          </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                                <span className="ml-1">{getStatusText(request.status)}</span>
                              </span>
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                {request.days} días
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-2">{request.reason}</p>

                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(request.startDate)} - {formatDate(request.endDate)}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>Solicitado: {formatDate(request.requestedDate)}</span>
                              </span>
                              {request.approvedBy && (
                                <span className="flex items-center space-x-1">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Aprobado por: {request.approvedByName || request.approvedBy}</span>
                                </span>
                              )}
                            </div>

                            {/* Información de pago */}
                            {request.payment && request.type === 'vacation' && (
                              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-emerald-700 font-medium">Total a Pagar:</span>
                                  <span className="text-emerald-800 font-bold">
                                    {formatCurrency(request.payment.totalAmount)}
                                  </span>
                                </div>
                                {request.payment.paidAmount !== undefined && request.payment.paidAmount > 0 && (
                                  <div className="flex items-center justify-between text-xs mt-1">
                                    <span className="text-emerald-600">Pagado:</span>
                                    <span className="text-emerald-700">
                                      {formatCurrency(request.payment.paidAmount)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Archivos adjuntos */}
                            {request.attachments && request.attachments.length > 0 && (
                              <div className="mt-2 flex items-center space-x-1 text-xs text-blue-600">
                                <Paperclip className="h-3 w-3" />
                                <span>{request.attachments.length} archivo{request.attachments.length > 1 ? 's' : ''} adjunto{request.attachments.length > 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {/* Botón para ver detalles */}
                            <button
                              onClick={() => handleViewDetails(request)}
                              className="p-1 hover:bg-blue-100 rounded text-blue-600"
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleEditRequest(request)}
                                  className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleCancelRequest(request.id)}
                                  className="p-1 hover:bg-yellow-100 rounded text-yellow-600"
                                  title="Cancelar"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleApproveRequest(request.id)}
                                  className="p-1 hover:bg-green-100 rounded text-green-600"
                                  title="Aprobar"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(request.id)}
                                  className="p-1 hover:bg-red-100 rounded text-red-600"
                                  title="Rechazar"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteRequest(request.id)}
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

        {/* Tab: Historial */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Vacaciones</h3>
                {historyRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No hay historial disponible</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                              </span>
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {request.days} días
                              </span>
                            </div>
                          <p className="text-sm text-gray-600">{request.reason}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              {getTypeIcon(request.type)}
                              <span className="text-xs text-gray-500">{getTypeText(request.type)}</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                                {getStatusText(request.status)}
                              </span>
                              {request.approvedBy && (
                                <span className="text-xs text-gray-500">
                                  Aprobado por: {request.approvedByName || request.approvedBy}
                                </span>
                              )}
                        </div>

                        {/* Información de pago */}
                        {request.payment && request.type === 'vacation' && (
                          <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-emerald-700 font-medium">Total a Pagar:</span>
                              <span className="text-emerald-800 font-bold">
                                {formatCurrency(request.payment.totalAmount)}
                              </span>
                            </div>
                            {request.payment.paidAmount !== undefined && request.payment.paidAmount > 0 && (
                              <div className="flex items-center justify-between text-xs mt-1">
                                <span className="text-emerald-600">Pagado:</span>
                                <span className="text-emerald-700">
                                  {formatCurrency(request.payment.paidAmount)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Archivos adjuntos */}
                        {request.attachments && request.attachments.length > 0 && (
                          <div className="mt-2 flex items-center space-x-1 text-xs text-blue-600">
                            <Paperclip className="h-3 w-3" />
                            <span>{request.attachments.length} archivo{request.attachments.length > 1 ? 's' : ''} adjunto{request.attachments.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {/* Botón para ver detalles */}
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="p-1 hover:bg-blue-100 rounded text-blue-600"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
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

        {/* Tab: Calendario */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendario de Vacaciones</h3>
                <VacationCalendar requests={requests} onDayClick={handleDayClick} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'approved': return 'Aprobado';
    case 'rejected': return 'Rechazado';
    case 'cancelled': return 'Cancelado';
    default: return 'Desconocido';
  }
};

export { EmployeeVacationsView };
export default EmployeeVacationsView;
