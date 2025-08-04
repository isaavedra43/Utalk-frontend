<script lang="ts">
  import { APP_CONFIG } from '$lib/constants';
</script>

<svelte:head>
  <title>{APP_CONFIG.NAME} - {APP_CONFIG.DESCRIPTION}</title>
  <meta name="description" content={APP_CONFIG.DESCRIPTION} />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-4xl mx-auto text-center">
    <h1 class="text-4xl font-bold text-primary-600 mb-4">
      {APP_CONFIG.NAME}
    </h1>

    <p class="text-xl text-secondary-600 mb-8">
      {APP_CONFIG.DESCRIPTION}
    </p>

    <div class="card max-w-md mx-auto">
      <h2 class="text-lg font-semibold mb-4">Entorno de Desarrollo Configurado</h2>
      <div class="space-y-2 text-sm text-left">
        <div class="flex justify-between">
          <span>Framework:</span>
          <span class="font-mono">SvelteKit + TypeScript</span>
        </div>
        <div class="flex justify-between">
          <span>Estilos:</span>
          <span class="font-mono">Tailwind CSS</span>
        </div>
        <div class="flex justify-between">
          <span>Versión:</span>
          <span class="font-mono">v{APP_CONFIG.VERSION}</span>
        </div>
      </div>

      <div class="mt-6 space-y-2">
        <button type="button" class="btn-primary w-full py-2"> Botón Primario </button>
        <button type="button" class="btn-secondary w-full py-2"> Botón Secundario </button>
        <button type="button" class="btn-ghost w-full py-2"> Botón Ghost </button>
      </div>
    </div>

    <div class="mt-8 text-sm text-secondary-500">
      <p>✅ Proyecto base configurado correctamente</p>
      <p>🚀 Listo para desarrollo de features</p>
    </div>
  </div>
</div>
