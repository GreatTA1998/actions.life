<script>
  import { randomID } from '$lib/utils/core.js'

  let { 
    activator, 
    content,
    ontoggle = () => {},
    id = randomID(),
    positionArea = 'block-end span-inline-end'
  } = $props()

  let menu = $state(null)
  let anchorName = $derived(`--anchor-${id}`)

  // Prefer this over button.click() or nested-input popovertarget:
  // WebKit ignores popovertarget on nested <input>; button.click() double-toggles in Chrome 157+.
  function open () {
    menu?.showPopover()
  }

  function close () {
    menu?.hidePopover() // client components use 300ms delays so `?` is necessary
  }
</script>

{@render activator({ id, anchorName, close, open })}

<div popover {id} {ontoggle} bind:this={menu} class="fixed rounded-xl pragmatic-shadow"
  style:position-anchor={anchorName}
  style:position-area={positionArea}
  style:position-try-fallbacks="flip-block, flip-inline, flip-inline flip-block"
>
  {@render content({ close })}
</div>