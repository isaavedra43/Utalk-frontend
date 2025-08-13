<!--
 * AIActionButton - Componente de botón para acciones IA con estados de loading
 * Incluye animación de loading, texto dinámico y feedback visual
 -->

<script lang="ts">
  import '$lib/styles/team-tokens.css';
  import { createEventDispatcher } from 'svelte';

  // Props del componente
  export let action: 'suggest' | 'remind' | 'analyze' = 'suggest';
  export let loading = false;
  export let disabled = false;
  export let variant: 'outline' | 'default' = 'outline';
  export let size: 'sm' | 'md' | 'lg' = 'md';

  const dispatch = createEventDispatcher();

  // Configuración de acciones
  const actionConfig = {
    suggest: {
      icon: 'sparkles',
      text: 'Sugerir Mejora',
      loadingText: 'Sugiriendo mejora...',
      description: 'Generar sugerencias personalizadas de mejora'
    },
    remind: {
      icon: 'bell',
      text: 'Enviar Recordatorio',
      loadingText: 'Enviando recordatorio...',
      description: 'Enviar recordatorio personalizado al agente'
    },
    analyze: {
      icon: 'bar-chart-3',
      text: 'Analizar',
      loadingText: 'Analizando...',
      description: 'Realizar análisis detallado del rendimiento'
    }
  };

  const config = actionConfig[action];

  function handleClick() {
    if (!loading && !disabled) {
      dispatch('click', { action });
    }
  }

  // Clases dinámicas
  $: buttonClasses = [
    'ai-action-button',
    `variant-${variant}`,
    `size-${size}`,
    { loading: loading, disabled: disabled }
  ]
    .filter(Boolean)
    .join(' ');
</script>

<button
  type="button"
  class={buttonClasses}
  on:click={handleClick}
  disabled={loading || disabled}
  title={config.description}
>
  {#if loading}
    <!-- Spinner de loading -->
    <svg class="loading-spinner" viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
        stroke-dasharray="31.416"
        stroke-dashoffset="31.416"
      />
    </svg>
    <span class="button-text">{config.loadingText}</span>
  {:else}
    <!-- Icono de la acción -->
    <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {#if config.icon === 'sparkles'}
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      {:else if config.icon === 'bell'}
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-5 5v-5zM4.19 4.19A4 4 0 004 6v12a4 4 0 004 4h12a4 4 0 004-4V6a4 4 0 00-4-4H8a4 4 0 00-3.81 2.19z"
        />
      {:else if config.icon === 'bar-chart-3'}
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 13a4 4 0 014-4h2a4 4 0 014 4v6a4 4 0 01-4 4H7a4 4 0 01-4-4v-6zM15 7a4 4 0 014-4h2a4 4 0 014 4v12a4 4 0 01-4 4h-2a4 4 0 01-4-4V7z"
        />
      {/if}
    </svg>
    <span class="button-text">{config.text}</span>
  {/if}
</button>

<style lang="postcss">
  .ai-action-button {
    @apply inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
  }

  /* Variantes */
  .variant-outline {
    @apply border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-blue-500;
  }

  .variant-default {
    @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
  }

  /* Estados semánticos */
  .variant-improving {
    @apply text-green-600 bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 focus:ring-green-500;
  }

  .variant-attention {
    @apply text-red-600 bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300 focus:ring-red-500;
  }

  .variant-stable {
    @apply text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 focus:ring-blue-500;
  }

  /* Tamaños */
  .size-sm {
    @apply px-3 py-1.5 text-sm;
  }

  .size-md {
    @apply px-4 py-2 text-sm;
  }

  .size-lg {
    @apply px-6 py-3 text-base;
  }

  /* Estados */
  .loading {
    @apply cursor-not-allowed opacity-75;
  }

  .disabled {
    @apply cursor-not-allowed opacity-50;
  }

  /* Iconos */
  .action-icon {
    @apply w-4 h-4;
  }

  .loading-spinner {
    @apply w-4 h-4 animate-spin;
  }

  .button-text {
    @apply whitespace-nowrap;
  }

  /* Animación del spinner */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  /* Efectos hover mejorados */
  .ai-action-button:not(.loading):not(.disabled):hover {
    @apply transform scale-105;
  }

  /* Transición suave para el texto */
  .button-text {
    @apply transition-all duration-200;
  }
</style>
