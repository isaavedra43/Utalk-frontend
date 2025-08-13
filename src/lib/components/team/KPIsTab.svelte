<!--
 * KPIsTab - Componente para mostrar todos los KPIs extendidos del agente
 * Incluye KPIs principales y métricas adicionales
 -->

<script lang="ts">
  import type { Agent } from '$lib/types/team';
  import {
    Activity,
    CheckCircle,
    Clock,
    MessageSquare,
    Star,
    Target,
    TrendingUp
  } from 'lucide-svelte';

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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="h-36 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-36 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-36 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-36 bg-muted rounded-lg animate-pulse"></div>
      </div>
    </div>
  {:else}
    <!-- KPIs Extendidos -->
    <div>
      <h3 class="text-lg font-semibold mb-4">KPIs Extendidos</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Chats Atendidos -->
        <div class="bg-card border rounded-lg p-4 h-40 flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <MessageSquare class="w-5 h-5 text-muted-foreground" />
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
            <Star class="w-5 h-5 text-muted-foreground" />
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
            <CheckCircle class="w-5 h-5 text-muted-foreground" />
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

    <!-- Métricas Adicionales -->
    <div>
      <h3 class="text-lg font-semibold mb-4">Métricas Adicionales</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Chats Resueltos Primera Vez -->
        <div class="bg-card border rounded-lg p-4 h-36 flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <CheckCircle class="w-5 h-5 text-muted-foreground" />
            <span class="text-sm font-medium text-green-600">+5.2%</span>
          </div>
          <div class="text-2xl font-bold mb-1">{agent.metrics.firstTimeResolution}%</div>
          <div class="text-sm text-muted-foreground mb-2">Chats Resueltos Primera Vez</div>
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

        <!-- Tasa Upsell Cross-sell -->
        <div class="bg-card border rounded-lg p-4 h-36 flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <Target class="w-5 h-5 text-muted-foreground" />
            <span class="text-sm font-medium text-green-600">+8.7%</span>
          </div>
          <div class="text-2xl font-bold mb-1">{agent.metrics.upsellCrossSellRate}%</div>
          <div class="text-sm text-muted-foreground mb-2">Tasa Upsell Cross-sell</div>
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

        <!-- Feedback IA (Calidad) -->
        <div class="bg-card border rounded-lg p-4 h-36 flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <Star class="w-5 h-5 text-muted-foreground" />
            <span class="text-sm font-medium text-green-600">+3.1%</span>
          </div>
          <div class="text-2xl font-bold mb-1">{agent.metrics.aiQualityScore}/5.0</div>
          <div class="text-sm text-muted-foreground mb-2">Feedback IA (Calidad)</div>
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

        <!-- Eficiencia General -->
        <div class="bg-card border rounded-lg p-4 h-36 flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <Activity class="w-5 h-5 text-muted-foreground" />
            <span class="text-sm font-medium text-green-600">+12.3%</span>
          </div>
          <div class="text-2xl font-bold mb-1">87.5%</div>
          <div class="text-sm text-muted-foreground mb-2">Eficiencia General</div>
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
      </div>
    </div>
  {/if}
</div>
