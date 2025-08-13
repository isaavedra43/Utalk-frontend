<!--
 * Dashboard Completo - UTalk Dashboard
 * Página principal de dashboard con todos los componentes integrados
 -->

<script lang="ts">
  import { Download, Filter, RefreshCw, Search, Settings } from 'lucide-svelte';
  import { onMount } from 'svelte';
  // Componentes del dashboard
  import ActivityChart from '$lib/components/charts/ActivityChart.svelte';
  import AgentRanking from '$lib/components/dashboard/AgentRanking.svelte';
  import AIInsights from '$lib/components/dashboard/AIInsights.svelte';
  import CalendarHeatmap from '$lib/components/dashboard/CalendarHeatmap.svelte';
  import DashboardFilters from '$lib/components/dashboard/DashboardFilters.svelte';
  import ExportPanel from '$lib/components/dashboard/ExportPanel.svelte';
  import KPICard from '$lib/components/dashboard/KPICard.svelte';
  import SentimentChart from '$lib/components/dashboard/SentimentChart.svelte';
  import TopicsPanel from '$lib/components/dashboard/TopicsPanel.svelte';
  // Componentes avanzados
  import NotificationCenter from '$lib/components/dashboard/NotificationCenter.svelte';
  // Store y servicios
  import { dashboardService } from '$lib/services/dashboard.service';
  import {
    dashboardActions,
    dashboardFilters,
    dashboardState,
    kpisWithTrends,
    rankedAgents
  } from '$lib/stores/dashboard.store';

  // Estado local
  let loading = true;
  let lastRefresh = new Date();
  let searchQuery = '';

  // Estados de componentes avanzados
  let showFilters = false;
  let showExport = false;
  let showNotifications = false;

  // Función para cargar datos del dashboard
  async function loadDashboardData() {
    try {
      dashboardActions.setLoading(true);

      const data = await dashboardService.getAllDashboardData();

      dashboardActions.setKPIs(data.kpis);
      dashboardActions.setActivity(data.activity);
      dashboardActions.setAgents(data.agents);

      lastRefresh = new Date();
      dashboardActions.setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      dashboardActions.setError('Error cargando datos del dashboard');
      dashboardActions.setLoading(false);
    }
  }

  // Función para refrescar datos
  async function refreshData() {
    await loadDashboardData();
  }

  // Cargar datos al montar el componente
  onMount(() => {
    loadDashboardData();
    loading = false;
  });

  // Formatear fecha del saludo
  function formatGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = '';

    if (hour < 12) greeting = 'Buenos días';
    else if (hour < 18) greeting = 'Buenas tardes';
    else greeting = 'Buenas noches';

    return greeting;
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Funciones para componentes avanzados
  function handleFiltersChanged(event: CustomEvent) {
    const newFilters = event.detail;
    // Aplicar filtros y recargar datos
    console.log('Filtros aplicados:', newFilters);
    loadDashboardData();
  }

  function handleExport(event: CustomEvent) {
    const config = event.detail;
    // Lógica de exportación
    console.log('Configuración de exportación:', config);
  }

  function handleSchedule(event: CustomEvent) {
    const config = event.detail;
    // Lógica de programación de reportes
    console.log('Configuración de programación:', config);
  }
</script>

<svelte:head>
  <title>Dashboard • UTalk</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header principal -->
  <div class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between">
        <!-- Saludo y fecha -->
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {formatGreeting()}, Israel 👋
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            {formatDate(lastRefresh)} • Último actualizado hace 2 minutos
          </p>
        </div>

        <!-- Controles del header -->
        <div class="flex items-center gap-4">
          <!-- Buscador -->
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar en dashboard..."
              bind:value={searchQuery}
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Filtros -->
          <button
            type="button"
            on:click={() => (showFilters = true)}
            class="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <Filter class="w-4 h-4" />
            <span>Filtros</span>
          </button>

          <!-- Exportar -->
          <button
            type="button"
            on:click={() => (showExport = true)}
            class="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <Download class="w-4 h-4" />
            <span>Exportar</span>
          </button>

          <!-- Vista IA -->
          <button
            type="button"
            class="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm hover:bg-purple-100"
          >
            <Settings class="w-4 h-4" />
            <span>Vista IA</span>
          </button>

          <!-- Notificaciones -->
          <NotificationCenter bind:isOpen={showNotifications} />

          <!-- Refresh -->
          <button
            type="button"
            on:click={refreshData}
            class="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <RefreshCw class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Contenido principal -->
  <div class="max-w-7xl mx-auto px-6 py-6">
    <!-- Grid de KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {#each $kpisWithTrends as kpi}
        <KPICard data={kpi} {loading} />
      {/each}
    </div>

    <!-- Primera fila de charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Activity Chart -->
      <ActivityChart data={$dashboardState.activity} {loading} height={320} />

      <!-- Agent Ranking -->
      <AgentRanking agents={$rankedAgents} {loading} />
    </div>

    <!-- Segunda fila de charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Sentiment Chart -->
      <SentimentChart data={$dashboardState.sentiment} {loading} height={320} />

      <!-- Topics Panel -->
      <TopicsPanel
        topics={$dashboardState.topics}
        riskCustomers={$dashboardState.riskCustomers}
        {loading}
      />

      <!-- Calendar Heatmap -->
      <CalendarHeatmap {loading} />
    </div>

    <!-- Insights de IA -->
    <div class="mb-6">
      <AIInsights insights={$dashboardState.insights} {loading} />
    </div>
  </div>

  <!-- Componentes avanzados -->
  <DashboardFilters
    bind:isOpen={showFilters}
    filters={$dashboardFilters}
    agents={$rankedAgents}
    on:filtersChanged={handleFiltersChanged}
  />

  <ExportPanel bind:isOpen={showExport} on:export={handleExport} on:schedule={handleSchedule} />
</div>
