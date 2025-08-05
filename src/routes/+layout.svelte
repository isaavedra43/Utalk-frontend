<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import { logger } from '$lib/logger';
  import { authStore, currentUser, isAuthenticated } from '$lib/stores/auth.store';
  import { pageStore } from '$lib/stores/page.store';
  import { browser } from '$lib/utils/browser';
  import '../app.css';

  // Inicializar logger globalmente
  logger.info('Aplicación UTalk iniciada', {
    module: 'Layout',
    function: 'onMount',
    userAction: 'app_start',
    url: $pageStore.url || '/'
  });

  // Función para hacer logout
  async function handleLogout() {
    logger.info('Usuario inició logout', {
      module: 'Layout',
      function: 'handleLogout',
      userAction: 'logout_attempt',
      userId: $currentUser?.email || 'unknown'
    });

    try {
      await authStore.logout();
      logger.info('Logout exitoso', {
        module: 'Layout',
        function: 'handleLogout',
        userAction: 'logout_success'
      });
    } catch (error) {
      logger.error(
        'Error durante logout',
        error instanceof Error ? error : new Error(String(error)),
        {
          module: 'Layout',
          function: 'handleLogout',
          userAction: 'logout_error'
        }
      );
      // Incluso si hay error, redirigir a login
      if (browser) {
        window.location.href = '/login';
      }
    }
  }

  // Verificar si estamos en página de login para ocultar navegación
  $: isLoginPage = $pageStore.url === '/login';
  $: isHomePage = $pageStore.url === '/';
</script>

<div class="min-h-screen bg-secondary-50">
  <!-- Header de navegación - Solo mostrar si no es login y usuario autenticado -->
  {#if !isLoginPage && $isAuthenticated}
    <header class="bg-white shadow-sm border-b border-secondary-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo y navegación principal -->
          <div class="flex items-center space-x-8">
            <div class="flex-shrink-0">
              <h1 class="text-xl font-bold text-primary-600">UTalk</h1>
            </div>

            <!-- Navegación principal -->
            <nav class="hidden md:flex space-x-8">
              <a
                href="/dashboard"
                class="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                class:active={$pageStore.url === '/dashboard'}
              >
                Dashboard
              </a>
              <a
                href="/conversations"
                class="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                class:active={$pageStore.url?.startsWith('/conversations') ?? false}
              >
                Conversaciones
              </a>
              <a
                href="/contacts"
                class="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                class:active={$pageStore.url?.startsWith('/contacts') ?? false}
              >
                Contactos
              </a>
            </nav>
          </div>

          <!-- Usuario y logout -->
          <div class="flex items-center space-x-4">
            <!-- Información del usuario -->
            {#if $currentUser}
              <div class="flex items-center space-x-3">
                <!-- Avatar -->
                <div class="flex-shrink-0">
                  {#if $currentUser.avatarUrl}
                    <img
                      class="h-8 w-8 rounded-full"
                      src={$currentUser.avatarUrl}
                      alt={$currentUser.name}
                    />
                  {:else}
                    <div
                      class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center"
                    >
                      <span class="text-white text-sm font-medium">
                        {$currentUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  {/if}
                </div>

                <!-- Nombre y rol -->
                <div class="hidden sm:block">
                  <p class="text-sm font-medium text-secondary-900">{$currentUser.name}</p>
                  <p class="text-xs text-secondary-500 capitalize">{$currentUser.role}</p>
                </div>
              </div>
            {/if}

            <!-- Botón de logout -->
            <Button
              variant="outline"
              size="sm"
              on:click={handleLogout}
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                ></path>
              </svg>
              <span class="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  {/if}

  <!-- Navegación móvil - Solo si no es login y usuario autenticado -->
  {#if !isLoginPage && $isAuthenticated}
    <nav class="md:hidden bg-white border-b border-secondary-200 px-4 py-3">
      <div class="flex space-x-4 overflow-x-auto">
        <a
          href="/dashboard"
          class="whitespace-nowrap text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          class:active={$pageStore.url === '/dashboard'}
        >
          Dashboard
        </a>
        <a
          href="/conversations"
          class="whitespace-nowrap text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          class:active={$pageStore.url?.startsWith('/conversations') ?? false}
        >
          Conversaciones
        </a>
        <a
          href="/contacts"
          class="whitespace-nowrap text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          class:active={$pageStore.url?.startsWith('/contacts') ?? false}
        >
          Contactos
        </a>
      </div>
    </nav>
  {/if}

  <!-- Contenido principal -->
  <main class={isLoginPage || isHomePage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
    <slot />
  </main>

  <!-- Footer - Solo mostrar en homepage -->
  {#if isHomePage}
    <footer class="bg-white border-t border-secondary-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-center">
          <p class="text-sm text-secondary-500">© 2024 UTalk. Sistema de mensajería multicanal.</p>
          <div class="flex space-x-4">
            <button
              type="button"
              class="text-sm text-secondary-500 hover:text-primary-600 transition-colors"
              >Soporte</button
            >
            <button
              type="button"
              class="text-sm text-secondary-500 hover:text-primary-600 transition-colors"
              >Privacidad</button
            >
          </div>
        </div>
      </div>
    </footer>
  {/if}
</div>

<style>
  /* Estilos para navegación activa */
  :global(.active) {
    color: theme('colors.primary.600');
    background-color: theme('colors.primary.50');
  }

  /* Mejoras responsive para navegación móvil */
  @media (max-width: 768px) {
    :global(.space-x-4 > *) {
      margin-right: 1rem;
    }
  }

  /* Transiciones suaves */
  :global(.transition-colors) {
    transition-property: color, background-color, border-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
</style>
