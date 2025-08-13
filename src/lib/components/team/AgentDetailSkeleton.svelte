<!-- AgentDetailSkeleton.svelte -->
<!-- Componente de skeleton para los detalles del agente durante la carga -->

<div class="agent-detail-skeleton animate-pulse">
  <!-- Header del agente -->
  <div class="agent-profile mb-6">
    <div class="profile-header flex items-center gap-4 mb-4">
      <!-- Avatar skeleton -->
      <div class="w-16 h-16 bg-gray-200 rounded-full"></div>

      <!-- Información del agente skeleton -->
      <div class="flex-1 space-y-2">
        <div class="h-6 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        <div class="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>

      <!-- Botones de acción skeleton -->
      <div class="flex gap-2">
        <div class="w-24 h-8 bg-gray-200 rounded"></div>
        <div class="w-16 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>

  <!-- Pestañas skeleton -->
  <div class="tabs-skeleton mb-6">
    <div class="flex gap-4 border-b border-gray-200">
      <div class="w-20 h-8 bg-gray-200 rounded-t"></div>
      <div class="w-16 h-8 bg-gray-200 rounded-t"></div>
      <div class="w-24 h-8 bg-gray-200 rounded-t"></div>
    </div>
  </div>

  <!-- Contenido de la pestaña skeleton -->
  <div class="tab-content-skeleton">
    <!-- Grid de KPIs skeleton -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="kpi-card-skeleton p-4 bg-white rounded-lg border border-gray-200">
        <div class="flex items-center justify-between mb-3">
          <div class="w-6 h-6 bg-gray-200 rounded"></div>
          <div class="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div class="space-y-2">
          <div class="h-8 bg-gray-200 rounded w-1/2"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div class="kpi-card-skeleton p-4 bg-white rounded-lg border border-gray-200">
        <div class="flex items-center justify-between mb-3">
          <div class="w-6 h-6 bg-gray-200 rounded"></div>
          <div class="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div class="space-y-2">
          <div class="h-8 bg-gray-200 rounded w-1/2"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div class="kpi-card-skeleton p-4 bg-white rounded-lg border border-gray-200">
        <div class="flex items-center justify-between mb-3">
          <div class="w-6 h-6 bg-gray-200 rounded"></div>
          <div class="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div class="space-y-2">
          <div class="h-8 bg-gray-200 rounded w-1/2"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div class="kpi-card-skeleton p-4 bg-white rounded-lg border border-gray-200">
        <div class="flex items-center justify-between mb-3">
          <div class="w-6 h-6 bg-gray-200 rounded"></div>
          <div class="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div class="space-y-2">
          <div class="h-8 bg-gray-200 rounded w-1/2"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div class="kpi-card-skeleton p-4 bg-white rounded-lg border border-gray-200">
        <div class="flex items-center justify-between mb-3">
          <div class="w-6 h-6 bg-gray-200 rounded"></div>
          <div class="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div class="space-y-2">
          <div class="h-8 bg-gray-200 rounded w-1/2"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div class="kpi-card-skeleton p-4 bg-white rounded-lg border border-gray-200">
        <div class="flex items-center justify-between mb-3">
          <div class="w-6 h-6 bg-gray-200 rounded"></div>
          <div class="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div class="space-y-2">
          <div class="h-8 bg-gray-200 rounded w-1/2"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .agent-detail-skeleton {
    @apply w-full;
  }

  .profile-header {
    @apply flex items-center gap-4 mb-4;
  }

  .tabs-skeleton {
    @apply mb-6;
  }

  .tab-content-skeleton {
    @apply w-full;
  }

  .kpi-card-skeleton {
    @apply transition-all duration-200;
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
