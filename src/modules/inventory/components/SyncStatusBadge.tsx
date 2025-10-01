import React from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle, WifiOff } from 'lucide-react';
import { useInventorySync } from '../hooks/useInventorySync';

interface SyncStatusBadgeProps {
  onSyncClick?: () => void;
}

/**
 * Badge que muestra el estado de sincronización con el backend
 * - Muestra si está online/offline
 * - Muestra si está sincronizando
 * - Muestra errores de sincronización
 * - Permite sincronización manual
 */
export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ onSyncClick }) => {
  const { syncStatus, syncWithBackend } = useInventorySync();

  const handleSync = async () => {
    if (onSyncClick) {
      onSyncClick();
    }
    await syncWithBackend();
  };

  // Estado: Sincronizando
  if (syncStatus.isSyncing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-blue-900">Sincronizando...</span>
          <span className="text-xs text-blue-600">Guardando cambios</span>
        </div>
      </div>
    );
  }

  // Estado: Offline
  if (!syncStatus.isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
        <WifiOff className="h-4 w-4 text-gray-600" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-900">Modo Offline</span>
          <span className="text-xs text-gray-600">
            {syncStatus.pendingChanges > 0 
              ? `${syncStatus.pendingChanges} cambios pendientes`
              : 'Sin conexión'
            }
          </span>
        </div>
      </div>
    );
  }

  // Estado: Error de sincronización
  if (syncStatus.syncError) {
    return (
      <button
        onClick={handleSync}
        className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors active:scale-95"
      >
        <AlertCircle className="h-4 w-4 text-red-600" />
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-red-900">Error de Sync</span>
          <span className="text-xs text-red-600">Clic para reintentar</span>
        </div>
      </button>
    );
  }

  // Estado: Sincronizado correctamente
  if (syncStatus.lastSyncAt && syncStatus.pendingChanges === 0) {
    const timeSinceSync = Math.floor((Date.now() - syncStatus.lastSyncAt.getTime()) / 1000);
    const minutesAgo = Math.floor(timeSinceSync / 60);
    const timeText = minutesAgo < 1 
      ? 'Hace un momento' 
      : minutesAgo === 1 
        ? 'Hace 1 minuto'
        : `Hace ${minutesAgo} minutos`;

    return (
      <button
        onClick={handleSync}
        className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors active:scale-95"
      >
        <CheckCircle className="h-4 w-4 text-green-600" />
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-green-900">Sincronizado</span>
          <span className="text-xs text-green-600">{timeText}</span>
        </div>
      </button>
    );
  }

  // Estado: Cambios pendientes de sincronizar
  if (syncStatus.pendingChanges > 0) {
    return (
      <button
        onClick={handleSync}
        className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors active:scale-95"
      >
        <Cloud className="h-4 w-4 text-yellow-600" />
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-yellow-900">Cambios Pendientes</span>
          <span className="text-xs text-yellow-600">
            {syncStatus.pendingChanges} {syncStatus.pendingChanges === 1 ? 'cambio' : 'cambios'}
          </span>
        </div>
      </button>
    );
  }

  // Estado: Online sin actividad reciente
  return (
    <button
      onClick={handleSync}
      className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors active:scale-95"
    >
      <CloudOff className="h-4 w-4 text-gray-600" />
      <div className="flex flex-col text-left">
        <span className="text-xs font-semibold text-gray-900">No Sincronizado</span>
        <span className="text-xs text-gray-600">Clic para sincronizar</span>
      </div>
    </button>
  );
};

/**
 * Componente simplificado - Solo icono
 */
export const SyncStatusIcon: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const { syncStatus, syncWithBackend } = useInventorySync();

  const handleClick = async () => {
    if (onClick) {
      onClick();
    }
    if (syncStatus.isOnline && !syncStatus.isSyncing) {
      await syncWithBackend();
    }
  };

  if (syncStatus.isSyncing) {
    return (
      <div className="relative p-2 bg-blue-50 rounded-lg" title="Sincronizando...">
        <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!syncStatus.isOnline) {
    return (
      <div className="relative p-2 bg-gray-50 rounded-lg" title="Modo Offline">
        <WifiOff className="h-5 w-5 text-gray-600" />
        {syncStatus.pendingChanges > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">{syncStatus.pendingChanges}</span>
          </div>
        )}
      </div>
    );
  }

  if (syncStatus.syncError) {
    return (
      <button 
        onClick={handleClick}
        className="relative p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors active:scale-95" 
        title="Error de sincronización - Clic para reintentar"
      >
        <AlertCircle className="h-5 w-5 text-red-600" />
      </button>
    );
  }

  if (syncStatus.lastSyncAt && syncStatus.pendingChanges === 0) {
    return (
      <button 
        onClick={handleClick}
        className="relative p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors active:scale-95" 
        title="Sincronizado - Clic para sincronizar de nuevo"
      >
        <CheckCircle className="h-5 w-5 text-green-600" />
      </button>
    );
  }

  return (
    <button 
      onClick={handleClick}
      className="relative p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors active:scale-95" 
      title="Clic para sincronizar"
    >
      <Cloud className="h-5 w-5 text-gray-600" />
      {syncStatus.pendingChanges > 0 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">{syncStatus.pendingChanges}</span>
        </div>
      )}
    </button>
  );
};

