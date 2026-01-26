<script>
  import DropdownMenu from '$lib/components/DropdownMenu.svelte'
  import { 
    globalMenuPopover, globalInputPopover, globalInput, 
    isInputActive, callback, overrideOptions
  } from '$lib/store/popoverInput.js'
  import { getRandomID } from '$lib/utils/core';
  import { onMount, getContext } from 'svelte'

  const { Task } = getContext('app')

  let inputPopover = $state(null)
  let menuPopover = $state(null)
  let input = $state(null)
  let value = $state('')
  
  onMount(() => {
    globalInputPopover.set(inputPopover)
    globalMenuPopover.set(menuPopover)
    globalInput.set(input)
  })

  function ontoggle (e) {
    if (e.newState === 'closed') {
      setTimeout(
        () => {
          menuPopover.hidePopover() // otherwise clicking a menu item causes the input popover to get destroyed, which terminates the creation of the routine
          isInputActive.set(false)
        },
        300 // genius, delay the reset (iOS ontoggle resolves before click)
      )
    }
  }

  async function createTask (template = { name: value }) {
    const result = await Task.create({
      id: getRandomID(),
      newTaskObj: {
        ...template,
        ...$overrideOptions, // includes `persistsOnList`
        templateID: typeof template.rrStr === 'string' ? template.id : '' // this is a quickfix, careful about legacy routines with no `rrStr`
      }
    })
    value = ''
    $callback(result)
  }
</script>
  
<div bind:this={inputPopover}
  popover="auto"
  class="task-input"
  {ontoggle}
>
  <input
    style="width: 100%; height: 100%;" 
    bind:this={input} 
    bind:value={value}
    onkeyup={e => {
      e.preventDefault()
      e.stopPropagation()
      if (e.key === 'Enter') {
        if (value === '') inputPopover.hidePopover()
        else {
          createTask({ name: value })
          value = ''
        }
      }
    }}
    onblur={() => { // to detect iOS 26 keyboard exit via the "arrow" key 
      inputPopover.hidePopover()
    }}
  >
</div>

<div bind:this={menuPopover} 
  popover="manual" 
  class="menu-dropdown"
>
  <DropdownMenu 
    taskName={value} 
    onSelect={template => createTask(template)}
  />
</div>

<style>
  /* position-anchor is dynamically set by popoverInput.js */
  .task-input {
    position-area: center;
    width: anchor-size(width);
    height: anchor-size(height);

    background: transparent;
    overflow-y: hidden; /** Safari-specific fix */
  }

  .menu-dropdown {
    position: fixed; 
    top: anchor(bottom); 
    left: anchor(left);

    border-radius: 12px;
  }

  input:focus {
    outline: none; /* goes off screen despite `box-sizing: border-box` */
    border: 2px solid #2757cf;
    border-radius: 4px;
  }
</style>