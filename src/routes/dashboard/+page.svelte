<!-- 
 * Dashboard de Bienvenida - UTalk Frontend
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md
 * 
 * Funcionalidades:
 * - Mensaje de bienvenida centrado
 * - Información básica del usuario
 * - Navegación al chat mediante sidebar existente
 * - Diseño minimalista y profesional
 * - Integrado con sidebar de navegación
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

<div class="dashboard-container">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando dashboard...</p>
    </div>
  {:else if user}
    <div class="dashboard-content">
      <div class="welcome-section">
        <!-- Logo de la empresa -->
        <div class="logo-container">
          <div class="logo-placeholder">
            <span class="logo-text">UNIK</span>
          </div>
        </div>

        <!-- Mensaje de bienvenida -->
        <div class="welcome-message">
          <h1 class="welcome-title">Bienvenido a UNIK</h1>
          <p class="welcome-subtitle">
            Tu plataforma de gestión de conversaciones y atención al cliente
          </p>
        </div>

        <!-- Información del usuario -->
        <div class="user-info">
          <div class="user-card">
            <div class="user-avatar">
              <span class="avatar-text">{user.name?.charAt(0) || user.email?.charAt(0) || 'U'}</span
              >
            </div>
            <div class="user-details">
              <h3 class="user-name">{user.name || 'Usuario'}</h3>
              <p class="user-email">{user.email}</p>
              <span class="user-role">{user.role || 'Usuario'}</span>
            </div>
          </div>
        </div>

        <!-- Acciones rápidas -->
        <div class="quick-actions">
          <button type="button" class="action-button primary" on:click={() => goto('/chat')}>
            💬 Ir al Chat
          </button>
          <button type="button" class="action-button secondary" on:click={() => goto('/chat')}>
            📊 Ver Conversaciones
          </button>
        </div>

        <!-- Información adicional -->
        <div class="info-section">
          <div class="info-card">
            <h4>¿Qué puedes hacer?</h4>
            <ul class="feature-list">
              <li>📱 Gestionar conversaciones de WhatsApp</li>
              <li>👥 Ver perfiles de contactos</li>
              <li>🔍 Buscar y filtrar mensajes</li>
              <li>📈 Monitorear estadísticas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .dashboard-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
  }

  .dashboard-content {
    width: 100%;
    max-width: 800px;
  }

  .loading-state {
    text-align: center;
    color: white;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
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

  .welcome-section {
    background: white;
    border-radius: 16px;
    padding: 3rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    width: 100%;
    text-align: center;
    margin: 0 auto;
  }

  .logo-container {
    margin-bottom: 2rem;
  }

  .logo-placeholder {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }

  .logo-text {
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .welcome-message {
    margin-bottom: 2rem;
  }

  .welcome-title {
    font-size: 2.5rem;
    font-weight: bold;
    color: #2d3748;
    margin: 0 0 0.5rem 0;
  }

  .welcome-subtitle {
    font-size: 1.1rem;
    color: #718096;
    margin: 0;
  }

  .user-info {
    margin-bottom: 2rem;
  }

  .user-card {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
    background: #f7fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }

  .user-avatar {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-text {
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .user-details {
    text-align: left;
  }

  .user-name {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2d3748;
    margin: 0 0 0.25rem 0;
  }

  .user-email {
    font-size: 0.9rem;
    color: #718096;
    margin: 0 0 0.25rem 0;
  }

  .user-role {
    font-size: 0.8rem;
    color: #667eea;
    font-weight: 500;
    text-transform: capitalize;
  }

  .quick-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .action-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .action-button.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .action-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  }

  .action-button.secondary {
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
  }

  .action-button.secondary:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
  }

  .info-section {
    margin-top: 2rem;
  }

  .info-card {
    background: #f7fafc;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
  }

  .info-card h4 {
    color: #2d3748;
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
  }

  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
    text-align: left;
  }

  .feature-list li {
    padding: 0.5rem 0;
    color: #4a5568;
    font-size: 0.95rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .dashboard-container {
      padding: 1rem;
    }

    .welcome-section {
      padding: 2rem;
    }

    .welcome-title {
      font-size: 2rem;
    }

    .quick-actions {
      flex-direction: column;
    }

    .user-card {
      flex-direction: column;
      text-align: center;
    }
  }
</style>
