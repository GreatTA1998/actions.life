<script>
  export let i
  export let sorted
  export let dayDiffs
  export let pxPerDay
  export let timeMarkerTop
  export let squareHeight
</script>

<!-- vertical line -->
<svg
  style="position: absolute; top: 0; left: 50%; transform: translateX(-50%)" 
  width="1" 
  height={(dayDiffs[i] * pxPerDay) || 0}
>
  <line x1="0.5" y1="0" x2="0.5" y2="100%" stroke="#ddd" stroke-width="1" />
</svg>

<!-- edge case: top node -->
{#if i === 0}
  <div style="position: absolute; z-index: 2; top: {timeMarkerTop}px; left: 50%; transform: translateX(-50%);">
    <div class="marker-dot"></div>
  </div>

  <svg
    style="position: absolute; top: -6px; left: 50%; transform: translateX(-50%)" 
    width="1" 
    height={6}
  >
    <line x1="0.5" y1="0" x2="0.5" y2="100%" stroke="#ddd" stroke-width="1" />
  </svg>

<!-- edge case: bottom node -->
{:else if i === sorted.length - 1 && sorted[i].startDateISO}  
  <svg
    style="position: absolute; top: {squareHeight}px; left: 50%; transform: translateX(-50%)" 
    width="1" 
    height={6}
  >
    <line x1="0.5" y1="0" x2="0.5" y2="100%" stroke="#ddd" stroke-width="1" />
  </svg>
{/if}

<style>
  .marker-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background-color: var(--location-indicator-color, #ff5722);
  }
</style>