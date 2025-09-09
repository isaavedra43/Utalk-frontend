import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Forward, 
  Clock,
  Building2
} from 'lucide-react';
import { ApprovalCard as ApprovalCardType } from '../../../types/internal-chat';
import { ApprovalDetailModal } from './ApprovalDetailModal';
import { ForwardModal } from './ForwardModal';

interface ApprovalCardProps {
  card: ApprovalCardType;
  onApprove: () => void;
  onReject: () => void;
  onViewDetails: () => void;
  onForward: () => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  card,
  onApprove,
  onReject,
  onViewDetails,
  onForward,
}) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
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
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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

  const getApproverText = () => {
    if (card.status === 'approved') {
      return `✓ por ${card.approverName}`;
    } else if (card.status === 'rejected') {
      return `⊗ por ${card.approverName}`;
    }
    return '';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="approval-card rounded-xl p-6 internal-chat-hover">
      {/* Header con información del remitente */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {card.senderName.charAt(0)}
              </span>
            </div>
            {/* Indicador de estado online (simulado) */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <p className="font-medium text-gray-900">{card.senderName}</p>
            <p className="text-sm text-gray-500">{formatTime(card.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Contenido principal de la tarjeta */}
      <div className="mb-4">
        <div className="flex items-start space-x-4">
          {/* Imagen/Icono de la empresa */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>

          {/* Información de la transacción */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {card.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{card.subtitle}</p>
            
            {/* Monto */}
            {card.amount && (
              <div className="text-2xl font-bold text-blue-600 mb-3">
                {card.amount}
              </div>
            )}

            {/* Estado de aprobación */}
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon()}
              <span className={`px-3 py-1 rounded-full text-sm font-medium border approval-status-${card.status}`}>
                {getStatusText()}
              </span>
              {getApproverText() && (
                <span className="text-sm text-gray-500">
                  {getApproverText()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsDetailModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Ver Detalles
          </button>
          
          {card.status === 'pending' && (card.canApprove || card.canReject) && (
            <>
              <button
                onClick={onApprove}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Aprobar
              </button>
              <button
                onClick={onReject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Rechazar
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setIsForwardModalOpen(true)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Reenviar"
        >
          <Forward className="h-4 w-4" />
        </button>
      </div>

      {/* Modal de detalle */}
      <ApprovalDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        card={card}
        onApprove={() => {
          onApprove();
          setIsDetailModalOpen(false);
        }}
        onReject={() => {
          onReject();
          setIsDetailModalOpen(false);
        }}
      />

      {/* Modal de reenvío */}
      <ForwardModal
        isOpen={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        card={card}
        onForward={(forwardData) => {
          console.log('Reenviando:', forwardData);
          onForward();
          setIsForwardModalOpen(false);
        }}
      />
    </div>
  );
};
