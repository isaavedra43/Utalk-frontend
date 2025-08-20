import React, { useEffect, useRef, useState } from 'react';
import { infoLog } from '../../config/logger';
import { Download, Volume2, Play, Pause } from 'lucide-react';
import type { Message } from '../../types';
import { fileUploadService } from '../../services/fileUpload';
import { useAuthenticatedImage } from '../../hooks/useAuthenticatedImage';
import { useAuthenticatedMedia } from '../../hooks/useAuthenticatedMedia';

interface MessageContentProps {
  message: Message;
}

export const MessageContent: React.FC<MessageContentProps> = ({ message }) => {
  // Función para convertir URLs de Twilio a URLs del proxy del backend
  const getProxiedUrl = (url: string): string => {
    if (url.includes('api.twilio.com')) {
      const messageMatch = url.match(/Messages\/([^/]+)/);
      const mediaMatch = url.match(/Media\/([^/]+)/);
      if (messageMatch && mediaMatch) {
        const messageSid = messageMatch[1];
        const mediaSid = mediaMatch[1];
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://utalk-backend-production.up.railway.app';
        return `${backendUrl}/media/proxy-public?messageSid=${messageSid}&mediaSid=${mediaSid}`;
      }
    }
    return url;
  };

  // Imagen
  const imageUrl = message.type === 'image' ? getProxiedUrl(message.content) : '';
  const { imageUrl: authenticatedUrl, isLoading: imageLoading, error: imageError } = useAuthenticatedImage(imageUrl);

  // Media
  const audioUrl = (message.type === 'audio' || message.type === 'voice') ? getProxiedUrl(message.content) : '';
  const { mediaUrl: authenticatedAudioUrl, isLoading: audioLoading, error: audioError, contentType: audioContentType } = useAuthenticatedMedia(audioUrl, 'audio');

  const videoUrl = message.type === 'video' ? getProxiedUrl(message.content) : '';
  const { mediaUrl: authenticatedVideoUrl, isLoading: videoLoading, error: videoError } = useAuthenticatedMedia(videoUrl, 'video');

  const documentUrl = message.type === 'document' ? getProxiedUrl(message.content) : '';
  const { mediaUrl: authenticatedDocumentUrl, isLoading: documentLoading, error: documentError } = useAuthenticatedMedia(documentUrl, 'document');

  const stickerUrl = message.type === 'sticker' ? getProxiedUrl(message.content) : '';
  const { mediaUrl: authenticatedStickerUrl, isLoading: stickerLoading, error: stickerError } = useAuthenticatedMedia(stickerUrl, 'image');

  const handleDownload = () => {
    const link = document.createElement('a');
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
          <p className="text-xs text-gray-500 mt-1">URL original: {message.content}</p>
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
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleDownload} className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70" title="Descargar imagen">
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
        <button onClick={handleDownload} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors" title="Descargar documento">
          <Download className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const AudioPlayer: React.FC<{ src: string; type?: string; fileName: string; onDownload: () => void; durationMeta?: number }>
 = ({ src, type, fileName, onDownload, durationMeta = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(durationMeta);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    
    infoLog('🔊 [AUDIO PLAYER] Configurando audio:', {
      src,
      type,
      fileName
    });
    
    // Verificar si la URL es válida
    try {
      new URL(src);
    } catch {
      console.error('🔊 [AUDIO PLAYER] URL inválida:', src);
      return;
    }
    
    audio.src = src;
    audio.load();

    const onLoaded = () => {
      infoLog('🔊 [AUDIO PLAYER] Metadata cargada:', {
        duration: audio.duration,
        readyState: audio.readyState,
        networkState: audio.networkState,
        src: audio.src,
        currentSrc: audio.currentSrc
      });
      setDuration(Number.isFinite(audio.duration) ? audio.duration : durationMeta);
    };
        const onTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);
    const onCanPlay = () => {
      infoLog('🔊 [AUDIO PLAYER] Audio listo para reproducir:', {
        duration: audio.duration,
        readyState: audio.readyState,
        networkState: audio.networkState,
        src: audio.src,
        currentSrc: audio.currentSrc
      });
    };
    const onError = () => {
             console.error('🔊 [AUDIO PLAYER] Error de audio:', {
               error: audio.error,
               errorCode: audio.error?.code,
               readyState: audio.readyState,
               networkState: audio.networkState,
               src: audio.src,
               currentSrc: audio.currentSrc
             });
           };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [src, durationMeta, fileName, type]);

  const format = (s: number) => {
    const mins = Math.floor(s / 60) || 0;
    const secs = Math.floor(s % 60) || 0;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    infoLog('🔊 [AUDIO PLAYER] Intentando reproducir:', {
      src: audio.src,
      readyState: audio.readyState,
      networkState: audio.networkState,
      duration: audio.duration,
      paused: audio.paused
    });
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        infoLog('🔊 [AUDIO PLAYER] Reproducción iniciada exitosamente');
        setIsPlaying(true);
      }).catch((e) => {
        console.error('🔊 [AUDIO PLAYER] Error al reproducir:', {
          error: e,
          errorName: e.name,
          errorMessage: e.message,
          readyState: audio.readyState,
          networkState: audio.networkState,
          src: audio.src
        });
        console.warn('No se pudo iniciar reproducción', e);
      });
    }
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border w-full">
      <button onClick={togglePlay} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <div className="flex-1 min-w-[220px]">
        <p className="text-sm font-medium text-gray-900">{fileName}</p>
        <div className="flex items-center space-x-2">
          <input type="range" min={0} max={Math.max(1, Math.floor(duration))} value={Math.floor(currentTime)} onChange={onSeek} className="w-full" />
          <span className="text-xs text-gray-500 whitespace-nowrap">{format(currentTime)} / {format(duration)}</span>
        </div>
      </div>
      <Volume2 className="w-4 h-4 text-gray-400" />
      <audio ref={audioRef} preload="metadata">
        {type && <source src={src} type={type} />}
      </audio>
      <button onClick={onDownload} className="hidden" aria-hidden="true" />
    </div>
  );
};

  const renderAudioContent = () => {
    const fileName = message.metadata.fileName || 'Audio';
    const durationMeta = message.metadata.duration || 0;

    const audioSrc = authenticatedAudioUrl || getProxiedUrl(message.content);
    const sourceType = (audioContentType && audioContentType.split(';')[0]) || 'audio/mpeg';

    // Logs de audio eliminados - componente funcionando correctamente

    if (audioLoading) {
      return (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{fileName}</p>
            <p className="text-xs text-gray-500">Preparando audio...</p>
          </div>
        </div>
      );
    }

    if (audioError || !audioSrc) {
      // Solo log en caso de error real
      if (audioError) {
        console.error('🔊 Error cargando audio:', audioError);
      }
      return (
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl">🎵</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">{fileName}</p>
            <p className="text-xs text-red-600">No se pudo cargar el audio</p>
          </div>
          <button onClick={handleDownload} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Descargar</button>
        </div>
      );
    }

    // AudioPlayer renderizado correctamente

    return (
      <AudioPlayer src={audioSrc} type={sourceType} fileName={fileName} onDownload={handleDownload} durationMeta={durationMeta} />
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

    const finalVideoUrl = authenticatedVideoUrl || getProxiedUrl(message.content);
    return (
      <div className="relative group">
        <video src={finalVideoUrl} poster={message.metadata.thumbnail} className="max-w-full max-h-64 rounded-lg" controls preload="metadata" />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleDownload} className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70" title="Descargar video">
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
          <button onClick={() => window.open(`https://maps.google.com/?q=${locationData.latitude},${locationData.longitude}`, '_blank')} className="text-xs text-blue-500 hover:text-blue-700 mt-1">
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

    const finalStickerUrl = authenticatedStickerUrl || getProxiedUrl(message.content);
    return (
      <div className="flex justify-center">
        <img src={finalStickerUrl} alt="Sticker" className="max-w-32 max-h-32 rounded-lg" />
      </div>
    );
  };

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