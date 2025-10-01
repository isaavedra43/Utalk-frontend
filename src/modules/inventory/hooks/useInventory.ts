// Hook principal para manejo de inventario

import { useState, useEffect, useCallback } from 'react';
import type { Platform, Piece, InventorySettings } from '../types';
import { StorageService } from '../services/storageService';
import { calculateLinearMeters, calculatePlatformTotals, generateId, getNextPieceNumber } from '../utils/calculations';

export const useInventory = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [settings, setSettings] = useState<InventorySettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos al iniciar
  useEffect(() => {
    try {
      const loadedPlatforms = StorageService.getPlatforms();
      const loadedSettings = StorageService.getSettings();
      
      setPlatforms(loadedPlatforms);
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva plataforma
  const createPlatform = useCallback((data: {
    platformNumber: string;
    materialTypes: string[];
    provider: string;
    driver: string;
    receptionDate?: Date;
    notes?: string;
  }): Platform => {
    const defaultWidth = settings?.defaultStandardWidth || 0.3;
    
    const newPlatform: Platform = {
      id: generateId(),
      platformNumber: data.platformNumber,
      receptionDate: data.receptionDate || new Date(),
      materialTypes: data.materialTypes,
      provider: data.provider,
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

    StorageService.savePlatform(newPlatform);
    setPlatforms(prev => [newPlatform, ...prev]);
    
    return newPlatform;
  }, [settings]);

  // Actualizar plataforma
  const updatePlatform = useCallback((platformId: string, updates: Partial<Platform>) => {
    setPlatforms(prev => {
      const updated = prev.map(p => {
        if (p.id === platformId) {
          const updatedPlatform = { ...p, ...updates, updatedAt: new Date() };
          StorageService.savePlatform(updatedPlatform);
          return updatedPlatform;
        }
        return p;
      });
      return updated;
    });
  }, []);

  // Eliminar plataforma
  const deletePlatform = useCallback((platformId: string) => {
    StorageService.deletePlatform(platformId);
    setPlatforms(prev => prev.filter(p => p.id !== platformId));
  }, []);

  // Agregar pieza a plataforma
  const addPiece = useCallback((platformId: string, length: number) => {
    setPlatforms(prev => {
      const updated = prev.map(platform => {
        if (platform.id === platformId) {
          const newPiece: Piece = {
            id: generateId(),
            number: getNextPieceNumber(platform.pieces),
            length,
            standardWidth: platform.standardWidth,
            linearMeters: calculateLinearMeters(length, platform.standardWidth),
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
  const addMultiplePieces = useCallback((platformId: string, lengths: number[]) => {
    setPlatforms(prev => {
      const updated = prev.map(platform => {
        if (platform.id === platformId) {
          let nextNumber = getNextPieceNumber(platform.pieces);
          
          const newPieces: Piece[] = lengths.map(length => ({
            id: generateId(),
            number: nextNumber++,
            length,
            standardWidth: platform.standardWidth,
            linearMeters: calculateLinearMeters(length, platform.standardWidth),
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
  const updatePiece = useCallback((platformId: string, pieceId: string, length: number) => {
    setPlatforms(prev => {
      const updated = prev.map(platform => {
        if (platform.id === platformId) {
          const updatedPieces = platform.pieces.map(piece => {
            if (piece.id === pieceId) {
              return {
                ...piece,
                length,
                linearMeters: calculateLinearMeters(length, piece.standardWidth)
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

