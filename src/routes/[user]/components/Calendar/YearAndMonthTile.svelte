<script>
  import { headerExpanded, isCompact } from './store.js'
  import { treesByDate } from './service.js'
  import { WIDTHS } from '$lib/utils/constants.js'
  import { DateTime } from 'luxon'
  import MslExpandLess from 'virtual:icons/material-symbols-light/expand-less'
  import MslExpandMore from 'virtual:icons/material-symbols-light/expand-more'

  let {
    viewportLeft,
    originDT,
    height
  } = $props()

  let exactWidth = $derived($isCompact ? WIDTHS.MOBILE_TIME_AXIS : WIDTHS.DESKTOP_TIME_AXIS)
  let currentDT = $derived(viewportLeft ? originDT.plus({ days: viewportLeft }) : originDT)
</script>

<div 
  class="corner-label select-none" 
  style="
    height: {height}px; 
    --timestamps-column-width: {exactWidth}px;
  "
>
  <div 
    style="
      display: flex; justify-content: center; row-gap: 2px;
      color: {currentDT.toFormat('yyyy-MM') <= DateTime.now().toFormat('yyyy-MM') ? 'black' : '#6d6d6d'};
    "
    class:mobile-compact={$isCompact}
    class:desktop-descriptive={!$isCompact}
  >
    <div>
      {currentDT.toFormat(!$isCompact ? 'LLL' : 'M')}
    </div>
    {#if !$isCompact}
      <div>
        {currentDT.toFormat('yyyy')}
      </div>
    {/if}
  </div>

  <!-- {#if $treesByDate}
    <button onclick={() => headerExpanded.set(!$headerExpanded)}
      class="collapse-arrow"
    >
      {#if $headerExpanded}
        <MslExpandLess style="font-size: 26px;"/>
      {:else}
        <MslExpandMore style="font-size: 26px;"/>
      {/if}
    </button>
  {/if} -->
</div>

<style>
  .desktop-descriptive {
    font-size: 16px;
    margin-top: var(--height-main-content-top-margin); 
    margin-left: var(--width-calendar-left-padding);
    flex-direction: column;
  }

  .mobile-compact {
    font-size: 15px;
    margin-top: 8px; /* consistent with calendar headers */
    margin-left: 0px;
    flex-direction: row;
  }

  .corner-label {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;

    width: var(--timestamps-column-width);
    background: var(--calendar-bg-color);

    box-shadow: 0 3px 3px -2px rgba(0, 0, 0, 0.1);
    border-right: 1px solid var(--faint-color);
  }

  .collapse-arrow {
    position: absolute;
    bottom: 4px;
    left: 50%; /* moves the left edge of the arrow to the center */
    transform: translateX(-50%); /* shifts the arrow back by half its own width */
    right: auto;
    font-size: 26px;
    cursor: pointer;
    color: var(--fine-control-color);
    font-weight: 200;
  }
</style>
