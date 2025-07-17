import React from 'react';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  Wifi, 
  RefreshCw, 
  Home, 
  AlertCircle,
  ServerCrash,
  ShieldAlert,
  FileX
} from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription } from './alert';

type ErrorType = 'network' | 'server' | 'permission' | 'notFound' | 'validation' | 'generic';
type ErrorSize = 'sm' | 'md' | 'lg';

interface ErrorStateProps {
  type?: ErrorType;
  size?: ErrorSize;
  title?: string;
  description?: string;
  error?: Error | string;
  retry?: () => void;
  goHome?: () => void;
  className?: string;
  showDetails?: boolean;
  actions?: React.ReactNode;
}

interface ErrorBoundaryFallbackProps {
  error?: Error;
  resetError?: () => void;
  errorId?: string;
}

// Configuraciones predefinidas por tipo de error
const errorConfigs = {
  network: {
    icon: Wifi,
    title: 'Sin conexión',
    description: 'Verifica tu conexión a internet e intenta nuevamente.',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-500/30'
  },
  server: {
    icon: ServerCrash,
    title: 'Error del servidor',
    description: 'Estamos experimentando problemas técnicos. Intenta más tarde.',
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-500/30'
  },
  permission: {
    icon: ShieldAlert,
    title: 'Acceso denegado',
    description: 'No tienes permisos para realizar esta acción.',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-500/30'
  },
  notFound: {
    icon: FileX,
    title: 'No encontrado',
    description: 'El recurso que buscas no existe o ha sido eliminado.',
    color: 'text-gray-400',
    bgColor: 'bg-gray-800/20',
    borderColor: 'border-gray-600/30'
  },
  validation: {
    icon: AlertCircle,
    title: 'Datos inválidos',
    description: 'Revisa la información ingresada e intenta nuevamente.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/30'
  },
  generic: {
    icon: AlertTriangle,
    title: 'Error inesperado',
    description: 'Algo salió mal. Nuestro equipo ha sido notificado.',
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-500/30'
  }
};

// Componente principal de ErrorState
export function ErrorState({
  type = 'generic',
  size = 'md',
  title,
  description,
  error,
  retry,
  goHome,
  className,
  showDetails = false,
  actions
}: ErrorStateProps) {
  const config = errorConfigs[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      container: 'p-4',
      icon: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-sm',
      button: 'text-sm'
    },
    md: {
      container: 'p-6',
      icon: 'h-12 w-12',
      title: 'text-xl',
      description: 'text-base',
      button: 'text-base'
    },
    lg: {
      container: 'p-8',
      icon: 'h-16 w-16',
      title: 'text-2xl',
      description: 'text-lg',
      button: 'text-lg'
    }
  };

  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center space-y-4',
      'bg-gray-900 border border-gray-700 rounded-lg',
      config.bgColor,
      config.borderColor,
      sizeClasses[size].container,
      className
    )}>
      {/* Icono principal */}
      <div className={cn(
        'flex items-center justify-center rounded-full p-3',
        config.bgColor,
        config.borderColor,
        'border'
      )}>
        <Icon className={cn(config.color, sizeClasses[size].icon)} />
      </div>

      {/* Título y descripción */}
      <div className="space-y-2">
        <h3 className={cn(
          'font-semibold text-white',
          sizeClasses[size].title
        )}>
          {title || config.title}
        </h3>
        <p className={cn(
          'text-gray-400 max-w-md',
          sizeClasses[size].description
        )}>
          {description || config.description}
        </p>
      </div>

      {/* Detalles del error (modo desarrollo) */}
      {showDetails && errorMessage && (
        <Alert className={cn('max-w-md text-left', config.borderColor, config.bgColor)}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs text-gray-300 font-mono">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Acciones */}
      {(retry || goHome || actions) && (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          {retry && (
            <Button
              onClick={retry}
              className={cn(
                'bg-blue-600 hover:bg-blue-700',
                sizeClasses[size].button
              )}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          )}
          {goHome && (
            <Button
              onClick={goHome}
              variant="outline"
              className={cn(
                'border-gray-600 text-gray-300 hover:bg-gray-700',
                sizeClasses[size].button
              )}
            >
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </Button>
          )}
          {actions}
        </div>
      )}
    </div>
  );
}

// Componente específico para Error Boundary fallback
export function ErrorBoundaryFallback({
  error,
  resetError,
  errorId
}: ErrorBoundaryFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <ErrorState
          type="generic"
          size="lg"
          title="Algo salió mal"
          description="Se produjo un error inesperado en la aplicación."
          error={error}
          showDetails={process.env.NODE_ENV === 'development'}
          actions={
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {resetError && (
                <Button onClick={resetError} className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              )}
              <Button 
                onClick={handleReload} 
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recargar
              </Button>
              <Button 
                onClick={handleGoHome} 
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Button>
            </div>
          }
        />

        {/* Información de contacto */}
        {errorId && (
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>
              Si el problema persiste, contacta a soporte técnico con el ID:
            </p>
            <code className="bg-gray-800 px-2 py-1 rounded mt-1 inline-block">
              {errorId}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook para manejar errores de manera consistente
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error | string, context?: string) => {
    console.error(`[${context || 'Unknown'}]`, error);
    
    // Aquí podrías enviar el error a un servicio de logging
    // como Sentry, LogRocket, etc.
    
    return error instanceof Error ? error.message : error;
  }, []);

  return { handleError };
}

// Utilidades para crear errores tipificados
export const createError = {
  network: (message?: string) => ({
    type: 'network' as const,
    message: message || 'Error de conexión'
  }),
  server: (message?: string) => ({
    type: 'server' as const,
    message: message || 'Error del servidor'
  }),
  permission: (message?: string) => ({
    type: 'permission' as const,
    message: message || 'Sin permisos'
  }),
  notFound: (message?: string) => ({
    type: 'notFound' as const,
    message: message || 'No encontrado'
  }),
  validation: (message?: string) => ({
    type: 'validation' as const,
    message: message || 'Datos inválidos'
  })
}; 