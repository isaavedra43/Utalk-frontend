<!-- KPIMetrics.svelte -->
<!-- Componente para mostrar métricas KPI con colores semánticos -->

<script lang="ts">
  export let title: string;
  export let value: string | number;
  export let change: number = 0; // Porcentaje de cambio
  export let status: 'improving' | 'declining' | 'stable' | 'attention' = 'stable';
  export let icon: string = '';
  export let loading: boolean = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';

  // Determinar colores semánticos basados en el estado
  $: statusColors = {
    improving: {
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-500'
    },
    declining: {
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500'
    },
    stable: {
      text: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-500'
    },
    attention: {
      text: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-500'
    }
  };

  // Obtener colores del estado actual
  $: currentColors = statusColors[status];

  // Formatear el cambio
  $: changeText = change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  $: changeIcon = change > 0 ? '↗' : change < 0 ? '↘' : '→';

  // Clases de tamaño
  $: sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
</script>

<div
  class="kpi-metric {sizeClasses[
    size
  ]} bg-white rounded-lg border {currentColors.border} hover:shadow-sm transition-all duration-200"
>
  {#if loading}
    <!-- Skeleton de carga -->
    <div class="animate-pulse">
      <div class="flex items-center justify-between mb-3">
        <div class="w-6 h-6 bg-gray-200 rounded"></div>
        <div class="w-16 h-4 bg-gray-200 rounded"></div>
      </div>
      <div class="space-y-2">
        <div class="h-8 bg-gray-200 rounded w-1/2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  {:else}
    <!-- Contenido del KPI -->
    <div class="flex items-start justify-between mb-3">
      <!-- Icono -->
      {#if icon}
        <div class="kpi-icon {currentColors.icon}">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {#if icon === 'chat'}
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            {:else if icon === 'clock'}
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            {:else if icon === 'check'}
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            {:else if icon === 'star'}
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            {:else if icon === 'trending-up'}
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            {:else if icon === 'trending-down'}
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            {:else}
              <!-- Icono por defecto -->
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            {/if}
          </svg>
        </div>
      {/if}

      <!-- Indicador de cambio -->
      {#if change !== 0}
        <div class="kpi-change {currentColors.text} text-sm font-medium">
          {changeIcon}
          {changeText}
        </div>
      {/if}
    </div>

    <!-- Valor principal -->
    <div class="kpi-value mb-2">
      <span class="text-2xl font-bold text-gray-900">{value}</span>
    </div>

    <!-- Título -->
    <div class="kpi-title mb-2">
      <h4 class="text-sm font-medium text-gray-700">{title}</h4>
    </div>

    <!-- Estado -->
    <div class="kpi-status">
      <span
        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {currentColors.bg} {currentColors.text}"
      >
        {#if status === 'improving'}
          Mejorando
        {:else if status === 'declining'}
          Declinando
        {:else if status === 'stable'}
          Estable
        {:else if status === 'attention'}
          Atención
        {/if}
      </span>
    </div>
  {/if}
</div>

<style>
  .kpi-metric {
    @apply transition-all duration-200;
  }

  .kpi-metric:hover {
    @apply shadow-md transform -translate-y-1;
  }

  .kpi-icon {
    @apply flex-shrink-0;
  }

  .kpi-change {
    @apply flex-shrink-0;
  }

  .kpi-value {
    @apply leading-none;
  }

  .kpi-title {
    @apply leading-tight;
  }

  .kpi-status {
    @apply mt-2;
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
