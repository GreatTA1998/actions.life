<script>
  import TaskElement from '$lib/components/TaskElement.svelte'
  import PhotoTaskElement from '$lib/components/PhotoTaskElement.svelte'
  import IconTaskElement from '$lib/components/IconTaskElement.svelte'
  import GcalEvent from '$lib/features/google-calendar/GCalEvent.svelte'
  import TimeIndicator from './TimeIndicator.svelte'
  import { DateTime } from 'luxon'
  import { pixelsPerHour, headerHeight, timestampsColumnWidth } from './store.js'
  import { treesByDate } from './service.js'
  import { timestamps, calSnapInterval, googleEventsByDate } from '$lib/store'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')
  const { activateInput, overrideOptions } = getContext('popover-input')
  const { 
    registerDropzone,
    draggedItem, scrollCalRect, bestDropzoneID, dropPreviewCSS
  } = getContext('drag-drop')
  
  let { dt } = $props()

  let dayColumn
  let yPos = $state(0)
  let dropzoneID = $derived(dt.toFormat('yyyy-MM-dd'))
  let pixelsPerMinute = $pixelsPerHour / 60

  let scheduledTasks = $derived($treesByDate[dt.toFormat('yyyy-MM-dd')]?.hasStartTime ?? [])
  let googleEvents = $derived($googleEventsByDate[dt.toFormat('yyyy-MM-dd')]?.hasStartTime ?? [])

  let previewTop = $state(null)
  
  let anchorID = $derived(`--day-column-${dropzoneID}`)
  let newDT = $derived(getNewDT(yPos))
  
  $effect(() => {
    if ($bestDropzoneID === dropzoneID) renderDragPreview()
    else previewTop = null
  })

  function renderDragPreview () {
    const localTop = $draggedItem.y1 + dayColumn.scrollTop - dayColumn.getBoundingClientRect().top
    let resultDT = snapToNearestInterval(
      dt.plus({ hours: localTop / $pixelsPerHour }),
      $calSnapInterval
    )
    previewTop = getOffset({ dt1: dt, dt2: resultDT }) 
  }

  function getDateTimeFromTask(task) {
    return DateTime.fromISO(`${task.startDateISO}T${task.startTime}`)
  }

  function getOffset({ dt1, dt2 }) {
    let minutesDiff = dt2.diff(dt1, 'minutes').minutes
    if (minutesDiff < 0) minutesDiff += 24 * 60
    return ($pixelsPerHour/60) * minutesDiff 
  }

  function snapToNearestInterval (dateTime, interval) {
    if (interval <= 0) return dateTime
    
    const minutes = dateTime.minute
    const remainder = minutes % interval
    
    if (remainder < interval / 2) {
      return dateTime.set({ minute: minutes - remainder, second: 0, millisecond: 0 })
    } else {
      return dateTime.set({ minute: minutes + (interval - remainder), second: 0, millisecond: 0 })
    }
  }

  function getNewDT (trueY) {
    const totalMsDistance = (trueY / $pixelsPerHour) * 60 * 60 * 1000
    return DateTime.fromMillis(dt.toMillis() + totalMsDistance)
  }

  function shiftYPosition ({ duration }) {
    const tasksGap = 30
    yPos += ($pixelsPerHour / 60) * duration + tasksGap
    overrideOptions.update(options => ({
      ...options,
      startDateISO: newDT.toFormat('yyyy-MM-dd'),
      startTime: newDT.toFormat('HH:mm')
    }))
  }

  function getY (e) {
    return (
      e.clientY +
      dayColumn.scrollTop -
      dayColumn.getBoundingClientRect().top -
      dayColumn.style.paddingTop
    )
  }
</script>

<div bind:this={dayColumn} class="relative select-none w-[var(--width-cal-column)] bg-[var(--cal-bg)]"
  {@attach registerDropzone({ 
    id: dropzoneID,
    clipRectFunction () {
      const { left, right, top, bottom } = $scrollCalRect()
      return {
        left: left + $timestampsColumnWidth, // potentially brittle for mobile mode
        right,
        top: top + $headerHeight,
        bottom
      }
    },
    onDrop () {
      const { id, y1 } = $draggedItem
      const { top } = dayColumn.getBoundingClientRect()
      const localTop = y1 - top + dayColumn.scrollTop

      let resultDT = snapToNearestInterval(
        dt.plus({ hours: localTop / $pixelsPerHour }),
        $calSnapInterval
      )
      Task.update({ 
        id,
        kvChanges: {
          startTime: resultDT.toFormat('HH:mm'),
          startDateISO: resultDT.toFormat('yyyy-MM-dd')
        }
      })
      previewTop = null // as supposed to 0 which is a valid position to preview an element
    }
  })}
  style:height="{24 * $pixelsPerHour}px"
  style:border-right="1px solid var(--grid-color)"
  onclick={e => {
    if (e.target === e.currentTarget) {
      yPos = getY(e)
      activateInput({
        anchorID,
        modifiers: { 
          startDateISO: newDT.toFormat('yyyy-MM-dd'),
          startTime: newDT.toFormat('HH:mm'),
          onList: false
        },
        onCreate: shiftYPosition
      })
    }
  }}
>
  {#each $timestamps as timestamp}
    {@const [hour, minute] = timestamp.split(':').map(Number)}

    <div class="bg-[var(--grid-color)] absolute w-full h-[1px] pointer-events-none" 
      style:top="{getOffset({ dt1: dt, dt2: dt.set({ hour, minute }) })}px"
    >
    </div>
  {/each}

  {#each scheduledTasks as task, i (task.id)}
    <div class="absolute inset-x-0 mx-auto w-[var(--width-within-column)]" 
      style:top="{getOffset({ dt1: dt, dt2: getDateTimeFromTask(task) })}px"
    >
      {#if task.imageDownloadURL}
        <PhotoTaskElement {task} />
      {:else if task.iconURL}
        <IconTaskElement {task} />
      {:else}
        <TaskElement {task} />
      {/if}
    </div>
  {/each}

  {#each googleEvents as event}
    {@const startDT = DateTime.fromISO(event.start.dateTime)}
    <div class="absolute inset-x-0 mx-auto w-[var(--width-within-column)] pointer-events-none" 
      style:top="{getOffset({ dt1: dt, dt2: startDT })}px" 
    >
      <GcalEvent {event} />
    </div>
  {/each}

  {#if previewTop !== null}
    <div class="absolute inset-x-0 mx-auto w-[var(--width-within-column)]" 
      style="
        top: {previewTop}px; 
        height: {$draggedItem.height}px;
        border-radius: var(--left-padding);
        {dropPreviewCSS}
      "
    ></div>
  {/if}

  <div class="absolute w-full pointer-events-none"
    style:anchor-name={anchorID}
    style:top="{yPos}px"
    style:height="{30 * pixelsPerMinute}px" 
  >
  </div>

  {#if dt.hasSame(DateTime.now(), 'day')}
    <TimeIndicator originDT={dt} 
      {pixelsPerMinute}
    />
  {/if}
</div>