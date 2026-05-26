<script>
  import Timestamps from './Timestamps.svelte'
  import DayColumn from './DayColumn.svelte'
  import DayHeader from './DayHeader.svelte'
  import YearAndMonthTile from './YearAndMonthTile.svelte'

  import { createCalendarService } from './service-v2'
  import { originDT, TOTAL_COLUMNS } from './constants.js'
  import { headerHeight, pixelsPerHour, timestampsColumnWidth, calColumnWidth } from './store.js'
  import { getAllGCalEvents } from '$lib/features/google-calendar/gcal.js'
  import { jumpToToday } from './autoScrolling.js'
  import { trackHeight } from '$lib/utils/svelteActions.js'
  import { onMount, getContext } from 'svelte'

  const { scrollCalRect } = getContext('drag-drop')
  const { treesByDate, treesByID } = getContext('app')
  
  const { setupCalListener } = createCalendarService({ treesByDate, treesByID })

  const c = 4 // for "cushion"
  const COLUMN_WIDTH = $calColumnWidth

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

  onMount(async () => {
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

    getAllGCalEvents(
      originDT.plus({ days: viewportLeft - 2*c }),
      originDT.plus({ days: viewportRight + 2*c })
    )
  })

  function addFutureListener () {
    setupCalListener(
      originDT.plus({ days: (triggerRight + c) + 1 }),
      originDT.plus({ days: (triggerRight + c) + 1 + 2*c }) 
    )
    getAllGCalEvents(
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
    getAllGCalEvents(
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
  <div 
    class="relative z-0 grid h-full" 
    style="grid-template-rows: auto 1fr; view-transition-name: calendar; view-transition-class: static-ui;"
  >
    <YearAndMonthTile height={$headerHeight} {viewportLeft} {originDT} />

    <div id="scroll-parent" bind:this={scrollParent}
      use:jumpToToday class="relative hide-scrollbar bg-[var(--cal-bg)]" style:overflow="auto" 
      on:scroll={e => scrollX = e.target.scrollLeft + $timestampsColumnWidth }
    >
      <div style:width="{TOTAL_COLUMNS * COLUMN_WIDTH}px" class="relative flex">
        <Timestamps class="sticky left-0" style="margin-top: {$headerHeight}px; height: {24 * $pixelsPerHour}px;"/>

        {#if renderedColumnDTs[0]}
          <div class="absolute" style:left="{renderedColumnDTs[0].diff(originDT, 'days').days * COLUMN_WIDTH}px">
            <div class="sticky top-0 z-1 flex" use:trackHeight={h => headerHeight.set(h)} style="box-shadow: 0 3px 3px -2px rgba(0, 0, 0, 0.1);">
              {#each renderedColumnDTs as dt (dt.toMillis())}
                <DayHeader {dt} />
              {/each}
            </div>

            <!-- timestamp has a height of 14px (despite a font size of 12px), note: this means the island and the massive-content will have a height difference of 7 px -->
            <div class="flex pt-[7px]">
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