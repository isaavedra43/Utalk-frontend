import React from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  DollarSign,
  Eye,
  Paperclip
} from 'lucide-react';
import type { VacationRequest } from '../../../services/vacationsService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DayVacationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  requests: VacationRequest[];
  onViewDetails: (request: VacationRequest) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const DayVacationsModal: React.FC<DayVacationsModalProps> = ({
  isOpen,
  onClose,
  date,
  requests,
  onViewDetails
}) => {
  if (!isOpen || !date) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency
    }).format(amount);
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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Solicitudes de Vacaciones
                  </h3>
                  <p className="text-sm text-blue-100">
                    {formatDate(date)}
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
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No hay solicitudes para este día</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{getTypeText(request.type)}</span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {request.days} días
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{request.reason}</p>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(request.startDate).toLocaleDateString('es-MX')} - {new Date(request.endDate).toLocaleDateString('es-MX')}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Solicitado: {new Date(request.requestedDate).toLocaleDateString('es-MX')}</span>
                          </span>
                          {request.approvedBy && (
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
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
                          onClick={() => onViewDetails(request)}
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

export default DayVacationsModal;
