<script>
  import { onMount } from 'svelte'

  let {
    willOpen = false,
    activator,
    content
  } = $props()

  let popover = $state(null)
  let inputButton = $state(null)

  function setButtonRef(node) {
    inputButton = node
    return {
      update(newNode) {
        inputButton = newNode
      },
      destroy() {
        inputButton = null
      }
    }
  }

  function ontoggle(e) {
    if (e.newState === 'open' && popover && inputButton) {
      const rect = inputButton.getBoundingClientRect()
      popover.style.top = `${rect.bottom + 4}px`
      popover.style.left = `${rect.left}px`
    }
  }

  onMount(() => {
    if (willOpen && popover) {
      popover.showPopover()
    }
  })

  function close() {
    if (popover) popover.hidePopover()
  }
</script>

{@render activator({ setButtonRef, close })}

<div
  bind:this={popover}
  id="popover"
  popover="auto"
  class="popover"
  {ontoggle}
>
  {@render content({ close })}
</div>

<style>
  .popover {
    position: fixed;
    inset: none;
    margin: 0;
    padding: 0;
    border: none;
    background: var(--popup-bg, white);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
</style>

