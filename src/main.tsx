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
    // Fallback: mostrar mensaje de error con menú móvil
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="height: 100vh; font-family: Arial, sans-serif; background: #f9fafb;">
          <!-- Header móvil con menú - SIEMPRE VISIBLE -->
          <div style="position: absolute; top: 0; left: 0; right: 0; z-index: 10; background: white; border-bottom: 1px solid #e5e7eb; padding: 12px 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <button onclick="window.location.href='/'" style="padding: 8px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
                <h1 style="font-size: 18px; font-weight: bold; color: #111827; margin: 0;">Error</h1>
              </div>
            </div>
          </div>
          
          <!-- Contenido de error -->
          <div style="display: flex; justify-content: center; align-items: center; height: 100vh; padding-top: 80px; box-sizing: border-box;">
            <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); max-width: 400px; width: 100%; margin: 0 16px;">
              <div style="width: 48px; height: 48px; background: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h1 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 8px;">Error de Inicialización</h1>
              <p style="color: #6b7280; margin: 0 0 24px;">La aplicación no pudo iniciarse correctamente.</p>
              <button onclick="window.location.reload()" style="padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#1d4ed8'" onmouseout="this.style.backgroundColor='#2563eb'">
                Recargar Página
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }
};

// Inicializar la aplicación
renderApp();

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ PWA: Service Worker registrado', registration);
        
        // Verificar actualizaciones cada hora
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('❌ PWA: Error al registrar Service Worker', error);
      });
  });
}