// Servicio de gestión de riesgos

import api from '../../../services/api';
import type { 
  ProjectRisk,
  RiskMatrix,
  RiskAnalysis,
  RiskReport,
  ApiResponse 
} from '../types';

class RisksService {
  private readonly BASE_PATH = '/api/projects';

  /**
   * Crear riesgo
   * Endpoint: POST /api/projects/:id/risks
   */
  async createRisk(
    projectId: string,
    risk: Partial<ProjectRisk>
  ): Promise<ProjectRisk> {
    try {
      const response = await api.post<ApiResponse<ProjectRisk>>(
        `${this.BASE_PATH}/${projectId}/risks`,
        risk
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating risk:', error);
      throw error;
    }
  }

  /**
   * Obtener riesgos del proyecto
   * Endpoint: GET /api/projects/:id/risks
   */
  async getRisks(
    projectId: string,
    filters?: {
      status?: string[];
      category?: string[];
      minScore?: number;
    }
  ): Promise<ProjectRisk[]> {
    try {
      const response = await api.get<ApiResponse<ProjectRisk[]>>(
        `${this.BASE_PATH}/${projectId}/risks`,
        { params: filters }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching risks:', error);
      throw error;
    }
  }

  /**
   * Actualizar riesgo
   * Endpoint: PUT /api/projects/:id/risks/:riskId
   */
  async updateRisk(
    projectId: string,
    riskId: string,
    updates: Partial<ProjectRisk>
  ): Promise<ProjectRisk> {
    try {
      const response = await api.put<ApiResponse<ProjectRisk>>(
        `${this.BASE_PATH}/${projectId}/risks/${riskId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating risk:', error);
      throw error;
    }
  }

  /**
   * Eliminar riesgo
   * Endpoint: DELETE /api/projects/:id/risks/:riskId
   */
  async deleteRisk(projectId: string, riskId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${projectId}/risks/${riskId}`);
    } catch (error) {
      console.error('Error deleting risk:', error);
      throw error;
    }
  }

  /**
   * Agregar plan de respuesta al riesgo
   * Endpoint: POST /api/projects/:id/risks/:riskId/response
   */
  async addResponsePlan(
    projectId: string,
    riskId: string,
    responsePlan: {
      response: string;
      mitigationPlan: string;
      contingencyPlan?: string;
      actions: any[];
    }
  ): Promise<ProjectRisk> {
    try {
      const response = await api.post<ApiResponse<ProjectRisk>>(
        `${this.BASE_PATH}/${projectId}/risks/${riskId}/response`,
        responsePlan
      );
      return response.data.data;
    } catch (error) {
      console.error('Error adding response plan:', error);
      throw error;
    }
  }

  /**
   * Obtener matriz de riesgos
   * Endpoint: GET /api/projects/:id/risks/matrix
   */
  async getRiskMatrix(projectId: string): Promise<RiskMatrix> {
    try {
      const response = await api.get<ApiResponse<RiskMatrix>>(
        `${this.BASE_PATH}/${projectId}/risks/matrix`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching risk matrix:', error);
      throw error;
    }
  }

  /**
   * Obtener análisis de riesgos
   * Endpoint: GET /api/projects/:id/risks/analysis
   */
  async getRiskAnalysis(projectId: string): Promise<RiskAnalysis> {
    try {
      const response = await api.get<ApiResponse<RiskAnalysis>>(
        `${this.BASE_PATH}/${projectId}/risks/analysis`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching risk analysis:', error);
      throw error;
    }
  }

  /**
   * Generar reporte de riesgos
   * Endpoint: GET /api/projects/:id/risks/report
   */
  async generateRiskReport(
    projectId: string,
    options?: {
      includeClosedRisks?: boolean;
      period?: { start: Date; end: Date };
    }
  ): Promise<RiskReport> {
    try {
      const response = await api.get<ApiResponse<RiskReport>>(
        `${this.BASE_PATH}/${projectId}/risks/report`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error generating risk report:', error);
      throw error;
    }
  }

  /**
   * Marcar riesgo como ocurrido
   * Endpoint: POST /api/projects/:id/risks/:riskId/occurred
   */
  async markAsOccurred(
    projectId: string,
    riskId: string,
    occurrence: {
      occurredAt: Date;
      actualImpact: any;
      description: string;
    }
  ): Promise<ProjectRisk> {
    try {
      const response = await api.post<ApiResponse<ProjectRisk>>(
        `${this.BASE_PATH}/${projectId}/risks/${riskId}/occurred`,
        occurrence
      );
      return response.data.data;
    } catch (error) {
      console.error('Error marking risk as occurred:', error);
      throw error;
    }
  }
}

export const risksService = new RisksService();
export default risksService;

