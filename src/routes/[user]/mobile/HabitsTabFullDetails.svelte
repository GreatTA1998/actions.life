<script>
  import ListenToDoc from '../components/Archive/ListenToDoc.svelte'
  import ListenToRoutineInstances from '../components/Archive/ListenToRoutineInstances.svelte'
  import JournalEntries from '../components/Archive/JournalEntries.svelte'
  import StarButton from '$lib/components/StarButton.svelte'
  import { formatHours } from '$lib/utils/core.js'
  import { getContext } from 'svelte'

  const { user } = getContext('app')

  let { selectedRoutineID, stats } = $props()

  async function toggleStar (routineID, value) {
    await Template.update({ id: routineID, updates: { isStarred: !value } })
  }
</script>


<ListenToRoutineInstances templateID={selectedRoutineID} userID={$user.uid}
  let:routineInstances={instances}
>
  <ListenToDoc docPath={'/users/' + $user.uid + '/templates/' + selectedRoutineID}
    let:theDoc={selectedRoutine}
  >
    {#if selectedRoutine}
      <div class="routine-header">
        <div class="routine-title-row">
          <h2>{selectedRoutine.name}</h2>
          <StarButton isStarred={selectedRoutine.isStarred}
            onToggle={() => toggleStar(selectedRoutineID, selectedRoutine.isStarred)}
          />
        </div>
        {#if stats.has(selectedRoutineID)}
          <div class="flexbox content-center gap-8">
            <span>{formatHours(stats.get(selectedRoutineID).minutesSpent)}</span>
            <span style="color: #666;">•</span>
            <span>completed {stats.get(selectedRoutineID).timesCompleted} times</span>
          </div>
        {/if}
      </div>
      
      <div class="journal-entries-wrapper">
        <JournalEntries routineInstances={instances}/>
      </div>
    {/if}
  </ListenToDoc>
</ListenToRoutineInstances>

<style>
  .routine-header {
    flex-shrink: 0;
    margin-bottom: 20px;
    padding: 0 16px;
  }

  .routine-header h2 {
    margin: 0;
    font-size: var(--font-size-xxl);
    font-weight: 600;
  }

  .routine-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .journal-entries-wrapper {
    flex: 1;
    min-height: 0;
  }
</style>