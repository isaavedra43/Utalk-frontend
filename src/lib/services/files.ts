/**
 * Servicio de archivos para UTalk Frontend
 * Flujo canónico: upload → obtener metadatos → enviar mensaje con attachments por ID
 */

import { httpPostMultipart } from '$lib/api/http';

export interface Attachment {
  id: string;
  url: string;
  mime: string;
  name: string;
  size: number;
  type: 'image' | 'video' | 'audio' | 'file';
}

export interface UploadOptions {
  onProgress?: (percent: number) => void;
  signal?: globalThis.AbortSignal;
}

export interface UploadResult {
  attachments: Attachment[];
}

/**
 * Subir múltiples archivos y obtener metadatos
 */
export async function uploadFiles(files: File[], _options: UploadOptions = {}): Promise<Attachment[]> {
  if (files.length === 0) return [];

  const formData = new FormData();
  
  // Agregar todos los archivos al FormData
  files.forEach((file) => {
    formData.append('file', file);
  });

  try {
    const response = await httpPostMultipart<{ data: { attachments: Attachment[] } }>('media/upload', formData);
    
    if (!response?.data?.attachments) {
      throw new Error('Respuesta inválida del servidor');
    }

    return response.data.attachments;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error subiendo archivos:', error);
    throw new Error('No se pudieron subir los archivos. Intenta nuevamente.');
  }
}

/**
 * Subir un solo archivo (wrapper para compatibilidad)
 */
export async function uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
  const attachments = await uploadFiles([file], options);
  return { attachments };
} 