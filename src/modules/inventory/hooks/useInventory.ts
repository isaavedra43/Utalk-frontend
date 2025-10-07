// Hook principal para manejo de inventario

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Platform, Piece, InventorySettings, Evidence } from '../types';
import { StorageService } from '../services/storageService';
import { ConfigService } from '../services/configService';
import { PlatformApiService } from '../services/inventoryApiService';
import { calculateLinearMeters, calculatePlatformTotals, generateId, getNextPieceNumber } from '../utils/calculations';

export const useInventory = () => {
  const [cargas, setCargas] = useState<Platform[]>([]);
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
        
        setCargas(Array.isArray(loadedPlatforms) ? loadedPlatforms : []);
        setSettings(loadedSettings);
        
        // Si hay conexión, intentar sincronizar con backend
        if (isOnline) {
          try {
            const response = await PlatformApiService.getAllPlatforms({ limit: 1000 });
            if (response.data && response.data.length > 0) {
              // Actualizar con datos del backend
              response.data.forEach(platform => StorageService.savePlatform(platform));
              setCargas(response.data);
            }
          } catch (error) {
            console.log('Error al sincronizar con backend, usando datos locales:', error);
          }
        }
      } catch (error) {
        console.error('Error al cargar inventario:', error);
        setCargas([]);
        setSettings(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isOnline]);

  // Crear nueva plataforma
  const createPlatform = useCallback(async (data: {
    platformType: 'provider' | 'client';
    materialTypes: string[];
    provider: string;
    providerId?: string;
    ticketNumber?: string;
    driver: string;
    receptionDate?: Date;
    notes?: string;
  }): Promise<Platform> => {
    const configSettings = ConfigService.getSettings();
    const defaultWidth = configSettings?.defaultStandardWidth || 0.3;
    
    // Crear datos para enviar al backend (incluyendo platformNumber generado)
    const platformData = {
      receptionDate: data.receptionDate || new Date(),
      platformType: data.platformType,
      materialTypes: data.materialTypes,
      provider: data.provider,
      providerId: data.providerId || generateId(), // Generar providerId si no se proporciona
      ticketNumber: data.ticketNumber,
      driver: data.driver,
      standardWidth: defaultWidth,
      pieces: [],
      totalLinearMeters: 0,
      totalLength: 0,
      status: 'in_progress' as const,
      notes: data.notes,
      createdBy: 'Usuario Actual', // TODO: Obtener del contexto de usuario
      platformNumber: `SYNC-${Date.now()}` // ✅ Generar platformNumber para el backend
    };

    // SIEMPRE intentar crear en backend primero si hay conexión
    if (isOnline) {
      try {
        const createdPlatform = await PlatformApiService.createPlatform(platformData);
        // El backend confirma el platformNumber enviado y genera el id automáticamente
        StorageService.savePlatform(createdPlatform);
        setCargas((prev: Platform[]) => [createdPlatform, ...prev]);
        return createdPlatform;
      } catch (error) {
        console.error('Error al crear plataforma en backend:', error);
        // Si falla el backend, crear localmente con ID temporal y marcar para sincronización
        const tempPlatform: Platform = {
          ...platformData,
          id: generateId(),
          totalLinearMeters: 0,
          totalLength: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          needsSync: true // ✅ Marcar que necesita sincronización
        };
        StorageService.savePlatform(tempPlatform);
        setCargas((prev: Platform[]) => [tempPlatform, ...prev]);
        return tempPlatform;
      }
    } else {
      // Modo offline - crear con ID temporal y marcar para sincronización
      const tempPlatform: Platform = {
        ...platformData,
        id: generateId(),
        platformNumber: `OFFLINE-${Date.now()}`, // Folio temporal para offline (sobrescribe el de platformData)
        totalLinearMeters: 0,
        totalLength: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        needsSync: true // ✅ Marcar que necesita sincronización
      };
      StorageService.savePlatform(tempPlatform);
      setCargas((prev: Platform[]) => [tempPlatform, ...prev]);
      return tempPlatform;
    }
  }, [isOnline]);

  // Actualizar plataforma
  const updatePlatform = useCallback(async (platformId: string, updates: Partial<Platform>) => {
    const platform = cargas.find((p: Platform) => p.id === platformId);
    if (!platform) return;

    // Actualizar localmente primero
    const updatedPlatform = { ...platform, ...updates, updatedAt: new Date() };
    StorageService.savePlatform(updatedPlatform);
    setCargas((prev: Platform[]) => prev.map((p: Platform) => p.id === platformId ? updatedPlatform : p));
    
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
          setCargas((prev: Platform[]) => prev.map((p: Platform) => p.id === platformId ? syncedPlatform : p));
          
        } else if (platform.providerId) {
          // Plataforma ya existe en backend - actualizar normalmente
          await PlatformApiService.updatePlatform(platformId, platform.providerId, updates);
        }
      } catch (error) {
        console.error('Error al sincronizar plataforma:', error);
        
        // ✅ SOLUCIÓN: Si es error 404, marcar para sincronización
        const apiError = error as { status?: number; response?: { status?: number } };
        if (apiError.status === 404 || apiError.response?.status === 404) {
          const platformToSync = { ...updatedPlatform, needsSync: true };
          StorageService.savePlatform(platformToSync);
          setCargas((prev: Platform[]) => prev.map((p: Platform) => p.id === platformId ? platformToSync : p));
        }
      }
    }
  }, [cargas, isOnline]);

  // Eliminar plataforma
  const deletePlatform = useCallback(async (platformId: string) => {
    const platform = cargas.find((p: Platform) => p.id === platformId);
    
    // Eliminar localmente primero
    StorageService.deletePlatform(platformId);
    setCargas((prev: Platform[]) => prev.filter((p: Platform) => p.id !== platformId));
    
    // Si hay conexión y providerId, sincronizar con backend
    if (isOnline && platform?.providerId) {
      try {
        await PlatformApiService.deletePlatform(platformId, platform.providerId);
      } catch (error) {
        console.error('Error al eliminar plataforma en backend:', error);
        // Mantener eliminación local si falla la sincronización
      }
    }
  }, [cargas, isOnline]);

  // Agregar pieza a plataforma
  const addPiece = useCallback((platformId: string, length: number, material: string) => {
    setCargas((prev: Platform[]) => {
      const updated = prev.map((platform: Platform) => {
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
    setCargas((prev: Platform[]) => {
      const updated = prev.map((platform: Platform) => {
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
    setCargas((prev: Platform[]) => {
      const updated = prev.map((platform: Platform) => {
        if (platform.id === platformId) {
          const updatedPieces = platform.pieces.map((piece: Piece) => {
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
    setCargas((prev: Platform[]) => {
      const updated = prev.map((platform: Platform) => {
        if (platform.id === platformId) {
          const updatedPieces = platform.pieces.filter((p: Piece) => p.id !== pieceId);
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
    setSettings((prev: InventorySettings | null) => {
      const updated = { ...prev!, ...newSettings };
      StorageService.saveSettings(updated);
      return updated;
    });
  }, []);

  // Cambiar ancho estándar de una plataforma
  const changeStandardWidth = useCallback((platformId: string, newWidth: number) => {
    setCargas((prev: Platform[]) => {
      const updated = prev.map((platform: Platform) => {
        if (platform.id === platformId) {
          // Recalcular todas las piezas con el nuevo ancho
          const updatedPieces = platform.pieces.map((piece: Piece) => ({
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

    const pendingPlatforms = cargas.filter((p: Platform) => p.needsSync === true);
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
        setCargas((prev: Platform[]) => prev.map((p: Platform) => p.id === platform.id ? syncedPlatform : p));
        console.log(`✅ Plataforma sincronizada: ${platform.id} → ${createdPlatform.id}`);
        
      } catch (error) {
        console.error(`❌ Error sincronizando plataforma ${platform.id}:`, error);
      }
    }
  }, [cargas, isOnline]);

  // ✅ NUEVA: Función para actualizar toda la información desde la base de datos
  const refreshData = useCallback(async () => {
    if (!isOnline) {
      console.warn('⚠️ Sin conexión a internet, no se puede actualizar desde la base de datos');
      return;
    }

    try {
      console.log('🔄 Actualizando datos desde la base de datos...');
      
      // Obtener todas las plataformas del backend
      const response = await PlatformApiService.getAllPlatforms({ limit: 1000 });
      
      if (response.data && response.data.length > 0) {
        // Guardar todas las plataformas en localStorage
        response.data.forEach(platform => StorageService.savePlatform(platform));
        
        // Actualizar el estado local
        setCargas(response.data);
        
        console.log(`✅ Datos actualizados: ${response.data.length} plataformas cargadas`);
      } else {
        console.log('ℹ️ No hay plataformas en la base de datos');
        setCargas([]);
      }
    } catch (error) {
      console.error('❌ Error al actualizar datos desde la base de datos:', error);
      
      // Manejar específicamente rate limit errors
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as Error).message.toLowerCase();
        if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
          console.warn('⚠️ Rate limit detectado, esperando antes del próximo intento...');
          // No re-lanzar error de rate limit, solo loggear
          return;
        }
      }
      
      throw error; // Re-lanzar otros errores para que el componente pueda manejar
    }
  }, [isOnline]);

  // ✅ SOLUCIÓN: Ejecutar sincronización cuando se detecte conexión
  useEffect(() => {
    if (isOnline) {
      const pendingPlatforms = cargas.filter((p: Platform) => p.needsSync === true);
      if (pendingPlatforms.length > 0) {
        console.log(`🌐 Conexión detectada, sincronizando ${pendingPlatforms.length} plataformas...`);
        syncPendingPlatforms();
      }
    }
  }, [isOnline, cargas, syncPendingPlatforms]);

  // ✅ SOLUCIÓN: Estado de sincronización
  const syncStatus = useMemo(() => {
    const pendingPlatforms = cargas.filter((p: Platform) => p.needsSync === true);
    const syncedPlatforms = cargas.filter((p: Platform) => !p.needsSync);
    
    return {
      total: cargas.length,
      pending: pendingPlatforms.length,
      synced: syncedPlatforms.length,
      needsSync: pendingPlatforms.length > 0,
      isOnline
    };
  }, [cargas, isOnline]);

  // ✅ NUEVA: Función para agregar evidencia a una plataforma
  const addEvidenceToPlatform = useCallback((platformId: string, evidence: Evidence[]) => {
    setCargas((prev: Platform[]) => {
      const updated = prev.map((platform: Platform) => {
        if (platform.id === platformId) {
          const updatedPlatform = {
            ...platform,
            evidence: [...(platform.evidence || []), ...evidence],
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

  // ✅ NUEVA: Función para eliminar evidencia de una plataforma
  const removeEvidenceFromPlatform = useCallback((platformId: string, evidenceId: string) => {
    setCargas((prev: Platform[]) => {
      const updated = prev.map((platform: Platform) => {
        if (platform.id === platformId) {
          const updatedPlatform = {
            ...platform,
            evidence: (platform.evidence || []).filter((e: Evidence) => e.id !== evidenceId),
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

  // ✅ NUEVA: Función para obtener evidencias de una plataforma
  const getPlatformEvidence = useCallback((platformId: string): Evidence[] => {
    const platform = cargas.find((p: Platform) => p.id === platformId);
    return platform?.evidence || [];
  }, [cargas]);

  // ✅ NUEVA: Función para actualizar evidencias de una plataforma (usado por el componente)
  const updatePlatformEvidence = useCallback((platformId: string, evidence: Evidence[]) => {
    setCargas((prev: Platform[]) => {
      const updated = prev.map((platform: Platform) => {
        if (platform.id === platformId) {
          const updatedPlatform = {
            ...platform,
            evidence,
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
    cargas,
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
    syncStatus,
    // ✅ NUEVA: Función para actualizar datos desde la base de datos
    refreshData,
    // ✅ NUEVA: Funciones para manejo de evidencias
    addEvidenceToPlatform,
    removeEvidenceFromPlatform,
    getPlatformEvidence,
    updatePlatformEvidence
  };
};

