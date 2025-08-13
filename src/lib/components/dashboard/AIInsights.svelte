<!--
 * AIInsights Component - UTalk Dashboard
 * Insights y recomendaciones automáticas generadas por IA
 * 
 * Features:
 * - Resumen del día con confianza
 * - Recomendaciones y alertas
 * - Acciones sugeridas
 * - Tiempo relativo de generación
 -->

<script lang="ts">
  import type { AIInsight } from '$lib/types/dashboard';
  import { AlertTriangle, Brain, Clock, ExternalLink, Lightbulb, TrendingUp } from 'lucide-svelte';

  export let insights: AIInsight[] = [];
  export let loading = false;
  export let className = '';

  // Mock data si no hay insights
  $: displayInsights =
    insights.length > 0
      ? insights
      : [
          {
            id: '1',
            type: 'summary' as const,
            title: 'Resumen del día',
            content:
              'Hoy recibiste 347 mensajes con un 78% de sentimiento positivo. Ana García fue la agente más rápida con 1.8 min de respuesta promedio. Hubo un pico de mensajes a las 14:00 debido a consultas sobre la nueva promoción.',
            confidence: 95,
            actionable: false,
            priority: 'medium' as const,
            createdAt: new Date(Date.now() - 12 * 60 * 1000), // hace 12 minutos
            tags: ['daily-summary']
          },
          {
            id: '2',
            type: 'recommendation' as const,
            title: 'Optimización recomendada',
            content:
              'Se detectaron 23 casos de "problemas de entrega" con tendencia al alza. Recomiendo crear una plantilla de respuesta automática y formar al equipo en gestión de expectativas de envío.',
            confidence: 87,
            actionable: true,
            priority: 'high' as const,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // hace 2 horas
            tags: ['delivery', 'templates', 'training']
          },
          {
            id: '3',
            type: 'trend' as const,
            title: 'Tendencia positiva detectada',
            content:
              'Las felicitaciones por servicio aumentaron 40% esta semana. El programa de formación en soft skills está mostrando resultados efectivos en la satisfacción del cliente.',
            confidence: 78,
            actionable: false,
            priority: 'low' as const,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // hace 4 horas
            tags: ['positive-trend', 'training-results']
          }
        ];

  function getTypeIcon(type: string) {
    switch (type) {
      case 'summary':
        return Brain;
      case 'recommendation':
        return Lightbulb;
      case 'alert':
        return AlertTriangle;
      case 'trend':
        return TrendingUp;
      default:
        return Brain;
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'summary':
        return 'text-blue-600 bg-blue-50';
      case 'recommendation':
        return 'text-orange-600 bg-orange-50';
      case 'alert':
        return 'text-red-600 bg-red-50';
      case 'trend':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) {
      return `hace ${diffMins} minutos`;
    } else if (diffHours < 24) {
      return `hace alrededor de ${diffHours} horas`;
    } else {
      return `hace ${Math.floor(diffHours / 24)} días`;
    }
  }
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-100 {className}">
  <!-- Header -->
  <div class="p-6 border-b border-gray-100">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-purple-50 rounded-lg">
          <Brain class="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Insights de IA</h3>
          <p class="text-sm text-gray-500">Análisis y recomendaciones automáticas</p>
        </div>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <span>Vista IA</span>
        <ExternalLink class="w-4 h-4" />
      </button>
    </div>
  </div>

  <div class="p-6">
    {#if loading}
      <!-- Loading skeleton -->
      <div class="space-y-6">
        {#each Array(3) as _item}
          <div class="animate-pulse">
            {_item}
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div class="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div class="flex gap-2">
                  <div class="h-5 bg-gray-200 rounded-full w-16"></div>
                  <div class="h-5 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="space-y-6">
        {#each displayInsights as insight}
          {@const TypeIcon = getTypeIcon(insight.type)}
          <div class="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div class="flex items-start gap-4">
              <!-- Icono del tipo -->
              <div class="p-2 rounded-lg {getTypeColor(insight.type)}">
                <TypeIcon class="w-5 h-5" />
              </div>

              <div class="flex-1 min-w-0">
                <!-- Header del insight -->
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-medium text-gray-900">{insight.title}</h4>
                  {#if insight.priority !== 'low'}
                    <span
                      class="px-2 py-1 text-xs font-medium rounded-full border {getPriorityColor(
                        insight.priority
                      )}"
                    >
                      {insight.priority}
                    </span>
                  {/if}
                </div>

                <!-- Contenido -->
                <p class="text-sm text-gray-600 mb-3 leading-relaxed">
                  {insight.content}
                </p>

                <!-- Footer con metadatos -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <!-- Confianza -->
                    <div class="flex items-center gap-1 text-xs text-gray-500">
                      <span class="font-medium">Confianza: {insight.confidence}%</span>
                    </div>

                    <!-- Tiempo -->
                    <div class="flex items-center gap-1 text-xs text-gray-500">
                      <Clock class="w-3 h-3" />
                      <span>{getTimeAgo(insight.createdAt)}</span>
                    </div>
                  </div>

                  <!-- Tags -->
                  <div class="flex flex-wrap gap-1">
                    {#each insight.tags.slice(0, 3) as tag}
                      <span class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {tag.replace('-', ' ')}
                      </span>
                    {/each}
                    {#if insight.tags.length > 3}
                      <span class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        +{insight.tags.length - 3}
                      </span>
                    {/if}
                  </div>
                </div>

                <!-- Acciones (si es actionable) -->
                {#if insight.actionable}
                  <div class="mt-3 pt-3 border-t border-gray-100">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Acción
                      </button>
                      <button type="button" class="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                        <ExternalLink class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
