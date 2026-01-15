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
    margin: 0;
    inset: auto;
    position: absolute;
    position-anchor: --anchor-{id};
    position-area: right span-bottom;
    position-try-fallbacks: flip-block, flip-inline, flip-inline flip-block;
  "
  {ontoggle}
  class="card"
>
  {@render content({ open, close, popovertarget: id })}
</div>

<style>
  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: none;
  }
</style>