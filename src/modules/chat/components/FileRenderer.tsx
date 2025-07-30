// Componente para renderizar archivos multimedia
import { useState, useRef, useEffect } from 'react'
import { Download, FileText, FileAudio, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { CanonicalFileAttachment } from '@/types/canonical'

interface FileRendererProps {
  file: CanonicalFileAttachment
  className?: string
}

// ✅ Utilidades para archivos
const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('[FILE-RENDERER] Error downloading file:', error)
  }
}

const getImagePreviewUrl = (url: string, size: 'small' | 'medium' | 'large' = 'medium') => {
  // Para Firebase Storage, podemos agregar parámetros de tamaño
  const sizes = {
    small: 'w=150&h=150',
    medium: 'w=300&h=300', 
    large: 'w=600&h=600'
  }
  
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${sizes[size]}`
}

export function FileRenderer({ file, className = '' }: FileRendererProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showPreview, setShowPreview] = useState(false)

  // ✅ Formatear tiempo
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  // ✅ Manejar descarga
  const handleDownload = () => {
    downloadFile(file.url, file.filename)
  }

  // ✅ Manejar preview de imagen
  const handleImagePreview = () => {
    setShowPreview(true)
  }

  // ✅ Renderizar por categoría
  const renderByCategory = () => {
    switch (file.category) {
      case 'image':
        return (
          <div className="space-y-2">
            <div className="relative group">
              <img
                src={getImagePreviewUrl(file.url, 'medium')}
                alt={file.filename}
                className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleImagePreview}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{file.filename}</span>
              <span>{formatFileSize(file.size)}</span>
            </div>
          </div>
        )

      case 'video':
        return (
          <div className="space-y-2">
            <video
              src={file.url}
              controls
              className="max-w-full h-auto rounded-lg"
              onLoadedMetadata={(e) => {
                const video = e.target as HTMLVideoElement
                setDuration(video.duration)
              }}
              onTimeUpdate={(e) => {
                const video = e.target as HTMLVideoElement
                setCurrentTime(video.currentTime)
              }}
            />
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{file.filename}</span>
              <span>{formatFileSize(file.size)}</span>
            </div>
          </div>
        )

      case 'audio':
        return (
          <div className="space-y-2">
            <audio
              src={file.url}
              controls
              className="w-full"
              onLoadedMetadata={(e) => {
                const audio = e.target as HTMLAudioElement
                setDuration(audio.duration)
              }}
              onTimeUpdate={(e) => {
                const audio = e.target as HTMLAudioElement
                setCurrentTime(audio.currentTime)
              }}
            />
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{file.filename}</span>
              <span>{formatFileSize(file.size)}</span>
            </div>
          </div>
        )

      case 'document':
      default:
        return (
          <Card className="p-4">
            <CardContent className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {file.filename}
                </h4>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {file.mimeType}
                </p>
              </div>
              
              <Button
                onClick={handleDownload}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Download className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className={className}>
      {renderByCategory()}
      
      {/* Modal de preview para imágenes */}
      {showPreview && file.category === 'image' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-4xl">
            <img
              src={file.url}
              alt={file.filename}
              className="max-w-full max-h-full object-contain"
            />
            <Button
              onClick={() => setShowPreview(false)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-white bg-opacity-90"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileRenderer
