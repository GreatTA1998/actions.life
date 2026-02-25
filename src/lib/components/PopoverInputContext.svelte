<script>
  import DropdownMenu from '$lib/components/DropdownMenu.svelte'
  import { instantiateTree } from '/src/routes/[user]/components/Templates/components/TemplatePopup/instances.js'
  import { getRandomID } from '$lib/utils/core'
  import { getContext, setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import { noZoomFS } from '$lib/styles/reused.module.css'

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
    activateInput,
    overrideOptions
  })

  function activateInput ({ anchorID, modifiers = {}, onCreate = () => {} }) {
    if (inputActive) inputActive = false
    else {
      // note: although using an anchor variable is more readable, the store-level update would be batched, causing synchronicity issues with focus etc.
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
          menuPopover?.hidePopover() // otherwise clicking a menu item causes the input popover to get destroyed, which terminates task creation
          inputActive = false
        },
        300 // genius, delay the reset (iOS ontoggle resolves before click)
      )
    }
  }

  async function onkeydown (e) {
    if (e.key === 'Enter') {
      if (e.isComposing) return // IME (Input Method Editors), we use keydown to avoid the exhaustive solution mentioned in this article: https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/
      else if (value === '') inputPopover.hidePopover()
      else {
        createTask(value)
      }
    }
  }

  async function createTask (name) {
    const result = await Task.create({
      id: getRandomID(),
      data: {
        ...$overrideOptions, // includes `persistsOnList`
        name
      }
    })
    $callback(result)
    value = ''
  }
</script>

{@render children()}

<div {ontoggle} bind:this={inputPopover} popover="auto" class="task-input">
  <input 
    bind:this={input} bind:value
    {onkeydown} onblur={() => inputPopover.hidePopover()}
    class="w-full h-full rounded"
    style:font-size="clamp({noZoomFS}, 40cqb, 2rem)"
  >
  <!-- 1. `onblur` detects iOS 26 keyboard exit via the "arrow" key. 2. Must use a () => function as inputPopover is not defined when attached -->
</div>

<div bind:this={menuPopover} popover="manual" class="menu-dropdown">
  <DropdownMenu 
    taskName={value} 
    onSelect={async (template) => {
      const result = await instantiateTree({ template, modifiers: $overrideOptions })
      $callback(result)
      value = ''
    }}    
  />
</div>

<style>
  .task-input {
    position-area: center;
    width: anchor-size(width);
    height: anchor-size(height);
    container-type: size;

    background: transparent;
    overflow-y: hidden; /** Safari-specific fix */
  }

  input:focus {
    border: 2px solid #2757cf;
  }

  .menu-dropdown {
    position: fixed; 
    top: anchor(bottom); 
    left: anchor(left);

    border-radius: 12px;
  }
</style>