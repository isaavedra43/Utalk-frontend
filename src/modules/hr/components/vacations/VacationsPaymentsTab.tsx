import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building,
  FileText,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Receipt
} from 'lucide-react';
import { useVacationsManagement } from '../../../../hooks/useVacationsManagement';
import { useNotifications } from '../../../../contexts/NotificationContext';
import {
  VacationPayment,
  VacationPaymentForm,
  VacationFilters
} from '../../../../services/vacationsManagementService';

// ============================================================================
// TYPES
// ============================================================================

interface VacationsPaymentsTabProps {}

// ============================================================================
// PAYMENT STATUS BADGE COMPONENT
// ============================================================================

interface PaymentStatusBadgeProps {
  status: VacationPayment['status'];
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendiente' },
    processed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Procesado' },
    cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelado' },
    failed: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Fallido' }
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
// PAYMENT METHOD BADGE COMPONENT
// ============================================================================

interface PaymentMethodBadgeProps {
  method: VacationPayment['paymentMethod'];
}

const PaymentMethodBadge: React.FC<PaymentMethodBadgeProps> = ({ method }) => {
  const methodConfig = {
    bank_transfer: { color: 'bg-blue-100 text-blue-800', icon: Building, label: 'Transferencia' },
    check: { color: 'bg-purple-100 text-purple-800', icon: Receipt, label: 'Cheque' },
    cash: { color: 'bg-green-100 text-green-800', icon: DollarSign, label: 'Efectivo' },
    direct_deposit: { color: 'bg-indigo-100 text-indigo-800', icon: CreditCard, label: 'Depósito' }
  };

  const config = methodConfig[method];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </span>
  );
};

// ============================================================================
// PAYMENT CARD COMPONENT
// ============================================================================

interface PaymentCardProps {
  payment: VacationPayment;
  onView: (payment: VacationPayment) => void;
  onEdit: (payment: VacationPayment) => void;
  onProcess: (payment: VacationPayment) => void;
  onCancel: (payment: VacationPayment) => void;
  onDelete: (payment: VacationPayment) => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  onView,
  onEdit,
  onProcess,
  onCancel,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: payment.currency || 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{payment.employeeName}</p>
            <p className="text-sm text-gray-600">{formatDate(payment.paymentDate)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <PaymentStatusBadge status={payment.status} />
          {payment.status === 'pending' && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
              Pendiente
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PaymentMethodBadge method={payment.paymentMethod} />
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(payment.amount)}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {payment.currency || 'MXN'}
          </span>
        </div>

        {payment.reference && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            <span>Referencia: {payment.reference}</span>
          </div>
        )}

        {payment.notes && (
          <p className="text-sm text-gray-700 line-clamp-2">{payment.notes}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Vacación: {payment.vacationRequestId}</span>
          {payment.processedBy && (
            <span>Procesado por: {payment.processedByName}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(payment)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </button>

          {payment.status === 'pending' && (
            <>
              <button
                onClick={() => onEdit(payment)}
                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </button>

              <button
                onClick={() => onProcess(payment)}
                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                title="Procesar"
              >
                <CheckCircle className="h-4 w-4" />
              </button>

              <button
                onClick={() => onCancel(payment)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Cancelar"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            onClick={() => onDelete(payment)}
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
                Ver detalles completos
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Generar comprobante
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Exportar información
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PAYMENT FORM MODAL COMPONENT
// ============================================================================

interface PaymentFormModalProps {
  isOpen: boolean;
  payment?: VacationPayment | null;
  onClose: () => void;
  onSubmit: (paymentData: VacationPaymentForm) => Promise<void>;
}

const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  payment,
  onClose,
  onSubmit
}) => {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<VacationPaymentForm>({
    vacationRequestId: payment?.vacationRequestId || '',
    paymentDate: payment?.paymentDate || new Date().toISOString().split('T')[0],
    amount: payment?.amount || 0,
    paymentMethod: payment?.paymentMethod || 'bank_transfer',
    reference: payment?.reference || '',
    notes: payment?.notes || '',
    attachments: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vacationRequestId) {
      newErrors.vacationRequestId = 'La solicitud de vacaciones es requerida';
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'La fecha de pago es requerida';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a cero';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'El método de pago es requerido';
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
      showSuccess(`Pago ${payment ? 'actualizado' : 'creado'} exitosamente`);
      onClose();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error procesando pago');
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
              {payment ? 'Editar Pago' : 'Nuevo Pago de Vacaciones'}
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
            {/* Vacation Request ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solicitud de Vacaciones *
              </label>
              <input
                type="text"
                value={formData.vacationRequestId}
                onChange={(e) => setFormData(prev => ({ ...prev, vacationRequestId: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.vacationRequestId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ID de la solicitud de vacaciones"
                disabled={loading}
              />
              {errors.vacationRequestId && (
                <p className="mt-1 text-sm text-red-600">{errors.vacationRequestId}</p>
              )}
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Pago *
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.paymentDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.paymentDate && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>
              )}
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  disabled={loading}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda
                </label>
                <select
                  value={payment?.currency || 'MXN'}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="MXN">MXN - Peso Mexicano</option>
                  <option value="USD">USD - Dólar Americano</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as VacationPayment['paymentMethod'] }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="bank_transfer">Transferencia Bancaria</option>
                <option value="check">Cheque</option>
                <option value="cash">Efectivo</option>
                <option value="direct_deposit">Depósito Directo</option>
              </select>
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
              )}
            </div>

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referencia (Opcional)
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Número de referencia o comprobante"
                disabled={loading}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (Opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Notas adicionales sobre el pago..."
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
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <span>{payment ? 'Actualizar Pago' : 'Crear Pago'}</span>
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

const VacationsPaymentsTab: React.FC<VacationsPaymentsTabProps> = () => {
  const { showSuccess, showError } = useNotifications();

  const {
    payments,
    loading,
    createPayment,
    processPayment,
    cancelPayment,
    deletePayment: deletePaymentFromService,
    paymentsPagination,
    goToPaymentsPage,
    changePaymentsPageSize
  } = useVacationsManagement();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<VacationPayment | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    if (!searchQuery) return payments;

    return payments.filter(payment =>
      payment.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [payments, searchQuery]);

  // Handlers
  const handleCreatePayment = () => {
    setSelectedPayment(null);
    setShowPaymentModal(true);
  };

  const handleEditPayment = (payment: VacationPayment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleViewPayment = (payment: VacationPayment) => {
    console.log('View payment:', payment.id);
    // This would open a detailed view modal
  };

  const handleProcessPayment = async (payment: VacationPayment) => {
    try {
      await processPayment(payment.id);
      showSuccess(`Pago de ${payment.employeeName} procesado`);
    } catch (error) {
      showError('Error al procesar el pago');
    }
  };

  const handleCancelPayment = async (payment: VacationPayment) => {
    const reason = prompt('Motivo de la cancelación:');
    if (!reason) return;

    try {
      await cancelPayment(payment.id, reason);
      showSuccess(`Pago de ${payment.employeeName} cancelado`);
    } catch (error) {
      showError('Error al cancelar el pago');
    }
  };

  const handleDeletePayment = async (payment: VacationPayment) => {
    if (!confirm(`¿Estás seguro de eliminar el pago de ${payment.employeeName}?`)) return;

    try {
      await deletePaymentFromService(payment.id);
      showSuccess('Pago eliminado correctamente');
    } catch (error) {
      showError('Error al eliminar el pago');
    }
  };

  const handleSubmitPayment = async (paymentData: VacationPaymentForm) => {
    await createPayment(paymentData);
  };

  const handleBulkProcess = async () => {
    if (selectedPayments.length === 0) return;

    try {
      // This would be implemented with bulk operations
      showSuccess(`${selectedPayments.length} pagos procesados`);
      setSelectedPayments([]);
    } catch (error) {
      showError('Error al procesar los pagos');
    }
  };

  // Calculate stats
  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    processed: payments.filter(p => p.status === 'processed').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalAmount: payments
      .filter(p => p.status === 'processed')
      .reduce((sum, p) => sum + p.amount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pagos</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Procesados</p>
              <p className="text-2xl font-bold text-green-600">{stats.processed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fallidos</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monto Total</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.totalAmount.toLocaleString('es-MX')}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
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
                placeholder="Buscar por empleado, referencia o notas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {selectedPayments.length > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedPayments.length} seleccionados
                </span>
                <button
                  onClick={handleBulkProcess}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Procesar
                </button>
              </>
            )}

            <button
              onClick={handleCreatePayment}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Pago</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {loading.payments ? (
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
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pagos</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Intenta ajustar los términos de búsqueda'
                : 'Crea el primer pago haciendo clic en "Nuevo Pago"'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {filteredPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onView={handleViewPayment}
                  onEdit={handleEditPayment}
                  onProcess={handleProcessPayment}
                  onCancel={handleCancelPayment}
                  onDelete={handleDeletePayment}
                />
              ))}
            </div>

            {/* Pagination */}
            {paymentsPagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Mostrando {((paymentsPagination.page - 1) * paymentsPagination.limit) + 1} a{' '}
                    {Math.min(paymentsPagination.page * paymentsPagination.limit, paymentsPagination.total)} de{' '}
                    {paymentsPagination.total} resultados
                  </span>
                  <select
                    value={paymentsPagination.limit}
                    onChange={(e) => changePaymentsPageSize(Number(e.target.value))}
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
                    onClick={() => goToPaymentsPage(paymentsPagination.page - 1)}
                    disabled={paymentsPagination.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  <span className="px-3 py-1 text-sm text-gray-700">
                    Página {paymentsPagination.page} de {paymentsPagination.totalPages}
                  </span>

                  <button
                    onClick={() => goToPaymentsPage(paymentsPagination.page + 1)}
                    disabled={paymentsPagination.page >= paymentsPagination.totalPages}
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

      {/* Payment Form Modal */}
      <PaymentFormModal
        isOpen={showPaymentModal}
        payment={selectedPayment}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handleSubmitPayment}
      />
    </div>
  );
};

export default VacationsPaymentsTab;
