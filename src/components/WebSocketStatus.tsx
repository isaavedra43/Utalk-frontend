import React, { useEffect, useState } from 'react';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { WifiOff, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface WebSocketStatusProps {
  showDetails?: boolean;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({ showDetails = false }) => {
  const { isConnected, isFallbackMode, connectionError, socket } = useWebSocketContext();
  const [showNotification, setShowNotification] = useState(false);

  // Mostrar notificación cuando se activa modo fallback
  useEffect(() => {
    if (isFallbackMode) {
      setShowNotification(true);
      // Ocultar notificación después de 10 segundos
      const timer = setTimeout(() => setShowNotification(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isFallbackMode]);

  const getStatusInfo = () => {
    if (isFallbackMode) {
      return {
        icon: <WifiOff className="w-4 h-4 text-orange-500" />,
        text: 'Modo Offline',
        description: 'Funcionalidad de tiempo real limitada',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      };
    } else if (isConnected) {
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        text: 'Conectado',
        description: 'Tiempo real activo',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else if (connectionError) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-red-500" />,
        text: 'Error de conexión',
        description: connectionError,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    } else {
      return {
        icon: <Clock className="w-4 h-4 text-yellow-500" />,
        text: 'Conectando...',
        description: 'Estableciendo conexión',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    }
  };

  const statusInfo = getStatusInfo();

  if (!showDetails && !showNotification && !isFallbackMode) {
    return null; // No mostrar nada si no hay detalles y no hay notificaciones
  }

  return (
    <>
      {/* Notificación de modo fallback */}
      {showNotification && isFallbackMode && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} shadow-lg`}>
            <div className="flex items-start gap-3">
              {statusInfo.icon}
              <div className="flex-1">
                <h4 className={`font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {statusInfo.description}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Puedes continuar usando la aplicación normalmente
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de estado detallado */}
      {showDetails && (
        <div className={`p-3 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <div>
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
              {socket?.id && (
                <span className="text-xs text-gray-500 ml-2 font-mono">
                  ID: {socket.id}
                </span>
              )}
            </div>
          </div>
          {statusInfo.description && (
            <p className="text-xs text-gray-600 mt-1">
              {statusInfo.description}
            </p>
          )}
        </div>
      )}
    </>
  );
};
