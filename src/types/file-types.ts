// Tipos específicos para manejo de archivos en el chat
export interface FileAttachment {
  id: string
  url: string
  filename: string
  size: number
  mimeType: string
  category: 'image' | 'video' | 'audio' | 'document'
  uploadedAt?: Date
  uploadedBy?: string
  metadata?: {
    width?: number
    height?: number
    duration?: number
    thumbnail?: string
    compressed?: boolean
    originalSize?: number
  }
}

export interface UploadProgress {
  fileId: string
  progress: number
  uploaded: number
  total: number
  stage: 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

export interface FileValidation {
  isValid: boolean
  error?: string
  warnings?: string[]
}

export interface FileUploadConfig {
  maxFileSize: number
  allowedTypes: string[]
  maxFiles: number
  requireAuth: boolean
  compression: {
    enabled: boolean
    quality: number
    maxWidth?: number
    maxHeight?: number
  }
}

// Estados extendidos de mensaje con archivos
export type MessageStatusExtended = 
  | 'pending'      // Mensaje en cola
  | 'uploading'    // Archivos subiendo
  | 'processing'   // Archivos procesando
  | 'sent'         // Enviado
  | 'delivered'    // Entregado
  | 'read'         // Leído
  | 'failed'       // Falló
  | 'cancelled'    // Cancelado

// Tipos de archivo soportados
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
] as const

export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime'
] as const

export const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg'
] as const

export const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
] as const

export type SupportedImageType = typeof SUPPORTED_IMAGE_TYPES[number]
export type SupportedVideoType = typeof SUPPORTED_VIDEO_TYPES[number]
export type SupportedAudioType = typeof SUPPORTED_AUDIO_TYPES[number]
export type SupportedDocumentType = typeof SUPPORTED_DOCUMENT_TYPES[number]

export type SupportedFileType = 
  | SupportedImageType 
  | SupportedVideoType 
  | SupportedAudioType 
  | SupportedDocumentType
