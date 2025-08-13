<!--
 * AgentDetail - Componente para mostrar el detalle de un agente seleccionado
 * Incluye header con información del agente y tabs para Overview, KPIs y Tendencias
 -->

<script lang="ts">
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import type { Agent } from '$lib/types/team';
  import { Edit, Mail, RefreshCw } from 'lucide-svelte';
  import KPIsTab from './KPIsTab.svelte';
  import OverviewTab from './OverviewTab.svelte';
  import TrendsTab from './TrendsTab.svelte';

  // Props del componente
  export let agent: Agent | null;
  export let loading = false;

  // Estado local para el tab activo
  let activeTab: 'overview' | 'kpis' | 'trends' = 'overview';

  function handleTabChange(tab: 'overview' | 'kpis' | 'trends') {
    activeTab = tab;
  }

  function handleEditProfile() {
    // Lógica para editar perfil
    console.log('Editar perfil de', agent?.name);
  }

  function handleReassignPermissions() {
    // Lógica para reasignar permisos
    console.log('Reasignar permisos de', agent?.name);
  }
</script>

<div class="flex flex-col h-full bg-background rounded-lg shadow-sm">
  {#if agent}
    <!-- Header del agente seleccionado -->
    <div class="p-6 border-b flex items-center gap-4">
      <Avatar>
        <AvatarImage src={agent.avatar} alt={agent.name} />
        <AvatarFallback>{agent.initials}</AvatarFallback>
      </Avatar>
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <h2 class="text-xl font-bold">{agent.name}</h2>
          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
            {agent.status === 'active' ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
        <p class="text-muted-foreground font-medium">{agent.role}</p>
        <p class="text-sm text-muted-foreground flex items-center gap-1">
          <Mail class="w-4 h-4" />
          {agent.email}
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" on:click={handleEditProfile}>
          <Edit class="w-4 h-4 mr-2" />
          Editar Perfil
        </Button>
        <Button variant="outline" on:click={handleReassignPermissions}>
          <RefreshCw class="w-4 h-4 mr-2" />
          Reasignar Permisos
        </Button>
      </div>
    </div>

    <!-- Tabs principales -->
    <div class="border-b">
      <div class="flex">
        <button
          type="button"
          class="flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors {activeTab ===
          'overview'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'}"
          on:click={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          class="flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors {activeTab ===
          'kpis'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'}"
          on:click={() => handleTabChange('kpis')}
        >
          KPIs
        </button>
        <button
          type="button"
          class="flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors {activeTab ===
          'trends'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'}"
          on:click={() => handleTabChange('trends')}
        >
          Tendencias
        </button>
      </div>
    </div>

    <!-- Contenido de tabs -->
    <div class="flex-1 overflow-y-auto">
      {#if activeTab === 'overview'}
        <OverviewTab {agent} {loading} />
      {:else if activeTab === 'kpis'}
        <KPIsTab {agent} {loading} />
      {:else if activeTab === 'trends'}
        <TrendsTab {agent} {loading} />
      {/if}
    </div>
  {:else}
    <!-- Estado sin selección -->
    <div
      class="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-users mb-4"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <h3 class="text-lg font-semibold mb-2">Selecciona un agente</h3>
      <p class="text-sm">Para ver los detalles de rendimiento y gestionar sus acciones.</p>
    </div>
  {/if}
</div>
