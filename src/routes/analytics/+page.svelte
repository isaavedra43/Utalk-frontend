<!-- 
 * Página de Analytics - UTalk Frontend
 * Placeholder para futuras funcionalidades de análisis y estadísticas
 -->

<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.store';
  import { onMount } from 'svelte';

  let user: any = null;
  let loading = true;

  onMount(() => {
    // Verificar si el usuario está autenticado
    authStore.subscribe(state => {
      if (state.isAuthenticated && state.user) {
        user = state.user;
        loading = false;
      } else if (!state.isAuthenticated) {
        // Redirigir al login si no está autenticado
        goto('/login');
      }
    });
  });
</script>

<div class="analytics-container">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando analytics...</p>
    </div>
  {:else if user}
    <div class="analytics-content">
      <div class="analytics-header">
        <h1 class="analytics-title">📊 Analytics</h1>
        <p class="analytics-subtitle">Métricas y estadísticas del sistema</p>
      </div>

      <div class="analytics-placeholder">
        <div class="placeholder-icon">📈</div>
        <h2>Dashboard de Analytics</h2>
        <p>Aquí se mostrarán métricas, estadísticas y reportes del sistema de chat.</p>

        <div class="analytics-sections">
          <div class="analytics-section">
            <div class="section-icon">💬</div>
            <h3>Conversaciones</h3>
            <p>Total de conversaciones y tiempo de respuesta</p>
          </div>

          <div class="analytics-section">
            <div class="section-icon">👥</div>
            <h3>Usuarios</h3>
            <p>Actividad de usuarios y agentes</p>
          </div>

          <div class="analytics-section">
            <div class="section-icon">📱</div>
            <h3>Canales</h3>
            <p>Distribución por canales de comunicación</p>
          </div>

          <div class="analytics-section">
            <div class="section-icon">⏱️</div>
            <h3>Rendimiento</h3>
            <p>Métricas de rendimiento y eficiencia</p>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .analytics-container {
    padding: 2rem;
    min-height: 100vh;
    background: #f7fafc;
  }

  .analytics-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .analytics-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .analytics-title {
    font-size: 2.5rem;
    font-weight: bold;
    color: #2d3748;
    margin: 0 0 0.5rem 0;
  }

  .analytics-subtitle {
    font-size: 1.1rem;
    color: #718096;
    margin: 0;
  }

  .analytics-placeholder {
    background: white;
    border-radius: 16px;
    padding: 4rem 2rem;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
  }

  .placeholder-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .analytics-placeholder h2 {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2d3748;
    margin: 0 0 1rem 0;
  }

  .analytics-placeholder p {
    color: #718096;
    font-size: 1rem;
    margin: 0 0 3rem 0;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .analytics-sections {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }

  .analytics-section {
    background: #f7fafc;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
  }

  .analytics-section:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .section-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .analytics-section h3 {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2d3748;
    margin: 0 0 0.5rem 0;
  }

  .analytics-section p {
    color: #718096;
    font-size: 0.9rem;
    margin: 0;
  }

  .loading-state {
    text-align: center;
    color: #718096;
    padding: 4rem 2rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .analytics-container {
      padding: 1rem;
    }

    .analytics-title {
      font-size: 2rem;
    }

    .analytics-sections {
      grid-template-columns: 1fr;
    }
  }
</style>
