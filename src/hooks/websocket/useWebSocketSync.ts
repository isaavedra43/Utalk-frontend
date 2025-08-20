import { useCallback, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { infoLog } from '../../config/logger';

interface ServerStateSnapshot<T = unknown> {
  version: number; // Versión incremental del estado
  data: T;
  timestamp: string;
}

interface SyncOptions {
  resolveStrategy?: 'server-wins' | 'client-wins' | 'merge';
}

export const useWebSocketSync = <T = unknown>(socket: Socket | null, options: SyncOptions = {}) => {
  const { resolveStrategy = 'merge' } = options;

  const [isSynced, setIsSynced] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [serverVersion, setServerVersion] = useState<number>(0);
  const [localVersion, setLocalVersion] = useState<number>(0);
  const pendingChangesRef = useRef<T | null>(null);

  // Ref para prevenir syncs demasiado frecuentes
  const lastSyncAtRef = useRef(0);

  // Resolver conflictos básicos
  const resolveConflict = useCallback((localState: T, serverState: T): T => {
    switch (resolveStrategy) {
      case 'server-wins':
        return serverState;
      case 'client-wins':
        return localState;
      case 'merge':
      default:
        // Estrategia de merge superficial (shallow)
        if (typeof localState === 'object' && localState && typeof serverState === 'object' && serverState) {
          return { ...(serverState as object), ...(localState as object) } as T;
        }
        return serverState;
    }
  }, [resolveStrategy]);

  // Solicitar sincronización manual
  const syncWithServer = useCallback(() => {
    if (!socket || !socket.connected) {
      infoLog('⚠️ No se puede sincronizar, socket no conectado');
      return;
    }

    const now = Date.now();
    if (now - lastSyncAtRef.current < 3000) {
      // Evitar sincronizaciones muy frecuentes
      return;
    }

    lastSyncAtRef.current = now;
    socket.emit('sync-state', { version: localVersion, timestamp: new Date().toISOString() });
    infoLog('🔄 Solicitando sincronización de estado...');
  }, [socket, localVersion]);

  // Publicar cambios locales para sincronizar
  const publishLocalChanges = useCallback((changes: T) => {
    pendingChangesRef.current = changes;
    setLocalVersion(v => v + 1);
    syncWithServer();
  }, [syncWithServer]);

  // Manejar snapshot del servidor
  const handleServerSnapshot = useCallback((snapshot: ServerStateSnapshot<T>) => {
    // Resolver conflictos si hay cambios pendientes locales
    if (pendingChangesRef.current) {
      resolveConflict(pendingChangesRef.current, snapshot.data);
      pendingChangesRef.current = null;
      // En un caso real, aquí enviaríamos el merge al servidor si procede
      infoLog('🤝 Conflicto resuelto con estrategia:', { strategy: resolveStrategy });
    }

    setServerVersion(snapshot.version);
    setLastSyncTime(snapshot.timestamp);
    setIsSynced(true);
  }, [resolveConflict, resolveStrategy]);

  // Listeners del socket para sync
  useEffect(() => {
    if (!socket) return;

    const onStateSynced = (payload: ServerStateSnapshot<T>) => {
      infoLog('✅ Estado sincronizado desde servidor (versión ' + payload.version + ')');
      handleServerSnapshot(payload);
    };

    const onSyncError = (err: { message: string }) => {
      infoLog('❌ Error de sincronización: ' + err.message);
      setIsSynced(false);
    };

    socket.on('state-synced', onStateSynced);
    socket.on('sync-error', onSyncError);

    return () => {
      socket.off('state-synced', onStateSynced);
      socket.off('sync-error', onSyncError);
    };
  }, [socket, handleServerSnapshot]);

  return {
    // Estado de sync
    isSynced,
    lastSyncTime,
    serverVersion,
    localVersion,

    // Acciones
    syncWithServer,
    publishLocalChanges,
  };
}; 