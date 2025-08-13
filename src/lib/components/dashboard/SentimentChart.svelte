<!--
 * SentimentChart Component - UTalk Dashboard
 * Gráfico donut para distribución de sentimientos con desglose por canales
 * 
 * Features:
 * - Gráfico donut con porcentajes de sentimiento
 * - Desglose por canales (WhatsApp, Facebook, etc.)
 * - Colores temáticos por sentimiento
 * - Leyenda interactiva
 * - Responsive design
 -->

<script lang="ts">
  import type { SentimentData } from '$lib/types/dashboard';
  import { Frown, Meh, Smile } from 'lucide-svelte';

  export let data: SentimentData[] = [];
  export let loading = false;
  export let height = 320;
  export let className = '';

  // Cálculos de sentimiento global
  $: totalMessages = data.reduce((sum, item) => sum + item.totalMessages, 0);
  $: totalPositive = data.reduce((sum, item) => sum + item.positive, 0);
  $: totalNeutral = data.reduce((sum, item) => sum + item.neutral, 0);
  $: totalNegative = data.reduce((sum, item) => sum + item.negative, 0);

  $: positivePercent =
    totalMessages > 0 ? ((totalPositive / totalMessages) * 100).toFixed(1) : '0.0';
  $: neutralPercent = totalMessages > 0 ? ((totalNeutral / totalMessages) * 100).toFixed(1) : '0.0';
  $: negativePercent =
    totalMessages > 0 ? ((totalNegative / totalMessages) * 100).toFixed(1) : '0.0';

  // Calcular ángulos para el gráfico donut
  $: positiveAngle = totalMessages > 0 ? (totalPositive / totalMessages) * 360 : 0;
  $: neutralAngle = totalMessages > 0 ? (totalNeutral / totalMessages) * 360 : 0;
  $: negativeAngle = totalMessages > 0 ? (totalNegative / totalMessages) * 360 : 0;

  // Función para crear path del arco SVG
  function createArcPath(
    startAngle: number,
    endAngle: number,
    radius: number = 80,
    innerRadius: number = 45
  ) {
    const start = polarToCartesian(100, 100, radius, endAngle);
    const end = polarToCartesian(100, 100, radius, startAngle);
    const innerStart = polarToCartesian(100, 100, innerRadius, endAngle);
    const innerEnd = polarToCartesian(100, 100, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      'L',
      innerEnd.x,
      innerEnd.y,
      'A',
      innerRadius,
      innerRadius,
      0,
      largeArcFlag,
      1,
      innerStart.x,
      innerStart.y,
      'Z'
    ].join(' ');
  }

  function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }
</script>

<div
  class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 {className}"
  style="height: {height}px;"
>
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h3 class="text-lg font-semibold text-gray-900">Análisis de Sentimiento</h3>
      <p class="text-sm text-gray-500">Distribución general por todos los canales</p>
    </div>
  </div>

  {#if loading}
    <!-- Loading skeleton -->
    <div class="flex items-center justify-center h-full">
      <div class="animate-pulse">
        <div class="w-32 h-32 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  {:else}
    <div class="flex items-center gap-8 h-full">
      <!-- Gráfico Donut -->
      <div class="flex-shrink-0">
        <svg width="200" height="200" viewBox="0 0 200 200" class="transform -rotate-90">
          <!-- Fondo del círculo -->
          <circle cx="100" cy="100" r="80" fill="none" stroke="#f3f4f6" stroke-width="35" />

          {#if totalMessages > 0}
            <!-- Segmento Positivo -->
            <path
              d={createArcPath(0, positiveAngle)}
              fill="#10b981"
              class="transition-all duration-300 hover:opacity-80"
            />

            <!-- Segmento Neutral -->
            <path
              d={createArcPath(positiveAngle, positiveAngle + neutralAngle)}
              fill="#6b7280"
              class="transition-all duration-300 hover:opacity-80"
            />

            <!-- Segmento Negativo -->
            <path
              d={createArcPath(
                positiveAngle + neutralAngle,
                positiveAngle + neutralAngle + negativeAngle
              )}
              fill="#ef4444"
              class="transition-all duration-300 hover:opacity-80"
            />
          {/if}
        </svg>

        <!-- Centro del donut con total -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">
              {totalMessages.toLocaleString('es-ES')}
            </div>
            <div class="text-sm text-gray-500">mensajes</div>
          </div>
        </div>
      </div>

      <!-- Leyenda y métricas -->
      <div class="flex-1 space-y-4">
        <!-- Métricas principales -->
        <div class="grid grid-cols-1 gap-4">
          <!-- Positivo -->
          <div class="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <Smile class="w-4 h-4 text-green-600" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="font-medium text-green-900">Positivo</span>
                <span class="text-lg font-bold text-green-900">{positivePercent}%</span>
              </div>
              <div class="text-sm text-green-700">
                {totalPositive.toLocaleString('es-ES')} mensajes
              </div>
            </div>
          </div>

          <!-- Neutral -->
          <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-gray-500 rounded-full"></div>
              <Meh class="w-4 h-4 text-gray-600" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-900">Neutro</span>
                <span class="text-lg font-bold text-gray-900">{neutralPercent}%</span>
              </div>
              <div class="text-sm text-gray-700">
                {totalNeutral.toLocaleString('es-ES')} mensajes
              </div>
            </div>
          </div>

          <!-- Negativo -->
          <div class="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <Frown class="w-4 h-4 text-red-600" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="font-medium text-red-900">Negativo</span>
                <span class="text-lg font-bold text-red-900">{negativePercent}%</span>
              </div>
              <div class="text-sm text-red-700">
                {totalNegative.toLocaleString('es-ES')} mensajes
              </div>
            </div>
          </div>
        </div>

        <!-- Por Canal -->
        {#if data.length > 0}
          <div class="pt-4 border-t border-gray-100">
            <h4 class="font-medium text-gray-900 mb-3">Por Canal</h4>
            <div class="space-y-2">
              {#each data.slice(0, 3) as channel}
                {@const channelPositivePercent =
                  channel.totalMessages > 0
                    ? ((channel.positive / channel.totalMessages) * 100).toFixed(1)
                    : '0.0'}
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-2 h-2 rounded-full"
                      style="background-color: {channel.color}"
                    ></div>
                    <span class="text-gray-700">{channel.channel}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-gray-500">{channel.totalMessages} msgs</span>
                    <span class="font-medium text-gray-900">{channelPositivePercent}% +</span>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .absolute {
    position: absolute;
  }
  .inset-0 {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
</style>
