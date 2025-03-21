<script>
  /** @see https://explanations.io/uRNISfkw0mE404Zn4GgH/ePfUWAU6CXL7leApJ9GP */

  import TimestampLabels from './TimestampLabels.svelte'
  import DayColumn from './DayColumn.svelte'
  import DayHeader from './DayHeader.svelte'
  import YearAndMonthTile from './YearAndMonthTile.svelte'
  import MultiPhotoUploader from '$lib/Reusable/MultiPhotoUploader.svelte'

  import { trackHeight } from '/src/lib/utils/svelteActions.js'
  import { DateTime } from 'luxon'
  import { calEarliestHHMM } from './timestamps.js'
  import { treesByDate, headerHeight } from './store.js'
  import { setupCalListener } from './service.js'
  import { onMount } from 'svelte'

  const TOTAL_COLUMNS = 365
  const COLUMN_WIDTH = 200
  const c = 4 // stands for "cushion"

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
  
  $: if (viewportRight >= triggerRight) addFutureListener()
  $: if (viewportLeft <= triggerLeft) addPastListener()  

  onMount(() => {
    setupCalListener(
      originDT.plus({ days: viewportLeft - 2*c }),
      originDT.plus({ days: viewportRight + 2*c })
    )
    triggerLeft = viewportLeft - c
    triggerRight = viewportRight + c
  })

  function addFutureListener () {
    setupCalListener(
      originDT.plus({ days: (triggerRight + c) + 1 }),
      originDT.plus({ days: (triggerRight + c) + 1 + 2*c }) 
    )
    triggerRight += (1 + 2*c)
  }

  function addPastListener () {
    setupCalListener(
      originDT.plus({ days: (triggerLeft - c) - 1 - 2*c }),
      originDT.plus({ days: (triggerLeft - c) - 1 })
    )
    triggerLeft -= (1 + 2*c)
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

<div class="cal-root">
  <div class="float-button">
    <MultiPhotoUploader />
  </div>  

  <YearAndMonthTile {viewportLeft} {originDT}/>

  <div id="scroll-parent" on:scroll={e => scrollX = e.target.scrollLeft}>
    <div class="scroll-content" style:width="{TOTAL_COLUMNS * COLUMN_WIDTH}px">
      <TimestampLabels/>

      {#if renderedColumnDTs[0]}
        <div style="position: absolute;" style:left={`${renderedColumnDTs[0].diff(originDT, 'days').days * COLUMN_WIDTH}px`}>
          <div use:trackHeight={h => headerHeight.set(h)} class="headers-flexbox">
            {#each renderedColumnDTs as dt (dt.toMillis())}
              <DayHeader ISODate={dt.toFormat('yyyy-MM-dd')} />
            {/each}
          </div>

          <div class="day-columns">
            {#each renderedColumnDTs as dt (dt.toMillis())}
              <DayColumn {dt}
                scheduledTasks={$treesByDate[dt.toFormat('yyyy-MM-dd')]?.hasStartTime ?? []}
              />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .cal-root {
    position: relative;
    z-index: 0; /* otherwise it doesn't count as a stacking context */
    display: grid; /* I vaguely remember I had to use grid so the children naturally take up 100% height */
    grid-template-rows: auto 1fr;
    height: 100%;
  }

  #scroll-parent {
    position: relative;
    overflow: auto;
  }

  #scroll-parent::-webkit-scrollbar { /* Hide scrollbar in Chrome, Safari and Opera */
    display: none;
  }

  .scroll-content {
    position: relative;
    display: flex;
    background-color: var(--calendar-bg-color);
  }

  .headers-flexbox {
    display: flex;
    position: sticky;
    top: 0;
    background: var(--calendar-bg-color);
    z-index: 1;
    box-shadow: 0 3px 3px -2px rgba(0, 0, 0, 0.1);
  }

  .day-columns {
    display: flex;
    padding-top: 7px; /* timestamp has a height of 14px (despite a font size of 12px) */
  }

  .float-button {
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
    background-color: hsl(98, 40%, 92%, 0.4);
  }
</style>