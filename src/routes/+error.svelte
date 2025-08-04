<script lang="ts">
  import AlertDescription from '$lib/components/ui/alert/alert-description.svelte';
  import Alert from '$lib/components/ui/alert/alert.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { authStore } from '$lib/stores/auth.store';
  import { pageStore } from '$lib/stores/page.store';

  // Función para obtener mensaje de error amigable
  function getErrorMessage(status: number): {
    title: string;
    description: string;
    showLogin: boolean;
  } {
    switch (status) {
      case 401:
        return {
          title: 'Sesión Expirada',
          description:
            'Tu sesión ha expirado o no tienes autorización. Por favor, inicia sesión nuevamente.',
          showLogin: true
        };
      case 403:
        return {
          title: 'Acceso Denegado',
          description:
            'No tienes permisos para acceder a esta página. Si crees que es un error, contacta a tu administrador.',
          showLogin: false
        };
      case 404:
        return {
          title: 'Página No Encontrada',
          description:
            'La página que buscas no existe o ha sido movida. Verifica la URL e intenta nuevamente.',
          showLogin: false
        };
      case 429:
        return {
          title: 'Demasiadas Solicitudes',
          description:
            'Has realizado demasiadas solicitudes. Espera unos minutos antes de intentar nuevamente.',
          showLogin: false
        };
      case 500:
        return {
          title: 'Error del Servidor',
          description:
            'Nuestros servidores están experimentando problemas. Intenta nuevamente en unos minutos.',
          showLogin: false
        };
      case 503:
        return {
          title: 'Servicio No Disponible',
          description:
            'El servicio está temporalmente fuera de línea por mantenimiento. Intenta más tarde.',
          showLogin: false
        };
      default:
        return {
          title: 'Error Inesperado',
          description:
            'Ha ocurrido un error inesperado. Si el problema persiste, contacta soporte técnico.',
          showLogin: false
        };
    }
  }

  // Función para logout y redirigir a login
  async function handleLoginRedirect() {
    try {
      await authStore.logout();
    } catch (error) {
      // Incluso si falla el logout, redirigir
      window.location.href = '/login';
    }
  }

  // Función para volver al inicio
  function goHome() {
    window.location.href = '/';
  }

  // Función para recargar la página
  function reloadPage() {
    window.location.reload();
  }

  $: status = $pageStore.status || 500;
  $: errorInfo = getErrorMessage(status);
</script>

<svelte:head>
  <title>Error {status} - UTalk</title>
  <meta name="description" content="Ha ocurrido un error en UTalk" />
</svelte:head>

<div
  class="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full space-y-8">
    <!-- Header con ícono de error -->
    <div class="text-center">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
        <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <h1 class="text-3xl font-bold text-secondary-900 mb-2">
        {errorInfo.title}
      </h1>

      <p class="text-secondary-600 mb-6">
        Código de error: {status}
      </p>
    </div>

    <!-- Mensaje de error detallado -->
    <Alert variant="destructive">
      <AlertDescription>
        <div class="text-sm">
          {errorInfo.description}
        </div>
      </AlertDescription>
    </Alert>

    <!-- Acciones disponibles -->
    <div class="space-y-4">
      {#if errorInfo.showLogin}
        <!-- Botón para ir a login -->
        <Button variant="default" className="w-full" on:click={handleLoginRedirect}>
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            ></path>
          </svg>
          Iniciar Sesión
        </Button>
      {:else}
        <!-- Botón para volver al inicio -->
        <Button variant="default" className="w-full" on:click={goHome}>
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            ></path>
          </svg>
          Volver al Inicio
        </Button>
      {/if}

      <!-- Botón para recargar página -->
      <Button variant="outline" className="w-full" on:click={reloadPage}>
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
        Recargar Página
      </Button>
    </div>

    <!-- Información adicional según el tipo de error -->
    {#if status === 429}
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">Límite de Solicitudes</h3>
            <p class="mt-1 text-sm text-yellow-700">
              Para proteger nuestros servidores, limitamos la cantidad de solicitudes por minuto.
            </p>
          </div>
        </div>
      </div>
    {/if}

    {#if status >= 500}
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">Problema del Servidor</h3>
            <p class="mt-1 text-sm text-blue-700">
              Nuestro equipo técnico ha sido notificado y está trabajando en la solución.
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Footer con información de contacto -->
    <div class="text-center space-y-2">
      <p class="text-sm text-secondary-500">¿Necesitas ayuda adicional?</p>
      <div class="flex justify-center space-x-4 text-xs">
        <span class="text-secondary-400">soporte@utalk.com</span>
        <span class="text-secondary-300">|</span>
        <span class="text-secondary-400">UTalk v1.0.0</span>
      </div>
    </div>
  </div>
</div>

<style>
  /* Animaciones suaves para transiciones */
  :global(.transition-all) {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  /* Mejoras para accesibilidad */
  :global(button:focus-visible) {
    outline: 2px solid theme('colors.primary.500');
    outline-offset: 2px;
  }
</style>
