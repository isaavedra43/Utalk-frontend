<!--
 * QuickView - Componente de vista rápida con tokens de diseño
 * Implementa las alturas fijas de la FASE 6
 -->

<script lang="ts">
  export let title: string;
  export let content: string = '';
  export let icon: string = '';
  export let status: 'improving' | 'attention' | 'stable' | 'neutral' = 'neutral';
  export let actionText: string = '';
  export let onAction: () => void = () => {};
  export let loading: boolean = false;

  // Determinar el color semántico basado en el status
  $: statusClasses = {
    improving: 'improving',
    attention: 'attention',
    stable: 'stable',
    neutral: 'bg-gray-50 text-gray-700 border-gray-200'
  }[status];
</script>

<div class="quick-view team-card">
  {#if loading}
    <!-- Skeleton de carga -->
    <div class="w-full h-full animate-pulse">
      <div class="h-4 bg-gray-200 rounded mb-3"></div>
      <div class="h-3 bg-gray-200 rounded mb-2"></div>
      <div class="h-3 bg-gray-200 rounded w-3/4"></div>
    </div>
  {:else}
    <div class="flex items-start justify-between mb-3">
      {#if icon}
        <div class="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
          <span class="text-gray-600 text-xs">{icon}</span>
        </div>
      {/if}
      {#if status !== 'neutral'}
        <div class="quick-status {statusClasses} text-xs font-medium px-2 py-1 rounded-full">
          {status === 'improving' ? 'Mejorando' : status === 'attention' ? 'Atención' : 'Estable'}
        </div>
      {/if}
    </div>

    <div class="quick-title text-sm font-semibold text-gray-900 mb-2">
      {title}
    </div>

    {#if content}
      <div class="quick-content text-xs text-gray-600 mb-3 line-clamp-3">
        {content}
      </div>
    {/if}

    {#if actionText}
      <button
        type="button"
        class="quick-action text-xs text-blue-600 hover:text-blue-700 font-medium"
        on:click={onAction}
      >
        {actionText} →
      </button>
    {/if}
  {/if}
</div>

<style lang="postcss">
  /* Importar tokens de diseño */
  @import '$lib/styles/team-tokens.css';

  .quick-view {
    @apply transition-all duration-200 hover:shadow-md;
  }

  .quick-title {
    @apply text-sm font-semibold text-gray-900 mb-2;
  }

  .quick-content {
    @apply text-xs text-gray-600 mb-3;
  }

  .quick-status {
    @apply text-xs font-medium px-2 py-1 rounded-full;
  }

  .quick-action {
    @apply text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors;
  }

  /* Utilidad para truncar texto */
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
