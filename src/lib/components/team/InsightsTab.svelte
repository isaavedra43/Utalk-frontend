<!--
 * InsightsTab - Componente para mostrar insights personalizados del agente
 * Incluye cards de insights con diferentes tipos y severidades
 -->

<script lang="ts">
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import type { Agent } from '$lib/types/team';
  import { AlertTriangle, ArrowRight, CheckCircle, Lightbulb, TrendingUp } from 'lucide-svelte';

  // Props del componente
  export let agent: Agent;
  export let loading = false;

  // Datos de insights (mock)
  const insights = [
    {
      id: '1',
      type: 'achievement' as const,
      title: 'Mejora significativa en CSAT',
      severity: 'low' as const,
      description:
        'El CSAT ha mejorado un 15% en las últimas 2 semanas, superando el objetivo del equipo.',
      action: 'Ver detalles'
    },
    {
      id: '2',
      type: 'alert' as const,
      title: 'Tiempo de respuesta aumentando',
      severity: 'medium' as const,
      description: 'El tiempo promedio de respuesta ha aumentado un 8% en los últimos 7 días.',
      action: 'Revisar'
    },
    {
      id: '3',
      type: 'recommendation' as const,
      title: 'Oportunidad de upsell',
      severity: 'low' as const,
      description: 'Se identificaron 12 conversaciones con potencial de venta adicional.',
      action: 'Explorar'
    },
    {
      id: '4',
      type: 'trend' as const,
      title: 'Patrón de actividad cambiante',
      severity: 'medium' as const,
      description:
        'La actividad durante las mañanas ha disminuido un 20% en comparación con el mes anterior.',
      action: 'Analizar'
    }
  ];

  function getInsightIcon(type: string) {
    switch (type) {
      case 'achievement':
        return CheckCircle;
      case 'alert':
        return AlertTriangle;
      case 'recommendation':
        return Lightbulb;
      case 'trend':
        return TrendingUp;
      default:
        return Lightbulb;
    }
  }

  function getInsightColor(type: string) {
    switch (type) {
      case 'achievement':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'alert':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'recommendation':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'trend':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  }

  function handleInsightAction(insightId: string, action: string) {
    console.log(`Acción ejecutada: ${action} para insight ${insightId} de ${agent.name}`);
  }
</script>

<div class="p-4 space-y-4">
  {#if loading}
    <!-- Skeleton loading -->
    <div class="space-y-4">
      <div class="h-6 w-48 bg-muted rounded animate-pulse"></div>
      <div class="space-y-3">
        <div class="h-24 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-24 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-24 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-24 bg-muted rounded-lg animate-pulse"></div>
      </div>
    </div>
  {:else}
    <!-- Header -->
    <div>
      <h3 class="text-lg font-semibold mb-2">Insights Personalizados</h3>
      <p class="text-sm text-muted-foreground">
        Análisis y recomendaciones basados en el rendimiento de {agent.name}
      </p>
    </div>

    <!-- Lista de insights -->
    <div class="space-y-3">
      {#each insights as insight}
        {@const Icon = getInsightIcon(insight.type)}
        {@const insightColor = getInsightColor(insight.type)}
        {@const severityColor = getSeverityColor(insight.severity)}

        <div class="border rounded-lg p-4 {insightColor}">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <Icon class="w-5 h-5" />
              <div>
                <h4 class="font-medium text-sm">{insight.title}</h4>
                <Badge variant={severityColor} className="text-xs mt-1">
                  {insight.severity === 'medium' ? 'Media' : 'Baja'}
                </Badge>
              </div>
            </div>
          </div>

          <p class="text-sm text-muted-foreground mb-3">
            {insight.description}
          </p>

          <div class="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              on:click={() => handleInsightAction(insight.id, insight.action)}
            >
              {insight.action}
              <ArrowRight class="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      {/each}
    </div>

    <!-- Información adicional -->
    <div class="bg-muted/50 rounded-lg p-3">
      <div class="flex items-start gap-3">
        <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
        <div>
          <h4 class="text-sm font-medium mb-1">Sobre los Insights</h4>
          <p class="text-xs text-muted-foreground">
            Los insights se generan automáticamente basándose en el análisis de datos de
            rendimiento, patrones de comportamiento y métricas clave del agente.
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
