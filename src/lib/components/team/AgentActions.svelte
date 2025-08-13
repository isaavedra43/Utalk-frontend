<!--
 * AgentActions - Componente para el panel derecho con acciones e insights
 * Incluye tabs de Acciones e Insights con acordeones y contenido específico
 -->

<script lang="ts">
  import { teamActions, teamState } from '$lib/stores/team.store';
  import type { Agent } from '$lib/types/team';
  import { Filter } from 'lucide-svelte';
  import ActionsTab from './ActionsTab.svelte';
  import InsightsTab from './InsightsTab.svelte';

  // Props del componente
  export let agent: Agent | null;
  export let loading = false;

  // Estado local para el tab activo
  $: rightPanelTab = $teamState.rightPanelTab;

  function handleTabChange(tab: 'actions' | 'insights') {
    teamActions.setRightPanelTab(tab);
  }
</script>

<div class="flex flex-col h-full bg-background rounded-lg shadow-sm">
  {#if agent}
    <!-- Tabs del panel derecho -->
    <div class="border-b">
      <div class="flex">
        <button
          type="button"
          class="flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors {rightPanelTab ===
          'actions'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'}"
          on:click={() => handleTabChange('actions')}
        >
          Acciones
        </button>
        <button
          type="button"
          class="flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors {rightPanelTab ===
          'insights'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'}"
          on:click={() => handleTabChange('insights')}
        >
          Insights
        </button>
      </div>
    </div>

    <!-- Contenido de tabs -->
    <div class="flex-1 overflow-y-auto">
      {#if rightPanelTab === 'actions'}
        <ActionsTab {agent} {loading} />
      {:else if rightPanelTab === 'insights'}
        <InsightsTab {agent} {loading} />
      {/if}
    </div>
  {:else}
    <!-- Estado sin selección -->
    <div
      class="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6"
    >
      <Filter class="w-12 h-12 mb-4 text-muted-foreground" />
      <h3 class="text-lg font-semibold mb-2">Panel de Acciones</h3>
      <p class="text-sm">Selecciona un agente para ver sus acciones y insights personalizados.</p>
    </div>
  {/if}
</div>
