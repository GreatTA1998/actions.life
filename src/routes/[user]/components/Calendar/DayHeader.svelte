<script>
  import TaskRows from './TaskRows.svelte'
  import GCalAllDay from '$lib/features/google-calendar/GCalAllDay.svelte'
  import { HEIGHTS } from '$lib/utils/constants.js'
  import { googleEventsByDate } from '$lib/store'
  import { titleFS } from '$lib/styles/reused.module.css'
  import { headerHeight, isCompact, calColumnWidth, timestampsColumnWidth, calHeaderClip } from './store.js'
  import { getContext } from 'svelte'
  import { DateTime } from 'luxon'

  const { treesByDate } = getContext('app')
  const { activateInput } = getContext('popover-input')
  const { 
    registerDropzone, placeInDayHeader, scrollCalRect,
    bestDropzoneID, dropPreviewCSS
  } = getContext('drag-drop')
  
  let { dt } = $props()

  let ISODate = $derived(dt.toFormat('yyyy-MM-dd'))
  let dropzoneID = $derived('header: ' + dt.toFormat('yyyy-MM-dd'))
  let anchorID = $derived(`--day-header-${dt.toFormat('yyyy-MM-dd')}`)
</script>

<div 
  {@attach registerDropzone({
    clipRectFunction: () => calHeaderClip($scrollCalRect(), $timestampsColumnWidth, $headerHeight),
    id: dropzoneID,
    onDrop: () => {
      const rooms = $treesByDate[ISODate]?.noStartTime ?? []
      placeInDayHeader({ startDateISO: ISODate, rooms, index: rooms.length })
    }
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
    <div class="flex flex-col gap-y-1 px-1 {$isCompact? 'mt-0' : 'mt-1'}">
      <TaskRows
        tasks={$treesByDate[ISODate].noStartTime}
        onReorder={index => placeInDayHeader({
          startDateISO: ISODate,
          rooms: $treesByDate[ISODate].noStartTime,
          index
        })}
        dragOrigin="day-header"
        fontSize={titleFS}
        nameClass="font-medium"
        showImage
        showParent
        clipRectFunction={() => calHeaderClip($scrollCalRect(), $timestampsColumnWidth, $headerHeight)}
      />

      {#if $googleEventsByDate[ISODate]?.allDay}
        <div class="flex flex-col gap-y-1">
          {#each $googleEventsByDate[ISODate].allDay as event}  
            <GCalAllDay {event} />
          {/each}
        </div>
      {/if}
      
      {#if $bestDropzoneID === dropzoneID}
        <div style="height: 12px; width: 100%; {dropPreviewCSS}" class="rounded"></div>
      {/if}
    </div>
  {/if}

  <div class="w-full h-4.5 pointer-events-none" style="anchor-name: {anchorID};">

  </div>
</div>