<!-- {timeIndicatorOffset} -->
<div class="current-time-indicator-container" 
  style="top: {timeIndicatorOffset}px"
> 
  <hr 
    style="border: 2px solid var(--location-indicator-color); border-radius: 5px; width: 100%; margin-top: 0px; margin-bottom: 0px;"
    bind:this={CurrentTimeIndicator}
  > 
  <div style="font-size: 12px; color: var(--location-indicator-color); font-weight: 600;">
    {currentTimeString}
  </div>
</div>

<script>
  import { DateTime, Interval } from 'luxon'
  import { onMount, onDestroy } from 'svelte'
  import { hasInitialScrolled } from '/src/store'

  export let pixelsPerMinute
  export let originDT

  let CurrentTimeIndicator
  let intervalID = ''
  let timeIndicatorOffset
  let currentTimeString

  // this reacts to the Home icon click which resets us back to today's position

  // pase a function directly into a store to be called
  // scrollToCurrentDay()
  // but a boolean is helpful for disabling the intersection observer

  $: if (!$hasInitialScrolled && CurrentTimeIndicator) {
    requestAnimationFrame(() => {
      scrollToTimeIndicator()
    })
  }

  onMount(() => {
    updateTimeIndicator() 
    intervalID = setInterval(updateTimeIndicator, 1000)
  })

  onDestroy(() => {
    clearInterval(intervalID)
  })

  function scrollToTimeIndicator () {
    CurrentTimeIndicator.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' })
    requestAnimationFrame(() => {
      hasInitialScrolled.set(true)
    })
  }

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
    display: block; 
    align-items: center;
    position: absolute; 
    width: var(--width-calendar-day-section);
    pointer-events: none;
  }
</style>
