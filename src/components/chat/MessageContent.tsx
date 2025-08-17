import React, { useState } from 'react';
import { Download, Play, Pause, Volume2 } from 'lucide-react';
import type { Message } from '../../types';
import { fileUploadService } from '../../services/fileUpload';
import { useAuthenticatedImage } from '../../hooks/useAuthenticatedImage';
import { useAuthenticatedMedia } from '../../hooks/useAuthenticatedMedia';

interface MessageContentProps {
  message: Message;
}

export const MessageContent: React.FC<MessageContentProps> = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Función para convertir URLs de Twilio a URLs del proxy del backend
  const getProxiedUrl = (url: string): string => {
    // Detectar si es una URL de Twilio
    if (url.includes('api.twilio.com')) {
      // Extraer el SID del mensaje y el SID del media de la URL
      const messageMatch = url.match(/Messages\/([^/]+)/);
      const mediaMatch = url.match(/Media\/([^/]+)/);
      
      if (messageMatch && mediaMatch) {
        const messageSid = messageMatch[1];
        const mediaSid = mediaMatch[1];
        
        // Construir URL del proxy del backend
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://utalk-backend-production.up.railway.app';
        return `${backendUrl}/api/media/proxy?messageSid=${messageSid}&mediaSid=${mediaSid}`;
      }
    }
    
    // Si no es Twilio, devolver la URL original
    return url;
  };

  // Obtener la URL autenticada para imágenes
  const imageUrl = message.type === 'image' ? getProxiedUrl(message.content) : '';
  const { imageUrl: authenticatedUrl, isLoading: imageLoading, error: imageError } = useAuthenticatedImage(imageUrl);

  // Obtener URLs autenticadas para otros tipos de media
  const audioUrl = (message.type === 'audio' || message.type === 'voice') ? getProxiedUrl(message.content) : '';
  const { mediaUrl: authenticatedAudioUrl, isLoading: audioLoading, error: audioError } = useAuthenticatedMedia(audioUrl, 'audio');

  const videoUrl = message.type === 'video' ? getProxiedUrl(message.content) : '';
  const { mediaUrl: authenticatedVideoUrl, isLoading: videoLoading, error: videoError } = useAuthenticatedMedia(videoUrl, 'video');

  const documentUrl = message.type === 'document' ? getProxiedUrl(message.content) : '';
  const { mediaUrl: authenticatedDocumentUrl, isLoading: documentLoading, error: documentError } = useAuthenticatedMedia(documentUrl, 'document');

  const stickerUrl = message.type === 'sticker' ? getProxiedUrl(message.content) : '';
  const { mediaUrl: authenticatedStickerUrl, isLoading: stickerLoading, error: stickerError } = useAuthenticatedMedia(stickerUrl, 'image');

  const handleAudioPlay = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    
    // Usar URL autenticada según el tipo de media
    let downloadUrl = '';
    switch (message.type) {
      case 'image':
        downloadUrl = authenticatedUrl || getProxiedUrl(message.content);
        break;
      case 'audio':
      case 'voice':
        downloadUrl = authenticatedAudioUrl || getProxiedUrl(message.content);
        break;
      case 'video':
        downloadUrl = authenticatedVideoUrl || getProxiedUrl(message.content);
        break;
      case 'document':
        downloadUrl = authenticatedDocumentUrl || getProxiedUrl(message.content);
        break;
      default:
        downloadUrl = getProxiedUrl(message.content);
    }
    
    link.href = downloadUrl;
    link.download = message.metadata.fileName || 'archivo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTextContent = () => (
    <p className="message-content whitespace-pre-wrap text-center">{message.content}</p>
  );

  const renderImageContent = () => {
    if (imageLoading) {
      return (
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    if (imageError || !authenticatedUrl) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">Error al cargar la imagen: {imageError}</p>
        </div>
      );
    }
    
    return (
      <div className="relative group">
        <img 
          src={authenticatedUrl} 
          alt="Imagen" 
          className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(authenticatedUrl, '_blank')}
          onError={(e) => {
            // Fallback si la imagen no carga
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMDBDNjAgODguOTU0MyA2OC45NTQzIDgwIDgwIDgwQzgxLjA5NDUgODAgODIuMTY4OSA4MC4wMzQ3IDgzLjIyMjcgODAuMTA0MUM4NC4yNzY1IDgwLjE3MzUgODUuMzA5OSA4MC4yODc5IDg2LjMyMjMgODAuNDQ3M0M4Ny4zMzQ3IDgwLjYwNjcgODguMzI2MSA4MC44MTA5IDg5LjI5NjUgODEuMDU5OEM5MC4yNjY5IDgxLjMwODcgOTEuMjE2MyA4MS42MDE5IDkyLjE0NDcgODIuMDM5M0M5My4wNzMxIDgyLjQ3NjcgOTMuOTgwNSA4Mi45NTc5IDk0Ljg2NjkgODMuNDgyN0M5NS43NTMzIDg0LjAwNzUgOTYuNjE4NyA4NC41NzU5IDk3LjQ2MjEgODUuMTg3OEM5OC4zMDU1IDg1Ljc5OTcgOTkuMTI3OSA4Ni40NTQ5IDk5LjkyOTMgODcuMTUzNEMxMDAuNzMwNyA4Ny44NTE5IDEwMS41MTEyIDg4LjU5MzUgMTAyLjI2MDUgODkuMzY3OEMxMDMuMDA5OSA5MC4xNDIxIDEwMy43MzgzIDkwLjk1ODUgMTA0LjQ0NTcgOTEuODE2N0MxMDUuMTUzMSA5Mi42NzQ5IDEwNS44Mzk1IDkzLjU3NDUgMTA2LjUwNDkgOTQuNTE1NEMxMDcuMTcwMyA5NS40NTYzIDEwNy44MTQ3IDk2LjQzODIgMTA4LjQzODEgOTcuNDYwOEMxMDkuMDYxNSA5OC40ODM0IDEwOS42NjM5IDk5LjU0NjIgMTEwLjI0NTMgMTAwLjY0ODlDMTEwLjgyNjcgMTAxLjc1MTYgMTExLjM4NzEgMTAyLjg5NDEgMTExLjkyNjUgMTA0LjA3NjFDMTEyLjQ2NTkgMTA1LjI1ODEgMTEyLjk4NDMgMTA2LjQ3OTcgMTEzLjQ4MTcgMTA3Ljc0MDdDMTEzLjk3OTEgMTA5LjAwMTcgMTE0LjQ1NTUgMTEwLjMwMTEgMTE0LjkxMDkgMTExLjYzODdDMTE1LjM2NjMgMTEyLjk3NjMgMTE1Ljc5OTcgMTE0LjM1MTkgMTE2LjIxMjEgMTE1Ljc2NTNDMTE2LjYyNDUgMTE3LjE3ODcgMTE3LjAxNTkgMTE4LjYzMDEgMTE3LjM4NjMgMTIwLjEyMDNDMTE3Ljc1NjcgMTIxLjYxMDUgMTE4LjEwNjEgMTIzLjEzODcgMTE4LjQzNDUgMTI0LjcwNTdDMTE4Ljc2MjkgMTI2LjI3MjcgMTE5LjA3MDMgMTI3Ljg3ODUgMTE5LjM1NjcgMTI5LjUyM0MxMTkuNjQzMSAxMzEuMTY3NSAxMTkuOTA4NSAxMzIuODQwNyAxMjAuMTUyOSAxMzQuNTQyN0MxMjAuMzk3MyAxMzYuMjQ0NyAxMjAuNjIwNyAxMzcuOTc1NSAxMjAuODIzMSAxMzkuNzM1MUMxMjEuMDI1NSAxNDEuNDk0NyAxMjEuMjA2OSAxNDMuMjgzOSAxMjEuMzY3MyAxNDUuMTAzN0MxMjEuNTI3NyAxNDYuOTIzNSAxMjEuNjY3MSAxNDguNzcyOSAxMjEuNzg1NSAxNTAuNjQxOUMxMjEuOTAzOSAxNTIuNTExIDEyMi4wMDEzIDE1NC40MDg3IDEyMi4wNzc3IDE1Ni4zMzQ5QzEyMi4xNTQxIDE1OC4yNjExIDEyMi4yMDk1IDE2MC4yMTU5IDEyMi4yNDM5IDE2Mi4xOTgzQzEyMi4yNzgzIDE2NC4xODA3IDEyMi4yOTE3IDE2Ni4xODk3IDEyMi4yODQxIDE2OC4yMjUzQzEyMi4yNzY1IDE3MC4yNjA5IDEyMi4yNDc5IDE3Mi4zMjMxIDEyMi4xOTgzIDE3NC40MTE5QzEyMi4xNDg3IDE3Ni40OTk5IDEyMi4wNzgxIDE3OC42MTQ1IDEyMS45ODY1IDE4MC43NTU3QzEyMS44OTQ5IDE4Mi44OTY5IDEyMS43ODIzIDE4NS4wNjQ3IDEyMS42NDg3IDE4Ny4yNTkxQzEyMS41MTUxIDE4OS40NTM1IDEyMS4zNjA1IDE5MS42NzQ1IDEyMS4xODQ5IDE5My45MjExQzEyMS4wMDkzIDE5Ni4xNjc3IDEyMC44MTI3IDE5OC40MzA5IDEyMC41OTUxIDIwMC43MjA3QzEyMC4zNzc1IDIwMy4wMTA1IDEyMC4xMzg5IDIwNS4zMjY5IDExOS44NzkzIDIwNy42Njk5QzExOS42MTk3IDIwOS45OTk5IDExOS4zMzkxIDIxMi4zNTY1IDExOS4wMzc1IDIxNC43Mzk3QzExOC43MzU5IDIxNy4xMjI5IDExOC40MTMzIDIxOS41MzI3IDExOC4wNjk3IDIyMS45NjkxQzExOC43MjU5IDIyMS45NjkxIDExOS4zODIxIDIyMS45NjkxIDEyMC4wMzgzIDIyMS45NjkxQzEyMC42OTQ1IDIyMS45NjkxIDEyMS4zNTA3IDIyMS45NjkxIDEyMi4wMDY5IDIyMS45NjkxQzEyMi42NjMxIDIyMS45NjkxIDEyMy4zMTkzIDIyMS45NjkxIDEyMy45NzU1IDIyMS45NjkxQzEyNC42MzE3IDIyMS45NjkxIDEyNS4yODc5IDIyMS45NjkxIDEyNS45NDQxIDIyMS45NjkxQzEyNi42MDAzIDIyMS45NjkxIDEyNy4yNTY1IDIyMS45NjkxIDEyNy45MTI3IDIyMS45NjkxQzEyOC41Njg5IDIyMS45NjkxIDEyOS4yMjUxIDIyMS45NjkxIDEyOS44ODEzIDIyMS45NjkxQzEzMC41Mzc1IDIyMS45NjkxIDEzMS4xOTM3IDIyMS45NjkxIDEzMS44NDk5IDIyMS45NjkxQzEzMi41MDYxIDIyMS45NjkxIDEzMy4xNjIzIDIyMS45NjkxIDMzLjgxODUgMjIxLjk2OTFDMTM0LjQ3NDcgMjIxLjk2OTEgMTM1LjEzMDkgMjIxLjk2OTEgMTM1Ljc4NzEgMjIxLjk2OTFDMTM2LjQ0MzMgMjIxLjk2OTEgMTM3LjA5OTUgMjIxLjk2OTFDMTM3Ljc1NTcgMjIxLjk2OTFDMTM4LjQxMTkgMjIxLjk2OTFDMTM5LjA2ODEgMjIxLjk2OTFDMTM5LjcyNDMgMjIxLjk2OTFDMTQwLjM4MDUgMjIxLjk2OTFDMTQxLjAzNjcgMjIxLjk2OTFDMTQxLjY5MjkgMjIxLjk2OTFDMTQyLjM0OTEgMjIxLjk2OTFDMTQzLjAwNTMgMjIxLjk2OTFDMTQzLjY2MTUgMjIxLjk2OTFDMTQ0LjMxNzcgMjIxLjk2OTFDMTQ0Ljk3MzkgMjIxLjk2OTFDMTQ1LjYzMDEgMjIxLjk2OTFDMTQ2LjI4NjMgMjIxLjk2OTFDMTQ2Ljk0MjUgMjIxLjk2OTFDMTQ3LjU5ODcgMjIxLjk2OTFDMTQ4LjI1NDkgMjIxLjk2OTFDMTQ4LjkxMTEgMjIxLjk2OTFDMTQ5LjU2NzMgMjIxLjk2OTFDMTUwLjIyMzUgMjIxLjk2OTFDMTUwLjg3OTcgMjIxLjk2OTFDMTUxLjUzNTkgMjIxLjk2OTFDMTUyLjE5MjEgMjIxLjk2OTFDMTUyLjg0ODMgMjIxLjk2OTFDMTUzLjUwNDUgMjIxLjk2OTFDMTU0LjE2MDcgMjIxLjk2OTFDMTU0LjgxNjkgMjIxLjk2OTFDMTU1LjQ3MzEgMjIxLjk2OTFDMTU2LjEyOTIgMjIxLjk2OTFDMTU2Ljc4NTQgMjIxLjk2OTFDMTU3LjQ0MTYgMjIxLjk2OTFDMTU4LjA5NzggMjIxLjk2OTFDMTU4Ljc1NCAyMjEuOTY5MSAxNTkuNDEwMiAyMjEuOTY5MUMxNjAuMDY2NCAyMjEuOTY5MSAxNjAuNzIyNiAyMjEuOTY5MSAxNjEuMzc4OCAyMjEuOTY5MUwxNjEuMzc4OCAyMjEuOTY5MVoiIGZpbGw9IiNEM0Q0RjYiLz4KPC9zdmc+';
            target.alt = 'Imagen no disponible';
          }}
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDownload}
            className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
            title="Descargar imagen"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderDocumentContent = () => {
    const fileName = message.metadata.fileName || 'Documento';
    const fileSize = message.metadata.fileSize ? fileUploadService.formatFileSize(message.metadata.fileSize) : '';
    const fileIcon = fileUploadService.getFileIcon(fileName);

    if (documentLoading) {
      return (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{fileName}</p>
            <p className="text-xs text-gray-500">Cargando...</p>
          </div>
        </div>
      );
    }

    if (documentError) {
      return (
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl">📄</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">{fileName}</p>
            <p className="text-xs text-red-600">Error: {documentError}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
        <div className="text-2xl">{fileIcon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
          {fileSize && <p className="text-xs text-gray-500">{fileSize}</p>}
        </div>
        <button
          onClick={handleDownload}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          title="Descargar documento"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderAudioContent = () => {
    const fileName = message.metadata.fileName || 'Audio';
    const duration = message.metadata.duration || 0;
    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (audioLoading) {
      return (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{fileName}</p>
            <p className="text-xs text-gray-500">Cargando...</p>
          </div>
        </div>
      );
    }

    if (audioError) {
      return (
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl">🎵</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">{fileName}</p>
            <p className="text-xs text-red-600">Error: {audioError}</p>
          </div>
        </div>
      );
    }

    // Usar URL autenticada para audio
    const audioUrl = authenticatedAudioUrl || getProxiedUrl(message.content);

    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
        <button
          onClick={handleAudioPlay}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{fileName}</p>
          <p className="text-xs text-gray-500">{formatDuration(duration)}</p>
        </div>
        <Volume2 className="w-4 h-4 text-gray-400" />
        <audio
          ref={(el) => setAudioElement(el)}
          src={audioUrl}
          onEnded={handleAudioEnded}
          preload="metadata"
        />
      </div>
    );
  };

  const renderVideoContent = () => {
    const fileName = message.metadata.fileName || 'Video';
    const duration = message.metadata.duration || 0;
    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (videoLoading) {
      return (
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (videoError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">Error al cargar el video: {videoError}</p>
        </div>
      );
    }

    // Usar URL autenticada para video
    const videoUrl = authenticatedVideoUrl || getProxiedUrl(message.content);

    return (
      <div className="relative group">
        <video 
          src={videoUrl}
          poster={message.metadata.thumbnail}
          className="max-w-full max-h-64 rounded-lg"
          controls
          preload="metadata"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDownload}
            className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
            title="Descargar video"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">{fileName} • {formatDuration(duration)}</p>
      </div>
    );
  };

  const renderLocationContent = () => {
    try {
      const locationData = JSON.parse(message.content);
      return (
        <div className="p-3 bg-gray-50 rounded-lg border">
          <p className="text-sm font-medium text-gray-900 mb-1">📍 Ubicación</p>
          {locationData.name && <p className="text-xs text-gray-600">{locationData.name}</p>}
          {locationData.address && <p className="text-xs text-gray-600">{locationData.address}</p>}
          <button
            onClick={() => window.open(`https://maps.google.com/?q=${locationData.latitude},${locationData.longitude}`, '_blank')}
            className="text-xs text-blue-500 hover:text-blue-700 mt-1"
          >
            Ver en Google Maps
          </button>
        </div>
      );
    } catch {
      return renderTextContent();
    }
  };

  const renderStickerContent = () => {
    if (stickerLoading) {
      return (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (stickerError) {
      return (
        <div className="flex justify-center">
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600">Error al cargar sticker</p>
          </div>
        </div>
      );
    }

    // Usar URL autenticada para stickers
    const finalStickerUrl = authenticatedStickerUrl || getProxiedUrl(message.content);
    
    return (
      <div className="flex justify-center">
        <img 
          src={finalStickerUrl} 
          alt="Sticker" 
          className="max-w-32 max-h-32 rounded-lg"
          onError={(e) => {
            // Fallback si la imagen no carga
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02NCA2NEM2NCA1Ny4zNzIgNTcuMzcyIDUwIDUwIDUwQzQyLjYyOCA1MCAzNiA1Ny4zNzIgMzYgNjVDMzYgNzIuNjI4IDQyLjYyOCA4MCA1MCA4MEM1Ny4zNzIgODAgNjQgNzIuNjI4IDY0IDY0WiIgZmlsbD0iI0QzRDRGQiIvPgo8L3N2Zz4=';
            target.alt = 'Sticker no disponible';
          }}
        />
      </div>
    );
  };

  // Renderizar contenido basado en el tipo
  switch (message.type) {
    case 'image':
      return renderImageContent();
    case 'document':
      return renderDocumentContent();
    case 'audio':
    case 'voice':
      return renderAudioContent();
    case 'video':
      return renderVideoContent();
    case 'location':
      return renderLocationContent();
    case 'sticker':
      return renderStickerContent();
    default:
      return renderTextContent();
  }
}; 