import api from './api';
import { encodeConversationIdForUrl } from '../utils/conversationUtils';

export interface ConversationFile {
  id: string;
  originalName: string;
  category: 'image' | 'audio' | 'video' | 'document';
  mimeType: string;
  size: string;
  sizeBytes: number;
  publicUrl: string;
  storageUrl: string;
  conversationId: string;
  messageId: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadCount: number;
  lastAccessedAt: string;
  metadata: {
    sentViaWhatsApp?: boolean;
    thumbnailUrl?: string;
    duration?: number; // Para audio/video en segundos
  };
  tags: string[];
  isActive: boolean;
}

export interface ConversationFilesResponse {
  files: ConversationFile[];
  count: number;
  conversationId: string;
}

export interface FilesFilters {
  limit?: number;
  startAfter?: string;
  category?: 'image' | 'audio' | 'video' | 'document' | null;
  isActive?: boolean;
}

export const conversationFilesService = {
  // Obtener archivos de una conversación
  async getConversationFiles(
    conversationId: string, 
    filters: FilesFilters = {}
  ): Promise<ConversationFilesResponse> {
    const encodedId = encodeConversationIdForUrl(conversationId);
    
    const params = new URLSearchParams();
    params.set('limit', (filters.limit || 50).toString());
    params.set('isActive', (filters.isActive !== false).toString());
    
    if (filters.startAfter) {
      params.set('startAfter', filters.startAfter);
    }
    
    if (filters.category) {
      params.set('category', filters.category);
    }
    
    const response = await api.get(`/api/media/conversation/${encodedId}?${params}`);
    return response.data.data;
  },

  // Obtener solo imágenes
  async getImages(conversationId: string, limit = 50): Promise<ConversationFilesResponse> {
    return this.getConversationFiles(conversationId, { category: 'image', limit });
  },

  // Obtener solo documentos
  async getDocuments(conversationId: string, limit = 50): Promise<ConversationFilesResponse> {
    return this.getConversationFiles(conversationId, { category: 'document', limit });
  },

  // Obtener solo videos
  async getVideos(conversationId: string, limit = 50): Promise<ConversationFilesResponse> {
    return this.getConversationFiles(conversationId, { category: 'video', limit });
  },

  // Obtener solo audios
  async getAudios(conversationId: string, limit = 50): Promise<ConversationFilesResponse> {
    return this.getConversationFiles(conversationId, { category: 'audio', limit });
  },

  // Descargar archivo
  async downloadFile(fileId: string, fileName: string): Promise<void> {
    try {
      const response = await api.get(`/api/media/file/${fileId}/download`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando archivo:', error);
      throw new Error('No se pudo descargar el archivo');
    }
  },

  // Formatear tamaño de archivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Formatear fecha
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }
};
