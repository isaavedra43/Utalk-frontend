<!--
 * MetricCard - Componente de métrica adicional con tokens de diseño
 * Implementa las alturas fijas de la FASE 6
 -->

<script lang="ts">
  export let title: string;
  export let value: string | number;
  export let subtitle: string = '';
  export let icon: string = '';
  export let status: 'improving' | 'attention' | 'stable' | 'neutral' = 'neutral';
  export let trend: number = 0;
  export let loading: boolean = false;

  // Determinar el color semántico basado en el status
  $: statusClasses = {
    improving: 'improving',
    attention: 'attention',
    stable: 'stable',
    neutral: 'bg-gray-50 text-gray-700 border-gray-200'
  }[status];

  // Determinar el icono de tendencia
  $: trendIcon = trend > 0 ? '↗' : trend < 0 ? '↘' : '→';
  $: trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
</script>

<div class="metric-card team-card">
  {#if loading}
    <!-- Skeleton de carga -->
    <div class="w-full h-full animate-pulse">
      <div class="h-4 bg-gray-200 rounded mb-2"></div>
      <div class="h-6 bg-gray-200 rounded mb-2"></div>
      <div class="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  {:else}
    <div class="flex items-start justify-between mb-3">
      {#if icon}
        <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <span class="text-gray-600 text-sm">{icon}</span>
        </div>
      {/if}
      {#if trend !== 0}
        <div class="flex items-center gap-1 {trendColor}">
          <span class="text-xs font-medium">{trendIcon}</span>
          <span class="text-xs font-medium">{Math.abs(trend)}%</span>
        </div>
      {/if}
    </div>

    <div class="metric-value text-xl font-bold text-gray-900 mb-1">
      {value}
    </div>

    <div class="metric-title text-sm font-medium text-gray-700 mb-2">
      {title}
    </div>

    {#if subtitle}
      <div class="metric-subtitle text-xs text-gray-500 mb-3">
        {subtitle}
      </div>
    {/if}

    {#if status !== 'neutral'}
      <div
        class="metric-status {statusClasses} text-xs font-medium px-2 py-1 rounded-full inline-block"
      >
        {status === 'improving' ? 'Mejorando' : status === 'attention' ? 'Atención' : 'Estable'}
      </div>
    {/if}
  {/if}
</div>

<style lang="postcss">
  /* Importar tokens de diseño */
  @import '$lib/styles/team-tokens.css';

  .metric-card {
    @apply transition-all duration-200 hover:shadow-md;
  }

  .metric-value {
    @apply text-xl font-bold text-gray-900 mb-1;
  }

  .metric-title {
    @apply text-sm font-medium text-gray-700 mb-2;
  }

  .metric-subtitle {
    @apply text-xs text-gray-500 mb-3;
  }

  .metric-status {
    @apply text-xs font-medium px-2 py-1 rounded-full inline-block;
  }
</style>
