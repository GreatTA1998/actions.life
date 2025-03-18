{#if $uniqueEvents}
  <div class="schedule-container">
    <ToggleSwitch
      label="Display scheduled routines too"
      bind:checked={$user.includeRoutinesInEvents}
      onChange={e => {
        updateFirestoreDoc(`users/${$user.uid}`, { includeRoutinesInEvents: e.target.checked });
      }}
    />

    <div class="events-list">
      {#each Object.keys($uniqueEvents) as simpleDateISO}
        {#if $uniqueEvents[simpleDateISO]}
          <ScheduleViewDay 
            tasksThisDay={$uniqueEvents[simpleDateISO]} 
            {simpleDateISO}
            on:task-click
          />
        {/if}
      {/each}
    </div>
  </div>
{/if}

<script>
  import { uniqueEvents, user } from '/src/store'
  import ScheduleViewDay from './ScheduleViewDay.svelte'
  import { updateFirestoreDoc } from '/src/helpers/firebase.js'
  import ToggleSwitch from '$lib/Reusable/ToggleSwitch.svelte'

  // setupFutureOverviewTasks($user.uid, !$user.includeRoutinesInEvents)
</script>

<style>
  .schedule-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f5f5f5;
  }

  .events-list {
    padding: 24px;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    flex: 1;
  }
</style>