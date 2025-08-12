<script lang="ts">
  import type { HourlyPoint, ActivitySummary } from '../types';
  import { dv2 } from '../theme';
  export let data: HourlyPoint[] = [];
  export let summary: ActivitySummary;
  export let state = { loading: false, error: null } as { loading: boolean; error: string | null };
</script>

<div class="{dv2.card} {dv2.sectionPad} min-h-[380px]">
  <div class="flex items-start justify-between mb-4">
    <div>
      <h2 class="text-lg font-semibold">Actividad del Día</h2>
      <p class="{dv2.muted}">Mensajes por hora • Pico: {summary?.peakHour ?? '--:--'}</p>
    </div>
    <div class="text-right">
      <div class="text-2xl font-semibold">{summary?.total ?? 0}</div>
      <div class="text-xs"
           class:text-emerald-600={(summary?.vsYesterdayPct ?? 0) >= 0}
           class:text-rose-600={(summary?.vsYesterdayPct ?? 0) < 0}>
        vs ayer {summary ? ((summary.vsYesterdayPct >= 0 ? '+' : '') + summary.vsYesterdayPct.toFixed(1) + '%') : '--'}
      </div>
    </div>
  </div>

  {#if state.loading}
    <div class="h-[280px] animate-pulse bg-slate-100 rounded"></div>
  {:else if state.error}
    <div class="text-sm text-rose-600">{state.error}</div>
  {:else if !data?.length}
    <div class="text-sm text-slate-500">Sin datos para mostrar.</div>
  {:else}
    <div class="h-[280px] grid grid-rows-[1fr_auto]">
      <div class="flex items-end gap-2 border-b pb-3">
        {#each data as p}
          <div class="flex-1 relative">
            {#if p.normal > 0}
              <div class="w-full bg-blue-300 rounded-t"
                   style={`height:${p.normal * 2}px`}></div>
            {/if}
            {#if p.peak > 0}
              <div class="w-full bg-blue-600 rounded-t absolute bottom-0"
                   style={`height:${p.peak * 2}px`}></div>
            {/if}
          </div>
        {/each}
      </div>
      <div class="flex justify-between text-[10px] text-slate-500 mt-2">
        {#each data as p, i}
          {#if i % 2 === 0}<span>{p.hour}</span>{:else}<span class="opacity-0">.</span>{/if}
        {/each}
      </div>
    </div>

    <div class="flex items-center gap-6 mt-4">
      <div class="flex items-center gap-2 text-sm text-slate-600">
        <span class="w-3 h-3 rounded-sm bg-blue-300"></span> Horas normales
      </div>
      <div class="flex items-center gap-2 text-sm text-slate-600">
        <span class="w-3 h-3 rounded-sm bg-blue-600"></span> Hora pico
      </div>
    </div>
  {/if}
</div>
