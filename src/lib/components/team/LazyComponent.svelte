<!--
 * Componente LazyComponent
 * Para lazy loading de componentes pesados
 -->

<script lang="ts">
  import { onMount } from 'svelte';

  export let importFn: () => Promise<any>;
  export let fallback: any = null;
  export let props: Record<string, any> = {};

  let component: any = null;
  let loading = true;
  let error: Error | null = null;

  onMount(async () => {
    try {
      const module = await importFn();
      component = module.default || module;
      loading = false;
    } catch (err) {
      error = err as Error;
      loading = false;
      // Error loading lazy component
      console.error('Error loading lazy component:', err);
    }
  });
</script>

{#if loading}
  {#if fallback}
    <svelte:component this={fallback} {...props} />
  {:else}
    <div class="lazy-loading">
      <div class="loading-spinner"></div>
      <span>Cargando...</span>
    </div>
  {/if}
{:else if error}
  <div class="lazy-error">
    <span>Error al cargar el componente</span>
    <button type="button" on:click={() => window.location.reload()}>Reintentar</button>
  </div>
{:else if component}
  <svelte:component this={component} {...props} />
{/if}

<style>
  .lazy-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #6b7280;
  }

  .loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 0.5rem;
  }

  .lazy-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #ef4444;
    text-align: center;
  }

  .lazy-error button {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
  }

  .lazy-error button:hover {
    background: #2563eb;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
