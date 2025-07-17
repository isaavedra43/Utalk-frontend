import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/utils';
import { ErrorBoundaryFallback } from '@/components/ui/error-state';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

/**
 * Error Boundary robusto para capturar y manejar errores de React
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generar ID único para el error
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log detallado del error
    logger.critical('🚨 Error capturado por Error Boundary', {
      errorId: this.state.errorId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    // Llamar callback opcional
    this.props.onError?.(error, errorInfo);

    // Actualizar estado con información completa
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    logger.critical('🔄 Usuario recargando página después de error', {
      errorId: this.state.errorId
    });
    window.location.reload();
  };

  handleGoHome = () => {
    logger.critical('🏠 Usuario regresando al home después de error', {
      errorId: this.state.errorId
    });
    window.location.href = '/';
  };

  handleRetry = () => {
    logger.critical('🔄 Usuario reintentando después de error', {
      errorId: this.state.errorId
    });
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: ''
    });
  };

  render() {
    if (this.state.hasError) {
      // Renderizar fallback personalizado si se proporciona
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Usar el componente ErrorBoundaryFallback modular
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          resetError={this.handleRetry}
          errorId={this.state.errorId}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para capturar errores asíncronos que no son capturados por Error Boundary
 */
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    const errorId = `async_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.critical('🚨 Error asíncrono capturado', {
      errorId,
      context: context || 'unknown',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString(),
      url: window.location.href
    });

    // Mostrar toast de error
    import('@/hooks/use-toast').then(({ toast }) => {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: `${error.message} (ID: ${errorId.slice(-8)})`,
      });
    });

    return errorId;
  }, []);

  return { handleError };
}

/**
 * HOC para envolver componentes con Error Boundary
 */
export function withErrorBoundary<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  errorFallback?: ReactNode
) {
  const ComponentWithErrorBoundary = (props: T) => (
    <ErrorBoundary fallback={errorFallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ComponentWithErrorBoundary;
} 