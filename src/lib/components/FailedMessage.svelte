<!-- 
 * Componente de Mensaje Fallido
 * Basado en info/1.md sección "Mensaje con Envío Fallido"
 * 
 * Características:
 * - Muestra el motivo exacto del error del backend
 * - Botón de reintento si el mensaje es retryable
 * - Estados visuales claros para el usuario
 -->

<script lang="ts">
  export let message: any;
  export let onRetry: (messageId: string) => Promise<void>;

  let retrying = false;

  async function handleRetry() {
    if (!message.metadata?.retryable) return;

    try {
      retrying = true;
      await onRetry(message.id);
    } catch (error) {
      console.error('Error retrying message:', error);
    } finally {
      retrying = false;
    }
  }

  function getFailureReason(): string {
    // Mostrar el motivo exacto del error del backend - Documento: info/1.5.md estructura de mensaje
    return message.metadata?.failureReason || 'Error desconocido';
  }

  function isRetryable(): boolean {
    return message.metadata?.retryable === true;
  }
</script>

<div class="failed-message">
  <div class="error-content">
    <span class="error-icon">⚠️</span>
    <span class="error-text">{getFailureReason()}</span>
  </div>

  {#if isRetryable()}
    <button
      class="retry-button"
      on:click={handleRetry}
      disabled={retrying}
      title="Reintentar envío del mensaje"
    >
      {#if retrying}
        <span class="retry-spinner">⏳</span>
        Reintentando...
      {:else}
        🔄 Reintentar
      {/if}
    </button>
  {:else}
    <span class="non-retryable-text">No se puede reintentar</span>
  {/if}
</div>

<style>
  .failed-message {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 0.5rem;
    margin-top: 0.5rem;
    color: #721c24;
  }

  .error-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }

  .error-icon {
    font-size: 1rem;
  }

  .error-text {
    font-size: 0.9rem;
    font-weight: 500;
  }

  .retry-button {
    background: #dc3545;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .retry-button:hover:not(:disabled) {
    background: #c82333;
  }

  .retry-button:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  .retry-spinner {
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

  .non-retryable-text {
    font-size: 0.8rem;
    color: #6c757d;
    font-style: italic;
  }
</style>
