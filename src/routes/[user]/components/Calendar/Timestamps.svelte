<script>
  import { pixelsPerHour, isCompact, timestampsColumnWidth } from './store.js'
  import { timestamps } from './timestamps.js'
  
  export let style

  function minutes (time) {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }
</script>

<div class="timestamps {$$props.class}"
  {style} style:width="{$timestampsColumnWidth}px" 
>
  {#each $timestamps as timestamp, i (i)}
    <div class="absolute timestamp" style="top: {minutes(timestamp) * ($pixelsPerHour / 60)}px;">
      {timestamp.substring(0, $isCompact ? 2 : 5)}
    </div>
  {/each}
</div>

<style>
  .timestamps {
    background: var(--calendar-bg-color);
    z-index: 2;
    border-right: 1px solid var(--faint-color);
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