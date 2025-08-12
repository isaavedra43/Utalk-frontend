<script lang="ts">
  import type { Kpi } from '../types';
  import { dv2 } from '../theme';
  export let kpi: Kpi;
</script>

<div class="relative {dv2.card} overflow-hidden p-6 min-h-[140px]">
  <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent"
       class:from-emerald-400={kpi.tone==='green'}
       class:from-fuchsia-400={kpi.tone==='purple'}
       class:from-sky-400={kpi.tone==='blue'}
       class:from-indigo-400={kpi.tone==='indigo'}
       class:from-rose-400={kpi.tone==='red'}></div>
  <div class="flex items-start justify-between">
    <div class="text-sm text-slate-600">{kpi.label}</div>
    {#if kpi.deltaPct != null}
      <div class="text-xs rounded-full px-2 py-1"
           class:bg-emerald-50={kpi.trend==='up'}
           class:bg-rose-50={kpi.trend==='down'}
           class:bg-slate-100={kpi.trend==='flat'}
           class:text-emerald-700={kpi.trend==='up'}
           class:text-rose-700={kpi.trend==='down'}
           class:text-slate-700={kpi.trend==='flat'}>
        {kpi.deltaPct >= 0 ? `+${kpi.deltaPct.toFixed(1)}%` : `${kpi.deltaPct.toFixed(1)}%`}
      </div>
    {/if}
  </div>
  <div class="mt-2 text-3xl font-bold tracking-tight">{kpi.value}</div>
  {#if kpi.helper}<div class="{dv2.muted} mt-2">{kpi.helper}</div>{/if}
</div>
