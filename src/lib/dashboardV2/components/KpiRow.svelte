<script lang="ts">
  import type { Kpi } from '../types';
  import KpiCard from './KpiCard.svelte';
  export let items: Kpi[] = [];
</script>

<section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {#each items as k (k.id)}
    <KpiCard kpi={k}/>
  {/each}
</section>
