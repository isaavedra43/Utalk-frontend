import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart3,
  PieChart
} from 'lucide-react';

interface AttendanceDataPoint {
  date: string;
  present?: number;
  late?: number;
  absent?: number;
  hours?: number;
  regular?: number;
  overtime?: number;
}

interface AttendanceChartProps {
  data: AttendanceDataPoint[];
  type: 'attendance' | 'hours' | 'punctuality' | 'overtime';
  height?: number;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ 
  data, 
  type, 
  height = 200 
}) => {
  const getMaxValue = () => {
    if (type === 'attendance') {
      return Math.max(...data.map(d => Math.max(d.present || 0, d.late || 0, d.absent || 0)));
    }
    if (type === 'hours') {
      return Math.max(...data.map(d => Math.max(d.regular || 0, d.overtime || 0)));
    }
    return Math.max(...data.map(d => d.hours || 0));
  };

  const getMinValue = () => {
    if (type === 'attendance') {
      return Math.min(...data.map(d => Math.min(d.present || 0, d.late || 0, d.absent || 0)));
    }
    if (type === 'hours') {
      return Math.min(...data.map(d => Math.min(d.regular || 0, d.overtime || 0)));
    }
    return Math.min(...data.map(d => d.hours || 0));
  };

  const getValue = (point: AttendanceDataPoint, field: string) => {
    switch (field) {
      case 'present': return point.present || 0;
      case 'late': return point.late || 0;
      case 'absent': return point.absent || 0;
      case 'regular': return point.regular || 0;
      case 'overtime': return point.overtime || 0;
      case 'hours': return point.hours || 0;
      default: return 0;
    }
  };

  const getColor = (field: string) => {
    switch (field) {
      case 'present': return '#10B981'; // green
      case 'late': return '#F59E0B'; // yellow
      case 'absent': return '#EF4444'; // red
      case 'regular': return '#3B82F6'; // blue
      case 'overtime': return '#F97316'; // orange
      case 'hours': return '#8B5CF6'; // purple
      default: return '#6B7280'; // gray
    }
  };

  const getIcon = (field: string) => {
    switch (field) {
      case 'present': return <CheckCircle className="h-4 w-4" />;
      case 'late': return <AlertTriangle className="h-4 w-4" />;
      case 'absent': return <XCircle className="h-4 w-4" />;
      case 'regular': return <Clock className="h-4 w-4" />;
      case 'overtime': return <TrendingUp className="h-4 w-4" />;
      case 'hours': return <BarChart3 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getLabel = (field: string) => {
    switch (field) {
      case 'present': return 'Presente';
      case 'late': return 'Tardanza';
      case 'absent': return 'Ausente';
      case 'regular': return 'Horas Regulares';
      case 'overtime': return 'Horas Extra';
      case 'hours': return 'Horas Totales';
      default: return 'Datos';
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
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
  const generatePath = (field: string) => {
    if (data.length < 2) return '';
    
    let path = '';
    data.forEach((point, index) => {
      const x = getX(index);
      const y = getY(getValue(point, field));
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  };

  // Generate area path for filled area
  const generateAreaPath = (field: string) => {
    if (data.length < 2) return '';
    
    const linePath = generatePath(field);
    const firstX = getX(0);
    const lastX = getX(data.length - 1);
    const bottomY = height;
    
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const renderChart = () => {
    if (type === 'attendance') {
      return (
        <svg width="100%" height={height} className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Present line */}
          <path
            d={generatePath('present')}
            fill="none"
            stroke={getColor('present')}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Late line */}
          <path
            d={generatePath('late')}
            fill="none"
            stroke={getColor('late')}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5,5"
          />
          
          {/* Absent line */}
          <path
            d={generatePath('absent')}
            fill="none"
            stroke={getColor('absent')}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="10,5"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = getX(index);
            
            return (
              <g key={index}>
                {/* Present point */}
                {point.present && (
                  <circle
                    cx={x}
                    cy={getY(point.present)}
                    r="3"
                    fill={getColor('present')}
                    stroke="white"
                    strokeWidth="2"
                  />
                )}
                
                {/* Late point */}
                {point.late && (
                  <circle
                    cx={x}
                    cy={getY(point.late)}
                    r="3"
                    fill={getColor('late')}
                    stroke="white"
                    strokeWidth="2"
                  />
                )}
                
                {/* Absent point */}
                {point.absent && (
                  <circle
                    cx={x}
                    cy={getY(point.absent)}
                    r="3"
                    fill={getColor('absent')}
                    stroke="white"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
        </svg>
      );
    }

    if (type === 'hours') {
      return (
        <svg width="100%" height={height} className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Regular hours area */}
          <path
            d={generateAreaPath('regular')}
            fill={getColor('regular')}
            fillOpacity="0.3"
          />
          
          {/* Overtime area */}
          <path
            d={generateAreaPath('overtime')}
            fill={getColor('overtime')}
            fillOpacity="0.3"
          />
          
          {/* Regular hours line */}
          <path
            d={generatePath('regular')}
            fill="none"
            stroke={getColor('regular')}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Overtime line */}
          <path
            d={generatePath('overtime')}
            fill="none"
            stroke={getColor('overtime')}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = getX(index);
            
            return (
              <g key={index}>
                {/* Regular hours point */}
                {point.regular && (
                  <circle
                    cx={x}
                    cy={getY(point.regular)}
                    r="3"
                    fill={getColor('regular')}
                    stroke="white"
                    strokeWidth="2"
                  />
                )}
                
                {/* Overtime point */}
                {point.overtime && (
                  <circle
                    cx={x}
                    cy={getY(point.overtime)}
                    r="3"
                    fill={getColor('overtime')}
                    stroke="white"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
        </svg>
      );
    }

    // Default chart for other types
    return (
      <svg width="100%" height={height} className="overflow-visible">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <path
          d={generatePath('hours')}
          fill="none"
          stroke={getColor('hours')}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {data.map((point, index) => {
          const x = getX(index);
          const y = getY(point.hours || 0);
          
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill={getColor('hours')}
                stroke="white"
                strokeWidth="2"
              />
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            {getIcon(type === 'attendance' ? 'present' : type === 'hours' ? 'regular' : 'hours')}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {type === 'attendance' ? 'Asistencia' : 
               type === 'hours' ? 'Distribución de Horas' : 
               type === 'punctuality' ? 'Puntualidad' : 'Horas Extra'}
            </h4>
            <p className="text-sm text-gray-600">Últimos {data.length} días</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600">Promedio</p>
          <p className="font-medium text-gray-900">
            {type === 'attendance' ? 
              `${(data.reduce((sum, d) => sum + (d.present || 0), 0) / data.length).toFixed(1)} días` :
              type === 'hours' ?
              `${(data.reduce((sum, d) => sum + (d.regular || 0) + (d.overtime || 0), 0) / data.length).toFixed(1)}h` :
              `${(data.reduce((sum, d) => sum + (d.hours || 0), 0) / data.length).toFixed(1)}h`
            }
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {renderChart()}
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {data.map((point, index) => (
            <div key={index} className="text-xs text-gray-600 text-center">
              {new Date(point.date).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      {type === 'attendance' && (
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Presente</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full border-2 border-dashed border-yellow-500"></div>
            <span className="text-sm text-gray-600">Tardanza</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-dashed border-red-500"></div>
            <span className="text-sm text-gray-600">Ausente</span>
          </div>
        </div>
      )}

      {type === 'hours' && (
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Horas Regulares</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Horas Extra</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <p className="text-xs text-gray-600">Máximo</p>
          <p className="font-medium text-gray-900">
            {type === 'attendance' ? 
              `${maxValue} días` :
              `${maxValue}h`
            }
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Mínimo</p>
          <p className="font-medium text-gray-900">
            {type === 'attendance' ? 
              `${minValue} días` :
              `${minValue}h`
            }
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Total</p>
          <p className="font-medium text-gray-900">
            {type === 'attendance' ? 
              `${data.reduce((sum, d) => sum + (d.present || 0), 0)} días` :
              `${data.reduce((sum, d) => sum + (d.hours || 0), 0)}h`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export { AttendanceChart };
export default AttendanceChart;
