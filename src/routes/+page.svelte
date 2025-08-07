<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.store';
  import { onMount } from 'svelte';

  let loading = true;

  onMount(() => {
    if (browser) {
      // Suscribirse al estado de autenticación
      const unsubscribe = authStore.subscribe(state => {
        if (!loading) {
          if (state.isAuthenticated && state.user) {
            // Usuario autenticado, redirigir al dashboard
            console.log('✅ USUARIO AUTENTICADO - Redirigiendo al dashboard');
            goto('/dashboard');
          } else {
            // Usuario no autenticado, redirigir al login
            console.log('🔒 USUARIO NO AUTENTICADO - Redirigiendo al login');
            goto('/login');
          }
        }
      });

      // Marcar como no cargando después de un breve delay
      setTimeout(() => {
        loading = false;
      }, 100);

      return unsubscribe;
    }
  });
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
