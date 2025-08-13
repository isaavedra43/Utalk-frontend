import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { logger } from './utils/logger.ts'

// Validar configuración al iniciar
logger.systemInfo('Iniciando aplicación UTALK', {
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_NODE_ENV || 'development',
  debug: import.meta.env.VITE_DEBUG === 'true',
  timestamp: new Date().toISOString()
});

// Validar configuración
const { isValid, errors } = logger.validateConfiguration();
if (!isValid) {
  logger.configCritical('Errores de configuración detectados al iniciar', new Error('Configuración inválida'), {
    errors,
    environment: import.meta.env.VITE_NODE_ENV,
    timestamp: new Date().toISOString()
  });
} else {
  logger.configInfo('Configuración válida al iniciar', {
    allSystemsReady: true,
    timestamp: new Date().toISOString()
  });
}

// Configurar QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
