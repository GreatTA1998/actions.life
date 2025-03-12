<script>
  /** @see https://explanations.io/uRNISfkw0mE404Zn4GgH/ePfUWAU6CXL7leApJ9GP */

  import TimestampLabels from './TimestampLabels.svelte'
  import DayColumn from './DayColumn.svelte'
  import DayHeader from './DayHeader.svelte'
  import YearAndMonthTile from './YearAndMonthTile.svelte'
  import MultiPhotoUploader from '$lib/Reusable/MultiPhotoUploader.svelte'

  import { trackHeight } from '/src/helpers/actions.js'
  import { DateTime } from 'luxon'
  import { calEarliestHHMM } from '/src/store'
  import { tasksScheduledOn } from '/src/store/calendarStore.js'
  import { setupCalListener } from '/src/store/services/CalendarService.js'
  import { onMount } from 'svelte'

  export let isCompact = false

  const TOTAL_COLUMNS = 365
  const COLUMN_WIDTH = 200
  const CORNER_LABEL_HEIGHT = 110
  const c = 4

  let exactHeight = CORNER_LABEL_HEIGHT
  let originDT = DateTime.now().startOf('day').minus({ days: TOTAL_COLUMNS / 2 })
  let renderedColumnDTs = []
  let renderedLeft = Infinity
  let renderedRight = -Infinity
  let triggerLeft = -Infinity
  let triggerRight = Infinity

  let scrollX = Math.floor(TOTAL_COLUMNS / 2) * COLUMN_WIDTH // divergent from the UI initially

  $: viewportLeft = Math.floor(scrollX / COLUMN_WIDTH)
  $: viewportRight = Math.ceil((scrollX + window.innerWidth) / COLUMN_WIDTH)
  $: updateRenderedColumns(viewportLeft, viewportRight)
  $: if (viewportLeft <= triggerLeft) addPastListener()  
  $: if (viewportRight >= triggerRight) addFutureListener()

  onMount(() => {
    setupCalListener(
      originDT.plus({ days: viewportLeft - 2*c }),
      originDT.plus({ days: viewportRight + 2*c })
    )
    triggerLeft = viewportLeft - c
    triggerRight = viewportRight + c
  })

  function addPastListener () {
    const triggerDT = originDT.plus({ days: triggerLeft })
    setupCalListener(
      triggerDT.minus({ days: 1 + 3*c }),
      triggerDT.minus({ days: 1 + c })
    )      
    triggerLeft -= 1 + 2*c
  }

  function addFutureListener () {
    const triggerDT = originDT.plus({ days: triggerRight })
    setupCalListener(
      triggerDT.plus({ days: 1 + c }),
      triggerDT.plus({ days: 1 + 3*c })
    )
    triggerRight += 1 + 2*c
  }

  function updateRenderedColumns () {
    if (viewportLeft - renderedLeft < c || renderedRight - viewportRight < c) {
      renderedLeft = viewportLeft - 2*c
      renderedRight = viewportRight + 2*c

      const [hour, minute] = $calEarliestHHMM.split(':').map(Number)
      renderedColumnDTs = Array.from(
        { length: renderedRight - renderedLeft + 1 },
        (_, i) => originDT.plus({ days: renderedLeft + i }).set({ hour, minute })
      )
    }
  }
</script>

<div class="calendar-wrapper">
  <div class="floating-button" style="background-color: hsl(98, 40%, {90 + 2}%, 0.4);">
    <MultiPhotoUploader />
  </div>  

  <YearAndMonthTile {viewportLeft} {isCompact} {originDT} {exactHeight}/>

  <div id="scroll-parent" on:scroll={e => scrollX = e.target.scrollLeft}>
    <div class="scroll-content" style:width="{TOTAL_COLUMNS * COLUMN_WIDTH}px">
      <TimestampLabels
        {isCompact}
        topMargin={exactHeight}
      />
      {#if renderedColumnDTs[0] && $tasksScheduledOn}
        <div
          style:left={`${renderedColumnDTs[0].diff(originDT, 'days').days * COLUMN_WIDTH}px`}
          class="rendered-days" 
        >
          <div use:trackHeight={newHeight => exactHeight = newHeight} class="headers-flexbox" class:bottom-border={$tasksScheduledOn}>
            {#each renderedColumnDTs as dt, i (dt.toFormat('yyyy-MM-dd') + `-${i}`)}
              <DayHeader ISODate={dt.toFormat('yyyy-MM-dd')}
                {isCompact}
                on:task-click
                on:task-create
                on:task-update
              />
            {/each}
          </div>
          <div class="day-columns">
            {#each renderedColumnDTs as dt, i (dt.toMillis() + `-${i}`)}
              <DayColumn {dt}
                scheduledTasks={$tasksScheduledOn[dt.toFormat('yyyy-MM-dd')]?.hasStartTime ?? []}
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
  #scroll-parent {
    position: relative;
    overflow: auto;
  }

  #scroll-parent::-webkit-scrollbar { /* Hide scrollbar in Chrome, Safari and Opera */
    display: none;
  }

  .calendar-wrapper {
    position: relative;
    z-index: 0; /* otherwise it doesn't count as a stacking context */
    display: grid; /* I vaguely remember I had to use grid so the children naturally take up 100% height */
    grid-template-rows: auto 1fr;
    height: 100%;
  }

  .scroll-content {
    position: relative;
    display: flex;
    background-color: var(--calendar-bg-color);
  }

  .rendered-days {
    position: absolute; /* instead of `translateX` because iOS safari drag-drop is glitchy with translated elements */
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
    padding-top: 7px; /* timestamp has a height of 14px (despite a font size of 12px) */
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