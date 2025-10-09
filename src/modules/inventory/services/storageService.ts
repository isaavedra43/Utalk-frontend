// Servicio para manejo de localStorage

import type { Platform, InventorySettings, Driver } from '../types';

// ✅ SOLUCIÓN: Aislar localStorage por usuario
const getUserId = (): string => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return 'anonymous';
    
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    const userData = JSON.parse(decodedPayload);
    return userData.userId || userData.email || 'anonymous';
  } catch (error) {
    console.error('Error getting user ID:', error);
    return 'anonymous';
  }
};

const getPlatformsKey = (): string => `inventory_platforms_${getUserId()}`;
const getSettingsKey = (): string => `inventory_settings_${getUserId()}`;
const getDriversKey = (): string => `inventory_drivers_${getUserId()}`;

/**
 * Servicio de almacenamiento local
 */
export class StorageService {
  /**
   * Obtiene todas las plataformas
   */
  static getPlatforms(): Platform[] {
    try {
      const data = localStorage.getItem(getPlatformsKey());
      if (!data) return [];
      
      const platforms = JSON.parse(data);
      // Convertir fechas de string a Date
      return platforms.map((p: Platform & { receptionDate: string | Date; createdAt: string | Date; updatedAt: string | Date }) => ({
        ...p,
        receptionDate: new Date(p.receptionDate),
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        pieces: p.pieces.map((piece: { id: string; number: number; length: number; standardWidth: number; linearMeters: number; material: string; createdAt: string | Date }) => ({
          ...piece,
          createdAt: new Date(piece.createdAt)
        }))
      }));
    } catch (error) {
      console.error('Error al cargar plataformas:', error);
      return [];
    }
  }

  /**
   * Guarda todas las plataformas
   */
  static savePlatforms(platforms: Platform[]): void {
    try {
      localStorage.setItem(getPlatformsKey(), JSON.stringify(platforms));
    } catch (error) {
      console.error('Error al guardar plataformas:', error);
      throw new Error('No se pudo guardar la información. El almacenamiento local podría estar lleno.');
    }
  }

  /**
   * Obtiene una plataforma por ID
   */
  static getPlatform(id: string): Platform | null {
    const platforms = this.getPlatforms();
    return platforms.find(p => p.id === id) || null;
  }

  /**
   * Guarda una plataforma con múltiples capas de seguridad
   */
  static savePlatform(platform: Platform): void {
    try {
      // ✅ GUARDADO INMEDIATO Y ROBUSTO
      const platforms = this.getPlatforms();
      const index = platforms.findIndex(p => p.id === platform.id);
      
      // Actualizar timestamp
      const updatedPlatform = { ...platform, updatedAt: new Date() };
      
      if (index >= 0) {
        platforms[index] = updatedPlatform;
      } else {
        platforms.push(updatedPlatform);
      }
      
      // ✅ MÚLTIPLES CAPAS DE GUARDADO
      
      // 1. Guardado principal
      this.savePlatforms(platforms);
      
      // 2. Backup individual de la plataforma
      this.createPlatformBackup(updatedPlatform);
      
      // 3. Guardado en IndexedDB como respaldo adicional
      this.saveToIndexedDB(updatedPlatform);
      
      console.log('✅ Plataforma guardada exitosamente:', platform.platformNumber);
      
    } catch (error) {
      console.error('❌ Error crítico al guardar plataforma:', error);
      
      // ✅ INTENTAR GUARDADO DE EMERGENCIA
      try {
        this.emergencySave(platform);
      } catch (emergencyError) {
        console.error('❌ Error en guardado de emergencia:', emergencyError);
        throw new Error('No se pudo guardar la información. Intenta nuevamente.');
      }
    }
  }

  /**
   * Elimina una plataforma
   */
  static deletePlatform(id: string): void {
    const platforms = this.getPlatforms();
    const filtered = platforms.filter(p => p.id !== id);
    this.savePlatforms(filtered);
  }

  /**
   * Obtiene la configuración
   */
  static getSettings(): InventorySettings {
    try {
      const data = localStorage.getItem(getSettingsKey());
      if (!data) {
        return {
          defaultStandardWidth: 0.3,
          autoSaveEnabled: true,
          showPieceNumbers: true
        };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      return {
        defaultStandardWidth: 0.3,
        autoSaveEnabled: true,
        showPieceNumbers: true
      };
    }
  }

  /**
   * Guarda la configuración
   */
  static saveSettings(settings: InventorySettings): void {
    try {
      localStorage.setItem(getSettingsKey(), JSON.stringify(settings));
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    }
  }

  // ==================== CHOFERES ====================

  /**
   * Obtiene todos los choferes
   */
  static getDrivers(): Driver[] {
    try {
      const data = localStorage.getItem(getDriversKey());
      if (!data) return [];
      
      const drivers = JSON.parse(data);
      // Convertir fechas de string a Date
      return drivers.map((d: Driver & { createdAt?: string | Date; updatedAt?: string | Date }) => ({
        ...d,
        createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
        updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined
      }));
    } catch (error) {
      console.error('Error al cargar choferes:', error);
      return [];
    }
  }

  /**
   * Guarda todos los choferes
   */
  static saveDrivers(drivers: Driver[]): void {
    try {
      localStorage.setItem(getDriversKey(), JSON.stringify(drivers));
    } catch (error) {
      console.error('Error al guardar choferes:', error);
      throw new Error('No se pudo guardar la información. El almacenamiento local podría estar lleno.');
    }
  }

  /**
   * Guarda un chofer individual
   */
  static saveDriver(driver: Driver): void {
    const drivers = this.getDrivers();
    const index = drivers.findIndex(d => d.id === driver.id);
    
    if (index >= 0) {
      drivers[index] = { ...driver, updatedAt: new Date() };
    } else {
      drivers.push({ ...driver, createdAt: new Date(), updatedAt: new Date() });
    }
    
    this.saveDrivers(drivers);
  }

  /**
   * Elimina un chofer
   */
  static deleteDriver(driverId: string): void {
    const drivers = this.getDrivers();
    const filteredDrivers = drivers.filter(d => d.id !== driverId);
    this.saveDrivers(filteredDrivers);
  }

  /**
   * Obtiene un chofer por ID
   */
  static getDriverById(driverId: string): Driver | null {
    const drivers = this.getDrivers();
    return drivers.find(d => d.id === driverId) || null;
  }

  /**
   * Limpia todos los datos
   */
  static clearAll(): void {
    localStorage.removeItem(getPlatformsKey());
    localStorage.removeItem(getSettingsKey());
    localStorage.removeItem(getDriversKey());
  }

  /**
   * Exporta todos los datos como JSON
   */
  static exportData(): string {
    const platforms = this.getPlatforms();
    const settings = this.getSettings();
    
    return JSON.stringify({
      platforms,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  /**
   * Importa datos desde JSON
   */
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.platforms) {
        this.savePlatforms(data.platforms);
      }
      
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      
      return true;
    } catch (error) {
      console.error('Error al importar datos:', error);
      return false;
    }
  }

  /**
   * Obtiene plataformas que necesitan sincronización
   */
  static getPendingSyncPlatforms(): Platform[] {
    const platforms = this.getPlatforms();
    return platforms.filter(p => p.needsSync === true);
  }

  /**
   * Marca una plataforma como sincronizada
   */
  static markPlatformAsSynced(platformId: string): void {
    const platforms = this.getPlatforms();
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      platform.needsSync = false;
      this.savePlatforms(platforms);
    }
  }

  /**
   * Marca una plataforma como pendiente de sincronización
   */
  static markPlatformAsPendingSync(platformId: string): void {
    const platforms = this.getPlatforms();
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      platform.needsSync = true;
      this.savePlatforms(platforms);
    }
  }

  // ==================== SISTEMA DE BACKUP Y RESPALDO ====================

  /**
   * Crea un backup individual de una plataforma
   */
  private static createPlatformBackup(platform: Platform): void {
    try {
      const backupKey = `backup_platform_${platform.id}_${Date.now()}`;
      const backupData = {
        platform,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      
      // Limpiar backups antiguos (mantener solo los últimos 5)
      this.cleanOldBackups(platform.id);
      
    } catch (error) {
      console.warn('⚠️ No se pudo crear backup de plataforma:', error);
    }
  }

  /**
   * Limpia backups antiguos manteniendo solo los últimos 5
   */
  private static cleanOldBackups(platformId: string): void {
    try {
      const backupKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`backup_platform_${platformId}_`)) {
          backupKeys.push(key);
        }
      }
      
      // Ordenar por timestamp (más reciente primero)
      backupKeys.sort((a, b) => {
        const timestampA = parseInt(a.split('_').pop() || '0');
        const timestampB = parseInt(b.split('_').pop() || '0');
        return timestampB - timestampA;
      });
      
      // Eliminar backups antiguos (mantener solo los últimos 5)
      if (backupKeys.length > 5) {
        const keysToRemove = backupKeys.slice(5);
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
    } catch (error) {
      console.warn('⚠️ Error limpiando backups antiguos:', error);
    }
  }

  /**
   * Guarda en IndexedDB como respaldo adicional
   */
  private static saveToIndexedDB(platform: Platform): void {
    try {
      // Verificar si IndexedDB está disponible
      if (!('indexedDB' in window)) {
        return;
      }

      const request = indexedDB.open('InventoryBackup', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('platforms')) {
          db.createObjectStore('platforms', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['platforms'], 'readwrite');
        const store = transaction.objectStore('platforms');
        
        const platformData = {
          ...platform,
          backupTimestamp: new Date().toISOString()
        };
        
        store.put(platformData);
      };
      
    } catch (error) {
      console.warn('⚠️ No se pudo guardar en IndexedDB:', error);
    }
  }

  /**
   * Guardado de emergencia cuando fallan otros métodos
   */
  private static emergencySave(platform: Platform): void {
    try {
      // Intentar guardar con un nombre diferente
      const emergencyKey = `emergency_platform_${platform.id}_${Date.now()}`;
      localStorage.setItem(emergencyKey, JSON.stringify(platform));
      
      console.log('🚨 Guardado de emergencia exitoso:', emergencyKey);
      
      // También intentar en sessionStorage como último recurso
      try {
        sessionStorage.setItem(`emergency_${platform.id}`, JSON.stringify(platform));
      } catch (sessionError) {
        console.warn('⚠️ No se pudo guardar en sessionStorage:', sessionError);
      }
      
    } catch (error) {
      console.error('❌ Guardado de emergencia falló:', error);
      throw error;
    }
  }

  /**
   * Recupera datos de emergencia
   */
  static recoverEmergencyData(): Platform[] {
    const recoveredPlatforms: Platform[] = [];
    
    try {
      // Buscar en localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('emergency_platform_')) {
          const data = localStorage.getItem(key);
          if (data) {
            const platform = JSON.parse(data);
            recoveredPlatforms.push(platform);
          }
        }
      }
      
      // Buscar en sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('emergency_')) {
          const data = sessionStorage.getItem(key);
          if (data) {
            const platform = JSON.parse(data);
            recoveredPlatforms.push(platform);
          }
        }
      }
      
      if (recoveredPlatforms.length > 0) {
        console.log('🔄 Datos de emergencia recuperados:', recoveredPlatforms.length);
      }
      
    } catch (error) {
      console.error('❌ Error recuperando datos de emergencia:', error);
    }
    
    return recoveredPlatforms;
  }

  /**
   * Verifica la integridad de los datos
   */
  static verifyDataIntegrity(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      const platforms = this.getPlatforms();
      
      platforms.forEach((platform, index) => {
        // Verificar campos requeridos
        if (!platform.id) errors.push(`Plataforma ${index}: ID faltante`);
        if (!platform.platformNumber) errors.push(`Plataforma ${index}: Número de plataforma faltante`);
        if (!platform.pieces || !Array.isArray(platform.pieces)) {
          errors.push(`Plataforma ${index}: Piezas inválidas`);
        }
        
        // Verificar piezas
        platform.pieces.forEach((piece, pieceIndex) => {
          if (!piece.id) errors.push(`Plataforma ${index}, Pieza ${pieceIndex}: ID faltante`);
          if (piece.length <= 0) errors.push(`Plataforma ${index}, Pieza ${pieceIndex}: Longitud inválida`);
          if (piece.standardWidth <= 0) errors.push(`Plataforma ${index}, Pieza ${pieceIndex}: Ancho inválido`);
        });
      });
      
      return {
        isValid: errors.length === 0,
        errors
      };
      
    } catch (error) {
      errors.push(`Error general: ${error}`);
      return { isValid: false, errors };
    }
  }

  /**
   * Repara datos corruptos automáticamente
   */
  static repairData(): boolean {
    try {
      const platforms = this.getPlatforms();
      let hasRepairs = false;
      
      const repairedPlatforms = platforms.map(platform => {
        let repaired = { ...platform };
        
        // Reparar campos faltantes
        if (!repaired.id) {
          repaired.id = `repaired_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          hasRepairs = true;
        }
        
        if (!repaired.platformNumber) {
          repaired.platformNumber = `SYNC-${Date.now()}`;
          hasRepairs = true;
        }
        
        if (!repaired.pieces || !Array.isArray(repaired.pieces)) {
          repaired.pieces = [];
          hasRepairs = true;
        }
        
        // Reparar piezas
        repaired.pieces = repaired.pieces.map(piece => {
          let repairedPiece = { ...piece };
          
          if (!repairedPiece.id) {
            repairedPiece.id = `piece_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            hasRepairs = true;
          }
          
          if (repairedPiece.length <= 0) {
            repairedPiece.length = 1.0;
            hasRepairs = true;
          }
          
          if (repairedPiece.standardWidth <= 0) {
            repairedPiece.standardWidth = 0.3;
            hasRepairs = true;
          }
          
          // Recalcular metros lineales si es necesario
          if (!repairedPiece.linearMeters || repairedPiece.linearMeters <= 0) {
            repairedPiece.linearMeters = repairedPiece.length * repairedPiece.standardWidth;
            hasRepairs = true;
          }
          
          return repairedPiece;
        });
        
        return repaired;
      });
      
      if (hasRepairs) {
        this.savePlatforms(repairedPlatforms);
        console.log('🔧 Datos reparados exitosamente');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error reparando datos:', error);
      return false;
    }
  }
}

