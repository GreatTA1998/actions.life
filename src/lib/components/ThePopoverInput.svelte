<script>
  import PopoverInputDropdownMenu from '$lib/components/PopoverInputDropdownMenu.svelte'
  import { 
    activeAnchorID,
    popoverTeleporter, 
    globalInput, 
    isInputActive, 
    callback,
    overrideOptions
  } from '$lib/store/popoverInput.js'
  import { getRandomID } from '$lib/utils/core';
  import { onMount, getContext } from 'svelte'

  const { Task } = getContext('app')

  let inputElem = $state(null)
  let popoverElem = $state(null)
  let value = $state('')

  let menuPopover = $state(null)

  $effect(() => {
    if ($activeAnchorID) {
      menuPopover.showPopover()
    }
  })
  
  onMount(() => {
    popoverTeleporter.set(popoverElem)
    globalInput.set(inputElem)
  })

  function ontoggle (e) {
    if (e.newState === 'closed') {
      setTimeout(
        () => { 
          isInputActive.set(false)
          activeAnchorID.set('')
        },
        300
      )
    }
  }

  async function createTask (template = { name: value }) {
    const result = await Task.create({
      id: getRandomID(),
      newTaskObj: {
        ...template,
        ...$overrideOptions // includes `persistsOnList`
      }
    })
    value = ''
    $callback(result)
  }
</script>
  
<div bind:this={popoverElem}
  popover="auto"
  class="my-popover"
  {ontoggle}
>
  <input
    style="width: 100%; height: 100%;" 
    bind:this={inputElem} 
    bind:value={value}
    onkeyup={e => {
      e.preventDefault()
      e.stopPropagation()
      if (e.key === 'Enter') {
        if (value === '') {
          popoverElem.hidePopover()
        } 
        else {
          createTask({ name: value })
          value = ''
        }
      }
    }}
    onblur={() => { // to detect iOS 26 keyboard exit via the "arrow" key 
      popoverElem.hidePopover()
    }}
  >
</div>

{#if $activeAnchorID}
  <div bind:this={menuPopover} 
    popover="manual" style="

    margin: 0;
    inset: auto;

    padding: 0; /* default is 4px, resulting in a 8x8 box */
    border: none; /* default is black */

    position-anchor: {$activeAnchorID}; 
    position: fixed; 
    top: anchor(bottom); 
    left: anchor(left);
  "
  >
    <PopoverInputDropdownMenu 
      taskName={value} 
      onSelect={template => createTask(template)}
    />
  </div>
{/if}

<style>
  /* the anchor relationship is pragrammatically determined by popoverInput.js */
  .my-popover {
    position-area: center;

    margin: 0;
    inset: auto;

    padding: 0;
    border: none;
    background: transparent;
    overflow-y: hidden; /** Safari-specific fix */
  }

  input:focus {
    outline: none; /* goes off screen despite `box-sizing: border-box` */
    border: 2px solid #2757cf;
    border-radius: 4px;
  }
</style>