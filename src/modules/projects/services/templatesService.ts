// Servicio de plantillas

import api from '../../../services/api';
import type { 
  ProjectTemplate,
  TemplateMarketplace,
  TemplateReview,
  ApiResponse 
} from '../types';

class TemplatesService {
  private readonly BASE_PATH = '/api/projects/templates';

  /**
   * Obtener lista de plantillas
   * Endpoint: GET /api/projects/templates
   */
  async getTemplates(filters?: {
    category?: string;
    industry?: string;
    search?: string;
    isPublic?: boolean;
    author?: string;
    tags?: string[];
  }): Promise<ProjectTemplate[]> {
    try {
      const response = await api.get<ApiResponse<ProjectTemplate[]>>(
        this.BASE_PATH,
        { params: filters }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Obtener plantilla específica
   * Endpoint: GET /api/projects/templates/:templateId
   */
  async getTemplateById(templateId: string): Promise<ProjectTemplate> {
    try {
      const response = await api.get<ApiResponse<ProjectTemplate>>(
        `${this.BASE_PATH}/${templateId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }

  /**
   * Crear plantilla
   * Endpoint: POST /api/projects/templates
   */
  async createTemplate(
    template: Partial<ProjectTemplate>
  ): Promise<ProjectTemplate> {
    try {
      const response = await api.post<ApiResponse<ProjectTemplate>>(
        this.BASE_PATH,
        template
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Actualizar plantilla
   * Endpoint: PUT /api/projects/templates/:templateId
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<ProjectTemplate>
  ): Promise<ProjectTemplate> {
    try {
      const response = await api.put<ApiResponse<ProjectTemplate>>(
        `${this.BASE_PATH}/${templateId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  /**
   * Eliminar plantilla
   * Endpoint: DELETE /api/projects/templates/:templateId
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${templateId}`);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Obtener marketplace de plantillas
   * Endpoint: GET /api/projects/templates/marketplace
   */
  async getMarketplace(): Promise<TemplateMarketplace> {
    try {
      const response = await api.get<ApiResponse<TemplateMarketplace>>(
        `${this.BASE_PATH}/marketplace`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching marketplace:', error);
      throw error;
    }
  }

  /**
   * Agregar review a plantilla
   * Endpoint: POST /api/projects/templates/:templateId/reviews
   */
  async addReview(
    templateId: string,
    review: Partial<TemplateReview>
  ): Promise<TemplateReview> {
    try {
      const response = await api.post<ApiResponse<TemplateReview>>(
        `${this.BASE_PATH}/${templateId}/reviews`,
        review
      );
      return response.data.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  /**
   * Marcar review como útil
   * Endpoint: POST /api/projects/templates/:templateId/reviews/:reviewId/helpful
   */
  async markReviewHelpful(
    templateId: string,
    reviewId: string,
    helpful: boolean
  ): Promise<void> {
    try {
      await api.post(
        `${this.BASE_PATH}/${templateId}/reviews/${reviewId}/helpful`,
        { helpful }
      );
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
    }
  }

  /**
   * Clonar plantilla pública
   * Endpoint: POST /api/projects/templates/:templateId/clone
   */
  async cloneTemplate(templateId: string): Promise<ProjectTemplate> {
    try {
      const response = await api.post<ApiResponse<ProjectTemplate>>(
        `${this.BASE_PATH}/${templateId}/clone`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error cloning template:', error);
      throw error;
    }
  }
}

export const templatesService = new TemplatesService();
export default templatesService;

