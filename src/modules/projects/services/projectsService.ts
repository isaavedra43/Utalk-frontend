// Servicio de proyectos - CRUD y operaciones principales

import api from '../../../services/api';
import type { 
  Project, 
  ProjectFilters, 
  ProjectListResponse, 
  ProjectStats,
  ProjectActivity,
  ApiResponse 
} from '../types';

class ProjectsService {
  private readonly BASE_PATH = '/api/projects';

  /**
   * Obtener lista de proyectos con filtros
   * Endpoint: GET /api/projects
   */
  async getProjects(params: {
    page?: number;
    limit?: number;
    filters?: ProjectFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ProjectListResponse> {
    try {
      const response = await api.get<ApiResponse<ProjectListResponse>>(
        this.BASE_PATH,
        { params }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Obtener un proyecto por ID
   * Endpoint: GET /api/projects/:id
   */
  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await api.get<ApiResponse<Project>>(
        `${this.BASE_PATH}/${id}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo proyecto
   * Endpoint: POST /api/projects
   */
  async createProject(project: Partial<Project>): Promise<Project> {
    try {
      const response = await api.post<ApiResponse<Project>>(
        this.BASE_PATH,
        project
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Actualizar proyecto
   * Endpoint: PUT /api/projects/:id
   */
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    try {
      const response = await api.put<ApiResponse<Project>>(
        `${this.BASE_PATH}/${id}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Eliminar proyecto
   * Endpoint: DELETE /api/projects/:id
   */
  async deleteProject(id: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Duplicar proyecto
   * Endpoint: POST /api/projects/:id/duplicate
   */
  async duplicateProject(id: string, options?: {
    includeTasks?: boolean;
    includeTeam?: boolean;
    includeBudget?: boolean;
    includeDocuments?: boolean;
    newName?: string;
  }): Promise<Project> {
    try {
      const response = await api.post<ApiResponse<Project>>(
        `${this.BASE_PATH}/${id}/duplicate`,
        options
      );
      return response.data.data;
    } catch (error) {
      console.error('Error duplicating project:', error);
      throw error;
    }
  }

  /**
   * Archivar/Desarchivar proyecto
   * Endpoint: POST /api/projects/:id/archive
   */
  async archiveProject(id: string, archive: boolean = true, reason?: string): Promise<Project> {
    try {
      const response = await api.post<ApiResponse<Project>>(
        `${this.BASE_PATH}/${id}/archive`,
        { archive, reason }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error archiving project:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas del proyecto
   * Endpoint: GET /api/projects/:id/stats
   */
  async getProjectStats(id: string): Promise<ProjectStats> {
    try {
      const response = await api.get<ApiResponse<ProjectStats>>(
        `${this.BASE_PATH}/${id}/stats`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching project stats:', error);
      throw error;
    }
  }

  /**
   * Obtener actividad del proyecto
   * Endpoint: GET /api/projects/:id/activity
   */
  async getProjectActivity(
    id: string,
    options?: {
      limit?: number;
      offset?: number;
      types?: string[];
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<ProjectActivity[]> {
    try {
      const response = await api.get<ApiResponse<ProjectActivity[]>>(
        `${this.BASE_PATH}/${id}/activity`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching project activity:', error);
      throw error;
    }
  }

  /**
   * Marcar proyecto como favorito
   * Endpoint: POST /api/projects/:id/favorite
   */
  async toggleFavorite(id: string, favorite: boolean): Promise<Project> {
    try {
      const response = await api.post<ApiResponse<Project>>(
        `${this.BASE_PATH}/${id}/favorite`,
        { favorite }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Actualizar configuración del proyecto
   * Endpoint: PUT /api/projects/:id/settings
   */
  async updateSettings(id: string, settings: any): Promise<any> {
    try {
      const response = await api.put<ApiResponse<any>>(
        `${this.BASE_PATH}/${id}/settings`,
        settings
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  /**
   * Crear proyecto desde plantilla
   * Endpoint: POST /api/projects/from-template/:templateId
   */
  async createFromTemplate(
    templateId: string,
    customization?: {
      name?: string;
      startDate?: Date;
      budget?: number;
      owner?: string;
      customFields?: any;
    }
  ): Promise<Project> {
    try {
      const response = await api.post<ApiResponse<Project>>(
        `${this.BASE_PATH}/from-template/${templateId}`,
        customization
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating project from template:', error);
      throw error;
    }
  }

  /**
   * Guardar proyecto como plantilla
   * Endpoint: POST /api/projects/:id/save-as-template
   */
  async saveAsTemplate(
    id: string,
    templateData: {
      name: string;
      description?: string;
      category?: string;
      industry?: string;
      isPublic?: boolean;
    }
  ): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.BASE_PATH}/${id}/save-as-template`,
        templateData
      );
      return response.data.data;
    } catch (error) {
      console.error('Error saving as template:', error);
      throw error;
    }
  }

  /**
   * Exportar proyecto
   * Endpoint: GET /api/projects/:id/export/:format
   */
  async exportProject(
    id: string,
    format: 'pdf' | 'excel' | 'json' | 'mpp' | 'zip',
    options?: any
  ): Promise<Blob> {
    try {
      const response = await api.get(
        `${this.BASE_PATH}/${id}/export/${format}`,
        { 
          params: options,
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting project:', error);
      throw error;
    }
  }

  /**
   * Importar proyecto
   * Endpoint: POST /api/projects/import
   */
  async importProject(
    file: File,
    format: 'excel' | 'json' | 'mpp',
    options?: any
  ): Promise<Project> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);
      if (options) {
        formData.append('options', JSON.stringify(options));
      }

      const response = await api.post<ApiResponse<Project>>(
        `${this.BASE_PATH}/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error importing project:', error);
      throw error;
    }
  }
}

export const projectsService = new ProjectsService();
export default projectsService;

