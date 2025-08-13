import React, { useState, useEffect } from 'react';
import { CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface SyncStatusProps {
  isConnected: boolean;
  isAuthenticated: boolean;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  isConnected,
  isAuthenticated
}) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const handleStateSynced = () => {
      setSyncStatus('synced');
      setLastSync(new Date());
      
      // Resetear a idle después de 3 segundos
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    };

    const handleSyncRequired = () => {
      setSyncStatus('syncing');
    };

    const handleSyncError = () => {
      setSyncStatus('error');
      
      // Resetear a idle después de 5 segundos
      setTimeout(() => {
        setSyncStatus('idle');
      }, 5000);
    };

    // Registrar listeners
    window.addEventListener('websocket:state-synced', handleStateSynced);
    window.addEventListener('websocket:sync-required', handleSyncRequired);
    window.addEventListener('websocket:error', handleSyncError);

    return () => {
      // Limpiar listeners
      window.removeEventListener('websocket:state-synced', handleStateSynced);
      window.removeEventListener('websocket:sync-required', handleSyncRequired);
      window.removeEventListener('websocket:error', handleSyncError);
    };
  }, []);

  const getStatusInfo = () => {
    if (!isAuthenticated) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-gray-400" />,
        text: 'No autenticado',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
    } else if (!isConnected) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
        text: 'Desconectado',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    } else if (syncStatus === 'syncing') {
      return {
        icon: <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />,
        text: 'Sincronizando...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    } else if (syncStatus === 'synced') {
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        text: 'Sincronizado',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else if (syncStatus === 'error') {
      return {
        icon: <AlertCircle className="w-4 h-4 text-red-500" />,
        text: 'Error de sincronización',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    } else {
      return {
        icon: <CheckCircle className="w-4 h-4 text-gray-400" />,
        text: 'Conectado',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
      {statusInfo.icon}
      <span className={`font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
      {lastSync && syncStatus === 'synced' && (
        <span className="text-xs text-gray-500">
          {lastSync.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}; 