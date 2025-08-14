import React, { Suspense, lazy, useState, useEffect } from 'react';

// Lazy loading de componentes de gráficos
const DonutChart = lazy(() => import('./DonutChart').then(module => ({ default: module.DonutChart })));
const BarChart = lazy(() => import('./BarChart').then(module => ({ default: module.BarChart })));
const CalendarHeatmap = lazy(() => import('./CalendarHeatmap').then(module => ({ default: module.CalendarHeatmap })));

import type { SentimentDistribution, HourlyActivity, ActivityCalendar } from '../../types/dashboard';

interface LazyChartProps {
  type: 'donut' | 'bar' | 'calendar';
  data: SentimentDistribution | HourlyActivity[] | ActivityCalendar;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  onMonthChange?: (month: string) => void;
}

// Componente de loading para gráficos
const ChartLoading: React.FC = () => (
  <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
      <p className="text-sm text-gray-500">Cargando gráfico...</p>
    </div>
  </div>
);

// Componente de error para gráficos
const ChartError: React.FC = () => (
  <div className="flex items-center justify-center h-48 bg-red-50 rounded-lg">
    <div className="text-center">
      <div className="text-red-500 text-2xl mb-2">📊</div>
      <p className="text-sm text-red-600">Error al cargar el gráfico</p>
    </div>
  </div>
);

export const LazyChart: React.FC<LazyChartProps> = ({
  type,
  data,
  height = 200,
  showGrid = true,
  showTooltip = true,
  onMonthChange
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simular carga del gráfico
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const renderChart = () => {
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
        return <ChartError />;
    }
    return <ChartError />;
  };

  return (
    <Suspense fallback={<ChartLoading />}>
      {isLoaded ? renderChart() : <ChartLoading />}
    </Suspense>
  );
}; 