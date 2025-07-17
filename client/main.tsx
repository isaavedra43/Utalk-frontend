import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { logger } from "@/lib/utils";
import { AppRoutes } from "@/routes/AppRoutes";

// 🚀 LOGS AVANZADOS DE ARRANQUE DEL SISTEMA
const APP_START_TIME = performance.now();
const BUILD_INFO = {
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL,
  buildTime: new Date().toISOString(),
  userAgent: navigator.userAgent.substring(0, 100) + '...',
  url: window.location.href,
  viewport: `${window.innerWidth}x${window.innerHeight}`,
  platform: navigator.platform
};

// Log de inicio avanzado con información del sistema
console.group('🚀 [SISTEMA] Inicio de UTalk Frontend');
console.info('📱 Información de build:', BUILD_INFO);
console.info('🌐 Información del navegador:', {
  language: navigator.language,
  cookieEnabled: navigator.cookieEnabled,
  onLine: navigator.onLine,
  hardwareConcurrency: navigator.hardwareConcurrency,
  memoryGB: (navigator as any).deviceMemory || 'N/A'
});
console.groupEnd();

logger.appStart();
logger.log('🎯 Sistema UTalk iniciando con logs avanzados');

// Configuración de React Query con logs
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        logger.api('Query retry attempt', {
          failureCount,
          error: error?.message,
          maxRetries: 3
        });
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
        logger.api('Query retry delay', { attemptIndex, delay });
        return delay;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,

    },
          mutations: {
        retry: 1,
        retryDelay: 1000,
      },
  },
});

// Logs de eventos de React Query
queryClient.getQueryCache().subscribe((event) => {
  if (import.meta.env.DEV) {
    logger.api('Query cache event', {
      type: event.type,
      query: event.query?.queryKey
    });
  }
});

queryClient.getMutationCache().subscribe((event) => {
  if (import.meta.env.DEV) {
    logger.api('Mutation cache event', {
      type: event.type,
      mutation: event.mutation?.options?.mutationKey
    });
  }
});

// Manejo global de errores no capturados
window.addEventListener('error', (event) => {
  logger.critical('Error no capturado en la aplicación', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.critical('Promise rechazada no manejada', {
    reason: event.reason,
    promise: event.promise
  });
});

// Log de cambios de visibilidad de la página
document.addEventListener('visibilitychange', () => {
  logger.navigation('Visibilidad de página cambiada', {
    hidden: document.hidden,
    visibilityState: document.visibilityState
  });
});

// Log de cambios de conexión de red
window.addEventListener('online', () => {
  logger.navigation('Conexión a internet restaurada');
});

window.addEventListener('offline', () => {
  logger.navigation('Conexión a internet perdida', null, true);
});

const App = () => {
  logger.navigation('Componente App renderizado');

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Log antes de renderizar la aplicación
logger.navigation('Iniciando renderizado de la aplicación');

const rootElement = document.getElementById("root");
if (!rootElement) {
  logger.critical('Elemento root no encontrado en el DOM');
  throw new Error('Root element not found');
}

logger.navigation('Elemento root encontrado, creando aplicación React');

const root = createRoot(rootElement);
root.render(<App />);

logger.navigation('Aplicación React renderizada exitosamente');

// En desarrollo, mostrar información útil en la consola
if (import.meta.env.DEV) {
  console.log(`
  🚀 UTalk Frontend
  ================
  
  Entorno: Desarrollo
  URL: ${window.location.href}
  
  Utilidades disponibles en consola:
  - logger: Sistema de logs centralizado
  - debugUtils: Utilidades de debugging
  
  Ejemplos:
  - logger.auth('Mensaje de prueba')
  - debugUtils.showAppState()
  - debugUtils.clearAuthData()
  `);
}

// 🏁 LOGS FINALES DE INICIALIZACIÓN COMPLETA
const APP_END_TIME = performance.now();
const TOTAL_INIT_TIME = APP_END_TIME - APP_START_TIME;

console.group('🏁 [SISTEMA] Inicialización de UTalk completada');
console.info('⏱️ Métricas de rendimiento:', {
  'Tiempo total de inicialización': `${TOTAL_INIT_TIME.toFixed(2)}ms`,
  'Estado': 'Completado exitosamente',
  'Timestamp': new Date().toISOString()
});
console.info('📊 Estado del sistema:', {
  'React Query': 'Configurado',
  'Auth Provider': 'Activo', 
  'Router': 'Configurado',
  'Error Handlers': 'Activos',
  'Logs': 'Habilitados'
});
console.groupEnd();

logger.navigation('🎉 Inicialización de la aplicación UTalk completada exitosamente', {
  totalInitTime: `${TOTAL_INIT_TIME.toFixed(2)}ms`,
  timestamp: new Date().toISOString(),
  url: window.location.href,
  componentsLoaded: ['QueryClient', 'AuthProvider', 'Router', 'Toaster'],
  developmentMode: import.meta.env.DEV
});

// Performance mark para métricas adicionales
if ('performance' in window && 'mark' in performance) {
  performance.mark('utalk-app-ready');
  performance.measure('utalk-init-duration', 'navigationStart', 'utalk-app-ready');
}
