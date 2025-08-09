<!-- 
 * Layout Principal de UTalk Frontend
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md
 * 
 * Características:
 * - Layout base para toda la aplicación
 * - Sistema de notificaciones global
 * - Manejo de estados de autenticación
 * - Sidebar de navegación integrado
 * - Adaptación dinámica del contenido al sidebar
 * - Estilos globales
 -->

<script lang="ts">
  import { page } from '$app/stores';
  import { wireChat } from '$lib/bootstrap/chat';
  import NotificationToast from '$lib/components/NotificationToast.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { authStore } from '$lib/stores/auth.store';
  import { sidebarStore } from '$lib/stores/sidebar.store';
  import { onMount } from 'svelte';
  import '../app.css';

  let isAuthenticated = false;
  let showSidebar = false;
  let sidebarWidth = 240;
  let isSidebarCollapsed = false;

  // Suscribirse al store del sidebar para obtener el estado actual
  sidebarStore.subscribe(state => {
    sidebarWidth = state.width;
    isSidebarCollapsed = state.collapsed;
  });

  onMount(() => {
    // Wiring de chat (socket ↔ stores) una sola vez en cliente
    wireChat();

    // Inicializar autenticación desde localStorage
    authStore.initialize().then(() => {
      const unsubscribe = authStore.subscribe(state => {
        isAuthenticated = state.isAuthenticated;
        showSidebar = state.isAuthenticated && !['/login', '/'].includes($page.url.pathname);

        if (state.isAuthenticated) {
          showSidebar = true;
        }
      });

      return unsubscribe;
    });
  });
</script>

<div class="app-container">
  {#if showSidebar}
    <Sidebar />
  {/if}

  <main
    class="main-content {showSidebar ? 'with-sidebar' : ''}"
    style="margin-left: {showSidebar ? sidebarWidth + 'px' : '0'};"
  >
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

  /* Responsive */
  @media (max-width: 768px) {
    .main-content.with-sidebar {
      margin-left: 0 !important;
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
