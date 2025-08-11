<!-- 
 * Componente de Indicador de Presencia
 * Basado en info/1.md sección "Indicadores de Online/Presencia"
 * 
 * Características:
 * - Muestra estado online/offline/ausente/ocupado
 * - Indicador visual con colores apropiados
 * - Información de última vez visto
 * - Integración con presenceStore
 -->

<script lang="ts">
  import { presenceStore } from '$lib/stores/presence.store';
  import { safeDateToISOString } from '$lib/utils/dates';

  export let userId: string;
  export let showName: boolean = false;
  export let size: 'small' | 'medium' | 'large' = 'medium';

  let userPresence: any = null;

  // Suscripción al store de presencia
  presenceStore.subscribe(state => {
    userPresence = (state.users as any)[userId] || null;
  });

  function getStatusColor(status: string): string {
    switch (status) {
      case 'online':
        return '#10b981'; // Verde
      case 'away':
        return '#f59e0b'; // Amarillo
      case 'busy':
        return '#ef4444'; // Rojo
      case 'offline':
        return '#6b7280'; // Gris
      default:
        return '#6b7280';
    }
  }

  function getStatusText(status: string): string {
    switch (status) {
      case 'online':
        return 'En línea';
      case 'away':
        return 'Ausente';
      case 'busy':
        return 'Ocupado';
      case 'offline':
        return 'Desconectado';
      default:
        return 'Desconocido';
    }
  }

  function formatLastSeen(lastSeen: string): string {
    if (!lastSeen) return '';

    const date = safeDateToISOString(lastSeen);
    if (!date) return '';

    const now = new Date();
    const lastSeenDate = new Date(date);
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Ahora mismo';
    } else if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `Hace ${hours}h`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `Hace ${days}d`;
    }
  }

  function getIndicatorSize(): string {
    switch (size) {
      case 'small':
        return 'w-2 h-2';
      case 'medium':
        return 'w-3 h-3';
      case 'large':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  }
</script>

{#if userPresence}
  <div class="presence-indicator" class:show-name={showName}>
    <!-- Indicador de estado -->
    <div
      class="status-dot {getIndicatorSize()}"
      style="background-color: {getStatusColor(userPresence.status)}"
      title={getStatusText(userPresence.status)}
    ></div>

    <!-- Nombre del usuario si se solicita -->
    {#if showName}
      <div class="user-info">
        <span class="user-name">{userPresence.name}</span>
        <span class="user-status">{getStatusText(userPresence.status)}</span>
        {#if userPresence.status === 'offline' && userPresence.lastSeen}
          <span class="last-seen">{formatLastSeen(userPresence.lastSeen)}</span>
        {/if}
      </div>
    {/if}

    <!-- Indicador de escritura -->
    {#if userPresence.isTyping}
      <div class="typing-indicator">
        <span class="typing-dots">●●●</span>
        <span class="typing-text">escribiendo...</span>
      </div>
    {/if}
  </div>
{:else}
  <!-- Estado desconocido -->
  <div class="presence-indicator" class:show-name={showName}>
    <div
      class="status-dot {getIndicatorSize()}"
      style="background-color: #6b7280"
      title="Estado desconocido"
    ></div>

    {#if showName}
      <div class="user-info">
        <span class="user-name">Usuario</span>
        <span class="user-status">Estado desconocido</span>
      </div>
    {/if}
  </div>
{/if}

<style>
  .presence-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-dot {
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .user-name {
    font-weight: 500;
    font-size: 0.875rem;
    color: #374151;
  }

  .user-status {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .last-seen {
    font-size: 0.75rem;
    color: #9ca3af;
    font-style: italic;
  }

  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #6b7280;
  }

  .typing-dots {
    animation: typing 1.4s infinite;
    color: #3b82f6;
  }

  @keyframes typing {
    0%,
    20% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .typing-text {
    font-style: italic;
  }
</style>
