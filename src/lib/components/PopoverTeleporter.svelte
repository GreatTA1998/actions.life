<script>
  import { popoverTeleporter, globalInput, isInputActive, createFunc } from '$lib/store'
  import { onMount } from 'svelte'

  let inputElem = $state(null)
  let popoverElem = $state(null)
  let positionAnchor = $state('--dropzone-root-last') // for testing
  let value = $state('')
  
  onMount(() => {
    popoverTeleporter.set(popoverElem)
    globalInput.set(inputElem)
  })

  function ontoggle (e) {
    if (e.newState === 'closed') {
      isInputActive.set(false)
    }
  }
</script>
  
<div bind:this={popoverElem}
  popover="auto"
  style="position-anchor: {positionAnchor};"
  class="my-popover"
  {ontoggle}
>
  <input bind:this={inputElem} 
    bind:value={value}
    onkeyup={e => {
      e.preventDefault()
      e.stopPropagation()
      if (e.key === 'Enter') {
        if (value === '') {
          popoverElem.hidePopover()
        } 
        else {
          $createFunc(value)
          value = ''
        }
      }
    }}
  >
</div>

<style>
  /* concepts: tethering, implicit/explicit anchor reference */
  .my-popover {
    position-area: center span-right;
    /* 
      bottom: calc(anchor(top) + 20px);
      justify-self: anchor-center; 
    */
    margin: 0;
    inset: auto;

    padding: 0;
    border: none;
    background: transparent;
    overflow-y: hidden; /** Safari-specific fix */
  }
</style>