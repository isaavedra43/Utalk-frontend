import { memo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MetricTooltip } from './Tooltip';
import type { DashboardMetrics } from '../../types/dashboard';

interface KPICardsProps {
  metrics: DashboardMetrics;
}

const KPICard = memo<{
  title: string;
  value: string | number;
  description: string;
  trend: number;
  previousValue: string | number;
  icon: string;
}>(({ title, value, description, trend, previousValue, icon }) => {
  const isPositive = trend >= 0;
  const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';
  const borderColor = isPositive ? 'border-green-200' : 'border-red-200';

  return (
    <MetricTooltip
      title={title}
      value={value}
      description={description}
      trend={`${isPositive ? '+' : ''}${trend.toFixed(1)}%`}
    >
      <div className={`bg-white rounded-xl border ${borderColor} p-4 hover:shadow-lg transition-all duration-200 cursor-pointer h-44 flex flex-col justify-between overflow-hidden`}>
        {/* Header con icono y tendencia */}
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <span className="text-xl">{icon}</span>
          </div>
          <div className={`flex items-center space-x-1 ${trendColor} flex-shrink-0`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="text-xs font-medium">
              {isPositive ? '+' : ''}{trend.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col justify-between min-h-0">
          <div className="space-y-2 min-h-0">
            <h3 className="text-xl font-bold text-gray-900 leading-tight truncate">{value}</h3>
            <p className="text-xs text-gray-600 leading-tight line-clamp-2 overflow-hidden">{description}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2 pt-1 border-t border-gray-100 truncate">Anterior: {previousValue}</p>
        </div>
      </div>
    </MetricTooltip>
  );
});

KPICard.displayName = 'KPICard';

export const KPICards = memo<KPICardsProps>(({ metrics }) => {
  const cards = [
    {
      key: 'globalSentiment',
      title: 'Sentimiento Global',
      metric: metrics.globalSentiment,
    },
    {
      key: 'averageResponseTime',
      title: 'Tiempo Medio de Respuesta',
      metric: metrics.averageResponseTime,
    },
    {
      key: 'resolvedConversations',
      title: 'Conversaciones Resueltas',
      metric: metrics.resolvedConversations,
    },
    {
      key: 'salesFromChats',
      title: 'Ventas desde Chats',
      metric: metrics.salesFromChats,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, title, metric }) => (
        <KPICard
          key={key}
          title={title}
          value={metric.value}
          description={metric.description}
          trend={metric.trend}
          previousValue={metric.previousValue}
          icon={metric.icon}
        />
      ))}
    </div>
  );
});

KPICards.displayName = 'KPICards'; 