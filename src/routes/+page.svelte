<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';

  // Redirección automática al login solo en el cliente
  if (browser) {
    // eslint-disable-next-line no-console
    console.log('🔄 REDIRECCIÓN - Enviando a login');
    goto('/login');
  }
</script>

<svelte:head>
  <title>UTalk Frontend - Redirigiendo al Login</title>
  <meta name="description" content="Redirigiendo al sistema de login de UTalk" />
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <h1 class="text-2xl font-semibold text-gray-900 mb-2">UTalk Frontend</h1>
    <p class="text-gray-600">Redirigiendo al login...</p>
  </div>
</div>
