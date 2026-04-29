<script>
  import { parseWeekly } from '$lib/utils/rrule.js'

  let { rrStr = '' } = $props()

  const days = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
  
  let selectedDays = $derived(parseWeekly(rrStr))
</script>

<div class="flex">
  {#each days as day}
    <div class={[
      'rounded-full w-1.5 h-1.5 m-0.5', 
      selectedDays.includes(day) ? 'bg-[var(--rhythm-highlight-color)]' : 'bg-gray-200' 
    ]}></div>
  {/each}
</div>