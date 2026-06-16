<script>
  import TaskPopupContext from '$lib/components/TaskPopupContext.svelte'
  import ListenToDoc from '$lib/components/ListenToDoc.svelte'
  import ListenToRoutineInstances from './ListenToRoutineInstances.svelte'
  import JournalEntries from './JournalEntries.svelte'
  import StarButton from '$lib/components/StarButton.svelte'
  import { formatHours } from '$lib/utils/core.js'
  import { getContext } from 'svelte'
  import { user } from '$lib/store'

  const { Template } = getContext('app')

  let { 
    selectedRoutineID, 
    stats,
    extraClass
  } = $props()

  async function toggleStar (routineID, value) {
    return Template.update({ id: routineID, kvChanges: { isStarred: !value } })
  }
</script>

<div class={extraClass}>
  <ListenToDoc docPath={'/users/' + $user.uid + '/templates/' + selectedRoutineID}>
    {#snippet children(selectedRoutine)}
      <div class="shrink-0 mb-5 px-4">
        <div class="flex items-center gap-2">
          <h2 class="text-[1.625rem] font-semibold tracking-[-0.02em] leading-tight">{selectedRoutine.name}</h2>
          <StarButton isStarred={selectedRoutine.isStarred}
            onToggle={() => toggleStar(selectedRoutineID, selectedRoutine.isStarred)}
          />
        </div>
        {#if stats.has(selectedRoutineID)}
          <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-neutral-500 tabular-nums">
            <span>{formatHours(stats.get(selectedRoutineID).minutesSpent)}</span>
            <span class="text-neutral-300 select-none" aria-hidden="true">·</span>
            <span>completed {stats.get(selectedRoutineID).timesCompleted} times</span>
          </div>
        {/if}
      </div>
      
      <TaskPopupContext>
        <ListenToRoutineInstances templateID={selectedRoutineID}>  
          {#snippet children (routineInstances)}
            <JournalEntries {routineInstances}/>
          {/snippet}
        </ListenToRoutineInstances>
      </TaskPopupContext>
    {/snippet}
  </ListenToDoc>
</div>
