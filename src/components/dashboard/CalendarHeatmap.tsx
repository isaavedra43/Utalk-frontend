import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ActivityCalendar } from '../../types/dashboard';

interface CalendarHeatmapProps {
  data: ActivityCalendar;
  onMonthChange?: (direction: 'prev' | 'next') => void;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  data,
  onMonthChange
}) => {
  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0:
        return 'bg-gray-100';
      case 1:
        return 'bg-green-200';
      case 2:
        return 'bg-green-300';
      case 3:
        return 'bg-green-400';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-100';
    }
  };

  const getDayLabel = (date: Date) => {
    const day = date.getDate();
    return day.toString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatMonthYear = (month: string, year: number) => {
    return `${month} ${year}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Calendario de Actividad
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onMonthChange?.('prev')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {formatMonthYear(data.month, data.year)}
          </span>
          <button
            onClick={() => onMonthChange?.('next')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtítulo */}
      <p className="text-sm text-gray-500 mb-4">
        Volumen de mensajes por día
      </p>

      {/* Calendario */}
      <div className="mb-6">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="text-xs text-gray-500 text-center py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {data.days.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                day.isCurrentMonth 
                  ? getIntensityColor(day.intensity)
                  : 'bg-gray-50 text-gray-400'
              } ${
                isToday(day.date) 
                  ? 'ring-2 ring-blue-500 ring-offset-2' 
                  : ''
              } ${
                day.messageCount > 0 && day.isCurrentMonth
                  ? 'text-white'
                  : day.isCurrentMonth
                  ? 'text-gray-700'
                  : 'text-gray-400'
              }`}
              title={`${day.date.toLocaleDateString()}: ${day.messageCount} mensajes`}
            >
              {getDayLabel(day.date)}
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Menos</span>
          {data.legend.levels.map((level, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded ${getIntensityColor(level.intensity)}`}
              title={`${level.label}: ${level.intensity} mensajes`}
            />
          ))}
          <span className="text-xs text-gray-500">Más</span>
        </div>
        
        <div className="text-sm text-gray-600">
          Total este mes: {data.totalMessages} mensajes
        </div>
      </div>
    </div>
  );
}; 