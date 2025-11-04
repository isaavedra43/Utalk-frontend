import { ProviderApiService } from '../../inventory/services/inventoryApiService';
import type { Provider } from '../types';

/**
 * Servicio de proveedores que reutiliza los endpoints del backend
 * ya funcionando en el módulo de inventario
 */
export class ProvidersService {
  /**
   * Obtener todos los proveedores
   */
  static async getAllProviders(): Promise<Provider[]> {
    return ProviderApiService.getAllProviders();
  }

  /**
   * Obtener proveedor por ID
   */
  static async getProviderById(providerId: string): Promise<Provider> {
    return ProviderApiService.getProviderById(providerId);
  }

  /**
   * Crear nuevo proveedor
   */
  static async createProvider(provider: Omit<Provider, 'id'>): Promise<Provider> {
    return ProviderApiService.createProvider(provider);
  }

  /**
   * Actualizar proveedor
   */
  static async updateProvider(providerId: string, updates: Partial<Provider>): Promise<Provider> {
    return ProviderApiService.updateProvider(providerId, updates);
  }

  /**
   * Eliminar proveedor
   */
  static async deleteProvider(providerId: string): Promise<void> {
    return ProviderApiService.deleteProvider(providerId);
  }
}
