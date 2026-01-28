<script>
  import { getRandomID } from '$lib/utils/core.js'

  let { 
    activator, 
    content,
    ontoggle = () => {},
    id = getRandomID()
  } = $props()

  let menu = $state(null)
  let anchorName = $derived(`--anchor-${id}`)

  function close () {
    menu.hidePopover()
  }
</script>

{@render activator({ id, anchorName })}

<div popover {id} {ontoggle}
  bind:this={menu}
  class="absolute"
  style:position-anchor={anchorName}
  style:position-area="right span-bottom"
  style:position-try-fallbacks="flip-block, flip-inline, flip-inline flip-block"
  style="
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); 
  "
>
  {@render content({ close })}
</div>