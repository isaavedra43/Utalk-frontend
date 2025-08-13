<!-- ErrorRetry.svelte -->
<!-- Componente para mostrar errores con opción de retry -->

<script lang="ts">
  export let error: string | Error | null = null;
  export let onRetry: (() => void) | null = null;
  export let title: string = 'Error';
  export let message: string = 'Ha ocurrido un error inesperado';
  export let showRetry: boolean = true;
  export let retryText: string = 'Reintentar';
  export let loading: boolean = false;

  // Función para manejar el retry
  function handleRetry() {
    if (onRetry && !loading) {
      onRetry();
    }
  }

  // Obtener mensaje de error
  $: errorMessage = error instanceof Error ? error.message : error || message;
</script>

<div class="error-container">
  <div class="error-content">
    <!-- Icono de error -->
    <div class="error-icon">
      <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>

    <!-- Título y mensaje -->
    <div class="error-text">
      <h3 class="error-title">{title}</h3>
      <p class="error-message">{errorMessage}</p>
    </div>

    <!-- Botones de acción -->
    <div class="error-actions">
      {#if showRetry && onRetry}
        <button type="button" class="retry-button" on:click={handleRetry} disabled={loading}>
          {#if loading}
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reintentando...
          {:else}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {retryText}
          {/if}
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .error-container {
    @apply flex items-center justify-center p-8;
  }

  .error-content {
    @apply text-center max-w-md mx-auto;
  }

  .error-icon {
    @apply mb-4 flex justify-center;
  }

  .error-text {
    @apply mb-6;
  }

  .error-title {
    @apply text-lg font-semibold text-gray-900 mb-2;
  }

  .error-message {
    @apply text-gray-600 text-sm leading-relaxed;
  }

  .error-actions {
    @apply flex justify-center;
  }

  .retry-button {
    @apply inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  /* Animación de spin */
  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
