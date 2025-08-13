<!-- ConfirmationDialog.svelte -->
<!-- Componente de diálogo de confirmación para cambios de permisos -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { quintOut } from 'svelte/easing';
  import { fade, scale } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  export let open: boolean = false;
  export let title: string = 'Confirmar acción';
  export let message: string = '¿Estás seguro de que quieres realizar esta acción?';
  export let confirmText: string = 'Confirmar';
  export let cancelText: string = 'Cancelar';
  export let type: 'warning' | 'danger' | 'info' = 'warning';
  export let loading: boolean = false;

  // Función para cerrar el diálogo
  function close() {
    if (!loading) {
      dispatch('close');
    }
  }

  // Función para confirmar
  function confirm() {
    if (!loading) {
      dispatch('confirm');
    }
  }

  // Función para cancelar
  function cancel() {
    if (!loading) {
      dispatch('cancel');
      close();
    }
  }

  // Función para manejar eventos de teclado en el overlay
  function handleOverlayKeydown(event: any) {
    if (event.key === 'Escape') {
      cancel();
    }
  }

  // Obtener colores según el tipo
  $: typeColors = {
    warning: {
      icon: 'text-yellow-500',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      border: 'border-yellow-200'
    },
    danger: {
      icon: 'text-red-500',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      border: 'border-red-200'
    },
    info: {
      icon: 'text-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      border: 'border-blue-200'
    }
  };

  $: currentColors = typeColors[type];
</script>

{#if open}
  <!-- Overlay -->
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    on:click={close}
    on:keydown={handleOverlayKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-message"
    tabindex="-1"
    transition:fade={{ duration: 200 }}
  >
    <!-- Diálogo -->
    <div
      class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
      on:click|stopPropagation
      role="document"
      transition:scale={{ duration: 200, easing: quintOut }}
    >
      <!-- Header -->
      <div class="flex items-center gap-3 p-6 border-b border-gray-200">
        <!-- Icono según tipo -->
        <div class="flex-shrink-0">
          {#if type === 'warning'}
            <svg
              class="w-6 h-6 {currentColors.icon}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          {:else if type === 'danger'}
            <svg
              class="w-6 h-6 {currentColors.icon}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          {:else}
            <svg
              class="w-6 h-6 {currentColors.icon}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          {/if}
        </div>

        <!-- Título -->
        <h3 id="dialog-title" class="text-lg font-semibold text-gray-900">
          {title}
        </h3>

        <!-- Botón de cerrar -->
        <button
          type="button"
          class="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
          on:click={cancel}
          disabled={loading}
          aria-label="Cerrar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Contenido -->
      <div class="p-6">
        <p id="dialog-message" class="text-gray-600 leading-relaxed">
          {message}
        </p>
      </div>

      <!-- Footer -->
      <div class="flex gap-3 p-6 border-t border-gray-200">
        <button
          type="button"
          class="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          on:click={cancel}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          class="flex-1 px-4 py-2 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed {currentColors.button}"
          on:click={confirm}
          disabled={loading}
        >
          {#if loading}
            <svg
              class="w-4 h-4 animate-spin inline mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Procesando...
          {:else}
            {confirmText}
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
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
