import React, { Suspense, lazy, useState, useEffect, memo } from 'react';

// Lazy loading optimizado de componentes de gráficos
const DonutChart = lazy(() => 
  import('./DonutChart').then(module => ({ 
    default: module.DonutChart 
  }))
);

const BarChart = lazy(() => 
  import('./BarChart').then(module => ({ 
    default: module.BarChart 
  }))
);

const CalendarHeatmap = lazy(() => 
  import('./CalendarHeatmap').then(module => ({ 
    default: module.CalendarHeatmap 
  }))
);

import type { SentimentDistribution, HourlyActivity, ActivityCalendar } from '../../types/dashboard';

interface LazyChartProps {
  type: 'donut' | 'bar' | 'calendar';
  data: SentimentDistribution | HourlyActivity[] | ActivityCalendar;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  onMonthChange?: (month: string) => void;
  loadingDelay?: number; // Delay para mostrar loading
}

// Componente de loading optimizado
const ChartLoading: React.FC<{ height?: number }> = memo(({ height = 200 }) => (
  <div 
    className="flex items-center justify-center bg-gray-50 rounded-lg animate-pulse"
    style={{ height: `${height}px` }}
  >
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-sm text-gray-500">Cargando gráfico...</p>
    </div>
  </div>
));

ChartLoading.displayName = 'ChartLoading';

// Componente de error optimizado
const ChartError: React.FC<{ height?: number }> = memo(({ height = 200 }) => (
  <div 
    className="flex items-center justify-center bg-red-50 border border-red-200 rounded-lg"
    style={{ height: `${height}px` }}
  >
    <div className="text-center">
      <div className="text-red-500 text-2xl mb-2">⚠️</div>
      <p className="text-sm text-red-600">Error al cargar el gráfico</p>
    </div>
  </div>
));

ChartError.displayName = 'ChartError';

// Error Boundary para gráficos
class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode; height?: number },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; height?: number }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ChartError height={this.props.height} />;
    }

    return this.props.children;
  }
}

export const LazyChart: React.FC<LazyChartProps> = memo(({
  type,
  data,
  height = 200,
  showGrid = true,
  showTooltip = true,
  onMonthChange,
  loadingDelay = 100 // Delay mínimo para evitar flash
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simular carga del gráfico con delay mínimo
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, loadingDelay);

    return () => clearTimeout(timer);
  }, [loadingDelay]);

  const renderChart = () => {
    try {
      switch (type) {
        case 'donut':
          if ('positive' in data && 'neutral' in data && 'negative' in data) {
            const sentimentData = data as SentimentDistribution;
            const donutData = [
              { name: 'Positivo', value: sentimentData.positive.percentage, color: '#10B981' },
              { name: 'Neutral', value: sentimentData.neutral.percentage, color: '#6B7280' },
              { name: 'Negativo', value: sentimentData.negative.percentage, color: '#EF4444' }
            ];
            return (
              <DonutChart
                data={donutData}
              />
            );
          }
          break;
          
        case 'bar':
          if (Array.isArray(data) && data.length > 0 && 'hour' in data[0]) {
            return (
              <BarChart
                data={data as HourlyActivity[]}
                height={height}
                showGrid={showGrid}
                showTooltip={showTooltip}
              />
            );
          }
          break;
          
        case 'calendar':
          if ('month' in data && 'year' in data && 'days' in data) {
            return (
              <CalendarHeatmap
                data={data as ActivityCalendar}
                onMonthChange={onMonthChange}
              />
            );
          }
          break;
          
        default:
          return <ChartError height={height} />;
      }
    } catch (error) {
      console.error('Error rendering chart:', error);
      return <ChartError height={height} />;
    }
    
    return <ChartError height={height} />;
  };

  return (
    <ChartErrorBoundary height={height}>
      <Suspense fallback={<ChartLoading height={height} />}>
        {isLoaded ? renderChart() : <ChartLoading height={height} />}
      </Suspense>
    </ChartErrorBoundary>
  );
});

LazyChart.displayName = 'LazyChart'; 