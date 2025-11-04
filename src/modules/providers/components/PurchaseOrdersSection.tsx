import React, { useState } from 'react';
import { Plus, Edit3, Trash2, FileText, Package, Calendar, DollarSign, CheckCircle, XCircle, Clock, Truck, X, Save, AlertCircle } from 'lucide-react';
import type { PurchaseOrder, PurchaseOrderItem, ProviderMaterial } from '../types';

interface PurchaseOrdersSectionProps {
  providerId: string;
  orders: PurchaseOrder[];
  materials: ProviderMaterial[];
  onCreateOrder: (order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'createdBy' | 'createdByName'>) => Promise<void>;
  onUpdateOrder: (id: string, updates: Partial<PurchaseOrder>) => Promise<void>;
  onDeleteOrder: (id: string) => Promise<void>;
}

export const PurchaseOrdersSection: React.FC<PurchaseOrdersSectionProps> = ({
  providerId,
  orders,
  materials,
  onCreateOrder,
  onUpdateOrder,
  onDeleteOrder,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [formData, setFormData] = useState({
    notes: '',
    internalNotes: '',
    expectedDeliveryDate: '',
    deliveryAddress: '',
    deliveryNotes: '',
    tax: '16',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const statusConfig = {
    draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: FileText },
    sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-700', icon: Clock },
    accepted: { label: 'Aceptada', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-700', icon: XCircle },
    in_transit: { label: 'En tránsito', color: 'bg-purple-100 text-purple-700', icon: Truck },
    delivered: { label: 'Entregada', color: 'bg-emerald-100 text-emerald-700', icon: Package },
    cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-500', icon: XCircle },
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

  const calculateTotals = (items: PurchaseOrderItem[], taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const addItemToOrder = (material: ProviderMaterial) => {
    const existingItem = orderItems.find(item => item.materialId === material.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.materialId === material.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      const newItem: PurchaseOrderItem = {
        id: `temp-${Date.now()}`,
        materialId: material.id,
        materialName: material.name,
        quantity: 1,
        unitPrice: material.unitPrice,
        unit: material.unit,
        subtotal: material.unitPrice,
      };
      setOrderItems([...orderItems, newItem]);
    }
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter(item => item.id !== itemId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.id === itemId
          ? { ...item, quantity, subtotal: quantity * item.unitPrice }
          : item
      ));
    }
  };

  const removeItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const resetForm = () => {
    setFormData({
      notes: '',
      internalNotes: '',
      expectedDeliveryDate: '',
      deliveryAddress: '',
      deliveryNotes: '',
      tax: '16',
    });
    setOrderItems([]);
    setErrors({});
    setEditingOrder(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (orderItems.length === 0) {
      newErrors.items = 'Debes agregar al menos un material';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const taxRate = parseFloat(formData.tax) || 0;
      const totals = calculateTotals(orderItems, taxRate);

      const orderData = {
        providerId,
        providerName: '', // This will be filled by the backend
        status: 'draft' as const,
        items: orderItems,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        notes: formData.notes.trim() || undefined,
        internalNotes: formData.internalNotes.trim() || undefined,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
        deliveryAddress: formData.deliveryAddress.trim() || undefined,
        deliveryNotes: formData.deliveryNotes.trim() || undefined,
      };

      if (editingOrder) {
        await onUpdateOrder(editingOrder.id, orderData);
      } else {
        await onCreateOrder(orderData);
      }

      resetForm();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error guardando orden:', error);
      setErrors({ submit: 'Error al guardar la orden' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (order: PurchaseOrder, newStatus: PurchaseOrder['status']) => {
    try {
      const updates: Partial<PurchaseOrder> = { status: newStatus };
      
      if (newStatus === 'sent' && !order.sentAt) {
        updates.sentAt = new Date().toISOString();
      }
      if (newStatus === 'accepted' && !order.acceptedAt) {
        updates.acceptedAt = new Date().toISOString();
      }
      if (newStatus === 'delivered' && !order.deliveredAt) {
        updates.deliveredAt = new Date().toISOString();
      }

      await onUpdateOrder(order.id, updates);
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const handleDelete = async (order: PurchaseOrder) => {
    if (window.confirm(`¿Eliminar la orden ${order.orderNumber}?`)) {
      try {
        await onDeleteOrder(order.id);
      } catch (error) {
        console.error('Error eliminando orden:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Órdenes de Compra</h3>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'}
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
          <span className="hidden sm:inline">Nueva Orden</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No hay órdenes de compra</p>
          <p className="text-sm text-gray-400 mt-1">Crea la primera orden para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">#{order.orderNumber}</h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[order.status].label}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Creada: {formatDate(order.createdAt)}</span>
                      </div>
                      {order.expectedDeliveryDate && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <span>Entrega esperada: {formatDate(order.expectedDeliveryDate)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span>{order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-lg font-semibold text-gray-900">
                        Total: {formatCurrency(order.total)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setViewingOrder(order)}
                      className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Ver Detalle
                    </button>
                    
                    {order.status === 'draft' && (
                      <button
                        onClick={() => handleStatusChange(order, 'sent')}
                        className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        Enviar
                      </button>
                    )}
                    
                    {order.status === 'sent' && (
                      <button
                        onClick={() => handleStatusChange(order, 'accepted')}
                        className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        Aceptar
                      </button>
                    )}
                    
                    {(order.status === 'accepted' || order.status === 'in_transit') && (
                      <button
                        onClick={() => handleStatusChange(order, 'delivered')}
                        className="px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                      >
                        Marcar Entregada
                      </button>
                    )}
                    
                    {order.status === 'draft' && (
                      <button
                        onClick={() => handleDelete(order)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingOrder ? 'Editar Orden' : 'Nueva Orden de Compra'}
              </h3>
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

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Select Materials */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Seleccionar Materiales</h4>
                {materials.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No hay materiales disponibles</p>
                    <p className="text-xs text-gray-400 mt-1">Agrega materiales primero en la sección de Materiales</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                    {materials.filter(m => m.isActive).map((material) => (
                      <button
                        key={material.id}
                        type="button"
                        onClick={() => addItemToOrder(material)}
                        className="p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">{material.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatCurrency(material.unitPrice)} / {material.unit}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Artículos de la Orden</h4>
                {errors.items && (
                  <p className="text-sm text-red-600 mb-2">{errors.items}</p>
                )}
                {orderItems.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No hay artículos en la orden</p>
                    <p className="text-xs text-gray-400 mt-1">Selecciona materiales arriba para agregarlos</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.materialName}</p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(item.unitPrice)} / {item.unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.id, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-sm text-gray-600 w-16 text-right">
                            {formatCurrency(item.subtotal)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals */}
              {orderItems.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(calculateTotals(orderItems, parseFloat(formData.tax) || 0).subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">IVA:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.tax}
                        onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                    <span className="font-medium">{formatCurrency(calculateTotals(orderItems, parseFloat(formData.tax) || 0).tax)}</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">{formatCurrency(calculateTotals(orderItems, parseFloat(formData.tax) || 0).total)}</span>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Entrega Esperada
                  </label>
                  <input
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección de Entrega
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Dirección completa..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas para el Proveedor
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Notas visibles para el proveedor..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Internas
                  </label>
                  <textarea
                    value={formData.internalNotes}
                    onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Notas internas (no visibles para el proveedor)..."
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
                  {saving ? 'Guardando...' : 'Guardar Orden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Detail Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Orden #{viewingOrder.orderNumber}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${statusConfig[viewingOrder.status].color}`}>
                  {React.createElement(statusConfig[viewingOrder.status].icon, { className: 'w-3 h-3' })}
                  {statusConfig[viewingOrder.status].label}
                </span>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha de Creación</p>
                  <p className="text-base font-medium text-gray-900 mt-1">{formatDate(viewingOrder.createdAt)}</p>
                </div>
                {viewingOrder.expectedDeliveryDate && (
                  <div>
                    <p className="text-sm text-gray-500">Entrega Esperada</p>
                    <p className="text-base font-medium text-gray-900 mt-1">{formatDate(viewingOrder.expectedDeliveryDate)}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Artículos</h4>
                <div className="space-y-2">
                  {viewingOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.materialName}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(viewingOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA:</span>
                  <span className="font-medium">{formatCurrency(viewingOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{formatCurrency(viewingOrder.total)}</span>
                </div>
              </div>

              {/* Notes */}
              {viewingOrder.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Notas para el Proveedor</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{viewingOrder.notes}</p>
                </div>
              )}

              {viewingOrder.internalNotes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Notas Internas</h4>
                  <p className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-3">{viewingOrder.internalNotes}</p>
                </div>
              )}

              {viewingOrder.deliveryAddress && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Dirección de Entrega</h4>
                  <p className="text-sm text-gray-600">{viewingOrder.deliveryAddress}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setViewingOrder(null)}
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

