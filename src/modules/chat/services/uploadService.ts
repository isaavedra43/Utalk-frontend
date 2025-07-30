// Servicio de subida de archivos multimedia
import { apiClient } from '@/services/apiClient'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'
import type { 
  CanonicalFileAttachment,
  ValidationResult 
} from '@/types/canonical'

// ✅ CONTEXTO PARA LOGGING
const uploadContext = getComponentContext('uploadService')

// ✅ TIPO PARA ARCHIVO DE SUBIDA
interface UploadFile {
  file: File
  conversationId?: string
}

// ✅ TIPO PARA PROGRESO DE SUBIDA
interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// ✅ SUBIR UN ARCHIVO
export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<any> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response?.success && response.data?.url) {
      logger.success('UPLOAD', 'File uploaded successfully', createLogContext({
        ...uploadContext,
        data: { fileName: file.name, fileSize: file.size, url: response.data.url }
      }))
      return response.data
    } else {
      throw new Error('Upload failed: Invalid response')
    }
  } catch (error) {
    logger.error('API', '💥 Failed to upload file', createLogContext({
      ...uploadContext,
      error: error as Error,
      data: { fileName: file.name, fileSize: file.size }
    }))
    throw error
  }
}

// ✅ SUBIR MÚLTIPLES ARCHIVOS
export async function uploadMultipleFiles(
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<any[]> {
  const uploadPromises = files.map(async (file, index) => {
    return uploadFile(file, (progress) => {
      if (onProgress) {
        onProgress(index, progress)
      }
    })
  })

  return Promise.all(uploadPromises)
}

// ✅ SERVICIO EXPORTADO
export const uploadService = {
  uploadFile,
  uploadMultipleFiles
}
