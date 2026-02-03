<script>
  import WeekRhythm from '/src/routes/[user]/components/Templates/WeekRhythm.svelte'
  import MonthRhythm from '/src/routes/[user]/components/Templates/MonthRhythm.svelte'
  import YearRhythm from '/src/routes/[user]/components/Templates/YearRhythm.svelte'
  import { formatHours } from '$lib/utils/core.js'
  import { periodicity } from '$lib/utils/rrule.js'

  let { 
    routine, 
    selectedRoutineID,
    onclick, 
    stats = new Map()
  } = $props()

  let maxMinutesSpent = $derived(Math.max(1, ...Array.from(stats.values()).map(s => s.minutesSpent)))

  function getBarWidth (minutes) {
    return (minutes / maxMinutesSpent) * 100 + '%'
  }
</script>

<button {onclick} class:selected={selectedRoutineID === routine.id}
  class="flex flex-col items-start gap-x-4 py-2 px-2 min-h-[48px] rounded-lg"
>
  <div class="flex items-center gap-x-1">
    {#if routine.iconURL}
      <img src={routine.iconURL} class="w-[36px] h-[36px] object-contain" />
    {/if}

    <span>{routine.name}</span>
  </div>

  <div class="flex items-center gap-x-4 grow" style:align-self="stretch">
    {@render rhythmVisualizer(routine)}
    
    {#if stats.has(routine.id)}
      <div class="flex items-center grow gap-x-2">
        <div class="flex grow">
          <div class="stat-bar" 
            style:flex-basis={getBarWidth(stats.get(routine.id).minutesSpent)}
          >
          </div>
        </div>
        <span style="font-weight: 300; font-size: 0.875rem; color: rgb(60, 60, 60);">
          {formatHours(stats.get(routine.id).minutesSpent, 0)}
        </span>
      </div>
    {/if}
  </div>
</button>

{#snippet rhythmVisualizer ({ rrStr })}
  {#if periodicity(rrStr) === 'weekly'}
    <WeekRhythm {rrStr} />
  {:else if periodicity(rrStr) === 'monthly'}
    <MonthRhythm {rrStr} />
  {:else if periodicity(rrStr) === 'yearly'}
    <YearRhythm {rrStr} />
  {/if}
{/snippet}

<style>
  .selected {
    background: rgba(0, 89, 125, 0.1);
  }

  .stat-bar {
    height: 6px;
    background: #4caf50;
    border-radius: 4px;
  }
</style>