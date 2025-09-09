import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Clock, Building2, Calendar, CreditCard, FileText, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { ApprovalCard as ApprovalCardType } from '../../../types/internal-chat';

interface ApprovalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ApprovalCardType;
  onApprove: () => void;
  onReject: () => void;
}

export const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({
  isOpen,
  onClose,
  card,
  onApprove,
  onReject,
}) => {
  const [notes, setNotes] = useState('');
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (card.status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (card.status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (card.status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setImageRotation(prev => (prev + 90) % 360);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Revisión de Pago</h2>
            <p className="text-sm text-gray-500 mt-1">Detalles del pago</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Panel izquierdo - Detalles */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-6">
              {/* Información del pago */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                  Detalles del Pago
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cliente:</span>
                    <span className="text-sm font-medium text-gray-900">{card.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monto:</span>
                    <span className="text-lg font-bold text-blue-600">{card.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Método:</span>
                    <span className="text-sm font-medium text-gray-900">Tarjeta de Crédito</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Recibido:</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(card.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon()}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
                        {getStatusText()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 text-green-600 mr-2" />
                  Información Adicional
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tipo de transacción:</span>
                    <span className="text-sm font-medium text-gray-900">{card.subtitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Solicitado por:</span>
                    <span className="text-sm font-medium text-gray-900">{card.senderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ID de transacción:</span>
                    <span className="text-sm font-mono text-gray-900">TXN-{card.id.slice(-8).toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agrega notas sobre esta solicitud..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Acciones */}
              {card.status === 'pending' && (card.canApprove || card.canReject) && (
                <div className="flex space-x-3">
                  <button
                    onClick={onApprove}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Aprobar</span>
                  </button>
                  <button
                    onClick={onReject}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Rechazar</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho - Comprobante */}
          <div className="w-1/2 p-6 bg-gray-50">
            <div className="h-full flex flex-col">
              {/* Header del comprobante */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  Comprobante
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                    title="Alejar"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-500 min-w-[3rem] text-center">
                    {Math.round(imageZoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                    title="Acercar"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleRotate}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                    title="Rotar"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                    title="Descargar"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Contenedor de la imagen */}
              <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
                <div 
                  className="relative max-w-full max-h-full"
                  style={{
                    transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                    transition: 'transform 0.2s ease-in-out'
                  }}
                >
                  {/* Imagen del comprobante - placeholder con diseño mejorado */}
                  <div className="w-80 h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Comprobante de Pago</h4>
                    <p className="text-sm text-gray-600 text-center mb-4">
                      {card.title}
                    </p>
                    <div className="text-2xl font-bold text-blue-600 mb-4">
                      {card.amount}
                    </div>
                    <div className="w-full h-px bg-gray-200 mb-4"></div>
                    <div className="text-xs text-gray-500 text-center">
                      <p>Fecha: {formatDate(card.createdAt)}</p>
                      <p>ID: TXN-{card.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del archivo */}
              <div className="mt-4 bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Archivo:</span>
                    <span className="font-medium text-gray-900 ml-1">comprobante_pago.pdf</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tamaño:</span>
                    <span className="font-medium text-gray-900 ml-1">2.4 MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Última actualización: {formatDate(new Date())}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
