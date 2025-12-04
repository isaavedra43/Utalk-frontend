// Servicio de tareas

import api from '../../../services/api';
import type { 
  Task, 
  TaskDependency, 
  TaskFilters,
  ChecklistItem,
  TaskComment,
  ApiResponse 
} from '../types';

class TasksService {
  private readonly BASE_PATH = '/api/projects';

  /**
   * Obtener tareas del proyecto
   * Endpoint: GET /api/projects/:projectId/tasks
   */
  async getTasks(
    projectId: string,
    options?: {
      filters?: TaskFilters;
      includeSubtasks?: boolean;
      includeCompleted?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }
  ): Promise<Task[]> {
    try {
      const response = await api.get<ApiResponse<Task[]>>(
        `${this.BASE_PATH}/${projectId}/tasks`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Obtener una tarea específica
   * Endpoint: GET /api/projects/:projectId/tasks/:taskId
   */
  async getTaskById(projectId: string, taskId: string): Promise<Task> {
    try {
      const response = await api.get<ApiResponse<Task>>(
        `${this.BASE_PATH}/${projectId}/tasks/${taskId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  /**
   * Crear nueva tarea
   * Endpoint: POST /api/projects/:projectId/tasks
   */
  async createTask(projectId: string, task: Partial<Task>): Promise<Task> {
    try {
      const response = await api.post<ApiResponse<Task>>(
        `${this.BASE_PATH}/${projectId}/tasks`,
        task
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Actualizar tarea
   * Endpoint: PUT /api/projects/:projectId/tasks/:taskId
   */
  async updateTask(
    projectId: string,
    taskId: string,
    updates: Partial<Task>
  ): Promise<Task> {
    try {
      const response = await api.put<ApiResponse<Task>>(
        `${this.BASE_PATH}/${projectId}/tasks/${taskId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Eliminar tarea
   * Endpoint: DELETE /api/projects/:projectId/tasks/:taskId
   */
  async deleteTask(projectId: string, taskId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${projectId}/tasks/${taskId}`);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Crear subtarea
   * Endpoint: POST /api/projects/:projectId/tasks/:taskId/subtasks
   */
  async createSubtask(
    projectId: string,
    parentTaskId: string,
    subtask: Partial<Task>
  ): Promise<Task> {
    try {
      const response = await api.post<ApiResponse<Task>>(
        `${this.BASE_PATH}/${projectId}/tasks/${parentTaskId}/subtasks`,
        subtask
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating subtask:', error);
      throw error;
    }
  }

  /**
   * Agregar dependencia entre tareas
   * Endpoint: POST /api/projects/:projectId/tasks/:taskId/dependencies
   */
  async addDependency(
    projectId: string,
    taskId: string,
    dependency: {
      predecessorId: string;
      type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
      lag?: number;
    }
  ): Promise<TaskDependency> {
    try {
      const response = await api.post<ApiResponse<TaskDependency>>(
        `${this.BASE_PATH}/${projectId}/tasks/${taskId}/dependencies`,
        dependency
      );
      return response.data.data;
    } catch (error) {
      console.error('Error adding dependency:', error);
      throw error;
    }
  }

  /**
   * Eliminar dependencia
   * Endpoint: DELETE /api/projects/:projectId/tasks/:taskId/dependencies/:depId
   */
  async removeDependency(
    projectId: string,
    taskId: string,
    dependencyId: string
  ): Promise<void> {
    try {
      await api.delete(
        `${this.BASE_PATH}/${projectId}/tasks/${taskId}/dependencies/${dependencyId}`
      );
    } catch (error) {
      console.error('Error removing dependency:', error);
      throw error;
    }
  }

  /**
   * Obtener ruta crítica del proyecto
   * Endpoint: GET /api/projects/:projectId/tasks/critical-path
   */
  async getCriticalPath(projectId: string): Promise<{
    path: Task[];
    totalDuration: number;
    bottlenecks: string[];
  }> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `${this.BASE_PATH}/${projectId}/tasks/critical-path`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching critical path:', error);
      throw error;
    }
  }

  /**
   * Agregar item al checklist de tarea
   * Endpoint: POST /api/projects/:projectId/tasks/:taskId/checklist
   */
  async addChecklistItem(
    projectId: string,
    taskId: string,
    item: Partial<ChecklistItem>
  ): Promise<ChecklistItem> {
    try {
      const response = await api.post<ApiResponse<ChecklistItem>>(
        `${this.BASE_PATH}/${projectId}/tasks/${taskId}/checklist`,
        item
      );
      return response.data.data;
    } catch (error) {
      console.error('Error adding checklist item:', error);
      throw error;
    }
  }

  /**
   * Actualizar item del checklist
   * Endpoint: PUT /api/projects/:projectId/tasks/:taskId/checklist/:itemId
   */
  async updateChecklistItem(
    projectId: string,
    taskId: string,
    itemId: string,
    updates: Partial<ChecklistItem>
  ): Promise<ChecklistItem> {
    try {
      const response = await api.put<ApiResponse<ChecklistItem>>(
        `${this.BASE_PATH}/${projectId}/tasks/${taskId}/checklist/${itemId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating checklist item:', error);
      throw error;
    }
  }

  /**
   * Subir archivo adjunto a tarea
   * Endpoint: POST /api/projects/:projectId/tasks/:taskId/attachments
   */
  async uploadAttachment(
    projectId: string,
    taskId: string,
    file: File,
    metadata?: {
      category?: string;
      description?: string;
    }
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await api.post<ApiResponse<any>>(
        `${this.BASE_PATH}/${projectId}/tasks/${taskId}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }

  /**
   * Agregar comentario a tarea
   * Endpoint: POST /api/projects/:projectId/tasks/:taskId/comments
   */
  async addComment(
    projectId: string,
    taskId: string,
    comment: {
      text: string;
      mentions?: string[];
      attachments?: string[];
      replyTo?: string;
    }
  ): Promise<TaskComment> {
    try {
      const response = await api.post<ApiResponse<TaskComment>>(
        `${this.BASE_PATH}/${projectId}/tasks/${taskId}/comments`,
        comment
      );
      return response.data.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Actualizar progreso de tarea
   * Endpoint: PUT /api/projects/:projectId/tasks/:taskId/progress
   */
  async updateProgress(
    projectId: string,
    taskId: string,
    progress: number
  ): Promise<Task> {
    try {
      const response = await api.put<ApiResponse<Task>>(
        `${this.BASE_PATH}/${projectId}/tasks/${taskId}/progress`,
        { progress }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado de tarea
   * Endpoint: PUT /api/projects/:projectId/tasks/:taskId/status
   */
  async updateStatus(
    projectId: string,
    taskId: string,
    status: string
  ): Promise<Task> {
    try {
      const response = await api.put<ApiResponse<Task>>(
        `${this.BASE_PATH}/${projectId}/tasks/${taskId}/status`,
        { status }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }

  /**
   * Asignar tarea a usuario
   * Endpoint: POST /api/projects/:projectId/tasks/:taskId/assign
   */
  async assignTask(
    projectId: string,
    taskId: string,
    assignees: string[]
  ): Promise<Task> {
    try {
      const response = await api.post<ApiResponse<Task>>(
        `${this.BASE_PATH}/${projectId}/tasks/${taskId}/assign`,
        { assignees }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    }
  }
}

export const tasksService = new TasksService();
export default tasksService;

