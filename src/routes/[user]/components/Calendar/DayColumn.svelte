<script>
  import TaskElement from '$lib/components/TaskElement.svelte'
  import PhotoTaskElement from '$lib/components/PhotoTaskElement.svelte'
  import IconTaskElement from '$lib/components/IconTaskElement.svelte'
  import GcalEvent from '$lib/features/google-calendar/GCalEvent.svelte'
  import TimeIndicator from './TimeIndicator.svelte'
  import { DateTime } from 'luxon'
  import { pixelsPerHour, headerHeight, timestampsColumnWidth } from './store.js'
  import { treesByDate } from './service.js'
  import { user, timestamps, calSnapInterval, googleEventsByDate } from '$lib/store'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')
  const { activateInput, overrideOptions } = getContext('popover-input')
  const { 
    draggedItem, scrollCalRect, detectOverlap,
    bestDropzoneID, dropPreviewCSS, hasDropped, resetDragDrop
  } = getContext('drag-drop')
  
  let { dt } = $props()

  let dayColumn
  let yPosition = $state(null)
  let dropzoneID = $derived(dt.toFormat('yyyy-MM-dd'))
  let pixelsPerMinute = $pixelsPerHour / 60

  let scheduledTasks = $derived($treesByDate[dt.toFormat('yyyy-MM-dd')]?.hasStartTime ?? [])
  let googleEvents = $derived($googleEventsByDate[dt.toFormat('yyyy-MM-dd')] ?? [])

  let previewTop = $state(null)
  
  let anchorID = $derived(`--day-column-${dropzoneID}`)
  let newDT = $derived(getNewDT(yPosition))

  $effect(() => {
    if ($draggedItem && $draggedItem.id) {
      detectOverlap({
        dropzoneElem: dayColumn,
        clipRect: calContentArea(),
        dropzoneID
      })
    }
  })
  
  $effect(() => {
    if ($bestDropzoneID === dropzoneID) renderDragPreview()
    else previewTop = null
  })

  $effect(() => {
    if ($hasDropped && $bestDropzoneID === dropzoneID) {
      performDrop()
    }
  })

  function renderDragPreview () {
    const localTop = $draggedItem.y1 + dayColumn.scrollTop - dayColumn.getBoundingClientRect().top
    let resultDT = snapToNearestInterval(
      dt.plus({ hours: localTop / $pixelsPerHour }),
      $calSnapInterval
    )
    previewTop = getOffset({ dt1: dt, dt2: resultDT }) 
  }

  function calContentArea () {
    const { left, right, top, bottom } = $scrollCalRect()
    return {
      left: left + $timestampsColumnWidth, // potentially brittle for mobile mode
      right,
      top: top + $headerHeight,
      bottom
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

  function performDrop () {
    const { id, y1 } = $draggedItem

    const { top } = dayColumn.getBoundingClientRect()
    const localTop = y1 - top + dayColumn.scrollTop

    let resultDT = snapToNearestInterval(
      dt.plus({ hours: localTop / $pixelsPerHour }),
      $calSnapInterval
    )

    Task.update({ 
      id,
      keyValueChanges: {
        startTime: resultDT.toFormat('HH:mm'),
        startDateISO: resultDT.toFormat('yyyy-MM-dd')
      }
    })

    resetDragDrop()
    
    previewTop = null // quickfix
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

  function shiftYPosition ({ duration }) {
    const tasksGap = 30
    yPosition += ($pixelsPerHour / 60) * duration + tasksGap
    overrideOptions.update(options => ({
      ...options,
      startDateISO: newDT.toFormat('yyyy-MM-dd'),
      startTime: newDT.toFormat('HH:mm')
    }))
  }
</script>


<!-- https://github.com/sveltejs/svelte/issues/6016 -->
<div bind:this={dayColumn} class="day-column select-none"
  style="height: {24 * $pixelsPerHour}px;"
  class:grid-y={$user.hasGridlines}
  onclick={e => {
    if (e.target === e.currentTarget) {
      yPosition = getY(e)
      activateInput({
        anchorID,
        modifiers: { 
          startDateISO: newDT.toFormat('yyyy-MM-dd'),
          startTime: newDT.toFormat('HH:mm'),
          persistsOnList: false
        },
        onCreate: shiftYPosition
      })
    }
  }}
>
  {#if $draggedItem.id || $user.hasGridlines}
    {#each $timestamps as timestamp, i}
      {@const [hour, minute] = timestamp.split(':').map(Number)}
      <div class="gridline" 
        style="top: {getOffset({ dt1: dt, dt2: dt.set({ hour, minute }) })}px;"
      >
      </div>
    {/each}
  {/if}

  {#each scheduledTasks as task, i (task.id)}
    <div class="task-absolute" style="top: {getOffset({ dt1: dt, dt2: getDateTimeFromTask(task) })}px;">
      {#if task.imageDownloadURL}
        <PhotoTaskElement {task} />
      {:else if task.iconURL}
        <IconTaskElement {task} />
      {:else}
        <TaskElement {task} />
      {/if}
    </div>
  {/each}

  {#each googleEvents as event (event.id)}
    {@const startDT = DateTime.fromISO(event.start.dateTime)}
    <div class="task-absolute" style="
      top: {getOffset({ dt1: dt, dt2: startDT })}px; 
      pointer-events: none;"
    >
      <GcalEvent {event} />
    </div>
  {/each}

  {#if previewTop !== null}
    <div class="task-absolute" 
      style="
        top: {previewTop}px; 
        height: {$draggedItem.height}px;
        border-radius: var(--left-padding);
        {dropPreviewCSS}
      "
    ></div>
  {/if}
  
  <div style="display: grid; place-items: center; width: 100%">
    <div style="anchor-name: {anchorID}; top: {yPosition}px; height: {30 * pixelsPerMinute}px;" 
      class="my-portal"
    >

    </div>
  </div>

  {#if dt.hasSame(DateTime.now(), 'day')}
    <TimeIndicator originDT={dt} 
      {pixelsPerMinute}
    />
  {/if}
</div>

<style lang="scss">
  .my-portal {
    position: absolute;
    width: 100%; /* quickfix: iOS centering is unreliable with --width-within-column */
    padding: 0;
    pointer-events: none;
  }

  .task-absolute {
    position: absolute; 
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    width: var(--width-within-column);
  }

  .gridline {
    position: absolute;
    width: 100%;
    height: 1px;
    background-color: var(--grid-color);
    pointer-events: none; /** otherwise it'll block clicks on the day column (deadzone) */
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
