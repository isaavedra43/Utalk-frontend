import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { VacationRequest } from '../../../services/vacationsService';

// ============================================================================
// TYPES
// ============================================================================

interface VacationCalendarProps {
  requests: VacationRequest[];
  year?: number;
  month?: number;
  onDayClick?: (date: Date, requests: VacationRequest[]) => void;
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  vacations: VacationRequest[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const VacationCalendar: React.FC<VacationCalendarProps> = ({ 
  requests,
  year: initialYear,
  month: initialMonth,
  onDayClick
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(initialYear || currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialMonth !== undefined ? initialMonth : currentDate.getMonth());

  // Días de la semana
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Nombres de los meses
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Generar días del calendario
  const calendarDays = useMemo((): CalendarDay[] => {
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];

    // Días del mes anterior
    const prevMonthLastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(selectedYear, selectedMonth - 1, prevMonthLastDay - i);
      days.push({
        date,
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        vacations: []
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const isToday = 
        date.getDate() === currentDate.getDate() &&
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear();

      // Buscar vacaciones para este día
      const dayVacations = requests.filter(request => {
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        return date >= startDate && date <= endDate && request.status === 'approved';
      });

      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        isToday,
        vacations: dayVacations
      });
    }

    // Días del siguiente mes para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas × 7 días = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(selectedYear, selectedMonth + 1, day);
      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: false,
        vacations: []
      });
    }

    return days;
  }, [selectedYear, selectedMonth, requests, currentDate]);

  // Navegar entre meses
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goToToday = () => {
    setSelectedYear(currentDate.getFullYear());
    setSelectedMonth(currentDate.getMonth());
  };

  // Obtener color según el tipo de vacación
  const getVacationColor = (type: string) => {
    switch (type) {
      case 'vacation': return 'bg-green-500 text-white';
      case 'personal': return 'bg-blue-500 text-white';
      case 'sick_leave': return 'bg-yellow-500 text-white';
      case 'maternity': return 'bg-pink-500 text-white';
      case 'paternity': return 'bg-purple-500 text-white';
      case 'compensatory': return 'bg-orange-500 text-white';
      case 'unpaid': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[selectedMonth]} {selectedYear}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <CalendarIcon className="h-4 w-4" />
          <span>Hoy</span>
        </button>
      </div>

      {/* Grid del calendario */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-xs font-semibold text-gray-600 uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-24 p-2 border-r border-b border-gray-200 ${
                !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
              } ${day.isToday ? 'bg-blue-50' : ''} ${
                onDayClick ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
              }`}
              onClick={() => onDayClick && onDayClick(day.date, day.vacations)}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-sm font-medium ${
                    !day.isCurrentMonth
                      ? 'text-gray-400'
                      : day.isToday
                      ? 'text-blue-600 font-bold'
                      : 'text-gray-900'
                  }`}
                >
                  {day.dayNumber}
                </span>
                {day.isToday && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </div>

              {/* Vacaciones del día */}
              {day.vacations.length > 0 && (
                <div className="space-y-1">
                  {day.vacations.slice(0, 2).map((vacation) => (
                    <div
                      key={vacation.id}
                      className={`text-xs px-2 py-1 rounded truncate ${getVacationColor(vacation.type)}`}
                      title={vacation.reason}
                    >
                      {vacation.reason}
                    </div>
                  ))}
                  {day.vacations.length > 2 && (
                    <div className="text-xs text-gray-600 px-2">
                      +{day.vacations.length - 2} más
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Tipos de Ausencia</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { type: 'vacation', label: 'Vacaciones' },
            { type: 'personal', label: 'Personal' },
            { type: 'sick_leave', label: 'Enfermedad' },
            { type: 'maternity', label: 'Maternidad' },
            { type: 'paternity', label: 'Paternidad' },
            { type: 'compensatory', label: 'Compensatorio' },
            { type: 'unpaid', label: 'Sin Goce' }
          ].map(({ type, label }) => (
            <div key={type} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${getVacationColor(type)}`}></div>
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen del mes */}
      {requests.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Resumen de {monthNames[selectedMonth]}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600">Total días</p>
              <p className="text-lg font-semibold text-gray-900">
                {requests
                  .filter(r => {
                    const startDate = new Date(r.startDate);
                    return startDate.getMonth() === selectedMonth && 
                           startDate.getFullYear() === selectedYear &&
                           r.status === 'approved';
                  })
                  .reduce((sum, r) => sum + r.days, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Aprobadas</p>
              <p className="text-lg font-semibold text-green-600">
                {requests.filter(r => {
                  const startDate = new Date(r.startDate);
                  return startDate.getMonth() === selectedMonth && 
                         startDate.getFullYear() === selectedYear &&
                         r.status === 'approved';
                }).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Pendientes</p>
              <p className="text-lg font-semibold text-yellow-600">
                {requests.filter(r => {
                  const startDate = new Date(r.startDate);
                  return startDate.getMonth() === selectedMonth && 
                         startDate.getFullYear() === selectedYear &&
                         r.status === 'pending';
                }).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Próximas</p>
              <p className="text-lg font-semibold text-blue-600">
                {requests.filter(r => {
                  const startDate = new Date(r.startDate);
                  return startDate > currentDate && r.status === 'approved';
                }).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacationCalendar;
