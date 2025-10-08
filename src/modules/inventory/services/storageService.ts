// Servicio para manejo de localStorage

import type { Platform, InventorySettings } from '../types';

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
   * Guarda una plataforma
   */
  static savePlatform(platform: Platform): void {
    const platforms = this.getPlatforms();
    const index = platforms.findIndex(p => p.id === platform.id);
    
    if (index >= 0) {
      platforms[index] = { ...platform, updatedAt: new Date() };
    } else {
      platforms.push(platform);
    }
    
    this.savePlatforms(platforms);
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

  /**
   * Limpia todos los datos
   */
  static clearAll(): void {
    localStorage.removeItem(getPlatformsKey());
    localStorage.removeItem(getSettingsKey());
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
}

