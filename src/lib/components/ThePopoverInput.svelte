<script>
  import PopoverInputDropdownMenu from '$lib/components/PopoverInputDropdownMenu.svelte'
  import { 
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

  async function createTask (template = { name: value }) {
    const result = await Task.create({
      id: getRandomID(),
      newTaskObj: {
        ...template,
        ...$overrideOptions // includes `persistsOnList`
      }
    })
    $callback(result)
  }
</script>
  
<div bind:this={popoverElem}
  popover="auto"
  style="position-anchor: {positionAnchor};"
  class="my-popover"
  {ontoggle}
>
  <!-- 
  <MyInput value={taskName}
    {oninput}
    {onEnterPress}
    width="var(--width-within-column)"
  />
   -->
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
    onblur={() => popoverElem.hidePopover}
  >

  <PopoverInputDropdownMenu 
    taskName={value} 
    onSelect={template => createTask(template)}
  />
</div>

<style>
  /* concepts: tethering, implicit/explicit anchor reference */
  .my-popover {
    position-area: center;
    /* position-area: center span-right;/*
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

  /* input:focus {
    outline: none; 
    border: 2px solid #2757cf;
    border-radius: 4px;
  } */
</style>