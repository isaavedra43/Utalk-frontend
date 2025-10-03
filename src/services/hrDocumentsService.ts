import api from './api';
import { handleApiError } from '../config/api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface HRDocument {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'image' | 'video' | 'audio' | 'document' | 'spreadsheet' | 'presentation' | 'archive' | 'template' | 'other';
  category: 'plantilla' | 'politica' | 'procedimiento' | 'manual' | 'formato' | 'capacitacion' | 'legal' | 'multimedia' | 'otro';
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  updatedAt: string;
  tags: string[];
  isPublic: boolean;
  isPinned: boolean;
  isFavorite: boolean;
  downloadCount: number;
  viewCount: number;
  lastAccessedAt?: string;
  version: number;
  folder?: string;
  permissions: {
    canView: boolean;
    canDownload: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
  };
}

export interface HRDocumentMetadata {
  name: string;
  description?: string;
  category: HRDocument['category'];
  tags?: string[];
  isPublic?: boolean;
  folder?: string;
}

export interface HRDocumentsSummary {
  totalDocuments: number;
  totalSize: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  recentUploads: HRDocument[];
  mostDownloaded: HRDocument[];
  mostViewed: HRDocument[];
  pinnedDocuments: HRDocument[];
}

export interface HRDocumentsFilters {
  search?: string;
  category?: string;
  type?: string;
  folder?: string;
  tags?: string[];
  isPublic?: boolean;
  isPinned?: boolean;
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================================
// HR DOCUMENTS SERVICE
// ============================================================================

class HRDocumentsService {
  private handleError(error: unknown, context: string): never {
    const errorMessage = handleApiError(error);
    console.error(`❌ HRDocumentsService.${context}:`, errorMessage);
    throw new Error(errorMessage);
  }

  /**
   * Obtener todos los documentos de RH
   */
  async getDocuments(filters: HRDocumentsFilters = {}): Promise<HRDocument[]> {
    try {
      console.log('🔍 Obteniendo documentos de RH:', { filters });
      
      const response = await api.get('/api/hr/documents', { params: filters });
      
      const documents = response.data.data?.documents || response.data.documents || [];
      console.log(`✅ ${documents.length} documentos obtenidos`);
      return documents;
    } catch (error) {
      this.handleError(error, 'getDocuments');
    }
  }

  /**
   * Obtener documento específico
   */
  async getDocumentById(documentId: string): Promise<HRDocument> {
    try {
      console.log('🔍 Obteniendo documento:', { documentId });
      
      const response = await api.get(`/api/hr/documents/${documentId}`);
      
      console.log('✅ Documento obtenido');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getDocumentById');
    }
  }

  /**
   * Subir documento
   */
  async uploadDocument(file: File, metadata: HRDocumentMetadata): Promise<HRDocument> {
    try {
      console.log('📤 Subiendo documento:', { fileName: file.name, metadata });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', metadata.name);
      if (metadata.description) formData.append('description', metadata.description);
      formData.append('category', metadata.category);
      if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));
      if (metadata.isPublic !== undefined) formData.append('isPublic', String(metadata.isPublic));
      if (metadata.folder) formData.append('folder', metadata.folder);
      
      const response = await api.post('/api/hr/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Documento subido exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'uploadDocument');
    }
  }

  /**
   * Actualizar documento
   */
  async updateDocument(documentId: string, metadata: Partial<HRDocumentMetadata>): Promise<HRDocument> {
    try {
      console.log('📝 Actualizando documento:', { documentId, metadata });
      
      const response = await api.put(`/api/hr/documents/${documentId}`, metadata);
      
      console.log('✅ Documento actualizado');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'updateDocument');
    }
  }

  /**
   * Eliminar documento
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando documento:', { documentId });
      
      await api.delete(`/api/hr/documents/${documentId}`);
      
      console.log('✅ Documento eliminado');
    } catch (error) {
      this.handleError(error, 'deleteDocument');
    }
  }

  /**
   * Descargar documento
   */
  async downloadDocument(documentId: string): Promise<Blob> {
    try {
      console.log('📥 Descargando documento:', { documentId });
      
      const response = await api.get(`/api/hr/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      
      console.log('✅ Documento descargado');
      return response.data;
    } catch (error) {
      this.handleError(error, 'downloadDocument');
    }
  }

  /**
   * Obtener URL de vista previa
   */
  async getPreviewUrl(documentId: string): Promise<string> {
    try {
      console.log('👁️ Obteniendo URL de vista previa:', { documentId });
      
      const response = await api.get(`/api/hr/documents/${documentId}/preview`);
      
      const previewUrl = response.data.data?.previewUrl || response.data.previewUrl;
      console.log('✅ URL de vista previa obtenida');
      return previewUrl;
    } catch (error) {
      this.handleError(error, 'getPreviewUrl');
    }
  }

  /**
   * Marcar/desmarcar como favorito
   */
  async toggleFavorite(documentId: string): Promise<HRDocument> {
    try {
      console.log('⭐ Cambiando estado de favorito:', { documentId });
      
      const response = await api.put(`/api/hr/documents/${documentId}/favorite`);
      
      console.log('✅ Estado de favorito actualizado');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'toggleFavorite');
    }
  }

  /**
   * Marcar/desmarcar como fijado
   */
  async togglePin(documentId: string): Promise<HRDocument> {
    try {
      console.log('📌 Cambiando estado de fijado:', { documentId });
      
      const response = await api.put(`/api/hr/documents/${documentId}/pin`);
      
      console.log('✅ Estado de fijado actualizado');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'togglePin');
    }
  }

  /**
   * Compartir documento
   */
  async shareDocument(documentId: string, shareData: {
    users?: string[];
    departments?: string[];
    expirationDate?: string;
    message?: string;
  }): Promise<void> {
    try {
      console.log('🔗 Compartiendo documento:', { documentId, shareData });
      
      await api.post(`/api/hr/documents/${documentId}/share`, shareData);
      
      console.log('✅ Documento compartido');
    } catch (error) {
      this.handleError(error, 'shareDocument');
    }
  }

  /**
   * Duplicar documento
   */
  async duplicateDocument(documentId: string): Promise<HRDocument> {
    try {
      console.log('📋 Duplicando documento:', { documentId });
      
      const response = await api.post(`/api/hr/documents/${documentId}/duplicate`);
      
      console.log('✅ Documento duplicado');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'duplicateDocument');
    }
  }

  /**
   * Mover documento a carpeta
   */
  async moveDocument(documentId: string, folder: string): Promise<HRDocument> {
    try {
      console.log('📁 Moviendo documento:', { documentId, folder });
      
      const response = await api.put(`/api/hr/documents/${documentId}/move`, { folder });
      
      console.log('✅ Documento movido');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'moveDocument');
    }
  }

  /**
   * Obtener resumen/estadísticas
   */
  async getSummary(): Promise<HRDocumentsSummary> {
    try {
      console.log('📊 Obteniendo resumen de documentos');
      
      const response = await api.get('/api/hr/documents/summary');
      
      console.log('✅ Resumen obtenido');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getSummary');
    }
  }

  /**
   * Buscar documentos
   */
  async searchDocuments(query: string, filters?: HRDocumentsFilters): Promise<HRDocument[]> {
    try {
      console.log('🔎 Buscando documentos:', { query, filters });
      
      const response = await api.get('/api/hr/documents/search', {
        params: { query, ...filters }
      });
      
      const results = response.data.data?.documents || response.data.documents || [];
      console.log(`✅ ${results.length} documentos encontrados`);
      return results;
    } catch (error) {
      this.handleError(error, 'searchDocuments');
    }
  }

  /**
   * Obtener carpetas
   */
  async getFolders(): Promise<string[]> {
    try {
      console.log('📁 Obteniendo carpetas');
      
      const response = await api.get('/api/hr/documents/folders');
      
      const folders = response.data.data?.folders || response.data.folders || [];
      console.log(`✅ ${folders.length} carpetas obtenidas`);
      return folders;
    } catch (error) {
      this.handleError(error, 'getFolders');
    }
  }

  /**
   * Crear carpeta
   */
  async createFolder(folderName: string): Promise<void> {
    try {
      console.log('📁 Creando carpeta:', { folderName });
      
      await api.post('/api/hr/documents/folders', { name: folderName });
      
      console.log('✅ Carpeta creada');
    } catch (error) {
      this.handleError(error, 'createFolder');
    }
  }

  /**
   * Eliminar carpeta
   */
  async deleteFolder(folderName: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando carpeta:', { folderName });
      
      await api.delete(`/api/hr/documents/folders/${folderName}`);
      
      console.log('✅ Carpeta eliminada');
    } catch (error) {
      this.handleError(error, 'deleteFolder');
    }
  }

  /**
   * Obtener historial de actividad
   */
  async getActivityLog(documentId?: string): Promise<any[]> {
    try {
      console.log('📜 Obteniendo historial de actividad');
      
      const url = documentId 
        ? `/api/hr/documents/${documentId}/activity`
        : '/api/hr/documents/activity';
      
      const response = await api.get(url);
      
      const activities = response.data.data?.activities || response.data.activities || [];
      console.log(`✅ ${activities.length} actividades obtenidas`);
      return activities;
    } catch (error) {
      this.handleError(error, 'getActivityLog');
    }
  }

  /**
   * Exportar documentos
   */
  async exportDocuments(format: 'excel' | 'pdf' = 'excel', filters?: HRDocumentsFilters): Promise<Blob> {
    try {
      console.log('📤 Exportando documentos:', { format, filters });
      
      const response = await api.get('/api/hr/documents/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      
      console.log('✅ Documentos exportados');
      return response.data;
    } catch (error) {
      this.handleError(error, 'exportDocuments');
    }
  }
}

export const hrDocumentsService = new HRDocumentsService();
export default hrDocumentsService;

