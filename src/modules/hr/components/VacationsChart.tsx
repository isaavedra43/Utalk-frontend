import React from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Calendar,
  Plane,
  User,
  Heart,
  Baby,
  Gift
} from 'lucide-react';

interface VacationDataPoint {
  date: string;
  days: number;
  type: string;
  status: string;
}

interface VacationsChartProps {
  data: VacationDataPoint[];
  type: 'usage' | 'distribution' | 'trends' | 'monthly';
  height?: number;
}

const VacationsChart: React.FC<VacationsChartProps> = ({ 
  data, 
  type, 
  height = 200 
}: VacationsChartProps) => {
  const getMaxValue = (): number => {
    if (data.length === 0) return 10;
    return Math.max(...data.map((d: VacationDataPoint) => d.days), 1);
  };

  const getMinValue = (): number => {
    if (data.length === 0) return 0;
    return Math.min(...data.map((d: VacationDataPoint) => d.days), 0);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacation': return '#3B82F6'; // blue
      case 'personal': return '#8B5CF6'; // purple
      case 'sick_leave': return '#EF4444'; // red
      case 'maternity': return '#F59E0B'; // yellow
      case 'paternity': return '#10B981'; // green
      case 'unpaid': return '#6B7280'; // gray
      case 'compensatory': return '#F97316'; // orange
      default: return '#6B7280'; // gray
    }
  };


  const getTypeText = (type: string) => {
    switch (type) {
      case 'vacation': return 'Vacaciones';
      case 'personal': return 'Personal';
      case 'sick_leave': return 'Incapacidad';
      case 'maternity': return 'Maternidad';
      case 'paternity': return 'Paternidad';
      case 'unpaid': return 'Sin goce';
      case 'compensatory': return 'Compensatorio';
      default: return 'Otro';
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const maxValue = getMaxValue();
  const minValue = getMinValue();
  const range = maxValue - minValue;
  const padding = range * 0.1; // 10% padding
  const chartMax = maxValue + padding;
  const chartMin = Math.max(0, minValue - padding);

  const getY = (value: number) => {
    const range = chartMax - chartMin;
    if (range === 0) return height / 2; // Center if no range
    return height - ((value - chartMin) / range) * height;
  };

  const getX = (index: number) => {
    if (data.length <= 1) return 50; // Center point if only one data point
    return (index / (data.length - 1)) * 100;
  };

  // Generate SVG path for line chart
  const generatePath = (): string => {
    if (data.length < 2) return '';

    let path = '';
    data.forEach((point: VacationDataPoint, index: number) => {
      const x = getX(index);
      const y = getY(point.days);

      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });

    return path;
  };

  // Generate area path for filled area
  const generateAreaPath = (): string => {
    if (data.length < 2) return '';

    const linePath = generatePath();
    const firstX = getX(0);
    const lastX = getX(data.length - 1);
    const bottomY = height;

    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const renderUsageChart = () => {
    return (
      <svg width="100%" height={height} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Area fill */}
        <path
          d={generateAreaPath()}
          fill="#3B82F6"
          fillOpacity="0.1"
        />
        
        {/* Line */}
        <path
          d={generatePath()}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((point: VacationDataPoint, index: number) => {
          const x = getX(index);
          const y = getY(point.days);

          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="#3B82F6"
                stroke="white"
                strokeWidth="2"
              />
              <circle
                cx={x}
                cy={y}
                r="8"
                fill="#3B82F6"
                fillOpacity="0.2"
                className="animate-pulse"
              />
            </g>
          );
        })}
      </svg>
    );
  };

  const renderDistributionChart = () => {
    // Group data by type
    const typeGroups = data.reduce((acc: Record<string, number>, point: VacationDataPoint) => {
      if (!acc[point.type]) {
        acc[point.type] = 0;
      }
      acc[point.type] += point.days;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(typeGroups).reduce((sum: number, days: number) => sum + days, 0);
    const types = Object.keys(typeGroups);

    if (types.length === 0) return null;

    const centerX = 100;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    let currentAngle = 0;
    
    return (
      <svg width="100%" height={height} className="overflow-visible">
        {types.map((type: string) => {
          const days = typeGroups[type];
          const percentage = days / total;
          const angle = percentage * 2 * Math.PI;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          const x1 = centerX + radius * Math.cos(startAngle);
          const y1 = centerY + radius * Math.sin(startAngle);
          const x2 = centerX + radius * Math.cos(endAngle);
          const y2 = centerY + radius * Math.sin(endAngle);

          const largeArcFlag = angle > Math.PI ? 1 : 0;

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          currentAngle += angle;

          return (
            <path
              key={type}
              d={pathData}
              fill={getTypeColor(type)}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
        
        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r="30"
          fill="white"
          stroke="#E5E7EB"
          strokeWidth="2"
        />
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          className="text-sm font-medium text-gray-900"
        >
          {total}
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          className="text-xs text-gray-500"
        >
          días
        </text>
      </svg>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'usage':
        return renderUsageChart();
      case 'distribution':
        return renderDistributionChart();
      default:
        return renderUsageChart();
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            {type === 'usage' ? <BarChart3 className="h-4 w-4" /> : <PieChart className="h-4 w-4" />}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {type === 'usage' ? 'Uso de Vacaciones' : 
               type === 'distribution' ? 'Distribución por Tipo' : 
               type === 'trends' ? 'Tendencias' : 'Uso Mensual'}
            </h4>
            <p className="text-sm text-gray-600">Últimos {data.length} períodos</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600">Total</p>
          <p className="font-medium text-gray-900">
            {data.reduce((sum, d) => sum + d.days, 0)} días
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {renderChart()}
        
        {/* X-axis labels for usage chart */}
        {type === 'usage' && (
          <div className="flex justify-between mt-2">
            {data.map((point: VacationDataPoint, index: number) => (
              <div key={index} className="text-xs text-gray-600 text-center">
                {new Date(point.date).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend for distribution chart */}
      {type === 'distribution' && (
        <div className="flex flex-wrap items-center justify-center space-x-4 mt-4">
          {Object.entries(
            data.reduce((acc: Record<string, number>, point: VacationDataPoint) => {
              if (!acc[point.type]) {
                acc[point.type] = 0;
              }
              acc[point.type] += point.days;
              return acc;
            }, {} as Record<string, number>)
          ).map(([type, days]: [string, number]) => (
            <div key={type} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getTypeColor(type) }}
              ></div>
              <span className="text-sm text-gray-600">{getTypeText(type)}</span>
              <span className="text-sm font-medium text-gray-900">({days}d)</span>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <p className="text-xs text-gray-600">Promedio</p>
          <p className="font-medium text-gray-900">
            {data.length > 0 ? (data.reduce((sum: number, d: VacationDataPoint) => sum + d.days, 0) / data.length).toFixed(1) : '0.0'} días
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Máximo</p>
          <p className="font-medium text-gray-900">
            {maxValue} días
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Mínimo</p>
          <p className="font-medium text-gray-900">
            {minValue} días
          </p>
        </div>
      </div>
    </div>
  );
};

export { VacationsChart };
export default VacationsChart;
