<!-- NotificationBadge.svelte -->
<!-- Componente para insignias de notificación -->

<script lang="ts">
  export let count: number | string = 0;
  export let maxCount: number = 99;
  export let size: 'sm' | 'md' | 'lg' = 'sm';
  export let color: 'red' | 'blue' | 'green' | 'yellow' = 'red';
  export let showZero: boolean = false;
  export let pulse: boolean = false;

  // Formatear el contador
  $: displayCount =
    typeof count === 'number' ? (count > maxCount ? `${maxCount}+` : count.toString()) : count;

  // Determinar si mostrar el badge
  $: shouldShow = showZero || (typeof count === 'number' ? count > 0 : count !== '0');

  // Clases dinámicas
  $: sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-sm'
  };

  $: colorClasses = {
    red: 'bg-red-500 text-white',
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-white'
  };

  $: badgeClasses = [
    'notification-badge',
    'flex items-center justify-center',
    'rounded-full font-medium',
    'absolute -top-1 -right-1',
    'min-w-max',
    sizeClasses[size],
    colorClasses[color],
    pulse ? 'animate-pulse' : ''
  ].join(' ');
</script>

{#if shouldShow}
  <div class="notification-badge-container relative">
    <slot />
    <div class={badgeClasses}>
      {displayCount}
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
  .notification-badge-container {
    @apply relative inline-block;
  }

  .notification-badge {
    @apply shadow-sm;
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

  /* Asegurar que el badge esté por encima del contenido */
  .notification-badge {
    z-index: 10;
  }
</style>
