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
  retryCount: number;
  isRecovering: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId?: NodeJS.Timeout;
  private maxRetries = 3;
  
  // Detecta promesas/thenables (usadas por Suspense)
  private isThenable = (value: unknown): boolean => {
    return (
      (!!value && (typeof value === 'object' || typeof value === 'function')) &&
      typeof (value as any).then === 'function'
    );
  };

  // Normaliza cualquier cosa lanzada a una instancia de Error legible
  private normalizeError = (err: unknown): Error => {
    if (err instanceof Error) return err;
    try {
      const asString = typeof err === 'string' ? err : JSON.stringify(err);
      return new Error(asString || 'Unknown non-Error exception');
    } catch {
      return new Error('Unknown non-Error exception');
    }
  };
  
  public state: State = {
    hasError: false,
    retryCount: 0,
    isRecovering: false
  };

  public static getDerivedStateFromError(error: unknown): State {
    // ✅ FILTRAR errores vacíos ANTES de actualizar el estado
    if (!error || 
        (typeof error === 'object' && Object.keys(error).length === 0) ||
        (typeof error === 'object' && error.toString() === '{}') ||
        (typeof error === 'string' && error.trim() === '') ||
        (typeof error === 'object' && JSON.stringify(error) === '{}') ||
        (typeof error === 'object' && error.toString() === '[object Object]') ||
        (typeof error === 'object' && error.constructor === Object && Object.keys(error).length === 0) ||
        (error && typeof error === 'object' && !(error as Error).message && !(error as Error).stack && !(error as Error).name)) {
      console.warn('⚠️ getDerivedStateFromError - Error vacío detectado y filtrado');
      // NO actualizar el estado para errores vacíos
      return { hasError: false, retryCount: 0, isRecovering: false };
    }
    
    // Actualizar el estado para que el siguiente renderizado muestre la UI de fallback
    return { hasError: true, error: error as Error, retryCount: 0, isRecovering: false };
  }

  public componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    // Ignorar promesas de Suspense: no son errores y no deben mostrar fallback
    if (this.isThenable(error)) {
      // Restablecer el estado si React llamó getDerivedStateFromError por error
      if (this.state.hasError) {
        this.setState({ hasError: false, error: undefined, isRecovering: false });
      }
      return;
    }

    // ✅ IGNORAR errores vacíos o sin información útil - FILTRO MÁS AGRESIVO
    if (!error || 
        (typeof error === 'object' && Object.keys(error).length === 0) ||
        (typeof error === 'object' && error.toString() === '{}') ||
        (typeof error === 'string' && error.trim() === '') ||
        (typeof error === 'object' && JSON.stringify(error) === '{}') ||
        (typeof error === 'object' && error.toString() === '[object Object]') ||
        (typeof error === 'object' && error.constructor === Object && Object.keys(error).length === 0) ||
        (error && typeof error === 'object' && !(error as Error).message && !(error as Error).stack && !(error as Error).name)) {
      console.warn('🚨 ErrorBoundary - Error vacío o inválido ignorado:', error);
      // Resetear el estado para que no se muestre el fallback
      if (this.state.hasError) {
        this.setState({ hasError: false, error: undefined, isRecovering: false });
      }
      return;
    }

    const normalized = this.normalizeError(error);
    
    // ✅ Solo loggear errores con información útil
    if (normalized.message && normalized.message !== 'Unknown non-Error exception') {
      console.error('🚨 ErrorBoundary - Error capturado:', normalized);
      console.error('🚨 ErrorBoundary - Error info:', errorInfo);
    } else {
      console.warn('🚨 ErrorBoundary - Error sin información útil ignorado:', error);
      // Resetear el estado para que no se muestre el fallback
      if (this.state.hasError) {
        this.setState({ hasError: false, error: undefined, isRecovering: false });
      }
      return;
    }

    // Log del error para debugging
    if (normalized.message?.includes('Minified React error #310')) {
      console.error('🚨 ErrorBoundary - Error #310 detectado: Problema con hooks de React');
      console.error('🚨 ErrorBoundary - Posible causa: Hooks llamados condicionalmente');
    }

    // Disparar evento para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('app:error-boundary', {
      detail: { error, errorInfo, timestamp: Date.now() }
    }));
    
    // Intentar recuperación automática para errores de autenticación
    this.attemptAutoRecovery(normalized);
  }
  
  private isAuthError = (error: Error): boolean => {
    const authErrorPatterns = [
      'TOKEN_EXPIRED',
      'MALFORMED_TOKEN',
      'INVALID_TOKEN',
      'authentication',
      'auth',
      '401',
      'Unauthorized'
    ];
    
    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';
    
    return authErrorPatterns.some(pattern => 
      errorMessage.includes(pattern.toLowerCase()) || 
      errorStack.includes(pattern.toLowerCase())
    );
  };
  
  private attemptAutoRecovery = (error: Error) => {
    if (this.state.retryCount >= this.maxRetries) {
      console.log('🚨 ErrorBoundary - Máximo de reintentos alcanzado');
      return;
    }
    
    if (this.isAuthError(error)) {
      console.log('🚨 ErrorBoundary - Error de autenticación detectado, intentando recuperación automática...');
      
      this.setState({ isRecovering: true });
      
      // Limpiar tokens y estado de autenticación
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Disparar evento de autenticación fallida
      window.dispatchEvent(new CustomEvent('auth:authentication-failed'));
      
      // Intentar recuperación después de un delay
      this.retryTimeoutId = setTimeout(() => {
        this.setState({
          hasError: false,
          error: undefined,
          retryCount: this.state.retryCount + 1,
          isRecovering: false
        });
        
        // Redirigir al login si no estamos ya ahí
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }, 2000);
    }
  };
  
  public componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      console.log('🚨 ErrorBoundary - Máximo de reintentos alcanzado, limpiando autenticación');
      this.handleClearAuth();
      return;
    }
    
    this.setState({ 
      hasError: false, 
      error: undefined,
      retryCount: this.state.retryCount + 1,
      isRecovering: false
    });
  };

  private handleClearAuth = () => {
    // Limpiar autenticación
    localStorage.clear();
    sessionStorage.clear();
    
    // Disparar evento de autenticación fallida
    window.dispatchEvent(new CustomEvent('auth:authentication-failed'));
    
    // Redirigir al login en lugar de recargar
    window.location.href = '/login';
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
                    {this.state.isRecovering 
                      ? 'Recuperando automáticamente...' 
                      : `Ha ocurrido un error inesperado. Reintento ${this.state.retryCount}/${this.maxRetries}`
                    }
                  </p>
                  
                  {this.state.isRecovering && (
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                    </div>
                  )}

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
                    {!this.state.isRecovering && (
                      <button
                        onClick={this.handleRetry}
                        disabled={this.state.retryCount >= this.maxRetries}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {this.state.retryCount >= this.maxRetries ? 'Máximo de reintentos' : `Reintentar (${this.state.retryCount}/${this.maxRetries})`}
                      </button>
                    )}
                    
                    <button
                      onClick={this.handleClearAuth}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Ir al login
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
