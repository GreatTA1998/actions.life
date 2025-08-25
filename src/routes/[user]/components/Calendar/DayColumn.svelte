<script>
  import TaskElement from '$lib/components/TaskElement.svelte'
  import PhotoTaskElement from '$lib/components/PhotoTaskElement.svelte'
  import IconTaskElement from '$lib/components/IconTaskElement.svelte'
  import CreateTaskDirectly from '$lib/components/CreateTaskDirectly.svelte'
  import TimeIndicator from "./TimeIndicator.svelte"
  import { DateTime } from 'luxon'
  import { user, timestamps, totalMinutes, calLastHHMM, calSnapInterval } from '$lib/store'
  import { pixelsPerHour } from './store.js'
  import { treesByDate } from './service.js'
  import { getContext, onMount, onDestroy } from 'svelte'

  const { Task, activeDragItem, grabOffset, draggedItem } = getContext('app')

  let { dt } = $props()

  let dayColumn
  let isDirectlyCreatingTask = $state(false)
  let yPosition = $state(null)
  let formFieldTopPadding = 40
  let pixelsPerMinute = $pixelsPerHour / 60

  let scheduledTasks = $derived($treesByDate[dt.toFormat('yyyy-MM-dd')]?.hasStartTime ?? [])
  let newDT = $derived(getNewDT(yPosition))

  let intersecting = $state(false)
  let previewTop = $state(null)

  $effect(() => {
    console.log('draggedItem =', $draggedItem) // triggers reactivity, don't know any other way for now in Svelte 5
    requestAnimationFrame(checkIntersection)
  })
  
  onMount(async () => {})

  onDestroy(() => {})

  function checkIntersection () {
    const colRect = dayColumn.getBoundingClientRect()
    const { x1, y1, x2, y2 } = $draggedItem
    const dragWidth = x2 - x1
    const horizOverlap = Math.max(0, Math.min(x2, colRect.right) - Math.max(x1, colRect.left))
    const vertOverlap = Math.max(0, Math.min(y2, colRect.bottom) - Math.max(y1, colRect.top))

    const THRESHOLD = 0.3
    intersecting = (horizOverlap / dragWidth) >= THRESHOLD && vertOverlap > 0

    const localTop = y1 + dayColumn.scrollTop - colRect.top
    let resultDT = snapToNearestInterval(
      dt.plus({ hours: localTop / $pixelsPerHour }),
      $calSnapInterval
    )
    previewTop = getOffset({ dt1: dt, dt2: resultDT }) // for some reason, getOffset works well but localTop introduces a 1~2px inaccuracy
  }

  function onclick (e) {
    if (e.target === e.currentTarget) { // equivalent to `click|self`. e.target := 1st node that detected the click, e.currentTarget := node that detected the event
      isDirectlyCreatingTask = true
      yPosition = getY(e)
    }
  }

  function getY (e) {
    return (
      e.clientY +
      dayColumn.scrollTop -
      dayColumn.getBoundingClientRect().top -
      dayColumn.style.paddingTop
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

  function ondragover (e) {
    e.preventDefault()
    // e.stopPropagation()
    e.dataTransfer.dropEffect = "move"
  }

  function ondrop (e) {
    const id = e.dataTransfer.getData("text/plain")
    if (!id) return // it means we're adjusting the duration but it triggers a drop event, and a dragend event must be followed by a drop event

    e.preventDefault()
    // e.stopPropagation()

    let resultDT = snapToNearestInterval(
      dt.plus({ hours: (getY(e) - $grabOffset) / $pixelsPerHour }),
      $calSnapInterval
    )

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

  function getNewDT (trueY) {
    const calendarStartAsMs = dt.toMillis()

    const totalHoursDistance = trueY / $pixelsPerHour;
    const totalMsDistance = totalHoursDistance * 60 * 60 * 1000

    // Add them together: https://stackoverflow.com/a/12795802/7812829
    const resultantTimeInMs = calendarStartAsMs + totalMsDistance

    return DateTime.fromMillis(resultantTimeInMs)
  }
</script>

<!-- https://github.com/sveltejs/svelte/issues/6016 -->
<div bind:this={dayColumn} class="day-column unselectable"
  style="height: {$totalMinutes * pixelsPerMinute}px;"
  class:grid-y={$user.hasGridlines}
  {ondrop}
  {ondragover}
  {onclick}
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

  {#if intersecting && previewTop !== null}
    <div class="task-absolute drop-preview" style="top: {previewTop}px; height: {$draggedItem.height}px;"></div>
  {/if}

  {#if isDirectlyCreatingTask}
    <div id="calendar-direct-task-div" style="top: {yPosition - formFieldTopPadding}px;">
      <CreateTaskDirectly
        newTaskStartTime={newDT.toFormat('HH:mm')}
        startDateISO={newDT.toFormat('yyyy-MM-dd')}
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

  .drop-preview {
    background: rgba(100, 100, 255, 0.15);
    border: 1px dashed rgba(100, 100, 255, 0.6);
    border-radius: var(--left-padding);
    pointer-events: none;
  }

  .my-helper-gridline {
    position: absolute;
    width: 100%;
    height: 1px;
    background-color: var(--grid-color);
  }

  /* DO NOT REMOVE, BREAKS DRAG-AND-DROP AND DURATION ADJUSTMENT */
  .day-column {
    position: relative;
    overflow-x: hidden;
    width: var(--width-calendar-day-section);
    background-color: var(--calendar-bg-color);
  }

  .grid-y {
    border-right: 1px solid var(--grid-color);
  }
</style>
