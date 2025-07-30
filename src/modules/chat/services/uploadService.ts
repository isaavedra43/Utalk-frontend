// Servicio de subida de archivos multimedia
import { apiClient } from '@/services/apiClient'
import { logger } from '@/lib/logger'

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
    console.log('[UPLOAD-SERVICE] Starting file upload:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentage)
        }
      }
    })

    console.log('[UPLOAD-SERVICE] File uploaded successfully:', response)
    logger.success('File uploaded successfully', { fileName: file.name }, 'file_upload_success')

    return response

  } catch (error) {
    console.error('[UPLOAD-SERVICE] Error uploading file:', error)
    logger.error('Failed to upload file', { fileName: file.name, error }, 'file_upload_error')
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
