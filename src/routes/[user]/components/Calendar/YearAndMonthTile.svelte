<script>
  import { isCompact, timestampsColumnWidth } from './store.js'

  let {
    viewportLeft,
    originDT,
    height
  } = $props()

  let currentDT = $derived(viewportLeft ? originDT.plus({ days: viewportLeft }) : originDT)
</script>

<div 
  class={['absolute top-0 left-0 z-3 select-none bg-[var(--cal-bg)]']}
  style:height="{height}px"
  style:width="{$timestampsColumnWidth}px"
  style:border-right="1px solid var(--faint-color)"
  style:box-shadow="0 3px 3px -2px rgba(0, 0, 0, 0.1)"
>
  <div 
    class={[
      'flex justify-center gap-y-0.5 text-md text-neutral-700',
      $isCompact
        ? 'flex-row mt-[8px] ml-0'
        : 'flex-col text-center mt-[var(--height-main-content-top-margin)]'
    ]}
  >
    <div class="uppercase">
      {currentDT.toFormat(!$isCompact ? 'LLL' : 'M')}
    </div>
    {#if !$isCompact}
      <div>
        {currentDT.toFormat('yyyy')}
      </div>
    {/if}
  </div>
</div>