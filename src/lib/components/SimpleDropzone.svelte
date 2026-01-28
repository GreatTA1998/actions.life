<div
  bind:this={ReorderDropzone} 
  style="height: 12px; border-radius: 2px; border: 0px solid {debugColor};" 
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
  const debugColor = 'blue'

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
<!-- 
{#if i === 0}
<SimpleDropzone
  on:new-order-value={(e) => handleDrop(e.detail)}
  aboveOrder={0}
  belowOrder={templates[0].orderValue}
/> -->

<!-- {:else if i > 0 && i < templates.length}
<SimpleDropzone
  on:new-order-value={(e) => handleDrop(e.detail)}
  aboveOrder={templates[i - 1].orderValue}
  belowOrder={templates[i].orderValue}
/>
{/if} -->

<!-- 
<SimpleDropzone
  on:new-order-value={(e) => handleDrop(e.detail)}
  aboveOrder={templates[i].orderValue}
  belowOrder={templates[i].orderValue + 1}
/>  -->