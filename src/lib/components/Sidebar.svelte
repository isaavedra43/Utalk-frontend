<!-- 
 * Sidebar de Navegación Principal - UTalk Frontend
 * Rediseño basado en imagen de referencia
 * 
 * Características:
 * - Diseño minimalista y limpio
 * - Solo módulos Dashboard y Chat
 * - Logout al final del sidebar
 * - Iconos outline con badges
 * - Responsive y accesible
 -->

<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import NotificationBadge from '$lib/components/ui/NotificationBadge.svelte';
  import { authStore } from '$lib/stores/auth.store';
  import { setSidebarCollapsed, sidebarStore, toggleSidebar } from '$lib/stores/sidebar.store';
  import { onMount } from 'svelte';

  let collapsed = false;
  let isMobile = false;

  // Suscribirse al store global del sidebar
  sidebarStore.subscribe(state => {
    collapsed = state.collapsed;
  });

  // Verificar si es móvil
  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
      if (isMobile) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  });

  // Suscribirse al estado de autenticación
  authStore.subscribe(() => {
    // Estado de autenticación disponible si es necesario
  });

  // Navegación
  function navigateTo(path: string) {
    goto(path);
    // En móvil, colapsar el sidebar después de navegar
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }

  // Logout
  function handleLogout() {
    authStore.logout();
    goto('/login');
  }

  // Toggle sidebar usando el store global
  function handleToggleSidebar() {
    toggleSidebar();
  }

  // Verificar si la ruta está activa
  function isActive(path: string): boolean {
    return $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
  }
</script>

<div class="sidebar-container {collapsed ? 'collapsed' : ''} {isMobile ? 'mobile' : ''}">
  <!-- Navegación Principal -->
  <nav class="sidebar-nav" aria-label="Navegación principal">
    <ul class="nav-list">
      <!-- Dashboard -->
      <li class="nav-item">
        <button
          type="button"
          class="nav-link {isActive('/dashboard') ? 'active' : ''}"
          on:click={() => navigateTo('/dashboard')}
          aria-label="Dashboard"
          title="Dashboard"
        >
          <div class="icon-container">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          {#if !collapsed}
            <span class="nav-text">Dashboard</span>
          {/if}
        </button>
      </li>

      <!-- Chat -->
      <li class="nav-item">
        <button
          type="button"
          class="nav-link {isActive('/chat') ? 'active' : ''}"
          on:click={() => navigateTo('/chat')}
          aria-label="Conversaciones"
          title="Conversaciones"
        >
          <div class="icon-container">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <NotificationBadge count={9} />
          </div>
          {#if !collapsed}
            <span class="nav-text">Conversaciones</span>
          {/if}
        </button>
      </li>

      <!-- Equipo & Performance -->
      <li class="nav-item">
        <button
          type="button"
          class="nav-link {isActive('/team') ? 'active' : ''}"
          on:click={() => navigateTo('/team')}
          aria-label="Equipo & Performance"
          title="Equipo & Performance"
        >
          <div class="icon-container">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <NotificationBadge count={3} />
          </div>
          {#if !collapsed}
            <span class="nav-text">Equipo</span>
          {/if}
        </button>
      </li>
    </ul>
  </nav>

  <!-- Sección de Logout al final -->
  <div class="logout-section">
    <button
      type="button"
      class="logout-button"
      on:click={handleLogout}
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
    >
      <div class="icon-container">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </div>
      {#if !collapsed}
        <span class="nav-text">Salir</span>
      {/if}
    </button>
  </div>

  <!-- Botón Toggle (solo en desktop) -->
  {#if !isMobile}
    <button
      type="button"
      class="sidebar-toggle"
      on:click={handleToggleSidebar}
      aria-label="{collapsed ? 'Expandir' : 'Colapsar'} sidebar"
      title="{collapsed ? 'Expandir' : 'Colapsar'} sidebar"
    >
      <svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 5l7 7-7 7M5 5l7 7-7 7"
        />
      </svg>
    </button>
  {/if}
</div>

<style>
  .sidebar-container {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 80px;
    background: #ffffff;
    color: #6b7280;
    z-index: 1000;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .sidebar-container.collapsed {
    width: 80px;
  }

  .sidebar-container:not(.collapsed) {
    width: 240px;
  }

  .sidebar-container.mobile {
    width: 100%;
    transform: translateX(-100%);
  }

  .sidebar-container.mobile:not(.collapsed) {
    transform: translateX(0);
  }

  /* Navegación */
  .sidebar-nav {
    flex: 1;
    padding: 1rem 0;
    overflow-y: auto;
  }

  .nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-item {
    margin: 0;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    color: #6b7280;
    text-decoration: none;
    border: none;
    background: none;
    width: 100%;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 8px;
    margin: 0 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    position: relative;
  }

  .nav-link:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .nav-link.active {
    background: #f3f4f6;
    color: #1f2937;
  }

  .icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .nav-icon {
    width: 20px;
    height: 20px;
    stroke-width: 2;
  }

  .nav-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }

  /* Logout Section */
  .logout-section {
    padding: 1rem 0.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .logout-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    color: #6b7280;
    text-decoration: none;
    border: none;
    background: none;
    width: 100%;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .logout-button:hover {
    background: #fef2f2;
    color: #dc2626;
  }

  /* Toggle Button */
  .sidebar-toggle {
    position: absolute;
    bottom: 1rem;
    right: -12px;
    width: 24px;
    height: 24px;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 1001;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .sidebar-toggle:hover {
    background: #f9fafb;
    transform: scale(1.1);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  }

  .toggle-icon {
    width: 12px;
    height: 12px;
    color: #6b7280;
    transition: transform 0.3s ease;
  }

  .collapsed .toggle-icon {
    transform: rotate(180deg);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar-container {
      width: 100%;
      transform: translateX(-100%);
    }

    .sidebar-container:not(.collapsed) {
      transform: translateX(0);
    }

    .sidebar-toggle {
      display: none;
    }
  }

  /* Scrollbar personalizada */
  .sidebar-nav::-webkit-scrollbar {
    width: 4px;
  }

  .sidebar-nav::-webkit-scrollbar-track {
    background: transparent;
  }

  .sidebar-nav::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }

  .sidebar-nav::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
</style>
