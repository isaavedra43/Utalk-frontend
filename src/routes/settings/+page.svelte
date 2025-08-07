<!-- 
 * Página de Configuración - UTalk Frontend
 * Placeholder para futuras funcionalidades de configuración
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

<div class="settings-container">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando configuración...</p>
    </div>
  {:else if user}
    <div class="settings-content">
      <div class="settings-header">
        <h1 class="settings-title">⚙️ Configuración</h1>
        <p class="settings-subtitle">Gestiona tu cuenta y preferencias</p>
      </div>

      <div class="settings-placeholder">
        <div class="placeholder-icon">🔧</div>
        <h2>Configuración del Sistema</h2>
        <p>Aquí podrás configurar tu cuenta, preferencias y ajustes del sistema.</p>

        <div class="settings-sections">
          <div class="settings-section">
            <div class="section-icon">👤</div>
            <h3>Perfil de Usuario</h3>
            <p>Editar información personal y credenciales</p>
          </div>

          <div class="settings-section">
            <div class="section-icon">🔔</div>
            <h3>Notificaciones</h3>
            <p>Configurar alertas y notificaciones</p>
          </div>

          <div class="settings-section">
            <div class="section-icon">🎨</div>
            <h3>Apariencia</h3>
            <p>Personalizar tema y colores</p>
          </div>

          <div class="settings-section">
            <div class="section-icon">🔒</div>
            <h3>Seguridad</h3>
            <p>Configurar contraseña y autenticación</p>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .settings-container {
    padding: 2rem;
    min-height: 100vh;
    background: #f7fafc;
  }

  .settings-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .settings-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .settings-title {
    font-size: 2.5rem;
    font-weight: bold;
    color: #2d3748;
    margin: 0 0 0.5rem 0;
  }

  .settings-subtitle {
    font-size: 1.1rem;
    color: #718096;
    margin: 0;
  }

  .settings-placeholder {
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

  .settings-placeholder h2 {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2d3748;
    margin: 0 0 1rem 0;
  }

  .settings-placeholder p {
    color: #718096;
    font-size: 1rem;
    margin: 0 0 3rem 0;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .settings-sections {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }

  .settings-section {
    background: #f7fafc;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
  }

  .settings-section:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .section-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .settings-section h3 {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2d3748;
    margin: 0 0 0.5rem 0;
  }

  .settings-section p {
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
    .settings-container {
      padding: 1rem;
    }

    .settings-title {
      font-size: 2rem;
    }

    .settings-sections {
      grid-template-columns: 1fr;
    }
  }
</style>
