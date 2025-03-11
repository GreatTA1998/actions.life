<script>
  import TimestampLabels from './TimestampLabels.svelte'
  import DayColumn from './DayColumn.svelte'
  import DayHeader from './DayHeader.svelte'
  import MultiPhotoUploader from '$lib/Reusable/MultiPhotoUploader.svelte'
  import YearAndMonthTile from './YearAndMonthTile.svelte'
  import { onDestroy } from 'svelte'
  import { trackWidth, trackHeight } from '/src/helpers/actions.js'
  import { DateTime } from 'luxon'
  
  import {
    user,
    hasInitialScrolled, calEarliestHHMM
  } from '/src/store'
  import { tasksScheduledOn } from '/src/store/calendarStore.js'

  import { setupCalListener } from '/src/store/services/CalendarService.js'


  export let isCompact = false

  // Video explanation for this component (refer to related videos in the "Two-way infinite scroll" folder)
  // https://www.explanations.io/uRNISfkw0mE404Zn4GgH/ePfUWAU6CXL7leApJ9GP

  const TOTAL_COLUMNS = 365
  const COLUMN_WIDTH = 200
  const PIXELS_PER_HOUR = 80
  const CORNER_LABEL_HEIGHT = 110
  const middleIdx = Math.floor(TOTAL_COLUMNS / 2)

  const c = 4 // 2c = 8, total rendered will be visible columns + (8)(2), so 16 additional columns

  let calOriginDT = DateTime.now()
    .startOf('day')
    .minus({ days: TOTAL_COLUMNS / 2 })
  let dtOfActiveColumns = []

  let ScrollParent
  let scrollParentWidth // width doesn't change during scroll, so bind:clientWidth shouldn't cause performance issues
  let scrollX = middleIdx * COLUMN_WIDTH
  let initialScrollParentWidth

  let leftEdgeIdx, prevLeftEdgeIdx, leftTriggerIdx
  let rightEdgeIdx, rightTriggerIdx, prevRightEdgeIdx

  let isShowingDockingArea = true
  let exactHeight = CORNER_LABEL_HEIGHT

  $: setLeftEdgeIdx(scrollX)
  $: setRightEdgeIdx(scrollX)

  $: reactToScroll(leftEdgeIdx, rightEdgeIdx)

  $: if (scrollParentWidth && !leftTriggerIdx && !rightTriggerIdx) {
    setupInitialColumnsAndVariables()
  }
  
  $: if (!$hasInitialScrolled && ScrollParent) {
    scrollToTodayColumn()
  }

  function setupInitialColumnsAndVariables() {
    initialScrollParentWidth = scrollParentWidth
    setLeftEdgeIdx()
    setRightEdgeIdx()

    leftTriggerIdx = leftEdgeIdx - c
    rightTriggerIdx = rightEdgeIdx + c

    updateActiveColumns()
  }

  // NOTE: there are some subtle bugs for the date ranges, that sometimes overlap by 1 day etc.
  // future always works
  // past can be off by 1 day
  // also this is probably affected by effective calendar width
  function reactToScroll (leftEdgeIdx, rightEdgeIdx) {
    // note: `leftEdgeIdx` jumps non-consecutively sometimes depending on how fast the user is scrolling
    if (leftEdgeIdx <= leftTriggerIdx && leftEdgeIdx !== prevLeftEdgeIdx) {
      // Set up listener for past tasks
      // Calculate a date range that's c+1 to 3c+1 days before the trigger point
      const triggerDT = calOriginDT.plus({ days: leftTriggerIdx })
      const rightBound = triggerDT.minus({ days: c + 1 })
      const leftBound = rightBound.minus({ days: 2 * c })
      setupCalListener($user.uid, leftBound, rightBound)
      
      // Move the trigger point further left to prepare for the next scroll event
      leftTriggerIdx -= 2 * c + 1
    } else if (
      rightEdgeIdx >= rightTriggerIdx &&
      rightEdgeIdx !== prevRightEdgeIdx
    ) {
      // Set up listener for future tasks
      // Calculate a date range that's c+1 to 3c+1 days after the trigger point
      const triggerDT = calOriginDT.plus({ days: rightTriggerIdx })
      const leftBound = triggerDT.plus({ days: c + 1 })
      const rightBound = leftBound.plus({ days: 2 * c })
      setupCalListener($user.uid, leftBound, rightBound)
      
      // Move the trigger point further right to prepare for the next scroll event
      rightTriggerIdx += 2 * c + 1
    }

    // HANDLE DISPLAY
    if (
      leftEdgeIdx <= prevLeftEdgeIdx - c ||
      rightEdgeIdx >= prevRightEdgeIdx + c
    ) {
      updateActiveColumns()
    }
  }

  function updateActiveColumns() {
    const output = []
    for (let i = leftEdgeIdx - 2 * c; i <= rightEdgeIdx + 2 * c; i++) {
      let dt = calOriginDT.plus({ days: i })
      dt = dt.set({
        hour: Number($calEarliestHHMM.split(':')[0]), 
        minute: Number($calEarliestHHMM.split(':')[1])
      })
      output.push(dt)
    }
    dtOfActiveColumns = output

    prevRightEdgeIdx = rightEdgeIdx
    prevLeftEdgeIdx = leftEdgeIdx
  }

  function setLeftEdgeIdx() {
    leftEdgeIdx = Math.floor(scrollX / COLUMN_WIDTH)
  }

  function setRightEdgeIdx() {
    rightEdgeIdx = Math.ceil(
      (scrollX + initialScrollParentWidth) / COLUMN_WIDTH
    )
  }

  function scrollToTodayColumn() {
    requestAnimationFrame(() => {
      ScrollParent.scrollLeft = middleIdx * COLUMN_WIDTH
    }) // we don't set `hasInitialScrolled` to true, let <CurrentTimeIndicator/> finish off the rest of the logic when it mounts
  }
</script>

<div class="calendar-wrapper">
  <div class="floating-button" style="background-color: hsl(98, 40%, {90 + 2}%, 0.4);">
    <MultiPhotoUploader />
  </div>  

  <YearAndMonthTile
    {isCompact}
    {leftEdgeIdx}
    {calOriginDT}
    {exactHeight}
    {isShowingDockingArea}
    on:toggle-docking-area={() => isShowingDockingArea = !isShowingDockingArea}
  />

  <div id="scroll-parent"
    bind:this={ScrollParent}
    use:trackWidth={(newWidth) => (scrollParentWidth = newWidth)}
    on:scroll={(e) => (scrollX = e.target.scrollLeft)}
  >
    <div class="scroll-content" style:width="{TOTAL_COLUMNS * COLUMN_WIDTH}px">
      <TimestampLabels
        {isCompact}
        pixelsPerHour={PIXELS_PER_HOUR}
        topMargin={exactHeight}
      />

      {#if dtOfActiveColumns[0] && $tasksScheduledOn}
        <div class="visible-days"
          style:left={`${dtOfActiveColumns[0].diff(calOriginDT, 'days').days * COLUMN_WIDTH}px`}
        >
          <div use:trackHeight={newHeight => exactHeight = newHeight}
            class="headers-flexbox"
            class:bottom-border={$tasksScheduledOn}
          >
            {#each dtOfActiveColumns as dt, i (dt.toFormat('yyyy-MM-dd') + `-${i}`)}
              <DayHeader ISODate={dt.toFormat('yyyy-MM-dd')}
                {isCompact}
                {isShowingDockingArea}
                on:task-click
                on:task-create
                on:task-update
              />
            {/each}
          </div>

          <div class="day-columns">
            {#each dtOfActiveColumns as dt, i (dt.toMillis() + `-${i}`)}
              <DayColumn {dt}
                scheduledTasks={$tasksScheduledOn[dt.toFormat('yyyy-MM-dd')]?.hasStartTime ?? []}
                pixelsPerHour={PIXELS_PER_HOUR}
                on:task-click
                on:task-create
                on:task-update
              />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  :root {
    /* NOTE: there might be more missing CSS variables, refer to Github if more issues emerge */
    --calendar-left-padding: 16px;
  }

  #scroll-parent {
    overflow-y: scroll; /* Enable vertical scrolling */
    -ms-overflow-style: none;  /* Hide scrollbar in IE and Edge */
    scrollbar-width: none;  /* Hide scrollbar in Firefox */
  }

  /* Hide scrollbar in Chrome, Safari and Opera */
  #scroll-parent::-webkit-scrollbar {
    display: none;
  }

  /* I vaguely remember I had to use grid so the children naturally take up 100% height */
  .calendar-wrapper {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
    position: relative;

    /* this is key, otherwise it doesn't count as a stacking context  */
    z-index: 0;
  }

  #scroll-parent {
    overflow: auto;
    position: relative;
    
    /* FIRST: do no harm (this property has downsides) But it's a last-resort fallback if there are performance issues */
    /* will-change: scroll-position; */
  }

  .scroll-content {
    position: relative;
    display: flex;
    background-color: var(--calendar-bg-color);
  }

  .visible-days {
    /* we use absolute positioning instead of `translateX` because iOS safari drag-drop is glitchy with translated elements */
    position: absolute; 

    left: 60px; /* Timestamp width */
  }

  .headers-flexbox {
    display: flex;
    position: sticky;
    top: 0;
    background: var(--calendar-bg-color);
    z-index: 1;
  }

  .day-columns {
    display: flex;

    /* timestamp has a height of 14px (despite a font size of 12px) */
    padding-top: 7px;
  }

  .bottom-border {
    box-shadow: 0 3px 3px -2px rgba(0, 0, 0, 0.1);
  }

  .floating-button {
    position: absolute; 
    right: 1vw; 
    bottom: 1vw; 
    z-index: 1; 
    border: 1px solid lightgrey;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); 
    height: 50px;
    width: 50px;
    border-radius: 30px;  
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
