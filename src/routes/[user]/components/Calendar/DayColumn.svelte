<script>
  import TaskElement from '$lib/components/TaskElement.svelte'
  import PhotoTaskElement from '$lib/components/PhotoTaskElement.svelte'
  import IconTaskElement from '$lib/components/IconTaskElement.svelte'
  import GcalEvent from '$lib/features/google-calendar/GCalEvent.svelte'
  import TimeIndicator from './TimeIndicator.svelte'
  import { getLocalY } from '$lib/utils/core.js'
  import { DateTime } from 'luxon'
  import { pixelsPerHour, headerHeight, timestampsColumnWidth } from './store.js'
  import { timestamps, calSnapInterval, googleEventsByDate } from '$lib/store'
  import { getContext } from 'svelte'

  const { Task, treesByDate } = getContext('app')
  const { activateInput, overrideOptions } = getContext('popover-input')
  const { 
    registerDropzone,
    draggedItem, scrollCalRect, bestDropzoneID, dropPreviewCSS
  } = getContext('drag-drop')
  
  let { dt } = $props()

  let dayColumn
  let dropzoneID = $derived(dt.toFormat('yyyy-MM-dd'))
  let pixelsPerMinute = $pixelsPerHour / 60

  let scheduledTasks = $derived($treesByDate[dt.toFormat('yyyy-MM-dd')]?.hasStartTime ?? [])
  let googleEvents = $derived($googleEventsByDate[dt.toFormat('yyyy-MM-dd')]?.hasStartTime ?? [])

  let anchorY = $state(0)
  let anchorID = $derived(`--day-column-${dropzoneID}`)

  function HHmmToLocalY (HHmm) {
    const [HH, mm] = HHmm.split(':').map(Number)
    return (60 * HH + mm) * pixelsPerMinute
  }

  function minutesToHHmm (totalMinutes) {
    const HH = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
    const mm = String(totalMinutes % 60).padStart(2, '0')
    return `${HH}:${mm}`
  }

  function minutesSinceMidnight (clientY, snapInterval) {
    const localY = getLocalY(dayColumn, clientY)
    return snap(localY / pixelsPerMinute, snapInterval)
  }

  function snap (number, interval) {
    const remainder = number % interval 
    if (remainder < interval / 2) return number - remainder
    else return number - remainder + interval
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
      Task.update({ 
        id: $draggedItem.id,
        kvChanges: {
          startTime: minutesToHHmm(minutesSinceMidnight($draggedItem.y1, $calSnapInterval)),
          startDateISO: dt.toFormat('yyyy-MM-dd')
        }
      })
    }
  })}
  style:height="{24 * $pixelsPerHour}px"
  style:border-right="1px solid var(--grid-color)"
  onclick={e => {
    if (e.target === e.currentTarget) {
      const snappedMinutes = minutesSinceMidnight(e.clientY, $calSnapInterval)
      anchorY = snappedMinutes * pixelsPerMinute

      activateInput({
        anchorID,
        modifiers: { 
          startDateISO: dt.toFormat('yyyy-MM-dd'),
          startTime: minutesToHHmm(snappedMinutes),
          onList: false
        },
        onCreate: ({ duration }) => {
          const tasksGap = 30
          anchorY += ($pixelsPerHour / 60) * duration + tasksGap
          overrideOptions.update(options => ({
            ...options,
            startDateISO: dt.toFormat('yyyy-MM-dd'),
            startTime: minutesToHHmm(anchorY / pixelsPerMinute)
          }))
        }
      })
    }
  }}
>
  {#each $timestamps as timestamp}
    <div class="bg-[var(--grid-color)] absolute w-full h-[1px] pointer-events-none" 
      style:top="{HHmmToLocalY(timestamp)}px"
    >
    </div>
  {/each}

  {#each scheduledTasks as task (task.id)}
    <div class="absolute inset-x-0 mx-auto w-[var(--width-within-column)]" 
      style:top="{HHmmToLocalY(task.startTime)}px"
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
      style:top="{HHmmToLocalY(startDT.toFormat('HH:mm'))}px" 
    >
      <GcalEvent {event} />
    </div>
  {/each}

  {#if $bestDropzoneID === dropzoneID}
    {@const dragPreviewY = minutesSinceMidnight($draggedItem.y1, $calSnapInterval) * pixelsPerMinute}
    <div class="absolute inset-x-0 mx-auto w-[var(--width-within-column)]" 
      style="
        top: {dragPreviewY}px; 
        height: {$draggedItem.height}px;
        border-radius: var(--left-padding);
        {dropPreviewCSS}
      "
    ></div>
  {/if}

  <div class="absolute w-full pointer-events-none"
    style:anchor-name={anchorID}
    style:top="{anchorY}px"
    style:height="{30 * pixelsPerMinute}px" 
  >
  </div>

  {#if dt.hasSame(DateTime.now(), 'day')}
    <TimeIndicator originDT={dt} 
      {pixelsPerMinute}
    />
  {/if}
</div>