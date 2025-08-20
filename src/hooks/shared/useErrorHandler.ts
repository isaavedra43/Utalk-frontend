import { useState, useCallback, useRef } from 'react';
import { infoLog } from '../../config/logger';

// Tipos para manejo de errores
export interface ErrorState {
  error: string | null;
  hasError: boolean;
  errorCode?: string;
  errorDetails?: Record<string, unknown>;
}

export interface ErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error, context?: string) => void;
  onRetry?: (attempt: number) => void;
}

// Hook para manejo de errores
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onRetry
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    hasError: false
  });

  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para manejar errores
  const handleError = useCallback((error: Error | string, context?: string, details?: Record<string, unknown>) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorCode = error instanceof Error ? error.name : 'UNKNOWN_ERROR';

    infoLog('Error handled:', {
      message: errorMessage,
      code: errorCode,
      context,
      details
    });

    setErrorState({
      error: errorMessage,
      hasError: true,
      errorCode,
      errorDetails: details
    });

    // Llamar callback personalizado si existe
    if (onError && error instanceof Error) {
      onError(error, context);
    }
  }, [onError]);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      hasError: false
    });
    retryCountRef.current = 0;
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Función para reintentar operación
  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> => {
    try {
      const result = await operation();
      clearError();
      return result;
    } catch (error) {
      retryCountRef.current++;

      if (retryCountRef.current <= maxRetries) {
        infoLog(`Reintentando operación (${retryCountRef.current}/${maxRetries}):`, {
          context,
          error: error instanceof Error ? error.message : String(error)
        });

        if (onRetry) {
          onRetry(retryCountRef.current);
        }

        // Esperar antes de reintentar
        await new Promise(resolve => {
          retryTimeoutRef.current = setTimeout(resolve, retryDelay * retryCountRef.current);
        });

        return retry(operation, context);
      } else {
        handleError(error instanceof Error ? error : new Error(String(error)), context);
        throw error;
      }
    }
  }, [maxRetries, retryDelay, onRetry, handleError, clearError]);

  // Función para ejecutar operación con manejo de errores
  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      clearError();
      const result = await operation();
      return result;
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), context);
      return null;
    }
  }, [handleError, clearError]);

  // Función para manejar errores de API
  const handleApiError = useCallback((error: unknown, context?: string) => {
    let errorMessage = 'Error desconocido';

    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string }; status?: number }; config?: { url?: string } };
      if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      }
    } else if (error && typeof error === 'object' && 'message' in error) {
      const errorObj = error as { message: string; name?: string };
      errorMessage = errorObj.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    handleError(new Error(errorMessage), context, {
      originalError: error
    });
  }, [handleError]);

  return {
    error: errorState.error,
    hasError: errorState.hasError,
    errorCode: errorState.errorCode,
    errorDetails: errorState.errorDetails,
    retryCount: retryCountRef.current,
    handleError,
    clearError,
    retry,
    executeWithErrorHandling,
    handleApiError
  };
}

// Hook específico para errores de autenticación
export function useAuthErrorHandler() {
  const errorHandler = useErrorHandler({
    maxRetries: 1,
    onError: (error, context) => {
      infoLog('Error de autenticación:', { error: error.message, context });
      
      // Limpiar tokens si es un error de autenticación
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
  });

  return errorHandler;
}

// Hook específico para errores de WebSocket
export function useWebSocketErrorHandler() {
  const errorHandler = useErrorHandler({
    maxRetries: 5,
    retryDelay: 2000,
    onError: (error, context) => {
      infoLog('Error de WebSocket:', { error: error.message, context });
    },
    onRetry: (attempt) => {
      infoLog(`Reintentando conexión WebSocket (${attempt}/5)`);
    }
  });

  return errorHandler;
}

// Hook específico para errores de archivos
export function useFileErrorHandler() {
  const errorHandler = useErrorHandler({
    maxRetries: 2,
    retryDelay: 1000,
    onError: (error, context) => {
      infoLog('Error de archivo:', { error: error.message, context });
    }
  });

  return errorHandler;
} 