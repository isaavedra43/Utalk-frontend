// Componente para renderizar archivos en mensajes tipo WhatsApp
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Play, Pause, FileText, Eye } from 'lucide-react'
import { uploadService } from '../services/uploadService'

interface FileAttachment {
  id: string
  url: string
  filename: string
  size: number
  mimeType: string
  category: 'image' | 'video' | 'audio' | 'document'
}

interface FileRendererProps {
  file: FileAttachment
  className?: string
}

export function FileRenderer({ file, className = '' }: FileRendererProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      setError(null)
      await uploadService.downloadFile(file.url, file.filename)
    } catch (error) {
      console.error('Error downloading file:', error)
      setError('Error al descargar el archivo')
    } finally {
      setIsDownloading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    return uploadService.formatFileSize(bytes)
  }

  // ✅ Renderizar imagen
  const renderImage = () => (
    <div className={`relative group ${className}`}>
      <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={uploadService.getImagePreviewUrl(file.url, 'medium')}
          alt={file.filename}
          className="max-w-sm max-h-64 object-cover cursor-pointer transition-transform hover:scale-105"
          onClick={() => setIsImageViewerOpen(true)}
          onError={() => setError('Error al cargar la imagen')}
        />
        
        {/* Overlay con acciones */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsImageViewerOpen(true)}
              className="bg-white bg-opacity-90 text-gray-900 hover:bg-opacity-100"
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-white bg-opacity-90 text-gray-900 hover:bg-opacity-100"
            >
              <Download className="w-4 h-4 mr-1" />
              {isDownloading ? 'Descargando...' : 'Descargar'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Info del archivo */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <p className="truncate">{file.filename}</p>
        <p>{formatFileSize(file.size)}</p>
      </div>

      {/* Modal de imagen */}
      {isImageViewerOpen && (
        <ImageViewer
          imageUrl={file.url}
          filename={file.filename}
          onClose={() => setIsImageViewerOpen(false)}
        />
      )}
    </div>
  )

  // ✅ Renderizar video
  const renderVideo = () => (
    <div className={`relative ${className}`}>
      <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        <video
          controls
          className="max-w-sm max-h-64"
          preload="metadata"
          onError={() => setError('Error al cargar el video')}
        >
          <source src={file.url} type={file.mimeType} />
          Tu navegador no soporta la reproducción de video.
        </video>
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p className="truncate max-w-40">{file.filename}</p>
          <p>{formatFileSize(file.size)}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

  // ✅ Renderizar audio
  const renderAudio = () => (
    <div className={`${className}`}>
      <AudioPlayer file={file} onDownload={handleDownload} isDownloading={isDownloading} />
    </div>
  )

  // ✅ Renderizar documento
  const renderDocument = () => {
    const getDocumentIcon = () => {
      const ext = file.filename.split('.').pop()?.toLowerCase()
      
      switch (ext) {
        case 'pdf':
          return '📄'
        case 'doc':
        case 'docx':
          return '📝'
        case 'xls':
        case 'xlsx':
          return '📊'
        case 'txt':
          return '📋'
        default:
          return '📄'
      }
    }

    return (
      <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border ${className}`}>
        <div className="flex items-center space-x-3">
          {/* Icono del documento */}
          <div className="text-2xl">{getDocumentIcon()}</div>
          
          {/* Info del documento */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {file.filename}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(file.size)} • {file.mimeType.split('/')[1]?.toUpperCase()}
            </p>
          </div>
          
          {/* Botón descargar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-shrink-0"
          >
            <Download className="w-4 h-4 mr-1" />
            {isDownloading ? 'Descargando...' : 'Descargar'}
          </Button>
        </div>
      </div>
    )
  }

  // ✅ Mostrar error si existe
  if (error) {
    return (
      <div className={`p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
        <div className="flex items-center text-red-700 dark:text-red-300">
          <FileText className="w-4 h-4 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    )
  }

  // ✅ Renderizar según tipo de archivo
  switch (file.category) {
    case 'image':
      return renderImage()
    case 'video':
      return renderVideo()
    case 'audio':
      return renderAudio()
    case 'document':
      return renderDocument()
    default:
      return renderDocument()
  }
}

// ✅ Componente de reproductor de audio
function AudioPlayer({ 
  file, 
  onDownload, 
  isDownloading 
}: { 
  file: FileAttachment
  onDownload: () => void
  isDownloading: boolean
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <audio
        ref={audioRef}
        src={file.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="flex items-center space-x-3">
        {/* Botón play/pause */}
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlay}
          className="flex-shrink-0"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        
        {/* Barra de progreso */}
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Botón descargar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDownload}
          disabled={isDownloading}
          className="flex-shrink-0"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Info del archivo */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <p className="truncate">{file.filename}</p>
        <p>{uploadService.formatFileSize(file.size)}</p>
      </div>
    </div>
  )
}

// ✅ Modal para ver imágenes en tamaño completo
function ImageViewer({ 
  imageUrl, 
  filename, 
  onClose 
}: { 
  imageUrl: string
  filename: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="relative max-w-5xl max-h-full">
        {/* Botón cerrar */}
        <Button
          variant="ghost"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
        >
          ✕
        </Button>
        
        {/* Imagen */}
        <img
          src={imageUrl}
          alt={filename}
          className="max-w-full max-h-full object-contain"
          onClick={onClose}
        />
        
        {/* Info */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
          <p className="text-sm">{filename}</p>
        </div>
      </div>
    </div>
  )
}
