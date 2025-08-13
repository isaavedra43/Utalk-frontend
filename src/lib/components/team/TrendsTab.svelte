<!--
 * TrendsTab - Componente para mostrar los gráficos de tendencias del agente
 * Incluye 5 gráficos obligatorios con placeholders
 -->

<script lang="ts">
  import type { Agent } from '$lib/types/team';
  import { Activity, BarChart3, Clock, Star, TrendingUp } from 'lucide-svelte';

  // Props del componente
  export let agent: Agent;
  export let loading = false;
</script>

<div class="p-6 space-y-6">
  {#if loading}
    <!-- Skeleton loading -->
    <div class="space-y-6">
      <div class="h-6 w-48 bg-muted rounded animate-pulse"></div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="h-80 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-80 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-80 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-80 bg-muted rounded-lg animate-pulse"></div>
        <div class="h-80 bg-muted rounded-lg animate-pulse lg:col-span-2"></div>
      </div>
    </div>
  {:else}
    <!-- Gráficos de Tendencia -->
    <div>
      <h3 class="text-lg font-semibold mb-4">Gráficos de Tendencia</h3>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 1. Chats vs Ventas -->
        <div class="bg-card border rounded-lg p-6 h-80 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold">Chats vs Ventas</h4>
            <BarChart3 class="w-5 h-5 text-muted-foreground" />
          </div>
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <BarChart3 class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p class="text-sm text-muted-foreground">Gráfico de tendencia - últimos 30 días</p>
              <p class="text-xs text-muted-foreground mt-2">Placeholder para gráfico de barras</p>
            </div>
          </div>
        </div>

        <!-- 2. Tiempo de Respuesta -->
        <div class="bg-card border rounded-lg p-6 h-80 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold">Tiempo de Respuesta</h4>
            <Clock class="w-5 h-5 text-muted-foreground" />
          </div>
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <Clock class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p class="text-sm text-muted-foreground">Tiempo promedio de respuesta por hora</p>
              <p class="text-xs text-muted-foreground mt-2">Placeholder para gráfico de línea</p>
            </div>
          </div>
        </div>

        <!-- 3. Distribución por Canal -->
        <div class="bg-card border rounded-lg p-6 h-80 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold">Distribución por Canal</h4>
            <Activity class="w-5 h-5 text-muted-foreground" />
          </div>
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <Activity class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p class="text-sm text-muted-foreground">Progress bars por canal con porcentajes</p>
              <p class="text-xs text-muted-foreground mt-2">Placeholder para gráfico de dona</p>
            </div>
          </div>
        </div>

        <!-- 4. CSAT últimos 30 días -->
        <div class="bg-card border rounded-lg p-6 h-80 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold">CSAT últimos 30 días</h4>
            <Star class="w-5 h-5 text-muted-foreground" />
          </div>
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <div class="text-4xl font-bold text-primary mb-2">4.6</div>
              <p class="text-sm text-muted-foreground">Promedio CSAT</p>
              <p class="text-xs text-muted-foreground mt-2">Placeholder para gráfico de área</p>
            </div>
          </div>
        </div>

        <!-- 5. Actividad por Hora (full width) -->
        <div class="bg-card border rounded-lg p-6 h-80 flex flex-col lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold">Actividad por Hora</h4>
            <TrendingUp class="w-5 h-5 text-muted-foreground" />
          </div>
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <TrendingUp class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p class="text-sm text-muted-foreground">Distribución de mensajes por hora del día</p>
              <p class="text-xs text-muted-foreground mt-2">Placeholder para gráfico de calor</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Información adicional -->
    <div class="bg-muted/50 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
        <div>
          <h4 class="text-sm font-medium mb-1">Información de Gráficos</h4>
          <p class="text-xs text-muted-foreground">
            Los gráficos se cargarán dinámicamente con datos reales del agente. Actualmente se
            muestran placeholders para demostrar el layout y la estructura.
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
