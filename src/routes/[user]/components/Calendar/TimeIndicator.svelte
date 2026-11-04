{#if todayIndex >= 0}
<div class="absolute pointer-events-none" 
  style:top="{timeIndicatorOffset}px"
  style:left="{todayIndex * $calColumnWidth}px"
  style:width="{$calColumnWidth}px"
> 
  <hr style="border: 2px solid var(--location-indicator-color); border-radius: 5px; width: 100%; margin-top: 0px; margin-bottom: 0px;"> 
  <div class="text-xs font-semibold text-[var(--location-indicator-color)]">
    {currentTimeString}
  </div>
</div>
{/if}

<script>
  import { DateTime } from 'luxon'
  import { onMount, onDestroy } from 'svelte'
  import { calColumnWidth, pixelsPerHour } from './store.js'

  let { columnDTs } = $props()

  let intervalID = ''
  let now = $state(null)
  let todayIndex = $derived(now ? columnDTs.findIndex(dt => dt.hasSame(now, 'day')) : -1)
  let timeIndicatorOffset = $derived(
    now && todayIndex >= 0
      ? now.diff(columnDTs[todayIndex], 'minutes').minutes * $pixelsPerHour / 60
      : 0
  )
  let currentTimeString = $derived(now ? now.toLocaleString(DateTime.TIME_24_SIMPLE) : '')

  onMount(() => {
    updateTimeIndicator() 
    intervalID = setInterval(updateTimeIndicator, 1000)
  })

  onDestroy(() => {
    clearInterval(intervalID)
  })

  function updateTimeIndicator () {
    now = DateTime.now()
  }
</script>
