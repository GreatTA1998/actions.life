<div
  bind:this={ReorderDropzone} 
  style="height: 12px; border-radius: 2px; border: 0px solid {colorForDebugging};" 
  on:dragenter={() => ReorderDropzone.style.background = 'rgb(87, 172, 247)' }
  on:dragleave={() => ReorderDropzone.style.background = '' }
  on:dragover={(e) => dragover_handler(e)}
  on:drop|stopPropagation={(e) => onReorderDrop(e)}
>

</div>

<script>
  import { createEventDispatcher } from "svelte"

  export let aboveOrder 
  export let belowOrder
  
  const dispatch = createEventDispatcher()
  let ReorderDropzone
  const colorForDebugging ="blue"

  function dragover_handler (e) {
    e.preventDefault()
    e.stopPropagation()
  }

  function onReorderDrop (e) {  
    const newVal = (aboveOrder + belowOrder) / 2
    dispatch('new-order-value', newVal)
    ReorderDropzone.style.background = ''
  }
</script>