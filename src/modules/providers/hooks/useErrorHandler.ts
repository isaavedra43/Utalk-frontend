import { useState, useCallback } from 'react';

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorInfo | null>(null);

  const handleError = useCallback((err: unknown, defaultMessage = 'Ha ocurrido un error') => {
    let errorInfo: ErrorInfo;

    if (err instanceof Error) {
      errorInfo = {
        message: err.message || defaultMessage,
        code: (err as any).code,
        details: (err as any).details,
      };
    } else if (typeof err === 'object' && err !== null && 'message' in err) {
      errorInfo = {
        message: (err as any).message || defaultMessage,
        code: (err as any).code,
        details: (err as any).details || err,
      };
    } else {
      errorInfo = {
        message: defaultMessage,
        details: err,
      };
    }

    setError(errorInfo);
    console.error('Error handled:', errorInfo);

    // Auto-clear error after 5 seconds
    setTimeout(() => {
      setError(null);
    }, 5000);

    return errorInfo;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
};
