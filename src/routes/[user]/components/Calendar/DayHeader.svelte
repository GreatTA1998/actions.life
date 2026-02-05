<script>
  import FlexibleDayTask from '$lib/components/FlexibleDayTask.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import { treesByDate } from './service.js'
  import { headerHeight, headerExpanded, isCompact, timestampsColumnWidth } from './store.js'
  import { getContext } from 'svelte'
  import { DateTime } from 'luxon'

  const { Task } = getContext('app')
  const { activateInput } = getContext('popover-input')
  const { 
    draggedItem, scrollCalRect, detectOverlap, 
    bestDropzoneID, dropPreviewCSS, hasDropped, resetDragDrop
  } = getContext('drag-drop')
  
  let { dt } = $props()

  let dayHeader = $state(null)
  let ISODate = $derived(dt.toFormat('yyyy-MM-dd'))
  let dropzoneID = $derived('header: ' + dt.toFormat('yyyy-MM-dd'))
  let anchorID = $derived(`--day-header-${dt.toFormat('yyyy-MM-dd')}`)

  $effect(() => {
    if ($draggedItem && $draggedItem.id) {
      detectOverlap({
        dropzoneElem: dayHeader,
        clipRect: calHeaderArea(),
        dropzoneID
      })
    }
  })

  $effect(() => {
    if ($hasDropped && $bestDropzoneID === dropzoneID) {
      drop_handler($draggedItem)
    }
  })

  function drop_handler ({ id }) {
    Task.update({ id, keyValueChanges: {
      startTime: '',
      startDateISO: ISODate
    }})

    resetDragDrop()
  }

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

<div bind:this={dayHeader}
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
  <div class="compact-horizontal select-none">
    <div class="center-flex day-name-label"
      class:active-day-name={ISODate <= DateTime.now().toFormat('yyyy-MM-dd')}
    >
      {DateTime.fromISO(ISODate).toFormat('ccc')}
    </div>

    <div class="center-flex" style="font-size: 16px; font-weight: 300">
      <div class="center-flex" style="padding: 0px 0px; width: 28px;"
        class:active-date-number={ISODate <= DateTime.now().toFormat('yyyy-MM-dd')}
      >
        {DateTime.fromISO(ISODate).toFormat('dd')}
      </div>
    </div>
  </div>

  {#if $headerExpanded}
    {#if $treesByDate[ISODate]}
      <div class="flex flex-wrap {$isCompact? 'mt-0' : 'mt-1'}">
        {#each $treesByDate[ISODate].noStartTime.hasIcon as iconTask (iconTask.id)}
          <DoodleIcon {iconTask} />
        {/each}
      </div>

      <div style="display: flex; flex-direction: column; row-gap: 4px; padding: 0px 4px;">
        {#each $treesByDate[ISODate].noStartTime.noIcon as flexibleDayTask (flexibleDayTask.id)}
          <FlexibleDayTask task={flexibleDayTask} />
        {/each}
        
        {#if $bestDropzoneID === dropzoneID}
          <div style="height: 12px; width: 100%; {dropPreviewCSS}"></div>
        {/if}
      </div>
    {/if}
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

  .compact-horizontal {
    display: flex; 
    justify-content: center;
  }

  .day-header {
    width: var(--width-calendar-day-section);
    font-size: 1.4rem;
    background-color: var(--calendar-bg-color);
    color: #6d6d6d;
  }

  .day-name-label {
    font-size: 16px;
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