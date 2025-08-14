import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'red' | 'gray' | 'white';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const colorClasses = {
  blue: 'border-blue-500',
  green: 'border-green-500',
  red: 'border-red-500',
  gray: 'border-gray-500',
  white: 'border-white'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  text,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
          animate-spin rounded-full border-2 border-t-transparent
          ${sizeClasses[size]} ${colorClasses[color]}
        `}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Componente de loading para secciones específicas
export const SectionLoading: React.FC<{ text?: string }> = ({ text = 'Cargando...' }) => (
  <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

// Componente de loading para gráficos
export const ChartLoading: React.FC = () => (
  <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
    <LoadingSpinner size="lg" text="Cargando gráfico..." />
  </div>
);

// Componente de loading para métricas
export const MetricLoading: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <LoadingSpinner size="md" />
  </div>
);

// Componente de loading para listas
export const ListLoading: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
); 