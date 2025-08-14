import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { SentimentDistribution } from '../../types/dashboard';

interface DonutChartProps {
  data: SentimentDistribution;
  size?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 200,
  showLegend = true,
  showTooltip = true
}) => {
  // Transformar datos para recharts
  const chartData = [
    {
      name: 'Positivo',
      value: data.positive.count,
      percentage: data.positive.percentage,
      color: data.positive.color,
      icon: data.positive.icon
    },
    {
      name: 'Neutro',
      value: data.neutral.count,
      percentage: data.neutral.percentage,
      color: data.neutral.color,
      icon: data.neutral.icon
    },
    {
      name: 'Negativo',
      value: data.negative.count,
      percentage: data.negative.percentage,
      color: data.negative.color,
      icon: data.negative.icon
    }
  ];

  const COLORS = [data.positive.color, data.neutral.color, data.negative.color];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { icon: string; percentage: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{data.payload.icon}</span>
            <span className="font-semibold text-gray-900">{data.name}</span>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{data.value}</span> mensajes
          </p>
          <p className="text-sm text-gray-500">
            {data.payload.percentage.toFixed(1)}% del total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: { payload: Array<{ value: string; color: string; payload: { icon: string; value: number; percentage: number } }> }) => {
    return (
      <div className="flex flex-col space-y-3 mt-4">
        {payload.map((entry, index: number) => (
          <div key={`legend-${index}`} className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <div className="flex items-center space-x-2">
              <span className="text-lg">{entry.payload.icon}</span>
              <span className="text-sm font-medium text-gray-700">
                {entry.value}
              </span>
            </div>
            <div className="flex-1 text-right">
              <span className="text-sm text-gray-600">
                {entry.payload.value} mensajes
              </span>
              <span className="text-sm text-gray-500 ml-2">
                ({entry.payload.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={size}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.3}
            outerRadius={size * 0.4}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
        </PieChart>
      </ResponsiveContainer>
      
      {showLegend && (
        <CustomLegend payload={chartData.map((item, index) => ({
          value: item.name,
          color: COLORS[index],
          payload: item
        }))} />
      )}
    </div>
  );
}; 