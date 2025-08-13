<!--
 * OverviewTab - Componente para mostrar la vista general del agente
 * Incluye KPIs de rendimiento y vista rápida de tendencias
 -->

<script lang="ts">
  import type { Agent } from '$lib/types/team';
  import { Activity, Clock, TrendingUp } from 'lucide-svelte';

  // Props del componente
  export let agent: Agent;
  export let loading = false;

  // Función para obtener el color del status badge
  function getStatusColor(status: string) {
    switch (status) {
      case 'Mejorando':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Requiere atención':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Estable':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  // Función para obtener el icono del cambio
  function getChangeIcon(change: number) {
    if (change > 0) {
      return 'text-green-600';
    } else if (change < 0) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  }

  // Función para formatear el cambio
  function formatChange(change: number) {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  }
</script>

<div class="p-6 space-y-6">
  {#if loading}
    <!-- Skeleton loading -->
    <div class="space-y-6">
      <div class="h-6 w-48 bg-muted rounded animate-pulse"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="h-40 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-40 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-40 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-40 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-40 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-40 bg-muted rounded-lg animate-pulse"></div>
      </div>
      <div class="h-6 w-64 bg-muted rounded animate-pulse"></div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="h-32 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-32 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-32 bg-muted rounded-lg animate-pulse"></div>
      </div>
    </div>
  {:else}
    <!-- KPIs de Rendimiento -->
    <div>
      <h3 class="text-lg font-semibold mb-4">KPIs de Rendimiento</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Chats Atendidos -->
        <div class="bg-card border rounded-lg p-4 h-40 flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <svg
              class="w-5 h-5 text-muted-foreground"
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
            <span class="text-sm font-medium {getChangeIcon(agent.metrics.chatsHandledChange)}">
              {formatChange(agent.metrics.chatsHandledChange)}
            </span>
          </div>
          <div class="text-2xl font-bold mb-1">{agent.metrics.chatsHandled}</div>
          <div class="text-sm text-muted-foreground mb-2">Chats Atendidos</div>
          <div class="mt-auto">
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border {getStatusColor(
                'Mejorando'
              )}"
            >
              Mejorando
            </span>
          </div>
        </div>

        <!-- Tiempo Medio de Respuesta -->
        <div class="bg-card border rounded-lg p-4 h-40 flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <Clock class="w-5 h-5 text-muted-foreground" />
            <span class="text-sm font-medium {getChangeIcon(agent.metrics.avgResponseTimeChange)}">
              {formatChange(agent.metrics.avgResponseTimeChange)}
            </span>
          </div>
          <div class="text-2xl font-bold mb-1">{agent.metrics.avgResponseTime}</div>
          <div class="text-sm text-muted-foreground mb-2">Tiempo Medio de Respuesta</div>
          <div class="mt-auto">
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border {getStatusColor(
                'Mejorando'
              )}"
            >
              Mejorando
            </span>
          </div>
        </div>

        <!-- CSAT Score -->
        <div class="bg-card border rounded-lg p-4 h-40 flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <svg
              class="w-5 h-5 text-muted-foreground"
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
            <span class="text-sm font-medium {getChangeIcon(agent.metrics.csatScoreChange)}">
              {formatChange(agent.metrics.csatScoreChange)}
            </span>
          </div>
          <div class="text-2xl font-bold mb-1">{agent.metrics.csatScore}/5.0</div>
          <div class="text-sm text-muted-foreground mb-2">CSAT Score</div>
          <div class="mt-auto">
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border {getStatusColor(
                'Estable'
              )}"
            >
              Estable
            </span>
          </div>
        </div>

        <!-- Tasa de Conversión -->
        <div class="bg-card border rounded-lg p-4 h-40 flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <TrendingUp class="w-5 h-5 text-muted-foreground" />
            <span class="text-sm font-medium {getChangeIcon(agent.metrics.conversionRateChange)}">
              {formatChange(agent.metrics.conversionRateChange)}
            </span>
          </div>
          <div class="text-2xl font-bold mb-1">{agent.metrics.conversionRate}%</div>
          <div class="text-sm text-muted-foreground mb-2">Tasa de Conversión</div>
          <div class="mt-auto">
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border {getStatusColor(
                'Mejorando'
              )}"
            >
              Mejorando
            </span>
          </div>
        </div>

        <!-- Chats Cerrados sin Escalamiento -->
        <div class="bg-card border rounded-lg p-4 h-40 flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <svg
              class="w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              class="text-sm font-medium {getChangeIcon(
                agent.metrics.chatsClosedWithoutEscalationChange
              )}"
            >
              {formatChange(agent.metrics.chatsClosedWithoutEscalationChange)}
            </span>
          </div>
          <div class="text-2xl font-bold mb-1">{agent.metrics.chatsClosedWithoutEscalation}</div>
          <div class="text-sm text-muted-foreground mb-2">Chats Cerrados sin Escalamiento</div>
          <div class="mt-auto">
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border {getStatusColor(
                'Mejorando'
              )}"
            >
              Mejorando
            </span>
          </div>
        </div>

        <!-- Tiempo Total en Chats -->
        <div class="bg-card border rounded-lg p-4 h-40 flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <Activity class="w-5 h-5 text-muted-foreground" />
            <span class="text-sm font-medium text-gray-600">+2.3%</span>
          </div>
          <div class="text-2xl font-bold mb-1">{agent.metrics.totalTimeInChats}</div>
          <div class="text-sm text-muted-foreground mb-2">Tiempo Total en Chats</div>
          <div class="mt-auto">
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border {getStatusColor(
                'Estable'
              )}"
            >
              Estable
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Rápida de Tendencias -->
    <div>
      <h3 class="text-lg font-semibold mb-4">Vista Rápida de Tendencias</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Rendimiento General -->
        <div class="bg-card border rounded-lg p-4 h-32">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-muted-foreground">Rendimiento General</span>
            <span class="text-sm font-bold text-green-600">85%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div class="bg-green-600 h-2 rounded-full" style="width: 85%"></div>
          </div>
          <p class="text-xs text-muted-foreground">Basado en todos los KPIs principales</p>
        </div>

        <!-- Tendencia Mensual -->
        <div class="bg-card border rounded-lg p-4 h-32">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-muted-foreground">Tendencia Mensual</span>
            <TrendingUp class="w-4 h-4 text-green-600" />
          </div>
          <div class="text-2xl font-bold text-green-600 mb-1">+12.5%</div>
          <p class="text-xs text-muted-foreground">Mejora en el rendimiento general</p>
        </div>

        <!-- Actividad -->
        <div class="bg-card border rounded-lg p-4 h-32">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-muted-foreground">Actividad</span>
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <div class="text-sm font-medium mb-1">Última actividad: hace 2 horas</div>
          <p class="text-xs text-muted-foreground">Activo en el sistema</p>
        </div>
      </div>
    </div>
  {/if}
</div>
