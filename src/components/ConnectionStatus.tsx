import React from 'react';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

export const ConnectionStatus: React.FC = () => {
  const { isConnected, connectionError } = useWebSocketContext();

  const getStatusInfo = () => {
    if (isConnected) {
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        text: 'Conectado',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else if (connectionError) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-red-500" />,
        text: 'Error de conexión',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    } else {
      return {
        icon: <WifiOff className="w-4 h-4 text-yellow-500" />,
        text: 'Desconectado',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} shadow-sm`}>
      {statusInfo.icon}
      <span className={`text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
      {connectionError && (
        <span className="text-xs text-red-500 ml-2">
          {connectionError}
        </span>
      )}
    </div>
  );
}; 