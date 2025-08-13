<!--
  Componente de Feedback de UX para UTalk
  Loading states, skeleton loaders, tooltips y notificaciones informativas
-->

<script lang="ts">
  import { logStore } from '$lib/utils/logger';
  import { createEventDispatcher, onDestroy } from 'svelte';

  export let type: 'loading' | 'success' | 'error' | 'warning' | 'info' = 'info';
  export let message: string = '';
  export let duration: number = 5000;
  export let showProgress = false;
  export let progress = 0;
  export let showRetry = false;
  export let retryAction: (() => void) | null = null;
  export let dismissible = true;

  const dispatch = createEventDispatcher();

  let visible = true;
  let progressInterval: number | null = null;

  // Auto-hide para notificaciones temporales
  if (duration > 0 && type !== 'loading') {
    setTimeout(() => {
      visible = false;
      dispatch('close');
    }, duration);
  }

  // Simular progreso para loading states
  if (showProgress && type === 'loading') {
    progressInterval = setInterval(() => {
      if (progress < 90) {
        progress += Math.random() * 10;
      }
    }, 200) as unknown as number;
  }

  function handleRetry() {
    if (retryAction) {
      logStore('ux-feedback: reintentando acción', { message });
      retryAction();
      visible = false;
      dispatch('close');
    }
  }

  function handleClose() {
    if (dismissible) {
      visible = false;
      dispatch('close');
    }
  }

  // Cleanup al destruir componente
  onDestroy(() => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  });
</script>

{#if visible}
  <div
    class="ux-feedback"
    class:ux-feedback-loading={type === 'loading'}
    class:ux-feedback-success={type === 'success'}
    class:ux-feedback-error={type === 'error'}
    class:ux-feedback-warning={type === 'warning'}
    class:ux-feedback-info={type === 'info'}
    class:with-progress={showProgress}
  >
    <div class="feedback-content">
      <!-- Icono según tipo -->
      <div class="feedback-icon">
        {#if type === 'loading'}
          <div class="spinner"></div>
        {:else if type === 'success'}
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
            ></path>
          </svg>
        {:else if type === 'error'}
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        {:else if type === 'warning'}
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            ></path>
          </svg>
        {:else}
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        {/if}
      </div>

      <!-- Mensaje -->
      <div class="feedback-message">
        <p>{message}</p>

        <!-- Barra de progreso -->
        {#if showProgress && type === 'loading'}
          <div class="progress-bar">
            <div class="progress-fill" style="width: {progress}%"></div>
          </div>
        {/if}
      </div>

      <!-- Botones de acción -->
      <div class="feedback-actions">
        {#if showRetry && retryAction}
          <button type="button" class="retry-button" on:click={handleRetry}> Reintentar </button>
        {/if}

        {#if dismissible}
          <button type="button" class="close-button" on:click={handleClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .ux-feedback {
    position: fixed;
    top: 1rem;
    right: 1rem;
    max-width: 400px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid #e2e8f0;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  }

  .ux-feedback-loading {
    border-left: 4px solid #3b82f6;
  }

  .ux-feedback-success {
    border-left: 4px solid #10b981;
  }

  .ux-feedback-error {
    border-left: 4px solid #ef4444;
  }

  .ux-feedback-warning {
    border-left: 4px solid #f59e0b;
  }

  .ux-feedback-info {
    border-left: 4px solid #6366f1;
  }

  .feedback-content {
    display: flex;
    align-items: center;
    padding: 1rem;
    gap: 0.75rem;
  }

  .feedback-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon {
    width: 20px;
    height: 20px;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e2e8f0;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .feedback-message {
    flex: 1;
    min-width: 0;
  }

  .feedback-message p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #374151;
  }

  .progress-bar {
    margin-top: 0.5rem;
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #3b82f6;
    transition: width 0.3s ease;
  }

  .feedback-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .retry-button {
    padding: 0.25rem 0.75rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .retry-button:hover {
    background: #2563eb;
  }

  .close-button {
    padding: 0.25rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #6b7280;
    transition: color 0.2s;
  }

  .close-button:hover {
    color: #374151;
  }

  .close-button svg {
    width: 16px;
    height: 16px;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Responsive */
  @media (max-width: 640px) {
    .ux-feedback {
      top: 0.5rem;
      right: 0.5rem;
      left: 0.5rem;
      max-width: none;
    }
  }
</style>
