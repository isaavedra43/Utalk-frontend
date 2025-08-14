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
      <div className={`bg-white rounded-xl border ${borderColor} p-6 hover:shadow-lg transition-all duration-200 cursor-pointer`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className={`flex items-center space-x-1 ${trendColor}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isPositive ? '+' : ''}{trend.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm text-gray-600">{description}</p>
          <p className="text-xs text-gray-500">Anterior: {previousValue}</p>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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