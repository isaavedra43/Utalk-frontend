<!-- MobileModal.svelte -->
<!-- Componente modal para mobile -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { quintOut } from 'svelte/easing';
  import { fade, slide } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  export let open: boolean = false;
  export let title: string = '';
  export let showClose: boolean = true;

  function close() {
    dispatch('close');
  }

  // Función para manejar eventos de teclado en el overlay
  function handleOverlayKeydown(event: any) {
    if (event.key === 'Escape') {
      close();
    }
  }
</script>

{#if open}
  <!-- Overlay -->
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:hidden"
    on:click={close}
    on:keydown={handleOverlayKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    transition:fade={{ duration: 200 }}
  >
    <!-- Modal -->
    <div
      class="bg-white rounded-t-xl w-full max-h-[90vh] overflow-hidden"
      on:click|stopPropagation
      role="document"
      transition:slide={{ duration: 300, easing: quintOut, axis: 'y' }}
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">{title}</h2>
        {#if showClose}
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            on:click={close}
            aria-label="Cerrar"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        {/if}
      </div>

      <!-- Content -->
      <div class="overflow-y-auto max-h-[calc(90vh-60px)]">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  /* Estilos específicos para mobile */
  @media (max-width: 768px) {
    :global(body.modal-open) {
      overflow: hidden;
    }
  }
</style>
