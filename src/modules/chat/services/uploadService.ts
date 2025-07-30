// Servicio de upload de archivos con progreso
import { apiClient } from '@/services/apiClient'
import { logger } from '@/lib/logger'
import type { FileWithPreview } from '../components/FileUpload'

export interface UploadResponse {
  id: string
  url: string
  filename: string
  size: number
  mimeType: string
  category: string
}

export interface UploadProgress {
  fileId: string
  progress: number
  uploaded: number
  total: number
}

class UploadService {
  // ✅ Subir archivo individual con progreso
  async uploadFile(
    file: FileWithPreview,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    try {
      console.log('[UPLOAD] Starting upload for file:', file.name)
      logger.info('Starting file upload', {
        filename: file.name,
        size: file.size,
        category: file.category
      }, 'file_upload_start')

      // Crear FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', file.category)
      formData.append('filename', file.name)

      // Configurar XMLHttpRequest para progreso
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        // Handler de progreso
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = Math.round((e.loaded / e.total) * 100)
            onProgress({
              fileId: file.id,
              progress,
              uploaded: e.loaded,
              total: e.total
            })
            console.log(`[UPLOAD] Progress for ${file.name}: ${progress}%`)
          }
        })

        // Handler de éxito
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              console.log('[UPLOAD] Upload successful:', response)
              
              logger.success('File uploaded successfully', {
                filename: file.name,
                uploadId: response.id,
                url: response.url
              }, 'file_upload_success')
              
              resolve(response)
            } catch (error) {
              console.error('[UPLOAD] Error parsing response:', error)
              reject(new Error('Error parsing upload response'))
            }
          } else {
            console.error('[UPLOAD] Upload failed with status:', xhr.status)
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
          }
        })

        // Handler de error
        xhr.addEventListener('error', () => {
          console.error('[UPLOAD] Upload error')
          logger.error('File upload failed', {
            filename: file.name,
            error: 'Network error'
          }, 'file_upload_error')
          reject(new Error('Upload failed: Network error'))
        })

        // Handler de cancelación
        xhr.addEventListener('abort', () => {
          console.log('[UPLOAD] Upload cancelled')
          reject(new Error('Upload cancelled'))
        })

        // Configurar y enviar request
        const token = localStorage.getItem('auth_token')
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }

        xhr.open('POST', `${import.meta.env.VITE_API_URL}/api/media/upload`)
        xhr.send(formData)
      })

    } catch (error) {
      console.error('[UPLOAD] Error in uploadFile:', error)
      logger.error('File upload error', {
        filename: file.name,
        error
      }, 'file_upload_error')
      throw error
    }
  }

  // ✅ Subir múltiples archivos
  async uploadMultipleFiles(
    files: FileWithPreview[],
    onProgress?: (fileId: string, progress: UploadProgress) => void
  ): Promise<UploadResponse[]> {
    console.log('[UPLOAD] Starting multiple file upload:', files.length)
    
    const uploads = files.map(file => 
      this.uploadFile(file, (progress) => {
        if (onProgress) {
          onProgress(file.id, progress)
        }
      })
    )

    try {
      const results = await Promise.all(uploads)
      console.log('[UPLOAD] All files uploaded successfully')
      return results
    } catch (error) {
      console.error('[UPLOAD] Error uploading multiple files:', error)
      throw error
    }
  }

  // ✅ Enviar mensaje con archivos
  async sendMessageWithFiles(
    conversationId: string,
    content: string,
    files: UploadResponse[],
    senderEmail: string
  ): Promise<any> {
    try {
      console.log('[UPLOAD] Sending message with files:', {
        conversationId,
        content,
        filesCount: files.length
      })

      const response = await apiClient.post('/api/messages/send', {
        conversationId,
        content,
        type: 'file',
        senderEmail,
        attachments: files.map(file => ({
          id: file.id,
          url: file.url,
          filename: file.filename,
          size: file.size,
          mimeType: file.mimeType,
          category: file.category
        }))
      })

      logger.success('Message with files sent successfully', {
        conversationId,
        messageId: response.id,
        filesCount: files.length
      }, 'message_with_files_success')

      return response

    } catch (error) {
      console.error('[UPLOAD] Error sending message with files:', error)
      logger.error('Failed to send message with files', {
        conversationId,
        filesCount: files.length,
        error
      }, 'message_with_files_error')
      throw error
    }
  }

  // ✅ Descargar archivo
  async downloadFile(fileUrl: string, filename: string): Promise<void> {
    try {
      console.log('[UPLOAD] Downloading file:', filename)
      
      const response = await fetch(fileUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Crear enlace temporal para descarga
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      logger.success('File downloaded successfully', {
        filename,
        size: blob.size
      }, 'file_download_success')

    } catch (error) {
      console.error('[UPLOAD] Error downloading file:', error)
      logger.error('File download failed', {
        filename,
        fileUrl,
        error
      }, 'file_download_error')
      throw error
    }
  }

  // ✅ Obtener URL de preview para imágenes
  getImagePreviewUrl(fileUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    if (!fileUrl) return ''
    
    // Si el backend soporta thumbnails, agregar parámetros
    const url = new URL(fileUrl)
    url.searchParams.set('size', size)
    url.searchParams.set('format', 'webp') // Optimizar formato
    
    return url.toString()
  }

  // ✅ Validar URL de archivo
  isValidFileUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // ✅ Formatear tamaño de archivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // ✅ Obtener tipo de archivo por extensión
  getFileTypeFromUrl(url: string): 'image' | 'video' | 'audio' | 'document' | 'unknown' {
    const extension = url.split('.').pop()?.toLowerCase()
    
    if (!extension) return 'unknown'
    
    const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    const videoExts = ['mp4', 'webm', 'mov']
    const audioExts = ['mp3', 'wav', 'ogg']
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']
    
    if (imageExts.includes(extension)) return 'image'
    if (videoExts.includes(extension)) return 'video'
    if (audioExts.includes(extension)) return 'audio'
    if (docExts.includes(extension)) return 'document'
    
    return 'unknown'
  }
}

export const uploadService = new UploadService()
