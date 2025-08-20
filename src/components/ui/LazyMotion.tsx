import React, { Suspense, lazy, memo } from 'react';

// Lazy loading de Framer Motion
const Motion = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion 
  }))
);

const AnimatePresence = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.AnimatePresence 
  }))
);

interface LazyMotionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Componente de loading para animaciones
const MotionLoading: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// Componente wrapper para motion
export const LazyMotion: React.FC<LazyMotionProps> = memo(({ 
  children, 
  fallback = <MotionLoading /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
});

LazyMotion.displayName = 'LazyMotion';

// Exportar componentes lazy
export { Motion, AnimatePresence }; 