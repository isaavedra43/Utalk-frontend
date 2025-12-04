// Servicio de calidad e inspecciones

import api from '../../../services/api';
import type { 
  Inspection,
  NonConformity,
  CorrectiveAction,
  QualityStandard,
  Audit,
  QualitySummary,
  ApiResponse 
} from '../types';

class QualityService {
  private readonly BASE_PATH = '/api/projects';

  /**
   * Crear inspección
   * Endpoint: POST /api/projects/:id/inspections
   */
  async createInspection(
    projectId: string,
    inspection: Partial<Inspection>
  ): Promise<Inspection> {
    try {
      const response = await api.post<ApiResponse<Inspection>>(
        `${this.BASE_PATH}/${projectId}/inspections`,
        inspection
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating inspection:', error);
      throw error;
    }
  }

  /**
   * Obtener inspecciones
   * Endpoint: GET /api/projects/:id/inspections
   */
  async getInspections(
    projectId: string,
    filters?: {
      status?: string[];
      type?: string[];
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<Inspection[]> {
    try {
      const response = await api.get<ApiResponse<Inspection[]>>(
        `${this.BASE_PATH}/${projectId}/inspections`,
        { params: filters }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching inspections:', error);
      throw error;
    }
  }

  /**
   * Actualizar inspección
   * Endpoint: PUT /api/projects/:id/inspections/:inspectionId
   */
  async updateInspection(
    projectId: string,
    inspectionId: string,
    updates: Partial<Inspection>
  ): Promise<Inspection> {
    try {
      const response = await api.put<ApiResponse<Inspection>>(
        `${this.BASE_PATH}/${projectId}/inspections/${inspectionId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating inspection:', error);
      throw error;
    }
  }

  /**
   * Completar inspección
   * Endpoint: POST /api/projects/:id/inspections/:inspectionId/complete
   */
  async completeInspection(
    projectId: string,
    inspectionId: string,
    results: {
      overallResult: 'passed' | 'failed' | 'conditional';
      items: any[];
      findings: any[];
      photos?: string[];
      signature?: string;
    }
  ): Promise<Inspection> {
    try {
      const response = await api.post<ApiResponse<Inspection>>(
        `${this.BASE_PATH}/${projectId}/inspections/${inspectionId}/complete`,
        results
      );
      return response.data.data;
    } catch (error) {
      console.error('Error completing inspection:', error);
      throw error;
    }
  }

  /**
   * Reportar no conformidad
   * Endpoint: POST /api/projects/:id/quality/issues
   */
  async createNonConformity(
    projectId: string,
    nonConformity: Partial<NonConformity>
  ): Promise<NonConformity> {
    try {
      const response = await api.post<ApiResponse<NonConformity>>(
        `${this.BASE_PATH}/${projectId}/quality/issues`,
        nonConformity
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating non-conformity:', error);
      throw error;
    }
  }

  /**
   * Obtener no conformidades
   * Endpoint: GET /api/projects/:id/quality/issues
   */
  async getNonConformities(
    projectId: string,
    filters?: {
      status?: string[];
      severity?: string[];
    }
  ): Promise<NonConformity[]> {
    try {
      const response = await api.get<ApiResponse<NonConformity[]>>(
        `${this.BASE_PATH}/${projectId}/quality/issues`,
        { params: filters }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching non-conformities:', error);
      throw error;
    }
  }

  /**
   * Crear acción correctiva
   * Endpoint: POST /api/projects/:id/quality/corrective-actions
   */
  async createCorrectiveAction(
    projectId: string,
    action: Partial<CorrectiveAction>
  ): Promise<CorrectiveAction> {
    try {
      const response = await api.post<ApiResponse<CorrectiveAction>>(
        `${this.BASE_PATH}/${projectId}/quality/corrective-actions`,
        action
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating corrective action:', error);
      throw error;
    }
  }

  /**
   * Crear estándar de calidad
   * Endpoint: POST /api/projects/:id/quality/standards
   */
  async createQualityStandard(
    projectId: string,
    standard: Partial<QualityStandard>
  ): Promise<QualityStandard> {
    try {
      const response = await api.post<ApiResponse<QualityStandard>>(
        `${this.BASE_PATH}/${projectId}/quality/standards`,
        standard
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating quality standard:', error);
      throw error;
    }
  }

  /**
   * Crear auditoría
   * Endpoint: POST /api/projects/:id/quality/audits
   */
  async createAudit(
    projectId: string,
    audit: Partial<Audit>
  ): Promise<Audit> {
    try {
      const response = await api.post<ApiResponse<Audit>>(
        `${this.BASE_PATH}/${projectId}/quality/audits`,
        audit
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating audit:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de calidad
   * Endpoint: GET /api/projects/:id/quality/summary
   */
  async getQualitySummary(projectId: string): Promise<QualitySummary> {
    try {
      const response = await api.get<ApiResponse<QualitySummary>>(
        `${this.BASE_PATH}/${projectId}/quality/summary`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching quality summary:', error);
      throw error;
    }
  }

  /**
   * Subir foto de inspección
   * Endpoint: POST /api/projects/:id/inspections/:inspectionId/photos
   */
  async uploadInspectionPhoto(
    projectId: string,
    inspectionId: string,
    file: File,
    metadata?: {
      caption?: string;
      itemId?: string;
      location?: string;
    }
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await api.post<ApiResponse<any>>(
        `${this.BASE_PATH}/${projectId}/inspections/${inspectionId}/photos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error uploading inspection photo:', error);
      throw error;
    }
  }
}

export const qualityService = new QualityService();
export default qualityService;

