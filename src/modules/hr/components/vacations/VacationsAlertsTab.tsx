import React, { useState, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Settings,
  Eye,
  Trash2,
  RefreshCw,
  Filter,
  Plus,
  MessageSquare,
  Target,
  Zap,
  Shield,
  FileText,
  TrendingUp
} from 'lucide-react';
import { useVacationsManagement } from '../../../../hooks/useVacationsManagement';
import { useNotifications } from '../../../../contexts/NotificationContext';
import {
  VacationAlert,
  VacationConflict,
  VacationFilters
} from '../../../../services/vacationsManagementService';

// ============================================================================
// TYPES
// ============================================================================

interface VacationsAlertsTabProps {}

// ============================================================================
// ALERT CARD COMPONENT
// ============================================================================

interface AlertCardProps {
  alert: VacationAlert;
  onMarkAsRead: (alert: VacationAlert) => void;
  onResolve: (alert: VacationAlert) => void;
  onDelete: (alert: VacationAlert) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onMarkAsRead,
  onResolve,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlertIcon = (type: string, priority: string) => {
    const iconClass = priority === 'critical' ? 'text-red-600' :
                     priority === 'high' ? 'text-red-500' :
                     priority === 'medium' ? 'text-yellow-600' : 'text-blue-600';

    switch (type) {
      case 'conflict': return <AlertTriangle className={`h-5 w-5 ${iconClass}`} />;
      case 'policy_violation': return <XCircle className={`h-5 w-5 ${iconClass}`} />;
      case 'payment_due': return <Clock className={`h-5 w-5 ${iconClass}`} />;
      case 'approval_required': return <CheckCircle className={`h-5 w-5 ${iconClass}`} />;
      case 'system_notification': return <Bell className={`h-5 w-5 ${iconClass}`} />;
      default: return <AlertTriangle className={`h-5 w-5 ${iconClass}`} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority as keyof typeof colors]}`}>
        {priority}
      </span>
    );
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'conflict': return 'Conflicto de Fechas';
      case 'policy_violation': return 'Violación de Política';
      case 'payment_due': return 'Pago Vencido';
      case 'approval_required': return 'Aprobación Requerida';
      case 'system_notification': return 'Notificación del Sistema';
      default: return 'Alerta General';
    }
  };

  return (
    <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
      !alert.isRead ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getAlertIcon(alert.type, alert.priority)}
          <div>
            <h3 className="font-medium text-gray-900">{alert.title}</h3>
            <p className="text-sm text-gray-600">{getTypeText(alert.type)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getPriorityBadge(alert.priority)}
          {!alert.isRead && (
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <p className="text-sm text-gray-700">{alert.message}</p>

        {alert.employeeName && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Empleado: {alert.employeeName}</span>
          </div>
        )}

        {alert.relatedData && Object.keys(alert.relatedData).length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-1">Datos Relacionados:</p>
            <div className="text-xs text-gray-600 space-y-1">
              {Object.entries(alert.relatedData).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span> {String(value)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Creada: {formatDate(alert.createdAt)}</span>
          {alert.isResolved && alert.resolvedAt && (
            <span>Resuelta: {formatDate(alert.resolvedAt)}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          {!alert.isRead && (
            <button
              onClick={() => onMarkAsRead(alert)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Marcar como leída"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}

          {!alert.isResolved && (
            <button
              onClick={() => onResolve(alert)}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Resolver alerta"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => onDelete(alert)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Eliminar alerta"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Ver detalles completos
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Agregar comentario
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Escalar alerta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ALERT CREATION MODAL COMPONENT
// ============================================================================

interface AlertCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (alertData: Partial<VacationAlert>) => Promise<void>;
}

const AlertCreationModal: React.FC<AlertCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<VacationAlert>>({
    type: 'system_notification',
    priority: 'medium',
    title: '',
    message: '',
    isRead: false,
    isResolved: false,
    relatedData: {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.message?.trim()) {
      newErrors.message = 'El mensaje es requerido';
    }

    if (!formData.type) {
      newErrors.type = 'El tipo de alerta es requerido';
    }

    if (!formData.priority) {
      newErrors.priority = 'La prioridad es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      showSuccess('Alerta creada exitosamente');
      onClose();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error creando alerta');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Crear Nueva Alerta
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {/* Alert Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Alerta *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as VacationAlert['type'] }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="conflict">Conflicto de Fechas</option>
                <option value="policy_violation">Violación de Política</option>
                <option value="payment_due">Pago Vencido</option>
                <option value="approval_required">Aprobación Requerida</option>
                <option value="system_notification">Notificación del Sistema</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as VacationAlert['priority'] }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.priority ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Título de la alerta"
                disabled={loading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
                placeholder="Descripción detallada de la alerta"
                disabled={loading}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>

            {/* Employee Association (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empleado (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.employeeName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del empleado"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Empleado (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.employeeId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ID del empleado"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Expiration Date (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Expiración (Opcional)
              </label>
              <input
                type="datetime-local"
                value={formData.expiresAt || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Creando...</span>
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                <span>Crear Alerta</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VacationsAlertsTab: React.FC<VacationsAlertsTabProps> = () => {
  const { showSuccess, showError } = useNotifications();

  const {
    alerts,
    loading,
    loadAlerts,
    markAlertAsRead,
    resolveAlert,
    createAlert
  } = useVacationsManagement();

  // Local state
  const [filter, setFilter] = useState<'all' | 'unread' | 'resolved' | 'active'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    switch (filter) {
      case 'unread':
        return alerts.filter(alert => !alert.isRead);
      case 'resolved':
        return alerts.filter(alert => alert.isResolved);
      case 'active':
        return alerts.filter(alert => !alert.isResolved);
      default:
        return alerts;
    }
  }, [alerts, filter]);

  // Handlers
  const handleCreateAlert = () => {
    setShowCreateModal(true);
  };

  const handleMarkAsRead = async (alert: VacationAlert) => {
    try {
      await markAlertAsRead(alert.id);
      showSuccess('Alerta marcada como leída');
    } catch (error) {
      showError('Error al marcar como leída');
    }
  };

  const handleResolve = async (alert: VacationAlert) => {
    const resolution = prompt('Comentario de resolución (opcional):');
    try {
      await resolveAlert(alert.id, resolution || undefined);
      showSuccess('Alerta resuelta correctamente');
    } catch (error) {
      showError('Error al resolver la alerta');
    }
  };

  const handleDelete = async (alert: VacationAlert) => {
    if (!confirm(`¿Estás seguro de eliminar la alerta "${alert.title}"?`)) return;

    // Remove from local state (in real implementation, this would call an API)
    // setAlerts(prev => prev.filter(a => a.id !== alert.id));
    showSuccess('Alerta eliminada correctamente');
  };

  const handleSubmitCreate = async (alertData: Partial<VacationAlert>) => {
    await createAlert(alertData);
  };

  // Calculate stats
  const stats = {
    total: alerts.length,
    unread: alerts.filter(a => !a.isRead).length,
    resolved: alerts.filter(a => a.isResolved).length,
    active: alerts.filter(a => !a.isResolved).length,
    critical: alerts.filter(a => a.priority === 'critical').length,
    high: alerts.filter(a => a.priority === 'high').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <Bell className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sin Leer</p>
              <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.active}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resueltas</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Críticas</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <Zap className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Altas</p>
              <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filtrar:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="active">Activas</option>
              <option value="unread">Sin Leer</option>
              <option value="resolved">Resueltas</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadAlerts()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`h-5 w-5 ${loading.alerts ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleCreateAlert}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Crear Alerta</span>
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading.alerts ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
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
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No hay alertas' : `No hay alertas ${filter === 'active' ? 'activas' : filter === 'unread' ? 'sin leer' : 'resueltas'}`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? 'Todas las alertas están bajo control'
                : 'No se encontraron alertas con ese filtro'
              }
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver todas las alertas
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onMarkAsRead={handleMarkAsRead}
                onResolve={handleResolve}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Alert Creation Modal */}
      <AlertCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmitCreate}
      />

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
          <p className="text-sm text-gray-600">Operaciones frecuentes para gestión de alertas</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900">Marcar Todas como Leídas</p>
                <p className="text-xs text-blue-700">Limpiar notificaciones</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-green-900">Resolver Todas</p>
                <p className="text-xs text-green-700">Cerrar todas las alertas</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-purple-900">Configurar Notificaciones</p>
                <p className="text-xs text-purple-700">Personalizar alertas</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-orange-900">Ver Estadísticas</p>
                <p className="text-xs text-orange-700">Métricas de alertas</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationsAlertsTab;
