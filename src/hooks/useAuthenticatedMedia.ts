import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/useAuthContext';

interface UseAuthenticatedMediaReturn {
  mediaUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuthenticatedMedia = (originalUrl: string, mediaType: 'image' | 'audio' | 'video' | 'document' = 'image'): UseAuthenticatedMediaReturn => {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Usar el contexto de autenticación para obtener el token
  const { isAuthenticated } = useAuthContext();

  const getAccessToken = (): string | null => {
    return localStorage.getItem('access_token');
  };

  useEffect(() => {
    const loadAuthenticatedMedia = async () => {
      if (!originalUrl) {
        setError('No se proporcionó URL');
        return;
      }

      // Si no es una URL de Twilio, usar directamente
      if (!originalUrl.includes('api.twilio.com')) {
        setMediaUrl(originalUrl);
        return;
      }

      // Verificar que el usuario esté autenticado
      if (!isAuthenticated) {
        setError('Usuario no autenticado');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Extraer el SID del mensaje y el SID del media de la URL
        const messageMatch = originalUrl.match(/Messages\/([^/]+)/);
        const mediaMatch = originalUrl.match(/Media\/([^/]+)/);
        
        if (!messageMatch || !mediaMatch) {
          throw new Error('URL de Twilio inválida');
        }

        const messageSid = messageMatch[1];
        const mediaSid = mediaMatch[1];
        
        // Construir URL del proxy del backend
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://utalk-backend-production.up.railway.app';
        const proxyUrl = `${backendUrl}/api/media/proxy?messageSid=${messageSid}&mediaSid=${mediaSid}`;

        // Obtener token de autenticación
        const token = getAccessToken();
        if (!token) {
          throw new Error('Token de autenticación no encontrado');
        }

        // REDUCIR LOGS: Solo log en caso de error
        // console.log(`🎵 Cargando ${mediaType} autenticado:`, {
        //   url: proxyUrl,
        //   hasToken: !!token,
        //   tokenLength: token.length
        // });

        // Hacer petición autenticada
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // REDUCIR LOGS: Solo log en caso de error
        if (!response.ok) {
          console.log(`🎵 Respuesta del servidor para ${mediaType} (ERROR):`, {
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type')
          });
        }

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Token de autenticación inválido o expirado');
          } else if (response.status === 403) {
            throw new Error('No tienes permisos para acceder a este recurso');
          } else {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
        }

        // Para imágenes, verificar que la respuesta sea una imagen
        if (mediaType === 'image') {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.startsWith('image/')) {
            console.warn(`🎵 Respuesta no es una imagen:`, contentType);
            // Intentar leer como texto para debug
            const textResponse = await response.text();
            console.warn(`🎵 Contenido de respuesta:`, textResponse.substring(0, 200));
            throw new Error('La respuesta del servidor no es una imagen válida');
          }
        }

        // Convertir la respuesta a blob
        const blob = await response.blob();
        
        // Crear URL temporal para el media
        const objectUrl = URL.createObjectURL(blob);
        setMediaUrl(objectUrl);

        // REDUCIR LOGS: Solo log en caso de éxito (sin detalles)
        // console.log(`🎵 ${mediaType} cargado exitosamente:`, {
        //   blobSize: blob.size,
        //   blobType: blob.type,
        //   objectUrl: objectUrl.substring(0, 50) + '...'
        // });

      } catch (err) {
        console.error(`🎵 Error cargando ${mediaType} autenticado:`, err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthenticatedMedia();

    // Cleanup: revocar URL temporal cuando el componente se desmonte
    return () => {
      if (mediaUrl && mediaUrl.startsWith('blob:')) {
        URL.revokeObjectURL(mediaUrl);
      }
    };
  }, [originalUrl, isAuthenticated, mediaType]);

  return { mediaUrl, isLoading, error };
}; 