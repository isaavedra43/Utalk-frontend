// Servicio de integraciones con otros módulos

import api from '../../../services/api';
import type { 
  IntegrationSettings,
  IntegrationSync,
  SharedData,
  ApiResponse 
} from '../types';

class IntegrationService {
  private readonly BASE_PATH = '/api/projects';

  // ==================== INTEGRACIÓN HR ====================

  /**
   * Obtener empleados disponibles para asignar
   * Endpoint: GET /api/projects/:id/integrations/hr/employees
   */
  async getAvailableEmployees(
    projectId: string,
    filters?: {
      department?: string;
      skills?: string[];
      availability?: boolean;
    }
  ): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `${this.BASE_PATH}/${projectId}/integrations/hr/employees`,
        { params: filters }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching available employees:', error);
      throw error;
    }
  }

  /**
   * Asignar empleado del módulo HR al proyecto
   * Endpoint: POST /api/projects/:id/integrations/hr/assign
   */
  async assignEmployeeFromHR(
    projectId: string,
    employeeData: {
      employeeId: string;
      role: string;
      allocation: number;
      startDate: Date;
    }
  ): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.BASE_PATH}/${projectId}/integrations/hr/assign`,
        employeeData
      );
      return response.data.data;
    } catch (error) {
      console.error('Error assigning employee from HR:', error);
      throw error;
    }
  }

  /**
   * Sincronizar horas trabajadas con nómina
   * Endpoint: POST /api/projects/:id/integrations/hr/sync-time
   */
  async syncTimeWithPayroll(
    projectId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<IntegrationSync> {
    try {
      const response = await api.post<ApiResponse<IntegrationSync>>(
        `${this.BASE_PATH}/${projectId}/integrations/hr/sync-time`,
        { periodStart, periodEnd }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error syncing time with payroll:', error);
      throw error;
    }
  }

  // ==================== INTEGRACIÓN INVENTARIO ====================

  /**
   * Obtener materiales disponibles en inventario
   * Endpoint: GET /api/projects/:id/integrations/inventory/materials
   */
  async getInventoryMaterials(
    projectId: string,
    filters?: {
      category?: string;
      minStock?: number;
    }
  ): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `${this.BASE_PATH}/${projectId}/integrations/inventory/materials`,
        { params: filters }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching inventory materials:', error);
      throw error;
    }
  }

  /**
   * Reservar material del inventario
   * Endpoint: POST /api/projects/:id/integrations/inventory/reserve
   */
  async reserveMaterial(
    projectId: string,
    materialData: {
      materialId: string;
      quantity: number;
      taskId?: string;
      requiredDate?: Date;
    }
  ): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.BASE_PATH}/${projectId}/integrations/inventory/reserve`,
        materialData
      );
      return response.data.data;
    } catch (error) {
      console.error('Error reserving material:', error);
      throw error;
    }
  }

  /**
   * Transferir material al proyecto
   * Endpoint: POST /api/projects/:id/integrations/inventory/transfer
   */
  async transferMaterial(
    projectId: string,
    transferData: {
      materialId: string;
      quantity: number;
      fromLocation: string;
      toLocation: string;
    }
  ): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.BASE_PATH}/${projectId}/integrations/inventory/transfer`,
        transferData
      );
      return response.data.data;
    } catch (error) {
      console.error('Error transferring material:', error);
      throw error;
    }
  }

  // ==================== INTEGRACIÓN PROVEEDORES ====================

  /**
   * Obtener cotizaciones de proveedores
   * Endpoint: GET /api/projects/:id/integrations/providers/quotes
   */
  async getProviderQuotes(
    projectId: string,
    materialId?: string
  ): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `${this.BASE_PATH}/${projectId}/integrations/providers/quotes`,
        { params: { materialId } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching provider quotes:', error);
      throw error;
    }
  }

  /**
   * Crear orden de compra en módulo de proveedores
   * Endpoint: POST /api/projects/:id/integrations/providers/purchase-order
   */
  async createPOInProviders(
    projectId: string,
    poData: any
  ): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.BASE_PATH}/${projectId}/integrations/providers/purchase-order`,
        poData
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating PO in providers:', error);
      throw error;
    }
  }

  // ==================== INTEGRACIÓN CLIENTES ====================

  /**
   * Crear factura para cliente
   * Endpoint: POST /api/projects/:id/integrations/clients/invoices
   */
  async createClientInvoice(
    projectId: string,
    invoiceData: any
  ): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.BASE_PATH}/${projectId}/integrations/clients/invoices`,
        invoiceData
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating client invoice:', error);
      throw error;
    }
  }

  /**
   * Obtener acceso al portal del cliente
   * Endpoint: GET /api/projects/:id/integrations/clients/portal
   */
  async getClientPortalAccess(projectId: string): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `${this.BASE_PATH}/${projectId}/integrations/clients/portal`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error getting client portal access:', error);
      throw error;
    }
  }

  // ==================== CONFIGURACIÓN ====================

  /**
   * Obtener configuración de integraciones
   * Endpoint: GET /api/projects/:id/integrations/settings
   */
  async getSettings(projectId: string): Promise<IntegrationSettings> {
    try {
      const response = await api.get<ApiResponse<IntegrationSettings>>(
        `${this.BASE_PATH}/${projectId}/integrations/settings`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching integration settings:', error);
      throw error;
    }
  }

  /**
   * Actualizar configuración de integraciones
   * Endpoint: PUT /api/projects/:id/integrations/settings
   */
  async updateSettings(
    projectId: string,
    settings: Partial<IntegrationSettings>
  ): Promise<IntegrationSettings> {
    try {
      const response = await api.put<ApiResponse<IntegrationSettings>>(
        `${this.BASE_PATH}/${projectId}/integrations/settings`,
        settings
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating integration settings:', error);
      throw error;
    }
  }

  /**
   * Sincronizar manualmente un módulo
   * Endpoint: POST /api/projects/:id/integrations/sync
   */
  async syncModule(
    projectId: string,
    moduleType: 'hr' | 'inventory' | 'providers' | 'clients'
  ): Promise<IntegrationSync> {
    try {
      const response = await api.post<ApiResponse<IntegrationSync>>(
        `${this.BASE_PATH}/${projectId}/integrations/sync`,
        { moduleType }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error syncing module:', error);
      throw error;
    }
  }

  /**
   * Obtener datos compartidos de todos los módulos
   * Endpoint: GET /api/projects/:id/integrations/shared-data
   */
  async getSharedData(projectId: string): Promise<SharedData> {
    try {
      const response = await api.get<ApiResponse<SharedData>>(
        `${this.BASE_PATH}/${projectId}/integrations/shared-data`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching shared data:', error);
      throw error;
    }
  }
}

export const integrationService = new IntegrationService();
export default integrationService;

