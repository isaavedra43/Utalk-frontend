<!--
 * KPICard Component - UTalk Dashboard
 * Componente para mostrar métricas clave con valor, tendencia e icono
 * 
 * Features:
 * - 5 esquemas de color (green, blue, yellow, red, purple)
 * - Iconos dinámicos de Lucide
 * - Estados loading/error
 * - Animaciones hover suaves
 * - Responsive design
 -->

<script lang="ts">
  import type { KPIData } from '$lib/types/dashboard';
  import {
    Activity,
    BarChart3,
    CheckCircle,
    Clock,
    DollarSign,
    MessageCircle,
    Minus,
    Smile,
    Target,
    TrendingDown,
    TrendingUp,
    Users,
    Zap
  } from 'lucide-svelte';

  export let data: KPIData;
  export let loading = false;
  export let className = '';

  // Mapeo de iconos por nombre
  const iconMap = {
    Smile: Smile,
    Clock: Clock,
    CheckCircle: CheckCircle,
    TrendingUp: TrendingUp,
    Users: Users,
    MessageCircle: MessageCircle,
    DollarSign: DollarSign,
    Target: Target,
    Activity: Activity,
    BarChart3: BarChart3,
    Zap: Zap
  };

  $: iconComponent = iconMap[data?.icon as keyof typeof iconMap] || Activity;

  $: trendIcon =
    data?.changeType === 'increase'
      ? TrendingUp
      : data?.changeType === 'decrease'
        ? TrendingDown
        : Minus;

  // Esquemas de color
  $: colorClasses = {
    green: {
      accent: 'bg-success-500',
      background: 'bg-success-50',
      icon: 'bg-success-100 text-success-600',
      trend:
        data?.changeType === 'increase'
          ? 'bg-success-100 text-success-700'
          : data?.changeType === 'decrease'
            ? 'bg-danger-100 text-danger-700'
            : 'bg-gray-100 text-gray-700'
    },
    blue: {
      accent: 'bg-brand-500',
      background: 'bg-brand-50',
      icon: 'bg-brand-100 text-brand-600',
      trend:
        data?.changeType === 'increase'
          ? 'bg-success-100 text-success-700'
          : data?.changeType === 'decrease'
            ? 'bg-danger-100 text-danger-700'
            : 'bg-gray-100 text-gray-700'
    },
    yellow: {
      accent: 'bg-warning-500',
      background: 'bg-warning-50',
      icon: 'bg-warning-100 text-warning-600',
      trend:
        data?.changeType === 'increase'
          ? 'bg-success-100 text-success-700'
          : data?.changeType === 'decrease'
            ? 'bg-danger-100 text-danger-700'
            : 'bg-gray-100 text-gray-700'
    },
    red: {
      accent: 'bg-danger-500',
      background: 'bg-danger-50',
      icon: 'bg-danger-100 text-danger-600',
      trend:
        data?.changeType === 'increase'
          ? 'bg-success-100 text-success-700'
          : data?.changeType === 'decrease'
            ? 'bg-danger-100 text-danger-700'
            : 'bg-gray-100 text-gray-700'
    },
    purple: {
      accent: 'bg-purple-500',
      background: 'bg-purple-50',
      icon: 'bg-purple-100 text-purple-600',
      trend:
        data?.changeType === 'increase'
          ? 'bg-success-100 text-success-700'
          : data?.changeType === 'decrease'
            ? 'bg-danger-100 text-danger-700'
            : 'bg-gray-100 text-gray-700'
    }
  };

  $: currentColors = colorClasses[data?.color] || colorClasses.blue;

  function formatTrendValue(change: number): string {
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  }
</script>

{#if loading}
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[140px] {className}">
    <div class="animate-pulse">
      <!-- Accent line skeleton -->
      <div class="h-1 bg-gray-200 rounded-t-xl mb-4"></div>

      <!-- Header skeleton -->
      <div class="flex items-start justify-between mb-4 px-6">
        <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
      </div>

      <!-- Content skeleton -->
      <div class="px-6 pb-6 space-y-3">
        <div class="h-8 bg-gray-200 rounded w-20"></div>
        <div class="h-5 bg-gray-200 rounded w-32"></div>
        <div class="h-4 bg-gray-200 rounded w-full"></div>
        <div class="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
{:else if data}
  <div
    class="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-out cursor-pointer min-h-[140px] {currentColors.background} {className}"
  >
    <!-- Accent line -->
    <div class="absolute top-0 left-0 right-0 h-1 {currentColors.accent}"></div>

    <div class="p-6 md:p-4">
      <!-- Header con icono y tendencia -->
      <div class="flex items-start justify-between mb-4">
        <div class="p-3 rounded-lg shadow-sm {currentColors.icon} md:p-2">
          <svelte:component this={iconComponent} class="w-6 h-6" />
        </div>

        {#if data.change !== undefined}
          <div
            class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-sm {currentColors.trend}"
          >
            <svelte:component this={trendIcon} class="w-4 h-4" />
            <span class="font-semibold">{formatTrendValue(data.change)}</span>
          </div>
        {/if}
      </div>

      <!-- Valor principal y detalles -->
      <div class="space-y-2">
        <div class="text-3xl font-bold text-gray-900 leading-none md:text-2xl">{data.value}</div>
        <div class="text-lg font-semibold text-gray-700 md:text-base">{data.title}</div>

        {#if data.description}
          <p class="text-sm text-gray-500 leading-relaxed">{data.description}</p>
        {/if}

        {#if data.previousValue}
          <div class="text-xs text-gray-400 font-medium">Anterior: {data.previousValue}</div>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center min-h-[140px] {className}"
  >
    <div class="text-center text-gray-500">
      <div class="text-2xl mb-2">⚠️</div>
      <p>Error al cargar métrica</p>
    </div>
  </div>
{/if}
