<script>
  import CreateTaskDirectly from '$lib/components/CreateTaskDirectly.svelte'
  import FlexibleDayTask from '$lib/components/FlexibleDayTask.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import { treesByDate } from './service.js'
  import { headerExpanded, isCompact } from './store.js'
  import { 
    isOverlapping, getOverlapArea, clip,
    emptyItem, 
    dropPreviewCSS 
  } from '$lib/utils/dragDrop.js'
  import { WIDTHS } from '$lib/utils/constants.js'
  import { getContext } from 'svelte'
  import { DateTime } from 'luxon'

  const { Task, draggedItem, hasDropped, bestDropzoneID, scrollCalRect, matchedDropzones } = getContext('app')
  let { dt } = $props()

  let isDirectlyCreatingTask = $state(false)
  let dayHeader = $state(null)
  let intersecting = $state(false)
  
  let ISODate = $derived(dt.toFormat('yyyy-MM-dd'))
  let dropzoneID = $derived('header: ' + dt.toFormat('yyyy-MM-dd'))

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

    // abstract into a resetDrag function?
    hasDropped.set(false)
    draggedItem.set(emptyItem())
    bestDropzoneID.set('')
  }

  function onclick (e) {
    if (e.target === e.currentTarget) {
      isDirectlyCreatingTask = true
    }
  }

  function realEffectiveArea () {
    const { left, right, top, bottom } = $scrollCalRect()
    return {
      left: left + WIDTHS.DESKTOP_TIME_AXIS,  // left clipping is most important, everything else is inconsequential
      right, top, bottom
    }
  }
</script>

<div bind:this={dayHeader}
  class="day-header"
  style:padding={$isCompact ? '8px 0px' : 'var(--height-main-content-top-margin) 0px'}
  {onclick}
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

        <div style="display: flex; flex-direction: column; row-gap: {$isCompact ? '4px' : '8px'};">
          {#each $treesByDate[ISODate].noStartTime.noIcon as flexibleDayTask (flexibleDayTask.id)}
            <div class="flexible-day-task">
              <FlexibleDayTask task={flexibleDayTask} />
            </div>
          {/each}
          
          {#if $bestDropzoneID === dropzoneID}
            <div style="height: 12px; width: 100%; {dropPreviewCSS()}"></div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {#if isDirectlyCreatingTask}
    <div id="calendar-direct-task-div">
      <CreateTaskDirectly
        newTaskStartTime={''}
        startDateISO={ISODate}
        on:reset={() => (isDirectlyCreatingTask = false)}
      />
    </div>
  {/if}
</div>

<style>
  #calendar-direct-task-div {
    width: 90%; 
    padding-left: 0px; 
    padding-right: 0px;
  }

  .flexible-day-task {
    display: flex;
    width: var(--width-calendar-day-section); 
    gap: 4px; 

    font-size: 12px; 
    margin-top: 0px; margin-left: 4px; margin-right: 4px; 
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