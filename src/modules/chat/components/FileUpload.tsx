// Componente de subida de archivos con drag & drop tipo WhatsApp
import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { X, Image, Video, Music, FileText } from 'lucide-react'

// ✅ Tipos de archivo permitidos
export const ALLOWED_FILE_TYPES = {
  image: {
    mimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    maxSize: 10 * 1024 * 1024, // 10MB
    icon: Image,
    color: 'text-green-500'
  },
  video: {
    mimes: ['video/mp4', 'video/webm', 'video/quicktime'],
    extensions: ['.mp4', '.webm', '.mov'],
    maxSize: 50 * 1024 * 1024, // 50MB
    icon: Video,
    color: 'text-blue-500'
  },
  audio: {
    mimes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    extensions: ['.mp3', '.wav', '.ogg'],
    maxSize: 20 * 1024 * 1024, // 20MB
    icon: Music,
    color: 'text-purple-500'
  },
  document: {
    mimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
    maxSize: 25 * 1024 * 1024, // 25MB
    icon: FileText,
    color: 'text-orange-500'
  }
}

export interface FileWithPreview extends File {
  id: string
  preview?: string
  category: keyof typeof ALLOWED_FILE_TYPES
  uploadProgress?: number
  uploadError?: string
}

interface FileUploadProps {
  onFilesSelected: (files: FileWithPreview[]) => void
  onFileRemove: (fileId: string) => void
  selectedFiles: FileWithPreview[]
  maxFiles?: number
  disabled?: boolean
}

export function FileUpload({
  onFilesSelected,
  onFileRemove,
  selectedFiles,
  maxFiles = 5,
  disabled = false
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ✅ Detectar categoría de archivo
  const getFileCategory = (file: File): keyof typeof ALLOWED_FILE_TYPES | null => {
    for (const [category, config] of Object.entries(ALLOWED_FILE_TYPES)) {
      if (config.mimes.includes(file.type)) {
        return category as keyof typeof ALLOWED_FILE_TYPES
      }
    }
    return null
  }

  // ✅ Validar archivo
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const category = getFileCategory(file)
    
    if (!category) {
      return {
        isValid: false,
        error: `Tipo de archivo no permitido: ${file.type}`
      }
    }

    const config = ALLOWED_FILE_TYPES[category]
    
    if (file.size > config.maxSize) {
      const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1)
      return {
        isValid: false,
        error: `Archivo muy grande. Máximo ${maxSizeMB}MB para ${category}`
      }
    }

    return { isValid: true }
  }

  // ✅ Crear preview de archivo
  const createFilePreview = useCallback((file: File, category: keyof typeof ALLOWED_FILE_TYPES): Promise<string | undefined> => {
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

  // ✅ Procesar archivos seleccionados
  const processFiles = useCallback(async (fileList: FileList) => {
    const errors: string[] = []
    const validFiles: FileWithPreview[] = []

    // Verificar límite de archivos
    if (selectedFiles.length + fileList.length > maxFiles) {
      errors.push(`Máximo ${maxFiles} archivos permitidos`)
      setValidationErrors(errors)
      return
    }

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const validation = validateFile(file)
      
      if (!validation.isValid) {
        errors.push(validation.error!)
        continue
      }

      const category = getFileCategory(file)!
      const preview = await createFilePreview(file, category)

      const fileWithPreview: FileWithPreview = Object.assign(file, {
        id: `${Date.now()}-${i}-${file.name}`,
        preview,
        category,
        uploadProgress: 0
      })

      validFiles.push(fileWithPreview)
    }

    if (errors.length > 0) {
      setValidationErrors(errors)
      setTimeout(() => setValidationErrors([]), 5000)
    }

    if (validFiles.length > 0) {
      onFilesSelected([...selectedFiles, ...validFiles])
    }
  }, [selectedFiles, maxFiles, onFilesSelected, createFilePreview])

  // ✅ Handlers de drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFiles(files)
    }
  }, [disabled, processFiles])

  // ✅ Click handler
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  // ✅ Input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Reset input
    e.target.value = ''
  }, [processFiles])

  // ✅ Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // ✅ Renderizar preview de archivo
  const renderFilePreview = (file: FileWithPreview) => {
    const config = ALLOWED_FILE_TYPES[file.category]
    const Icon = config.icon

    return (
      <div
        key={file.id}
        className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm"
      >
        {/* Botón remover */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFileRemove(file.id)}
          className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
        >
          <X className="w-3 h-3" />
        </Button>

        {/* Contenido del archivo */}
        <div className="flex items-start space-x-3">
          {/* Preview/Icono */}
          <div className="flex-shrink-0">
            {file.preview ? (
              <img
                src={file.preview}
                alt={file.name}
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <div className={`w-12 h-12 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${config.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Info del archivo */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(file.size)} • {file.category}
            </p>
            
            {/* Barra de progreso */}
            {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${file.uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{file.uploadProgress}%</p>
              </div>
            )}

            {/* Error de upload */}
            {file.uploadError && (
              <p className="text-xs text-red-500 mt-1">{file.uploadError}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Área de drag & drop */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          className="hidden"
          accept={Object.values(ALLOWED_FILE_TYPES).flatMap(config => config.extensions).join(',')}
          disabled={disabled}
        />

        <div className="text-center">
          <div className="mx-auto w-12 h-12 mb-3 text-gray-400">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Arrastra archivos aquí o haz click para seleccionar
          </p>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Imágenes, videos, audios y documentos
          </p>
          
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Máximo {maxFiles} archivos • Hasta 50MB por archivo
          </p>
        </div>
      </div>

      {/* Errores de validación */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <X className="w-4 h-4 text-red-400 mt-0.5" />
            </div>
            <div className="ml-2">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                Error al subir archivos:
              </h4>
              <ul className="mt-1 text-xs text-red-700 dark:text-red-300 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Preview de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Archivos seleccionados ({selectedFiles.length})
          </h4>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {selectedFiles.map(renderFilePreview)}
          </div>
        </div>
      )}
    </div>
  )
}

// ✅ Hook para usar FileUpload
export function useFileUpload() {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const addFiles = useCallback((files: FileWithPreview[]) => {
    setSelectedFiles(prev => [...prev, ...files])
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId))
  }, [])

  const handleFilesSelected = useCallback((files: FileWithPreview[]) => {
    setSelectedFiles(files)
  }, [])

  const handleFileRemove = useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId))
  }, [])

  const clearFiles = useCallback(() => {
    setSelectedFiles([])
  }, [])

  const updateFileProgress = useCallback((fileId: string, progress: number) => {
    setSelectedFiles(prev => prev.map(file =>
      file.id === fileId ? { ...file, uploadProgress: progress } : file
    ))
    setUploadProgress(prev => ({ ...prev, [fileId]: progress }))
  }, [])

  const updateFileError = useCallback((fileId: string, error: string) => {
    setSelectedFiles(prev => prev.map(file =>
      file.id === fileId ? { ...file, uploadError: error } : file
    ))
  }, [])

  const uploadFiles = useCallback(async () => {
    if (selectedFiles.length === 0) return []

    setIsUploading(true)
    
    try {
      // Importar el servicio de upload dinámicamente
      const { uploadService } = await import('../services/uploadService')
      
      const uploadPromises = selectedFiles.map(async (file) => {
        try {
          const result = await uploadService.uploadFile(file, (progress) => {
            updateFileProgress(file.id, progress.progress)
          })
          
          return result
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error)
          updateFileError(file.id, 'Error al subir archivo')
          return null
        }
      })

      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter(result => result !== null)
      
      // Limpiar archivos después de subir
      setSelectedFiles([])
      setUploadProgress({})
      
      return successfulUploads
    } catch (error) {
      console.error('Error uploading files:', error)
      return []
    } finally {
      setIsUploading(false)
    }
  }, [selectedFiles, updateFileProgress, updateFileError])

  return {
    selectedFiles,
    addFiles,
    removeFile,
    handleFilesSelected,
    handleFileRemove,
    clearFiles,
    updateFileProgress,
    updateFileError,
    uploadFiles,
    isUploading,
    uploadProgress
  }
}
