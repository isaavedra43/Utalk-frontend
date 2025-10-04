import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Plus,
  Eye,
  Settings,
  Download,
  RefreshCw,
  MapPin,
  Building,
  User
} from 'lucide-react';
import { useVacationsManagement } from '../../../../hooks/useVacationsManagement';
import { useNotifications } from '../../../../contexts/NotificationContext';
import {
  VacationCalendarView,
  VacationConflict,
  VacationType
} from '../../../../services/vacationsManagementService';

// ============================================================================
// TYPES
// ============================================================================

interface VacationsCalendarTabProps {}

// ============================================================================
// CALENDAR DAY COMPONENT
// ============================================================================

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: any[];
  conflicts: VacationConflict[];
  utilization: number;
  capacity: number;
  onClick: () => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  events,
  conflicts,
  utilization,
  capacity,
  onClick
}) => {
  const dayEvents = events.filter(event =>
    new Date(event.startDate) <= date && new Date(event.endDate) >= date
  );

  const dayConflicts = conflicts.filter(conflict =>
    new Date(conflict.date).toDateString() === date.toDateString()
  );

  const getUtilizationColor = (util: number) => {
    if (util <= 30) return 'bg-green-100 border-green-300';
    if (util <= 60) return 'bg-yellow-100 border-yellow-300';
    if (util <= 80) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  };

  const getUtilizationText = (util: number) => {
    if (util <= 30) return 'text-green-800';
    if (util <= 60) return 'text-yellow-800';
    if (util <= 80) return 'text-orange-800';
    return 'text-red-800';
  };

  return (
    <div
      className={`min-h-24 p-2 border cursor-pointer transition-all hover:shadow-md ${
        !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
      } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
        isSelected ? 'bg-blue-50 border-blue-300' : ''
      } ${getUtilizationColor(utilization)}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={`text-sm font-medium ${
          isToday ? 'text-blue-600 font-bold' : 'text-gray-900'
        }`}>
          {date.getDate()}
        </span>

        {utilization > 0 && (
          <span className={`text-xs font-medium ${getUtilizationText(utilization)}`}>
            {utilization}%
          </span>
        )}
      </div>

      <div className="space-y-1">
        {dayEvents.slice(0, 3).map((event, index) => (
          <div
            key={index}
            className={`text-xs px-1 py-0.5 rounded truncate ${
              event.status === 'approved' ? 'bg-green-200 text-green-800' :
              event.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
              'bg-gray-200 text-gray-800'
            }`}
            title={`${event.employeeName} - ${event.type}`}
          >
            {event.employeeName.split(' ')[0]}
          </div>
        ))}

        {dayEvents.length > 3 && (
          <div className="text-xs text-gray-600 px-1">
            +{dayEvents.length - 3} más
          </div>
        )}

        {dayConflicts.length > 0 && (
          <div className="flex items-center space-x-1 mt-1">
            <AlertTriangle className="h-3 w-3 text-red-600" />
            <span className="text-xs text-red-700 font-medium">
              {dayConflicts.length} conflicto{dayConflicts.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MONTH VIEW COMPONENT
// ============================================================================

interface MonthViewProps {
  calendarView: VacationCalendarView | null;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: any) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  calendarView,
  selectedDate,
  onDateSelect,
  onEventClick
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        events: [],
        conflicts: [],
        utilization: 0,
        capacity: 0
      });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();

      // Find events for this day
      const dayEvents = calendarView?.events.filter(event =>
        new Date(event.startDate) <= date && new Date(event.endDate) >= date
      ) || [];

      // Find conflicts for this day
      const dayConflicts = calendarView?.conflicts.filter(conflict =>
        new Date(conflict.date).toDateString() === date.toDateString()
      ) || [];

      // Calculate utilization
      const utilization = calendarView?.utilization[date.toISOString().split('T')[0]] || 0;
      const capacity = calendarView?.capacity[date.toISOString().split('T')[0]] || 100;

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        events: dayEvents,
        conflicts: dayConflicts,
        utilization,
        capacity
      });
    }

    // Next month days to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        events: [],
        conflicts: [],
        utilization: 0,
        capacity: 0
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
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

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-px">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {calendarDays.map((day, index) => (
          <CalendarDay
            key={index}
            date={day.date}
            isCurrentMonth={day.isCurrentMonth}
            isToday={day.isToday}
            isSelected={day.date.toDateString() === selectedDate.toDateString()}
            events={day.events}
            conflicts={day.conflicts}
            utilization={day.utilization}
            capacity={day.capacity}
            onClick={() => onDateSelect(day.date)}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// DAY DETAILS MODAL COMPONENT
// ============================================================================

interface DayDetailsModalProps {
  isOpen: boolean;
  date: Date | null;
  events: any[];
  conflicts: VacationConflict[];
  onClose: () => void;
  onEventClick: (event: any) => void;
}

const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  date,
  events,
  conflicts,
  onClose,
  onEventClick
}) => {
  if (!isOpen || !date) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventIcon = (type: VacationType) => {
    switch (type) {
      case 'vacation': return <CalendarIcon className="h-4 w-4 text-blue-600" />;
      case 'sick_leave': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'personal': return <User className="h-4 w-4 text-purple-600" />;
      default: return <CalendarIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {formatDate(date)}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-red-900 mb-3 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Conflictos ({conflicts.length})</span>
              </h4>
              <div className="space-y-3">
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-900 mb-1">
                      {conflict.employeeCount} empleados en vacaciones simultáneas
                    </p>
                    <p className="text-xs text-red-700 mb-2">{conflict.reason}</p>
                    <div className="flex flex-wrap gap-1">
                      {conflict.employees.slice(0, 3).map((employee) => (
                        <span key={employee.id} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          {employee.name}
                        </span>
                      ))}
                      {conflict.employees.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          +{conflict.employees.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Vacaciones ({events.length})</span>
            </h4>

            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay vacaciones programadas para este día</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onEventClick(event)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getEventIcon(event.type)}
                        <span className="font-medium text-gray-900">{event.employeeName}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.status === 'approved' ? 'bg-green-100 text-green-800' :
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Tipo:</strong> {event.type}</p>
                      <p><strong>Departamento:</strong> {event.department}</p>
                      <p><strong>Posición:</strong> {event.position}</p>
                      {event.replacementEmployee && (
                        <p><strong>Reemplazo:</strong> {event.replacementEmployee}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VacationsCalendarTab: React.FC<VacationsCalendarTabProps> = () => {
  const { showSuccess, showError } = useNotifications();

  const {
    calendarView,
    loading,
    loadCalendarView,
    checkCapacity
  } = useVacationsManagement();

  // Local state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [dayDetails, setDayDetails] = useState<{
    date: Date;
    events: any[];
    conflicts: VacationConflict[];
  } | null>(null);

  // Load calendar data for current month
  React.useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    loadCalendarView(year, month);
  }, [selectedDate, loadCalendarView]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDayDetails(true);

    // Get events and conflicts for selected date
    const dayEvents = calendarView?.events.filter(event =>
      new Date(event.startDate) <= date && new Date(event.endDate) >= date
    ) || [];

    const dayConflicts = calendarView?.conflicts.filter(conflict =>
      new Date(conflict.date).toDateString() === date.toDateString()
    ) || [];

    setDayDetails({
      date,
      events: dayEvents,
      conflicts: dayConflicts
    });
  };

  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event);
    // This would open the event details or navigate to the request
  };

  const handleCapacityCheck = async () => {
    try {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const capacity = await checkCapacity(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      if (capacity.available) {
        showSuccess('Capacidad disponible para nuevas vacaciones');
      } else {
        showError(`Conflictos detectados: ${capacity.conflicts.join(', ')}`);
      }
    } catch (error) {
      showError('Error al verificar capacidad');
    }
  };

  // Calculate calendar stats
  const calendarStats = useMemo(() => {
    if (!calendarView) return null;

    const totalEmployees = calendarView.events.length;
    const approvedEvents = calendarView.events.filter(e => e.status === 'approved').length;
    const pendingEvents = calendarView.events.filter(e => e.status === 'pending').length;
    const conflictsCount = calendarView.conflicts.length;

    return {
      totalEmployees,
      approvedEvents,
      pendingEvents,
      conflictsCount
    };
  }, [calendarView]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Empleados</p>
              <p className="text-2xl font-bold text-blue-600">{calendarStats?.totalEmployees || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-green-600">{calendarStats?.approvedEvents || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{calendarStats?.pendingEvents || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conflictos</p>
              <p className="text-2xl font-bold text-red-600">{calendarStats?.conflictsCount || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCapacityCheck}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Verificar Capacidad</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Nueva Vacación</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Exportar calendario">
            <Download className="h-5 w-5" />
          </button>

          <button
            onClick={() => loadCalendarView(selectedDate.getFullYear(), selectedDate.getMonth())}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`h-5 w-5 ${loading.calendar ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <MonthView
        calendarView={calendarView}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onEventClick={handleEventClick}
      />

      {/* Legend */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Leyenda</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm text-gray-600">Baja ocupación</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span className="text-sm text-gray-600">Media ocupación</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
            <span className="text-sm text-gray-600">Alta ocupación</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-sm text-gray-600">Sobrecarga</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-gray-600">Conflicto</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Hoy</span>
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      <DayDetailsModal
        isOpen={showDayDetails}
        date={dayDetails?.date || null}
        events={dayDetails?.events || []}
        conflicts={dayDetails?.conflicts || []}
        onClose={() => setShowDayDetails(false)}
        onEventClick={handleEventClick}
      />
    </div>
  );
};

export default VacationsCalendarTab;
