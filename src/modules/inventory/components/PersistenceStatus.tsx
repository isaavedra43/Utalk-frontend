import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Wifi, WifiOff, Clock, Database } from 'lucide-react';

interface PersistenceStatusProps {
  isOnline: boolean;
  hasPendingSync: boolean;
  lastSaveTime: Date | null;
  pendingCount: number;
}

export const PersistenceStatus: React.FC<PersistenceStatusProps> = ({
  isOnline,
  hasPendingSync,
  lastSaveTime,
  pendingCount
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = () => {
    if (!isOnline) return 'text-orange-600';
    if (hasPendingSync) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (hasPendingSync) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Modo Offline';
    if (hasPendingSync) return `Pendientes: ${pendingCount}`;
    return 'Sincronizado';
  };

  const formatLastSave = () => {
    if (!lastSaveTime) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - lastSaveTime.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s atrás`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
    return `${Math.floor(seconds / 3600)}h atrás`;
  };

  return (
    <div className="relative">
      {/* Indicador principal */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
          transition-all duration-200 hover:scale-105
          ${isOnline 
            ? 'bg-green-50 text-green-700 hover:bg-green-100' 
            : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
          }
          ${hasPendingSync ? 'animate-pulse' : ''}
        `}
        title="Estado de persistencia de datos"
      >
        <Database className="h-3 w-3" />
        <span className="hidden sm:inline">{getStatusText()}</span>
        {hasPendingSync && (
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
        )}
      </button>

      {/* Panel de detalles */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="space-y-3">
            {/* Estado de conexión */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-orange-600" />
                )}
                <span className="text-sm font-medium">Conexión</span>
              </div>
              <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
                {isOnline ? 'En línea' : 'Sin conexión'}
              </span>
            </div>

            {/* Estado de sincronización */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-sm font-medium">Sincronización</span>
              </div>
              <span className={`text-sm ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>

            {/* Último guardado */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Último guardado</span>
              </div>
              <span className="text-sm text-gray-600">
                {formatLastSave()}
              </span>
            </div>

            {/* Información adicional */}
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Los datos se guardan automáticamente cada 10 segundos</p>
                <p>• La sincronización ocurre cada 30 segundos en línea</p>
                <p>• Los datos están respaldados localmente siempre</p>
                {!isOnline && (
                  <p className="text-orange-600 font-medium">
                    ⚠️ Trabajando en modo offline - se sincronizará al reconectar
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
