<script>
  import Timestamps from './Timestamps.svelte'
  import DayColumn from './DayColumn.svelte'
  import DayHeader from './DayHeader.svelte'
  import YearAndMonthTile from './YearAndMonthTile.svelte'

  import { headerHeight, pixelsPerHour, timestampsColumnWidth } from './store.js'
  import { TOTAL_COLUMNS, COLUMN_WIDTH, c, originDT } from './constants.js'
  import { setupCalListener, treesByDate } from './service.js'
  import { getGoogleEvents } from './gcalService.js'
  import { jumpToToday } from './autoScrolling.js'
  import { trackHeight } from '$lib/utils/svelteActions.js'
  import { onMount, getContext } from 'svelte'

  const { scrollCalRect } = getContext('drag-drop')

  let scrollParent

  let renderedColumnDTs = []
  let renderedLeft = Infinity
  let renderedRight = -Infinity
  let triggerLeft = -Infinity
  let triggerRight = Infinity

  let scrollX = Math.floor(TOTAL_COLUMNS / 2) * COLUMN_WIDTH // initially divergent from the UI

  $: viewportLeft = Math.floor(scrollX / COLUMN_WIDTH)
  $: viewportRight = Math.ceil((scrollX + window.innerWidth) / COLUMN_WIDTH)

  $: updateRenderedColumns(viewportLeft, viewportRight)
  
  $: if (viewportRight >= triggerRight) addFutureListener()
  $: if (viewportLeft <= triggerLeft) addPastListener()
  
  // Simple debounce to prevent excessive fetches while scrolling
  let fetchTimeout
  $: {
    const start = originDT.plus({ days: renderedLeft })
    const end = originDT.plus({ days: renderedRight })
    clearTimeout(fetchTimeout)
      fetchTimeout = setTimeout(() => {
       getGoogleEvents(start, end)
    }, 500)
  }

  onMount(() => {
    setupCalListener(
      originDT.plus({ days: viewportLeft - 2*c }),
      originDT.plus({ days: viewportRight + 2*c })
    )
    triggerLeft = viewportLeft - c
    triggerRight = viewportRight + c
    
    // quickfix, refactor into an action in the future perhaps
    scrollCalRect.set(
      () => scrollParent.getBoundingClientRect() // temporary,  () => {} is more robust across layout changes
    )
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

      renderedColumnDTs = Array.from(
        { length: renderedRight - renderedLeft + 1 },
        (_, i) => originDT.plus({ days: renderedLeft + i })
      )
    }
  }
</script>

{#if Object.keys($treesByDate).length > 0}
  <div class="relative z-0 grid" style="grid-template-rows: auto 1fr; height: 100%;">
    <YearAndMonthTile height={$headerHeight} {viewportLeft} {originDT} />

    <div id="scroll-parent" bind:this={scrollParent}
      use:jumpToToday class="relative hide-scrollbar cal-bg-color" style:overflow="auto" 
      on:scroll={e => scrollX = e.target.scrollLeft + $timestampsColumnWidth }
    >
      <div style:width="{TOTAL_COLUMNS * COLUMN_WIDTH}px" class="relative flexbox">
        <Timestamps class="sticky left-0" style="margin-top: {$headerHeight}px; height: {24 * $pixelsPerHour}px;"/>

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
  </div>
{/if}

<style>
  .pt-7 {
    padding-top: 7px; /* timestamp has a height of 14px (despite a font size of 12px), note: this means the island and the massive-content will have a height difference of 7 px */
  }

  .cal-bg-color {
    background-color: var(--calendar-bg-color);
  }
</style>