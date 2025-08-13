import React from 'react';
import { CheckCircle, Clock, AlertCircle, WifiOff } from 'lucide-react';

interface ConversationStatusProps {
  isConnected: boolean;
  isJoined: boolean;
  loading: boolean;
  error: string | null;
}

export const ConversationStatus: React.FC<ConversationStatusProps> = ({
  isConnected,
  isJoined,
  loading,
  error
}) => {
  const getStatusInfo = () => {
    if (error) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-red-500" />,
        text: 'Error de conexión',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    } else if (!isConnected) {
      return {
        icon: <WifiOff className="w-4 h-4 text-yellow-500" />,
        text: 'Desconectado',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    } else if (!isJoined) {
      return {
        icon: <Clock className="w-4 h-4 text-blue-500" />,
        text: 'Conectando a conversación',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    } else if (loading) {
      return {
        icon: <Clock className="w-4 h-4 text-blue-500" />,
        text: 'Cargando mensajes',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    } else {
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        text: 'Conectado',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} shadow-sm`}>
      {statusInfo.icon}
      <span className={`text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
      {error && (
        <span className="text-xs text-red-500 ml-2">
          {error}
        </span>
      )}
    </div>
  );
}; 