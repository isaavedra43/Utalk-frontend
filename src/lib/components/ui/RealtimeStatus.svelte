<!-- RealtimeStatus.svelte -->
<!-- Componente para mostrar el estado de conexión real-time -->

<script lang="ts">
  import { realtimeActions, realtimeStatus } from '$lib/stores/realtime.store';
  import { onDestroy, onMount } from 'svelte';

  export let showDetails: boolean = false;
  export let autoConnect: boolean = true;

  let status: any;
  let unsubscribe: () => void;

  onMount(() => {
    unsubscribe = realtimeStatus.subscribe(value => {
      status = value;
    });

    if (autoConnect) {
      // Conectar a canales principales
      realtimeActions.connectToAgentsChannel();
      realtimeActions.connectToMetricsChannel();
    }
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  function getStatusText() {
    if (!status) return 'Desconectado';
    return status.connected ? 'Conectado' : 'Desconectado';
  }

  function getStatusIcon() {
    if (!status) return '🔴';
    return status.connected ? '🟢' : '🔴';
  }

  function reconnect() {
    realtimeActions.connectToAgentsChannel();
    realtimeActions.connectToMetricsChannel();
  }
</script>

<div class="realtime-status">
  <div class="status-indicator">
    <span class="status-icon">{getStatusIcon()}</span>
    <span class="status-text">{getStatusText()}</span>

    {#if status && !status.connected}
      <button
        type="button"
        class="reconnect-button"
        on:click={reconnect}
        title="Reconectar"
        aria-label="Reconectar a canales real-time"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    {/if}
  </div>

  {#if showDetails && status}
    <div class="status-details">
      {#if status.channels.length > 0}
        <div class="channels">
          <span class="label">Canales:</span>
          <div class="channel-list">
            {#each status.channels as channel}
              <span class="channel-badge">{channel}</span>
            {/each}
          </div>
        </div>
      {/if}

      {#if status.lastUpdate}
        <div class="last-update">
          <span class="label">Última actualización:</span>
          <span class="timestamp">{status.lastUpdate.toLocaleTimeString()}</span>
        </div>
      {/if}

      {#if status.error}
        <div class="error-message">
          <span class="label">Error:</span>
          <span class="error-text">{status.error}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .realtime-status {
    @apply flex flex-col gap-2;
  }

  .status-indicator {
    @apply flex items-center gap-2;
  }

  .status-icon {
    @apply text-lg;
  }

  .status-text {
    @apply text-sm font-medium;
  }

  .reconnect-button {
    @apply p-1 text-gray-500 hover:text-gray-700 transition-colors;
  }

  .status-details {
    @apply text-xs text-gray-600 space-y-1;
  }

  .channels {
    @apply flex items-center gap-2;
  }

  .label {
    @apply font-medium;
  }

  .channel-list {
    @apply flex gap-1;
  }

  .channel-badge {
    @apply px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs;
  }

  .last-update {
    @apply flex items-center gap-2;
  }

  .timestamp {
    @apply text-gray-500;
  }

  .error-message {
    @apply flex items-center gap-2;
  }

  .error-text {
    @apply text-red-600;
  }
</style>
