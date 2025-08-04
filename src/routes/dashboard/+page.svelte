<script lang="ts">
  // Página temporal de dashboard para completar el flujo de login
</script>

<svelte:head>
  <title>Dashboard - UTalk</title>
  <meta name="description" content="Panel de control de UTalk" />
</svelte:head>

<div class="min-h-screen bg-secondary-50 flex items-center justify-center">
  <div class="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
    <div class="mb-6">
      <svg
        class="mx-auto h-16 w-16 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>

    <h1 class="text-2xl font-bold text-secondary-900 mb-4">¡Login Exitoso!</h1>

    <p class="text-secondary-600 mb-6">Has iniciado sesión correctamente en UTalk.</p>

    <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
      <p class="text-sm text-blue-800">
        <strong>Página temporal:</strong> Esta es una página de prueba para verificar que el flujo de
        login funciona correctamente. El dashboard real se desarrollará en las siguientes iteraciones.
      </p>
    </div>

    <div class="text-xs text-secondary-500">
      <p>UTalk Frontend - Login Module</p>
      <p>Estado: Implementación completada</p>
    </div>
  </div>
</div>
