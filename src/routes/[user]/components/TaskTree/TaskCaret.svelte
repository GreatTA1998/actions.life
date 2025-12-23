<script>
  import MslChevronRight from 'virtual:icons/material-symbols-light/chevron-right'
  import MslExpandMore from 'virtual:icons/material-symbols-light/expand-more'

  let {
    isCollapsed = false,
    onToggle = () => {},
    zoom = 1
  } = $props()
</script>

<button class="caret-button" onclick={onToggle} style="zoom: {zoom}; display: flex; align-items: center; justify-content: center;">
  <div class="caret-icon flexbox content-center">
    {#if isCollapsed}
      <MslChevronRight />
    {:else}
      <MslExpandMore />
    {/if}
  </div>
</button>

<style>
  .caret-button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 12.5px;
    width: 12.5px;
  }

  .caret-icon {
    font-size: 1.875rem;
    color: var(--fine-control-color);
    font-weight: 100;
    pointer-events: none; /* without this, the touch area for this button is based on this large icon, not the small button that contains it */
  }
</style> 