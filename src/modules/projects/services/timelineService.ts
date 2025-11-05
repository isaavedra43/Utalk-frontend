// Servicio de timeline y cronograma

import api from '../../../services/api';
import type { 
  ProjectTimeline,
  ProjectPhase,
  Milestone,
  Deliverable,
  TimelineBaseline,
  TimelineVariance,
  GanttViewConfig,
  ApiResponse 
} from '../types';

class TimelineService {
  private readonly BASE_PATH = '/api/projects';

  /**
   * Obtener timeline del proyecto
   * Endpoint: GET /api/projects/:id/timeline
   */
  async getTimeline(projectId: string): Promise<ProjectTimeline> {
    try {
      const response = await api.get<ApiResponse<ProjectTimeline>>(
        `${this.BASE_PATH}/${projectId}/timeline`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching timeline:', error);
      throw error;
    }
  }

  /**
   * Actualizar timeline
   * Endpoint: PUT /api/projects/:id/timeline
   */
  async updateTimeline(
    projectId: string,
    updates: Partial<ProjectTimeline>
  ): Promise<ProjectTimeline> {
    try {
      const response = await api.put<ApiResponse<ProjectTimeline>>(
        `${this.BASE_PATH}/${projectId}/timeline`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating timeline:', error);
      throw error;
    }
  }

  /**
   * Crear fase
   * Endpoint: POST /api/projects/:id/phases
   */
  async createPhase(
    projectId: string,
    phase: Partial<ProjectPhase>
  ): Promise<ProjectPhase> {
    try {
      const response = await api.post<ApiResponse<ProjectPhase>>(
        `${this.BASE_PATH}/${projectId}/phases`,
        phase
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating phase:', error);
      throw error;
    }
  }

  /**
   * Actualizar fase
   * Endpoint: PUT /api/projects/:id/phases/:phaseId
   */
  async updatePhase(
    projectId: string,
    phaseId: string,
    updates: Partial<ProjectPhase>
  ): Promise<ProjectPhase> {
    try {
      const response = await api.put<ApiResponse<ProjectPhase>>(
        `${this.BASE_PATH}/${projectId}/phases/${phaseId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating phase:', error);
      throw error;
    }
  }

  /**
   * Eliminar fase
   * Endpoint: DELETE /api/projects/:id/phases/:phaseId
   */
  async deletePhase(projectId: string, phaseId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${projectId}/phases/${phaseId}`);
    } catch (error) {
      console.error('Error deleting phase:', error);
      throw error;
    }
  }

  /**
   * Crear milestone
   * Endpoint: POST /api/projects/:id/milestones
   */
  async createMilestone(
    projectId: string,
    milestone: Partial<Milestone>
  ): Promise<Milestone> {
    try {
      const response = await api.post<ApiResponse<Milestone>>(
        `${this.BASE_PATH}/${projectId}/milestones`,
        milestone
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating milestone:', error);
      throw error;
    }
  }

  /**
   * Actualizar milestone
   * Endpoint: PUT /api/projects/:id/milestones/:milestoneId
   */
  async updateMilestone(
    projectId: string,
    milestoneId: string,
    updates: Partial<Milestone>
  ): Promise<Milestone> {
    try {
      const response = await api.put<ApiResponse<Milestone>>(
        `${this.BASE_PATH}/${projectId}/milestones/${milestoneId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  }

  /**
   * Obtener datos para Gantt
   * Endpoint: GET /api/projects/:id/gantt
   */
  async getGanttData(
    projectId: string,
    config?: GanttViewConfig
  ): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `${this.BASE_PATH}/${projectId}/gantt`,
        { params: config }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Gantt data:', error);
      throw error;
    }
  }

  /**
   * Obtener datos para calendario
   * Endpoint: GET /api/projects/:id/calendar
   */
  async getCalendarData(
    projectId: string,
    options?: {
      start?: Date;
      end?: Date;
      types?: string[];
    }
  ): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `${this.BASE_PATH}/${projectId}/calendar`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      throw error;
    }
  }

  /**
   * Crear baseline
   * Endpoint: POST /api/projects/:id/baselines
   */
  async createBaseline(
    projectId: string,
    baseline: {
      name: string;
      description?: string;
    }
  ): Promise<TimelineBaseline> {
    try {
      const response = await api.post<ApiResponse<TimelineBaseline>>(
        `${this.BASE_PATH}/${projectId}/baselines`,
        baseline
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating baseline:', error);
      throw error;
    }
  }

  /**
   * Obtener análisis de varianza
   * Endpoint: GET /api/projects/:id/timeline/variance
   */
  async getVariance(
    projectId: string,
    baselineId?: string
  ): Promise<TimelineVariance> {
    try {
      const response = await api.get<ApiResponse<TimelineVariance>>(
        `${this.BASE_PATH}/${projectId}/timeline/variance`,
        { params: { baselineId } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching variance:', error);
      throw error;
    }
  }

  /**
   * Recalcular cronograma
   * Endpoint: POST /api/projects/:id/timeline/recalculate
   */
  async recalculateSchedule(projectId: string): Promise<ProjectTimeline> {
    try {
      const response = await api.post<ApiResponse<ProjectTimeline>>(
        `${this.BASE_PATH}/${projectId}/timeline/recalculate`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error recalculating schedule:', error);
      throw error;
    }
  }
}

export const timelineService = new TimelineService();
export default timelineService;

