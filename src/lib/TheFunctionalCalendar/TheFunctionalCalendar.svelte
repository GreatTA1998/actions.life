<script>
  import DayColumn from './DayColumn.svelte'
  import DayHeader from './DayHeader.svelte'
  import CalendarTimestamps from './CalendarTimestamps.svelte'
  import YearAndMonthTile from './YearAndMonthTile.svelte'
  import MultiPhotoUploader from '../MultiPhotoUploader.svelte'

  import Tasks from '/src/back-end/Tasks'
  import { buildCalendarDataStructures } from '/src/helpers/maintainState.js'
  import { trackWidth, trackHeight } from '/src/helpers/actions.js'
  import { DateTime } from 'luxon'
  import {
    tasksScheduledOn,
    user,
    calendarTasks,
    hasInitialScrolled
  } from '/src/store'

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

  let leftEdgeIdx
  let rightEdgeIdx

  let leftTriggerIdx
  let rightTriggerIdx

  let prevLeftEdgeIdx
  let prevRightEdgeIdx

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

  function reactToScroll(leftEdgeIdx, rightEdgeIdx) {
    // HANDLE DATA
    // note: `leftEdgeIdx` jumps non-consecutively sometimes depending on how fast the user is scrolling
    if (leftEdgeIdx <= leftTriggerIdx && leftEdgeIdx !== prevLeftEdgeIdx) {
      fetchMorePastTasks(leftTriggerIdx) // even though jumps can be arbitrarily wide, the function calls will resolve in a weakly decreasing order of their `leftTriggerIdx`
      leftTriggerIdx -= 2 * c + 1
    } else if (
      rightEdgeIdx >= rightTriggerIdx &&
      rightEdgeIdx !== prevRightEdgeIdx
    ) {
      fetchMoreFutureTasks(rightTriggerIdx)
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

  async function fetchMorePastTasks(triggerIdx) {
    return new Promise(async (resolve, reject) => {
      try {
        const triggerDT = calOriginDT.plus({ days: triggerIdx })
        const rightBound = triggerDT.minus({ days: c + 1 })
        const leftBound = rightBound.minus({ days: 2 * c })

        const newTasks = await Tasks.getByDateRange(
          $user.uid,
          leftBound.toISODate(),
          rightBound.toISODate()
        )

        const mergedTasks = removeDuplicateTasks([
          ...newTasks,
          ...$calendarTasks
        ])
        buildCalendarDataStructures({ flatArray: mergedTasks })
        resolve('done')
      } catch (err) {
        console.error('error in fetchMorePastTasks', err)
        reject(err)
      }
    })
  }

  function removeDuplicateTasks(tasks) {
    return tasks.filter(
      (task, index, self) => index === self.findIndex((t) => t.id === task.id)
    )
  }

  async function fetchMoreFutureTasks(triggerIdx) {
    return new Promise(async (resolve, reject) => {
      try {
        const triggerDT = calOriginDT.plus({ days: triggerIdx })
        const leftBound = triggerDT.plus({ days: c + 1 })
        const rightBound = leftBound.plus({ days: 2 * c })

        // note each new loaded intervals should not be overlapping
        const newTasks = await Tasks.getByDateRange(
          $user.uid,
          leftBound.toISODate(),
          rightBound.toISODate()
        )
        const mergedTasks = removeDuplicateTasks([
          ...newTasks,
          ...$calendarTasks
        ])
        buildCalendarDataStructures({ flatArray: mergedTasks })
        resolve('done')
      } catch (err) {
        console.error('error in fetchMorePastTasks', err)
        reject(err)
      }
    })
  }

  function updateActiveColumns() {
    const output = []
    for (let i = leftEdgeIdx - 2 * c; i <= rightEdgeIdx + 2 * c; i++) {
      output.push(calOriginDT.plus({ days: i }))
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
      <CalendarTimestamps
        {isCompact}
        pixelsPerHour={PIXELS_PER_HOUR}
        topMargin={exactHeight}
      />

      <!-- we use absolute positioning instead of `translateX` because iOS safari drag-drop is glitchy with translated elements -->
      {#if dtOfActiveColumns[0] && $tasksScheduledOn}
        <div class="visible-days"
          style="position: absolute"
          style:left={`${dtOfActiveColumns[0].diff(calOriginDT, 'days').days * COLUMN_WIDTH}px`}
        >
          <div use:trackHeight={newHeight => exactHeight = newHeight}
            class="headers-flexbox"
            class:bottom-border={$tasksScheduledOn}
          >
            {#each dtOfActiveColumns as currentDate, i (currentDate.toMillis() + `${i}`)}
              <DayHeader ISODate={currentDate.toFormat('yyyy-MM-dd')}
                {isCompact}
                {isShowingDockingArea}
                on:task-update
                on:task-click
                on:new-root-task
              />
            {/each}
          </div>

          <div class="day-columns">
            {#each dtOfActiveColumns as currentDate (currentDate.toMillis())}
              <DayColumn
                calendarBeginningDateClassObject={DateTime.fromISO(
                  currentDate.toFormat('yyyy-MM-dd')
                ).set({ 
                  hour: Number('07:15'.split(':')[0]), 
                  minutes: Number('23:15'.split(':')[1]) 
                })
                .toJSDate()}
                pixelsPerHour={PIXELS_PER_HOUR}
                scheduledTasks={$tasksScheduledOn[currentDate.toFormat('yyyy-MM-dd')]?.hasStartTime ?? []}
                on:task-update
                on:task-click
                on:new-root-task
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
  }

  .bottom-border {
    border-bottom: 1px solid lightgrey;
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
