<script>
  import { headerExpanded, headerHeight, tasksScheduledOn, isCompact } from '/src/store/calendarStore.js'
  import { WIDTHS } from '/src/helpers/constants.js'

  export let monthName
  export let viewportLeft
  export let originDT

  let exactWidth = $isCompact ? WIDTHS.MOBILE_TIME_AXIS : WIDTHS.DESKTOP_TIME_AXIS

  $: monthName = viewportLeft ? originDT.plus({ days: viewportLeft }).toFormat('LLL') : ''
  $: yearName = viewportLeft ? originDT.plus({ days: viewportLeft }).toFormat('yyyy') : ''
</script>

<div class="corner-label" style="
  height: {$headerHeight}px; 
  --timestamps-column-width: {exactWidth}px;"
>
  <div style="display: flex; justify-content: center;"
    class:mobile-compact={$isCompact}
    class:desktop-descriptive={!$isCompact}
  >
    <div style="color: rgb(0, 0, 0); font-weight: 400; display: inline-block;">
      {monthName}
    </div>

    {#if !$isCompact}
      <div style="font-weight: 200; margin-top: 2px; display: inline-block;">
        {yearName}
      </div>
    {/if}
  </div>

  {#if $tasksScheduledOn}
    <button on:click={() => headerExpanded.set(!$headerExpanded)}
      class="collapse-arrow material-symbols-outlined"
    >
      {$headerExpanded ? "expand_less" : "expand_more"}
    </button>
  {/if}
</div>

<style>
  .desktop-descriptive {
    font-size: 16px;
    margin-top: var(--height-main-content-top-margin); 
    margin-left: var(--width-calendar-left-padding);
    flex-direction: column;
  }

  .mobile-compact {
    font-size: 12px;
    margin-top: 12px;
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
    border-right: 1px solid lightgrey;
  }

  .collapse-arrow {
    position: absolute;
    bottom: 4px;
    left: 50%; /* moves the left edge of the arrow to the center */
    transform: translateX(-50%); /* shifts the arrow back by half its own width */
    right: auto;
    font-size: 26px;
    cursor: pointer;
    color: rgb(121, 121, 121);
    font-weight: 300;
  }
</style>
