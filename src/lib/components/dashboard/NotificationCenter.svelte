<!--
 * NotificationCenter Component - UTalk Dashboard
 * Centro de notificaciones en tiempo real para alertas y eventos del sistema
 * 
 * Features:
 * - Notificaciones en tiempo real
 * - Diferentes tipos (info, warning, error, success)
 * - Auto-dismiss configurable
 * - Acciones rápidas en notificaciones
 * - Historial de notificaciones
 -->

<script lang="ts">
  import { AlertCircle, AlertTriangle, Bell, CheckCircle, Info, X } from 'lucide-svelte';
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  export let isOpen = false;
  export let unreadCount = 0;

  interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    actionLabel?: string;
    actionUrl?: string;
  }

  let notifications: Notification[] = [
    {
      id: '1',
      type: 'warning',
      title: 'Cliente VIP en riesgo',
      message: 'Elena Torres no ha tenido contacto en 7 días. Valor: €15K anuales.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      actionLabel: 'Ver perfil',
      actionUrl: '/customers/elena-torres'
    },
    {
      id: '2',
      type: 'success',
      title: 'Meta alcanzada',
      message: 'El equipo ha superado la meta de satisfacción del 95% este mes.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Nuevo insight disponible',
      message: 'Se detectó una tendencia positiva en las felicitaciones por servicio.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
      actionLabel: 'Ver insight',
      actionUrl: '/analytics#insights'
    },
    {
      id: '4',
      type: 'error',
      title: 'Fallo en integración',
      message: 'La conexión con WhatsApp Business API presenta intermitencias.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: true,
      actionLabel: 'Revisar',
      actionUrl: '/settings/integrations'
    }
  ];

  $: unreadNotifications = notifications.filter(n => !n.read);
  $: unreadCount = unreadNotifications.length;

  function getIcon(type: string) {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'error':
        return AlertCircle;
      case 'success':
        return CheckCircle;
      case 'info':
        return Info;
      default:
        return Info;
    }
  }

  function getIconColor(type: string) {
    switch (type) {
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'success':
        return 'text-green-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  }

  // function getBgColor(type: string) {
  //   switch (type) {
  //     case 'warning':
  //       return 'bg-yellow-50 border-yellow-200';
  //     case 'error':
  //       return 'bg-red-50 border-red-200';
  //     case 'success':
  //       return 'bg-green-50 border-green-200';
  //     case 'info':
  //       return 'bg-blue-50 border-blue-200';
  //     default:
  //       return 'bg-gray-50 border-gray-200';
  //   }
  // }

  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) {
      return `hace ${diffMins}m`;
    } else if (diffHours < 24) {
      return `hace ${diffHours}h`;
    } else {
      return `hace ${Math.floor(diffHours / 24)}d`;
    }
  }

  function markAsRead(notificationId: string) {
    notifications = notifications.map(n => (n.id === notificationId ? { ...n, read: true } : n));
  }

  function markAllAsRead() {
    notifications = notifications.map(n => ({ ...n, read: true }));
  }

  function removeNotification(notificationId: string) {
    notifications = notifications.filter(n => n.id !== notificationId);
  }

  function handleAction(notification: Notification) {
    if (notification.actionUrl) {
      dispatch('navigate', notification.actionUrl);
    }
    markAsRead(notification.id);
    isOpen = false;
  }

  // Simular llegada de nuevas notificaciones
  let notificationInterval: ReturnType<typeof setInterval>;

  onMount(() => {
    notificationInterval = setInterval(() => {
      // Simular nueva notificación cada 30 segundos
      if (Math.random() > 0.8) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['info', 'warning', 'success'][Math.floor(Math.random() * 3)] as any,
          title: 'Nueva actividad',
          message: 'Se ha detectado nueva actividad en el sistema.',
          timestamp: new Date(),
          read: false
        };
        notifications = [newNotification, ...notifications];
      }
    }, 30000);
  });

  onDestroy(() => {
    if (notificationInterval) {
      clearInterval(notificationInterval);
    }
  });
</script>

<!-- Botón de notificaciones -->
<div class="relative">
  <button
    type="button"
    on:click={() => (isOpen = !isOpen)}
    class="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
  >
    <Bell class="w-5 h-5" />
    {#if unreadCount > 0}
      <span
        class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px] h-[18px]"
      >
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    {/if}
  </button>

  {#if isOpen}
    <!-- Panel de notificaciones -->
    <div
      class="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">Notificaciones</h3>
        <div class="flex items-center gap-2">
          {#if unreadCount > 0}
            <button
              type="button"
              on:click={markAllAsRead}
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Marcar todas como leídas
            </button>
          {/if}
          <button
            type="button"
            on:click={() => (isOpen = false)}
            class="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Lista de notificaciones -->
      <div class="max-h-80 overflow-y-auto">
        {#if notifications.length === 0}
          <div class="p-8 text-center">
            <Bell class="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p class="text-gray-500 text-sm">No hay notificaciones</p>
          </div>
        {:else}
          {#each notifications as notification}
            {@const Icon = getIcon(notification.type)}
            <div
              role="button"
              tabindex="0"
              class="w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer {notification.read
                ? 'opacity-75'
                : ''}"
              on:click={() => markAsRead(notification.id)}
              on:keydown={e => (e.key === 'Enter' || e.key === ' ') && markAsRead(notification.id)}
            >
              <div class="flex gap-3">
                <!-- Icono -->
                <div class="flex-shrink-0 mt-1">
                  <Icon class="w-5 h-5 {getIconColor(notification.type)}" />
                </div>

                <!-- Contenido -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <h4 class="text-sm font-medium text-gray-900 mb-1">
                      {notification.title}
                    </h4>
                    <div class="flex items-center gap-2 ml-2">
                      <span class="text-xs text-gray-500 whitespace-nowrap">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                      {#if !notification.read}
                        <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {/if}
                    </div>
                  </div>

                  <p class="text-sm text-gray-600 mb-2 leading-relaxed">
                    {notification.message}
                  </p>

                  <!-- Acciones -->
                  {#if notification.actionLabel}
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        on:click|stopPropagation={() => handleAction(notification)}
                        class="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded"
                      >
                        {notification.actionLabel}
                      </button>
                      <button
                        type="button"
                        on:click|stopPropagation={() => removeNotification(notification.id)}
                        class="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Descartar
                      </button>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <!-- Footer -->
      <div class="p-3 border-t border-gray-100 bg-gray-50">
        <button
          type="button"
          class="w-full text-sm text-gray-600 hover:text-gray-900 font-medium py-1"
        >
          Ver todas las notificaciones
        </button>
      </div>
    </div>
  {/if}
</div>

{#if isOpen}
  <!-- Overlay para cerrar -->
  <button
    type="button"
    class="fixed inset-0 z-40"
    on:click={() => (isOpen = false)}
    on:keydown={e => e.key === 'Escape' && (isOpen = false)}
    aria-label="Cerrar notificaciones"
  ></button>
{/if}
