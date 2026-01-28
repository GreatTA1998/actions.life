<script>
  import { getRandomID } from '$lib/utils/core.js'

  let { 
    activator, 
    content,
    ontoggle = () => {},
    id = getRandomID()
  } = $props()

  let popoverElem = $state(null)

  function open (e) {
    popoverElem.showPopover()
  }

  function close () {
    popoverElem.hidePopover()
  }
</script>

{@render activator({ open, close, popovertarget: id })}

<div {id} bind:this={popoverElem}
  popover="auto"
  style="
    position: absolute;
    position-anchor: --anchor-{id};
    position-area: right span-bottom;
    position-try-fallbacks: flip-block, flip-inline, flip-inline flip-block;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); 
  "
  {ontoggle}
>
  {@render content({ open, close, popovertarget: id })}
</div>