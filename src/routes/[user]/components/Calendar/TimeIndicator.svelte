<div class="current-time-indicator-container" 
  style="top: {timeIndicatorOffset}px;"
> 
  <hr style="border: 2px solid var(--location-indicator-color); border-radius: 5px; width: 100%; margin-top: 0px; margin-bottom: 0px;"> 
  <div style="font-size: 12px; color: var(--location-indicator-color); font-weight: 600;">
    {currentTimeString}
  </div>
</div>

<script>
  import { DateTime, Interval } from 'luxon'
  import { onMount, onDestroy } from 'svelte'

  export let pixelsPerMinute
  export let originDT

  let intervalID = ''
  let timeIndicatorOffset
  let currentTimeString

  onMount(() => {
    updateTimeIndicator() 
    intervalID = setInterval(updateTimeIndicator, 1000)
  })

  onDestroy(() => {
    clearInterval(intervalID)
  })

  function updateTimeIndicator () {
    timeIndicatorOffset = computeTimeIndicatorOffset()
    currentTimeString = DateTime.now().toLocaleString(DateTime.TIME_24_SIMPLE)
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

<style>
  .current-time-indicator-container {
    position: absolute; 
    width: var(--width-calendar-day-section);
    pointer-events: none;
  }
</style>