import { api } from '../../../services/api';
import { ProviderApiService } from '../../inventory/services/inventoryApiService';
import type { 
  Provider, 
  ProviderMaterial, 
  PurchaseOrder, 
  Payment, 
  ProviderActivity, 
  ProviderDocument, 
  ProviderRating,
  AccountStatement,
  ProviderStatistics
} from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Servicio completo de proveedores que integra con el backend
 */
export class ProvidersService {
  private static readonly BASE_PATH = '/api/inventory/providers';

  // ==================== PROVEEDORES BÁSICOS ====================
  
  static async getAllProviders(): Promise<Provider[]> {
    return ProviderApiService.getAllProviders();
  }

  static async getProviderById(providerId: string): Promise<Provider> {
    return ProviderApiService.getProviderById(providerId);
  }

  static async createProvider(provider: Omit<Provider, 'id'>): Promise<Provider> {
    return ProviderApiService.createProvider(provider);
  }

  static async updateProvider(providerId: string, updates: Partial<Provider>): Promise<Provider> {
    return ProviderApiService.updateProvider(providerId, updates);
  }

  static async deleteProvider(providerId: string): Promise<void> {
    return ProviderApiService.deleteProvider(providerId);
  }

  // ==================== MATERIALES ====================

  static async getProviderMaterials(providerId: string): Promise<ProviderMaterial[]> {
    try {
      const response = await api.get<ApiResponse<ProviderMaterial[]>>(
        `${this.BASE_PATH}/${providerId}/materials`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching provider materials:', error);
      throw error;
    }
  }

  static async createMaterial(
    providerId: string, 
    material: Omit<ProviderMaterial, 'id' | 'providerId' | 'createdAt' | 'updatedAt'>
  ): Promise<ProviderMaterial> {
    try {
      const response = await api.post<ApiResponse<ProviderMaterial>>(
        `${this.BASE_PATH}/${providerId}/materials`,
        material
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  }

  static async updateMaterial(
    providerId: string,
    materialId: string,
    updates: Partial<ProviderMaterial>
  ): Promise<ProviderMaterial> {
    try {
      const response = await api.put<ApiResponse<ProviderMaterial>>(
        `${this.BASE_PATH}/${providerId}/materials/${materialId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  }

  static async deleteMaterial(providerId: string, materialId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${providerId}/materials/${materialId}`);
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }

  // ==================== ÓRDENES DE COMPRA ====================

  static async getPurchaseOrders(providerId: string): Promise<PurchaseOrder[]> {
    try {
      const response = await api.get<ApiResponse<{ orders: PurchaseOrder[]; total: number }>>(
        `${this.BASE_PATH}/${providerId}/purchase-orders`
      );
      return response.data.data.orders || response.data.data || [];
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  }

  static async getPurchaseOrderById(providerId: string, orderId: string): Promise<PurchaseOrder> {
    try {
      const response = await api.get<ApiResponse<PurchaseOrder>>(
        `${this.BASE_PATH}/${providerId}/purchase-orders/${orderId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      throw error;
    }
  }

  static async createPurchaseOrder(
    providerId: string,
    order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'createdBy' | 'createdByName' | 'providerName'>
  ): Promise<PurchaseOrder> {
    try {
      const response = await api.post<ApiResponse<PurchaseOrder>>(
        `${this.BASE_PATH}/${providerId}/purchase-orders`,
        order
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  }

  static async updatePurchaseOrder(
    providerId: string,
    orderId: string,
    updates: Partial<PurchaseOrder>
  ): Promise<PurchaseOrder> {
    try {
      const response = await api.put<ApiResponse<PurchaseOrder>>(
        `${this.BASE_PATH}/${providerId}/purchase-orders/${orderId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating purchase order:', error);
      throw error;
    }
  }

  static async deletePurchaseOrder(providerId: string, orderId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${providerId}/purchase-orders/${orderId}`);
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      throw error;
    }
  }

  static async updatePurchaseOrderStatus(
    providerId: string,
    orderId: string,
    status: PurchaseOrder['status'],
    options?: {
      acceptedDeliveryDate?: string;
      reason?: string;
    }
  ): Promise<PurchaseOrder> {
    try {
      const response = await api.put<ApiResponse<PurchaseOrder>>(
        `${this.BASE_PATH}/${providerId}/purchase-orders/${orderId}/status`,
        {
          status,
          ...options
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating purchase order status:', error);
      throw error;
    }
  }

  static async sendPurchaseOrderEmail(
    providerId: string,
    orderId: string,
    options?: {
      to?: string;
      subject?: string;
      message?: string;
    }
  ): Promise<{ sentTo: string; sentAt: string }> {
    try {
      const response = await api.post<ApiResponse<{ sentTo: string; sentAt: string }>>(
        `${this.BASE_PATH}/${providerId}/purchase-orders/${orderId}/send-email`,
        options || {}
      );
      return response.data.data;
    } catch (error) {
      console.error('Error sending purchase order email:', error);
      throw error;
    }
  }

  // ==================== PAGOS ====================

  static async getPayments(providerId: string): Promise<Payment[]> {
    try {
      const response = await api.get<ApiResponse<{ payments: Payment[]; total: number }>>(
        `${this.BASE_PATH}/${providerId}/payments`
      );
      return response.data.data.payments || response.data.data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  static async getPaymentById(providerId: string, paymentId: string): Promise<Payment> {
    try {
      const response = await api.get<ApiResponse<Payment>>(
        `${this.BASE_PATH}/${providerId}/payments/${paymentId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  static async createPayment(
    providerId: string,
    payment: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt' | 'createdBy' | 'createdByName' | 'providerName'>
  ): Promise<Payment> {
    try {
      const response = await api.post<ApiResponse<Payment>>(
        `${this.BASE_PATH}/${providerId}/payments`,
        payment
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  static async updatePayment(
    providerId: string,
    paymentId: string,
    updates: Partial<Payment>
  ): Promise<Payment> {
    try {
      const response = await api.put<ApiResponse<Payment>>(
        `${this.BASE_PATH}/${providerId}/payments/${paymentId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  static async deletePayment(providerId: string, paymentId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${providerId}/payments/${paymentId}`);
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  // ==================== DOCUMENTOS ====================

  static async getDocuments(providerId: string): Promise<ProviderDocument[]> {
    try {
      const response = await api.get<ApiResponse<{ documents: ProviderDocument[]; total: number }>>(
        `${this.BASE_PATH}/${providerId}/documents`
      );
      return response.data.data.documents || response.data.data || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  static async createDocument(
    providerId: string,
    document: Omit<ProviderDocument, 'id' | 'providerId' | 'uploadedAt' | 'uploadedBy' | 'uploadedByName'>
  ): Promise<ProviderDocument> {
    try {
      const response = await api.post<ApiResponse<ProviderDocument>>(
        `${this.BASE_PATH}/${providerId}/documents`,
        document
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  static async deleteDocument(providerId: string, documentId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${providerId}/documents/${documentId}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // ==================== ACTIVIDADES ====================

  static async getActivities(
    providerId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<{ activities: ProviderActivity[]; total: number }> {
    try {
      const response = await api.get<ApiResponse<{ activities: ProviderActivity[]; total: number }>>(
        `${this.BASE_PATH}/${providerId}/activities`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  // ==================== ESTADO DE CUENTA ====================

  static async getAccountStatement(
    providerId: string,
    options?: {
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<AccountStatement> {
    try {
      const response = await api.get<ApiResponse<AccountStatement>>(
        `${this.BASE_PATH}/${providerId}/account-statement`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching account statement:', error);
      throw error;
    }
  }

  // ==================== ESTADÍSTICAS ====================

  static async getStatistics(
    providerId: string,
    period?: 'week' | 'month' | 'quarter' | 'year' | 'all'
  ): Promise<ProviderStatistics> {
    try {
      const response = await api.get<ApiResponse<ProviderStatistics>>(
        `${this.BASE_PATH}/${providerId}/statistics`,
        { params: { period: period || 'all' } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  // ==================== ALERTAS ====================

  static async getAlerts(providerId: string): Promise<Array<{
    id: string;
    type: string;
    severity: 'info' | 'warning' | 'error';
    title: string;
    description: string;
    relatedId?: string;
    actionUrl?: string;
    createdAt: string;
  }>> {
    try {
      const response = await api.get<ApiResponse<{ alerts: any[] }>>(
        `${this.BASE_PATH}/${providerId}/alerts`
      );
      return response.data.data.alerts || [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  // ==================== CALIFICACIÓN ====================

  static async getRating(providerId: string): Promise<ProviderRating | null> {
    try {
      const response = await api.get<ApiResponse<ProviderRating | null>>(
        `${this.BASE_PATH}/${providerId}/rating`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching rating:', error);
      throw error;
    }
  }

  static async updateRating(
    providerId: string,
    rating: { rating: number; comments?: string }
  ): Promise<ProviderRating> {
    try {
      const response = await api.put<ApiResponse<ProviderRating>>(
        `${this.BASE_PATH}/${providerId}/rating`,
        rating
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating rating:', error);
      throw error;
    }
  }
}
