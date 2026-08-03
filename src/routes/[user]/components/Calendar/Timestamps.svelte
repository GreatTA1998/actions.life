<script>
  import { pixelsPerHour, isCompact, timestampsColumnWidth } from './store.js'
  import { timestamps } from './timestamps.js'
  import { minutes } from '$lib/utils/core.js'
  
  let {
    style,
    class: className
  } = $props()
</script>

<div class={['timestamps bg-[var(--cal-bg)] z-2', className]}
  {style} 
  style:width="{$timestampsColumnWidth}px" 
  style:border-right="1px solid var(--faint-color)"
>
  {#each $timestamps as timestamp, i (i)}
    <div 
      class={[
        'absolute z-2 left-0 right-0 text-center',
        'text-xs text-neutral-700 bg-[var(--cal-bg)] select-none'
      ]} 
      style="top: {minutes(timestamp) * ($pixelsPerHour / 60)}px;"
    >
      {timestamp.substring(0, $isCompact ? 2 : 5)}
    </div>
  {/each}
</div>