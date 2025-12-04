// Servicio de gestión documental

import api from '../../../services/api';
import type { 
  Document,
  DocumentFolder,
  DocumentVersion,
  DocumentComment,
  DocumentSearchFilters,
  DocumentSearchResult,
  ApiResponse 
} from '../types';

class DocumentsService {
  private readonly BASE_PATH = '/api/projects';

  /**
   * Obtener documentos del proyecto
   * Endpoint: GET /api/projects/:id/documents
   */
  async getDocuments(
    projectId: string,
    filters?: DocumentSearchFilters
  ): Promise<Document[]> {
    try {
      const response = await api.get<ApiResponse<Document[]>>(
        `${this.BASE_PATH}/${projectId}/documents`,
        { params: filters }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  /**
   * Obtener un documento específico
   * Endpoint: GET /api/projects/:id/documents/:docId
   */
  async getDocumentById(projectId: string, docId: string): Promise<Document> {
    try {
      const response = await api.get<ApiResponse<Document>>(
        `${this.BASE_PATH}/${projectId}/documents/${docId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  /**
   * Subir documento
   * Endpoint: POST /api/projects/:id/documents
   */
  async uploadDocument(
    projectId: string,
    file: File,
    metadata: {
      folderId?: string;
      category?: string;
      tags?: string[];
      description?: string;
      requiresApproval?: boolean;
      customFields?: any;
    }
  ): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await api.post<ApiResponse<Document>>(
        `${this.BASE_PATH}/${projectId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Actualizar documento
   * Endpoint: PUT /api/projects/:id/documents/:docId
   */
  async updateDocument(
    projectId: string,
    docId: string,
    updates: Partial<Document>
  ): Promise<Document> {
    try {
      const response = await api.put<ApiResponse<Document>>(
        `${this.BASE_PATH}/${projectId}/documents/${docId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  /**
   * Eliminar documento
   * Endpoint: DELETE /api/projects/:id/documents/:docId
   */
  async deleteDocument(projectId: string, docId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${projectId}/documents/${docId}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Subir nueva versión de documento
   * Endpoint: POST /api/projects/:id/documents/:docId/versions
   */
  async uploadNewVersion(
    projectId: string,
    docId: string,
    file: File,
    changeDescription?: string
  ): Promise<DocumentVersion> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (changeDescription) {
        formData.append('changeDescription', changeDescription);
      }

      const response = await api.post<ApiResponse<DocumentVersion>>(
        `${this.BASE_PATH}/${projectId}/documents/${docId}/versions`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error uploading new version:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de versiones
   * Endpoint: GET /api/projects/:id/documents/:docId/versions
   */
  async getVersions(projectId: string, docId: string): Promise<DocumentVersion[]> {
    try {
      const response = await api.get<ApiResponse<DocumentVersion[]>>(
        `${this.BASE_PATH}/${projectId}/documents/${docId}/versions`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching versions:', error);
      throw error;
    }
  }

  /**
   * Agregar comentario a documento
   * Endpoint: POST /api/projects/:id/documents/:docId/comments
   */
  async addComment(
    projectId: string,
    docId: string,
    comment: {
      text: string;
      page?: number;
      position?: { x: number; y: number };
      mentions?: string[];
    }
  ): Promise<DocumentComment> {
    try {
      const response = await api.post<ApiResponse<DocumentComment>>(
        `${this.BASE_PATH}/${projectId}/documents/${docId}/comments`,
        comment
      );
      return response.data.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Solicitar aprobación de documento
   * Endpoint: POST /api/projects/:id/documents/:docId/approve
   */
  async requestApproval(
    projectId: string,
    docId: string,
    approvers: string[],
    workflowId?: string
  ): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.BASE_PATH}/${projectId}/documents/${docId}/approve`,
        { approvers, workflowId }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error requesting approval:', error);
      throw error;
    }
  }

  /**
   * Crear carpeta
   * Endpoint: POST /api/projects/:id/folders
   */
  async createFolder(
    projectId: string,
    folder: Partial<DocumentFolder>
  ): Promise<DocumentFolder> {
    try {
      const response = await api.post<ApiResponse<DocumentFolder>>(
        `${this.BASE_PATH}/${projectId}/folders`,
        folder
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  /**
   * Obtener carpetas
   * Endpoint: GET /api/projects/:id/folders
   */
  async getFolders(projectId: string): Promise<DocumentFolder[]> {
    try {
      const response = await api.get<ApiResponse<DocumentFolder[]>>(
        `${this.BASE_PATH}/${projectId}/folders`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  }

  /**
   * Buscar documentos
   * Endpoint: GET /api/projects/:id/documents/search
   */
  async searchDocuments(
    projectId: string,
    query: string,
    filters?: DocumentSearchFilters
  ): Promise<DocumentSearchResult[]> {
    try {
      const response = await api.get<ApiResponse<DocumentSearchResult[]>>(
        `${this.BASE_PATH}/${projectId}/documents/search`,
        { params: { query, ...filters } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  /**
   * Descargar documento
   * Endpoint: GET /api/projects/:id/documents/:docId/download
   */
  async downloadDocument(projectId: string, docId: string): Promise<Blob> {
    try {
      const response = await api.get(
        `${this.BASE_PATH}/${projectId}/documents/${docId}/download`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }
}

export const documentsService = new DocumentsService();
export default documentsService;

