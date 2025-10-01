// Servicio para manejo de evidencias en el módulo de inventario

import { api } from '../../../services/api';
import type { Evidence } from '../types';

export interface EvidenceUploadResponse {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url?: string;
}

export class EvidenceService {
  /**
   * Subir archivos de evidencia para una plataforma
   */
  static async uploadEvidence(
    files: File[], 
    platformId: string, 
    descriptions?: string[]
  ): Promise<Evidence[]> {
    try {
      console.log(`📤 Subiendo ${files.length} archivo(s) de evidencia para plataforma ${platformId}`);
      
      const formData = new FormData();
      
      // Agregar archivos
      files.forEach((file, index) => {
        formData.append('files', file);
        if (descriptions && descriptions[index]) {
          formData.append(`descriptions`, descriptions[index]);
        }
      });
      
      // Agregar metadata
      formData.append('platformId', platformId);
      formData.append('module', 'inventory');
      formData.append('entityType', 'platform');
      
      const response = await api.post('/api/inventory/evidence/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.data || !response.data.success) {
        throw new Error('Error en la respuesta del servidor');
      }
      
      const uploadedFiles: Evidence[] = response.data.data.map((file: any) => ({
        id: file.id,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        uploadDate: new Date(file.uploadDate),
        uploadedBy: file.uploadedBy || 'Usuario Actual',
        description: file.description,
        url: file.url
      }));
      
      console.log(`✅ ${uploadedFiles.length} archivo(s) subido(s) exitosamente`);
      return uploadedFiles;
      
    } catch (error) {
      console.error('❌ Error subiendo evidencias:', error);
      throw error;
    }
  }
  
  /**
   * Obtener evidencias de una plataforma
   */
  static async getPlatformEvidence(platformId: string): Promise<Evidence[]> {
    try {
      const response = await api.get(`/api/inventory/evidence/${platformId}`);
      
      if (!response.data || !response.data.success) {
        throw new Error('Error obteniendo evidencias');
      }
      
      return response.data.data.map((evidence: any) => ({
        id: evidence.id,
        fileName: evidence.fileName,
        fileType: evidence.fileType,
        fileSize: evidence.fileSize,
        uploadDate: new Date(evidence.uploadDate),
        uploadedBy: evidence.uploadedBy,
        description: evidence.description,
        url: evidence.url
      }));
      
    } catch (error) {
      console.error('❌ Error obteniendo evidencias:', error);
      throw error;
    }
  }
  
  /**
   * Eliminar evidencia
   */
  static async deleteEvidence(evidenceId: string, platformId: string): Promise<void> {
    try {
      await api.delete(`/api/inventory/evidence/${evidenceId}`, {
        data: { platformId }
      });
      
      console.log(`✅ Evidencia ${evidenceId} eliminada exitosamente`);
      
    } catch (error) {
      console.error('❌ Error eliminando evidencia:', error);
      throw error;
    }
  }
  
  /**
   * Validar archivo antes de subir
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `El archivo ${file.name} es muy grande. Máximo permitido: 10MB`
      };
    }
    
    // Validar tipos de archivo
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de archivo no soportado: ${file.type}. Tipos permitidos: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX, TXT`
      };
    }
    
    return { valid: true };
  }
  
  /**
   * Obtener ícono según tipo de archivo
   */
  static getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return '📝';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return '📊';
    } else if (fileType === 'text/plain') {
      return '📃';
    } else {
      return '📎';
    }
  }
  
  /**
   * Formatear tamaño de archivo
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
