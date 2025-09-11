import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface PayrollDataPoint {
  period: string;
  grossSalary: number;
  netSalary: number;
  deductions: number;
  date: string;
}

interface PayrollChartProps {
  data: PayrollDataPoint[];
  type: 'gross' | 'net' | 'deductions' | 'comparison';
  height?: number;
}

const PayrollChart: React.FC<PayrollChartProps> = ({ 
  data, 
  type, 
  height = 200 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getMaxValue = () => {
    if (type === 'comparison') {
      return Math.max(...data.map(d => Math.max(d.grossSalary, d.netSalary)));
    }
    return Math.max(...data.map(d => d[type === 'gross' ? 'grossSalary' : type === 'net' ? 'netSalary' : 'deductions']));
  };

  const getMinValue = () => {
    if (type === 'comparison') {
      return Math.min(...data.map(d => Math.min(d.grossSalary, d.netSalary)));
    }
    return Math.min(...data.map(d => d[type === 'gross' ? 'grossSalary' : type === 'net' ? 'netSalary' : 'deductions']));
  };

  const getValue = (point: PayrollDataPoint) => {
    switch (type) {
      case 'gross': return point.grossSalary;
      case 'net': return point.netSalary;
      case 'deductions': return point.deductions;
      default: return point.grossSalary;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'gross': return '#3B82F6'; // blue
      case 'net': return '#10B981'; // green
      case 'deductions': return '#EF4444'; // red
      default: return '#3B82F6';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'gross': return <DollarSign className="h-4 w-4" />;
      case 'net': return <TrendingUp className="h-4 w-4" />;
      case 'deductions': return <TrendingDown className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'gross': return 'Salario Bruto';
      case 'net': return 'Salario Neto';
      case 'deductions': return 'Deducciones';
      default: return 'Comparación';
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-2" />
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
    return height - ((value - chartMin) / (chartMax - chartMin)) * height;
  };

  const getX = (index: number) => {
    return (index / (data.length - 1)) * 100;
  };

  // Generate SVG path for line chart
  const generatePath = () => {
    if (data.length < 2) return '';
    
    let path = '';
    data.forEach((point, index) => {
      const x = getX(index);
      const y = getY(getValue(point));
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  };

  // Generate area path for filled area
  const generateAreaPath = () => {
    if (data.length < 2) return '';
    
    const linePath = generatePath();
    const firstX = getX(0);
    const lastX = getX(data.length - 1);
    const bottomY = height;
    
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            {getIcon()}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{getLabel()}</h4>
            <p className="text-sm text-gray-600">Últimos {data.length} períodos</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600">Último período</p>
          <p className="font-medium text-gray-900">
            {formatCurrency(getValue(data[data.length - 1]))}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg width="100%" height={height} className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Area fill */}
          {type !== 'comparison' && (
            <path
              d={generateAreaPath()}
              fill={getColor()}
              fillOpacity="0.1"
            />
          )}
          
          {/* Line */}
          <path
            d={generatePath()}
            fill="none"
            stroke={getColor()}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = getX(index);
            const y = getY(getValue(point));
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={getColor()}
                  stroke="white"
                  strokeWidth="2"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill={getColor()}
                  fillOpacity="0.2"
                  className="animate-pulse"
                />
              </g>
            );
          })}
          
          {/* Comparison line for comparison type */}
          {type === 'comparison' && (
            <path
              d={data.map((point, index) => {
                const x = getX(index);
                const y = getY(point.netSalary);
                return index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
              }).join('')}
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5,5"
            />
          )}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {data.map((point, index) => (
            <div key={index} className="text-xs text-gray-600 text-center">
              {point.period.split(' ')[0]}
            </div>
          ))}
        </div>
      </div>

      {/* Legend for comparison */}
      {type === 'comparison' && (
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Salario Bruto</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-dashed border-green-500"></div>
            <span className="text-sm text-gray-600">Salario Neto</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <p className="text-xs text-gray-600">Promedio</p>
          <p className="font-medium text-gray-900">
            {formatCurrency(data.reduce((sum, point) => sum + getValue(point), 0) / data.length)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Máximo</p>
          <p className="font-medium text-gray-900">
            {formatCurrency(maxValue)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Mínimo</p>
          <p className="font-medium text-gray-900">
            {formatCurrency(minValue)}
          </p>
        </div>
      </div>
    </div>
  );
};

export { PayrollChart };
export default PayrollChart;
