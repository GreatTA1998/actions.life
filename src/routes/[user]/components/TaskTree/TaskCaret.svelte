<script>
  import MslChevronRight from 'virtual:icons/material-symbols-light/chevron-right'
  import MslExpandMore from 'virtual:icons/material-symbols-light/expand-more'

  let {
    isCollapsed = false,
    onToggle = () => {},
    fontSize = '1rem'
  } = $props()

  function animatedToggle () {
    document.startViewTransition(onToggle)
  }
</script>

<button class="flex items-center justify-center" onclick={animatedToggle}
  style:width={fontSize} style:height={fontSize}
>
  <!-- without pointer-events: none, the touch area for this button is based on this large icon, not the small button that contains it -->
  <div 
    style:font-size="calc(2 * {fontSize})" 
    class="shrink-0 flex items-center text-[var(--fine-control-color)] pointer-events-none"
  >
    {#if isCollapsed}
      <MslChevronRight />
    {:else}
      <MslExpandMore />
    {/if}
  </div>
</button>