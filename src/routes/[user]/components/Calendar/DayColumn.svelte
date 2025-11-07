<script>
  import { isOverlapping, getOverlapArea, clip, dropPreviewCSS } from '$lib/utils/dragDrop.js'
  import TaskElement from '$lib/components/TaskElement.svelte'
  import PhotoTaskElement from '$lib/components/PhotoTaskElement.svelte'
  import IconTaskElement from '$lib/components/IconTaskElement.svelte'
  import TimeIndicator from './TimeIndicator.svelte'
  import { activateInput } from '$lib/store/popoverInput.js'
  import { DateTime } from 'luxon'
  import { pixelsPerHour, headerHeight, timestampsColumnWidth } from './store.js'
  import { treesByDate } from './service.js'
  import { user, timestamps, totalMinutes, calLastHHMM, calSnapInterval } from '$lib/store'
  import { getContext, onMount, onDestroy } from 'svelte'

  const { Task } = getContext('app')
  const { draggedItem, hasDropped, matchedDropzones, bestDropzoneID, scrollCalRect, resetDragDrop } = getContext('drag-drop')
  
  let { dt } = $props()

  let dayColumn
  let yPosition = $state(null)
  let dropzoneID = $derived(dt.toFormat('yyyy-MM-dd'))
  let pixelsPerMinute = $pixelsPerHour / 60

  let scheduledTasks = $derived($treesByDate[dt.toFormat('yyyy-MM-dd')]?.hasStartTime ?? [])
  let newDT = $derived(getNewDT(yPosition))

  let intersecting = $state(false)
  let previewTop = $state(null)
  
  let anchorID = $derived(`--day-column-${dropzoneID}`)

  $effect(() => {
    if ($draggedItem && $draggedItem.id) {
      requestAnimationFrame(checkIntersection)
    }
  })

  $effect(() => {
    if ($hasDropped && $bestDropzoneID === dropzoneID) {
      performDrop()
    }
  })
  
  onMount(async () => {})

  onDestroy(() => {})

  function realEffectiveArea () {
    const { left, right, top, bottom } = $scrollCalRect()
    return {
      left: left + $timestampsColumnWidth, // potentially brittle for mobile mode
      right,
      top: top + $headerHeight,
      bottom
    }
  }

  function checkIntersection () {
    const { x1, x2, y1, y2 } = clip($draggedItem, realEffectiveArea())

    const dayColumnRect = dayColumn.getBoundingClientRect()
    intersecting = isOverlapping(
      { x1, x2, y1, y2 }, 
      dayColumnRect,
      0.3,
      0
    )

    if (intersecting) {
      // update context-wide state
      const area = getOverlapArea({ x1, x2, y1, y2 }, dayColumnRect)
      matchedDropzones.update(obj => {
        obj[dropzoneID] = {
          area,
          left: dayColumnRect.left
        }
        return obj
      })
      
      if ($bestDropzoneID === dropzoneID) { // show preview
        const localTop = $draggedItem.y1 + dayColumn.scrollTop - dayColumnRect.top
        let resultDT = snapToNearestInterval(
          dt.plus({ hours: localTop / $pixelsPerHour }),
          $calSnapInterval
        )
        previewTop = getOffset({ dt1: dt, dt2: resultDT }) 
        // for some reason, getOffset works well but localTop introduces a 1~2px inaccuracy
        // this is because resultDT is AFTER snapping, whereas localTop is BEFORE snapping
      }

      else {
        previewTop = null
      }
    }

    else {
      matchedDropzones.update(obj => {
        delete obj[dropzoneID]
        return obj
      })

      // quickfix, manually remove preview (both places are necessary for clearing the previews)
      previewTop = null
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
    const gapBetweenTasks = 30
    yPosition += ($pixelsPerHour / 60) * duration + gapBetweenTasks
  }
</script>


<!-- https://github.com/sveltejs/svelte/issues/6016 -->
<div bind:this={dayColumn} class="day-column unselectable"
  style="height: {$totalMinutes * pixelsPerMinute}px;"
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
        <IconTaskElement {task} />
      {:else if task.imageDownloadURL}
        <PhotoTaskElement {task} />
      {:else}
        <TaskElement {task} />
      {/if}
    </div>
  {/each}

  {#if intersecting && previewTop !== null}
    <div class="task-absolute" 
      style="
        top: {previewTop}px; 
        height: {$draggedItem.height}px;
        border-radius: var(--left-padding);
        {dropPreviewCSS()}
      "
    ></div>
  {/if}

  <div style="anchor-name: {anchorID}; top: {yPosition}px;" 
    id="calendar-direct-task-div"
  >

  </div>

  {#if dt.hasSame(DateTime.now(), 'day')}
    <TimeIndicator originDT={dt} 
      {pixelsPerMinute}
    />
  {/if}
</div>

<style lang="scss">
  #calendar-direct-task-div {
    position: absolute;
    width: 100%; 
    padding: 0;
  }

  .task-absolute {
    position: absolute; 
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    width: var(--width-within-column);
  }

  .my-helper-gridline {
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
