import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../contexts/useAuthContext';
import api from '../services/api';

// Función para convertir OGG a WAV usando Web Audio API
const convertOggToWav = async (oggBlob: Blob): Promise<Blob | null> => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const arrayBuffer = await oggBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Crear un buffer de salida WAV
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    const numberOfChannels = audioBuffer.numberOfChannels;
    
    // Crear un buffer de trabajo
    const offlineContext = new OfflineAudioContext(numberOfChannels, length, sampleRate);
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();
    
    const renderedBuffer = await offlineContext.startRendering();
    
    // Convertir a WAV
    const wavBlob = audioBufferToWav(renderedBuffer);
    return wavBlob;
  } catch (error) {
    console.warn('Error convirtiendo OGG a WAV:', error);
    return null;
  }
};

// Función auxiliar para convertir AudioBuffer a WAV
const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const length = buffer.length;
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * numberOfChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * numberOfChannels * 2, true);
  
  // Convertir datos de audio
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

interface UseAuthenticatedMediaReturn {
  mediaUrl: string | null;
  isLoading: boolean;
  error: string | null;
  contentType?: string | null;
}

export const useAuthenticatedMedia = (originalUrl: string, mediaType: 'image' | 'audio' | 'video' | 'document' = 'image'): UseAuthenticatedMediaReturn => {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string | null>(null);
  
  const lastObjectUrlRef = useRef<string | null>(null);
  const { isAuthenticated } = useAuthContext();

  const getAccessToken = (): string | null => {
    return localStorage.getItem('access_token');
  };

  const isTwilioUrl = (url: string) => url.includes('api.twilio.com');
  const isPublicProxy = (url: string) => url.includes('/media/proxy-public');

  useEffect(() => {
    const loadAuthenticatedMedia = async () => {
      if (!originalUrl) {
        setError('No se proporcionó URL');
        return;
      }

      // Si es una URL pública del proxy, manejarla directamente
      if (isPublicProxy(originalUrl)) {
        setIsLoading(true);
        setError(null);
        
        try {
          // Cargando URL pública del proxy
          
          const response = await fetch(originalUrl);
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          const headerCt = response.headers.get('content-type')?.toLowerCase() || '';
          
          // Determinar content-type final
          let finalCt: string | null = headerCt || null;

          // Fallbacks para audio cuando el servidor responde genérico
          if (mediaType === 'audio') {
            const isGeneric = !finalCt || headerCt === 'application/octet-stream' || headerCt === 'binary/octet-stream';
            if (isGeneric) {
              // Intentar detectar el formato basado en el contenido del blob
              const arrayBuffer = await blob.slice(0, 4).arrayBuffer();
              const firstBytes = new Uint8Array(arrayBuffer);
              const header = Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join('');
              
              if (header.startsWith('4f676753')) { // OGG
                finalCt = 'audio/ogg; codecs=opus';
              } else if (header.startsWith('52494646')) { // WAV
                finalCt = 'audio/wav';
              } else if (header.startsWith('494433')) { // MP3
                finalCt = 'audio/mpeg';
              } else {
                // Fallback por defecto
                finalCt = 'audio/ogg; codecs=opus';
              }
              
              // Formato detectado por bytes del archivo
            }
          }

          setContentType(finalCt);

          // Para audio, siempre intentar usar el blob original pero con el tipo correcto
          const needsRetype = finalCt && (!blob.type || blob.type === 'application/octet-stream');
          const finalBlob = needsRetype ? new Blob([blob], { type: finalCt as string }) : blob;
          
          // Blob procesado correctamente
          
          // Si es audio OGG y el navegador no lo soporta, intentar convertir a WAV
          if (mediaType === 'audio' && finalCt?.includes('audio/ogg')) {
            try {
              const convertedBlob = await convertOggToWav(finalBlob);
              if (convertedBlob) {
                // Conversión OGG a WAV exitosa
                const objectUrl = URL.createObjectURL(convertedBlob);
                if (lastObjectUrlRef.current && lastObjectUrlRef.current.startsWith('blob:')) URL.revokeObjectURL(lastObjectUrlRef.current);
                lastObjectUrlRef.current = objectUrl;
                setContentType('audio/wav');
                setMediaUrl(objectUrl);
                return;
              }
            } catch (error) {
              console.warn('🔊 Error en conversión OGG a WAV:', error);
            }
          }
          
          const objectUrl = URL.createObjectURL(finalBlob);
          if (lastObjectUrlRef.current && lastObjectUrlRef.current.startsWith('blob:')) URL.revokeObjectURL(lastObjectUrlRef.current);
          lastObjectUrlRef.current = objectUrl;
          setMediaUrl(objectUrl);
          
        } catch (err) {
          console.error(`🎵 Error cargando ${mediaType} público:`, err);
          setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Si no es una URL de Twilio y no es un proxy, usar directamente
      if (!isTwilioUrl(originalUrl)) {
        setMediaUrl(originalUrl);
        setContentType(null);
        return;
      }

      // URLs protegidas (Twilio)
      if (!isAuthenticated) {
        setError('Usuario no autenticado');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const messageMatch = originalUrl.match(/Messages\/([^/]+)/);
        const mediaMatch = originalUrl.match(/Media\/([^/]+)/);
        
        if (!messageMatch || !mediaMatch) {
          throw new Error('URL de Twilio inválida');
        }

        const messageSid = messageMatch[1];
        const mediaSid = mediaMatch[1];
        
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://utalk-backend-production.up.railway.app';
        const proxyUrl = `${backendUrl}/api/media/proxy?messageSid=${messageSid}&mediaSid=${mediaSid}`;

        const token = getAccessToken();
        if (!token) {
          throw new Error('Token de autenticación no encontrado');
        }

        const response = await api.get(proxyUrl, {
          responseType: 'blob',
        });

        if (response.status !== 200) {
          if (response.status === 401) {
            throw new Error('Token de autenticación inválido o expirado');
          } else if (response.status === 403) {
            throw new Error('No tienes permisos para acceder a este recurso');
          } else {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
        }

        // Determinar content-type final
        const headerCt = (response.headers['content-type'] as string | undefined)?.toLowerCase() || '';
        let finalCt: string | null = headerCt || null;

        // Fallbacks para audio cuando el servidor responde genérico
        if (mediaType === 'audio') {
          const isGeneric = !finalCt || headerCt === 'application/octet-stream' || headerCt === 'binary/octet-stream';
          if (isGeneric) {
            // Intentar detectar el formato basado en el contenido del blob
            const arrayBuffer = await response.data.slice(0, 4).arrayBuffer();
            const firstBytes = new Uint8Array(arrayBuffer);
            const header = Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join('');
            
            if (header.startsWith('4f676753')) { // OGG
              finalCt = 'audio/ogg; codecs=opus';
            } else if (header.startsWith('52494646')) { // WAV
              finalCt = 'audio/wav';
            } else if (header.startsWith('494433')) { // MP3
              finalCt = 'audio/mpeg';
            } else {
              // Fallback por defecto
              finalCt = 'audio/ogg; codecs=opus';
            }
            
            console.log('🔊 [AUDIO DEBUG] Detectado formato por bytes (protegido):', {
              header,
              contentType: finalCt
            });
          }
        }

        setContentType(finalCt);

        // Para audio, siempre intentar usar el blob original pero con el tipo correcto
        const needsRetype = finalCt && (!response.data.type || response.data.type === 'application/octet-stream');
        const finalBlob = needsRetype ? new Blob([response.data], { type: finalCt as string }) : response.data;
        
        console.log('🔊 [AUDIO DEBUG] Blob final (protegido):', {
          contentType: finalCt,
          blobSize: finalBlob.size,
          blobType: finalBlob.type,
          needsRetype,
          originalHeader: headerCt
        });
        
        // Si es audio OGG y el navegador no lo soporta, intentar convertir a WAV
        if (mediaType === 'audio' && finalCt?.includes('audio/ogg')) {
          try {
            const convertedBlob = await convertOggToWav(finalBlob);
            if (convertedBlob) {
              console.log('🔊 [AUDIO DEBUG] Conversión OGG a WAV exitosa (protegido)');
              const objectUrl = URL.createObjectURL(convertedBlob);
              if (lastObjectUrlRef.current && lastObjectUrlRef.current.startsWith('blob:')) URL.revokeObjectURL(lastObjectUrlRef.current);
              lastObjectUrlRef.current = objectUrl;
              setContentType('audio/wav');
              setMediaUrl(objectUrl);
              return;
            }
          } catch (error) {
            console.warn('🔊 [AUDIO DEBUG] Error en conversión OGG a WAV (protegido):', error);
          }
        }
        
        const objectUrl = URL.createObjectURL(finalBlob);
        if (lastObjectUrlRef.current && lastObjectUrlRef.current.startsWith('blob:')) URL.revokeObjectURL(lastObjectUrlRef.current);
        lastObjectUrlRef.current = objectUrl;
        setMediaUrl(objectUrl);

      } catch (err) {
        console.error(`🎵 Error cargando ${mediaType} autenticado:`, err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthenticatedMedia();

    return () => {
      if (lastObjectUrlRef.current && lastObjectUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
        lastObjectUrlRef.current = null;
      }
    };
  }, [originalUrl, isAuthenticated, mediaType]);

  return { mediaUrl, isLoading, error, contentType };
}; 