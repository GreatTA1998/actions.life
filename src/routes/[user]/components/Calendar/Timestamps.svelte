<script>
  import { WIDTHS } from '/src/lib/utils/constants.js'
  import { timestamps, calEarliestHHMM, totalMinutes } from './timestamps.js'
  import { pixelsPerHour, headerHeight, isCompact } from './store.js'
  
  export let style

  let timestampsColumnWidth = $isCompact ? WIDTHS.MOBILE_TIME_AXIS : WIDTHS.DESKTOP_TIME_AXIS

  function getTopOffset (timestamp) {
    let origin = minutes($calEarliestHHMM)
    let minutesForm = minutes(timestamp)
    // Handle cases where timestamp is on the next day (after midnight)
    if (minutesForm < origin) minutesForm += 24 * 60

    return (minutesForm - origin) * ($pixelsPerHour / 60)
  }

  function minutes (time) {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }
</script>

<div class="timestamps {$$props.class}"
  {style} style:width="{timestampsColumnWidth}px" 
>
  {#each $timestamps as timestamp, i (i)}
    <div class="absolute timestamp" style="top: {getTopOffset(timestamp)}px;">
      {timestamp.substring(0, $isCompact ? 2 : 5)}
    </div>
  {/each}
</div>

<style>
  .timestamps {
    background: var(--calendar-bg-color);
    z-index: 2;
    border-right: 1px solid lightgrey;
  }

  .timestamp {
    width: 100%; /* because <div> no longer fills to its parent's width if it's absolutely positioned  */
    text-align: center;
    color: #6d6d6d;
    background-color: var(--calendar-bg-color);
    z-index: 2;
    font-size: 12px;
  }
</style> 