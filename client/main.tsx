import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// INTERFACES PARA ERROR BOUNDARY
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// ERROR BOUNDARY PARA CAPTURAR CRASHES
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 ERROR BOUNDARY TRIGGERED:', error);
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 REACT CRASH DETAILS:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          color: 'red',
          padding: '20px',
          fontFamily: 'monospace',
          backgroundColor: '#fff',
          border: '2px solid red',
          margin: '20px'
        }}>
          <h1>🚨 REACT CRASH DETECTADO</h1>
          <h2>Error: {this.state.error?.message}</h2>
          <details>
            <summary>Stack Trace</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
          <details>
            <summary>Component Stack</summary>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

console.log('🔍 1. INICIANDO APLICACIÓN REACT...');
console.log('🔍 2. Environment:', import.meta.env.MODE);
console.log('🔍 3. DEV mode:', import.meta.env.DEV);
console.log('🔍 4. API URL:', import.meta.env.VITE_API_URL);
console.log('🔍 5. Todas las variables env:', import.meta.env);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
console.log('🔍 6. QueryClient creado exitosamente');

// ESTRUCTURA ORIGINAL COMPLETA CON LOGS
const App = () => {
  console.log('🔍 7. App component iniciando render...');
  
  return (
    <div>
      <h1 style={{color: 'green', position: 'fixed', top: 0, left: 0, zIndex: 9999, background: 'white', padding: '5px'}}>
        🔍 ESTRUCTURA ORIGINAL COMPLETA
      </h1>
      <div style={{marginTop: '50px'}}>
        {(() => {
          console.log('🔍 8. Iniciando QueryClientProvider...');
          return (
            <QueryClientProvider client={queryClient}>
              {(() => {
                console.log('🔍 9. QueryClientProvider OK, iniciando AuthProvider...');
                return (
                  <AuthProvider>
                    {(() => {
                      console.log('🔍 10. AuthProvider OK, iniciando TooltipProvider...');
                      return (
                        <TooltipProvider>
                          {(() => {
                            console.log('🔍 11. TooltipProvider OK, iniciando Toaster...');
                            return (
                              <>
                                <Toaster />
                                {(() => {
                                  console.log('🔍 12. Toaster OK, iniciando Sonner...');
                                  return <Sonner />;
                                })()}
                                {(() => {
                                  console.log('🔍 13. Sonner OK, iniciando BrowserRouter...');
                                  return (
                                    <BrowserRouter>
                                      {(() => {
                                        console.log('🔍 14. BrowserRouter OK, iniciando Routes...');
                                        return (
                                          <Routes>
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/" element={<Index />} />
                                            <Route path="*" element={<NotFound />} />
                                          </Routes>
                                        );
                                      })()}
                                    </BrowserRouter>
                                  );
                                })()}
                              </>
                            );
                          })()}
                        </TooltipProvider>
                      );
                    })()}
                  </AuthProvider>
                );
              })()}
            </QueryClientProvider>
          );
        })()}
      </div>
    </div>
  );
};

console.log('🔍 15. Sobre a ejecutar createRoot render...');
try {
  const root = createRoot(document.getElementById("root")!);
  console.log('🔍 16. createRoot exitoso, ejecutando render...');
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log('🔍 17. ✅ RENDER EJECUTADO SIN ERRORES');
} catch (error) {
  console.error('🚨 ERROR EN CREATEROOT/RENDER:', error);
  document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;">
    <h1>🚨 ERROR EN CREATEROOT/RENDER</h1>
    <p>${error.message}</p>
    <pre>${error.stack}</pre>
  </div>`;
}
