<div class="absolute pointer-events-none" 
  style:top="{timeIndicatorOffset}px"
  style:width="{$calColumnWidth}px"
> 
  <hr style="border: 2px solid var(--location-indicator-color); border-radius: 5px; width: 100%; margin-top: 0px; margin-bottom: 0px;"> 
  <div class="text-xs font-semibold text-[var(--location-indicator-color)]">
    {currentTimeString}
  </div>
</div>

<script>
  import { DateTime, Interval } from 'luxon'
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import { calColumnWidth } from './store.js'
  import { now } from './now.js'

  let {
    pixelsPerMinute, 
    originDT
  } = $props()

  let intervalID = ''
  let timeIndicatorOffset = $state(0)
  let currentTimeString = $state('')

  onMount(() => {
    updateTimeIndicator() 
    intervalID = setInterval(updateTimeIndicator, 1000)
  })

  onDestroy(() => {
    clearInterval(intervalID)
  })

  function updateTimeIndicator () {
    const next = DateTime.now()
    if (!get(now).hasSame(next, 'day')) now.set(next)
    timeIndicatorOffset = computeTimeIndicatorOffset()
    currentTimeString = next.toLocaleString(DateTime.TIME_24_SIMPLE)
  }

  function computeTimeIndicatorOffset () {
    const i = Interval.fromDateTimes(
      originDT,
      DateTime.now()
    )
    const minutesDifference = i.length() / (1000 * 60)
    return minutesDifference * pixelsPerMinute
  } 
</script>