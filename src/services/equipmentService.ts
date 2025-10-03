import api from './api';
import { handleApiError } from '../config/api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Equipment {
  id: string;
  employeeId: string;
  name: string;
  category: 'uniform' | 'tools' | 'computer' | 'vehicle' | 'phone' | 'furniture' | 'safety' | 'other';
  brand?: string;
  model?: string;
  serialNumber?: string;
  description: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  currency: string;
  assignedDate: string;
  returnDate?: string;
  status: 'assigned' | 'in_use' | 'maintenance' | 'returned' | 'lost' | 'damaged';
  location?: string;
  invoice: {
    number: string;
    date: string;
    supplier: string;
    amount: number;
    attachments: string[];
  };
  photos: string[];
  responsibilityDocument?: string;
  warranty: {
    hasWarranty: boolean;
    expirationDate?: string;
    provider?: string;
    document?: string;
  };
  insurance: {
    hasInsurance: boolean;
    policyNumber?: string;
    provider?: string;
    expirationDate?: string;
  };
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentReview {
  id: string;
  equipmentId: string;
  employeeId: string;
  reviewDate: string;
  reviewType: 'daily' | 'third_day' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  cleanliness: 'excellent' | 'good' | 'fair' | 'poor';
  functionality: 'excellent' | 'good' | 'fair' | 'poor' | 'not_working';
  damages: Array<{
    type: string;
    description: string;
    severity: 'minor' | 'moderate' | 'severe';
    photos: string[];
  }>;
  maintenanceRequired: boolean;
  maintenanceDescription?: string;
  replacementRequired: boolean;
  reviewedBy: string;
  reviewedByName: string;
  employeeComments?: string;
  photos: string[];
  score: number; // 0-100
  createdAt: string;
}

export interface EquipmentSummary {
  totalEquipment: number;
  totalValue: number;
  assignedEquipment: number;
  inMaintenanceEquipment: number;
  returnedEquipment: number;
  lostEquipment: number;
  damagedEquipment: number;
  byCategory: Record<string, number>;
  byCondition: Record<string, number>;
  byStatus: Record<string, number>;
  averageConditionScore: number;
  maintenanceDue: number;
  warrantyExpiringSoon: number;
  insuranceExpiringSoon: number;
  totalReviews: number;
  lastReview?: EquipmentReview;
  nextScheduledReview?: {
    date: string;
    type: string;
  };
}

export interface CreateEquipmentRequest {
  name: string;
  category: Equipment['category'];
  brand?: string;
  model?: string;
  serialNumber?: string;
  description: string;
  condition: Equipment['condition'];
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  currency?: string;
  assignedDate: string;
  location?: string;
  invoice: {
    number: string;
    date: string;
    supplier: string;
    amount: number;
    attachments?: string[];
  };
  photos?: string[];
  responsibilityDocument?: string;
  warranty?: Equipment['warranty'];
  insurance?: Equipment['insurance'];
  notes?: string;
  tags?: string[];
}

export interface CreateReviewRequest {
  reviewType: EquipmentReview['reviewType'];
  condition: EquipmentReview['condition'];
  cleanliness: EquipmentReview['cleanliness'];
  functionality: EquipmentReview['functionality'];
  damages?: EquipmentReview['damages'];
  maintenanceRequired: boolean;
  maintenanceDescription?: string;
  replacementRequired: boolean;
  employeeComments?: string;
  photos?: string[];
}

// ============================================================================
// EQUIPMENT SERVICE
// ============================================================================

class EquipmentService {
  private handleError(error: unknown, context: string): never {
    const errorMessage = handleApiError(error);
    console.error(`❌ EquipmentService.${context}:`, errorMessage);
    throw new Error(errorMessage);
  }

  /**
   * Obtener todo el equipo de un empleado
   */
  async getEmployeeEquipment(employeeId: string, filters: Record<string, unknown> = {}): Promise<Equipment[]> {
    try {
      console.log('🔍 Obteniendo equipo del empleado:', { employeeId, filters });
      
      const response = await api.get(`/api/employees/${employeeId}/equipment`, { params: filters });
      
      const equipment = response.data.data || response.data;
      console.log(`✅ ${equipment.length} equipos obtenidos`);
      return equipment;
    } catch (error) {
      this.handleError(error, 'getEmployeeEquipment');
    }
  }

  /**
   * Obtener equipo específico
   */
  async getEquipmentById(employeeId: string, equipmentId: string): Promise<Equipment> {
    try {
      console.log('🔍 Obteniendo equipo:', { employeeId, equipmentId });
      
      const response = await api.get(`/api/employees/${employeeId}/equipment/${equipmentId}`);
      
      console.log('✅ Equipo obtenido');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getEquipmentById');
    }
  }

  /**
   * Asignar nuevo equipo
   */
  async assignEquipment(employeeId: string, equipmentData: CreateEquipmentRequest): Promise<Equipment> {
    try {
      console.log('📝 Asignando equipo:', { employeeId, equipmentData });
      
      const response = await api.post(`/api/employees/${employeeId}/equipment`, equipmentData);
      
      console.log('✅ Equipo asignado exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'assignEquipment');
    }
  }

  /**
   * Actualizar equipo
   */
  async updateEquipment(
    employeeId: string,
    equipmentId: string,
    updateData: Partial<CreateEquipmentRequest>
  ): Promise<Equipment> {
    try {
      console.log('📝 Actualizando equipo:', { employeeId, equipmentId, updateData });
      
      const response = await api.put(`/api/employees/${employeeId}/equipment/${equipmentId}`, updateData);
      
      console.log('✅ Equipo actualizado');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'updateEquipment');
    }
  }

  /**
   * Marcar equipo como devuelto
   */
  async returnEquipment(employeeId: string, equipmentId: string, returnData: {
    condition: Equipment['condition'];
    notes?: string;
    photos?: string[];
  }): Promise<Equipment> {
    try {
      console.log('↩️ Devolviendo equipo:', { employeeId, equipmentId });
      
      const response = await api.put(`/api/employees/${employeeId}/equipment/${equipmentId}/return`, returnData);
      
      console.log('✅ Equipo devuelto');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'returnEquipment');
    }
  }

  /**
   * Reportar equipo perdido
   */
  async reportLost(employeeId: string, equipmentId: string, details: {
    lostDate: string;
    description: string;
    policeReportNumber?: string;
  }): Promise<Equipment> {
    try {
      console.log('⚠️ Reportando equipo perdido:', { employeeId, equipmentId });
      
      const response = await api.put(`/api/employees/${employeeId}/equipment/${equipmentId}/report-lost`, details);
      
      console.log('✅ Equipo reportado como perdido');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'reportLost');
    }
  }

  /**
   * Reportar equipo dañado
   */
  async reportDamage(employeeId: string, equipmentId: string, damageData: {
    description: string;
    severity: 'minor' | 'moderate' | 'severe';
    photos?: string[];
    estimatedCost?: number;
  }): Promise<Equipment> {
    try {
      console.log('🔧 Reportando daño en equipo:', { employeeId, equipmentId });
      
      const response = await api.put(`/api/employees/${employeeId}/equipment/${equipmentId}/report-damage`, damageData);
      
      console.log('✅ Daño reportado');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'reportDamage');
    }
  }

  /**
   * Eliminar equipo
   */
  async deleteEquipment(employeeId: string, equipmentId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando equipo:', { employeeId, equipmentId });
      
      await api.delete(`/api/employees/${employeeId}/equipment/${equipmentId}`);
      
      console.log('✅ Equipo eliminado');
    } catch (error) {
      this.handleError(error, 'deleteEquipment');
    }
  }

  /**
   * Crear revisión de equipo
   */
  async createReview(
    employeeId: string,
    equipmentId: string,
    reviewData: CreateReviewRequest
  ): Promise<EquipmentReview> {
    try {
      console.log('📋 Creando revisión:', { employeeId, equipmentId, reviewData });
      
      const response = await api.post(
        `/api/employees/${employeeId}/equipment/${equipmentId}/reviews`,
        reviewData
      );
      
      console.log('✅ Revisión creada');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'createReview');
    }
  }

  /**
   * Obtener revisiones de un equipo
   */
  async getReviews(employeeId: string, equipmentId: string): Promise<EquipmentReview[]> {
    try {
      console.log('🔍 Obteniendo revisiones:', { employeeId, equipmentId });
      
      const response = await api.get(`/api/employees/${employeeId}/equipment/${equipmentId}/reviews`);
      
      const reviews = response.data.data || response.data;
      console.log(`✅ ${reviews.length} revisiones obtenidas`);
      return reviews;
    } catch (error) {
      this.handleError(error, 'getReviews');
    }
  }

  /**
   * Obtener resumen de equipo
   */
  async getSummary(employeeId: string): Promise<EquipmentSummary> {
    try {
      console.log('📊 Obteniendo resumen:', { employeeId });
      
      const response = await api.get(`/api/employees/${employeeId}/equipment/summary`);
      
      console.log('✅ Resumen obtenido');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getSummary');
    }
  }

  /**
   * Subir archivos
   */
  async uploadFiles(files: File[], type: 'invoice' | 'photo' | 'document'): Promise<string[]> {
    try {
      console.log('📎 Subiendo archivos:', files.length, 'tipo:', type);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('type', type);
      
      const response = await api.post('/api/equipment/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const fileIds = response.data.data?.fileIds || response.data.fileIds || [];
      console.log('✅ Archivos subidos:', fileIds);
      return fileIds;
    } catch (error) {
      this.handleError(error, 'uploadFiles');
    }
  }

  /**
   * Exportar equipo
   */
  async exportEquipment(employeeId: string, format: 'excel' | 'pdf' = 'excel'): Promise<Blob> {
    try {
      console.log('📥 Exportando equipo:', { employeeId, format });
      
      const response = await api.get(`/api/employees/${employeeId}/equipment/export`, {
        params: { format },
        responseType: 'blob'
      });
      
      console.log('✅ Equipo exportado');
      return response.data;
    } catch (error) {
      this.handleError(error, 'exportEquipment');
    }
  }

  /**
   * Generar reporte
   */
  async generateReport(
    employeeId: string,
    reportType: 'inventory' | 'maintenance' | 'depreciation' | 'responsibility'
  ): Promise<Blob> {
    try {
      console.log('📄 Generando reporte:', { employeeId, reportType });
      
      const response = await api.get(`/api/employees/${employeeId}/equipment/report/${reportType}`, {
        responseType: 'blob'
      });
      
      console.log('✅ Reporte generado');
      return response.data;
    } catch (error) {
      this.handleError(error, 'generateReport');
    }
  }

  /**
   * Programar revisión
   */
  async scheduleReview(
    employeeId: string,
    equipmentId: string,
    scheduleData: {
      reviewType: EquipmentReview['reviewType'];
      scheduledDate: string;
      notes?: string;
    }
  ): Promise<any> {
    try {
      console.log('📅 Programando revisión:', { employeeId, equipmentId, scheduleData });
      
      const response = await api.post(
        `/api/employees/${employeeId}/equipment/${equipmentId}/schedule-review`,
        scheduleData
      );
      
      console.log('✅ Revisión programada');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'scheduleReview');
    }
  }
}

export const equipmentService = new EquipmentService();
export default equipmentService;

