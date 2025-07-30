// Componente de carga de archivos con progreso y validación mejorada
import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Video, 
  FileAudio, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { uploadService } from '../services/uploadService'

// ✅ TIPOS DE ARCHIVO PERMITIDOS
const ALLOWED_FILE_TYPES: Record<string, 'image' | 'video' | 'audio' | 'document'> = {
  // Imágenes
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  
  // Videos
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/ogg': 'video',
  
  // Audio
  'audio/mp3': 'audio',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/webm': 'audio',
  'audio/m4a': 'audio',
  
  // Documentos
  'application/pdf': 'document',
  'text/plain': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document'
}

// ✅ LÍMITES DE TAMAÑO POR TIPO
const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024,   // 10MB
  video: 100 * 1024 * 1024,  // 100MB
  audio: 50 * 1024 * 1024,   // 50MB
  document: 25 * 1024 * 1024 // 25MB
}

interface FileUploadItem {
  id: string
  file: File
  category: 'image' | 'video' | 'audio' | 'document'
  preview?: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  uploadedData?: any
}

interface FileUploadProps {
  onFilesUploaded: (files: any[]) => void
  conversationId: string
  maxFiles?: number
  disabled?: boolean
  className?: string
}

export function FileUpload({ 
  onFilesUploaded, 
  conversationId, 
  maxFiles = 5,
  disabled = false,
  className = '' 
}: FileUploadProps) {
  const [files, setFiles] = useState<FileUploadItem[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ✅ Formatear tamaño de archivo
  const formatFileSize = useCallback((bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }, [])

  // ✅ Validar archivo
  const validateFile = useCallback((file: File): { valid: boolean; error?: string; category?: string } => {
    // Verificar tipo
    const category = ALLOWED_FILE_TYPES[file.type]
    if (!category) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido: ${file.type}`
      }
    }

    // Verificar tamaño
    const maxSize = MAX_FILE_SIZES[category]
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Archivo demasiado grande. Máximo ${formatFileSize(maxSize)} para ${category}`
      }
    }

    return { valid: true, category }
  }, [formatFileSize])

  // ✅ Crear preview para imágenes
  const createPreview = useCallback((file: File, category: string): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (category === 'image') {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => resolve(undefined)
        reader.readAsDataURL(file)
      } else {
        resolve(undefined)
      }
    })
  }, [])

  // ✅ Agregar archivos
  const addFiles = useCallback(async (newFiles: File[]) => {
    if (disabled || isUploading) return

    const validatedFiles: FileUploadItem[] = []

    for (const file of newFiles) {
      // Verificar límite de archivos
      if (files.length + validatedFiles.length >= maxFiles) {
        console.warn(`[FILE-UPLOAD] Maximum ${maxFiles} files allowed`)
        break
      }

      // Validar archivo
      const validation = validateFile(file)
      if (!validation.valid) {
        console.error('[FILE-UPLOAD] Invalid file:', validation.error)
        continue
      }

      // Crear preview
      const preview = await createPreview(file, validation.category!)

      const fileItem: FileUploadItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        category: validation.category as any,
        preview,
        progress: 0,
        status: 'pending'
      }

      validatedFiles.push(fileItem)
    }

    if (validatedFiles.length > 0) {
      setFiles(prev => [...prev, ...validatedFiles])
      console.log('[FILE-UPLOAD] Added files:', validatedFiles.length)
    }
  }, [files.length, maxFiles, disabled, isUploading, validateFile, createPreview])

  // ✅ Remover archivo
  const removeFile = useCallback((fileId: string) => {
    if (isUploading) return
    
    setFiles(prev => prev.filter(f => f.id !== fileId))
    console.log('[FILE-UPLOAD] Removed file:', fileId)
  }, [isUploading])

  // ✅ Subir todos los archivos
  const uploadFiles = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)
    console.log('[FILE-UPLOAD] Starting upload of', pendingFiles.length, 'files')

    const uploadedFiles: any[] = []

    for (const fileItem of pendingFiles) {
      try {
        // Actualizar estado a "uploading"
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'uploading' as const, progress: 0 }
            : f
        ))

                 // Subir archivo
         const uploadedData = await uploadService.uploadFile(
           fileItem.file,
           (progress) => {
             setFiles(prev => prev.map(f => 
               f.id === fileItem.id 
                 ? { ...f, progress }
                 : f
             ))
           }
         )

        // Marcar como completado
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'completed' as const, progress: 100, uploadedData }
            : f
        ))

        uploadedFiles.push(uploadedData)
        console.log('[FILE-UPLOAD] File uploaded successfully:', uploadedData)

      } catch (error) {
        console.error('[FILE-UPLOAD] Error uploading file:', error)
        
        // Marcar como error
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { 
                ...f, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : 'Error desconocido'
              }
            : f
        ))
      }
    }

    setIsUploading(false)

    // Llamar callback con archivos subidos
    if (uploadedFiles.length > 0) {
      onFilesUploaded(uploadedFiles)
      
      // Limpiar archivos completados después de un delay
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.status !== 'completed'))
      }, 2000)
    }
  }, [files, conversationId, onFilesUploaded])

  // ✅ Manejar selección de archivos
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles)
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [addFiles])

  // ✅ Manejar drag & drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles)
    }
  }, [addFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  // ✅ Obtener icono por categoría
  const getFileIcon = (category: string) => {
    switch (category) {
      case 'image': return <Image className="w-5 h-5 text-blue-500" />
      case 'video': return <Video className="w-5 h-5 text-purple-500" />
      case 'audio': return <FileAudio className="w-5 h-5 text-green-500" />
      case 'document': return <FileText className="w-5 h-5 text-orange-500" />
      default: return <File className="w-5 h-5 text-gray-500" />
    }
  }

  // ✅ Obtener icono de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const hasPendingFiles = files.some(f => f.status === 'pending')

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">
          Arrastra archivos aquí o haz clic para seleccionar
        </p>
        <p className="text-xs text-gray-500">
          Máximo {maxFiles} archivos • Imágenes, videos, audios y documentos
        </p>
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={Object.keys(ALLOWED_FILE_TYPES).join(',')}
        onChange={handleFileSelect}
        disabled={disabled}
        className="hidden"
      />

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileItem) => (
            <Card key={fileItem.id} className="p-3">
              <div className="flex items-center gap-3">
                {/* Preview o icono */}
                <div className="flex-shrink-0">
                  {fileItem.preview ? (
                    <img 
                      src={fileItem.preview} 
                      alt="Preview" 
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(fileItem.category)
                  )}
                </div>

                {/* Info del archivo */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileItem.file.size)} • {fileItem.category}
                  </p>
                  
                  {/* Error */}
                  {fileItem.error && (
                    <p className="text-xs text-red-500 mt-1">
                      {fileItem.error}
                    </p>
                  )}
                </div>

                {/* Progreso */}
                {fileItem.status === 'uploading' && (
                  <div className="flex-1 max-w-32">
                    <Progress value={fileItem.progress} className="h-2" />
                    <p className="text-xs text-center mt-1 text-gray-500">
                      {fileItem.progress}%
                    </p>
                  </div>
                )}

                {/* Estado */}
                <div className="flex items-center gap-2">
                  {getStatusIcon(fileItem.status)}
                  
                  {/* Botón eliminar */}
                  {!isUploading && fileItem.status !== 'completed' && (
                    <Button
                      onClick={() => removeFile(fileItem.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Botón subir */}
      {hasPendingFiles && (
        <Button
          onClick={uploadFiles}
          disabled={isUploading || disabled}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subiendo archivos...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Subir {files.filter(f => f.status === 'pending').length} archivo(s)
            </>
          )}
        </Button>
      )}
    </div>
  )
}

// ✅ Hook personalizado para usar FileUpload
export function useFileUpload() {
  const [isOpen, setIsOpen] = useState(false)
  
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen)
  }
}

export default FileUpload
