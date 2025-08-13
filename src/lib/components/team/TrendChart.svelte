<!-- TrendChart.svelte -->
<!-- Componente para mostrar gráficos de tendencias -->

<script lang="ts">
  export let title = 'Gráfico de Tendencia';
  export let subtitle = 'Datos de rendimiento a lo largo del tiempo';
  export let data: any[] = [];
  export let loading = false;
  export let error = false;
  export let height = 'h-80'; // Altura fija obligatoria
</script>

<div class="trend-chart {height} bg-white rounded-lg border border-gray-200 p-6">
  <!-- Header del gráfico -->
  <div class="chart-header mb-6">
    <h3 class="chart-title text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <p class="chart-subtitle text-sm text-gray-600">{subtitle}</p>
  </div>

  <!-- Contenido del gráfico -->
  <div class="chart-content">
    {#if loading}
      <!-- Skeleton de carga -->
      <div class="chart-skeleton animate-pulse">
        <div class="skeleton-chart bg-gray-200 rounded-lg w-full h-48"></div>
        <div class="skeleton-legend mt-4 flex justify-center space-x-4">
          <div class="skeleton-legend-item flex items-center space-x-2">
            <div class="w-3 h-3 bg-gray-200 rounded"></div>
            <div class="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div class="skeleton-legend-item flex items-center space-x-2">
            <div class="w-3 h-3 bg-gray-200 rounded"></div>
            <div class="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    {:else if error}
      <!-- Estado de error -->
      <div class="chart-error text-center py-8">
        <svg
          class="w-12 h-12 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h4 class="text-lg font-medium text-gray-900 mb-2">Error al cargar el gráfico</h4>
        <p class="text-gray-600">No se pudieron cargar los datos de tendencia</p>
      </div>
    {:else if data.length === 0}
      <!-- Estado vacío -->
      <div class="chart-empty text-center py-8">
        <svg
          class="w-12 h-12 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h4 class="text-lg font-medium text-gray-900 mb-2">Sin datos disponibles</h4>
        <p class="text-gray-600">No hay datos de tendencia para mostrar en este período</p>
      </div>
    {:else}
      <!-- Gráfico real (placeholder por ahora) -->
      <div class="chart-placeholder">
        <div
          class="chart-area bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 w-full h-48 flex items-center justify-center"
        >
          <div class="text-center">
            <svg
              class="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p class="text-gray-500 font-medium">Gráfico de tendencia</p>
            <p class="text-gray-400 text-sm">Últimos 30 días</p>
          </div>
        </div>

        <!-- Leyenda del gráfico -->
        <div class="chart-legend mt-4 flex justify-center space-x-6">
          <div class="legend-item flex items-center space-x-2">
            <div class="w-3 h-3 bg-blue-500 rounded"></div>
            <span class="text-sm text-gray-600">Chats</span>
          </div>
          <div class="legend-item flex items-center space-x-2">
            <div class="w-3 h-3 bg-green-500 rounded"></div>
            <span class="text-sm text-gray-600">Ventas</span>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Footer del gráfico -->
  <div class="chart-footer mt-4 pt-4 border-t border-gray-200">
    <div class="flex justify-between items-center text-xs text-gray-500">
      <span>Actualizado hace 5 minutos</span>
      <button type="button" class="text-blue-600 hover:text-blue-700 font-medium">
        Actualizar datos
      </button>
    </div>
  </div>
</div>

<style>
  .trend-chart {
    @apply h-80; /* Altura fija obligatoria */
  }

  .chart-skeleton {
    @apply w-full;
  }

  .skeleton-chart {
    @apply w-full h-48;
  }

  .skeleton-legend {
    @apply flex justify-center space-x-4;
  }

  .skeleton-legend-item {
    @apply flex items-center space-x-2;
  }

  .chart-placeholder {
    @apply w-full;
  }

  .chart-area {
    @apply w-full h-48;
  }

  .chart-legend {
    @apply flex justify-center space-x-6;
  }

  .legend-item {
    @apply flex items-center space-x-2;
  }

  /* Animación de pulse */
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
