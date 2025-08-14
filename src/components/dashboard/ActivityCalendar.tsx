import React, { memo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayData {
  date: Date;
  count: number;
  hasAlert?: boolean;
}

interface ActivityCalendarProps {
  data: DayData[];
  month: Date;
  totalMessages: number;
}

const getWeekDays = () => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const getIntensityColor = (count: number, maxCount: number) => {
  if (count === 0) return 'bg-gray-50';
  const intensity = Math.min(count / maxCount, 1);
  if (intensity > 0.8) return 'bg-green-600';
  if (intensity > 0.6) return 'bg-green-500';
  if (intensity > 0.4) return 'bg-green-400';
  if (intensity > 0.2) return 'bg-green-300';
  return 'bg-green-200';
};

export const ActivityCalendar = memo<ActivityCalendarProps>(({ data, month, totalMessages }) => {
  const [currentMonth, setCurrentMonth] = useState(month);

  const maxCount = Math.max(...data.map(d => d.count), 1);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior para completar la primera semana
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        count: 0,
        isOtherMonth: true
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayData = data.find(d => 
        d.date.getDate() === day && 
        d.date.getMonth() === month && 
        d.date.getFullYear() === year
      );
      
      days.push({
        date,
        count: dayData?.count || 0,
        hasAlert: dayData?.hasAlert || false,
        isOtherMonth: false
      });
    }

    // Días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        count: 0,
        isOtherMonth: true
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Calendario de Actividad</h3>
          <p className="text-sm text-gray-600">Volumen de mensajes por día</p>
        </div>
      </div>

      {/* Navegación del mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h4 className="text-md font-medium text-gray-900 capitalize">{monthName}</h4>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {getWeekDays().map((day) => (
          <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map((day, index) => (
          <div
            key={index}
            className={`relative aspect-square rounded-sm flex items-center justify-center text-xs font-medium transition-colors ${
              day.isOtherMonth 
                ? 'text-gray-300' 
                : day.count === 0 
                  ? 'text-gray-400' 
                  : 'text-white'
            } ${getIntensityColor(day.count, maxCount)}`}
          >
            {day.date.getDate()}
            {day.hasAlert && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-600">Menos</span>
        <div className="flex space-x-1">
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity * maxCount, maxCount)}`}
            ></div>
          ))}
        </div>
        <span className="text-xs text-gray-600">Más</span>
      </div>

      {/* Total del mes */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Total este mes: <span className="font-medium text-gray-900">{totalMessages} mensajes</span>
        </p>
      </div>
    </div>
  );
});

ActivityCalendar.displayName = 'ActivityCalendar'; 