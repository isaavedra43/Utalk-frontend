<!-- AgentCardSkeleton.svelte -->
<!-- Componente de skeleton para tarjetas de agentes durante la carga -->

<div class="agent-card animate-pulse">
  <!-- Header del agente -->
  <div class="agent-header">
    <!-- Avatar skeleton -->
    <div class="agent-avatar">
      <div class="w-10 h-10 rounded-full bg-gray-200"></div>
    </div>

    <!-- Información del agente skeleton -->
    <div class="agent-info">
      <div class="skeleton-name"></div>
      <div class="skeleton-role"></div>
      <div class="skeleton-status"></div>
    </div>

    <!-- Botón de menú skeleton -->
    <div class="agent-menu-button">
      <div class="w-4 h-4 bg-gray-200 rounded"></div>
    </div>
  </div>

  <!-- Permisos skeleton -->
  <div class="agent-permissions">
    <div class="permissions-label skeleton-label"></div>
    <div class="permissions-badges">
      <div class="permission-badge skeleton-badge"></div>
      <div class="permission-badge skeleton-badge"></div>
      <div class="permission-badge skeleton-badge"></div>
      <div class="permission-badge skeleton-badge"></div>
    </div>
  </div>

  <!-- Métricas skeleton -->
  <div class="agent-metrics">
    <div class="metric-item">
      <div class="metric-icon skeleton-icon"></div>
      <div class="metric-value skeleton-value"></div>
      <div class="metric-label skeleton-label"></div>
    </div>
    <div class="metric-item">
      <div class="metric-icon skeleton-icon"></div>
      <div class="metric-value skeleton-value"></div>
      <div class="metric-label skeleton-label"></div>
    </div>
    <div class="metric-item">
      <div class="metric-icon skeleton-icon"></div>
      <div class="metric-value skeleton-value"></div>
      <div class="metric-label skeleton-label"></div>
    </div>
  </div>
</div>

<style>
  .agent-card {
    @apply border border-gray-200 rounded-lg p-4;
  }

  .agent-header {
    @apply flex items-start gap-3 mb-3;
  }

  .agent-info {
    @apply flex-1 min-w-0 space-y-2;
  }

  .skeleton-name {
    @apply h-4 bg-gray-200 rounded w-3/4;
  }

  .skeleton-role {
    @apply h-3 bg-gray-200 rounded w-1/2;
  }

  .skeleton-status {
    @apply h-3 bg-gray-200 rounded w-1/4;
  }

  .agent-permissions {
    @apply mb-3;
  }

  .permissions-label {
    @apply block text-xs font-medium text-gray-500 mb-2;
  }

  .skeleton-label {
    @apply h-3 bg-gray-200 rounded w-1/4;
  }

  .permissions-badges {
    @apply flex flex-wrap gap-1;
  }

  .skeleton-badge {
    @apply h-6 w-16 bg-gray-200 rounded-full;
  }

  .agent-metrics {
    @apply grid grid-cols-3 gap-2;
  }

  .metric-item {
    @apply flex flex-col items-center text-center space-y-1;
  }

  .skeleton-icon {
    @apply w-4 h-4 bg-gray-200 rounded;
  }

  .skeleton-value {
    @apply h-4 bg-gray-200 rounded w-8;
  }

  .metric-label {
    @apply text-xs text-gray-600;
  }

  .agent-menu-button {
    @apply p-1;
  }

  /* Animación de pulse */
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
