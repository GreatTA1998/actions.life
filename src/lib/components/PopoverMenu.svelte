<script>
  let popoverElement

  async function toggle () {
    popoverElement.togglePopover()
  }

  function open () {
    popoverElement.showPopover()
  }

  function close () {
    popoverElement.hidePopover()
  }
</script>

<slot {open} {close} {toggle}>

</slot>

<div bind:this={popoverElement}
  popover="auto" 
  class="card"
>
  <slot name="content">

  </slot>
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