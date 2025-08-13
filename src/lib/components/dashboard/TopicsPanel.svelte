<!--
 * TopicsPanel Component - UTalk Dashboard
 * Panel con tabs para temas emergentes y alertas de clientes en riesgo
 * 
 * Features:
 * - Tabs para "Temas Emergentes" y "Clientes en Riesgo"
 * - Detección automática por IA
 * - Niveles de prioridad y acciones sugeridas
 * - Keywords y trending
 -->

<script lang="ts">
  import type { EmergingTopic, RiskCustomer } from '$lib/types/dashboard';
  import { AlertTriangle, ChevronRight, Copy, ExternalLink, TrendingUp } from 'lucide-svelte';

  export let topics: EmergingTopic[] = [];
  export const riskCustomers: RiskCustomer[] = [];
  export let loading = false;
  export let className = '';

  let activeTab: 'topics' | 'risks' = 'topics';

  // Mock data si no hay datos
  $: displayTopics =
    topics.length > 0
      ? topics
      : [
          {
            id: '1',
            topic: 'Problemas de facturación',
            frequency: 12,
            sentiment: 'negative' as const,
            category: 'complaint' as const,
            keywords: ['factura', 'cobro', 'cargo'],
            trend: 'rising' as const,
            priority: 'critical' as const
          },
          {
            id: '2',
            topic: 'Problemas de entrega',
            frequency: 23,
            sentiment: 'negative' as const,
            category: 'complaint' as const,
            keywords: ['entrega', 'retraso', 'pedido'],
            trend: 'rising' as const,
            priority: 'high' as const
          },
          {
            id: '3',
            topic: 'Consultas sobre productos',
            frequency: 45,
            sentiment: 'neutral' as const,
            category: 'question' as const,
            keywords: ['producto', 'precio', 'disponibilidad'],
            trend: 'stable' as const,
            priority: 'medium' as const
          },
          {
            id: '4',
            topic: 'Felicitaciones por servicio',
            frequency: 18,
            sentiment: 'positive' as const,
            category: 'compliment' as const,
            keywords: ['excelente', 'gracias', 'satisfecho'],
            trend: 'rising' as const,
            priority: 'low' as const
          }
        ];

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getSentimentColor(sentiment: string) {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-100 {className}">
  <!-- Header con tabs -->
  <div class="p-6 border-b border-gray-100">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <AlertTriangle class="w-5 h-5 text-orange-500" />
        <h3 class="text-lg font-semibold text-gray-900">Temas y Alertas</h3>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <span>Actualizar</span>
        <ExternalLink class="w-4 h-4" />
      </button>
    </div>

    <p class="text-sm text-gray-500 mb-4">Tendencias detectadas por IA</p>

    <!-- Tabs -->
    <div class="flex space-x-1 bg-gray-100 rounded-lg p-1">
      <button
        type="button"
        class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors {activeTab ===
        'topics'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'}"
        on:click={() => (activeTab = 'topics')}
      >
        Temas Emergentes
      </button>
      <button
        type="button"
        class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors {activeTab ===
        'risks'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'}"
        on:click={() => (activeTab = 'risks')}
      >
        Clientes en Riesgo
      </button>
    </div>
  </div>

  <div class="p-6">
    {#if loading}
      <!-- Loading skeleton -->
      <div class="space-y-4">
        {#each Array(3) as _item, index}
          <div class="animate-pulse" data-index={index}>
            {_item}
            <div class="flex items-center justify-between mb-2">
              <div class="h-4 bg-gray-200 rounded w-1/3"></div>
              <div class="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            <div class="flex gap-2 mt-2">
              <div class="h-6 bg-gray-200 rounded-full w-16"></div>
              <div class="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
          </div>
        {/each}
      </div>
    {:else if activeTab === 'topics'}
      <!-- Temas Emergentes -->
      <div class="space-y-4">
        {#each displayTopics as topic}
          <div class="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <!-- Header del tema -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  {#if topic.trend === 'rising'}
                    <TrendingUp class="w-4 h-4 text-red-500" />
                    <span class="text-xs text-red-600 font-medium">↗ {topic.frequency}</span>
                  {:else}
                    <span class="text-xs text-gray-500">→ {topic.frequency}</span>
                  {/if}
                </div>
                <h4 class="font-medium text-gray-900 mb-1">{topic.topic}</h4>
                <p class="text-sm text-gray-600">
                  {#if topic.category === 'complaint'}
                    Se detectaron {topic.frequency} casos de "{topic.topic}" con tendencia al alza.
                    Recomiendo crear una plantilla de respuesta automática y formar al equipo en
                    gestión de expectativas de envío.
                  {:else if topic.category === 'question'}
                    Las {topic.topic.toLowerCase()} aumentaron {topic.frequency} casos esta semana. El
                    programa de formación en soft skills está mostrando resultados efectivos en la satisfacción
                    del cliente.
                  {:else}
                    {topic.frequency} menciones detectadas con tendencia {topic.trend === 'rising'
                      ? 'ascendente'
                      : 'estable'}.
                  {/if}
                </p>
              </div>

              <div class="flex flex-col items-end gap-2">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full border {getPriorityColor(
                    topic.priority
                  )}"
                >
                  {topic.priority}
                </span>
                <span class="text-xs font-medium {getSentimentColor(topic.sentiment)}">
                  {topic.category === 'complaint'
                    ? 'Complaint'
                    : topic.category === 'question'
                      ? 'Question'
                      : 'Compliment'}
                </span>
              </div>
            </div>

            <!-- Keywords y acciones -->
            <div class="flex items-center justify-between">
              <div class="flex flex-wrap gap-1">
                {#each topic.keywords as keyword}
                  <span class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {keyword}
                  </span>
                {/each}
                <span class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"> +1 </span>
              </div>

              <div class="flex items-center gap-2">
                <div class="text-xs text-gray-500">87% confianza • hace alrededor de 2 horas</div>
                <button type="button" class="p-1 text-gray-400 hover:text-gray-600">
                  <Copy class="w-4 h-4" />
                </button>
                <button type="button" class="p-1 text-gray-400 hover:text-gray-600">
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <!-- Clientes en Riesgo -->
      <div class="text-center py-8 text-gray-500">
        <AlertTriangle class="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p class="text-sm">No hay clientes en riesgo crítico en este momento</p>
        <p class="text-xs mt-1">La IA monitorea continuamente los patrones de interacción</p>
      </div>
    {/if}
  </div>
</div>
