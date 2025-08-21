import api from './api';
import { FILE_CONFIG, ERROR_MESSAGES } from '../config/constants';

export interface FileUploadResponse {
  id: string; // ID del archivo subido (para usar en send-with-file-ids)
  mime: string;
  name: string;
  size: number;
  type: string;
  whatsappCompatible: boolean;
}

export const fileUploadService = {
  // Subir archivo al servidor (NO lo envía a WhatsApp)
  async uploadFile(file: File, options: {
    conversationId: string;
    type: string;
  }): Promise<FileUploadResponse> {
    // Logs obligatorios
    console.log('📁 Iniciando subida:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      conversationId: options.conversationId
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', options.conversationId);

    const response = await api.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // El backend responde con { success: true, data: { attachments: [...] } }
    const attachments = response.data.data?.attachments || [];
    const uploaded = attachments[0];

    // Validación crítica: debe existir id
    if (!uploaded?.id) {
      throw new Error('No se recibió ID del archivo subido');
    }

    console.log('✅ Archivo subido:', {
      id: uploaded.id,
      type: uploaded.type,
      name: uploaded.name
    });

    return uploaded; // Retorna el primer archivo subido
  },

  // Enviar mensaje con archivos adjuntos a WhatsApp (paso 2)
  async sendMessageWithAttachments(conversationId: string, content: string, attachments: Array<{ id: string; type: string }>): Promise<Record<string, unknown>> {
    // VALIDACIONES CRÍTICAS
    if (!conversationId) {
      throw new Error('conversationId es requerido');
    }
    if (!attachments) {
      throw new Error('attachments es requerido');
    }
    if (!Array.isArray(attachments)) {
      throw new Error('attachments debe ser un array');
    }
    if (attachments.length === 0) {
      throw new Error('attachments no puede estar vacío');
    }

    const validTypes = ['image', 'document', 'video', 'audio'];

    attachments.forEach((attachment, index) => {
      if (!attachment.id) {
        throw new Error(`Attachment ${index} debe tener ID`);
      }
      if (!attachment.type) {
        throw new Error(`Attachment ${index} debe tener tipo`);
      }
      if (!validTypes.includes(attachment.type)) {
        throw new Error(`Attachment ${index} tiene tipo inválido: ${attachment.type}`);
      }
    });

    // Payload exacto
    const payload = {
      conversationId,
      // SOLUCIONADO: No enviar content vacío cuando solo hay archivos
      // Solo incluir content si realmente hay texto
      ...(content && content.trim() && { content: content.trim() }),
      attachments: attachments.map(a => ({ id: a.id, type: a.type }))
    };

    // Logs obligatorios
    console.log('📤 Enviando mensaje:', {
      conversationId,
      content: content || '(vacío)',
      attachments: payload.attachments
    });

    // Verificación final
    if (!payload.attachments || payload.attachments.length === 0 || !payload.attachments[0].id || !payload.attachments[0].type) {
      throw new Error('Payload incompleto: attachments/id/type requeridos');
    }

    console.log('📤 Payload REAL a enviar:', JSON.stringify(payload, null, 2));

    const response = await api.post('/api/messages/send-with-file-ids', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Mensaje enviado:', response.data);
    return response.data;
  },

  // Subir imagen
  async uploadImage(file: File, conversationId: string): Promise<FileUploadResponse> {
    // Validar tipo y tamaño
    if (!this.validateFileType(file, FILE_CONFIG.ALLOWED_FILE_TYPES.IMAGE)) {
      throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
    }
    if (!this.validateFileSize(file, FILE_CONFIG.MAX_FILE_SIZE.IMAGE / (1024 * 1024))) {
      throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
    }

    return this.uploadFile(file, { conversationId, type: 'image' });
  },

  // Subir documento
  async uploadDocument(file: File, conversationId: string): Promise<FileUploadResponse> {
    // Validar tipo y tamaño
    if (!this.validateFileType(file, FILE_CONFIG.ALLOWED_FILE_TYPES.DOCUMENT)) {
      throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
    }
    if (!this.validateFileSize(file, FILE_CONFIG.MAX_FILE_SIZE.DOCUMENT / (1024 * 1024))) {
      throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
    }

    return this.uploadFile(file, { conversationId, type: 'document' });
  },

  // Subir audio
  async uploadAudio(file: File, conversationId: string): Promise<FileUploadResponse> {
    // Validar tipo y tamaño
    if (!this.validateFileType(file, FILE_CONFIG.ALLOWED_FILE_TYPES.AUDIO)) {
      throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
    }
    if (!this.validateFileSize(file, FILE_CONFIG.MAX_FILE_SIZE.AUDIO / (1024 * 1024))) {
      throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
    }

    return this.uploadFile(file, { conversationId, type: 'audio' });
  },

  // Subir video
  async uploadVideo(file: File, conversationId: string): Promise<FileUploadResponse> {
    // Validar tipo y tamaño
    if (!this.validateFileType(file, FILE_CONFIG.ALLOWED_FILE_TYPES.VIDEO)) {
      throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
    }
    if (!this.validateFileSize(file, FILE_CONFIG.MAX_FILE_SIZE.VIDEO / (1024 * 1024))) {
      throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
    }

    return this.uploadFile(file, { conversationId, type: 'video' });
  },

  // Obtener URL de descarga
  getDownloadUrl(fileId: string): string {
    return `${api.defaults.baseURL}/api/media/file/${fileId}/download`;
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

  // Validar archivo completo (tipo y tamaño)
  validateFile(file: File): void {
    const messageType = this.getMessageType(file);
    let allowedTypes: string[];
    let maxSizeMB: number;

    switch (messageType) {
      case 'image':
        allowedTypes = FILE_CONFIG.ALLOWED_FILE_TYPES.IMAGE;
        maxSizeMB = FILE_CONFIG.MAX_FILE_SIZE.IMAGE / (1024 * 1024);
        break;
      case 'audio':
        allowedTypes = FILE_CONFIG.ALLOWED_FILE_TYPES.AUDIO;
        maxSizeMB = FILE_CONFIG.MAX_FILE_SIZE.AUDIO / (1024 * 1024);
        break;
      case 'video':
        allowedTypes = FILE_CONFIG.ALLOWED_FILE_TYPES.VIDEO;
        maxSizeMB = FILE_CONFIG.MAX_FILE_SIZE.VIDEO / (1024 * 1024);
        break;
      default:
        allowedTypes = FILE_CONFIG.ALLOWED_FILE_TYPES.DOCUMENT;
        maxSizeMB = FILE_CONFIG.MAX_FILE_SIZE.DOCUMENT / (1024 * 1024);
        break;
    }

    if (!this.validateFileType(file, allowedTypes)) {
      throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
    }
    if (!this.validateFileSize(file, maxSizeMB)) {
      throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
    }
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
  },

  // Determinar tipo de mensaje basado en el archivo
  getMessageType(file: File): 'image' | 'document' | 'audio' | 'video' {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  },

  // Obtener icono para tipo de archivo
  getFileIcon(filename: string): string {
    const ext = this.getFileExtension(filename);
    const iconMap: Record<string, string> = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📄',
      xls: '📊',
      xlsx: '📊',
      ppt: '📋',
      pptx: '📋',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp3: '🎵',
      wav: '🎵',
      mp4: '🎬',
      avi: '🎬',
      mov: '🎬'
    };
    return iconMap[ext] || '📎';
  }
}; 