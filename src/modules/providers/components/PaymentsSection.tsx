import React, { useState } from 'react';
import { Plus, DollarSign, Calendar, CreditCard, Check, X, Clock, FileText, Save, AlertCircle, Download } from 'lucide-react';
import type { Payment, PurchaseOrder } from '../types';

interface PaymentsSectionProps {
  providerId: string;
  payments: Payment[];
  purchaseOrders: PurchaseOrder[];
  onCreatePayment: (payment: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt' | 'createdBy' | 'createdByName'>) => Promise<void>;
  onUpdatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
  onDeletePayment: (id: string) => Promise<void>;
}

export const PaymentsSection: React.FC<PaymentsSectionProps> = ({
  providerId,
  payments,
  purchaseOrders,
  onCreatePayment,
  onUpdatePayment,
  onDeletePayment,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    purchaseOrderId: '',
    amount: '',
    paymentMethod: 'transfer' as Payment['paymentMethod'],
    reference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const paymentMethodConfig = {
    cash: { label: 'Efectivo', icon: DollarSign, color: 'text-green-600' },
    transfer: { label: 'Transferencia', icon: CreditCard, color: 'text-blue-600' },
    check: { label: 'Cheque', icon: FileText, color: 'text-purple-600' },
    card: { label: 'Tarjeta', icon: CreditCard, color: 'text-pink-600' },
    other: { label: 'Otro', icon: DollarSign, color: 'text-gray-600' },
  };

  const statusConfig = {
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    completed: { label: 'Completado', color: 'bg-green-100 text-green-700', icon: Check },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: X },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const resetForm = () => {
    setFormData({
      purchaseOrderId: '',
      amount: '',
      paymentMethod: 'transfer',
      reference: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'La fecha es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const selectedOrder = purchaseOrders.find(o => o.id === formData.purchaseOrderId);

      const paymentData = {
        providerId,
        providerName: '', // Will be filled by backend
        purchaseOrderId: formData.purchaseOrderId || undefined,
        orderNumber: selectedOrder?.orderNumber,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        reference: formData.reference.trim() || undefined,
        status: 'completed' as const,
        notes: formData.notes.trim() || undefined,
        paymentDate: formData.paymentDate,
      };

      await onCreatePayment(paymentData);

      resetForm();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error guardando pago:', error);
      setErrors({ submit: 'Error al guardar el pago' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (payment: Payment, newStatus: Payment['status']) => {
    try {
      await onUpdatePayment(payment.id, { status: newStatus });
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const handleDelete = async (payment: Payment) => {
    if (window.confirm(`¿Eliminar el pago ${payment.paymentNumber}?`)) {
      try {
        await onDeletePayment(payment.id);
      } catch (error) {
        console.error('Error eliminando pago:', error);
      }
    }
  };

  // Get pending orders (delivered but not fully paid)
  const deliveredOrders = purchaseOrders.filter(o => o.status === 'delivered');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pagos</h3>
          <p className="text-sm text-gray-500 mt-1">
            {payments.length} {payments.length === 1 ? 'pago' : 'pagos'} registrados
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Registrar Pago</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No hay pagos registrados</p>
          <p className="text-sm text-gray-400 mt-1">Registra el primer pago para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const StatusIcon = statusConfig[payment.status].icon;
            const MethodIcon = paymentMethodConfig[payment.paymentMethod].icon;
            
            return (
              <div
                key={payment.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">#{payment.paymentNumber}</h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[payment.status].color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[payment.status].label}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(payment.paymentDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MethodIcon className={`w-4 h-4 ${paymentMethodConfig[payment.paymentMethod].color}`} />
                        <span>{paymentMethodConfig[payment.paymentMethod].label}</span>
                      </div>
                      {payment.reference && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span>Ref: {payment.reference}</span>
                        </div>
                      )}
                      {payment.orderNumber && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span>Orden: #{payment.orderNumber}</span>
                        </div>
                      )}
                    </div>

                    {payment.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic">{payment.notes}</p>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(payment.amount)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setViewingPayment(payment)}
                      className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors whitespace-nowrap"
                    >
                      Ver Detalle
                    </button>
                    
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(payment, 'completed')}
                        className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded transition-colors whitespace-nowrap"
                      >
                        Completar
                      </button>
                    )}
                    
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(payment)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors whitespace-nowrap"
                      >
                        Eliminar
                      </button>
                    )}

                    {payment.receiptUrl && (
                      <a
                        href={payment.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors whitespace-nowrap"
                      >
                        <Download className="w-3 h-3" />
                        Recibo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Registrar Pago</h3>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Purchase Order */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orden de Compra (Opcional)
                  </label>
                  <select
                    value={formData.purchaseOrderId}
                    onChange={(e) => setFormData({ ...formData, purchaseOrderId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pago general (no relacionado a una orden)</option>
                    {deliveredOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        #{order.orderNumber} - {formatCurrency(order.total)} - {formatDate(order.deliveredAt || order.createdAt)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Selecciona una orden si este pago corresponde a una orden específica
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto del Pago *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
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
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.paymentDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.paymentDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.paymentDate}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pago *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as Payment['paymentMethod'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(paymentMethodConfig).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referencia / Folio
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: 123456, CHK-001, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Número de transferencia, cheque, etc.
                  </p>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Notas adicionales sobre el pago..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(false);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Registrar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Payment Detail Modal */}
      {viewingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pago #{viewingPayment.paymentNumber}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${statusConfig[viewingPayment.status].color}`}>
                  {React.createElement(statusConfig[viewingPayment.status].icon, { className: 'w-3 h-3' })}
                  {statusConfig[viewingPayment.status].label}
                </span>
              </div>
              <button
                onClick={() => setViewingPayment(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Amount */}
              <div className="text-center py-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Monto del Pago</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(viewingPayment.amount)}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha de Pago</p>
                  <p className="text-base font-medium text-gray-900 mt-1">{formatDate(viewingPayment.paymentDate)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Método de Pago</p>
                  <div className="flex items-center gap-2 mt-1">
                    {React.createElement(paymentMethodConfig[viewingPayment.paymentMethod].icon, {
                      className: `w-4 h-4 ${paymentMethodConfig[viewingPayment.paymentMethod].color}`
                    })}
                    <p className="text-base font-medium text-gray-900">
                      {paymentMethodConfig[viewingPayment.paymentMethod].label}
                    </p>
                  </div>
                </div>

                {viewingPayment.reference && (
                  <div>
                    <p className="text-sm text-gray-500">Referencia</p>
                    <p className="text-base font-medium text-gray-900 mt-1">{viewingPayment.reference}</p>
                  </div>
                )}

                {viewingPayment.orderNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Orden Relacionada</p>
                    <p className="text-base font-medium text-gray-900 mt-1">#{viewingPayment.orderNumber}</p>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">Registrado por</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {viewingPayment.createdByName} - {formatDate(viewingPayment.createdAt)}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {viewingPayment.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Notas</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{viewingPayment.notes}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              {viewingPayment.receiptUrl && (
                <a
                  href={viewingPayment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar Recibo
                </a>
              )}
              <button
                onClick={() => setViewingPayment(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

