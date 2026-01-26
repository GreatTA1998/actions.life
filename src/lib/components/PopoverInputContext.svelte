<script>
  import DropdownMenu from '$lib/components/DropdownMenu.svelte'
  import { getRandomID } from '$lib/utils/core';
  import { getContext, setContext } from 'svelte'
  import { writable } from 'svelte/store'

  let { children } = $props()

  const { Task } = getContext('app')

  let inputActive = $state(false)
  let inputPopover = $state(null)
  let menuPopover = $state(null)
  let input = $state(null)
  let value = $state('')

  const overrideOptions = writable({})
  const callback = writable(() => {})

  setContext('popover-input', {
    inputActive: () => inputActive,
    activateInput,
    overrideOptions
  })

  function activateInput ({ anchorID, modifiers = {}, onCreate = () => {} }) {
    if (inputActive) inputActive = false
    else {
      // note: although using an anchor variable is more readable, the update gets batched causing synchronicity issues with focus etc.
      inputPopover.style.positionAnchor = anchorID 
      menuPopover.style.positionAnchor = anchorID
      inputPopover.showPopover()
      menuPopover.showPopover()
      input.focus()

      inputActive = true
      callback.set(onCreate)
      overrideOptions.set(modifiers)
    }
  }

  function ontoggle (e) {
    if (e.newState === 'closed') {
      setTimeout(
        () => {
          menuPopover.hidePopover() // otherwise clicking a menu item causes the input popover to get destroyed, which terminates the creation of the routine
          inputActive = false
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

  function onkeyup (e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.key === 'Enter') {
      if (value === '') inputPopover.hidePopover()
      else {
        createTask({ name: value })
        value = ''
      }
    }
  }
</script>

<div>
  {@render children()}

  <div bind:this={inputPopover}
    popover="auto"
    class="task-input"
    {ontoggle}
  >
    <input
      style="width: 100%; height: 100%;" 
      bind:this={input} 
      bind:value={value}
      {onkeyup}
      onblur={() => { 
        inputPopover.hidePopover()
      }}
    >
    <!--
      onblur: detects iOS 26 keyboard exit via the "arrow" key 
      must use a () => function as inputPopover is not defined when attached
    -->
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