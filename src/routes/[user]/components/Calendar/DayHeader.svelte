<script>
  import FlexibleDayTask from '$lib/components/FlexibleDayTask.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import { activateInput } from '$lib/store/popoverInput.js'
  import { treesByDate } from './service.js'
  import { headerExpanded, isCompact, timestampsColumnWidth } from './store.js'
  import { 
    isOverlapping, getOverlapArea, clip,
    dropPreviewCSS 
  } from '$lib/utils/dragDrop.js'
  import { getContext } from 'svelte'
  import { DateTime } from 'luxon'

  const { Task } = getContext('app')
  const { draggedItem, hasDropped, bestDropzoneID, scrollCalRect, matchedDropzones, resetDragDrop } = getContext('drag-drop')
  
  let { dt } = $props()

  let dayHeader = $state(null)
  let intersecting = $state(false)
  
  let ISODate = $derived(dt.toFormat('yyyy-MM-dd'))
  let dropzoneID = $derived('header: ' + dt.toFormat('yyyy-MM-dd'))
  let anchorID = $derived(`--day-header-${dt.toFormat('yyyy-MM-dd')}`)

  $effect(() => {
    if ($draggedItem && $draggedItem.id) {
      requestAnimationFrame(checkIntersection)
    }
  })

  $effect(() => {
    if ($hasDropped && $bestDropzoneID === dropzoneID) {
      drop_handler($draggedItem)
    }
  })

  function checkIntersection () {
    const { x1, x2, y1, y2 } = clip($draggedItem, realEffectiveArea())

    const dayHeaderRect = dayHeader.getBoundingClientRect()
    intersecting = isOverlapping(
      { x1, x2, y1, y2 }, 
      dayHeaderRect,
      0,
      0
    )

    if (intersecting) {
      // update context-wide state
      const area = getOverlapArea({ x1, x2, y1, y2 }, dayHeaderRect)
      matchedDropzones.update(obj => {
        obj[dropzoneID] = {
          area,
          left: dayHeaderRect.left
        }
        return obj
      })
    }

    else {
      matchedDropzones.update(obj => {
        delete obj[dropzoneID]
        return obj
      })
    }
  }

  function drop_handler ({ id }) {
    Task.update({ id, keyValueChanges: {
      startTime: '',
      startDateISO: ISODate
    }})

    resetDragDrop()
  }

  function realEffectiveArea () {
    const { left, right, top, bottom } = $scrollCalRect()
    return {
      left: left + $timestampsColumnWidth,  // left clipping is most important, everything else is inconsequential
      right, top, bottom
    }
  }
</script>

<div bind:this={dayHeader}
  class="day-header"
  style:padding={$isCompact ? '8px 0px' : 'var(--height-main-content-top-margin) 0px'}
  onclick={e => {
    e.stopPropagation()
    if (e.target !== e.currentTarget) return;
    activateInput({ 
      anchorID, 
      modifiers: { startDateISO: ISODate, persistsOnList: false }
    })
  }}
>
  <div class="compact-horizontal unselectable">
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
    <div style="overflow: hidden; margin-top: {$isCompact ? '0' : '4'}px;">
      {#if $treesByDate[ISODate]}
        <div style="display: flex; flex-wrap: wrap;">
          {#each $treesByDate[ISODate].noStartTime.hasIcon as iconTask (iconTask.id)}
            <DoodleIcon {iconTask} />
          {/each}
        </div>

        <div style="display: flex; flex-direction: column; row-gap: 4px; padding: 0px 4px;">
          {#each $treesByDate[ISODate].noStartTime.noIcon as flexibleDayTask (flexibleDayTask.id)}
            <FlexibleDayTask task={flexibleDayTask} />
          {/each}
          
          {#if $bestDropzoneID === dropzoneID}
            <div style="height: 12px; width: 100%; {dropPreviewCSS()}"></div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  <div class="task-input" style="anchor-name: {anchorID};">

  </div>
</div>

<style>
  .task-input {
    margin-top: 4px;
    width: 100%; 
    padding-left: 0px; 
    padding-right: 0px;
  }

  .compact-horizontal {
    display: flex; 
    justify-content: center;
  }

  .day-header {
    width: var(--width-calendar-day-section);
    padding-top: var(--main-content-top-margin);
    padding-bottom: 18px;

    font-size: 1.4em;
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