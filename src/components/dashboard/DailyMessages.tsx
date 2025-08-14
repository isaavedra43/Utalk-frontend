import React, { memo } from 'react';
import { BarChart } from './BarChart';
import { LoadingSpinner } from './LoadingSpinner';

import type { HourlyActivity } from '../../types/dashboard';

interface DailyMessagesProps {
  data: HourlyActivity[];
  totalMessages: number;
  comparison: string;
  peakHour: string;
}

export const DailyMessages = memo<DailyMessagesProps>(({ data, totalMessages, comparison, peakHour }) => {

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Mensajes Diarios</h3>
          <p className="text-sm text-gray-600">Mensajes por hora • Pico: {peakHour}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{totalMessages}</div>
          <div className="text-sm text-green-600 font-medium">{comparison}</div>
        </div>
      </div>

      {/* Gráfico de barras usando recharts */}
      <div className="space-y-4">
        <React.Suspense fallback={<LoadingSpinner text="Cargando gráfico..." />}>
          <BarChart
            data={data}
            height={200}
            showGrid={true}
            showTooltip={true}
          />
        </React.Suspense>

        {/* Leyenda */}
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Horas normales</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-700 rounded"></div>
            <span className="text-sm text-gray-600">Hora pico</span>
          </div>
        </div>
      </div>
    </div>
  );
});

DailyMessages.displayName = 'DailyMessages'; 