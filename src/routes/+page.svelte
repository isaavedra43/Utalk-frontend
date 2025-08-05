<script lang="ts">
  import { goto } from '$app/navigation';
  import { logger } from '$lib/logger';
  import { browser } from '$lib/utils/browser';

  // Log al montar la página
  logger.info('Página de inicio cargada - redirigiendo al login', {
    module: 'LandingPage',
    function: 'onMount',
    userAction: 'page_load_redirect',
    url: '/'
  });

  // Redirección automática al login
  if (browser) {
    logger.info('Redirigiendo automáticamente al login', {
      module: 'LandingPage',
      function: 'autoRedirect',
      userAction: 'auto_redirect_to_login'
    });

    goto('/login');
  }
</script>

<svelte:head>
  <title>UTalk Frontend - Redirigiendo al Login</title>
  <meta name="description" content="Redirigiendo al sistema de login de UTalk" />
</svelte:head>

<div class="min-h-screen bg-secondary-50 flex items-center justify-center">
  <div class="text-center">
    <div
      class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"
    ></div>
    <h1 class="text-2xl font-semibold text-secondary-900 mb-2">UTalk Frontend</h1>
    <p class="text-secondary-600">Redirigiendo al login...</p>
  </div>
</div>
