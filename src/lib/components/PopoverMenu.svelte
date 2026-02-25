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
    menu?.hidePopover() // client components use 300ms delays so `?` is necessary
  }
</script>

{@render activator({ id, anchorName, close })}

<div popover {id} {ontoggle} bind:this={menu}
  class="absolute rounded-xl pragmatic-shadow"
  style:position-anchor={anchorName}
  style:position-area="block-end span-inline-end"
  style:position-try-fallbacks="flip-block, flip-inline, flip-inline flip-block"
>
  {@render content({ close })}
</div>