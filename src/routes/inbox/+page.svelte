<!-- 
 * Página de Inbox - UTalk Frontend
 * Placeholder para futuras funcionalidades de bandeja de entrada
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

<div class="inbox-container">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando bandeja de entrada...</p>
    </div>
  {:else if user}
    <div class="inbox-content">
      <div class="inbox-header">
        <h1 class="inbox-title">📥 Bandeja de Entrada</h1>
        <p class="inbox-subtitle">Todos los mensajes y conversaciones</p>
      </div>

      <div class="inbox-placeholder">
        <div class="placeholder-icon">📬</div>
        <h2>Bandeja de Entrada</h2>
        <p>Aquí se mostrarán todos los mensajes y conversaciones de todos los canales.</p>
        <div class="placeholder-features">
          <div class="feature-item">
            <span class="feature-icon">📱</span>
            <span>WhatsApp</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📧</span>
            <span>Email</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">💬</span>
            <span>Chat Web</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .inbox-container {
    padding: 2rem;
    min-height: 100vh;
    background: #f7fafc;
  }

  .inbox-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .inbox-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .inbox-title {
    font-size: 2.5rem;
    font-weight: bold;
    color: #2d3748;
    margin: 0 0 0.5rem 0;
  }

  .inbox-subtitle {
    font-size: 1.1rem;
    color: #718096;
    margin: 0;
  }

  .inbox-placeholder {
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

  .inbox-placeholder h2 {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2d3748;
    margin: 0 0 1rem 0;
  }

  .inbox-placeholder p {
    color: #718096;
    font-size: 1rem;
    margin: 0 0 2rem 0;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .placeholder-features {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: #f7fafc;
    border-radius: 8px;
    min-width: 100px;
  }

  .feature-icon {
    font-size: 1.5rem;
  }

  .feature-item span:last-child {
    font-size: 0.9rem;
    font-weight: 500;
    color: #4a5568;
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
    .inbox-container {
      padding: 1rem;
    }

    .inbox-title {
      font-size: 2rem;
    }

    .placeholder-features {
      flex-direction: column;
      align-items: center;
    }
  }
</style>
