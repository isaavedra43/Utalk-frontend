import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storageService';
import { ConfigService } from '../services/configService';
import {
  PlatformApiService,
  ProviderApiService,
  MaterialApiService,
  ConfigurationApiService,
  SyncService
} from '../services/inventoryApiService';
import type { Platform, Provider, MaterialOption, ModuleConfiguration } from '../types';

interface SyncStatus {
  isSyncing: boolean;
  lastSyncAt: Date | null;
  syncError: string | null;
  pendingChanges: number;
  isOnline: boolean;
}

interface SyncResult {
  success: boolean;
  syncedItems: number;
  errors: string[];
}

/**
 * Hook para manejar sincronización automática con el backend
 * Mantiene funcionalidad offline y sincroniza cuando hay conexión
 */
export const useInventorySync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncAt: null,
    syncError: null,
    pendingChanges: 0,
    isOnline: navigator.onLine
  });

  // Detectar cambios en la conectividad
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      // Auto-sincronizar cuando se recupera la conexión
      syncWithBackend();
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sincronización automática periódica (cada 5 minutos si hay conexión)
  useEffect(() => {
    if (!syncStatus.isOnline) return;

    const interval = setInterval(() => {
      syncWithBackend();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [syncStatus.isOnline]);

  /**
   * Sincronizar todos los datos locales con el backend
   */
  const syncWithBackend = useCallback(async (): Promise<SyncResult> => {
    if (!syncStatus.isOnline) {
      return {
        success: false,
        syncedItems: 0,
        errors: ['No hay conexión a internet']
      };
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      // Obtener datos locales
      const localPlatforms = StorageService.getPlatforms();
      const localConfig = ConfigService.getConfiguration();
      const localProviders = localConfig.providers;
      const localMaterials = localConfig.materials;

      // Sincronizar con el backend
      const result = await SyncService.syncAllData({
        platforms: localPlatforms,
        providers: localProviders,
        materials: localMaterials,
        configuration: localConfig
      });

      const totalSynced = result.syncedPlatforms + result.syncedProviders + result.syncedMaterials;

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date(),
        syncError: result.errors.length > 0 ? result.errors.join(', ') : null,
        pendingChanges: 0
      }));

      return {
        success: result.errors.length === 0,
        syncedItems: totalSynced,
        errors: result.errors
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncError: errorMessage
      }));

      return {
        success: false,
        syncedItems: 0,
        errors: [errorMessage]
      };
    }
  }, [syncStatus.isOnline]);

  /**
   * Cargar datos desde el backend (sobrescribe datos locales)
   */
  const loadFromBackend = useCallback(async (): Promise<boolean> => {
    if (!syncStatus.isOnline) {
      console.log('No hay conexión, usando datos locales');
      return false;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      // Cargar plataformas desde el backend
      const platforms = await PlatformApiService.getAllPlatforms();
      platforms.forEach(platform => {
        StorageService.savePlatform(platform);
      });

      // Cargar configuración desde el backend
      const config = await ConfigurationApiService.getConfiguration();
      ConfigService.saveConfiguration(config);

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date(),
        syncError: null
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar desde backend';
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncError: errorMessage
      }));

      console.error('Error loading from backend, using local data:', error);
      return false;
    }
  }, [syncStatus.isOnline]);

  /**
   * Marcar que hay cambios pendientes de sincronizar
   */
  const markPendingChanges = useCallback(() => {
    setSyncStatus(prev => ({
      ...prev,
      pendingChanges: prev.pendingChanges + 1
    }));
  }, []);

  /**
   * Sincronizar una plataforma específica
   */
  const syncPlatform = useCallback(async (platform: Platform): Promise<boolean> => {
    if (!syncStatus.isOnline) {
      markPendingChanges();
      return false;
    }

    try {
      if (platform.id.startsWith('id-') || platform.id.startsWith('plat-')) {
        // Crear en backend
        const created = await PlatformApiService.createPlatform(platform);
        // Actualizar con el ID del servidor
        StorageService.savePlatform({ ...platform, id: created.id });
      } else {
        // Actualizar en backend (requiere providerId)
        if (platform.providerId) {
          await PlatformApiService.updatePlatform(platform.id, platform.providerId, platform);
        } else {
          console.error('Platform missing providerId for sync:', platform);
          markPendingChanges();
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error syncing platform:', error);
      markPendingChanges();
      return false;
    }
  }, [syncStatus.isOnline, markPendingChanges]);

  /**
   * Sincronizar configuración
   */
  const syncConfiguration = useCallback(async (config: ModuleConfiguration): Promise<boolean> => {
    if (!syncStatus.isOnline) {
      markPendingChanges();
      return false;
    }

    try {
      await ConfigurationApiService.saveConfiguration(config);
      return true;
    } catch (error) {
      console.error('Error syncing configuration:', error);
      markPendingChanges();
      return false;
    }
  }, [syncStatus.isOnline, markPendingChanges]);

  /**
   * Forzar sincronización manual
   */
  const forceSyncforceSyncWithBackend = useCallback(async (): Promise<SyncResult> => {
    return syncWithBackend();
  }, [syncWithBackend]);

  return {
    syncStatus,
    syncWithBackend: forceSyncWithBackend,
    loadFromBackend,
    syncPlatform,
    syncConfiguration,
    markPendingChanges
  };
};

