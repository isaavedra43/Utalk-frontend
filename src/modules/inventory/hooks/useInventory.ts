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

  // Detectar cambios de conectividad y sincronización automática
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Conexión restablecida - iniciando sincronización...');
      setIsOnline(true);
      
      // Sincronizar datos pendientes cuando se restablece la conexión
      setTimeout(() => {
        syncPendingData();
      }, 1000);
    };
    
    const handleOffline = () => {
      console.log('📱 Sin conexión - trabajando en modo offline');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Sincronización automática cada 30 segundos si hay conexión
    const syncInterval = setInterval(() => {
      if (isOnline) {
        syncPendingData();
      }
    }, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, [isOnline]);

  // Sistema de guardado automático
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (cargas.length > 0) {
        console.log('💾 Guardado automático de datos...');
        try {
          StorageService.savePlatforms(cargas);
          console.log('✅ Guardado automático completado');
        } catch (error) {
          console.error('❌ Error en guardado automático:', error);
        }
      }
    }, 10000); // Guardar cada 10 segundos

    return () => clearInterval(saveInterval);
  }, [cargas]);

  // Función para sincronizar datos pendientes
  const syncPendingData = async () => {
    try {
      const pendingPlatforms = StorageService.getPendingSyncPlatforms();
      
      if (pendingPlatforms.length === 0) {
        return;
      }
      
      console.log(`🔄 Sincronizando ${pendingPlatforms.length} plataformas pendientes...`);
      
      for (const platform of pendingPlatforms) {
        try {
          if (platform.id.startsWith('SYNC-') || platform.id.startsWith('OFFLINE-')) {
            // Crear nueva plataforma en backend
            const createdPlatform = await PlatformApiService.createPlatform(platform);
            
            // Actualizar localmente con el nuevo ID
            const syncedPlatform = {
              ...platform,
              id: createdPlatform.id,
              platformNumber: createdPlatform.platformNumber,
              providerId: createdPlatform.providerId,
              needsSync: false
            };
            
            StorageService.savePlatform(syncedPlatform);
            setCargas(prev => prev.map(p => p.id === platform.id ? syncedPlatform : p));
            
          } else if (platform.providerId) {
            // Actualizar plataforma existente
            await PlatformApiService.updatePlatform(platform.id, platform.providerId, platform);
            StorageService.markPlatformAsSynced(platform.id);
          }
          
          console.log(`✅ Plataforma sincronizada: ${platform.platformNumber}`);
          
        } catch (error) {
          console.error(`❌ Error sincronizando plataforma ${platform.platformNumber}:`, error);
        }
      }
      
      console.log('✅ Sincronización completada');
      
    } catch (error) {
      console.error('❌ Error en sincronización automática:', error);
    }
  };

  // Cargar datos al iniciar con sistema robusto de recuperación
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Iniciando carga de datos del inventario...');
        
        // ✅ VERIFICAR INTEGRIDAD DE DATOS PRIMERO
        const integrityCheck = StorageService.verifyDataIntegrity();
        if (!integrityCheck.isValid) {
          console.warn('⚠️ Problemas de integridad detectados:', integrityCheck.errors);
          
          // Intentar reparar automáticamente
          const repaired = StorageService.repairData();
          if (repaired) {
            console.log('🔧 Datos reparados automáticamente');
          }
        }
        
        // ✅ CARGAR DATOS PRINCIPALES
        const loadedPlatforms = StorageService.getPlatforms();
        const loadedSettings = StorageService.getSettings();
        
        // ✅ RECUPERAR DATOS DE EMERGENCIA SI ES NECESARIO
        const emergencyData = StorageService.recoverEmergencyData();
        if (emergencyData.length > 0) {
          console.log('🚨 Recuperando datos de emergencia...');
          emergencyData.forEach(platform => {
            StorageService.savePlatform(platform);
          });
        }
        
        // ✅ ACTUALIZAR ESTADO
        const allPlatforms = [...loadedPlatforms, ...emergencyData];
        setCargas(Array.isArray(allPlatforms) ? allPlatforms : []);
        setSettings(loadedSettings);
        
        console.log(`✅ Datos cargados: ${allPlatforms.length} plataformas`);
        
        // ✅ SINCRONIZAR CON BACKEND SI HAY CONEXIÓN (OPCIONAL)
        if (isOnline) {
          try {
            console.log('🌐 Sincronizando con backend...');
            const response = await PlatformApiService.getAllPlatforms({ limit: 1000 });
            if (response.data && response.data.length > 0) {
              // Actualizar con datos del backend
              response.data.forEach(platform => StorageService.savePlatform(platform));
              setCargas(response.data);
              console.log('✅ Sincronización con backend completada');
            }
          } catch (error) {
            console.log('⚠️ Error al sincronizar con backend, continuando con datos locales:', error);
            // ✅ CONTINUAR SIN PROBLEMAS - Los datos locales son suficientes
          }
        } else {
          console.log('📱 Modo offline - usando solo datos locales');
        }
        
      } catch (error) {
        console.error('❌ Error crítico al cargar inventario:', error);
        
        // ✅ ÚLTIMO RECURSO: Intentar recuperar datos de emergencia
        try {
          const emergencyData = StorageService.recoverEmergencyData();
          if (emergencyData.length > 0) {
            setCargas(emergencyData);
            console.log('🚨 Usando datos de emergencia como último recurso');
          } else {
            setCargas([]);
            console.log('❌ No se pudieron recuperar datos');
          }
        } catch (emergencyError) {
          console.error('❌ Error en recuperación de emergencia:', emergencyError);
          setCargas([]);
        }
        
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
    client?: string;
    clientId?: string;
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
      client: data.client,
      clientId: data.clientId || generateId(), // Generar clientId si no se proporciona
      ticketNumber: data.ticketNumber,
      driver: data.driver,
      standardWidth: defaultWidth,
      pieces: [],
      totalLinearMeters: 0,
      totalLength: 0,
      status: 'in_progress' as const,
      notes: data.notes,
      createdBy: 'Usuario Actual', // TODO: Obtener del contexto de usuario
      createdByName: 'Agente Actual', // TODO: Obtener del contexto de usuario
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

  // Agregar pieza a plataforma con guardado garantizado
  const addPiece = useCallback(async (platformId: string, length: number, material: string) => {
    try {
      console.log('➕ Agregando nueva pieza...', { platformId, length, material });
      
      const platform = cargas.find((p: Platform) => p.id === platformId);
      if (!platform) {
        console.error('❌ Plataforma no encontrada:', platformId);
        return false;
      }

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
        updatedAt: new Date(),
        needsSync: true // Marcar para sincronización
      };

      // ✅ GUARDADO INMEDIATO Y GARANTIZADO
      console.log('💾 Guardando pieza localmente...');
      StorageService.savePlatform(updatedPlatform);
      
      // ✅ ACTUALIZAR ESTADO INMEDIATAMENTE
      setCargas((prev: Platform[]) => prev.map((p: Platform) => p.id === platformId ? updatedPlatform : p));
      
      console.log('✅ Pieza guardada exitosamente localmente');

      // ✅ SINCRONIZAR CON BACKEND SI HAY CONEXIÓN
      if (isOnline) {
        try {
          console.log('🌐 Sincronizando con backend...');
          
          // Verificar si la plataforma necesita sincronización
          if (platform.needsSync || platform.id.startsWith('SYNC-') || platform.id.startsWith('OFFLINE-')) {
            // Crear en backend primero
            const createdPlatform = await PlatformApiService.createPlatform(platform);
            
            // Actualizar con el nuevo ID del backend
            await PlatformApiService.updatePlatform(createdPlatform.id, createdPlatform.providerId!, updatedPlatform);
            
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
            
            console.log('✅ Sincronización con backend completada');
          } else {
            // Plataforma ya existe en backend - actualizar directamente
            if (platform.providerId) {
              await PlatformApiService.updatePlatform(platform.id, platform.providerId, updatedPlatform);
              
              // Marcar como sincronizada
              const syncedPlatform = { ...updatedPlatform, needsSync: false };
              StorageService.savePlatform(syncedPlatform);
              setCargas((prev: Platform[]) => prev.map((p: Platform) => p.id === platformId ? syncedPlatform : p));
              
              console.log('✅ Pieza actualizada en backend');
            }
          }
        } catch (error) {
          console.error('⚠️ Error al sincronizar con backend:', error);
          // Mantener marcado como pendiente de sincronización
          console.log('📝 Pieza marcada para sincronización posterior');
        }
      } else {
        console.log('📱 Sin conexión - pieza guardada localmente y marcada para sincronización');
      }

      return true;
      
    } catch (error) {
      console.error('❌ Error crítico al agregar pieza:', error);
      
      // ✅ INTENTAR GUARDADO DE EMERGENCIA
      try {
        const emergencyPiece = {
          id: generateId(),
          number: 1,
          length,
          standardWidth: platform?.standardWidth || 0.3,
          linearMeters: length * (platform?.standardWidth || 0.3),
          material,
          createdAt: new Date()
        };
        
        if (platform) {
          StorageService.emergencySave({
            ...platform,
            pieces: [...platform.pieces, emergencyPiece],
            updatedAt: new Date()
          });
          
          console.log('🚨 Pieza guardada en modo de emergencia');
          return true;
        }
        
      } catch (emergencyError) {
        console.error('❌ Error en guardado de emergencia:', emergencyError);
      }
      
      return false;
    }
  }, [cargas, isOnline]);

  // Agregar múltiples líneas
  const addMultiplePieces = useCallback(async (platformId: string, pieces: { length: number; material: string }[]) => {
    const platform = cargas.find((p: Platform) => p.id === platformId);
    if (!platform) return;

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

    // Actualizar localmente primero
    StorageService.savePlatform(updatedPlatform);
    setCargas((prev: Platform[]) => prev.map((p: Platform) => p.id === platformId ? updatedPlatform : p));

    // ✅ SINCRONIZAR INMEDIATAMENTE CON BACKEND
    if (isOnline) {
      try {
        // Verificar si la plataforma necesita sincronización
        if (platform.needsSync || platform.id.startsWith('SYNC-') || platform.id.startsWith('OFFLINE-')) {
          // Crear en backend primero
          const createdPlatform = await PlatformApiService.createPlatform(platform);
          
          // Actualizar con el nuevo ID del backend
          await PlatformApiService.updatePlatform(createdPlatform.id, createdPlatform.providerId!, updatedPlatform);
          
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
        } else {
          // Plataforma ya existe en backend - actualizar directamente
          if (platform.providerId) {
            await PlatformApiService.updatePlatform(platform.id, platform.providerId, updatedPlatform);
          }
        }
      } catch (error) {
        console.error('Error sincronizando múltiples líneas con backend:', error);
        // Marcar que necesita sincronización
        const platformWithSyncFlag = { ...updatedPlatform, needsSync: true };
        StorageService.savePlatform(platformWithSyncFlag);
        setCargas((prev: Platform[]) => prev.map((p: Platform) => p.id === platformId ? platformWithSyncFlag : p));
      }
    }
  }, [cargas, isOnline]);

  // Actualizar pieza
  const updatePiece = useCallback((platformId: string, pieceId: string, updates: { length?: number; material?: string; standardWidth?: number }) => {
    setCargas((prev: Platform[]) => {
      const updated = prev.map((platform: Platform) => {
        if (platform.id === platformId) {
          const updatedPieces = platform.pieces.map((piece: Piece) => {
            if (piece.id === pieceId) {
              const newLength = updates.length !== undefined ? updates.length : piece.length;
              const newWidth = updates.standardWidth !== undefined ? updates.standardWidth : piece.standardWidth;
              return {
                ...piece,
                length: newLength,
                standardWidth: newWidth,
                material: updates.material !== undefined ? updates.material : piece.material,
                linearMeters: calculateLinearMeters(newLength, newWidth)
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
          // Recalcular todas las líneas con el nuevo ancho
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

  // Estado de persistencia para el componente de estado
  const persistenceStatus = {
    isOnline,
    hasPendingSync: StorageService.getPendingSyncPlatforms().length > 0,
    lastSaveTime: cargas.length > 0 ? new Date() : null,
    pendingCount: StorageService.getPendingSyncPlatforms().length
  };

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
    updatePlatformEvidence,
    // ✅ NUEVO: Estado de persistencia
    persistenceStatus
  };
};

