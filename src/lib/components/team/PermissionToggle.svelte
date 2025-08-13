<!--
 * PermissionToggle - Componente de toggle para permisos con confirmación
 * Incluye confirmación antes de cambiar permisos y feedback visual
 -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // Props del componente
  export let permission: string;
  export let level: 'basic' | 'intermediate' | 'advanced';
  export let enabled = false;
  export let loading = false;
  export let disabled = false;
  export let description = '';

  const dispatch = createEventDispatcher();

  // Configuración de permisos
  const permissionConfig = {
    read: {
      icon: 'book-open',
      label: 'Lectura',
      description: 'Ver conversaciones y datos de clientes'
    },
    write: {
      icon: 'message-square',
      label: 'Escritura',
      description: 'Enviar mensajes y responder a clientes'
    },
    approve: {
      icon: 'check-circle',
      label: 'Aprobación',
      description: 'Aprobar campañas y decisiones importantes'
    },
    configure: {
      icon: 'settings',
      label: 'Configuración',
      description: 'Acceso a configuración del sistema'
    }
  };

  const config = permissionConfig[permission as keyof typeof permissionConfig] || {
    icon: 'shield',
    label: permission,
    description: description
  };

  // Configuración de niveles
  const levelConfig = {
    basic: { color: 'bg-gray-100 text-gray-700', label: 'Basic' },
    intermediate: { color: 'stable-bg stable-text', label: 'Intermediate' },
    advanced: { color: 'improving-bg improving-text', label: 'Advanced' }
  };

  const levelInfo = levelConfig[level];

  async function handleToggle() {
    if (loading || disabled) return;

    // Confirmar cambio de permiso
    const confirmed = await confirmPermissionChange();

    if (confirmed) {
      dispatch('toggle', {
        permission,
        enabled: !enabled,
        level
      });
    }
  }

  async function confirmPermissionChange(): Promise<boolean> {
    // En un entorno real, esto podría ser un modal personalizado
    const action = enabled ? 'deshabilitar' : 'habilitar';
    const message = `¿Estás seguro de que quieres ${action} el permiso "${config.label}"?`;

    return new Promise(resolve => {
      // Simular confirmación (en producción usar un modal real)
      const confirmed = window.confirm(message);
      resolve(confirmed);
    });
  }

  // Clases dinámicas
  $: toggleClasses = [
    'permission-toggle',
    { enabled: enabled, loading: loading, disabled: disabled }
  ]
    .filter(Boolean)
    .join(' ');
</script>

<div class="permission-card">
  <div class="permission-header">
    <div class="permission-icon">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {#if config.icon === 'book-open'}
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        {:else if config.icon === 'message-square'}
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        {:else if config.icon === 'check-circle'}
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        {:else if config.icon === 'settings'}
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
        {:else}
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        {/if}
      </svg>
    </div>
    <div class="permission-info">
      <h4 class="permission-title">{config.label}</h4>
      <p class="permission-description">{config.description}</p>
    </div>
    <div class="permission-controls">
      <span class="level-badge {levelInfo.color}">{levelInfo.label}</span>
      <button
        type="button"
        class={toggleClasses}
        on:click={handleToggle}
        disabled={loading || disabled}
        title="{enabled ? 'Deshabilitar' : 'Habilitar'} {config.label}"
      >
        {#if loading}
          <div class="toggle-spinner"></div>
        {:else}
          <div class="toggle-track">
            <div class="toggle-thumb"></div>
          </div>
        {/if}
      </button>
    </div>
  </div>
</div>

<style lang="postcss">
  .permission-card {
    @apply bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow;
  }

  .permission-header {
    @apply flex items-start gap-3;
  }

  .permission-icon {
    @apply w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 flex-shrink-0;
  }

  .permission-info {
    @apply flex-1 min-w-0;
  }

  .permission-title {
    @apply text-sm font-medium text-gray-900 mb-1;
  }

  .permission-description {
    @apply text-xs text-gray-500 leading-relaxed;
  }

  .permission-controls {
    @apply flex items-center gap-2 flex-shrink-0;
  }

  .level-badge {
    @apply px-2 py-1 rounded-full text-xs font-medium;
  }

  .permission-toggle {
    @apply relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  }

  .permission-toggle:not(.enabled) {
    @apply bg-gray-200 hover:bg-gray-300;
  }

  .permission-toggle.enabled {
    @apply bg-blue-600 hover:bg-blue-700;
  }

  .permission-toggle.loading {
    @apply cursor-not-allowed opacity-75;
  }

  .permission-toggle.disabled {
    @apply cursor-not-allowed opacity-50;
  }

  .toggle-track {
    @apply relative w-full h-full rounded-full transition-colors duration-200;
  }

  .toggle-thumb {
    @apply absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200;
  }

  .permission-toggle.enabled .toggle-thumb {
    @apply transform translate-x-5;
  }

  .toggle-spinner {
    @apply w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin;
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
  .permission-card:hover {
    @apply border-gray-300;
  }

  .permission-toggle:not(.loading):not(.disabled):hover {
    @apply transform scale-105;
  }
</style>
