import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/lib/auth.tsx';
import { safeDocument } from '@/lib/utils';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import './global.css';

// REACT ERROR BOUNDARY PARA CAPTURAR ERRORES #301
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ReactErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    console.error('🚨 REACT ERROR BOUNDARY CAPTURÓ ERROR:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 REACT ERROR #301 DETECTADO:', {
      error: error.message,
      stack: error.stack,
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      location: window.location.href,
      environment: import.meta.env.MODE
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#1a1a1a', color: 'white', fontFamily: 'monospace' }}>
          <h1>🚨 REACT ERROR #301 CAPTURADO</h1>
          <h2>Error: {this.state.error?.message}</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Stack Trace</summary>
            {this.state.error?.stack}
          </details>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Component Stack</summary>
            {this.state.errorInfo?.componentStack}
          </details>
          <button onClick={() => window.location.reload()}>Recargar Página</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// GLOBAL ERROR HANDLER
window.addEventListener('error', (event) => {
  console.error('🚨 GLOBAL ERROR:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString()
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 UNHANDLED REJECTION:', {
    reason: event.reason,
    timestamp: new Date().toISOString()
  });
});

// QUERY CLIENT CON ERROR HANDLING
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error('🚨 QUERY CLIENT ERROR:', error);
    }
  }),
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

console.log('🔍 1. Main.tsx iniciando...');
console.log('🔍 2. Environment:', import.meta.env.MODE);
console.log('🔍 3. DEV mode:', import.meta.env.DEV);
console.log('🔍 4. API URL:', import.meta.env.VITE_API_URL);
console.log('🔍 5. Todas las variables env:', import.meta.env);

// SAFE ROOT ELEMENT ACCESS
const rootElement = safeDocument.getElementById('root');
if (!rootElement) {
  console.error('🚨 CRITICAL: Root element not found!');
  throw new Error('Root element not found');
}

console.log('🔍 6. Root element encontrado, creando React root...');

// ESTRUCTURA CON MÁXIMO ERROR HANDLING
const App = () => {
  console.log('🔍 7. App component iniciando render...');
  
  try {
    return (
      <ReactErrorBoundary>
        <div>
          <h1 style={{color: 'green', position: 'fixed', top: 0, left: 0, zIndex: 9999, background: 'white', padding: '5px'}}>
            🔍 MODO DIAGNÓSTICO ULTRA-DETALLADO
          </h1>
          <div style={{marginTop: '50px'}}>
            <QueryClientProvider client={queryClient}>
              <ReactErrorBoundary>
                <AuthProvider>
                  <ReactErrorBoundary>
                    <TooltipProvider>
                      <ReactErrorBoundary>
                        <Toaster />
                        <Sonner />
                        <BrowserRouter>
                          <ReactErrorBoundary>
                            <Routes>
                              <Route path="/login" element={<Login />} />
                              <Route path="/" element={<Index />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </ReactErrorBoundary>
                        </BrowserRouter>
                      </ReactErrorBoundary>
                    </TooltipProvider>
                  </ReactErrorBoundary>
                </AuthProvider>
              </ReactErrorBoundary>
            </QueryClientProvider>
          </div>
        </div>
      </ReactErrorBoundary>
    );
  } catch (error) {
    console.error('🚨 ERROR EN APP RENDER:', error);
    return (
      <div style={{ padding: '20px', background: 'red', color: 'white' }}>
        ERROR EN APP: {error.message}
      </div>
    );
  }
};

console.log('🔍 8. Creando React root...');
const root = createRoot(rootElement);

console.log('🔍 9. Renderizando App...');
root.render(<App />);

console.log('🔍 10. App renderizada exitosamente');
