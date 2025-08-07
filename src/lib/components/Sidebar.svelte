<!-- 
 * Sidebar de Navegación Principal - UTalk Frontend
 * Basado en diseño profesional de referencia
 * 
 * Características:
 * - Sidebar fijo y claro como la referencia
 * - Navegación a todas las rutas principales
 * - Responsive y accesible
 * - Integrado con el sistema de autenticación
 -->

<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth.store';
  import { onMount } from 'svelte';

  let user: any = null;
  let collapsed = false;
  let isMobile = false;

  // Verificar si es móvil
  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
      if (isMobile) {
        collapsed = true;
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  });

  // Suscribirse al estado de autenticación
  authStore.subscribe(state => {
    user = state.user;
  });

  // Navegación
  function navigateTo(path: string) {
    goto(path);
  }

  // Logout
  function handleLogout() {
    authStore.logout();
    goto('/login');
  }

  // Toggle sidebar
  function toggleSidebar() {
    collapsed = !collapsed;
  }

  // Verificar si la ruta está activa
  function isActive(path: string): boolean {
    return $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
  }
</script>

<div class="sidebar-container {collapsed ? 'collapsed' : ''} {isMobile ? 'mobile' : ''}">
  <!-- Header del Sidebar -->
  <div class="sidebar-header">
    <div class="logo-container">
      <div class="logo">
        <span class="logo-text">UNIK</span>
      </div>
      {#if !collapsed}
        <span class="logo-subtitle">Chat Platform</span>
      {/if}
    </div>
  </div>

  <!-- Navegación Principal -->
  <nav class="sidebar-nav" aria-label="Navegación principal">
    <ul class="nav-list">
      <!-- Dashboard -->
      <li class="nav-item">
        <button
          class="nav-link {isActive('/dashboard') ? 'active' : ''}"
          on:click={() => navigateTo('/dashboard')}
          aria-label="Dashboard"
          title="Dashboard"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
            />
          </svg>
          {#if !collapsed}
            <span class="nav-text">Dashboard</span>
          {/if}
        </button>
      </li>

      <!-- Chat -->
      <li class="nav-item">
        <button
          class="nav-link {isActive('/chat') ? 'active' : ''}"
          on:click={() => navigateTo('/chat')}
          aria-label="Conversaciones"
          title="Conversaciones"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {#if !collapsed}
            <span class="nav-text">Conversaciones</span>
          {/if}
        </button>
      </li>

      <!-- Inbox -->
      <li class="nav-item">
        <button
          class="nav-link {isActive('/inbox') ? 'active' : ''}"
          on:click={() => navigateTo('/inbox')}
          aria-label="Bandeja de entrada"
          title="Bandeja de entrada"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          {#if !collapsed}
            <span class="nav-text">Bandeja</span>
          {/if}
        </button>
      </li>

      <!-- Separador -->
      <li class="nav-separator"></li>

      <!-- Analytics -->
      <li class="nav-item">
        <button
          class="nav-link {isActive('/analytics') ? 'active' : ''}"
          on:click={() => navigateTo('/analytics')}
          aria-label="Analytics"
          title="Analytics"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          {#if !collapsed}
            <span class="nav-text">Analytics</span>
          {/if}
        </button>
      </li>

      <!-- Usuarios -->
      <li class="nav-item">
        <button
          class="nav-link {isActive('/users') ? 'active' : ''}"
          on:click={() => navigateTo('/users')}
          aria-label="Usuarios"
          title="Usuarios"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
          {#if !collapsed}
            <span class="nav-text">Usuarios</span>
          {/if}
        </button>
      </li>

      <!-- Separador -->
      <li class="nav-separator"></li>

      <!-- Configuración -->
      <li class="nav-item">
        <button
          class="nav-link {isActive('/settings') ? 'active' : ''}"
          on:click={() => navigateTo('/settings')}
          aria-label="Configuración"
          title="Configuración"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {#if !collapsed}
            <span class="nav-text">Configuración</span>
          {/if}
        </button>
      </li>

      <!-- Logout -->
      <li class="nav-item logout-item">
        <button
          class="nav-link logout-link"
          on:click={handleLogout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {#if !collapsed}
            <span class="nav-text">Cerrar Sesión</span>
          {/if}
        </button>
      </li>
    </ul>
  </nav>

  <!-- Botón Toggle (solo en desktop) -->
  {#if !isMobile}
    <button
      class="sidebar-toggle"
      on:click={toggleSidebar}
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
    width: 240px;
    background: #f8f9fa;
    color: #495057;
    z-index: 1000;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e9ecef;
  }

  .sidebar-container.collapsed {
    width: 60px;
  }

  .sidebar-container.mobile {
    width: 100%;
    transform: translateX(-100%);
  }

  .sidebar-container.mobile:not(.collapsed) {
    transform: translateX(0);
  }

  /* Header */
  .sidebar-header {
    padding: 1.5rem 1rem;
    border-bottom: 1px solid #e9ecef;
    min-height: 80px;
    display: flex;
    align-items: center;
  }

  .logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .logo {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-text {
    color: white;
    font-weight: bold;
    font-size: 1rem;
  }

  .logo-subtitle {
    font-size: 0.75rem;
    color: #6c757d;
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
  }

  .nav-item {
    margin: 0;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: #495057;
    text-decoration: none;
    border: none;
    background: none;
    width: 100%;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 0;
    font-size: 0.9rem;
    font-weight: 500;
    position: relative;
  }

  .nav-link:hover {
    background: #e9ecef;
    color: #212529;
  }

  .nav-link.active {
    background: #667eea;
    color: white;
    border-right: 3px solid #4956b3;
  }

  .nav-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .nav-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-separator {
    height: 1px;
    background: #e9ecef;
    margin: 0.5rem 1rem;
  }

  /* Logout */
  .logout-item {
    margin-top: auto;
  }

  .logout-link {
    color: #6c757d !important;
  }

  .logout-link:hover {
    color: #dc3545 !important;
    background: #f8d7da !important;
  }

  /* Toggle Button */
  .sidebar-toggle {
    position: absolute;
    bottom: 1rem;
    right: -12px;
    width: 24px;
    height: 24px;
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 1001;
  }

  .sidebar-toggle:hover {
    background: #f8f9fa;
    transform: scale(1.1);
  }

  .toggle-icon {
    width: 12px;
    height: 12px;
    color: #495057;
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
    background: rgba(0, 0, 0, 0.1);
  }

  .sidebar-nav::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 2px;
  }

  .sidebar-nav::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.5);
  }
</style>
