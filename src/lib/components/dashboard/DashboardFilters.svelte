<!--
 * DashboardFilters Component - UTalk Dashboard
 * Componente de filtros avanzados para el dashboard
 * 
 * Features:
 * - Filtros por período (hoy, ayer, semana, mes, personalizado)
 * - Selección múltiple de canales
 * - Selección múltiple de agentes
 * - Date picker para rango personalizado
 * - Estados guardados y presets
 -->

<script lang="ts">
  import type { DashboardFilters } from '$lib/types/dashboard';
  import { Filter, X } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let filters: DashboardFilters;
  export let isOpen = false;
  export let agents: Array<{ id: string; name: string }> = [];

  let showDatePicker = false;
  let selectedChannels = new Set(filters.channels);
  let selectedAgents = new Set(filters.agents);

  const channels = [
    { id: 'whatsapp', name: 'WhatsApp', color: '#25d366' },
    { id: 'facebook', name: 'Facebook', color: '#1877f2' },
    { id: 'instagram', name: 'Instagram', color: '#e4405f' },
    { id: 'telegram', name: 'Telegram', color: '#0088cc' },
    { id: 'webchat', name: 'Web Chat', color: '#6366f1' }
  ];

  const periods = [
    { id: 'today', label: 'Hoy' },
    { id: 'yesterday', label: 'Ayer' },
    { id: 'week', label: 'Esta semana' },
    { id: 'month', label: 'Este mes' },
    { id: 'custom', label: 'Personalizado' }
  ];

  function toggleChannel(channelId: string) {
    if (selectedChannels.has(channelId)) {
      selectedChannels.delete(channelId);
    } else {
      selectedChannels.add(channelId);
    }
    selectedChannels = new Set(selectedChannels);
  }

  function toggleAgent(agentId: string) {
    if (selectedAgents.has(agentId)) {
      selectedAgents.delete(agentId);
    } else {
      selectedAgents.add(agentId);
    }
    selectedAgents = new Set(selectedAgents);
  }

  function selectAllChannels() {
    selectedChannels = new Set(channels.map(c => c.id));
  }

  function clearAllChannels() {
    selectedChannels = new Set();
  }

  function selectAllAgents() {
    selectedAgents = new Set(agents.map(a => a.id));
  }

  function clearAllAgents() {
    selectedAgents = new Set();
  }

  function applyFilters() {
    const newFilters: DashboardFilters = {
      ...filters,
      channels: Array.from(selectedChannels),
      agents: Array.from(selectedAgents)
    };

    dispatch('filtersChanged', newFilters);
    isOpen = false;
  }

  function resetFilters() {
    selectedChannels = new Set(['all']);
    selectedAgents = new Set(['all']);
    filters = {
      period: 'today',
      channels: ['all'],
      agents: ['all'],
      dateRange: {
        start: new Date(),
        end: new Date()
      }
    };
    dispatch('filtersChanged', filters);
  }

  function updateDateRange(type: 'start' | 'end', value: string) {
    if (!filters.dateRange) {
      filters.dateRange = {
        start: new Date(),
        end: new Date()
      };
    }

    if (type === 'start') {
      filters.dateRange.start = new Date(value);
    } else {
      filters.dateRange.end = new Date(value);
    }

    // Trigger reactive update
    filters = { ...filters };
  }

  function setPeriod(period: string) {
    filters.period = period as any;
    showDatePicker = period === 'custom';
  }
</script>

{#if isOpen}
  <!-- Overlay -->
  <button
    type="button"
    class="fixed inset-0 bg-black bg-opacity-50 z-40"
    on:click={() => (isOpen = false)}
    on:keydown={e => e.key === 'Escape' && (isOpen = false)}
    aria-label="Cerrar filtros"
  ></button>

  <!-- Panel de filtros -->
  <div
    class="fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <Filter class="w-5 h-5 text-gray-600" />
        <h3 class="text-lg font-semibold text-gray-900">Filtros</h3>
      </div>
      <button
        type="button"
        on:click={() => (isOpen = false)}
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X class="w-4 h-4 text-gray-500" />
      </button>
    </div>

    <!-- Contenido de filtros -->
    <div class="p-6 space-y-6 overflow-y-auto h-full pb-20">
      <!-- Período -->
      <div>
        <div class="block text-sm font-medium text-gray-900 mb-3">Período</div>
        <div class="space-y-2">
          {#each periods as period}
            <label class="flex items-center">
              <input
                type="radio"
                bind:group={filters.period}
                value={period.id}
                on:change={() => setPeriod(period.id)}
                class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="ml-3 text-sm text-gray-700">{period.label}</span>
            </label>
          {/each}
        </div>

        <!-- Date picker personalizado -->
        {#if showDatePicker}
          <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="date-start" class="block text-xs font-medium text-gray-700 mb-1"
                  >Desde</label
                >
                <input
                  id="date-start"
                  type="date"
                  value={filters.dateRange?.start || ''}
                  on:input={e => updateDateRange('start', e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label for="date-end" class="block text-xs font-medium text-gray-700 mb-1"
                  >Hasta</label
                >
                <input
                  id="date-end"
                  type="date"
                  value={filters.dateRange?.end || ''}
                  on:input={e => updateDateRange('end', e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Canales -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm font-medium text-gray-900">Canales</div>
          <div class="flex gap-1">
            <button
              type="button"
              on:click={selectAllChannels}
              class="text-xs text-blue-600 hover:text-blue-700"
            >
              Todos
            </button>
            <span class="text-xs text-gray-400">•</span>
            <button
              type="button"
              on:click={clearAllChannels}
              class="text-xs text-gray-600 hover:text-gray-700"
            >
              Ninguno
            </button>
          </div>
        </div>

        <div class="space-y-2">
          {#each channels as channel}
            <label class="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={selectedChannels.has(channel.id)}
                on:change={() => toggleChannel(channel.id)}
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div class="flex items-center gap-3 ml-3">
                <div class="w-3 h-3 rounded-full" style="background-color: {channel.color}"></div>
                <span class="text-sm text-gray-700">{channel.name}</span>
              </div>
            </label>
          {/each}
        </div>
      </div>

      <!-- Agentes -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm font-medium text-gray-900">Agentes</div>
          <div class="flex gap-1">
            <button
              type="button"
              on:click={selectAllAgents}
              class="text-xs text-blue-600 hover:text-blue-700"
            >
              Todos
            </button>
            <span class="text-xs text-gray-400">•</span>
            <button
              type="button"
              on:click={clearAllAgents}
              class="text-xs text-gray-600 hover:text-gray-700"
            >
              Ninguno
            </button>
          </div>
        </div>

        <div class="space-y-2 max-h-48 overflow-y-auto">
          {#each agents as agent}
            <label class="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={selectedAgents.has(agent.id)}
                on:change={() => toggleAgent(agent.id)}
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="ml-3 text-sm text-gray-700">{agent.name}</span>
            </label>
          {/each}
        </div>
      </div>

      <!-- Filtros rápidos -->
      <div>
        <div class="block text-sm font-medium text-gray-900 mb-3">Filtros rápidos</div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
          >
            Solo activos
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
          >
            Alto rendimiento
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
          >
            Necesita atención
          </button>
        </div>
      </div>
    </div>

    <!-- Footer con acciones -->
    <div class="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
      <div class="flex gap-3">
        <button
          type="button"
          on:click={resetFilters}
          class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Limpiar
        </button>
        <button
          type="button"
          on:click={applyFilters}
          class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  </div>
{/if}
