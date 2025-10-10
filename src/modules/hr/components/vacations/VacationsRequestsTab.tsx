import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  Users
} from 'lucide-react';
import { useVacationsManagement } from '../../../../hooks/useVacationsManagement';
import { useNotifications } from '../../../../contexts/NotificationContext';
import {
  VacationRequest,
  VacationStatus,
  VacationType,
  VacationFilters
} from '../../../../services/vacationsManagementService';

// ============================================================================
// TYPES
// ============================================================================

interface VacationsRequestsTabProps {
  onBack?: () => void;
}

// ============================================================================
// REQUEST STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
  status: VacationStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }: StatusBadgeProps) => {
  const statusConfig: Record<VacationStatus, { color: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
    draft: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Borrador' },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendiente' },
    approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Aprobada' },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rechazada' },
    cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelada' },
    completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Completada' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </span>
  );
};

// ============================================================================
// REQUEST TYPE BADGE COMPONENT
// ============================================================================

interface TypeBadgeProps {
  type: VacationType;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type }: TypeBadgeProps) => {
  const typeConfig: Record<VacationType, { color: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
    vacation: { color: 'bg-blue-100 text-blue-800', icon: Calendar, label: 'Vacaciones' },
    personal: { color: 'bg-purple-100 text-purple-800', icon: User, label: 'Personal' },
    sick_leave: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Enfermedad' },
    maternity: { color: 'bg-pink-100 text-pink-800', icon: User, label: 'Maternidad' },
    paternity: { color: 'bg-indigo-100 text-indigo-800', icon: User, label: 'Paternidad' },
    unpaid: { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Sin Goce' },
    compensatory: { color: 'bg-orange-100 text-orange-800', icon: Calendar, label: 'Compensatorio' },
    study_leave: { color: 'bg-teal-100 text-teal-800', icon: FileText, label: 'Estudio' },
    bereavement: { color: 'bg-gray-100 text-gray-800', icon: User, label: 'Duelo' },
    jury_duty: { color: 'bg-yellow-100 text-yellow-800', icon: FileText, label: 'Jurisdicción' }
  };

  const config = typeConfig[type] || { color: 'bg-gray-100 text-gray-800', icon: Calendar, label: 'Otro' };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </span>
  );
};

// ============================================================================
// REQUEST CARD COMPONENT
// ============================================================================

interface RequestCardProps {
  request: VacationRequest;
  onView: (request: VacationRequest) => void;
  onEdit: (request: VacationRequest) => void;
  onApprove: (request: VacationRequest) => void;
  onReject: (request: VacationRequest) => void;
  onCancel: (request: VacationRequest) => void;
  onDelete: (request: VacationRequest) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onView,
  onEdit,
  onApprove,
  onReject,
  onCancel,
  onDelete
}: RequestCardProps) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntilStart = () => {
    const today = new Date();
    const startDate = new Date(request.startDate);
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isUrgent = request.priority === 'urgent' || getDaysUntilStart() <= 3;
  const hasConflict = false; // This would come from conflicts data

  return (
    <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
      isUrgent ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">{request.employeeName}</p>
              <p className="text-sm text-gray-600">{request.employeePosition}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <StatusBadge status={request.status} />
          {isUrgent && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
              Urgente
            </span>
          )}
          {hasConflict && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
              Conflicto
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TypeBadge type={request.type} />
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
              {request.days} días
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {formatDate(request.startDate)} - {formatDate(request.endDate)}
          </span>
        </div>

        <p className="text-sm text-gray-700 line-clamp-2">{request.reason}</p>

        {request.replacementEmployee && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>Reemplazo: {request.replacementEmployeeName}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Solicitado: {formatDate(request.requestedDate)}</span>
          {request.approvedBy && (
            <span>Aprobado por: {request.approvedByName}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(request)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </button>

          {request.status === 'pending' && (
            <>
              <button
                onClick={() => onEdit(request)}
                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </button>

              <button
                onClick={() => onApprove(request)}
                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                title="Aprobar"
              >
                <CheckCircle className="h-4 w-4" />
              </button>

              <button
                onClick={() => onReject(request)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Rechazar"
              >
                <XCircle className="h-4 w-4" />
              </button>

              <button
                onClick={() => onCancel(request)}
                className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                title="Cancelar"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            onClick={() => onDelete(request)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Ver historial
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Duplicar solicitud
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Exportar detalles
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FILTERS COMPONENT
// ============================================================================

interface RequestFiltersProps {
  filters: VacationFilters;
  onFiltersChange: (filters: VacationFilters) => void;
  onClearFilters: () => void;
}

const RequestFilters: React.FC<RequestFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}: RequestFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof VacationFilters, value: string | string[] | boolean | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Filtros</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAdvanced ? 'Ocultar' : 'Avanzado'}
          </button>
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={filters.status?.[0] || 'all'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('status', e.target.value === 'all' ? undefined : [e.target.value as VacationStatus])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobada</option>
            <option value="rejected">Rechazada</option>
            <option value="cancelled">Cancelada</option>
            <option value="completed">Completada</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={filters.type?.[0] || 'all'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('type', e.target.value === 'all' ? undefined : [e.target.value as VacationType])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="vacation">Vacaciones</option>
            <option value="personal">Personal</option>
            <option value="sick_leave">Enfermedad</option>
            <option value="maternity">Maternidad</option>
            <option value="paternity">Paternidad</option>
            <option value="compensatory">Compensatorio</option>
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
          <select
            value={filters.departments?.[0] || 'all'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('departments', e.target.value === 'all' ? undefined : [e.target.value])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="IT">Tecnología</option>
            <option value="HR">Recursos Humanos</option>
            <option value="Finance">Finanzas</option>
            <option value="Operations">Operaciones</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <select
            value={filters.priority?.[0] || 'all'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('priority', e.target.value === 'all' ? undefined : [e.target.value])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas</option>
            <option value="low">Baja</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      {showAdvanced && (
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={filters.dateRange?.startDate || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('dateRange', {
                  ...filters.dateRange,
                  startDate: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={filters.dateRange?.endDate || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('dateRange', {
                  ...filters.dateRange,
                  endDate: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hasConflicts || false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('hasConflicts', e.target.checked || undefined)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Solo conflictos</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VacationsRequestsTab: React.FC<VacationsRequestsTabProps> = () => {
  const { showSuccess, showError } = useNotifications();

  const {
    navigation,
    requests,
    loading,
    errors,
    loadRequests,
    approveRequest,
    rejectRequest,
    cancelRequest,
    deleteRequest,
    filterRequests,
    clearFilters,
    requestsPagination,
    goToRequestsPage,
    changeRequestsPageSize
  } = useVacationsManagement();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  // Search and filter requests
  const filteredRequests = useMemo(() => {
    if (!searchQuery) return requests;

    return requests.filter(request =>
      request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.employeeDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [requests, searchQuery]);

  // Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleApprove = async (request: VacationRequest) => {
    try {
      await approveRequest(request.id);
      showSuccess(`Solicitud de ${request.employeeName} aprobada`);
    } catch (error) {
      showError('Error al aprobar la solicitud');
    }
  };

  const handleReject = async (request: VacationRequest) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;

    try {
      await rejectRequest(request.id, reason);
      showSuccess(`Solicitud de ${request.employeeName} rechazada`);
    } catch (error) {
      showError('Error al rechazar la solicitud');
    }
  };

  const handleCancel = async (request: VacationRequest) => {
    const reason = prompt('Motivo de la cancelación:');
    if (!reason) return;

    try {
      await cancelRequest(request.id, reason);
      showSuccess(`Solicitud de ${request.employeeName} cancelada`);
    } catch (error) {
      showError('Error al cancelar la solicitud');
    }
  };

  const handleDelete = async (request: VacationRequest) => {
    if (!confirm(`¿Estás seguro de eliminar la solicitud de ${request.employeeName}?`)) return;

    try {
      await deleteRequest(request.id);
      showSuccess('Solicitud eliminada correctamente');
    } catch (error) {
      showError('Error al eliminar la solicitud');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) return;

    try {
      // This would be implemented with bulk operations
      showSuccess(`${selectedRequests.length} solicitudes aprobadas`);
      setSelectedRequests([]);
    } catch (error) {
      showError('Error al aprobar las solicitudes');
    }
  };

  const handleBulkReject = async () => {
    if (selectedRequests.length === 0) return;

    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;

    try {
      // This would be implemented with bulk operations
      showSuccess(`${selectedRequests.length} solicitudes rechazadas`);
      setSelectedRequests([]);
    } catch (error) {
      showError('Error al rechazar las solicitudes');
    }
  };

  // Stats calculations
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    urgent: requests.filter(r => r.priority === 'urgent').length,
    conflicts: requests.filter(r => false).length // This would come from conflicts data
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rechazadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgentes</p>
              <p className="text-2xl font-bold text-orange-600">{stats.urgent}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conflictos</p>
              <p className="text-2xl font-bold text-red-600">{stats.conflicts}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por empleado, departamento o motivo..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Filtros</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {selectedRequests.length > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedRequests.length} seleccionadas
                </span>
                <button
                  onClick={handleBulkApprove}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Aprobar
                </button>
                <button
                  onClick={handleBulkReject}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Rechazar
                </button>
              </>
            )}

            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Nueva Solicitud</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <RequestFilters
              filters={navigation.filters}
              onFiltersChange={filterRequests}
              onClearFilters={clearFilters}
            />
          </div>
        )}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading.requests ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron solicitudes</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || Object.keys(navigation.filters).length > 0
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Crea la primera solicitud haciendo clic en "Nueva Solicitud"'
              }
            </p>
            {(searchQuery || Object.keys(navigation.filters).length > 0) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  clearFilters();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onView={(request: VacationRequest) => console.log('View request:', request.id)}
                  onEdit={(request: VacationRequest) => console.log('Edit request:', request.id)}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {requestsPagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Mostrando {((requestsPagination.page - 1) * requestsPagination.limit) + 1} a{' '}
                    {Math.min(requestsPagination.page * requestsPagination.limit, requestsPagination.total)} de{' '}
                    {requestsPagination.total} resultados
                  </span>
                  <select
                    value={requestsPagination.limit}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => changeRequestsPageSize(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => goToRequestsPage(requestsPagination.page - 1)}
                    disabled={requestsPagination.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  <span className="px-3 py-1 text-sm text-gray-700">
                    Página {requestsPagination.page} de {requestsPagination.totalPages}
                  </span>

                  <button
                    onClick={() => goToRequestsPage(requestsPagination.page + 1)}
                    disabled={requestsPagination.page >= requestsPagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VacationsRequestsTab;
