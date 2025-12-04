// Servicio de gestión de equipo

import api from '../../../services/api';
import type { 
  TeamMember,
  ProjectRole,
  EmployeeAvailability,
  EmployeeWorkload,
  TimeEntry,
  AssignmentSuggestion,
  ApiResponse 
} from '../types';

class TeamService {
  private readonly BASE_PATH = '/api/projects';

  /**
   * Obtener miembros del equipo
   * Endpoint: GET /api/projects/:id/team/members
   */
  async getTeamMembers(projectId: string): Promise<TeamMember[]> {
    try {
      const response = await api.get<ApiResponse<TeamMember[]>>(
        `${this.BASE_PATH}/${projectId}/team/members`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }

  /**
   * Agregar miembro al equipo
   * Endpoint: POST /api/projects/:id/team/members
   */
  async addTeamMember(
    projectId: string,
    member: {
      employeeId: string;
      role: string;
      allocation?: number;
      hourlyRate?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<TeamMember> {
    try {
      const response = await api.post<ApiResponse<TeamMember>>(
        `${this.BASE_PATH}/${projectId}/team/members`,
        member
      );
      return response.data.data;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  }

  /**
   * Actualizar miembro del equipo
   * Endpoint: PUT /api/projects/:id/team/members/:memberId
   */
  async updateTeamMember(
    projectId: string,
    memberId: string,
    updates: Partial<TeamMember>
  ): Promise<TeamMember> {
    try {
      const response = await api.put<ApiResponse<TeamMember>>(
        `${this.BASE_PATH}/${projectId}/team/members/${memberId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  }

  /**
   * Remover miembro del equipo
   * Endpoint: DELETE /api/projects/:id/team/members/:memberId
   */
  async removeTeamMember(projectId: string, memberId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${projectId}/team/members/${memberId}`);
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  }

  /**
   * Obtener disponibilidad del equipo
   * Endpoint: GET /api/projects/:id/team/availability
   */
  async getTeamAvailability(
    projectId: string,
    options?: {
      dateFrom?: Date;
      dateTo?: Date;
      employeeIds?: string[];
    }
  ): Promise<EmployeeAvailability[]> {
    try {
      const response = await api.get<ApiResponse<EmployeeAvailability[]>>(
        `${this.BASE_PATH}/${projectId}/team/availability`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching team availability:', error);
      throw error;
    }
  }

  /**
   * Obtener carga de trabajo del equipo
   * Endpoint: GET /api/projects/:id/team/workload
   */
  async getTeamWorkload(
    projectId: string,
    options?: {
      periodStart?: Date;
      periodEnd?: Date;
    }
  ): Promise<EmployeeWorkload[]> {
    try {
      const response = await api.get<ApiResponse<EmployeeWorkload[]>>(
        `${this.BASE_PATH}/${projectId}/team/workload`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching team workload:', error);
      throw error;
    }
  }

  /**
   * Registrar entrada de tiempo
   * Endpoint: POST /api/projects/:id/team/time-entries
   */
  async createTimeEntry(
    projectId: string,
    timeEntry: Partial<TimeEntry>
  ): Promise<TimeEntry> {
    try {
      const response = await api.post<ApiResponse<TimeEntry>>(
        `${this.BASE_PATH}/${projectId}/team/time-entries`,
        timeEntry
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw error;
    }
  }

  /**
   * Obtener entradas de tiempo
   * Endpoint: GET /api/projects/:id/team/time-entries
   */
  async getTimeEntries(
    projectId: string,
    options?: {
      employeeId?: string;
      taskId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      status?: string[];
    }
  ): Promise<TimeEntry[]> {
    try {
      const response = await api.get<ApiResponse<TimeEntry[]>>(
        `${this.BASE_PATH}/${projectId}/team/time-entries`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching time entries:', error);
      throw error;
    }
  }

  /**
   * Aprobar entrada de tiempo
   * Endpoint: POST /api/projects/:id/team/time-entries/:entryId/approve
   */
  async approveTimeEntry(
    projectId: string,
    entryId: string,
    comments?: string
  ): Promise<TimeEntry> {
    try {
      const response = await api.post<ApiResponse<TimeEntry>>(
        `${this.BASE_PATH}/${projectId}/team/time-entries/${entryId}/approve`,
        { comments }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error approving time entry:', error);
      throw error;
    }
  }

  /**
   * Crear rol del proyecto
   * Endpoint: POST /api/projects/:id/team/roles
   */
  async createRole(
    projectId: string,
    role: Partial<ProjectRole>
  ): Promise<ProjectRole> {
    try {
      const response = await api.post<ApiResponse<ProjectRole>>(
        `${this.BASE_PATH}/${projectId}/team/roles`,
        role
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Obtener sugerencias de asignación (IA)
   * Endpoint: GET /api/projects/:id/team/suggestions
   */
  async getAssignmentSuggestions(
    projectId: string,
    taskId: string,
    options?: {
      count?: number;
      considerAvailability?: boolean;
      considerSkills?: boolean;
      considerCost?: boolean;
    }
  ): Promise<AssignmentSuggestion[]> {
    try {
      const response = await api.get<ApiResponse<AssignmentSuggestion[]>>(
        `${this.BASE_PATH}/${projectId}/team/suggestions`,
        { params: { taskId, ...options } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching assignment suggestions:', error);
      throw error;
    }
  }

  /**
   * Exportar reporte de tiempo para nómina
   * Endpoint: GET /api/projects/:id/team/payroll-export
   */
  async exportForPayroll(
    projectId: string,
    options: {
      periodStart: Date;
      periodEnd: Date;
      format: 'excel' | 'csv' | 'json';
    }
  ): Promise<Blob> {
    try {
      const response = await api.get(
        `${this.BASE_PATH}/${projectId}/team/payroll-export`,
        { 
          params: options,
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting for payroll:', error);
      throw error;
    }
  }
}

export const teamService = new TeamService();
export default teamService;

