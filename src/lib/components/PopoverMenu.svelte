<script>
  import { getRandomID } from '$lib/utils/core.js'

  let { activator, content, menuClasses = 'card', menuStyles } = $props()

  const id = getRandomID()
  let popoverElem = $state(null)
  let position = $state({ x: 0, y: 0 })
  let adjustedPosition = $derived(getAdjustedPosition(position, popoverElem))

  function getAdjustedPosition (basePosition, elem) {
    if (!elem) return basePosition

    const rect = elem.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    let { x, y } = basePosition

    if (x > viewportWidth - rect.width) x = viewportWidth - rect.width
    if (x < 0) x = 0
    if (y + rect.height > viewportHeight) y = viewportHeight - rect.height
    if (y < 0) y = 0
    
    return { x, y }
  }

  function setPosition (e) {
    position = { x: e.clientX, y: e.clientY + 8 }
  }

  function open (e) {
    popoverElem.showPopover()
    setPosition(e)
  }

  function close () {
    popoverElem.hidePopover()
  }
</script>


{@render activator({ open, close, setPosition, popovertarget: id })}

<div {id} bind:this={popoverElem}
  popover="auto"
  style='{menuStyles} left: {adjustedPosition.x}px; top: {adjustedPosition.y}px; margin: 0; padding: 0;'
  class={menuClasses}
>
  {@render content({ open, close, setPosition })}
</div>

<style>
  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: none;
  }
</style>