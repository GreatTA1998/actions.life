<script>
  import { WIDTHS } from '/src/helpers/constants.js'
  import { timestamps, calEarliestHHMM, totalMinutes } from '/src/store/calendarTimestamps.js'

  export let pixelsPerHour
  export let topMargin
  export let isCompact = false

  let timestampsColumnWidth = isCompact ? WIDTHS.MOBILE_TIME_AXIS : WIDTHS.DESKTOP_TIME_AXIS

  function getTopOffset (timestamp) {
    return (timeToMinutes(timestamp) - timeToMinutes($calEarliestHHMM)) * (pixelsPerHour / 60)
  }

  function timeToMinutes (time) {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }
</script>

<div class="timestamps" style="
  height: {$totalMinutes * (pixelsPerHour / 60)}px;
  --timestamps-column-width: {timestampsColumnWidth}px; 
  margin-top: {topMargin}px;
"
>
  {#each $timestamps as timestamp, i (timestamp)}
    <div class="absolute-timestamp" style="top: {getTopOffset(timestamp)}px;">
      {timestamp.substring(0, isCompact ? 2 : 5)}
    </div>
  {/each}
</div>

<style>
  .timestamps {
    position: sticky;
    left: 0;
    top: 40px; /* Adjust based on your header height */
    background: var(--calendar-bg-color);
    z-index: 2;
    border-right: 1px solid lightgrey;
    width: var(--timestamps-column-width);
  }

  .absolute-timestamp {
    position: absolute;
    width: 100%; /* because <div> no longer fills to its parent's width if it's absolutely positioned  */
    text-align: center;
    color: #6d6d6d;
    background-color: var(--calendar-bg-color);
    z-index: 2;
    font-size: 12px;
  }
</style> 