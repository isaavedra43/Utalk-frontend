import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { HourlyActivity } from '../../types/dashboard';

interface BarChartProps {
  data: HourlyActivity[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 300,
  showGrid = true,
  showTooltip = true
}) => {
  const CustomTooltip = ({ active, payload, label }: { 
    active?: boolean; 
    payload?: Array<{ value: number; payload: HourlyActivity }>; 
    label?: string 
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{data.value}</span> mensajes
          </p>
          {data.payload.isPeak && (
            <p className="text-xs text-blue-600 font-medium">Hora pico</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis 
          dataKey="hour" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
        />
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        <Bar 
          dataKey="messages" 
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          fillOpacity={0.8}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}; 