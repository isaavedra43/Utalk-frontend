<!-- 
 * Layout Principal de UTalk Frontend
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md
 * 
 * Características:
 * - Layout base para toda la aplicación
 * - Sistema de notificaciones global
 * - Manejo de estados de autenticación
 * - Estilos globales
 -->

<script lang="ts">
  import NotificationToast from '$lib/components/NotificationToast.svelte';
  import { socketManager } from '$lib/services/socket';
  import { authStore } from '$lib/stores/auth.store';
  import { onMount } from 'svelte';
  import '../app.css';

  onMount(() => {
    // Inicializar socket si el usuario está autenticado
    const unsubscribe = authStore.subscribe(state => {
      if (state.isAuthenticated && state.user) {
        socketManager.connect();
      } else {
        socketManager.disconnect();
      }
    });

    return unsubscribe;
  });
</script>

<div class="app-container">
  <slot />
  <NotificationToast />
</div>

<style>
  .app-container {
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  /* Reset básico */
  * {
    box-sizing: border-box;
  }

  /* Scrollbar personalizada */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style>
