// Servicio de materiales e inventario

import api from '../../../services/api';
import type { 
  ProjectMaterial,
  MaterialRequest,
  PurchaseOrder,
  Delivery,
  WasteTracking,
  MaterialsSummary,
  ApiResponse 
} from '../types';

class MaterialsService {
  private readonly BASE_PATH = '/api/projects';

  /**
   * Obtener materiales del proyecto
   * Endpoint: GET /api/projects/:id/materials
   */
  async getMaterials(projectId: string, filters?: any): Promise<ProjectMaterial[]> {
    try {
      const response = await api.get<ApiResponse<ProjectMaterial[]>>(
        `${this.BASE_PATH}/${projectId}/materials`,
        { params: filters }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  }

  /**
   * Agregar material al proyecto
   * Endpoint: POST /api/projects/:id/materials
   */
  async addMaterial(
    projectId: string,
    material: Partial<ProjectMaterial>
  ): Promise<ProjectMaterial> {
    try {
      const response = await api.post<ApiResponse<ProjectMaterial>>(
        `${this.BASE_PATH}/${projectId}/materials`,
        material
      );
      return response.data.data;
    } catch (error) {
      console.error('Error adding material:', error);
      throw error;
    }
  }

  /**
   * Actualizar material
   * Endpoint: PUT /api/projects/:id/materials/:materialId
   */
  async updateMaterial(
    projectId: string,
    materialId: string,
    updates: Partial<ProjectMaterial>
  ): Promise<ProjectMaterial> {
    try {
      const response = await api.put<ApiResponse<ProjectMaterial>>(
        `${this.BASE_PATH}/${projectId}/materials/${materialId}`,
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
   * Endpoint: DELETE /api/projects/:id/materials/:materialId
   */
  async deleteMaterial(projectId: string, materialId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${projectId}/materials/${materialId}`);
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }

  /**
   * Crear solicitud de material
   * Endpoint: POST /api/projects/:id/materials/request
   */
  async createMaterialRequest(
    projectId: string,
    request: Partial<MaterialRequest>
  ): Promise<MaterialRequest> {
    try {
      const response = await api.post<ApiResponse<MaterialRequest>>(
        `${this.BASE_PATH}/${projectId}/materials/request`,
        request
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating material request:', error);
      throw error;
    }
  }

  /**
   * Obtener solicitudes de material
   * Endpoint: GET /api/projects/:id/materials/requests
   */
  async getMaterialRequests(
    projectId: string,
    filters?: {
      status?: string[];
      urgency?: string[];
    }
  ): Promise<MaterialRequest[]> {
    try {
      const response = await api.get<ApiResponse<MaterialRequest[]>>(
        `${this.BASE_PATH}/${projectId}/materials/requests`,
        { params: filters }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching material requests:', error);
      throw error;
    }
  }

  /**
   * Aprobar solicitud de material
   * Endpoint: POST /api/projects/:id/materials/requests/:requestId/approve
   */
  async approveMaterialRequest(
    projectId: string,
    requestId: string,
    approvedCost?: number
  ): Promise<MaterialRequest> {
    try {
      const response = await api.post<ApiResponse<MaterialRequest>>(
        `${this.BASE_PATH}/${projectId}/materials/requests/${requestId}/approve`,
        { approvedCost }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error approving material request:', error);
      throw error;
    }
  }

  /**
   * Crear orden de compra
   * Endpoint: POST /api/projects/:id/purchase-orders
   */
  async createPurchaseOrder(
    projectId: string,
    purchaseOrder: Partial<PurchaseOrder>
  ): Promise<PurchaseOrder> {
    try {
      const response = await api.post<ApiResponse<PurchaseOrder>>(
        `${this.BASE_PATH}/${projectId}/purchase-orders`,
        purchaseOrder
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  }

  /**
   * Obtener órdenes de compra
   * Endpoint: GET /api/projects/:id/purchase-orders
   */
  async getPurchaseOrders(
    projectId: string,
    filters?: { status?: string[] }
  ): Promise<PurchaseOrder[]> {
    try {
      const response = await api.get<ApiResponse<PurchaseOrder[]>>(
        `${this.BASE_PATH}/${projectId}/purchase-orders`,
        { params: filters }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  }

  /**
   * Obtener entregas
   * Endpoint: GET /api/projects/:id/deliveries
   */
  async getDeliveries(
    projectId: string,
    filters?: { status?: string[] }
  ): Promise<Delivery[]> {
    try {
      const response = await api.get<ApiResponse<Delivery[]>>(
        `${this.BASE_PATH}/${projectId}/deliveries`,
        { params: filters }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      throw error;
    }
  }

  /**
   * Registrar recepción de entrega
   * Endpoint: POST /api/projects/:id/deliveries/:deliveryId/receive
   */
  async receiveDelivery(
    projectId: string,
    deliveryId: string,
    receiptData: {
      items: {
        materialId: string;
        deliveredQuantity: number;
        acceptedQuantity: number;
        rejectedQuantity: number;
        notes?: string;
      }[];
      inspectionNotes?: string;
      photos?: string[];
    }
  ): Promise<Delivery> {
    try {
      const response = await api.post<ApiResponse<Delivery>>(
        `${this.BASE_PATH}/${projectId}/deliveries/${deliveryId}/receive`,
        receiptData
      );
      return response.data.data;
    } catch (error) {
      console.error('Error receiving delivery:', error);
      throw error;
    }
  }

  /**
   * Obtener inventario actual del proyecto
   * Endpoint: GET /api/projects/:id/materials/inventory
   */
  async getInventory(projectId: string): Promise<MaterialsSummary> {
    try {
      const response = await api.get<ApiResponse<MaterialsSummary>>(
        `${this.BASE_PATH}/${projectId}/materials/inventory`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  }

  /**
   * Registrar desperdicio de material
   * Endpoint: POST /api/projects/:id/materials/waste
   */
  async trackWaste(
    projectId: string,
    waste: Partial<WasteTracking>
  ): Promise<WasteTracking> {
    try {
      const response = await api.post<ApiResponse<WasteTracking>>(
        `${this.BASE_PATH}/${projectId}/materials/waste`,
        waste
      );
      return response.data.data;
    } catch (error) {
      console.error('Error tracking waste:', error);
      throw error;
    }
  }

  /**
   * Reservar material del inventario global
   * Endpoint: POST /api/projects/:id/materials/:materialId/reserve
   */
  async reserveFromInventory(
    projectId: string,
    materialId: string,
    quantity: number
  ): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.BASE_PATH}/${projectId}/materials/${materialId}/reserve`,
        { quantity }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error reserving material:', error);
      throw error;
    }
  }
}

export const materialsService = new MaterialsService();
export default materialsService;

