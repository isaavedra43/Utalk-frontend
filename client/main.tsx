import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/RequireAuth";
import { logger } from "@/lib/utils";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Log de inicio de la aplicación
logger.appStart();

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
      onError: (error: any) => {
        logger.api('Query error', { error: error?.message }, true);
      },
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      onError: (error: any) => {
        logger.api('Mutation error', { error: error?.message }, true);
      },
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
            <Routes>
              {/* Ruta pública de login */}
              <Route 
                path="/login" 
                element={<Login />} 
              />
              
              {/* Rutas protegidas (requieren autenticación) */}
              <Route element={<RequireAuth />}>
                <Route 
                  path="/" 
                  element={<Index />} 
                />
                {/* Ruta para manejar URLs no encontradas en rutas protegidas */}
                <Route 
                  path="*" 
                  element={<NotFound />} 
                />
              </Route>
            </Routes>
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

// Log final de inicialización completa
logger.navigation('Inicialización de la aplicación completada', {
  timestamp: new Date().toISOString(),
  url: window.location.href,
  userAgent: navigator.userAgent
});
