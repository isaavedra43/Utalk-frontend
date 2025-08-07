<!-- 
 * Layout Principal de UTalk Frontend
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md
 * 
 * Características:
 * - Layout base para toda la aplicación
 * - Sistema de notificaciones global
 * - Manejo de estados de autenticación
 * - Sidebar de navegación integrado
 * - Estilos globales
 -->

<script lang="ts">
  import { page } from '$app/stores';
  import NotificationToast from '$lib/components/NotificationToast.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { socketManager } from '$lib/services/socket';
  import { authStore } from '$lib/stores/auth.store';
  import { onMount } from 'svelte';
  import '../app.css';

  let isAuthenticated = false;
  let showSidebar = false;

  onMount(() => {
    // Inicializar autenticación desde localStorage
    authStore.initialize().then(() => {
      // Inicializar socket si el usuario está autenticado
      const unsubscribe = authStore.subscribe(state => {
        isAuthenticated = state.isAuthenticated;
        showSidebar = state.isAuthenticated && !['/login', '/'].includes($page.url.pathname);

        if (state.isAuthenticated && state.user) {
          socketManager.connect();
        } else {
          socketManager.disconnect();
        }
      });

      return unsubscribe;
    });
  });
</script>

<div class="app-container">
  <!-- Sidebar solo en rutas autenticadas -->
  {#if showSidebar}
    <Sidebar />
  {/if}

  <!-- Contenido principal -->
  <main class="main-content {showSidebar ? 'with-sidebar' : ''}">
    <slot />
  </main>

  <NotificationToast />
</div>

<style>
  .app-container {
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
  }

  .main-content {
    flex: 1;
    transition: margin-left 0.3s ease;
  }

  .main-content.with-sidebar {
    margin-left: 240px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .main-content.with-sidebar {
      margin-left: 0;
    }
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
