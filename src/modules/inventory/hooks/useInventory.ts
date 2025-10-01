// Hook principal para manejo de inventario

import { useState, useEffect, useCallback } from 'react';
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
    platformNumber: string;
    materialTypes: string[];
    provider: string;
    providerId?: string;
    driver: string;
    receptionDate?: Date;
    notes?: string;
  }): Promise<Platform> => {
    const configSettings = ConfigService.getSettings();
    const defaultWidth = configSettings?.defaultStandardWidth || 0.3;
    
    const newPlatform: Platform = {
      id: generateId(),
      platformNumber: data.platformNumber,
      receptionDate: data.receptionDate || new Date(),
      materialTypes: data.materialTypes,
      provider: data.provider,
      providerId: data.providerId || generateId(), // Generar providerId si no se proporciona
      driver: data.driver,
      standardWidth: defaultWidth,
      pieces: [],
      totalLinearMeters: 0,
      totalLength: 0,
      status: 'in_progress',
      notes: data.notes,
      createdBy: 'Usuario Actual', // TODO: Obtener del contexto de usuario
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Guardar localmente primero
    StorageService.savePlatform(newPlatform);
    setPlatforms(prev => [newPlatform, ...prev]);
    
    // Si hay conexión, sincronizar con backend
    if (isOnline) {
      try {
        const createdPlatform = await PlatformApiService.createPlatform(newPlatform);
        // Actualizar con el ID del servidor
        const updatedPlatform = { ...createdPlatform, providerId: newPlatform.providerId };
        StorageService.savePlatform(updatedPlatform);
        setPlatforms(prev => prev.map(p => p.id === newPlatform.id ? updatedPlatform : p));
        return updatedPlatform;
      } catch (error) {
        console.error('Error al crear plataforma en backend:', error);
        // Mantener la plataforma local si falla la sincronización
      }
    }
    
    return newPlatform;
  }, [isOnline]);

  // Actualizar plataforma
  const updatePlatform = useCallback(async (platformId: string, updates: Partial<Platform>) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    // Actualizar localmente primero
    const updatedPlatform = { ...platform, ...updates, updatedAt: new Date() };
    StorageService.savePlatform(updatedPlatform);
    setPlatforms(prev => prev.map(p => p.id === platformId ? updatedPlatform : p));
    
    // Si hay conexión y providerId, sincronizar con backend
    if (isOnline && platform.providerId) {
      try {
        await PlatformApiService.updatePlatform(platformId, platform.providerId, updates);
      } catch (error) {
        console.error('Error al actualizar plataforma en backend:', error);
        // Mantener cambios locales si falla la sincronización
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
    changeStandardWidth
  };
};

