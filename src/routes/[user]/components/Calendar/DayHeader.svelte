<script>
  import CalTaskUnit from '$lib/components/CalTaskUnit.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import GCalAllDay from '$lib/features/google-calendar/GCalAllDay.svelte'
  import { HEIGHTS } from '$lib/utils/constants.js'
  import { googleEventsByDate } from '$lib/store'
  import { headerHeight, isCompact, calColumnWidth, timestampsColumnWidth } from './store.js'
  import { getContext } from 'svelte'
  import { DateTime } from 'luxon'

  const { Task, treesByDate } = getContext('app')
  const { activateInput } = getContext('popover-input')
  const { 
    registerDropzone,
    draggedItem, scrollCalRect, startTaskDrag,
    bestDropzoneID, dropPreviewCSS
  } = getContext('drag-drop')
  
  let { dt } = $props()

  let ISODate = $derived(dt.toFormat('yyyy-MM-dd'))
  let dropzoneID = $derived('header: ' + dt.toFormat('yyyy-MM-dd'))
  let anchorID = $derived(`--day-header-${dt.toFormat('yyyy-MM-dd')}`)

  function calHeaderArea () {
    // left clipping is most important, everything else is inconsequential
    const { left, right, top } = $scrollCalRect()
    return {
      left: left + $timestampsColumnWidth, 
      right, 
      top, 
      bottom: top + $headerHeight
    }
  }
</script>

<div 
  {@attach registerDropzone({
    clipRectFunction: calHeaderArea,
    id: dropzoneID,
    onDrop: () => Task.update({ id: $draggedItem.id, kvChanges: {
      startTime: '',
      startDateISO: ISODate
    }})
  })}
  class="text-neutral-700 bg-[var(--cal-bg)]"
  style:width="{$calColumnWidth}px"
  style:padding={$isCompact ? '8px 0px' : `${HEIGHTS.ROOT_DROPZONE}rem 0px`}
  style:padding-bottom="0"
  onclick={e => {
    e.stopPropagation()
    if (e.target !== e.currentTarget) return;
    activateInput({ 
      anchorID, 
      modifiers: { 
        startDateISO: ISODate, 
        startTime: '', 
        onList: false
      }
    })
  }}
>
  <div class="text-md flex justify-center items-center gap-x-1 select-none">
    <div>{DateTime.fromISO(ISODate).toFormat('ccc')}</div>
    <div>{DateTime.fromISO(ISODate).toFormat('dd')}</div>
  </div>

  {#if $treesByDate[ISODate]}
    {@const { hasIcon, noIcon } = $treesByDate[ISODate].noStartTime}
    <div class="flex flex-wrap {$isCompact? 'mt-0' : 'mt-1'}">
      {#each hasIcon as iconTask (iconTask.id)}
        <DoodleIcon {iconTask} size="2rem" />
      {/each}
    </div>

    <div class="flex flex-col gap-y-1 px-1">
      {#each noIcon as task (task.id)}
        <div draggable="true"  
          ondragstart={e => startTaskDrag({ e, id: task.id, isFromCal: true })}
        >
          <CalTaskUnit {task} />
        </div>
      {/each}

      {#if $googleEventsByDate[ISODate]?.allDay}
        <div class="flex flex-col gap-y-1">
          {#each $googleEventsByDate[ISODate].allDay as event}  
            <GCalAllDay {event} />
          {/each}
        </div>
      {/if}
      
      {#if $bestDropzoneID === dropzoneID}
        <div style="height: 12px; width: 100%; {dropPreviewCSS}"></div>
      {/if}
    </div>
  {/if}

  <div class="w-full h-4.5 pointer-events-none" style="anchor-name: {anchorID};">

  </div>
</div>