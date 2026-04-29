<script>
  import DropdownMenu from '$lib/components/DropdownMenu.svelte'
  import { randomID } from '$lib/utils/core'
  import { getContext, setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import { noZoomFS } from '$lib/styles/reused.module.css'

  let { children } = $props()

  const { Task, Template } = getContext('app')

  let inputActive = $state(false)
  let inputPopover = $state(null)
  let menuPopover = $state(null)

  let input = $state(null)
  let value = $state('')
  let derivedTask = $derived({
    ...$overrideOptions,
    name: value
  })

  const overrideOptions = writable({})
  const callback = writable(() => {})

  setContext('popover-input', {
    activateInput,
    overrideOptions
  })

  function activateInput ({ anchorID, modifiers = {}, onCreate = () => {} }) {
    if (inputActive) inputActive = false
    else {
      // note: using an anchor variable would be more readable, but the store-level update would be batched, causing synchronicity issues with focus etc.
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
      menuPopover.hidePopover() // otherwise `:popover-open` on the menu interferes with BasePopup's ESC logic, even if menu is invisible either way to the user
      onPopoverClose()
    }
  }

  async function onPopoverClose () {
    if (value) {
      Task.create({ id: randomID(), data: derivedTask })
      value = '' 
    }
    setTimeout(() => inputActive = false, 300) // delay necessary for iOS where `ontoggle` resolves before `onclick`
  }

  async function onEnter () {
    if (value === '') inputPopover.hidePopover()
    else {
      const result = await Task.create({ id: randomID(), data: derivedTask })
      $callback(result)
      value = '' 
    }
  }

  async function onTemplateClick (template) {
    input.focus() // we lost focus clicking the menu item (reminder: must be synchronous)
    value = ''
    const result = await Template.instantiateTree({ template, modifiers: $overrideOptions })
    $callback(result)
  }
</script>

{@render children()}

<!-- `overflow-y-hidden` is a Safari quickfix -->
<div {ontoggle}
  bind:this={inputPopover} 
  popover="auto"
  class="bg-transparent overflow-y-hidden"
  style:position-area="center"
  style:width="anchor-size(width)"
  style:height="anchor-size(height)"
  style:container-type="size"
>
  <!-- `e.isComposing`: IME (Input Method Editors), we use keydown to avoid the exhaustive solution mentioned here: https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/ -->
  <input bind:this={input} 
    bind:value
    onkeydown={e => e.key === 'Enter' && !e.isComposing && onEnter() } 
    class="w-full h-full rounded [border:2px_solid_#2757cf]"
    style:font-size="clamp({noZoomFS}, 40cqb, 2rem)"
  >

  <div bind:this={menuPopover} 
    popover="manual" 
    class="fixed rounded-xl" 
    style:top="anchor(bottom)" 
    style:left="anchor(left)"
  >
    <DropdownMenu 
      taskName={value} 
      onSelect={template => onTemplateClick(template)}    
    />
  </div>
</div>