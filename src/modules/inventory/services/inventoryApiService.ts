import api from '../../../services/api';
import type { 
  Platform, 
  Provider, 
  MaterialOption, 
  Driver,
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

// ✅ NUEVO: Interfaz para respuestas del servidor de plataformas
interface PlatformServerResponse {
  platforms?: Platform[];
  data?: Platform[];
  pagination?: {
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

// ==================== PROVEEDORES ====================

export class ProviderApiService {
  private static readonly BASE_PATH = '/api/inventory/providers';

  /**
   * Obtener todos los proveedores (global, sin userId)
   */
  static async getAllProviders(): Promise<Provider[]> {
    try {
      const response = await api.get<ApiResponse<{ providers: Provider[] }>>(this.BASE_PATH, {
        params: { limit: 1000, offset: 0, search: '', isActive: '' }
      });
      
      // Manejar diferentes formatos de respuesta
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data.data && Array.isArray(response.data.data.providers)) {
        return response.data.data.providers;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
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
   * Obtener materiales de un proveedor específico
   */
  static async getProviderMaterials(providerId: string): Promise<MaterialOption[]> {
    try {
      const response = await api.get<ApiResponse<MaterialOption[]>>(
        `${this.BASE_PATH}/${providerId}/materials`
      );
      
      // Manejar diferentes formatos de respuesta
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
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
    startDate?: string | Date;
    endDate?: string | Date;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Platform>> {
    try {
      const params: Record<string, string | number> = {};
      
      // Convertir fechas a ISO strings si se proporcionan como Date
      if (filters?.startDate) {
        params.startDate = typeof filters.startDate === 'string' 
          ? filters.startDate 
          : (filters.startDate as Date).toISOString();
      }
      if (filters?.endDate) {
        params.endDate = typeof filters.endDate === 'string' 
          ? filters.endDate 
          : (filters.endDate as Date).toISOString();
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

      const response = await api.get<ApiResponse<PlatformServerResponse | Platform[]>>(this.BASE_PATH, {
        params
      });
      
      // Normalizar formato de respuesta del backend:
      // A) { success, data: { platforms: Platform[], pagination, filters } }
      // B) { success, data: { data: Platform[], pagination, filters } }
      // C) { success, data: Platform[] } (fallback legacy)
      const serverData = response.data?.data;
      
      // Si es un array directo (formato legacy)
      if (Array.isArray(serverData)) {
        return { 
          data: serverData, 
          pagination: { 
            total: serverData.length, 
            limit: params?.limit ?? serverData.length, 
            offset: params?.offset ?? 0, 
            hasMore: false 
          } 
        } as PaginatedResponse<Platform>;
      }
      
      // Si es un objeto con estructura compleja
      if (serverData && typeof serverData === 'object') {
        const platformData = serverData as PlatformServerResponse;
        
        // Formato A: { platforms: Platform[] }
        if (Array.isArray(platformData.platforms)) {
          return {
            data: platformData.platforms,
            pagination: platformData.pagination ?? { 
              total: platformData.platforms.length, 
              limit: params?.limit ?? platformData.platforms.length, 
              offset: params?.offset ?? 0, 
              hasMore: false 
            },
            filters: platformData.filters
          } as PaginatedResponse<Platform>;
        }
        
        // Formato B: { data: Platform[] }
        if (Array.isArray(platformData.data)) {
          return {
            data: platformData.data,
            pagination: platformData.pagination ?? { 
              total: platformData.data.length, 
              limit: params?.limit ?? platformData.data.length, 
              offset: params?.offset ?? 0, 
              hasMore: false 
            },
            filters: platformData.filters
          } as PaginatedResponse<Platform>;
        }
      }
      
      // Si nada coincide, devolver estructura vacía para no romper UI
      return { 
        data: [], 
        pagination: { 
          total: 0, 
          limit: params?.limit ?? 0, 
          offset: params?.offset ?? 0, 
          hasMore: false 
        } 
      } as PaginatedResponse<Platform>;
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
   * Crear nueva plataforma (incluye platformNumber generado por frontend)
   */
  static async createPlatform(platform: Omit<Platform, 'id' | 'createdAt' | 'updatedAt'>): Promise<Platform> {
    try {
      // Asegurar que receptionDate esté en formato ISO string
      const platformData = {
        ...platform,
        receptionDate: typeof platform.receptionDate === 'string' 
          ? platform.receptionDate 
          : platform.receptionDate.toISOString(),
        // Asegurar que platformNumber esté presente
        platformNumber: platform.platformNumber || `SYNC-${Date.now()}`
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

// ==================== CHOFERES ====================

export class DriverApiService {
  private static readonly BASE_PATH = '/api/inventory/drivers';

  /**
   * Obtener todos los choferes (global, sin userId)
   */
  // ✅ Caché para evitar múltiples llamadas simultáneas
  private static driversCache: { data: PaginatedResponse<Driver> | null; timestamp: number } = { 
    data: null, 
    timestamp: 0 
  };
  private static readonly CACHE_DURATION = 5000; // 5 segundos
  private static pendingRequest: Promise<PaginatedResponse<Driver>> | null = null;

  static async getAllDrivers(filters?: {
    active?: boolean;
    vehicleType?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Driver>> {
    try {
      // ✅ Si ya hay una petición en curso, esperar a que termine
      if (this.pendingRequest) {
        console.log('⏳ [DriverApiService] Petición en curso, esperando...');
        return await this.pendingRequest;
      }

      // ✅ Verificar caché (solo si no hay filtros personalizados)
      const now = Date.now();
      const isDefaultQuery = !filters || (
        !filters.search && 
        !filters.vehicleType && 
        filters.active === undefined
      );
      
      if (isDefaultQuery && this.driversCache.data && (now - this.driversCache.timestamp < this.CACHE_DURATION)) {
        console.log('📦 [DriverApiService] Retornando datos del caché');
        return this.driversCache.data;
      }

      // ✅ Crear la petición y guardarla como pendiente
      this.pendingRequest = (async () => {
        const params = {
          limit: filters?.limit || 1000,
          offset: filters?.offset || 0,
          search: filters?.search || '',
          vehicleType: filters?.vehicleType || '',
          isActive: filters?.active !== undefined ? filters.active.toString() : ''
        };
        
        const response = await api.get<ApiResponse<{ drivers: Driver[] }>>(this.BASE_PATH, {
          params
        });
        
        // Manejar diferentes formatos de respuesta
        let drivers: Driver[] = [];
        
        if (response.data.data && Array.isArray(response.data.data)) {
          drivers = response.data.data;
        } else if (response.data.data && Array.isArray(response.data.data.drivers)) {
          drivers = response.data.data.drivers;
        } else if (response.data && Array.isArray(response.data)) {
          drivers = response.data;
        }
        
        const result = {
          data: drivers,
          pagination: {
            total: drivers.length,
            limit: params.limit,
            offset: params.offset,
            hasMore: false
          }
        };

        // ✅ Guardar en caché si es una consulta por defecto
        if (isDefaultQuery) {
          this.driversCache = {
            data: result,
            timestamp: Date.now()
          };
        }

        return result;
      })();

      // ✅ Esperar a que termine la petición
      const result = await this.pendingRequest;
      
      // ✅ Limpiar la petición pendiente
      this.pendingRequest = null;
      
      return result;
      
    } catch (error) {
      // ✅ Limpiar la petición pendiente en caso de error
      this.pendingRequest = null;
      
      // ✅ Manejo mejorado de errores
      console.error('❌ [DriverApiService] Error fetching drivers:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorType: typeof error,
        isAxiosError: error && typeof error === 'object' && 'isAxiosError' in error
      });
      
      // ✅ Re-lanzar un error con mejor información
      if (error instanceof Error) {
        throw error;
      } else if (typeof error === 'string') {
        throw new Error(error);
      } else {
        throw new Error(`Error desconocido al obtener choferes: ${JSON.stringify(error)}`);
      }
    }
  }

  /**
   * Obtener choferes activos
   */
  static async getActiveDrivers(): Promise<Driver[]> {
    try {
      const response = await api.get<ApiResponse<Driver[]>>(
        `${this.BASE_PATH}/active`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching active drivers:', error);
      throw error;
    }
  }

  /**
   * Obtener un chofer por ID
   */
  static async getDriverById(driverId: string): Promise<Driver> {
    try {
      const response = await api.get<ApiResponse<Driver>>(`${this.BASE_PATH}/${driverId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching driver:', error);
      throw error;
    }
  }

  /**
   * Limpiar caché de drivers (útil después de crear, actualizar o eliminar)
   */
  static clearCache(): void {
    this.driversCache = { data: null, timestamp: 0 };
    this.pendingRequest = null;
    console.log('🗑️ [DriverApiService] Caché limpiado');
  }

  /**
   * Crear nuevo chofer
   */
  static async createDriver(driver: Omit<Driver, 'id'>): Promise<Driver> {
    try {
      const response = await api.post<ApiResponse<Driver>>(this.BASE_PATH, driver);
      // ✅ Limpiar caché después de crear
      this.clearCache();
      return response.data.data;
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  }

  /**
   * Actualizar chofer
   */
  static async updateDriver(driverId: string, updates: Partial<Driver>): Promise<Driver> {
    try {
      const response = await api.put<ApiResponse<Driver>>(
        `${this.BASE_PATH}/${driverId}`,
        updates
      );
      // ✅ Limpiar caché después de actualizar
      this.clearCache();
      return response.data.data;
    } catch (error) {
      console.error('Error updating driver:', error);
      throw error;
    }
  }

  /**
   * Eliminar chofer
   */
  static async deleteDriver(driverId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${driverId}`);
      // ✅ Limpiar caché después de eliminar
      this.clearCache();
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw error;
    }
  }

  /**
   * Obtener choferes por tipo de vehículo
   */
  static async getDriversByVehicleType(vehicleType: string): Promise<Driver[]> {
    try {
      const response = await api.get<ApiResponse<Driver[]>>(
        `${this.BASE_PATH}/vehicle-type/${vehicleType}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching drivers by vehicle type:', error);
      throw error;
    }
  }
}

// ==================== MATERIALES ====================

export class MaterialApiService {
  private static readonly BASE_PATH = '/api/inventory/materials';

  /**
   * Obtener todos los materiales (global, sin userId)
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
      const params = {
        limit: filters?.limit || 1000,
        offset: filters?.offset || 0,
        search: filters?.search || '',
        category: filters?.category || '',
        isActive: filters?.active !== undefined ? filters.active.toString() : ''
      };
      
      const response = await api.get<ApiResponse<{ materials: MaterialOption[] }>>(this.BASE_PATH, {
        params
      });
      
      // Manejar diferentes formatos de respuesta
      let materials: MaterialOption[] = [];
      
      if (response.data.data && Array.isArray(response.data.data)) {
        materials = response.data.data;
      } else if (response.data.data && Array.isArray(response.data.data.materials)) {
        materials = response.data.data.materials;
      } else if (response.data && Array.isArray(response.data)) {
        materials = response.data;
      }
      
      return {
        data: materials,
        pagination: {
          total: materials.length,
          limit: params.limit,
          offset: params.offset,
          hasMore: false
        }
      };
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
      const response = await api.post<ApiResponse<{
        needsUpdate: boolean;
        serverConfig?: ModuleConfiguration;
      }>>(
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
    drivers: Driver[];
    configuration: ModuleConfiguration;
  }): Promise<{
    syncedPlatforms: number;
    syncedProviders: number;
    syncedMaterials: number;
    syncedDrivers: number;
    syncedConfiguration: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let syncedPlatforms = 0;
    let syncedProviders = 0;
    let syncedMaterials = 0;
    let syncedDrivers = 0;
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

      // Sincronizar choferes
      for (const driver of localData.drivers) {
        try {
          if (driver.id.startsWith('drv-')) {
            // IDs generados localmente - crear en servidor
            await DriverApiService.createDriver(driver);
          } else {
            // IDs del servidor - actualizar
            await DriverApiService.updateDriver(driver.id, driver);
          }
          syncedDrivers++;
        } catch (error) {
          errors.push(`Error syncing driver ${driver.id}: ${error}`);
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
        syncedDrivers,
        syncedConfiguration,
        errors
      };
    } catch (error) {
      errors.push('Critical sync error: ' + error);
      return {
        syncedPlatforms,
        syncedProviders,
        syncedMaterials,
        syncedDrivers,
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
    } catch {
      return false;
    }
  }
}

export default {
  ProviderApiService,
  PlatformApiService,
  MaterialApiService,
  DriverApiService,
  ConfigurationApiService,
  SyncService
};

