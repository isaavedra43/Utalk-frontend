import React from 'react';
import { Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';

interface OfflineStatusProps {
  isOnline: boolean;
  hasPendingSync: boolean;
  lastSaveTime: Date | null;
  pendingCount: number;
}

export const OfflineStatus: React.FC<OfflineStatusProps> = ({
  isOnline,
  hasPendingSync,
  lastSaveTime,
  pendingCount,
}) => {
  const getStatusInfo = () => {
    if (isOnline) {
      if (hasPendingSync) {
        return {
          icon: <AlertCircle className="h-4 w-4 text-blue-500" />,
          text: `Sincronizando (${pendingCount} pendientes)`,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          description: 'Conectado - Sincronizando datos pendientes'
        };
      } else {
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: 'En línea y sincronizado',
          color: 'bg-green-100 text-green-800 border-green-200',
          description: 'Conectado - Todo sincronizado'
        };
      }
    } else {
      return {
        icon: <WifiOff className="h-4 w-4 text-yellow-500" />,
        text: 'Modo Offline',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        description: 'Sin conexión - Datos guardados localmente'
      };
    }
  };

  const status = getStatusInfo();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${status.color}`}>
      {status.icon}
      <div className="flex flex-col">
        <span className="font-semibold">{status.text}</span>
        <span className="text-xs opacity-75">{status.description}</span>
        {lastSaveTime && (
          <span className="text-xs opacity-60">
            Último guardado: {lastSaveTime.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};
