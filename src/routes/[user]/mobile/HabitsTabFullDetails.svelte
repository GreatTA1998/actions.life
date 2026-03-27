<script>
  import ListenToDoc from '../components/Archive/ListenToDoc.svelte'
  import ListenToRoutineInstances from '../components/Archive/ListenToRoutineInstances.svelte'
  import JournalEntries from '../components/Archive/JournalEntries.svelte'
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
    await Template.update({ id: routineID, updates: { isStarred: !value } })
  }
</script>

<div class={extraClass}>
  <ListenToRoutineInstances templateID={selectedRoutineID} userID={$user.uid}
    let:routineInstances={instances}
  >
    <ListenToDoc docPath={'/users/' + $user.uid + '/templates/' + selectedRoutineID}
      let:theDoc={selectedRoutine}
    >
      {#if selectedRoutine}
        <div class="shrink-0 mb-5 px-4">
          <div class="flex items-center gap-2 mb-2">
            <h2>{selectedRoutine.name}</h2>
            <StarButton isStarred={selectedRoutine.isStarred}
              onToggle={() => toggleStar(selectedRoutineID, selectedRoutine.isStarred)}
            />
          </div>
          {#if stats.has(selectedRoutineID)}
            <div class="flex items-center gap-2">
              <span>{formatHours(stats.get(selectedRoutineID).minutesSpent)}</span>
              <span style="color: #666;">•</span>
              <span>completed {stats.get(selectedRoutineID).timesCompleted} times</span>
            </div>
          {/if}
        </div>
        
        <JournalEntries routineInstances={instances}/>
        
      {/if}
    </ListenToDoc>
  </ListenToRoutineInstances>
</div>

<style>
  h2 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 600;
  }
</style>