import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Skeleton } from './skeleton';

// Tipos de variantes de loading
type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'bars';
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  text?: string;
  className?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
  showAvatar?: boolean;
}

interface LoadingCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

// Componente principal de Loading
export function Loading({
  variant = 'spinner',
  size = 'md',
  text,
  className,
  fullScreen = false,
  overlay = false
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const renderSpinner = () => (
    <div className="flex items-center justify-center gap-3">
      <Loader2 className={cn('animate-spin text-blue-500', sizeClasses[size])} />
      {text && (
        <span className={cn('text-gray-400', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );

  const renderDots = () => (
    <div className="flex items-center justify-center gap-3">
      <div className="flex gap-1">
        <div className={cn(
          'bg-blue-500 rounded-full animate-bounce',
          size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
        )} style={{ animationDelay: '-0.3s' }}></div>
        <div className={cn(
          'bg-blue-500 rounded-full animate-bounce',
          size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
        )} style={{ animationDelay: '-0.15s' }}></div>
        <div className={cn(
          'bg-blue-500 rounded-full animate-bounce',
          size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
        )}></div>
      </div>
      {text && (
        <span className={cn('text-gray-400', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );

  const renderPulse = () => (
    <div className="flex items-center justify-center gap-3">
      <div className={cn(
        'bg-blue-500 rounded-full animate-pulse',
        sizeClasses[size]
      )}></div>
      {text && (
        <span className={cn('text-gray-400 animate-pulse', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );

  const renderBars = () => (
    <div className="flex items-center justify-center gap-3">
      <div className="flex gap-1 items-end">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-blue-500 animate-pulse',
              size === 'sm' ? 'w-1' : size === 'md' ? 'w-1.5' : size === 'lg' ? 'w-2' : 'w-3',
              i === 1 ? 'h-3' : i === 2 ? 'h-5' : i === 3 ? 'h-4' : 'h-6'
            )}
            style={{ 
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s'
            }}
          ></div>
        ))}
      </div>
      {text && (
        <span className={cn('text-gray-400', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bars':
        return renderBars();
      case 'skeleton':
        return <LoadingSkeleton />;
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className={cn(
      'flex items-center justify-center',
      fullScreen && 'min-h-screen',
      className
    )}>
      {renderContent()}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

// Componente específico para skeletons
export function LoadingSkeleton({ 
  lines = 3, 
  className,
  showAvatar = false 
}: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            'h-4',
            i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full'
          )} 
        />
      ))}
    </div>
  );
}

// Componente para cards con loading
export function LoadingCard({ 
  title = 'Cargando...', 
  description, 
  icon,
  className 
}: LoadingCardProps) {
  return (
    <div className={cn(
      'bg-gray-900 border border-gray-700 rounded-lg p-6 text-center',
      className
    )}>
      {icon ? icon : <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 text-sm">{description}</p>
      )}
    </div>
  );
}

// Hook para manejar estados de loading múltiples
export function useLoadingStates(initialStates: Record<string, boolean> = {}) {
  const [loadingStates, setLoadingStates] = React.useState(initialStates);

  const setLoading = React.useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  const isLoading = React.useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = React.useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
  };
}

// Componente HOC para wrap automático con loading
export function withLoading<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  loadingProps?: Partial<LoadingProps>
) {
  return function WithLoadingComponent(props: T & { isLoading?: boolean }) {
    const { isLoading, ...rest } = props;
    
    if (isLoading) {
      return <Loading {...loadingProps} />;
    }
    
    return <WrappedComponent {...(rest as T)} />;
  };
} 