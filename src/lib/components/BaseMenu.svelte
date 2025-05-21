<script>
  import ModularLayer from '$lib/components/ModularLayer.svelte'

  export let isOpen = false
  export let position = { x: 0, y: 0 }
  export let zIndex = 3

  function toggle (e) {
    if (!isOpen) open (e) 
    else close()
  }

  function open (e) {
    isOpen = true
    position = { x: e.clientX, y: e.clientY + 8 }
  }

  function close () {
    isOpen = false
  }
</script>

<div>
  <slot {open} {close} {toggle}>

  </slot>

  {#if isOpen}
    <ModularLayer {zIndex} on:click-outside={close}>
      <div class="card" style="left: {position.x}px; top: {position.y}px;">
        <slot name="content">

        </slot>
      </div>
    </ModularLayer>
  {/if}
</div>

<style>
  .card {
    position: fixed;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    min-width: 180px;
    z-index: 1000;
  }
</style>