import { useRef, useCallback } from 'react';

// Hook para evitar peticiones repetitivas
export const useDebouncedRequest = (delay: number = 1000) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestRef = useRef<string>('');

  const debouncedRequest = useCallback((key: string, requestFn: () => Promise<void>) => {
    // Si es la misma petición que la última, cancelar
    if (lastRequestRef.current === key) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Programar nueva petición
    timeoutRef.current = setTimeout(() => {
      lastRequestRef.current = key;
      requestFn();
    }, delay);
  }, [delay]);

  return { debouncedRequest };
}; 