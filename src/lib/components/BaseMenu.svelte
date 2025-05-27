<script>
  import ModularLayer from '$lib/components/ModularLayer.svelte'

  export let isOpen = false
  export let position = { x: 0, y: 0 }
  export let zIndex = 3

  let menuElement

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

  function getAdjustedPosition (basePosition, menuElement) {
    if (!menuElement) return basePosition

    const rect = menuElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    let { x, y } = basePosition

    if (x > viewportWidth - rect.width) x = viewportWidth - rect.width
    if (x < 0) x = 0
    if (y + rect.height > viewportHeight) y = viewportHeight - rect.height
    if (y < 0) y = 0
    
    return { x, y }
  }

  $: adjustedPosition = getAdjustedPosition(position, menuElement)
</script>

<div>
  <slot {open} {close} {toggle}>

  </slot>

  {#if isOpen}
    <ModularLayer {zIndex} on:click-outside={close}>
      <div 
        bind:this={menuElement}
        class="card" 
        style="position: fixed; left: {adjustedPosition.x}px; top: {adjustedPosition.y}px;"
      >
        <slot name="content">

        </slot>
      </div>
    </ModularLayer>
  {/if}
</div>

<style>
  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    min-width: 180px;
    z-index: 1000;
  }
</style>