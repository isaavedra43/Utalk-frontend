import api from '../../../services/api';
import type { 
  Platform, 
  Provider, 
  MaterialOption, 
  ModuleConfiguration 
} from '../types';

/**
 * Servicio para comunicación con el backend del módulo de inventario
 * 
 * ESTRUCTURA DEL BACKEND:
 * - Colección principal: 'providers' (padre)
 * - Subcolección: 'platforms' (por proveedor)
 * - Colección: 'materials' (global)
 * - Colección: 'configurations' (por usuario/empresa)
 */

// Interfaces para respuestas del backend
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    nextOffset?: number;
  };
  filters?: {
    available?: {
      statuses?: string[];
      providers?: string[];
      materialTypes?: string[];
    };
  };
}

interface PlatformStats {
  period: {
    type: string;
    startDate: string;
    endDate: string;
  };
  totals: {
    totalPlatforms: number;
    inProgress: number;
    completed: number;
    exported: number;
    totalLinearMeters: number;
    totalLength: number;
    average: number;
  };
  materials: {
    totalLinearMeters: number;
    totalLength: number;
    average: number;
  };
  providers: {
    active: number;
    topProvider?: {
      id: string;
      name: string;
      platforms: number;
      linearMeters: number;
    };
  };
  breakdown: {
    byStatus: Record<string, number>;
    byMaterial: Array<{
      material: string;
      platforms: number;
      linearMeters: number;
      percentage: number;
    }>;
    byProvider: Array<{
      providerId: string;
      provider: string;
      platforms: number;
      linearMeters: number;
      percentage: number;
    }>;
  };
}

// ==================== PROVEEDORES ====================

export class ProviderApiService {
  private static readonly BASE_PATH = '/api/inventory/providers';

  /**
   * Obtener todos los proveedores
   */
  static async getAllProviders(): Promise<Provider[]> {
    try {
      const response = await api.get<ApiResponse<Provider[]>>(this.BASE_PATH);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw error;
    }
  }

  /**
   * Obtener un proveedor por ID
   */
  static async getProviderById(providerId: string): Promise<Provider> {
    try {
      const response = await api.get<ApiResponse<Provider>>(`${this.BASE_PATH}/${providerId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching provider:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo proveedor
   */
  static async createProvider(provider: Omit<Provider, 'id'>): Promise<Provider> {
    try {
      const response = await api.post<ApiResponse<Provider>>(this.BASE_PATH, provider);
      return response.data.data;
    } catch (error) {
      console.error('Error creating provider:', error);
      throw error;
    }
  }

  /**
   * Actualizar proveedor
   */
  static async updateProvider(providerId: string, updates: Partial<Provider>): Promise<Provider> {
    try {
      const response = await api.put<ApiResponse<Provider>>(
        `${this.BASE_PATH}/${providerId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating provider:', error);
      throw error;
    }
  }

  /**
   * Eliminar proveedor
   */
  static async deleteProvider(providerId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${providerId}`);
    } catch (error) {
      console.error('Error deleting provider:', error);
      throw error;
    }
  }

  /**
   * Obtener plataformas de un proveedor
   */
  static async getProviderPlatforms(providerId: string): Promise<Platform[]> {
    try {
      const response = await api.get<ApiResponse<Platform[]>>(
        `${this.BASE_PATH}/${providerId}/platforms`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching provider platforms:', error);
      throw error;
    }
  }

  /**
   * Obtener materiales de un proveedor
   */
  static async getProviderMaterials(providerId: string): Promise<MaterialOption[]> {
    try {
      const response = await api.get<ApiResponse<MaterialOption[]>>(
        `${this.BASE_PATH}/${providerId}/materials`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching provider materials:', error);
      throw error;
    }
  }
}

// ==================== PLATAFORMAS ====================

export class PlatformApiService {
  private static readonly BASE_PATH = '/api/inventory/platforms';

  /**
   * Obtener todas las plataformas (con filtros opcionales)
   */
  static async getAllPlatforms(filters?: {
    status?: string;
    providerId?: string;
    provider?: string;
    materialType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Platform>> {
    try {
      const params: any = {};
      
      // Convertir fechas a ISO strings si se proporcionan como Date
      if (filters?.startDate) {
        params.startDate = typeof filters.startDate === 'string' 
          ? filters.startDate 
          : filters.startDate.toISOString();
      }
      if (filters?.endDate) {
        params.endDate = typeof filters.endDate === 'string' 
          ? filters.endDate 
          : filters.endDate.toISOString();
      }
      
      // Agregar otros filtros
      if (filters?.status) params.status = filters.status;
      if (filters?.providerId) params.providerId = filters.providerId;
      if (filters?.provider) params.provider = filters.provider;
      if (filters?.materialType) params.materialType = filters.materialType;
      if (filters?.search) params.search = filters.search;
      if (filters?.sortBy) params.sortBy = filters.sortBy;
      if (filters?.sortOrder) params.sortOrder = filters.sortOrder;
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.offset) params.offset = filters.offset;

      const response = await api.get<ApiResponse<PaginatedResponse<Platform>>>(this.BASE_PATH, {
        params
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching platforms:', error);
      throw error;
    }
  }

  /**
   * Obtener una plataforma por ID (requiere providerId)
   */
  static async getPlatformById(platformId: string, providerId: string): Promise<Platform> {
    try {
      const response = await api.get<ApiResponse<Platform>>(`${this.BASE_PATH}/${platformId}`, {
        params: { providerId }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching platform:', error);
      throw error;
    }
  }

  /**
   * Crear nueva plataforma (el backend genera automáticamente el platformNumber)
   */
  static async createPlatform(platform: Omit<Platform, 'id' | 'platformNumber' | 'createdAt' | 'updatedAt'>): Promise<Platform> {
    try {
      // Asegurar que receptionDate esté en formato ISO string
      const platformData = {
        ...platform,
        receptionDate: typeof platform.receptionDate === 'string' 
          ? platform.receptionDate 
          : platform.receptionDate.toISOString()
      };
      
      const response = await api.post<ApiResponse<Platform>>(this.BASE_PATH, platformData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating platform:', error);
      throw error;
    }
  }

  /**
   * Actualizar plataforma (requiere providerId)
   */
  static async updatePlatform(platformId: string, providerId: string, updates: Partial<Platform>): Promise<Platform> {
    try {
      const response = await api.put<ApiResponse<Platform>>(
        `${this.BASE_PATH}/${platformId}`,
        updates,
        { params: { providerId } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating platform:', error);
      throw error;
    }
  }

  /**
   * Eliminar plataforma (requiere providerId)
   */
  static async deletePlatform(platformId: string, providerId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${platformId}`, {
        params: { providerId }
      });
    } catch (error) {
      console.error('Error deleting platform:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de plataformas
   */
  static async getPlatformStats(filters?: {
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    providerId?: string;
    materialType?: string;
  }): Promise<PlatformStats> {
    try {
      const response = await api.get<ApiResponse<PlatformStats>>(`${this.BASE_PATH}/stats`, {
        params: filters
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      throw error;
    }
  }
}

// ==================== MATERIALES ====================

export class MaterialApiService {
  private static readonly BASE_PATH = '/api/inventory/materials';

  /**
   * Obtener todos los materiales
   */
  static async getAllMaterials(filters?: {
    active?: boolean;
    category?: string;
    providerId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<MaterialOption>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<MaterialOption>>>(this.BASE_PATH, {
        params: filters
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  }

  /**
   * Obtener materiales activos
   */
  static async getActiveMaterials(): Promise<MaterialOption[]> {
    try {
      const response = await api.get<ApiResponse<MaterialOption[]>>(
        `${this.BASE_PATH}/active`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching active materials:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo material
   */
  static async createMaterial(material: Omit<MaterialOption, 'id'>): Promise<MaterialOption> {
    try {
      const response = await api.post<ApiResponse<MaterialOption>>(this.BASE_PATH, material);
      return response.data.data;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  }

  /**
   * Actualizar material
   */
  static async updateMaterial(materialId: string, updates: Partial<MaterialOption>): Promise<MaterialOption> {
    try {
      const response = await api.put<ApiResponse<MaterialOption>>(
        `${this.BASE_PATH}/${materialId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  }

  /**
   * Eliminar material
   */
  static async deleteMaterial(materialId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${materialId}`);
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }

  /**
   * Obtener materiales por categoría
   */
  static async getMaterialsByCategory(category: string): Promise<MaterialOption[]> {
    try {
      const response = await api.get<ApiResponse<MaterialOption[]>>(
        `${this.BASE_PATH}/category/${category}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching materials by category:', error);
      throw error;
    }
  }
}

// ==================== CONFIGURACIÓN ====================

export class ConfigurationApiService {
  private static readonly BASE_PATH = '/api/inventory/configuration';

  /**
   * Obtener configuración del usuario/empresa
   */
  static async getConfiguration(): Promise<ModuleConfiguration> {
    try {
      const response = await api.get<ApiResponse<ModuleConfiguration>>(this.BASE_PATH);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching configuration:', error);
      throw error;
    }
  }

  /**
   * Guardar/actualizar configuración
   */
  static async saveConfiguration(config: ModuleConfiguration): Promise<ModuleConfiguration> {
    try {
      const response = await api.put<ApiResponse<ModuleConfiguration>>(
        this.BASE_PATH,
        config
      );
      return response.data.data;
    } catch (error) {
      console.error('Error saving configuration:', error);
      throw error;
    }
  }

  /**
   * Sincronizar configuración local con servidor
   */
  static async syncConfiguration(localConfig: ModuleConfiguration): Promise<{
    needsUpdate: boolean;
    serverConfig?: ModuleConfiguration;
  }> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.BASE_PATH}/sync`,
        {
          lastUpdated: localConfig.lastUpdated,
          checksum: this.generateConfigChecksum(localConfig)
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error syncing configuration:', error);
      throw error;
    }
  }

  /**
   * Generar checksum de configuración para detectar cambios
   */
  private static generateConfigChecksum(config: ModuleConfiguration): string {
    const data = JSON.stringify({
      providers: config.providers.length,
      materials: config.materials.length,
      settings: config.settings
    });
    return btoa(data);
  }
}

// ==================== SINCRONIZACIÓN ====================

export class SyncService {
  /**
   * Sincronizar todos los datos locales con el servidor
   */
  static async syncAllData(localData: {
    platforms: Platform[];
    providers: Provider[];
    materials: MaterialOption[];
    configuration: ModuleConfiguration;
  }): Promise<{
    syncedPlatforms: number;
    syncedProviders: number;
    syncedMaterials: number;
    syncedConfiguration: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let syncedPlatforms = 0;
    let syncedProviders = 0;
    let syncedMaterials = 0;
    let syncedConfiguration = false;

    try {
      // Sincronizar configuración
      try {
        await ConfigurationApiService.saveConfiguration(localData.configuration);
        syncedConfiguration = true;
      } catch (error) {
        errors.push('Error syncing configuration: ' + error);
      }

      // Sincronizar proveedores
      for (const provider of localData.providers) {
        try {
          if (provider.id.startsWith('prov-')) {
            // IDs generados localmente - crear en servidor
            await ProviderApiService.createProvider(provider);
          } else {
            // IDs del servidor - actualizar
            await ProviderApiService.updateProvider(provider.id, provider);
          }
          syncedProviders++;
        } catch (error) {
          errors.push(`Error syncing provider ${provider.id}: ${error}`);
        }
      }

      // Sincronizar materiales
      for (const material of localData.materials) {
        try {
          if (material.id.startsWith('mat-')) {
            // IDs generados localmente - crear en servidor
            await MaterialApiService.createMaterial(material);
          } else {
            // IDs del servidor - actualizar
            await MaterialApiService.updateMaterial(material.id, material);
          }
          syncedMaterials++;
        } catch (error) {
          errors.push(`Error syncing material ${material.id}: ${error}`);
        }
      }

      // Sincronizar plataformas
      for (const platform of localData.platforms) {
        try {
          if (platform.id.startsWith('id-') || platform.id.startsWith('plat-')) {
            // IDs generados localmente - crear en servidor
            await PlatformApiService.createPlatform(platform);
          } else {
            // IDs del servidor - actualizar (requiere providerId)
            if (platform.providerId) {
              await PlatformApiService.updatePlatform(platform.id, platform.providerId, platform);
            } else {
              errors.push(`Platform ${platform.id} missing providerId for update`);
            }
          }
          syncedPlatforms++;
        } catch (error) {
          errors.push(`Error syncing platform ${platform.id}: ${error}`);
        }
      }

      return {
        syncedPlatforms,
        syncedProviders,
        syncedMaterials,
        syncedConfiguration,
        errors
      };
    } catch (error) {
      errors.push('Critical sync error: ' + error);
      return {
        syncedPlatforms,
        syncedProviders,
        syncedMaterials,
        syncedConfiguration,
        errors
      };
    }
  }

  /**
   * Verificar conectividad con el servidor
   */
  static async checkConnection(): Promise<boolean> {
    try {
      await api.get('/api/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default {
  ProviderApiService,
  PlatformApiService,
  MaterialApiService,
  ConfigurationApiService,
  SyncService
};

