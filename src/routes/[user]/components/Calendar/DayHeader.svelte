<script>
  import CalTaskUnit from '$lib/components/CalTaskUnit.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import GCalAllDay from '$lib/features/google-calendar/GCalAllDay.svelte'
  import { treesByDate } from './service.js'
  import { googleEventsByDate } from '$lib/store'
  import { headerHeight, isCompact, timestampsColumnWidth } from './store.js'
  import { getContext } from 'svelte'
  import { DateTime } from 'luxon'

  const { Task } = getContext('app')
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
  class="day-header"
  style:padding={$isCompact ? '8px 0px' : 'var(--height-main-content-top-margin) 0px'}
  style:padding-bottom="0"
  onclick={e => {
    e.stopPropagation()
    if (e.target !== e.currentTarget) return;
    activateInput({ 
      anchorID, 
      modifiers: { startDateISO: ISODate, startTime: '', persistsOnList: false }
    })
  }}
>
  <div class="flex justify-center select-none">
    <div class="center-flex day-name-label"
      class:active-day-name={ISODate <= DateTime.now().toFormat('yyyy-MM-dd')}
    >
      {DateTime.fromISO(ISODate).toFormat('ccc')}
    </div>

    <div class="center-flex" style="font-size: 1rem; font-weight: 300">
      <div class="center-flex" style="padding: 0; width: 28px;"
        class:active-date-number={ISODate <= DateTime.now().toFormat('yyyy-MM-dd')}
      >
        {DateTime.fromISO(ISODate).toFormat('dd')}
      </div>
    </div>
  </div>

  {#if $treesByDate[ISODate]}
    {@const { hasIcon, noIcon } = $treesByDate[ISODate].noStartTime}
    <div class="flex flex-wrap {$isCompact? 'mt-0' : 'mt-1'}">
      {#each hasIcon as iconTask (iconTask.id)}
        <DoodleIcon {iconTask} />
      {/each}
    </div>

    <div class="flex flex-col gap-y-1 px-1">
      {#each noIcon as task (task.id)}
        <div draggable="true"  
          ondragstart={e => startTaskDrag({ e, id: task.id, isFromCal: true })}
          style:opacity={task.isDone ? '0.9' : '0.7'}
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

  <div class="task-input" style="anchor-name: {anchorID};">

  </div>
</div>

<style>
  .task-input {
    width: 100%; 
    height: 1.125rem;
    padding-left: 0px; 
    padding-right: 0px;
    pointer-events: none;
  }

  .day-header {
    width: var(--width-cal-column);
    font-size: 1.4rem;
    background-color: var(--cal-bg);
    color: #6d6d6d;
  }

  .day-name-label {
    font-size: 1rem;
    margin-bottom: 0px;
    font-weight: 400;
  }

  .active-day-name {
    color: rgb(30, 30, 30);
  }

  .active-date-number {
    font-weight: 300;
    color: rgb(60, 60, 60);
  }

  .center-flex {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>