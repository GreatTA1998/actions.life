<script>
  let { activator, content, menuClasses = 'card', menuStyles } = $props()

  let popoverElem = $state(null)

  async function toggle () {
    popoverElem.togglePopover()
  }

  function open () {
    popoverElem.showPopover()
  }

  function close () {
    popoverElem.hidePopover()
  }
</script>

{@render activator({ open, close, toggle })}

<div bind:this={popoverElem}
  popover="auto" 
  style={menuStyles}
  class={menuClasses}
>
  {@render content({ open, close, toggle })}
</div>

<style>
  .card {
    background: white;
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    min-width: 180px;
    z-index: 1000;
  }
</style>