{#each columnDTs as dt, i (dt.toMillis())}
  {#if now?.hasSame(dt, 'day')}
<div class="absolute pointer-events-none" 
  style:top="{now.diff(dt, 'minutes').minutes * $pixelsPerHour / 60}px"
  style:left="{i * $calColumnWidth}px"
  style:width="{$calColumnWidth}px"
> 
  <hr style="border: 2px solid var(--location-indicator-color); border-radius: 5px; width: 100%; margin-top: 0px; margin-bottom: 0px;"> 
  <div class="text-xs font-semibold text-[var(--location-indicator-color)]">
    {now.toLocaleString(DateTime.TIME_24_SIMPLE)}
  </div>
</div>
  {/if}
{/each}

<script>
  import { DateTime } from 'luxon'
  import { onMount, onDestroy } from 'svelte'
  import { calColumnWidth, pixelsPerHour } from './store.js'

  let { columnDTs } = $props()

  let intervalID = ''
  let now = $state(null)

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
