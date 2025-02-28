<div style="margin-bottom: 20px;">
  <div style="font-size: 20px; margin-bottom: 6px; color: rgb(10, 10, 10); font-weight: 600;">  
    {DateTime.fromISO(simpleDateISO).toFormat('LLLL d (ccc)')}
  </div>

  <div style="display: flex; flex-wrap: wrap;">
    {#each tasksThisDay.noStartTime.hasIcon as iconTask}
      <FunctionalDoodleIcon
        {iconTask}
        on:task-click
        on:task-update
      />
    {/each}
  </div>

  {#each tasksThisDay.noStartTime.noIcon as flexibleDayTask}
    <button on:click={() => dispatch('task-click', { task: flexibleDayTask })} 
      style="
        width: var(--width-calendar-day-section); 
        font-size: 12px; 
        display: flex; 
        flex-direction: column;
        gap: 4px; margin-left: 4px; margin-right: 4px; margin-bottom: 4px;
      "
    >
      <ReusableFlexibleDayTask task={flexibleDayTask}
        fontSizeInPx={16}
        on:task-click
        on:task-update
        on:task-checkbox-change
      />
    </button>
  {/each}

  {#each tasksThisDay.hasStartTime as task, i}
    {#if i === timeIndicatorPosition}
      <div bind:this={CurrentDayIndicator} class="current-time-indicator-thin"></div>
    {/if}

    <div
      on:click={() => dispatch('task-click', { task })} on:keydown
      style="display: flex; align-items: center; flex-wrap: nowrap; padding: 2px;"
    >
      <div 
        style="font-size: 16px; white-space: nowrap; text-overflow: ellipsis;"
        class:grey-text={task.daysBeforeRepeating}
        class:purple-text={!task.daysBeforeRepeating}
      > 
        <span class="scheduled-event">
          {' ' + task.name + ' '}
          <!-- 
            Cannot use an inner class because the outer class "scheduled-event" will override
            I can't believe it's this hard...
          -->
          <div style="color: rgb(0, 0, 0); font-weight: 400; margin-right: 4px;">
            {getAmPmTime(task.startTime)}
          </div> 
        </span>
      </div>
    </div>
  {/each}

  {#if tasksThisDay.hasStartTime.length === findTimeIndicatorPosition()}
    <div bind:this={CurrentDayIndicator} class="current-time-indicator-thin"></div>
  {/if}
</div>

<script>
  import { DateTime } from 'luxon'
  import ReusableFlexibleDayTask from '$lib/ReusableFlexibleDayTask.svelte'
  import FunctionalDoodleIcon from '$lib/FunctionalDoodleIcon.svelte'
  import { createEventDispatcher } from 'svelte'

  export let tasksThisDay
  export let simpleDateISO

  let CurrentDayIndicator
  const dispatch = createEventDispatcher()

  $: timeIndicatorPosition = findTimeIndicatorPosition()
  
  // auto-scroll exposes the white iOS spacing. Also now we display events from today onwards anyway, so no need to re-orient
  // $: if (CurrentDayIndicator) {
  //   CurrentDayIndicator.scrollIntoView({ behavior: 'instant', block: 'start' })
  // }

  function isToday () {
    return DateTime.fromISO(simpleDateISO).toFormat('yyyy-MM-dd') === DateTime.now().toFormat('yyyy-MM-dd')
  }

  function getAmPmTime (hhmm) {
    const [hh, mm] = hhmm.split(':')
    const dt = DateTime.fromObject({ hour: Number(hh), minutes: Number(mm) })
    return dt.toFormat('h:mm a')
  }

  // assumes events are sorted by `startTime
  function findTimeIndicatorPosition () {
    if (!isToday()) { return -1 }

    let idx = tasksThisDay.hasStartTime.findIndex(
      event => event.startTime > DateTime.now().toFormat('HH:mm')
    )
    if (idx === -1) idx = tasksThisDay.hasStartTime.length
    return idx
  }
</script>

<style>
  .current-time-indicator-thin {
    border: 2px solid var(--location-indicator-color); 
    border-radius: 0px;
    width: 100%; 
    margin-top: 8px; 
    margin-bottom: 8px;
  }

  .scheduled-event {
    opacity: 0.7;
    font-size: 16px;
    gap: 6px;
    white-space: nowrap; text-overflow: ellipsis; 
    font-weight: 400; display: flex;
  }
</style>