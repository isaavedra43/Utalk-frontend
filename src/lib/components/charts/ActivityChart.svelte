<!--
 * ActivityChart Component - UTalk Dashboard
 * Gráfico de barras simple para mostrar actividad por horas del día
 * 
 * Features:
 * - Comparación con día anterior
 * - Identificación automática de hora pico
 * - Chart simple con CSS/SVG
 * - Responsive design
 -->

<script lang="ts">
  import type { ActivityData } from '$lib/types/dashboard';
  import { TrendingDown, TrendingUp } from 'lucide-svelte';

  export let data: ActivityData[] = [];
  export let loading = false;
  export let height = 320;
  export let className = '';

  // Cálculos de datos
  $: totalMessages = data.reduce((sum, item) => sum + item.messages, 0);
  $: previousTotal = data.reduce((sum, item) => sum + item.previousDay, 0);
  $: changePercent =
    previousTotal > 0 ? ((totalMessages - previousTotal) / previousTotal) * 100 : 0;
  $: peakHour =
    data.length > 0
      ? data.reduce((peak, current) => (current.messages > peak.messages ? current : peak), data[0])
      : { hour: '12:00', messages: 0 };

  // Normalizar datos para el chart (altura máxima 100%)
  $: maxMessages = Math.max(...data.map(d => Math.max(d.messages, d.previousDay)), 1);
  $: chartData = data.map(d => ({
    ...d,
    messagesHeight: (d.messages / maxMessages) * 100,
    previousDayHeight: (d.previousDay / maxMessages) * 100
  }));
</script>

<div class="activity-chart-container {className}">
  <!-- Header del chart -->
  <div class="chart-header">
    <div class="title-section">
      <h3 class="chart-title">Actividad del Día</h3>
      <p class="chart-subtitle">
        Mensajes por hora • Pico: {peakHour.hour}
      </p>
    </div>

    <div class="summary-section">
      <div class="total-value">{totalMessages.toLocaleString('es-ES')}</div>
      <div class="change-indicator {changePercent >= 0 ? 'positive' : 'negative'}">
        {#if changePercent >= 0}
          <TrendingUp class="w-4 h-4" />
        {:else}
          <TrendingDown class="w-4 h-4" />
        {/if}
        <span>vs ayer {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%</span>
      </div>
    </div>
  </div>

  <!-- Chart content -->
  {#if loading}
    <div class="chart-skeleton" style="height: {height}px;">
      <div class="animate-pulse">
        <div class="flex items-end justify-between h-full px-4 pb-8">
          {#each Array.from({ length: 24 })}
            <div
              class="bg-gray-200 rounded-t"
              style="height: {Math.random() * 200 + 20}px; width: 8px;"
            ></div>
          {/each}
        </div>
      </div>
    </div>
  {:else if data.length === 0}
    <div class="chart-empty" style="height: {height}px;">
      <div class="empty-content">
        <div class="empty-icon">📊</div>
        <p class="empty-title">Sin datos disponibles</p>
        <p class="empty-description">No hay información de actividad para mostrar</p>
      </div>
    </div>
  {:else}
    <div class="chart-content" style="height: {height}px;">
      <div class="simple-chart">
        <!-- Grid lines -->
        <div class="chart-grid">
          {#each [25, 50, 75, 100] as line}
            <div class="grid-line" style="bottom: {line}%;"></div>
          {/each}
        </div>

        <!-- Y-axis labels -->
        <div class="y-axis">
          {#each [0, Math.round(maxMessages * 0.25), Math.round(maxMessages * 0.5), Math.round(maxMessages * 0.75), maxMessages] as value, i}
            <div class="y-label" style="bottom: {i * 25}%;">
              {value.toLocaleString('es-ES')}
            </div>
          {/each}
        </div>

        <!-- Bars -->
        <div class="bars-container">
          {#each chartData as item}
            <div class="bar-group">
              <!-- Previous day bar (background) -->
              <div
                class="bar bar-previous"
                style="height: {item.previousDayHeight}%;"
                title="Ayer {item.hour}: {item.previousDay} mensajes"
              ></div>

              <!-- Current day bar (foreground) -->
              <div
                class="bar bar-current"
                style="height: {item.messagesHeight}%;"
                title="Hoy {item.hour}: {item.messages} mensajes"
              ></div>

              <!-- Hour label -->
              <div class="hour-label">{item.hour}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Leyenda -->
  <div class="chart-legend">
    <div class="legend-item">
      <div class="legend-color bg-brand-600"></div>
      <span>Mensajes hoy</span>
    </div>
    <div class="legend-item">
      <div class="legend-color bg-gray-400"></div>
      <span>Mensajes ayer</span>
    </div>
  </div>
</div>

<style>
  /* Container */
  .activity-chart-container {
    @apply bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden;
  }

  /* Header */
  .chart-header {
    @apply flex items-start justify-between p-6 pb-4 border-b border-gray-100;
  }

  .title-section {
    @apply flex-1;
  }

  .chart-title {
    @apply text-xl font-semibold text-gray-900 mb-1;
  }

  .chart-subtitle {
    @apply text-sm text-gray-500;
  }

  .summary-section {
    @apply text-right;
  }

  .total-value {
    @apply text-2xl font-bold text-gray-900 mb-1;
  }

  .change-indicator {
    @apply flex items-center gap-1 text-sm font-medium;
  }

  .change-indicator.positive {
    @apply text-success-600;
  }

  .change-indicator.negative {
    @apply text-danger-600;
  }

  /* Chart content */
  .chart-content {
    @apply px-6 pb-4 relative;
  }

  .simple-chart {
    @apply relative w-full h-full;
  }

  /* Grid */
  .chart-grid {
    @apply absolute inset-0 pointer-events-none;
  }

  .grid-line {
    @apply absolute left-0 right-0 h-px bg-gray-100;
  }

  /* Y-axis */
  .y-axis {
    @apply absolute left-0 top-0 bottom-8 w-12;
  }

  .y-label {
    @apply absolute right-2 text-xs text-gray-500 transform -translate-y-1/2;
  }

  /* Bars */
  .bars-container {
    @apply flex items-end justify-between h-full ml-12 mr-4 pb-8;
    gap: 2px;
  }

  .bar-group {
    @apply relative flex-1 flex items-end justify-center;
    max-width: 20px;
  }

  .bar {
    @apply w-full rounded-t transition-all duration-200 hover:opacity-80 cursor-pointer;
    min-height: 2px;
  }

  .bar-previous {
    @apply bg-gray-400 absolute bottom-6;
    width: 80%;
  }

  .bar-current {
    @apply bg-brand-600 relative bottom-6;
    width: 60%;
    z-index: 10;
  }

  .hour-label {
    @apply absolute bottom-0 text-xs text-gray-500 transform -translate-x-1/2;
    left: 50%;
  }

  /* Loading skeleton */
  .chart-skeleton {
    @apply px-6 pb-6;
  }

  /* Empty state */
  .chart-empty {
    @apply flex items-center justify-center px-6;
  }

  .empty-content {
    @apply text-center;
  }

  .empty-icon {
    @apply text-4xl mb-4;
  }

  .empty-title {
    @apply text-lg font-semibold text-gray-900 mb-2;
  }

  .empty-description {
    @apply text-sm text-gray-500;
  }

  /* Legend */
  .chart-legend {
    @apply flex items-center justify-center gap-6 p-4 border-t border-gray-100 bg-gray-50;
  }

  .legend-item {
    @apply flex items-center gap-2 text-sm text-gray-600;
  }

  .legend-color {
    @apply w-3 h-3 rounded-full;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .chart-header {
      @apply flex-col gap-4 items-start;
    }

    .summary-section {
      @apply text-left;
    }

    .chart-title {
      @apply text-lg;
    }

    .total-value {
      @apply text-xl;
    }

    .chart-legend {
      @apply gap-4;
    }

    .bar-group {
      max-width: 12px;
    }

    .hour-label {
      @apply text-xs;
      writing-mode: vertical-lr;
      transform: rotate(180deg) translateY(-50%);
    }
  }

  /* Hover effects */
  .activity-chart-container:hover {
    @apply shadow-md;
  }

  .bar:hover {
    @apply scale-105;
  }
</style>
