// Hook principal para manejo de inventario

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Platform, Piece, InventorySettings, Provider } from '../types';
import { StorageService } from '../services/storageService';
import { ConfigService } from '../services/configService';
import { PlatformApiService, ProviderApiService } from '../services/inventoryApiService';
import { calculateLinearMeters, calculatePlatformTotals, generateId, getNextPieceNumber } from '../utils/calculations';

export const useInventory = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [settings, setSettings] = useState<InventorySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Detectar cambios de conectividad
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cargar datos al iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        // Primero cargar desde localStorage
        const loadedPlatforms = StorageService.getPlatforms();
        const loadedSettings = StorageService.getSettings();
        
        setPlatforms(Array.isArray(loadedPlatforms) ? loadedPlatforms : []);
        setSettings(loadedSettings);
        
        // Si hay conexión, intentar sincronizar con backend
        if (isOnline) {
          try {
            const response = await PlatformApiService.getAllPlatforms({ limit: 1000 });
            if (response.data && response.data.length > 0) {
              // Actualizar con datos del backend
              response.data.forEach(platform => StorageService.savePlatform(platform));
              setPlatforms(response.data);
            }
          } catch (error) {
            console.log('Error al sincronizar con backend, usando datos locales:', error);
          }
        }
      } catch (error) {
        console.error('Error al cargar inventario:', error);
        setPlatforms([]);
        setSettings(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isOnline]);

  // Crear nueva plataforma
  const createPlatform = useCallback(async (data: {
    materialTypes: string[];
    provider: string;
    providerId?: string;
    driver: string;
    receptionDate?: Date;
    notes?: string;
  }): Promise<Platform> => {
    const configSettings = ConfigService.getSettings();
    const defaultWidth = configSettings?.defaultStandardWidth || 0.3;
    
    // Crear datos para enviar al backend (sin platformNumber, id, ni totales)
    const platformData = {
      receptionDate: data.receptionDate || new Date(),
      materialTypes: data.materialTypes,
      provider: data.provider,
      providerId: data.providerId || generateId(), // Generar providerId si no se proporciona
      driver: data.driver,
      standardWidth: defaultWidth,
      pieces: [],
      totalLinearMeters: 0,
      totalLength: 0,
      status: 'in_progress' as const,
      notes: data.notes,
      createdBy: 'Usuario Actual' // TODO: Obtener del contexto de usuario
    };

    // SIEMPRE intentar crear en backend primero si hay conexión
    if (isOnline) {
      try {
        const createdPlatform = await PlatformApiService.createPlatform(platformData);
        // El backend genera el platformNumber y el id automáticamente
        StorageService.savePlatform(createdPlatform);
        setPlatforms(prev => [createdPlatform, ...prev]);
        return createdPlatform;
      } catch (error) {
        console.error('Error al crear plataforma en backend:', error);
        // Si falla el backend, crear localmente con ID temporal y marcar para sincronización
        const tempPlatform: Platform = {
          id: generateId(),
          platformNumber: `SYNC-${Date.now()}`, // Folio temporal marcado para sincronización
          ...platformData,
          totalLinearMeters: 0,
          totalLength: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          needsSync: true // ✅ Marcar que necesita sincronización
        };
        StorageService.savePlatform(tempPlatform);
        setPlatforms(prev => [tempPlatform, ...prev]);
        return tempPlatform;
      }
    } else {
      // Modo offline - crear con ID temporal y marcar para sincronización
      const tempPlatform: Platform = {
        id: generateId(),
        platformNumber: `OFFLINE-${Date.now()}`, // Folio temporal para offline
        ...platformData,
        totalLinearMeters: 0,
        totalLength: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        needsSync: true // ✅ Marcar que necesita sincronización
      };
      StorageService.savePlatform(tempPlatform);
      setPlatforms(prev => [tempPlatform, ...prev]);
      return tempPlatform;
    }
  }, [isOnline]);

  // Actualizar plataforma
  const updatePlatform = useCallback(async (platformId: string, updates: Partial<Platform>) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    // Actualizar localmente primero
    const updatedPlatform = { ...platform, ...updates, updatedAt: new Date() };
    StorageService.savePlatform(updatedPlatform);
    setPlatforms(prev => prev.map(p => p.id === platformId ? updatedPlatform : p));
    
    // ✅ SOLUCIÓN: Manejar sincronización correctamente
    if (isOnline) {
      try {
        // Verificar si la plataforma necesita sincronización
        if (platform.needsSync || platform.id.startsWith('SYNC-') || platform.id.startsWith('OFFLINE-')) {
          // Crear en backend primero
          const createdPlatform = await PlatformApiService.createPlatform(platform);
          
          // Actualizar con el nuevo ID del backend
          await PlatformApiService.updatePlatform(createdPlatform.id, createdPlatform.providerId!, updates);
          
          // Actualizar localmente con el ID del backend
          const syncedPlatform = { 
            ...updatedPlatform, 
            id: createdPlatform.id, 
            platformNumber: createdPlatform.platformNumber,
            providerId: createdPlatform.providerId,
            needsSync: false 
          };
          StorageService.savePlatform(syncedPlatform);
          setPlatforms(prev => prev.map(p => p.id === platformId ? syncedPlatform : p));
          
        } else if (platform.providerId) {
          // Plataforma ya existe en backend - actualizar normalmente
          await PlatformApiService.updatePlatform(platformId, platform.providerId, updates);
        }
      } catch (error) {
        console.error('Error al sincronizar plataforma:', error);
        
        // ✅ SOLUCIÓN: Si es error 404, marcar para sincronización
        if (error.status === 404 || error.response?.status === 404) {
          const platformToSync = { ...updatedPlatform, needsSync: true };
          StorageService.savePlatform(platformToSync);
          setPlatforms(prev => prev.map(p => p.id === platformId ? platformToSync : p));
        }
      }
    }
  }, [platforms, isOnline]);

  // Eliminar plataforma
  const deletePlatform = useCallback(async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    
    // Eliminar localmente primero
    StorageService.deletePlatform(platformId);
    setPlatforms(prev => prev.filter(p => p.id !== platformId));
    
    // Si hay conexión y providerId, sincronizar con backend
    if (isOnline && platform?.providerId) {
      try {
        await PlatformApiService.deletePlatform(platformId, platform.providerId);
      } catch (error) {
        console.error('Error al eliminar plataforma en backend:', error);
        // Mantener eliminación local si falla la sincronización
      }
    }
  }, [platforms, isOnline]);

  // Agregar pieza a plataforma
  const addPiece = useCallback((platformId: string, length: number, material: string) => {
    setPlatforms(prev => {
      const updated = prev.map(platform => {
        if (platform.id === platformId) {
          const newPiece: Piece = {
            id: generateId(),
            number: getNextPieceNumber(platform.pieces),
            length,
            standardWidth: platform.standardWidth,
            linearMeters: calculateLinearMeters(length, platform.standardWidth),
            material,
            createdAt: new Date()
          };

          const updatedPieces = [...platform.pieces, newPiece];
          const totals = calculatePlatformTotals(updatedPieces);

          const updatedPlatform = {
            ...platform,
            pieces: updatedPieces,
            ...totals,
            updatedAt: new Date()
          };

          StorageService.savePlatform(updatedPlatform);
          return updatedPlatform;
        }
        return platform;
      });
      return updated;
    });
  }, []);

  // Agregar múltiples piezas
  const addMultiplePieces = useCallback((platformId: string, pieces: { length: number; material: string }[]) => {
    setPlatforms(prev => {
      const updated = prev.map(platform => {
        if (platform.id === platformId) {
          let nextNumber = getNextPieceNumber(platform.pieces);
          
          const newPieces: Piece[] = pieces.map(piece => ({
            id: generateId(),
            number: nextNumber++,
            length: piece.length,
            standardWidth: platform.standardWidth,
            linearMeters: calculateLinearMeters(piece.length, platform.standardWidth),
            material: piece.material,
            createdAt: new Date()
          }));

          const updatedPieces = [...platform.pieces, ...newPieces];
          const totals = calculatePlatformTotals(updatedPieces);

          const updatedPlatform = {
            ...platform,
            pieces: updatedPieces,
            ...totals,
            updatedAt: new Date()
          };

          StorageService.savePlatform(updatedPlatform);
          return updatedPlatform;
        }
        return platform;
      });
      return updated;
    });
  }, []);

  // Actualizar pieza
  const updatePiece = useCallback((platformId: string, pieceId: string, updates: { length?: number; material?: string }) => {
    setPlatforms(prev => {
      const updated = prev.map(platform => {
        if (platform.id === platformId) {
          const updatedPieces = platform.pieces.map(piece => {
            if (piece.id === pieceId) {
              const newLength = updates.length !== undefined ? updates.length : piece.length;
              return {
                ...piece,
                length: newLength,
                material: updates.material !== undefined ? updates.material : piece.material,
                linearMeters: calculateLinearMeters(newLength, piece.standardWidth)
              };
            }
            return piece;
          });

          const totals = calculatePlatformTotals(updatedPieces);

          const updatedPlatform = {
            ...platform,
            pieces: updatedPieces,
            ...totals,
            updatedAt: new Date()
          };

          StorageService.savePlatform(updatedPlatform);
          return updatedPlatform;
        }
        return platform;
      });
      return updated;
    });
  }, []);

  // Eliminar pieza
  const deletePiece = useCallback((platformId: string, pieceId: string) => {
    setPlatforms(prev => {
      const updated = prev.map(platform => {
        if (platform.id === platformId) {
          const updatedPieces = platform.pieces.filter(p => p.id !== pieceId);
          const totals = calculatePlatformTotals(updatedPieces);

          const updatedPlatform = {
            ...platform,
            pieces: updatedPieces,
            ...totals,
            updatedAt: new Date()
          };

          StorageService.savePlatform(updatedPlatform);
          return updatedPlatform;
        }
        return platform;
      });
      return updated;
    });
  }, []);

  // Actualizar configuración
  const updateSettings = useCallback((newSettings: Partial<InventorySettings>) => {
    setSettings(prev => {
      const updated = { ...prev!, ...newSettings };
      StorageService.saveSettings(updated);
      return updated;
    });
  }, []);

  // Cambiar ancho estándar de una plataforma
  const changeStandardWidth = useCallback((platformId: string, newWidth: number) => {
    setPlatforms(prev => {
      const updated = prev.map(platform => {
        if (platform.id === platformId) {
          // Recalcular todas las piezas con el nuevo ancho
          const updatedPieces = platform.pieces.map(piece => ({
            ...piece,
            standardWidth: newWidth,
            linearMeters: calculateLinearMeters(piece.length, newWidth)
          }));

          const totals = calculatePlatformTotals(updatedPieces);

          const updatedPlatform = {
            ...platform,
            standardWidth: newWidth,
            pieces: updatedPieces,
            ...totals,
            updatedAt: new Date()
          };

          StorageService.savePlatform(updatedPlatform);
          return updatedPlatform;
        }
        return platform;
      });
      return updated;
    });
  }, []);

  // ✅ SOLUCIÓN: Función para sincronizar plataformas pendientes
  const syncPendingPlatforms = useCallback(async () => {
    if (!isOnline) return;

    const pendingPlatforms = platforms.filter(p => p.needsSync === true);
    console.log(`🔄 Sincronizando ${pendingPlatforms.length} plataformas pendientes...`);
    
    for (const platform of pendingPlatforms) {
      try {
        console.log(`📤 Creando plataforma ${platform.id} en backend...`);
        const createdPlatform = await PlatformApiService.createPlatform(platform);
        
        // Actualizar localmente con el ID del backend
        const syncedPlatform = { 
          ...platform, 
          id: createdPlatform.id, 
          platformNumber: createdPlatform.platformNumber,
          providerId: createdPlatform.providerId,
          needsSync: false 
        };
        
        StorageService.savePlatform(syncedPlatform);
        setPlatforms(prev => prev.map(p => p.id === platform.id ? syncedPlatform : p));
        console.log(`✅ Plataforma sincronizada: ${platform.id} → ${createdPlatform.id}`);
        
      } catch (error) {
        console.error(`❌ Error sincronizando plataforma ${platform.id}:`, error);
      }
    }
  }, [platforms, isOnline]);

  // ✅ SOLUCIÓN: Ejecutar sincronización cuando se detecte conexión
  useEffect(() => {
    if (isOnline) {
      const pendingPlatforms = platforms.filter(p => p.needsSync === true);
      if (pendingPlatforms.length > 0) {
        console.log(`🌐 Conexión detectada, sincronizando ${pendingPlatforms.length} plataformas...`);
        syncPendingPlatforms();
      }
    }
  }, [isOnline, platforms, syncPendingPlatforms]);

  // ✅ SOLUCIÓN: Estado de sincronización
  const syncStatus = useMemo(() => {
    const pendingPlatforms = platforms.filter(p => p.needsSync === true);
    const syncedPlatforms = platforms.filter(p => !p.needsSync);
    
    return {
      total: platforms.length,
      pending: pendingPlatforms.length,
      synced: syncedPlatforms.length,
      needsSync: pendingPlatforms.length > 0,
      isOnline
    };
  }, [platforms, isOnline]);

  return {
    platforms,
    settings,
    loading,
    createPlatform,
    updatePlatform,
    deletePlatform,
    addPiece,
    addMultiplePieces,
    updatePiece,
    deletePiece,
    updateSettings,
    changeStandardWidth,
    // ✅ SOLUCIÓN: Nuevas funciones de sincronización
    syncPendingPlatforms,
    syncStatus
  };
};

