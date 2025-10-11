// ============================================================================
// UTILIDADES DE FECHA PARA EL SISTEMA
// ============================================================================

/**
 * Formatear fecha en formato legible
 */
export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formatear hora en formato HH:mm
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  return timeString.substring(0, 5); // Solo HH:mm
};

/**
 * Formatear fecha corta
 */
export const formatShortDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Obtener el día de la semana
 */
export const getDayOfWeek = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

/**
 * Verificar si es fin de semana
 */
export const isWeekend = (dateString: string | Date): boolean => {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 || day === 6;
};

/**
 * Verificar si es día laboral
 */
export const isWorkday = (dateString: string | Date): boolean => {
  return !isWeekend(dateString);
};

/**
 * Obtener fechas del mes actual
 */
export const getCurrentMonthDates = (): string[] => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const dates: string[] = [];
  for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
};

/**
 * Obtener rango de fechas para filtros
 */
export const getDateRange = (days: number = 30): { start: string; end: string } => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

/**
 * Formatear horas sin decimales
 */
export const formatHours = (hours: number | string | undefined | null): string => {
  if (hours === undefined || hours === null) {
    return '0h';
  }
  
  // Convertir string a número si es necesario
  const numericHours = typeof hours === 'string' ? parseFloat(hours) : hours;
  
  if (isNaN(numericHours)) {
    return '0h';
  }
  
  // Redondear hacia abajo para eliminar decimales
  const wholeHours = Math.floor(numericHours);
  return `${wholeHours}h`;
};

/**
 * Formatear horas con total acumulado sin decimales
 */
export const formatHoursWithTotal = (hours: number | string | undefined | null, total: number | string | undefined | null): string => {
  const formattedHours = formatHours(hours);
  const formattedTotal = formatHours(total);
  return `${formattedHours} (Total: ${formattedTotal})`;
};
