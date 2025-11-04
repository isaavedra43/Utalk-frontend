import React, { useState, useRef } from 'react';
import { Plus, DollarSign, Calendar, CreditCard, Check, X, Clock, FileText, Save, AlertCircle, Download, Upload, Image as ImageIcon, Trash2, Eye } from 'lucide-react';
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
  const [selectedFiles, setSelectedFiles] = useState<Array<{
    file: File;
    preview: string;
    id: string;
  }>>([]);
  const [viewingAttachment, setViewingAttachment] = useState<{ data: string; name: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    setSelectedFiles([]);
    setErrors({});
  };

  // Convertir archivo a base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Error al convertir el archivo'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Manejar selección de archivos
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: Array<{ file: File; preview: string; id: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validar tamaño (máximo 10MB por archivo)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, files: `El archivo ${file.name} excede el tamaño máximo de 10MB` });
        continue;
      }

      // Validar tipo
      const isImage = file.type.startsWith('image/');
      const isDocument = file.type.includes('pdf') || 
                        file.type.includes('word') || 
                        file.type.includes('excel') ||
                        file.type.includes('text') ||
                        file.type.includes('document');

      if (!isImage && !isDocument) {
        setErrors({ ...errors, files: `El archivo ${file.name} no es una imagen o documento válido` });
        continue;
      }

      // Crear preview (para imágenes)
      let preview = '';
      if (isImage) {
        preview = URL.createObjectURL(file);
      } else {
        preview = ''; // Los documentos no tienen preview visual
      }

      newFiles.push({
        file,
        preview,
        id: `${Date.now()}-${i}-${Math.random()}`,
      });
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setErrors({ ...errors, files: '' });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Eliminar archivo seleccionado
  const removeFile = (id: string) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  // Obtener tipo de archivo
  const getFileType = (mimeType: string): 'image' | 'document' => {
    if (mimeType.startsWith('image/')) return 'image';
    return 'document';
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

      // Convertir archivos a base64
      const attachments = await Promise.all(
        selectedFiles.map(async (fileData) => {
          const base64 = await convertFileToBase64(fileData.file);
          return {
            id: fileData.id,
            name: fileData.file.name,
            type: getFileType(fileData.file.type) as 'image' | 'document',
            data: base64,
            mimeType: fileData.file.type,
            size: fileData.file.size,
          };
        })
      );

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
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      await onCreatePayment(paymentData);

      // Limpiar previews
      selectedFiles.forEach((f) => {
        if (f.preview) {
          URL.revokeObjectURL(f.preview);
        }
      });

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

                {/* File Attachments */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjuntar Imágenes o Documentos
                  </label>
                  
                  {/* Input de archivos */}
                  <div className="mb-3">
                    <label className="cursor-pointer">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Seleccionar archivos (imágenes o documentos)
                        </span>
                      </div>
                    </label>
                    {errors.files && (
                      <p className="text-sm text-red-600 mt-1">{errors.files}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Puedes seleccionar múltiples archivos. Tamaño máximo por archivo: 10MB
                    </p>
                  </div>

                  {/* Preview de archivos seleccionados */}
                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedFiles.map((fileData) => (
                        <div
                          key={fileData.id}
                          className="relative bg-gray-50 border border-gray-200 rounded-lg p-2"
                        >
                          {fileData.preview ? (
                            // Imagen
                            <div className="relative">
                              <img
                                src={fileData.preview}
                                alt={fileData.file.name}
                                className="w-full h-24 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => removeFile(fileData.id)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                title="Eliminar"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            // Documento
                            <div className="relative">
                              <div className="w-full h-24 bg-blue-50 border border-blue-200 rounded flex items-center justify-center">
                                <FileText className="w-8 h-8 text-blue-600" />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(fileData.id)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                title="Eliminar"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          <p className="text-xs text-gray-600 mt-1 truncate" title={fileData.file.name}>
                            {fileData.file.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatFileSize(fileData.file.size)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
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

              {/* Attachments */}
              {viewingPayment.attachments && viewingPayment.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Archivos Adjuntos ({viewingPayment.attachments.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {viewingPayment.attachments.map((attachment, index) => (
                      <div
                        key={attachment.id || index}
                        className="relative bg-gray-50 border border-gray-200 rounded-lg p-2 group hover:shadow-md transition-shadow"
                      >
                        {attachment.type === 'image' ? (
                          // Imagen
                          <div className="relative">
                            <img
                              src={attachment.data}
                              alt={attachment.name}
                              className="w-full h-32 object-cover rounded cursor-pointer"
                              onClick={() => setViewingAttachment({
                                data: attachment.data,
                                name: attachment.name,
                                type: attachment.type,
                              })}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded flex items-center justify-center">
                              <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ) : (
                          // Documento
                          <div
                            className="w-full h-32 bg-blue-50 border border-blue-200 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => {
                              // Abrir documento en nueva pestaña
                              const link = document.createElement('a');
                              link.href = attachment.data;
                              link.target = '_blank';
                              link.download = attachment.name;
                              link.click();
                            }}
                          >
                            <FileText className="w-8 h-8 text-blue-600 mb-2" />
                            <p className="text-xs text-blue-600 text-center px-1">
                              {attachment.name.length > 15 
                                ? `${attachment.name.substring(0, 15)}...` 
                                : attachment.name}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-600 mt-1 truncate" title={attachment.name}>
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>
                    ))}
                  </div>
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

      {/* Modal para ver imagen en grande */}
      {viewingAttachment && viewingAttachment.type === 'image' && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"
          onClick={() => setViewingAttachment(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setViewingAttachment(null)}
              className="absolute -top-10 right-0 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-900" />
            </button>
            <img
              src={viewingAttachment.data}
              alt={viewingAttachment.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white text-center mt-4">{viewingAttachment.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

