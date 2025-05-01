<script>
  import Timestamps from './Timestamps.svelte'
  import DayColumn from './DayColumn.svelte'
  import DayHeader from './DayHeader.svelte'
  import YearAndMonthTile from './YearAndMonthTile.svelte'
  import MultiPhotoUploader from '$lib/components/MultiPhotoUploader.svelte'

  import { calEarliestHHMM, totalMinutes } from './timestamps.js'
  import { headerHeight, pixelsPerHour } from './store.js'
  import { TOTAL_COLUMNS, COLUMN_WIDTH, c, originDT } from './constants.js'
  import { setupCalListener } from './service.js'
  import { jumpToToday } from './autoScrolling.js'
  import { trackHeight } from '$lib/utils/svelteActions.js'
  import { onMount } from 'svelte'

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

<div class="relative z-0 grid" style="grid-template-rows: auto 1fr; height: 100%;">
  <YearAndMonthTile height={$headerHeight} {viewportLeft} {originDT} />

  <div class="relative" style:overflow="auto" use:jumpToToday on:scroll={e => scrollX = e.target.scrollLeft} id="scroll-parent">
    <div style:width="{TOTAL_COLUMNS * COLUMN_WIDTH}px" class="relative flexbox">
      <Timestamps class="sticky left-0" style="margin-top: {$headerHeight}px; height: {$totalMinutes * ($pixelsPerHour / 60)}px;"/>

      {#if renderedColumnDTs[0]}
        <div class="absolute" style:left="{renderedColumnDTs[0].diff(originDT, 'days').days * COLUMN_WIDTH}px">
          <div class="sticky top-0 z-1 flexbox" use:trackHeight={h => headerHeight.set(h)} style="box-shadow: 0 3px 3px -2px rgba(0, 0, 0, 0.1);">
            {#each renderedColumnDTs as dt (dt.toMillis())}
              <DayHeader {dt} />
            {/each}
          </div>

          <div class="flexbox pt-7">
            {#each renderedColumnDTs as dt (dt.toMillis())}
              <DayColumn {dt}/>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <MultiPhotoUploader style="position: absolute; right: 1vw; bottom: 1vw;"/>
</div>

<style>
  .pt-7 {
    padding-top: 7px; /* timestamp has a height of 14px (despite a font size of 12px), note: this means the island and the massive-content will have a height difference of 7 px */
  }

  #scroll-parent {
    background-color: var(--calendar-bg-color);
  }

  #scroll-parent::-webkit-scrollbar { /* hide scrollbar in Chrome, Safari and Opera */
    display: none;
  }
</style>