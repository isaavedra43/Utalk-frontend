import React from 'react';
import {
  X,
  Calendar,
  Clock,
  FileText,
  Download,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Paperclip,
  Eye
} from 'lucide-react';
import type { VacationRequest } from '../../../services/vacationsService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface VacationRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: VacationRequest | null;
  onDownloadAttachment?: (attachmentId: string, filename: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const VacationRequestDetailsModal: React.FC<VacationRequestDetailsModalProps> = ({
  isOpen,
  onClose,
  request,
  onDownloadAttachment
}) => {
  if (!isOpen || !request) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vacation': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'personal': return <User className="h-4 w-4 text-purple-600" />;
      case 'sick_leave': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'maternity': return <CheckCircle className="h-4 w-4 text-pink-600" />;
      case 'paternity': return <CheckCircle className="h-4 w-4 text-indigo-600" />;
      case 'compensatory': return <Clock className="h-4 w-4 text-amber-600" />;
      case 'unpaid': return <DollarSign className="h-4 w-4 text-gray-600" />;
      default: return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'vacation': return 'Vacaciones';
      case 'personal': return 'Personal';
      case 'sick_leave': return 'Enfermedad';
      case 'maternity': return 'Maternidad';
      case 'paternity': return 'Paternidad';
      case 'compensatory': return 'Compensatorio';
      case 'unpaid': return 'Sin Goce';
      default: return 'Otro';
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Detalles de Solicitud de Vacaciones
                  </h3>
                  <p className="text-sm text-blue-100">
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Información General</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <strong>Período:</strong> {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <strong>Días:</strong> {request.days} días
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(request.type)}
                      <span className="text-sm text-gray-600">
                        <strong>Tipo:</strong> {getTypeText(request.type)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        <strong>Estado:</strong> {getStatusText(request.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Fechas</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <strong>Solicitado:</strong> {formatDate(request.requestedDate)}
                      </span>
                    </div>
                    {request.approvedDate && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          <strong>Aprobado:</strong> {formatDate(request.approvedDate)}
                        </span>
                      </div>
                    )}
                    {request.approvedBy && (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          <strong>Aprobado por:</strong> {request.approvedByName || request.approvedBy}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Motivo */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Motivo</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {request.reason}
                </p>
              </div>

              {/* Comentarios */}
              {request.comments && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Comentarios</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {request.comments}
                  </p>
                </div>
              )}

              {/* Información de pago */}
              {request.payment && request.type === 'vacation' && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Información de Pago</span>
                  </h4>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Sueldo Diario:</span>
                          <span className="text-sm font-medium">
                            {formatCurrency(request.payment.dailySalary || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Monto Base:</span>
                          <span className="text-sm font-medium">
                            {formatCurrency(request.payment.baseAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Prima Vacacional ({(request.payment.vacationPremiumRate || 0.25) * 100}%):
                          </span>
                          <span className="text-sm font-medium">
                            {formatCurrency(request.payment.vacationPremiumAmount)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm font-semibold text-gray-900">Total a Pagar:</span>
                          <span className="text-lg font-bold text-emerald-700">
                            {formatCurrency(request.payment.totalAmount)}
                          </span>
                        </div>
                        {request.payment.plan && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Plan de Pago:</span>
                            <span className="text-sm font-medium">
                              {request.payment.plan === 'first' ? 'Primer pago' :
                               request.payment.plan === 'partial' ? 'Pago parcial' :
                               'Liquidación total'}
                            </span>
                          </div>
                        )}
                        {request.payment.paidAmount !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Monto Pagado:</span>
                            <span className="text-sm font-medium">
                              {formatCurrency(request.payment.paidAmount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Razón de rechazo */}
              {request.rejectedReason && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span>Razón de Rechazo</span>
                  </h4>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {request.rejectedReason}
                  </p>
                </div>
              )}

              {/* Archivos adjuntos */}
              {request.attachments && request.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <Paperclip className="h-4 w-4" />
                    <span>Archivos Adjuntos</span>
                  </h4>
                  <div className="space-y-2">
                    {request.attachments.map((attachmentId, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            Archivo adjunto #{index + 1}
                          </span>
                        </div>
                        {onDownloadAttachment && (
                          <button
                            onClick={() => onDownloadAttachment(attachmentId, `adjunto-${index + 1}`)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Download className="h-4 w-4" />
                            <span>Descargar</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationRequestDetailsModal;
