<script>
  export let i
  export let sorted
  export let dayDiffs
  export let pxPerDay
  export let timeMarkerTop
  export let squareHeight

  const lineColor = 'rgb(240, 240, 240)' // 'var(--fine-control-color)'
  const lineWidth = 1
</script>

<!-- vertical line -->
<svg
  style="position: absolute; top: 0; left: 50%; transform: translateX(-50%)" 
  width={lineWidth} 
  height={(dayDiffs[i] * pxPerDay) || 0}
>
  <line x1="0.5" y1="0" x2="0.5" y2="100%" stroke={lineColor} stroke-width={lineWidth} />
</svg>

<!-- edge case: top node -->
{#if i === 0}
  <!-- marker dot -->
  <div style="position: absolute; z-index: 2; top: {timeMarkerTop}px; left: 50%; transform: translateX(-50%);">
    <div class="marker-dot"></div>
  </div>

  <!-- top stem -->
  <svg
    style="position: absolute; top: -6px; left: 50%; transform: translateX(-50%)" 
    width={lineWidth} 
    height={6}
  >
    <line x1="0.5" y1="0" x2="0.5" y2="100%" stroke={lineColor} stroke-width={lineWidth} />
  </svg>
{/if}

<!-- 
  edge case: bottom node
  a node can be both the top and bottom, hence if-if instead of if-else
 -->
{#if i === sorted.length - 1 && sorted[i].startDateISO}  
  <!-- bottom stem -->
  <svg
    style="position: absolute; top: {squareHeight}px; left: 50%; transform: translateX(-50%)" 
    width={lineWidth} 
    height={6}
  >
    <line x1="0.5" y1="0" x2="0.5" y2="100%" stroke={lineColor} stroke-width={lineWidth} />
  </svg>
{/if}

<style>
  .marker-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: var(--location-indicator-color, #ff5722);
  }
</style>