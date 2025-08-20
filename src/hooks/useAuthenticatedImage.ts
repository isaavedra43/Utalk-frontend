import { useState, useEffect, useRef } from 'react';
import { infoLog } from '../config/logger';
import { useAuthContext } from '../contexts/useAuthContext';
import api from '../services/api';

interface UseAuthenticatedImageReturn {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

// Cache simple en memoria: originalUrl -> blobObjectUrl
const imageBlobCache = new Map<string, string>();
// Deduplicación: originalUrl -> promesa que resuelve a blobObjectUrl
const inflightByUrl = new Map<string, Promise<string>>();

export const useAuthenticatedImage = (originalUrl: string): UseAuthenticatedImageReturn => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentBlobUrlRef = useRef<string | null>(null);
  const inFlightRef = useRef<boolean>(false);
  
  const { isAuthenticated } = useAuthContext();

  const isTwilioUrl = (url: string) => url.includes('api.twilio.com');
  const isProtectedProxy = (url: string) => url.includes('/api/media/proxy');
  const isPublicProxy = (url: string) => url.includes('/media/proxy-public');

  // Efecto 1: URLs públicas del proxy (no depende de auth)
  useEffect(() => {
    if (!originalUrl || !isPublicProxy(originalUrl)) return;

    let canceled = false;

    const loadPublic = async () => {
      infoLog('🖼️ useAuthenticatedImage/public - URL:', originalUrl);

      // Cache
      const cached = imageBlobCache.get(originalUrl);
      if (cached) {
        setImageUrl(cached);
        setIsLoading(false);
        return;
      }

      // Deduplicación
      let promise = inflightByUrl.get(originalUrl);
      if (!promise) {
        promise = (async () => {
          const res = await fetch(originalUrl);
          if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
          const ct = res.headers.get('content-type');
          if (!ct || !ct.startsWith('image/')) throw new Error('La respuesta no es imagen');
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          return url;
        })()
          .then((url) => {
            imageBlobCache.set(originalUrl, url);
            return url;
          })
          .finally(() => inflightByUrl.delete(originalUrl));
        inflightByUrl.set(originalUrl, promise);
      }

      setIsLoading(true);
      setError(null);

      try {
        const url = await promise;
        if (canceled) return;
        currentBlobUrlRef.current = url;
        setImageUrl(url);
      } catch (e) {
        if (!canceled) setError(e instanceof Error ? e.message : 'Error desconocido');
      } finally {
        if (!canceled) setIsLoading(false);
      }
    };

    loadPublic();

    return () => {
      canceled = true;
      const current = currentBlobUrlRef.current;
      const cached = imageBlobCache.get(originalUrl);
      if (current && current !== cached && current.startsWith('blob:')) URL.revokeObjectURL(current);
    };
  }, [originalUrl]);

  // Efecto 2: URLs protegidas (Twilio o /api/media/proxy)
  useEffect(() => {
    if (!originalUrl) return;
    const needsAuth = isTwilioUrl(originalUrl) || isProtectedProxy(originalUrl);
    if (!needsAuth) return; // este efecto solo maneja protegidas

    let canceled = false;

    const loadProtected = async () => {
      infoLog('🖼️ useAuthenticatedImage/protected - URL:', originalUrl, 'auth:', isAuthenticated);

      if (!isAuthenticated) {
        setError('Usuario no autenticado');
        return;
      }

      // Cache
      const cached = imageBlobCache.get(originalUrl);
      if (cached) {
        setImageUrl(cached);
        setIsLoading(false);
        return;
      }

      // Evitar múltiples peticiones por componente
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      setIsLoading(true);
      setError(null);

      const getUrl = async (): Promise<string> => {
        let requestUrl = originalUrl;
        if (isTwilioUrl(originalUrl)) {
          const messageMatch = originalUrl.match(/Messages\/([^/]+)/);
          const mediaMatch = originalUrl.match(/Media\/([^/]+)/);
          if (!messageMatch || !mediaMatch) throw new Error('URL de Twilio inválida');
          const messageSid = messageMatch[1];
          const mediaSid = mediaMatch[1];
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://utalk-backend-production.up.railway.app';
          requestUrl = `${backendUrl}/api/media/proxy?messageSid=${messageSid}&mediaSid=${mediaSid}`;
        }

        const axiosResponse = await api.get(requestUrl, { responseType: 'blob' });
        if (axiosResponse.status !== 200) throw new Error(`Error ${axiosResponse.status}: ${axiosResponse.statusText}`);
        const ct = axiosResponse.headers['content-type'];
        if (!ct || !ct.startsWith('image/')) throw new Error('La respuesta no es imagen');
        const blob = axiosResponse.data as Blob;
        const url = URL.createObjectURL(blob);
        return url;
      };

      try {
        let promise = inflightByUrl.get(originalUrl);
        if (!promise) {
          promise = getUrl()
            .then((url) => {
              imageBlobCache.set(originalUrl, url);
              return url;
            })
            .finally(() => inflightByUrl.delete(originalUrl));
          inflightByUrl.set(originalUrl, promise);
        }

        const url = await promise;
        if (canceled) return;
        currentBlobUrlRef.current = url;
        setImageUrl(url);
      } catch (e) {
        if (!canceled) setError(e instanceof Error ? e.message : 'Error desconocido');
      } finally {
        inFlightRef.current = false;
        if (!canceled) setIsLoading(false);
      }
    };

    loadProtected();

    return () => {
      canceled = true;
      const current = currentBlobUrlRef.current;
      const cached = imageBlobCache.get(originalUrl);
      if (current && current !== cached && current.startsWith('blob:')) URL.revokeObjectURL(current);
    };
  }, [originalUrl, isAuthenticated]);

  return { imageUrl, isLoading, error };
}; 