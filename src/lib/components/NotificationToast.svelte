<!-- 
 * Componente de Notificaciones Toast
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "📋 Fase 5: Manejo de Errores y Estados Especiales"
 * 
 * Características:
 * - Muestra notificaciones del store de notificaciones
 * - Auto-dismiss con animaciones
 * - Tipos: success, error, warning, info
 * - Posicionamiento fijo en la pantalla
 -->

<script lang="ts">
  import { notificationsStore, type Notification } from '$lib/stores/notifications.store';
  import { onMount } from 'svelte';

  let notifications: Notification[] = [];

  onMount(() => {
    // Suscribirse a cambios en el store
    const unsubscribe = notificationsStore.subscribe(state => {
      notifications = state.notifications.filter(n => !n.dismissed);
    });

    return unsubscribe;
  });

  function dismissNotification(id: string) {
    notificationsStore.dismiss(id);
  }

  function getIcon(type: Notification['type']): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  }

  function getTypeClass(type: Notification['type']): string {
    return `notification-${type}`;
  }
</script>

<!-- Contenedor de notificaciones -->
<div class="notifications-container">
  {#each notifications as notification (notification.id)}
    <div
      class="notification-toast {getTypeClass(notification.type)}"
      class:notification-success={notification.type === 'success'}
      class:notification-error={notification.type === 'error'}
      class:notification-warning={notification.type === 'warning'}
      class:notification-info={notification.type === 'info'}
    >
      <div class="notification-content">
        <span class="notification-icon">{getIcon(notification.type)}</span>
        <span class="notification-message">{notification.message}</span>
        <button
          class="notification-close"
          on:click={() => dismissNotification(notification.id)}
          aria-label="Cerrar notificación"
        >
          ×
        </button>
      </div>
    </div>
  {/each}
</div>

<style>
  .notifications-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 400px;
  }

  .notification-toast {
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    min-width: 300px;
    max-width: 400px;
  }

  .notification-content {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    flex: 1;
  }

  .notification-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .notification-message {
    flex: 1;
    font-size: 0.9rem;
    line-height: 1.4;
    word-wrap: break-word;
  }

  .notification-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
    flex-shrink: 0;
  }

  .notification-close:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  /* Tipos de notificación */
  .notification-success {
    background-color: #d4edda;
    color: #155724;
    border-left: 4px solid #28a745;
  }

  .notification-error {
    background-color: #f8d7da;
    color: #721c24;
    border-left: 4px solid #dc3545;
  }

  .notification-warning {
    background-color: #fff3cd;
    color: #856404;
    border-left: 4px solid #ffc107;
  }

  .notification-info {
    background-color: #d1ecf1;
    color: #0c5460;
    border-left: 4px solid #17a2b8;
  }

  /* Animaciones */
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

  /* Responsive */
  @media (max-width: 768px) {
    .notifications-container {
      left: 1rem;
      right: 1rem;
      max-width: none;
    }

    .notification-toast {
      min-width: auto;
      max-width: none;
    }
  }
</style>
