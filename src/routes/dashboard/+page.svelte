<!-- 
 * Dashboard Profesional - UTalk Frontend
 * Basado en diseño de referencia empresarial
 * 
 * Características:
 * - Diseño profesional con cards
 * - Estructura moderna y limpia
 * - Información de usuario integrada
 * - Paneles para futuras funcionalidades
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
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">Dashboard</h1>
        <div class="user-profile">
          <div class="user-avatar">
            <span class="avatar-text">{user.name?.charAt(0) || user.email?.charAt(0) || 'U'}</span>
          </div>
          <div class="user-info">
            <span class="user-name">{user.name || 'Usuario'}</span>
            <span class="user-role">{user.role || 'Usuario'}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- Grid de Cards -->
      <div class="cards-grid">
        <!-- Card de Bienvenida -->
        <div class="card welcome-card">
          <div class="card-header">
            <h3 class="card-title">👋 Bienvenido a UNIK</h3>
          </div>
          <div class="card-content">
            <p class="welcome-text">
              Tu plataforma de gestión de conversaciones y atención al cliente
            </p>
            <div class="welcome-stats">
              <div class="stat-item">
                <span class="stat-number">0</span>
                <span class="stat-label">Conversaciones activas</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">0</span>
                <span class="stat-label">Mensajes pendientes</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Card de Acciones Rápidas -->
        <div class="card actions-card">
          <div class="card-header">
            <h3 class="card-title">🚀 Acciones Rápidas</h3>
          </div>
          <div class="card-content">
            <div class="actions-grid">
              <button type="button" class="action-button primary" on:click={() => goto('/chat')}>
                <span class="action-icon">💬</span>
                <span class="action-text">Ir al Chat</span>
              </button>
              <button type="button" class="action-button secondary" on:click={() => goto('/chat')}>
                <span class="action-icon">📊</span>
                <span class="action-text">Ver Conversaciones</span>
              </button>
              <button type="button" class="action-button secondary" on:click={() => goto('/inbox')}>
                <span class="action-icon">📥</span>
                <span class="action-text">Bandeja de Entrada</span>
              </button>
              <button
                type="button"
                class="action-button secondary"
                on:click={() => goto('/analytics')}
              >
                <span class="action-icon">📈</span>
                <span class="action-text">Analytics</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Card de Funcionalidades -->
        <div class="card features-card">
          <div class="card-header">
            <h3 class="card-title">✨ ¿Qué puedes hacer?</h3>
          </div>
          <div class="card-content">
            <div class="features-list">
              <div class="feature-item">
                <span class="feature-icon">📱</span>
                <div class="feature-content">
                  <h4>Gestionar conversaciones de WhatsApp</h4>
                  <p>Atiende mensajes de clientes desde WhatsApp</p>
                </div>
              </div>
              <div class="feature-item">
                <span class="feature-icon">👥</span>
                <div class="feature-content">
                  <h4>Ver perfiles de contactos</h4>
                  <p>Accede a información detallada de tus contactos</p>
                </div>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🔍</span>
                <div class="feature-content">
                  <h4>Buscar y filtrar mensajes</h4>
                  <p>Encuentra rápidamente la información que necesitas</p>
                </div>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📈</span>
                <div class="feature-content">
                  <h4>Monitorear estadísticas</h4>
                  <p>Analiza el rendimiento de tu equipo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card de Estado del Sistema -->
        <div class="card status-card">
          <div class="card-header">
            <h3 class="card-title">🔧 Estado del Sistema</h3>
          </div>
          <div class="card-content">
            <div class="status-items">
              <div class="status-item">
                <div class="status-indicator online"></div>
                <span class="status-text">Sistema operativo</span>
              </div>
              <div class="status-item">
                <div class="status-indicator online"></div>
                <span class="status-text">Conexión estable</span>
              </div>
              <div class="status-item">
                <div class="status-indicator online"></div>
                <span class="status-text">Sincronización activa</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Card de Enlaces de Ayuda -->
        <div class="card help-card">
          <div class="card-header">
            <h3 class="card-title">❓ ¿Necesitas ayuda?</h3>
          </div>
          <div class="card-content">
            <p class="help-text">
              Ponte en contacto con nuestro equipo de soporte o visita nuestra documentación
            </p>
            <div class="help-links">
              <button type="button" class="help-link">
                <span class="help-icon">📞</span>
                <span>Contactar Soporte</span>
              </button>
              <button type="button" class="help-link">
                <span class="help-icon">📚</span>
                <span>Documentación</span>
              </button>
              <button type="button" class="help-link">
                <span class="help-icon">🎥</span>
                <span>Tutoriales</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Card de Panel Derecho (Placeholder) -->
        <div class="card right-panel-card">
          <div class="card-header">
            <h3 class="card-title">📋 Panel de Control</h3>
          </div>
          <div class="card-content">
            <div class="panel-placeholder">
              <div class="placeholder-icon">⚙️</div>
              <h4>Panel de Configuración</h4>
              <p>
                Aquí se mostrarán controles adicionales y configuraciones avanzadas del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .dashboard-container {
    padding: 0;
    min-height: 100vh;
    background: #f8f9fa;
  }

  .dashboard-header {
    background: white;
    border-bottom: 1px solid #e9ecef;
    padding: 1.5rem 2rem;
    margin-bottom: 2rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard-title {
    font-size: 2rem;
    font-weight: bold;
    color: #212529;
    margin: 0;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-text {
    color: white;
    font-weight: bold;
    font-size: 1rem;
  }

  .user-info {
    display: flex;
    flex-direction: column;
  }

  .user-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: #212529;
  }

  .user-role {
    font-size: 0.75rem;
    color: #6c757d;
    text-transform: capitalize;
  }

  .dashboard-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 2rem;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #e9ecef;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .card-header {
    padding: 1.5rem 1.5rem 0;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #212529;
    margin: 0;
  }

  .card-content {
    padding: 1.5rem;
  }

  /* Welcome Card */
  .welcome-card {
    grid-column: span 2;
  }

  .welcome-text {
    font-size: 1.1rem;
    color: #6c757d;
    margin: 0 0 1.5rem 0;
  }

  .welcome-stats {
    display: flex;
    gap: 2rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: #667eea;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6c757d;
    text-align: center;
  }

  /* Actions Card */
  .actions-card {
    grid-column: span 2;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .action-button.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .action-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .action-button.secondary {
    background: #f8f9fa;
    color: #495057;
    border: 1px solid #e9ecef;
  }

  .action-button.secondary:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }

  .action-icon {
    font-size: 1.2rem;
  }

  /* Features Card */
  .features-card {
    grid-column: span 2;
  }

  .features-list {
    display: grid;
    gap: 1rem;
  }

  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .feature-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .feature-content h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.25rem 0;
  }

  .feature-content p {
    font-size: 0.875rem;
    color: #6c757d;
    margin: 0;
  }

  /* Status Card */
  .status-card {
    grid-column: span 1;
  }

  .status-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-indicator.online {
    background: #28a745;
  }

  .status-text {
    font-size: 0.875rem;
    color: #495057;
  }

  /* Help Card */
  .help-card {
    grid-column: span 1;
  }

  .help-text {
    font-size: 0.875rem;
    color: #6c757d;
    margin: 0 0 1rem 0;
  }

  .help-links {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .help-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: none;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    color: #495057;
  }

  .help-link:hover {
    background: #f8f9fa;
    border-color: #667eea;
  }

  .help-icon {
    font-size: 1rem;
  }

  /* Right Panel Card */
  .right-panel-card {
    grid-column: span 1;
  }

  .panel-placeholder {
    text-align: center;
    padding: 2rem 1rem;
  }

  .placeholder-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .panel-placeholder h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.5rem 0;
  }

  .panel-placeholder p {
    font-size: 0.875rem;
    color: #6c757d;
    margin: 0;
  }

  .loading-state {
    text-align: center;
    color: #6c757d;
    padding: 4rem 2rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e9ecef;
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
    .dashboard-header {
      padding: 1rem;
    }

    .header-content {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .dashboard-content {
      padding: 0 1rem 1rem;
    }

    .cards-grid {
      grid-template-columns: 1fr;
    }

    .welcome-card,
    .actions-card,
    .features-card {
      grid-column: span 1;
    }

    .welcome-stats {
      flex-direction: column;
      gap: 1rem;
    }

    .actions-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
