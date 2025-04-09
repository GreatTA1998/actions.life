<script>
  import TaskElement from '$lib/components/TaskElement.svelte'
  import PhotoTaskElement from '$lib/components/PhotoTaskElement.svelte'
  import IconTaskElement from '$lib/components/IconTaskElement.svelte'
  import CreateTaskDirectly from '$lib/components/CreateTaskDirectly.svelte'
  import TimeIndicator from "./TimeIndicator.svelte"

  import { DateTime } from "luxon"
  import { getHHMM } from '/src/lib/utils/core.js'

  import {
    user,
    grabOffset, activeDragItem,
    timestamps, getMinutesDiff, calEarliestHHMM, totalMinutes, calLastHHMM, calSnapInterval
  } from '/src/lib/store'
  import { pixelsPerHour } from './store.js'
  import Task from '/src/lib/db/models/Task.js'

  import { onMount, onDestroy } from "svelte"

  export let dt
  export let scheduledTasks = []

  let OverallContainer
  let isDirectlyCreatingTask = false
  let formFieldTopPadding = 40
  let yPosition
  let pixelsPerMinute = $pixelsPerHour / 60

  // TO-DO: deprecate with luxon, but requires re-working <CreateTaskDirectly> perhaps with portals
  $: resultantDateClassObject = getResultantDateClassObject(yPosition)

  onMount(async () => {})

  onDestroy(() => {})

  function getY (e) {
    return (
      e.clientY +
      OverallContainer.scrollTop -
      OverallContainer.getBoundingClientRect().top -
      OverallContainer.style.paddingTop
    )
  }

  function getDateTimeFromTask(task) {
    return DateTime.fromISO(`${task.startDateISO}T${task.startTime}`)
  }

  function getOffset({ dt1, dt2 }) {
    let minutesDiff = dt2.diff(dt1, 'minutes').minutes
    if (minutesDiff < 0) minutesDiff += 24 * 60
    return ($pixelsPerHour/60) * minutesDiff 
  }

  function dragover_handler(e) {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "move"
  }

  function drop_handler (e) {
    const id = e.dataTransfer.getData("text/plain")
    if (!id) return // it means we're adjusting the duration but it triggers a drop event, and a dragend event must be followed by a drop event

    e.preventDefault()
    e.stopPropagation()

    const dropY = getY(e)
    let resultDT = dt.plus({ 
      hours: (dropY - $grabOffset) / $pixelsPerHour
    })
    
    resultDT = snapToNearestInterval(resultDT, $calSnapInterval)

    Task.update({ 
      id,
      keyValueChanges: {
        startTime: resultDT.toFormat('HH:mm'),
        startDateISO: resultDT.toFormat('yyyy-MM-dd')
      }
    })

    grabOffset.set(0)
    activeDragItem.set(null)
  }

  // Function to snap a DateTime to the nearest interval (in minutes)
  function snapToNearestInterval (dateTime, interval) {
    if (interval <= 0) return dateTime; // No snapping if interval is invalid
    
    const minutes = dateTime.minute;
    const remainder = minutes % interval;
    
    if (remainder < interval / 2) {
      // Round down
      return dateTime.set({ minute: minutes - remainder, second: 0, millisecond: 0 });
    } else {
      // Round up
      return dateTime.set({ minute: minutes + (interval - remainder), second: 0, millisecond: 0 });
    }
  }

  // TO-DO: deprecate with luxon
  function getResultantDateClassObject (trueY) {
    const calendarStartAsMs = dt.toMillis()

    const totalHoursDistance = trueY / $pixelsPerHour;
    const totalMsDistance = totalHoursDistance * 60 * 60 * 1000

    // Add them together: https://stackoverflow.com/a/12795802/7812829
    const resultantTimeInMs = calendarStartAsMs + totalMsDistance
    const resultantDateClassObject = new Date(resultantTimeInMs)
    return resultantDateClassObject
  }
</script>

<!-- https://github.com/sveltejs/svelte/issues/6016 -->
<div bind:this={OverallContainer} class="overall-container unselectable"
  style="height: {$totalMinutes * pixelsPerMinute}px;"
  class:grid-y={$user.hasGridlines}
  on:drop={e => drop_handler(e)}
  on:dragover={e => dragover_handler(e)}
  on:click|self={e => {
    isDirectlyCreatingTask = true
    yPosition = getY(e)
  }} on:keydown
>
  {#if $activeDragItem || $user.hasGridlines}
    {#each $timestamps as timestamp, i}
      {#if i === $timestamps.length - 1 && timestamp === $calLastHHMM}
        <!-- Skip rendering the last gridline as it causes a 1px overflow from the container's bottom edge -->
      {:else}
        {@const [hour, minute] = timestamp.split(':').map(Number)}
        <div class="my-helper-gridline" 
          style="top: {getOffset({ dt1: dt, dt2: dt.set({ hour, minute }) })}px;"
        >
        </div>
      {/if}
    {/each}
  {/if}

  {#each scheduledTasks as task, i (task.id)}
    <div class="task-absolute" style="top: {getOffset({ dt1: dt, dt2: getDateTimeFromTask(task) })}px;">
      {#if task.iconURL}
        <IconTaskElement {task}
          fontSize={0.8}
        />
      {:else if task.imageDownloadURL}
        <PhotoTaskElement {task}
          fontSize={0.8}
        />
      {:else}
        <TaskElement {task}
          fontSize={0.8}
          hasCheckbox
        />
      {/if}
    </div>
  {/each}

  {#if isDirectlyCreatingTask}
    <div id="calendar-direct-task-div" style="top: {yPosition - formFieldTopPadding}px;">
      <CreateTaskDirectly
        newTaskStartTime={getHHMM(resultantDateClassObject)}
        {resultantDateClassObject}
        on:reset={() => isDirectlyCreatingTask = false}
      />
    </div>
  {/if}

  {#if dt.hasSame(DateTime.now(), 'day')}
    <TimeIndicator originDT={dt} 
      {pixelsPerMinute}
    />
  {/if}
</div>

<style lang="scss">
  #calendar-direct-task-div {
    position: absolute;
    width: 98%; 
    padding-left: 0px; 
    padding-right: 0px;
  }

  .task-absolute {
    position: absolute; 
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    width: 94%;
  }

  .my-helper-gridline {
    position: absolute;
    width: 100%;
    height: 1px;
    background-color: var(--grid-color);
  }

  /* DO NOT REMOVE, BREAKS DRAG-AND-DROP AND DURATION ADJUSTMENT */
  .overall-container {
    position: relative;
    overflow-x: hidden;
    width: var(--width-calendar-day-section);
    background-color: var(--calendar-bg-color);
  }

  .grid-y {
    border-right: 1px solid var(--grid-color);
  }
</style>
