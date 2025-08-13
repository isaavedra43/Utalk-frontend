<!--
 * KPICard - Componente de tarjeta KPI con tokens de diseño
 * Implementa los estilos y tokens de la FASE 6
 -->

<script lang="ts">
  export let title: string;
  export let value: string | number;
  export let change: number;
  export let status: 'improving' | 'attention' | 'stable' = 'stable';
  export let icon: string = '';
  export let description: string = '';

  // Determinar el color semántico basado en el status
  $: statusClasses = {
    improving: 'improving',
    attention: 'attention',
    stable: 'stable'
  }[status];

  // Determinar el icono de cambio
  $: changeIcon = change > 0 ? '↗' : change < 0 ? '↘' : '→';
  $: changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
</script>

<div class="kpi-card team-card">
  <div class="flex items-center justify-between mb-3">
    {#if icon}
      <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
        <span class="text-gray-600 text-sm">{icon}</span>
      </div>
    {/if}
    <div class="flex items-center gap-1 {changeColor}">
      <span class="text-sm font-medium">{changeIcon}</span>
      <span class="text-sm font-medium">{Math.abs(change)}%</span>
    </div>
  </div>

  <div class="kpi-value text-2xl font-bold text-gray-900 mb-1">
    {value}
  </div>

  <div class="kpi-title text-sm text-gray-600 mb-2">
    {title}
  </div>

  <div class="kpi-status {statusClasses} text-xs font-medium px-2 py-1 rounded-full inline-block">
    {status === 'improving' ? 'Mejorando' : status === 'attention' ? 'Atención' : 'Estable'}
  </div>

  {#if description}
    <p class="text-xs text-gray-500 mt-2">
      {description}
    </p>
  {/if}
</div>

<style lang="postcss">
  /* Importar tokens de diseño */
  @import '$lib/styles/team-tokens.css';

  .kpi-card {
    @apply transition-all duration-200 hover:shadow-md;
  }

  .kpi-value {
    @apply text-2xl font-bold text-gray-900 mb-1;
  }

  .kpi-title {
    @apply text-sm text-gray-600 mb-2;
  }

  .kpi-status {
    @apply text-xs font-medium px-2 py-1 rounded-full inline-block;
  }
</style>
