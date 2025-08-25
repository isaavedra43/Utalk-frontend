import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import './utils/logCleaner' // Importar para disponibilizar funciones globales de logging
import './utils/consoleExporter' // Importar para disponibilizar exportación de logs
import './styles/dashboard.css'
import { logger } from './utils/logger.ts'

// Configuración específica para React 19
if (typeof window !== 'undefined') {
  // Resolver problema de unstable_now
  if (!window.performance) {
    window.performance = {
      now: () => Date.now(),
      mark: () => {},
      measure: () => {},
      clearMarks: () => {},
      clearMeasures: () => {},
      getEntriesByType: () => [],
      getEntriesByName: () => [],
      getEntries: () => [],
      toJSON: () => ({})
    } as Performance;
  }
  
  // Configurar React 19
  if (React.version.startsWith('19')) {
    // Configuración específica para React 19
    console.log('🔧 React 19 detectado, aplicando configuraciones específicas');
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
