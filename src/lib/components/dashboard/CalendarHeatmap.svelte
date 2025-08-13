<!--
 * CalendarHeatmap Component - UTalk Dashboard
 * Vista calendario con intensidad por actividad
 * 
 * Features:
 * - Vista calendario con gradientes de color basados en volumen
 * - Navegación mensual
 * - Tooltips con métricas del día
 * - Responsive design
 -->

<script lang="ts">
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';

  export let className = '';
  export let loading = false;

  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  // Generar datos mock para el calendario
  function generateCalendarData(month: number, year: number) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const data = [];

    // Días del mes anterior
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    for (let i = firstDay - 1; i >= 0; i--) {
      data.push({
        day: daysInPrevMonth - i,
        messages: Math.floor(Math.random() * 200) + 50,
        isPrevMonth: true,
        isNextMonth: false,
        isToday: false
      });
    }

    // Días del mes actual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

      data.push({
        day,
        messages: Math.floor(Math.random() * 500) + 100,
        isPrevMonth: false,
        isNextMonth: false,
        isToday
      });
    }

    // Completar con días del siguiente mes
    const totalCells = 42; // 6 semanas x 7 días
    const remainingCells = totalCells - data.length;
    for (let day = 1; day <= remainingCells; day++) {
      data.push({
        day,
        messages: Math.floor(Math.random() * 200) + 50,
        isPrevMonth: false,
        isNextMonth: true,
        isToday: false
      });
    }

    return data;
  }

  $: calendarData = generateCalendarData(currentMonth, currentYear);
  $: monthName = new Date(currentYear, currentMonth).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  });

  // Calcular el total de mensajes del mes
  $: totalMessages = calendarData
    .filter(day => !day.isPrevMonth && !day.isNextMonth)
    .reduce((sum, day) => sum + day.messages, 0);

  function getIntensityClass(messages: number, isPrevNext: boolean) {
    if (isPrevNext) return 'bg-gray-100 text-gray-400';

    if (messages < 150) return 'bg-green-100 text-green-800';
    if (messages < 250) return 'bg-green-200 text-green-900';
    if (messages < 350) return 'bg-green-300 text-green-900';
    if (messages < 450) return 'bg-green-400 text-white';
    return 'bg-green-500 text-white';
  }

  function navigateMonth(direction: number) {
    if (direction > 0) {
      if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
      } else {
        currentMonth++;
      }
    } else {
      if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
      } else {
        currentMonth--;
      }
    }
  }

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 {className}">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h3 class="text-lg font-semibold text-gray-900">📅 Calendario de Actividad</h3>
      <p class="text-sm text-gray-500">Volumen de mensajes por día</p>
    </div>

    <!-- Navegación del mes -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        on:click={() => navigateMonth(-1)}
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ChevronLeft class="w-4 h-4 text-gray-600" />
      </button>

      <span class="text-sm font-medium text-gray-900 min-w-[120px] text-center">
        {monthName}
      </span>

      <button
        type="button"
        on:click={() => navigateMonth(1)}
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ChevronRight class="w-4 h-4 text-gray-600" />
      </button>
    </div>
  </div>

  {#if loading}
    <!-- Loading skeleton -->
    <div class="animate-pulse">
      <div class="grid grid-cols-7 gap-2 mb-4">
        {#each weekDays as _item}
          <div class="h-8 bg-gray-200 rounded">{_item}</div>
        {/each}
      </div>
      <div class="grid grid-cols-7 gap-2">
        {#each Array(35) as _item, index}
          <div class="h-12 bg-gray-200 rounded" data-index={index}>{_item}</div>
        {/each}
      </div>
    </div>
  {:else}
    <!-- Días de la semana -->
    <div class="grid grid-cols-7 gap-2 mb-3">
      {#each weekDays as weekDay}
        <div class="text-center text-xs font-medium text-gray-500 py-2">
          {weekDay}
        </div>
      {/each}
    </div>

    <!-- Calendario -->
    <div class="grid grid-cols-7 gap-2 mb-6">
      {#each calendarData.slice(0, 42) as dayData}
        <div
          class="aspect-square rounded-lg border transition-all duration-200 hover:scale-105 cursor-pointer flex items-center justify-center text-sm font-medium relative group
          {getIntensityClass(dayData.messages, dayData.isPrevMonth || dayData.isNextMonth)}
          {dayData.isToday ? 'ring-2 ring-blue-500 ring-offset-1' : 'border-gray-200'}"
          title="{dayData.messages} mensajes"
        >
          {dayData.day}

          <!-- Tooltip -->
          <div
            class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
          >
            {dayData.messages} mensajes
          </div>
        </div>
      {/each}
    </div>

    <!-- Leyenda y resumen -->
    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-600">Menos</span>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 bg-green-100 rounded-sm"></div>
          <div class="w-3 h-3 bg-green-200 rounded-sm"></div>
          <div class="w-3 h-3 bg-green-300 rounded-sm"></div>
          <div class="w-3 h-3 bg-green-400 rounded-sm"></div>
          <div class="w-3 h-3 bg-green-500 rounded-sm"></div>
        </div>
        <span class="text-sm text-gray-600">Más</span>
      </div>

      <div class="text-sm text-gray-600">
        Total este mes: <span class="font-medium text-gray-900"
          >{totalMessages.toLocaleString('es-ES')} mensajes</span
        >
      </div>
    </div>
  {/if}
</div>
