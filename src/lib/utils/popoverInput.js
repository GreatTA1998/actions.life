import { popoverTeleporter, globalInput, isInputActive, createFunc } from '$lib/store'
import { get } from 'svelte/store'

export function activateInput (anchorID, func) {
  createFunc.set(func)
  console.log('activateInput, anchorID =', anchorID)
  if (get(isInputActive)) {
    isInputActive.set(false)
  }
  else {
    const popover = get(popoverTeleporter)
    const input = get(globalInput)

    popover.style.positionAnchor = anchorID
    popover.showPopover()
    input.focus()
    isInputActive.set(true)
  }
}