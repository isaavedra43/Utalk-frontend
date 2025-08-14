import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'red' | 'blue' | 'green' | 'purple' | 'orange';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  trend,
  loading = false,
  className = '',
  onClick
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return 'border-red-200 bg-red-50';
      case 'green':
        return 'border-green-200 bg-green-50';
      case 'purple':
        return 'border-purple-200 bg-purple-50';
      case 'orange':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const colorClasses = getColorClasses(color);

  if (loading) {
    return (
      <div className={`kpi-card ${colorClasses} ${className}`}>
        <div className="flex items-center justify-between">
          <div className="loading-skeleton loading-skeleton--text w-16 h-6"></div>
          <div className="loading-skeleton loading-skeleton--avatar w-8 h-8"></div>
        </div>
        <div className="loading-skeleton loading-skeleton--text w-24 h-4 mt-2"></div>
      </div>
    );
  }

  return (
    <div
      className={`kpi-card ${colorClasses} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="kpi-card__value">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="kpi-card__icon">
          {icon}
        </div>
      </div>
      
      <div className="kpi-card__label">
        {title}
      </div>
      
      {trend && (
        <div className={`kpi-card__trend ${trend.isPositive ? 'kpi-card__trend--positive' : 'kpi-card__trend--negative'}`}>
          {trend.isPositive ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          <span>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          {trend.label && (
            <span className="ml-1 text-gray-500">
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}; 