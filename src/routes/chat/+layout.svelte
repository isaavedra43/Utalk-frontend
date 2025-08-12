<!-- 
 * Layout para rutas de chat
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md
 * 
 * Funcionalidades:
 * - Redirección automática a primera conversación
 * - Verificación de autenticación
 * - Manejo de estados de carga
 -->

<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.store';
  import { conversationsStore } from '$lib/stores/conversations.store';
  import { notificationsStore } from '$lib/stores/notifications.store';
  import { onMount } from 'svelte';

  let loading = true;

  onMount(() => {
    // Verificar autenticación
    let authState: any;
    authStore.subscribe(state => {
      authState = state;
    })();

    if (!authState?.isAuthenticated) {
      notificationsStore.error('Debes iniciar sesión para acceder al chat');
      goto('/login');
      return;
    }

    // Cargar conversaciones y configurar redirección
    // eslint-disable-next-line no-console
    console.info('LOAD_CONV_FROM_LAYOUT');
    loadConversations();
  });

  async function loadConversations() {
    try {
      await conversationsStore.loadConversations();

      // Actualizar loading cuando se cargan las conversaciones
      conversationsStore.subscribe(() => {
        loading = false;
      });
    } catch (err: any) {
      notificationsStore.error('Error al cargar conversaciones');
      loading = false;
    }
  }
</script>

{#if loading}
  <div class="loading-container">
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Cargando chat...</p>
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f8f9fa;
  }

  .loading-spinner {
    text-align: center;
    color: #6c757d;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e9ecef;
    border-top: 4px solid #2196f3;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
