<script>
  // PRE-CONDITION: used within <TemplateContext/>
  import RoutineItem from './RoutineItem.svelte'
  import HabitsTabFullDetails from './HabitsTabFullDetails.svelte'
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import MslMoreHoriz from 'virtual:icons/material-symbols-light/more-horiz'
  import { templates } from '../components/Templates/store.js'
  import { WIDTHS } from '$lib/utils/constants.js'
  import { periodicity } from '$lib/utils/rrule.js'
  import { getContext, onMount } from 'svelte'

  const { Template, openTaskPopup } = getContext('app')

  let selectedRoutineID = $state('')
  let stats = $state(new Map())
  
  const rank = { weekly: 0, monthly: 1, yearly: 2 }
  let unstarredRoutines = $derived($templates.filter(r => !r.isStarred).sort((a, b) => rank[periodicity(a.rrStr)] - rank[periodicity(b.rrStr)]))
  let starredRoutines = $derived($templates.filter(r => r.isStarred))
  let topRoutines = $derived([...starredRoutines].sort((a, b) => {
    return (stats.get(b.id)?.minutesSpent ?? 0) - (stats.get(a.id)?.minutesSpent ?? 0)
  }))

  $effect(async () => {
    for (const routine of starredRoutines) {
      fetchStatsIfNeeded(routine) // don't expose variables to $effect to avoid infinit rerenders
    }
  })

  onMount(async () => {
    listenToRoutines()
  })

  async function fetchStatsIfNeeded (routine) {
    if (!stats.has(routine.id)) {
      const result = await Template.getTotalStats({ id: routine.id })
      stats.set(routine.id, result)
      stats = new Map(stats) // force reactivity update
    }
  }

  function select (routineID) {
    if (selectedRoutineID === routineID) openTaskPopup(routineID)
    else selectedRoutineID = routineID
  }
</script>

<div class="flex w-full justify-center flex-wrap">
  <div style:width={WIDTHS.PANEL_MAX + 'px'} class="bg-white">
    {#if topRoutines}
      <div class="flex flex-col py-0 px-2">
        {#each topRoutines as routine (routine.id)}
          <RoutineItem onclick={() => select(routine.id)}
            {routine} {selectedRoutineID} {stats}
          />
        {/each}
      </div>
      
      {#if unstarredRoutines.length > 0}
        <PopoverMenu>
          {#snippet activator({ id, anchorName })}
            <button popovertarget={id} style:anchor-name={anchorName}>
              <MslMoreHoriz style="font-size: 1.75rem" />
            </button>
          {/snippet}
        
          {#snippet content({ close })}
            <!-- pragmatic sizing quickfix for mobile and desktop -->
            <div class="w-screen max-h-[60vh] overflow-y-auto p-2 flex flex-wrap gap-4">
              {#each unstarredRoutines as routine (routine.id)}
                <RoutineItem onclick={() => { select(routine.id); close(); }}
                  {routine} {selectedRoutineID}
                />
              {/each}
            </div>
          {/snippet}
        </PopoverMenu>
      {/if}
    {/if}
  </div>

  {#if selectedRoutineID}
    <HabitsTabFullDetails {selectedRoutineID} {stats}
      extraClass="w-screen max-w-[60ch] py-2"
    />
  {/if}
</div>