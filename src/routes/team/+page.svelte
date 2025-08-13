<!--
 * Página Principal - Módulo Equipo & Performance
 * Layout de 3 columnas responsivo con gestión de estado
 * Optimizada con lazy loading y memoización
 -->

<script lang="ts">
  import { page } from '$app/stores';
  import AgentCardSkeleton from '$lib/components/team/AgentCardSkeleton.svelte';
  import AgentDetailSkeleton from '$lib/components/team/AgentDetailSkeleton.svelte';
  import KPIMetrics from '$lib/components/team/KPIMetrics.svelte';
  import TrendChart from '$lib/components/team/TrendChart.svelte';
  import ErrorRetry from '$lib/components/ui/ErrorRetry.svelte';
  import MobileModal from '$lib/components/ui/MobileModal.svelte';
  import RealtimeStatus from '$lib/components/ui/RealtimeStatus.svelte';
  import { mockTeamData } from '$lib/services/team.service';
  import {
    currentStats,
    filteredAgents,
    selectedAgent,
    teamActions,
    teamState
  } from '$lib/stores/team.store';
  import '$lib/styles/team-tokens.css';
  import { onMount } from 'svelte';

  // Lazy loading de componentes pesados (comentado hasta que se implementen)
  // const AgentCard = import('$lib/components/team/AgentCard.svelte');
  // const AgentDetail = import('$lib/components/team/AgentDetail.svelte');
  // const OverviewTab = import('$lib/components/team/OverviewTab.svelte');
  // const KPIsTab = import('$lib/components/team/KPIsTab.svelte');
  // const TrendsTab = import('$lib/components/team/TrendsTab.svelte');
  // const ActionsTab = import('$lib/components/team/ActionsTab.svelte');
  // const InsightsTab = import('$lib/components/team/InsightsTab.svelte');

  // Estado local
  let loading = true;
  let searchTerm = '';
  let statusFilter = 'all';
  let selectedTab = 'overview'; // Nueva variable para controlar pestañas
  let rightPanelTab: 'actions' | 'insights' = 'actions'; // Variable para el panel derecho

  // Estados para funcionalidades avanzadas
  let error: string | null = null;
  // Variables comentadas hasta que se implementen las funcionalidades
  // let showConfirmation = false;
  // let confirmationConfig = {
  //   title: '',
  //   message: '',
  //   type: 'warning' as 'warning' | 'danger' | 'info',
  //   onConfirm: () => {}
  // };
  let loadingDetails = false;
  // let loadingPermissions = false;

  // Estados para modals móviles
  let showAgentDetailModal = false;
  let showActionsModal = false;
  let showInsightsModal = false;

  // Memoización de cálculos complejos (comentado hasta que se implemente)
  // let memoizedStats: any = null;
  // let lastStatsUpdate = 0;
  // const STATS_CACHE_DURATION = 5000; // 5 segundos

  // Función memoizada para calcular estadísticas (comentada hasta que se implemente)
  // function getMemoizedStats() {
  //   const now = Date.now();
  //   if (!memoizedStats || (now - lastStatsUpdate) > STATS_CACHE_DURATION) {
  //     memoizedStats = $currentStats;
  //     lastStatsUpdate = now;
  //   }
  //   return memoizedStats;
  // }

  // Cargar datos iniciales
  async function loadInitialData() {
    try {
      teamActions.setLoading('agents', true);

      // Simular carga de datos (en producción sería desde API)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockAgents = mockTeamData.generateMockAgents();
      await teamActions.loadAgents(mockAgents);

      // Auto-seleccionar primer agente
      teamActions.autoSelectFirstAgent();

      loading = false;
    } catch (error) {
      // Error loading team data
      // console.error('Error loading team data:', error);
      loading = false;
    }
  }

  // Manejar búsqueda con debounce optimizado
  let searchTimeout: NodeJS.Timeout;
  function handleSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    searchTerm = target.value;

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      teamActions.updateSearch(searchTerm);
      updateURL(); // Actualizar URL después del debounce
    }, 300);
  }

  // Manejar filtro de estado
  function handleStatusFilter(filter: 'all' | 'active' | 'inactive') {
    statusFilter = filter;
    teamActions.updateStatusFilter(filter);
    updateURL(); // Actualizar URL inmediatamente
  }

  // Manejar cambio de tab principal
  function handleTabChange(tab: 'overview' | 'kpis' | 'trends') {
    selectedTab = tab;
    teamActions.setActiveTab(tab);
    updateURL(); // Actualizar URL inmediatamente
  }

  // Manejar cambio de tab del panel derecho
  function handleRightPanelTabChange(tab: 'actions' | 'insights') {
    rightPanelTab = tab;
    teamActions.setRightPanelTab(tab);
  }

  // Funciones para funcionalidades avanzadas (comentadas hasta que se implementen)
  // function handleError(message: string) {
  //   error = message;
  //   setTimeout(() => {
  //     error = null;
  //   }, 5000);
  // }

  // function handleRetry() {
  //   error = null;
  //   loadInitialData();
  // }

  // function showConfirmationDialog(title: string, message: string, type: 'warning' | 'danger' | 'info', onConfirm: () => void) {
  //   confirmationConfig = { title, message, type, onConfirm };
  //   showConfirmation = true;
  // }

  // function handleConfirm() {
  //   confirmationConfig.onConfirm();
  //   showConfirmation = false;
  // }

  // function handleCancel() {
  //   showConfirmation = false;
  // }

  // Función mejorada para seleccionar agente con loading
  function handleAgentSelect(agentId: string) {
    loadingDetails = true;

    // Simular carga
    setTimeout(() => {
      teamActions.selectAgent(agentId);
      loadingDetails = false;

      // En mobile, abrir modal de detalles
      if (window.innerWidth < 768) {
        showAgentDetailModal = true;
      }
    }, 500);
  }

  // Función para cambiar permisos con confirmación
  // Función para manejar cambios de permisos (comentada hasta que se implemente)
  // function handlePermissionChange(agentId: string, permission: string, newLevel: string) {
  //   showConfirmationDialog(
  //     'Cambiar Permisos',
  //     `¿Estás seguro de que quieres cambiar el permiso "${permission}" a nivel "${newLevel}"?`,
  //     'warning',
  //     async () => {
  //       try {
  //         loadingPermissions = true;
  //         // Aquí iría la llamada al backend
  //         await new Promise(resolve => setTimeout(resolve, 1000));
  //         // Actualizar el estado local
  //         teamActions.updateAgentPermissions(agentId, { [permission]: newLevel });
  //       } catch (err) {
  //         handleError('Error al actualizar los permisos');
  //       } finally {
  //         loadingPermissions = false;
  //       }
  //     }
  //   );
  // }

  // Función para actualizar datos (comentada hasta que se implemente)
  // async function refreshData() {
  //   await loadInitialData();
  // }

  // Sincronizar con URL params
  function syncWithURL() {
    const params = $page.url.searchParams;

    const urlSearch = params.get('search');
    const urlStatus = params.get('status') as 'all' | 'active' | 'inactive';
    const urlTab = params.get('tab') as 'overview' | 'kpis' | 'trends';
    const urlRightTab = params.get('rightTab') as 'actions' | 'insights';
    const urlAgentId = params.get('agentId');

    if (urlSearch !== null) {
      searchTerm = urlSearch;
      teamActions.updateSearch(urlSearch);
    }

    if (urlStatus && ['all', 'active', 'inactive'].includes(urlStatus)) {
      statusFilter = urlStatus;
      teamActions.updateStatusFilter(urlStatus);
    }

    if (urlTab && ['overview', 'kpis', 'trends'].includes(urlTab)) {
      selectedTab = urlTab;
      teamActions.setActiveTab(urlTab);
    }

    if (urlRightTab && ['actions', 'insights'].includes(urlRightTab)) {
      rightPanelTab = urlRightTab;
      teamActions.setRightPanelTab(urlRightTab);
    }

    if (urlAgentId) {
      teamActions.selectAgent(urlAgentId);
    }
  }

  // Actualizar URL con los parámetros actuales
  function updateURL() {
    const url = new URL(window.location.href);

    // Actualizar searchParams
    if (searchTerm) {
      url.searchParams.set('search', searchTerm);
    } else {
      url.searchParams.delete('search');
    }

    if (statusFilter !== 'all') {
      url.searchParams.set('status', statusFilter);
    } else {
      url.searchParams.delete('status');
    }

    if (selectedTab !== 'overview') {
      url.searchParams.set('tab', selectedTab);
    } else {
      url.searchParams.delete('tab');
    }

    if (rightPanelTab !== 'actions') {
      url.searchParams.set('rightTab', rightPanelTab);
    } else {
      url.searchParams.delete('rightTab');
    }

    if ($teamState.selectedAgentId) {
      url.searchParams.set('agentId', $teamState.selectedAgentId);
    } else {
      url.searchParams.delete('agentId');
    }

    // Actualizar URL sin recargar la página
    window.history.replaceState({}, '', url.toString());
  }

  // Reactive statement para actualizar URL cuando cambien los parámetros
  $: if (typeof window !== 'undefined') {
    updateURL();
  }

  onMount(() => {
    loadInitialData();
    syncWithURL();
  });
</script>

<!-- Layout principal -->
<div class="team-layout">
  <!-- Header principal -->
  <header class="team-header">
    <div class="header-content">
      <div class="header-left">
        <h1 class="team-title">Equipo & Performance</h1>
        <p class="team-subtitle">Gestiona tu equipo de ventas y analiza su rendimiento</p>
      </div>

      <div class="header-right">
        <div class="filter-buttons">
          <button type="button" class="filter-button active">Todos</button>
          <button type="button" class="filter-button">Activos</button>
          <button type="button" class="filter-button">Inactivos</button>
        </div>

        <!-- Estado de conexión real-time -->
        <RealtimeStatus showDetails={false} autoConnect={true} />
      </div>
    </div>

    <!-- Barra de búsqueda y filtros -->
    <div class="search-filters">
      <div class="search-container">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Buscar por nombre, rol o email..."
          class="search-input"
          bind:value={searchTerm}
          on:input={handleSearch}
        />
      </div>

      <div class="filters-container">
        <div class="status-badges">
          <span class="status-badge">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            {$currentStats.activeAgents} activos
          </span>
          <span class="status-badge secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            {$currentStats.inactiveAgents} inactivos
          </span>
        </div>

        <div class="filter-buttons">
          <button
            type="button"
            class="filter-button {statusFilter === 'all' ? 'active' : ''}"
            on:click={() => handleStatusFilter('all')}
          >
            Todos
          </button>
          <button
            type="button"
            class="filter-button {statusFilter === 'active' ? 'active' : ''}"
            on:click={() => handleStatusFilter('active')}
          >
            Activos
          </button>
          <button
            type="button"
            class="filter-button {statusFilter === 'inactive' ? 'active' : ''}"
            on:click={() => handleStatusFilter('inactive')}
          >
            Inactivos
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Contenido principal -->
  <main class="team-content grid gap-4 p-4">
    <!-- Desktop Layout: 3 columnas -->
    <div
      class="hidden lg:grid lg:grid-cols-[260px_1fr_360px] xl:grid-cols-[240px_1fr_320px] 2xl:grid-cols-[260px_1fr_360px] gap-4"
    >
      <!-- Tablet Layout: 2 columnas -->
      <div class="hidden md:grid md:grid-cols-[280px_1fr] lg:hidden gap-4">
        <!-- Columna 1: Lista de Agentes -->
        <aside class="agents-list-panel">
          <div class="panel-header">
            <h2 class="panel-title">Lista de Vendedores</h2>
            <span class="agents-count">{$filteredAgents.length}</span>
          </div>

          <div class="agents-list">
            {#if loading}
              <!-- Skeletons de carga -->
              <AgentCardSkeleton />
              <AgentCardSkeleton />
              <AgentCardSkeleton />
              <AgentCardSkeleton />
            {:else if $filteredAgents.length === 0}
              <!-- Estado vacío -->
              <div class="empty-state">
                <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <h3 class="empty-title">No se encontraron agentes</h3>
                <p class="empty-description">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No hay agentes que coincidan con los filtros aplicados'
                    : 'No hay agentes registrados en el sistema'}
                </p>
              </div>
            {:else}
              <!-- Lista de agentes -->
              {#each $filteredAgents as agent}
                <div
                  class="agent-card {$teamState.selectedAgentId === agent.id ? 'selected' : ''}"
                  on:click={() => handleAgentSelect(agent.id)}
                  role="button"
                  tabindex="0"
                  on:keydown={e => e.key === 'Enter' && handleAgentSelect(agent.id)}
                >
                  <div class="agent-header">
                    <div class="agent-avatar">
                      {#if agent.avatar}
                        <img src={agent.avatar} alt={agent.name} />
                      {:else}
                        <span class="avatar-initials">{agent.initials}</span>
                      {/if}
                    </div>
                    <div class="agent-info">
                      <h3 class="agent-name">{agent.name}</h3>
                      <p class="agent-role">{agent.role}</p>
                      <span class="agent-status {agent.status}">
                        {agent.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <button
                      type="button"
                      class="agent-menu-button"
                      aria-label="Menú de opciones del agente"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>

                  <div class="agent-permissions">
                    <span class="permissions-label">PERMISOS</span>
                    <div class="permissions-badges">
                      {#each ['read', 'write', 'approve', 'configure'] as permission}
                        {@const level =
                          agent.permissions[permission as keyof typeof agent.permissions]}
                        {@const isActive = level !== 'basic'}
                        <span class="permission-badge {isActive ? 'active' : ''}">
                          {permission === 'read'
                            ? 'Leer'
                            : permission === 'write'
                              ? 'Escribir'
                              : permission === 'approve'
                                ? 'Aprobar'
                                : 'Configurar'}
                        </span>
                      {/each}
                    </div>
                  </div>

                  <div class="agent-metrics">
                    <div class="metric-item">
                      <svg
                        class="metric-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span class="metric-value">{agent.metrics.chatsHandled}</span>
                      <span class="metric-label">Chats</span>
                    </div>
                    <div class="metric-item">
                      <svg
                        class="metric-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      <span class="metric-value">{agent.metrics.avgResponseTime}</span>
                      <span class="metric-label">CSAT</span>
                    </div>
                    <div class="metric-item">
                      <svg
                        class="metric-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <span class="metric-value">{agent.metrics.conversionRate}%</span>
                      <span class="metric-label">Conv.</span>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        </aside>

        <!-- Columna 2: Detalles del Agente (sin panel de acciones) -->
        <section class="main-panel">
          {#if $selectedAgent}
            {#if loadingDetails}
              <AgentDetailSkeleton />
            {:else}
              <!-- Header del agente seleccionado -->
              <div class="agent-detail-header">
                <div class="agent-detail-info">
                  <div class="agent-detail-avatar">
                    {#if $selectedAgent.avatar}
                      <img src={$selectedAgent.avatar} alt={$selectedAgent.name} />
                    {:else}
                      <span class="avatar-initials-large">{$selectedAgent.initials}</span>
                    {/if}
                  </div>
                  <div class="agent-detail-text">
                    <h2 class="agent-detail-name">{$selectedAgent.name}</h2>
                    <p class="agent-detail-role">{$selectedAgent.role}</p>
                    <div class="agent-detail-email">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {$selectedAgent.email}
                    </div>
                  </div>
                  <span class="agent-detail-status {$selectedAgent.status}">
                    {$selectedAgent.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div class="agent-detail-actions">
                  <button type="button" class="action-button outline">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Editar Perfil
                  </button>
                  <button type="button" class="action-button outline">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    Reasignar Permisos
                  </button>
                </div>
              </div>

              <!-- Tabs principales -->
              <div class="main-tabs">
                <button
                  type="button"
                  class="main-tab {selectedTab === 'overview' ? 'active' : ''}"
                  on:click={() => handleTabChange('overview')}
                >
                  Overview
                </button>
                <button
                  type="button"
                  class="main-tab {selectedTab === 'kpis' ? 'active' : ''}"
                  on:click={() => handleTabChange('kpis')}
                >
                  KPIs
                </button>
                <button
                  type="button"
                  class="main-tab {selectedTab === 'trends' ? 'active' : ''}"
                  on:click={() => handleTabChange('trends')}
                >
                  Tendencias
                </button>
              </div>

              <!-- Contenido de tabs -->
              <div class="tab-content">
                {#if selectedTab === 'overview'}
                  <!-- Tab Overview -->
                  <div class="overview-content">
                    <h3 class="section-title">KPIs de Rendimiento</h3>
                    <div class="kpi-grid">
                      <div class="kpi-card">
                        <div class="kpi-header">
                          <svg
                            class="kpi-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <span class="kpi-change positive"
                            >+{$selectedAgent.metrics.chatsHandledChange}%</span
                          >
                        </div>
                        <div class="kpi-value">{$selectedAgent.metrics.chatsHandled}</div>
                        <div class="kpi-title">Chats Atendidos</div>
                        <div class="kpi-status improving">Mejorando</div>
                      </div>

                      <div class="kpi-card">
                        <div class="kpi-header">
                          <svg
                            class="kpi-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span class="kpi-change positive"
                            >+{$selectedAgent.metrics.avgResponseTimeChange}%</span
                          >
                        </div>
                        <div class="kpi-value">{$selectedAgent.metrics.avgResponseTime}</div>
                        <div class="kpi-title">Tiempo Medio de Respuesta</div>
                        <div class="kpi-status improving">Mejorando</div>
                      </div>
                    </div>
                  </div>
                {:else if selectedTab === 'kpis'}
                  <!-- Tab KPIs -->
                  <div class="kpis-content">
                    <div class="kpis-header mb-6">
                      <h3 class="text-lg font-semibold text-gray-900 mb-2">KPIs de Rendimiento</h3>
                      <p class="text-gray-600">Métricas clave del agente seleccionado</p>
                    </div>

                    <div class="kpi-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <!-- KPI: Chats Atendidos -->
                      <KPIMetrics
                        title="Chats Atendidos"
                        value="145"
                        change={12.5}
                        status="improving"
                        icon="chat"
                        loading={false}
                      />

                      <!-- KPI: Tiempo Medio de Respuesta -->
                      <KPIMetrics
                        title="Tiempo Medio de Respuesta"
                        value="2:15"
                        change={5.2}
                        status="improving"
                        icon="clock"
                        loading={false}
                      />

                      <!-- KPI: Satisfacción del Cliente -->
                      <KPIMetrics
                        title="Satisfacción del Cliente"
                        value="4.5"
                        change={-2.1}
                        status="declining"
                        icon="star"
                        loading={false}
                      />

                      <!-- KPI: Chats Cerrados sin Escalamiento -->
                      <KPIMetrics
                        title="Chats Cerrados sin Escalamiento"
                        value="89%"
                        change={15.7}
                        status="improving"
                        icon="check"
                        loading={false}
                      />

                      <!-- KPI: Tasa de Conversión -->
                      <KPIMetrics
                        title="Tasa de Conversión"
                        value="23.5%"
                        change={8.3}
                        status="improving"
                        icon="trending-up"
                        loading={false}
                      />

                      <!-- KPI: Tiempo de Resolución -->
                      <KPIMetrics
                        title="Tiempo de Resolución"
                        value="15:30"
                        change={-3.8}
                        status="improving"
                        icon="clock"
                        loading={false}
                      />
                    </div>
                  </div>
                {:else if selectedTab === 'trends'}
                  <!-- Tab Tendencias -->
                  <div class="trends-content">
                    <div class="trends-header mb-6">
                      <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        Gráficos de Tendencia
                      </h3>
                      <p class="text-gray-600">Análisis de rendimiento a lo largo del tiempo</p>
                    </div>

                    <div class="trends-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <!-- Gráfico de Chats vs Ventas -->
                      <TrendChart
                        title="Chats vs Ventas"
                        subtitle="Comparación de chats atendidos vs ventas generadas"
                        data={[]}
                        loading={false}
                        error={false}
                      />

                      <!-- Gráfico de Tiempo de Respuesta -->
                      <TrendChart
                        title="Tiempo de Respuesta"
                        subtitle="Evolución del tiempo medio de respuesta"
                        data={[]}
                        loading={false}
                        error={false}
                      />

                      <!-- Gráfico de Satisfacción del Cliente -->
                      <TrendChart
                        title="Satisfacción del Cliente"
                        subtitle="Tendencia del CSAT a lo largo del tiempo"
                        data={[]}
                        loading={false}
                        error={false}
                      />

                      <!-- Gráfico de Conversión -->
                      <TrendChart
                        title="Tasa de Conversión"
                        subtitle="Porcentaje de conversión de chats a ventas"
                        data={[]}
                        loading={false}
                        error={false}
                      />
                    </div>
                  </div>
                {/if}
              </div>
            {/if}
          {:else}
            <!-- Estado vacío para tablet -->
            <div class="empty-state-tablet">
              <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h3 class="empty-title">Selecciona un agente</h3>
              <p class="empty-description">
                Selecciona un agente de la lista para ver sus detalles y métricas
              </p>
            </div>
          {/if}
        </section>
      </div>

      <!-- Mobile Layout: 1 columna con modals -->
      <div class="md:hidden">
        <!-- Lista de Agentes (vista principal en mobile) -->
        <aside class="agents-list-panel">
          <div class="panel-header">
            <h2 class="panel-title">Lista de Vendedores</h2>
            <span class="agents-count">{$filteredAgents.length}</span>
          </div>

          <div class="agents-list">
            {#if loading}
              <!-- Skeletons de carga -->
              <AgentCardSkeleton />
              <AgentCardSkeleton />
              <AgentCardSkeleton />
              <AgentCardSkeleton />
            {:else if $filteredAgents.length === 0}
              <!-- Estado vacío -->
              <div class="empty-state">
                <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <h3 class="empty-title">No se encontraron agentes</h3>
                <p class="empty-description">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No hay agentes que coincidan con los filtros aplicados'
                    : 'No hay agentes registrados en el sistema'}
                </p>
              </div>
            {:else}
              <!-- Lista de agentes -->
              {#each $filteredAgents as agent}
                <div
                  class="agent-card {$teamState.selectedAgentId === agent.id ? 'selected' : ''}"
                  on:click={() => handleAgentSelect(agent.id)}
                  role="button"
                  tabindex="0"
                  on:keydown={e => e.key === 'Enter' && handleAgentSelect(agent.id)}
                >
                  <div class="agent-header">
                    <div class="agent-avatar">
                      {#if agent.avatar}
                        <img src={agent.avatar} alt={agent.name} />
                      {:else}
                        <span class="avatar-initials">{agent.initials}</span>
                      {/if}
                    </div>
                    <div class="agent-info">
                      <h3 class="agent-name">{agent.name}</h3>
                      <p class="agent-role">{agent.role}</p>
                      <span class="agent-status {agent.status}">
                        {agent.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <button
                      type="button"
                      class="agent-menu-button"
                      aria-label="Menú de opciones del agente"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>

                  <div class="agent-permissions">
                    <span class="permissions-label">PERMISOS</span>
                    <div class="permissions-badges">
                      {#each ['read', 'write', 'approve', 'configure'] as permission}
                        {@const level =
                          agent.permissions[permission as keyof typeof agent.permissions]}
                        {@const isActive = level !== 'basic'}
                        <span class="permission-badge {isActive ? 'active' : ''}">
                          {permission === 'read'
                            ? 'Leer'
                            : permission === 'write'
                              ? 'Escribir'
                              : permission === 'approve'
                                ? 'Aprobar'
                                : 'Configurar'}
                        </span>
                      {/each}
                    </div>
                  </div>

                  <div class="agent-metrics">
                    <div class="metric-item">
                      <svg
                        class="metric-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span class="metric-value">{agent.metrics.chatsHandled}</span>
                      <span class="metric-label">Chats</span>
                    </div>
                    <div class="metric-item">
                      <svg
                        class="metric-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      <span class="metric-value">{agent.metrics.avgResponseTime}</span>
                      <span class="metric-label">CSAT</span>
                    </div>
                    <div class="metric-item">
                      <svg
                        class="metric-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <span class="metric-value">{agent.metrics.conversionRate}%</span>
                      <span class="metric-label">Conv.</span>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        </aside>
      </div>

      <!-- Columna 3: Panel de Acciones -->
      <aside class="actions-panel">
        <!-- Tabs del panel derecho -->
        <div class="actions-tabs">
          <button
            type="button"
            class="action-tab {rightPanelTab === 'actions' ? 'active' : ''}"
            on:click={() => handleRightPanelTabChange('actions')}
          >
            Acciones
          </button>
          <button
            type="button"
            class="action-tab {rightPanelTab === 'insights' ? 'active' : ''}"
            on:click={() => handleRightPanelTabChange('insights')}
          >
            Insights
          </button>
        </div>

        <!-- Contenido de acciones -->
        {#if rightPanelTab === 'actions'}
          <div class="actions-content">
            <!-- Acordeón: Acciones IA -->
            <div class="accordion">
              <div class="accordion-header">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Acciones IA</span>
              </div>
              <div class="accordion-content">
                <div class="ai-actions">
                  <button type="button" class="ai-action-button">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Sugerir Mejora
                  </button>
                  <button type="button" class="ai-action-button">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 17h5l-5 5v-5zM4.19 4.19A4 4 0 004 6v12a4 4 0 004 4h12a4 4 0 004-4V6a4 4 0 00-4-4H8a4 4 0 00-3.81 2.19z"
                      />
                    </svg>
                    Enviar Recordatorio
                  </button>
                </div>
              </div>
            </div>

            <!-- Acordeón: Permisos y Accesos -->
            <div class="accordion">
              <div class="accordion-header">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>Permisos y Accesos</span>
              </div>
              <div class="accordion-content">
                <!-- Contenido de permisos aquí -->
              </div>
            </div>

            <!-- Acordeón: Coaching -->
            <div class="accordion">
              <div class="accordion-header">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Coaching</span>
              </div>
              <div class="accordion-content">
                <!-- Contenido de coaching aquí -->
              </div>
            </div>
          </div>
        {:else}
          <!-- Contenido de insights -->
          <div class="insights-content">
            <h3 class="section-title">Insights Personalizados</h3>
            <!-- Insights aquí -->
          </div>
        {/if}
      </aside>
    </div>
  </main>

  <!-- Componentes de funcionalidades avanzadas -->
  {#if error}
    <ErrorRetry {error} onRetry={() => loadInitialData()} title="Error" message={error} />
  {/if}

  <!-- ConfirmationDialog comentado hasta que se implemente -->
  <!-- <ConfirmationDialog
  bind:open={showConfirmation}
  title={confirmationConfig.title}
  message={confirmationConfig.message}
  type={confirmationConfig.type}
  on:confirm={handleConfirm}
  on:cancel={handleCancel}
  on:close={handleCancel}
  loading={loadingPermissions}
/> -->

  <!-- Modals para Mobile -->

  <!-- Modal de Detalles del Agente -->
  <MobileModal
    bind:open={showAgentDetailModal}
    title={$selectedAgent ? $selectedAgent.name : 'Detalles del Agente'}
    showClose={true}
    on:close={() => (showAgentDetailModal = false)}
  >
    {#if $selectedAgent}
      {#if loadingDetails}
        <AgentDetailSkeleton />
      {:else}
        <div class="p-4">
          <!-- Header del agente -->
          <div class="agent-detail-header mb-6">
            <div class="agent-detail-info">
              <div class="agent-detail-avatar">
                {#if $selectedAgent.avatar}
                  <img src={$selectedAgent.avatar} alt={$selectedAgent.name} />
                {:else}
                  <span class="avatar-initials-large">{$selectedAgent.initials}</span>
                {/if}
              </div>
              <div class="agent-detail-text">
                <h2 class="agent-detail-name">{$selectedAgent.name}</h2>
                <p class="agent-detail-role">{$selectedAgent.role}</p>
                <div class="agent-detail-email">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {$selectedAgent.email}
                </div>
              </div>
              <span class="agent-detail-status {$selectedAgent.status}">
                {$selectedAgent.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          <!-- Tabs principales -->
          <div class="main-tabs mb-4">
            <button
              type="button"
              class="main-tab {selectedTab === 'overview' ? 'active' : ''}"
              on:click={() => handleTabChange('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              class="main-tab {selectedTab === 'kpis' ? 'active' : ''}"
              on:click={() => handleTabChange('kpis')}
            >
              KPIs
            </button>
            <button
              type="button"
              class="main-tab {selectedTab === 'trends' ? 'active' : ''}"
              on:click={() => handleTabChange('trends')}
            >
              Tendencias
            </button>
          </div>

          <!-- Contenido de tabs -->
          <div class="tab-content">
            {#if selectedTab === 'overview'}
              <!-- Tab Overview -->
              <div class="overview-content">
                <h3 class="section-title">KPIs de Rendimiento</h3>
                <div class="kpi-grid">
                  <div class="kpi-card">
                    <div class="kpi-header">
                      <svg class="kpi-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span class="kpi-change positive"
                        >+{$selectedAgent.metrics.chatsHandledChange}%</span
                      >
                    </div>
                    <div class="kpi-value">{$selectedAgent.metrics.chatsHandled}</div>
                    <div class="kpi-title">Chats Atendidos</div>
                    <div class="kpi-status improving">Mejorando</div>
                  </div>

                  <div class="kpi-card">
                    <div class="kpi-header">
                      <svg class="kpi-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span class="kpi-change positive"
                        >+{$selectedAgent.metrics.avgResponseTimeChange}%</span
                      >
                    </div>
                    <div class="kpi-value">{$selectedAgent.metrics.avgResponseTime}</div>
                    <div class="kpi-title">Tiempo Medio de Respuesta</div>
                    <div class="kpi-status improving">Mejorando</div>
                  </div>
                </div>
              </div>
            {:else if selectedTab === 'kpis'}
              <!-- Tab KPIs -->
              <div class="kpis-content">
                <div class="kpis-header mb-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">KPIs de Rendimiento</h3>
                  <p class="text-gray-600">Métricas clave del agente seleccionado</p>
                </div>

                <div class="kpi-grid grid grid-cols-1 gap-4">
                  <KPIMetrics
                    title="Chats Atendidos"
                    value="145"
                    change={12.5}
                    status="improving"
                    icon="chat"
                    loading={false}
                  />

                  <KPIMetrics
                    title="Tiempo Medio de Respuesta"
                    value="2:15"
                    change={5.2}
                    status="improving"
                    icon="clock"
                    loading={false}
                  />

                  <KPIMetrics
                    title="Satisfacción del Cliente"
                    value="4.5"
                    change={-2.1}
                    status="declining"
                    icon="star"
                    loading={false}
                  />

                  <KPIMetrics
                    title="Chats Cerrados sin Escalamiento"
                    value="89%"
                    change={15.7}
                    status="improving"
                    icon="check"
                    loading={false}
                  />

                  <KPIMetrics
                    title="Tasa de Conversión"
                    value="23.5%"
                    change={8.3}
                    status="improving"
                    icon="trending-up"
                    loading={false}
                  />

                  <KPIMetrics
                    title="Tiempo de Resolución"
                    value="15:30"
                    change={-3.8}
                    status="improving"
                    icon="clock"
                    loading={false}
                  />
                </div>
              </div>
            {:else if selectedTab === 'trends'}
              <!-- Tab Tendencias -->
              <div class="trends-content">
                <div class="trends-header mb-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Gráficos de Tendencia</h3>
                  <p class="text-gray-600">Análisis de rendimiento a lo largo del tiempo</p>
                </div>

                <div class="trends-grid grid grid-cols-1 gap-6">
                  <TrendChart
                    title="Chats vs Ventas"
                    subtitle="Comparación de chats atendidos vs ventas generadas"
                    data={[]}
                    loading={false}
                    error={false}
                  />

                  <TrendChart
                    title="Tiempo de Respuesta"
                    subtitle="Evolución del tiempo medio de respuesta"
                    data={[]}
                    loading={false}
                    error={false}
                  />

                  <TrendChart
                    title="Satisfacción del Cliente"
                    subtitle="Tendencia del CSAT a lo largo del tiempo"
                    data={[]}
                    loading={false}
                    error={false}
                  />

                  <TrendChart
                    title="Tasa de Conversión"
                    subtitle="Porcentaje de conversión de chats a ventas"
                    data={[]}
                    loading={false}
                    error={false}
                  />
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    {/if}
  </MobileModal>

  <!-- Modal de Acciones -->
  <MobileModal
    bind:open={showActionsModal}
    title="Acciones"
    showClose={true}
    on:close={() => (showActionsModal = false)}
  >
    <div class="p-4">
      <!-- Acordeón: Acciones IA -->
      <div class="accordion mb-4">
        <div class="accordion-header">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>Acciones IA</span>
        </div>
        <div class="accordion-content">
          <div class="ai-actions">
            <button type="button" class="ai-action-button">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Sugerir Mejora
            </button>
            <button type="button" class="ai-action-button">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-5 5v-5zM4.19 4.19A4 4 0 004 6v12a4 4 0 004 4h12a4 4 0 004-4V6a4 4 0 00-4-4H8a4 4 0 00-3.81 2.19z"
                />
              </svg>
              Enviar Recordatorio
            </button>
          </div>
        </div>
      </div>

      <!-- Acordeón: Permisos y Accesos -->
      <div class="accordion mb-4">
        <div class="accordion-header">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Permisos y Accesos</span>
        </div>
        <div class="accordion-content">
          <!-- Contenido de permisos aquí -->
        </div>
      </div>

      <!-- Acordeón: Coaching -->
      <div class="accordion">
        <div class="accordion-header">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Coaching</span>
        </div>
        <div class="accordion-content">
          <!-- Contenido de coaching aquí -->
        </div>
      </div>
    </div>
  </MobileModal>

  <!-- Modal de Insights -->
  <MobileModal
    bind:open={showInsightsModal}
    title="Insights"
    showClose={true}
    on:close={() => (showInsightsModal = false)}
  >
    <div class="p-4">
      <h3 class="section-title">Insights Personalizados</h3>
      <!-- Insights aquí -->
    </div>
  </MobileModal>

  <!-- Botones flotantes de navegación móvil -->
  <div class="fixed bottom-4 right-4 md:hidden z-40">
    <div class="flex flex-col gap-2">
      <!-- Botón para abrir acciones -->
      <button
        type="button"
        class="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        on:click={() => (showActionsModal = true)}
        aria-label="Abrir acciones"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </button>

      <!-- Botón para abrir insights -->
      <button
        type="button"
        class="w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
        on:click={() => (showInsightsModal = true)}
        aria-label="Abrir insights"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </button>
    </div>
  </div>
</div>

<style>
  /* Layout principal */
  .team-layout {
    @apply min-h-screen bg-gray-50;
  }

  /* Aplicar tokens CSS de FASE 6 */
  .team-content {
    @apply grid grid-cols-1 lg:grid-cols-[260px_1fr_360px] xl:grid-cols-[240px_1fr_320px] 2xl:grid-cols-[260px_1fr_360px] gap-6 p-6;
  }

  /* ============================================================================
   * 6.1 ESPACIADO ESPECÍFICO
   * ============================================================================ */

  /* Cards padding */
  .team-card {
    @apply p-4;
  }

  /* Secciones gap */
  .team-section {
    @apply space-y-6;
  }

  /* Grid gaps */
  .team-grid {
    @apply gap-3;
  }

  /* Headers padding - aplicado en la definición principal */

  /* ============================================================================
   * 6.2 ALTURAS FIJAS OBLIGATORIAS
   * ============================================================================ */

  /* KPI Cards */
  .kpi-card {
    @apply h-40; /* 160px */
  }

  /* Gráficos */
  .trend-chart {
    @apply h-80; /* 320px */
  }

  .trend-chart-large {
    @apply h-96; /* 384px - equivalente a h-85 */
  }

  /* Métricas adicionales */
  .metric-card {
    @apply h-36; /* 144px - equivalente a h-35 */
  }

  /* Vista rápida */
  .quick-view {
    @apply h-32; /* 128px - equivalente a h-30 */
  }

  /* ============================================================================
   * 6.3 COLORES SEMÁNTICOS
   * ============================================================================ */

  /* Mejorando */
  .improving {
    @apply text-green-600 bg-green-50 border-green-200;
  }

  /* Atención */
  .attention {
    @apply text-red-600 bg-red-50 border-red-200;
  }

  /* Estable */
  .stable {
    @apply text-blue-600 bg-blue-50 border-blue-200;
  }

  /* Header */
  .team-header {
    @apply bg-white border-b border-gray-200 p-6;
  }

  .header-content {
    @apply flex justify-between items-start mb-4;
  }

  .header-left {
    @apply flex-1;
  }

  .team-title {
    @apply text-2xl font-bold text-gray-900 mb-1;
  }

  .team-subtitle {
    @apply text-sm text-gray-600;
  }

  .header-right {
    @apply flex items-center gap-3;
  }

  .refresh-button {
    @apply flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors;
  }

  /* Búsqueda y filtros */
  .search-filters {
    @apply flex items-center gap-4;
  }

  .search-container {
    @apply relative flex-1 max-w-md;
  }

  .search-icon {
    @apply absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400;
  }

  .search-input {
    @apply w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  }

  .filters-container {
    @apply flex items-center gap-4;
  }

  .status-badges {
    @apply flex items-center gap-2;
  }

  .status-badge {
    @apply flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full;
  }

  .status-badge.secondary {
    @apply bg-gray-100 text-gray-700;
  }

  .filter-buttons {
    @apply flex items-center gap-1;
  }

  .filter-button {
    @apply px-3 py-1 text-sm rounded-md transition-colors;
  }

  .filter-button.active {
    @apply bg-blue-100 text-blue-700;
  }

  .filter-button:not(.active) {
    @apply text-gray-600 hover:bg-gray-100;
  }

  /* Contenido principal - ya aplicado arriba */

  /* Panel de lista de agentes */
  .agents-list-panel {
    @apply bg-white rounded-lg border border-gray-200 overflow-hidden team-section;
  }

  .panel-header {
    @apply flex items-center justify-between p-4 border-b border-gray-200;
  }

  .panel-title {
    @apply text-lg font-semibold text-gray-900;
  }

  .agents-count {
    @apply px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full;
  }

  .agents-list {
    @apply p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto;
  }

  /* Card de agente */
  .agent-card {
    @apply border border-gray-200 rounded-lg team-card cursor-pointer transition-all hover:border-blue-300 hover:shadow-sm;
  }

  .agent-card.selected {
    @apply border-blue-500 ring-2 ring-blue-500 ring-offset-2;
  }

  .agent-header {
    @apply flex items-start gap-3 mb-3;
  }

  .agent-avatar {
    @apply w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0;
  }

  .avatar-initials {
    @apply text-sm font-semibold text-blue-700;
  }

  .agent-info {
    @apply flex-1 min-w-0;
  }

  .agent-name {
    @apply text-sm font-medium text-gray-900 truncate;
  }

  .agent-role {
    @apply text-xs text-gray-600 truncate;
  }

  .agent-status {
    @apply text-xs px-2 py-1 rounded-full;
  }

  .agent-status.active {
    @apply bg-green-100 text-green-700;
  }

  .agent-status.inactive {
    @apply bg-gray-100 text-gray-700;
  }

  .agent-menu-button {
    @apply p-1 text-gray-400 hover:text-gray-600 transition-colors;
  }

  /* Permisos */
  .agent-permissions {
    @apply mb-3;
  }

  .permissions-label {
    @apply block text-xs font-medium text-gray-500 mb-2;
  }

  .permissions-badges {
    @apply flex flex-wrap gap-1;
  }

  .permission-badge {
    @apply px-2 py-1 text-xs rounded border;
  }

  .permission-badge.active {
    @apply bg-blue-100 text-blue-700 border-blue-200;
  }

  .permission-badge:not(.active) {
    @apply bg-gray-50 text-gray-600 border-gray-200;
  }

  /* Métricas */
  .agent-metrics {
    @apply grid grid-cols-3 gap-2;
  }

  .metric-item {
    @apply flex flex-col items-center text-center;
  }

  .metric-icon {
    @apply w-4 h-4 text-gray-400 mb-1;
  }

  .metric-value {
    @apply text-sm font-semibold text-gray-900;
  }

  .metric-label {
    @apply text-xs text-gray-600;
  }

  /* Indicador de selección */
  .selection-indicator {
    @apply flex items-center gap-2 mt-3 pt-3 border-t border-gray-100;
  }

  .selection-dot {
    @apply w-2 h-2 bg-blue-500 rounded-full;
  }

  .selection-text {
    @apply text-xs text-blue-700 font-medium;
  }

  /* Skeletons */
  .agent-card-skeleton {
    @apply p-4 border border-gray-200 rounded-lg animate-pulse;
  }

  .skeleton-avatar {
    @apply w-10 h-10 bg-gray-200 rounded-full;
  }

  .skeleton-content {
    @apply space-y-2;
  }

  .skeleton-name {
    @apply h-4 bg-gray-200 rounded w-3/4;
  }

  .skeleton-role {
    @apply h-3 bg-gray-200 rounded w-1/2;
  }

  .skeleton-metrics {
    @apply grid grid-cols-3 gap-2;
  }

  .skeleton-metric {
    @apply h-3 bg-gray-200 rounded;
  }

  /* Estado vacío */
  .empty-state {
    @apply text-center py-8;
  }

  .empty-icon {
    @apply w-12 h-12 text-gray-400 mx-auto mb-3;
  }

  .empty-title {
    @apply text-lg font-medium text-gray-900 mb-2;
  }

  .empty-description {
    @apply text-sm text-gray-600;
  }

  /* Panel principal */
  .main-panel {
    @apply bg-white rounded-lg border border-gray-200 overflow-hidden team-section;
  }

  /* Header del agente seleccionado */
  .agent-detail-header {
    @apply flex items-center justify-between p-6 border-b border-gray-200;
  }

  .agent-detail-info {
    @apply flex items-center gap-4;
  }

  .agent-detail-avatar {
    @apply w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center;
  }

  .avatar-initials-large {
    @apply text-xl font-semibold text-blue-700;
  }

  .agent-detail-text {
    @apply flex-1;
  }

  .agent-detail-name {
    @apply text-xl font-bold text-gray-900 mb-1;
  }

  .agent-detail-role {
    @apply text-sm text-gray-600 mb-2;
  }

  .agent-detail-email {
    @apply flex items-center gap-2 text-sm text-gray-500;
  }

  .agent-detail-status {
    @apply px-3 py-1 text-sm rounded-full;
  }

  .agent-detail-status.active {
    @apply bg-green-100 text-green-700;
  }

  .agent-detail-status.inactive {
    @apply bg-gray-100 text-gray-700;
  }

  .agent-detail-actions {
    @apply flex items-center gap-2;
  }

  .action-button {
    @apply flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors;
  }

  .action-button.outline {
    @apply border border-gray-300 text-gray-700 hover:bg-gray-50;
  }

  /* Tabs principales */
  .main-tabs {
    @apply flex border-b border-gray-200;
  }

  .main-tab {
    @apply px-6 py-3 text-sm font-medium border-b-2 border-transparent transition-colors;
  }

  .main-tab.active {
    @apply border-blue-500 text-blue-700;
  }

  .main-tab:not(.active) {
    @apply text-gray-600 hover:text-gray-900;
  }

  /* Contenido de tabs */
  .tab-content {
    @apply p-6;
  }

  .section-title {
    @apply text-lg font-semibold text-gray-900 mb-4;
  }

  /* Secciones con espaciado específico */
  /* .team-section {
    @apply space-y-6;
  } */

  /* Grid con espaciado específico */
  /* .team-grid {
    @apply gap-3;
  } */

  .kpi-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 team-grid;
  }

  /* KPI Cards con altura fija */
  .kpi-card {
    @apply p-4 border border-gray-200 rounded-lg bg-white h-40;
  }

  .kpi-header {
    @apply flex items-center justify-between mb-2;
  }

  .kpi-icon {
    @apply w-5 h-5 text-gray-400;
  }

  .kpi-change {
    @apply text-xs font-medium;
  }

  .kpi-change.positive {
    @apply text-green-600;
  }

  .kpi-change.negative {
    @apply text-red-600;
  }

  .kpi-value {
    @apply text-2xl font-bold text-gray-900 mb-1;
  }

  .kpi-title {
    @apply text-sm text-gray-600 mb-2;
  }

  .kpi-status {
    @apply text-xs font-medium;
  }

  /* Colores semánticos */
  .improving {
    @apply text-green-600 bg-green-50 border-green-200;
  }

  .attention {
    @apply text-red-600 bg-red-50 border-red-200;
  }

  .stable {
    @apply text-blue-600 bg-blue-50 border-blue-200;
  }

  .kpi-status.improving {
    @apply text-green-600;
  }

  .kpi-status.attention {
    @apply text-red-600;
  }

  .kpi-status.stable {
    @apply text-blue-600;
  }

  /* Gráficos con alturas fijas */
  .trend-chart {
    @apply h-80;
  }

  .trend-chart-large {
    @apply h-96;
  }

  /* Métricas adicionales */
  .metric-card {
    @apply h-36;
  }

  /* Vista rápida */
  .quick-view {
    @apply h-32;
  }

  /* Estado sin selección */
  .no-selection-state {
    @apply text-center py-12;
  }

  .no-selection-icon {
    @apply w-16 h-16 text-gray-400 mx-auto mb-4;
  }

  .no-selection-title {
    @apply text-xl font-semibold text-gray-900 mb-2;
  }

  .no-selection-description {
    @apply text-gray-600;
  }

  /* Panel de acciones */
  .actions-panel {
    @apply bg-white rounded-lg border border-gray-200 overflow-hidden team-section;
  }

  .actions-tabs {
    @apply flex border-b border-gray-200;
  }

  .action-tab {
    @apply flex-1 px-4 py-3 text-sm font-medium border-b-2 border-transparent transition-colors;
  }

  .action-tab.active {
    @apply border-blue-500 text-blue-700;
  }

  .action-tab:not(.active) {
    @apply text-gray-600 hover:text-gray-900;
  }

  .actions-content {
    @apply p-4 space-y-4;
  }

  .accordion {
    @apply border border-gray-200 rounded-lg;
  }

  .accordion-header {
    @apply flex items-center gap-2 p-4 cursor-pointer hover:bg-gray-50 transition-colors;
  }

  .accordion-content {
    @apply p-4 border-t border-gray-200;
  }

  .ai-actions {
    @apply space-y-2;
  }

  .ai-action-button {
    @apply w-full flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .team-content {
      @apply grid-cols-1;
    }

    .actions-panel {
      @apply hidden;
    }
  }

  @media (max-width: 768px) {
    .search-filters {
      @apply flex-col items-stretch gap-3;
    }

    .search-container {
      @apply max-w-none;
    }

    .filters-container {
      @apply justify-between;
    }

    .agent-detail-header {
      @apply flex-col items-start gap-4;
    }

    .agent-detail-actions {
      @apply w-full justify-start;
    }
  }

  /* Responsive Design */

  /* Tablet (768px - 1024px) */
  @media (min-width: 768px) and (max-width: 1023px) {
    .team-content {
      @apply gap-3 p-3;
    }

    .agents-list-panel {
      @apply min-w-[280px];
    }

    .main-panel {
      @apply min-w-0;
    }

    .agent-card {
      @apply p-3;
    }

    .kpi-grid {
      @apply grid-cols-2;
    }

    .trends-grid {
      @apply grid-cols-1;
    }
  }

  /* Mobile (hasta 767px) */
  @media (max-width: 767px) {
    .team-content {
      @apply gap-2 p-2;
    }

    .team-header {
      @apply p-4;
    }

    .header-content {
      @apply flex-col gap-4;
    }

    .header-left {
      @apply text-center;
    }

    .header-right {
      @apply justify-center;
    }

    .search-filters {
      @apply flex-col gap-3;
    }

    .search-container {
      @apply w-full;
    }

    .filters-container {
      @apply justify-between;
    }

    .status-badges {
      @apply justify-center;
    }

    .filter-buttons {
      @apply justify-center;
    }

    .agents-list-panel {
      @apply w-full;
    }

    .panel-header {
      @apply p-3;
    }

    .agents-list {
      @apply p-2;
    }

    .agent-card {
      @apply p-3 mb-3;
    }

    .agent-header {
      @apply flex-col items-start gap-2;
    }

    .agent-info {
      @apply w-full;
    }

    .agent-permissions {
      @apply mt-3;
    }

    .permissions-badges {
      @apply flex-wrap gap-1;
    }

    .permission-badge {
      @apply text-xs px-2 py-1;
    }

    .agent-metrics {
      @apply grid-cols-3 gap-2 mt-3;
    }

    .metric-item {
      @apply text-center;
    }

    .metric-value {
      @apply text-sm font-semibold;
    }

    .metric-label {
      @apply text-xs;
    }

    .kpi-grid {
      @apply grid-cols-1 gap-3;
    }

    .trends-grid {
      @apply grid-cols-1 gap-4;
    }

    .main-tabs {
      @apply flex-wrap gap-1;
    }

    .main-tab {
      @apply flex-1 text-sm px-3 py-2;
    }

    .action-button {
      @apply text-sm px-3 py-2;
    }

    .empty-state {
      @apply p-6 text-center;
    }

    .empty-icon {
      @apply w-16 h-16 mx-auto mb-4;
    }

    .empty-title {
      @apply text-lg font-semibold mb-2;
    }

    .empty-description {
      @apply text-sm text-gray-600;
    }
  }

  /* Estados específicos para mobile */
  .empty-state-tablet {
    @apply flex flex-col items-center justify-center p-8 text-center;
  }

  .empty-state-tablet .empty-icon {
    @apply w-20 h-20 text-gray-300 mb-4;
  }

  .empty-state-tablet .empty-title {
    @apply text-xl font-semibold text-gray-900 mb-2;
  }

  .empty-state-tablet .empty-description {
    @apply text-gray-600 max-w-md;
  }

  /* Animaciones para mobile */
  @media (max-width: 767px) {
    .agent-card {
      @apply transition-all duration-200;
    }

    .agent-card:active {
      @apply transform scale-95;
    }

    .action-button:active {
      @apply transform scale-95;
    }
  }
</style>
