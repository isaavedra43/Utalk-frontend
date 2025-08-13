import api from './api';

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
  id: string;
}

export const fileUploadService = {
  // Subir archivo
  async uploadFile(file: File, conversationId: string): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    formData.append('type', file.type);

    const response = await api.post('/api/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Subir imagen
  async uploadImage(file: File, conversationId: string): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('conversationId', conversationId);

    const response = await api.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Subir documento
  async uploadDocument(file: File, conversationId: string): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('conversationId', conversationId);

    const response = await api.post('/api/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Obtener URL de descarga
  getDownloadUrl(fileId: string): string {
    return `${api.defaults.baseURL}/api/files/${fileId}/download`;
  },

  // Validar tipo de archivo
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  },

  // Validar tamaño de archivo (en MB)
  validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  // Obtener extensión del archivo
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  },

  // Formatear tamaño de archivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}; 