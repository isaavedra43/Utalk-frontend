import React from 'react'
import ReactDOM from 'react-dom/client'
import { unstable_now as schedulerNow } from 'scheduler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import './utils/logCleaner' // Importar para disponibilizar funciones globales de logging
import './utils/consoleExporter' // Importar para disponibilizar exportación de logs
import './styles/dashboard.css'
import { logger } from './utils/logger.ts'

// Configuración específica para React 19 - SOLUCIÓN AL ERROR
if (typeof window !== 'undefined') {
  // Resolver problema de unstable_now - solución completa
  if (!window.performance) {
    window.performance = {} as Performance;
  }
  if (!window.performance.now) {
    // Fallback robusto
    const navStart = Date.now();
    window.performance.now = () => Date.now() - navStart;
  }

  // Exponer compatibilidad para React 19 (scheduler)
  try {
    // @ts-expect-error compat shim
    if (typeof window.performance.unstable_now !== 'function') {
      // @ts-expect-error compat shim
      window.performance.unstable_now = () => (typeof schedulerNow === 'function' ? schedulerNow() : window.performance.now());
    }
  } catch {
    // Ignorar, ya que no todos los navegadores permiten redefinir performance
  }

  // Polyfills de RAF
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (cb) => setTimeout(cb, 16) as unknown as number;
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (id: number) => clearTimeout(id as unknown as NodeJS.Timeout);
  }
}

// Validar configuración al iniciar (solo en desarrollo)
if (import.meta.env.DEV) {
  logger.systemInfo('Iniciando aplicación UTALK', {
    version: '1.0.0',
    environment: import.meta.env.MODE,
    debug: import.meta.env.DEV,
    timestamp: new Date().toISOString(),
    reactVersion: React.version
  });
}

// Configurar QueryClient con retry y cache optimizados
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // No reintentar si es un error de autenticación
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as { response?: { status?: number } };
          if (apiError.response?.status === 401) {
            return false;
          }
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 1
    }
  }
});

// Función de renderizado con manejo de errores
const renderApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Elemento root no encontrado');
    }

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('Error al renderizar la aplicación:', error);
    // Fallback: mostrar mensaje de error
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
          <div style="text-align: center; padding: 20px;">
            <h1>Error de Inicialización</h1>
            <p>La aplicación no pudo iniciarse correctamente.</p>
            <p>Por favor, recarga la página.</p>
            <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Recargar Página
            </button>
          </div>
        </div>
      `;
    }
  }
};

// Inicializar la aplicación
renderApp();
