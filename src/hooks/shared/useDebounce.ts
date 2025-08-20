import { useState, useEffect, useCallback } from 'react';

/**
 * Hook básico para debounce de valores
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para debounce de callbacks
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        callback(...args);
      }, delay);

      setTimeoutId(newTimeoutId);
    },
    [callback, delay, timeoutId]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedCallback;
}

/**
 * Hook para throttling de callbacks
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const [lastCall, setLastCall] = useState(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCall >= delay) {
        callback(...args);
        setLastCall(now);
      }
    },
    [callback, delay, lastCall]
  ) as T;

  return throttledCallback;
}

/**
 * Hook específico para búsquedas con debounce
 */
export function useSearchDebounce(searchTerm: string, delay: number = 300): string {
  return useDebounce(searchTerm, delay);
}

/**
 * Hook para filtros con debounce
 */
export function useFilterDebounce<T>(filters: T, delay: number = 500): T {
  return useDebounce(filters, delay);
} 