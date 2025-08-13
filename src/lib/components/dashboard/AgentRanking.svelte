<!--
 * AgentRanking Component - UTalk Dashboard
 * Lista clasificada de agentes con métricas de rendimiento y estado en tiempo real
 * 
 * Features:
 * - Top performer destacado con efectos especiales
 * - Estados en tiempo real (activo/ocupado/ausente/inactivo)
 * - Métricas: conversaciones, tiempo respuesta, satisfacción
 * - Progress bars animadas
 * - Resumen del equipo
 -->

<script lang="ts">
  import type { AgentData } from '$lib/types/dashboard';
  import { Clock, Crown, MessageCircle, Star } from 'lucide-svelte';

  export let agents: AgentData[] = [];
  export let loading = false;
  export let className = '';

  // Función para formatear la última actividad
  function formatLastActivity(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    if (diff < 1) return 'hace un momento';
    if (diff === 1) return 'hace 1 minuto';
    return `hace ${diff} minutos`;
  }

  // Función para obtener el color del estado
  function getStatusColor(status: AgentData['status']): string {
    const colors = {
      active: 'bg-success-500',
      busy: 'bg-warning-500',
      away: 'bg-gray-400',
      inactive: 'bg-gray-300'
    };
    return colors[status];
  }

  // Función para obtener la etiqueta del estado
  function getStatusLabel(status: AgentData['status']): string {
    const labels = {
      active: 'Activo',
      busy: 'Ocupado',
      away: 'Ausente',
      inactive: 'Inactivo'
    };
    return labels[status];
  }

  // Calcular métricas del equipo
  $: teamStats = {
    activeCount: agents.filter(a => a.status === 'active').length,
    totalConversations: agents.reduce((sum, a) => sum + a.conversationsHandled, 0),
    avgSatisfaction:
      agents.length > 0
        ? Math.round(
            (agents.reduce((sum, a) => sum + a.satisfactionRate, 0) / agents.length) * 10
          ) / 10
        : 0
  };
</script>

<div
  class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[400px] flex flex-col hover:shadow-md transition-shadow {className}"
>
  <!-- Header -->
  <div class="p-6 pb-4 border-b border-gray-100">
    <div class="header-content">
      <div class="title-section">
        <h3 class="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-1 md:text-lg">
          <Crown class="text-warning-500" size={20} />
          Ranking de Agentes
        </h3>
        <p class="text-sm text-gray-500">Rendimiento del equipo hoy</p>
      </div>
    </div>
  </div>

  <!-- Agents List -->
  {#if loading}
    <div class="p-6 space-y-4 flex-1">
      {#each Array(5) as _item, index}
        <div class="flex items-center gap-4" data-index={index}>
          {_item}
          <div class="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div class="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
          <div class="flex-1 space-y-2 animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-24"></div>
            <div class="h-3 bg-gray-200 rounded w-32"></div>
          </div>
          <div class="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      {/each}
    </div>
  {:else if agents.length === 0}
    <div class="flex-1 flex items-center justify-center px-6">
      <div class="text-center">
        <div class="text-4xl mb-4">👥</div>
        <p class="text-lg font-semibold text-gray-900 mb-2">Sin agentes disponibles</p>
        <p class="text-sm text-gray-500">No hay información de agentes para mostrar</p>
      </div>
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto px-6">
      {#each agents as agent (agent.id)}
        <div
          class="flex items-center gap-4 p-3 rounded-lg mb-3 hover:bg-gray-50 transition-colors cursor-pointer md:flex-col md:items-start md:gap-3 md:p-4 {agent.rank ===
          1
            ? 'bg-gradient-to-r from-warning-50 to-warning-100 border border-warning-200 shadow-sm hover:from-warning-100 hover:to-warning-200'
            : ''}"
        >
          <!-- Rank badge -->
          <div
            class="w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center {agent.rank ===
            1
              ? 'bg-gradient-to-r from-warning-400 to-warning-500 text-white shadow-sm animate-pulse'
              : 'bg-gray-100 text-gray-700'}"
          >
            {agent.rank}
          </div>

          <!-- Agent info -->
          <div class="flex items-center gap-3 flex-1 md:w-full">
            <div class="relative">
              {#if agent.avatar}
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  class="w-12 h-12 rounded-full object-cover shadow-sm hover:scale-105 transition-transform"
                />
              {:else}
                <div
                  class="w-12 h-12 rounded-full bg-brand-100 text-brand-600 shadow-sm flex items-center justify-center font-semibold text-sm hover:scale-105 transition-transform"
                >
                  {agent.initials}
                </div>
              {/if}
              <div class="status-indicator {getStatusColor(agent.status)}"></div>
            </div>

            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-gray-900">{agent.name}</span>
                {#if agent.rank === 1}
                  <Crown class="crown-icon small" size={14} />
                {/if}
              </div>

              <div class="flex items-center gap-3 text-xs text-gray-500">
                <div class="flex items-center gap-1">
                  <MessageCircle size={12} />
                  <span>{agent.conversationsHandled}</span>
                </div>
                <div class="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{agent.averageResponseTime}min</span>
                </div>
                <div class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {getStatusLabel(agent.status)}
                </div>
              </div>
            </div>
          </div>

          <!-- Performance section -->
          <div class="text-right md:w-full md:text-left">
            <div class="flex items-center gap-1 justify-end mb-1">
              <Star size={14} class="text-warning-400" />
              <span class="font-bold text-gray-900">{agent.satisfactionRate}%</span>
            </div>
            <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-success-400 to-success-500 transition-all duration-500 hover:from-success-500 hover:to-success-600"
                style="width: {agent.satisfactionRate}%"
              ></div>
            </div>
          </div>
        </div>

        <!-- Agent summary -->
        <div class="flex justify-between text-xs text-gray-500 px-3 pb-2">
          <span class="summary-item">Resueltas: {agent.totalResolved}</span>
          <span class="summary-item">Actividad: {formatLastActivity(agent.lastActivity)}</span>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Team Summary -->
  <div class="flex items-center justify-around p-4 border-t border-gray-100 bg-gray-50 md:gap-4">
    <div class="text-center">
      <div class="text-lg font-bold text-gray-900">{teamStats.activeCount}</div>
      <div class="text-xs text-gray-500">Activos</div>
    </div>
    <div class="text-center">
      <div class="text-lg font-bold text-gray-900">{teamStats.totalConversations}</div>
      <div class="text-xs text-gray-500">Total Conv.</div>
    </div>
    <div class="text-center">
      <div class="text-lg font-bold text-gray-900">{teamStats.avgSatisfaction}%</div>
      <div class="text-xs text-gray-500">Satisfacción</div>
    </div>
  </div>
</div>
