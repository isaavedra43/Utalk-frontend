import { Component, ErrorInfo, ReactNode } from 'react';
import { MobileMenuProvider } from '../contexts/MobileMenuContext';
import { MobileMenu } from './layout/MobileMenu';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Actualizar el estado para que el siguiente renderizado muestre la UI de fallback
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary - Error capturado:', error);
    console.error('🚨 ErrorBoundary - Error info:', errorInfo);

    // Log del error para debugging
    if (error.message.includes('Minified React error #310')) {
      console.error('🚨 ErrorBoundary - Error #310 detectado: Problema con hooks de React');
      console.error('🚨 ErrorBoundary - Posible causa: Hooks llamados condicionalmente');
    }

    // Disparar evento para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('app:error-boundary', {
      detail: { error, errorInfo, timestamp: Date.now() }
    }));
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleClearAuth = () => {
    // Limpiar autenticación
    localStorage.clear();
    sessionStorage.clear();
    
    // Recargar página
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // UI de fallback personalizada
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <MobileMenuProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Header móvil con menú - SIEMPRE VISIBLE */}
            <div className="absolute top-0 left-0 right-0 z-10 lg:hidden">
              <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MobileMenu />
                    <h1 className="text-lg font-bold text-gray-900">Error</h1>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido de error con padding para el header móvil */}
            <div className="flex items-center justify-center min-h-screen px-4 pt-20 lg:pt-0">
              <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Algo salió mal
                  </h3>
                  
                  <p className="text-sm text-gray-500 mb-6">
                    Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
                  </p>

                  {this.state.error && (
                    <details className="mb-4 text-left">
                      <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                        Ver detalles del error
                      </summary>
                      <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-32">
                        {this.state.error.message}
                      </pre>
                    </details>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={this.handleRetry}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Reintentar
                    </button>
                    
                    <button
                      onClick={this.handleClearAuth}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Limpiar y reiniciar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MobileMenuProvider>
      );
    }

    return this.props.children;
  }
}
