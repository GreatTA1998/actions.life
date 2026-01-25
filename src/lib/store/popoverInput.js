import { writable, get } from 'svelte/store'

export const globalInputPopover = writable(null)
export const globalMenuPopover = writable(null)
export const globalInput = writable(null)

export const activeAnchorID = writable('')
export const isInputActive = writable(false)
export const callback = writable(() => {})
export const overrideOptions = writable({})

export function activateInput ({ anchorID, modifiers = {}, onCreate = () => {} }) {
  if (get(isInputActive)) {
    isInputActive.set(false)
  }
  else {
    const inputPopover = get(globalInputPopover)
    const input = get(globalInput)
    const menuPopover = get(globalMenuPopover)

    inputPopover.style.positionAnchor = anchorID
    inputPopover.showPopover()
    menuPopover.showPopover()
    input.focus()

    isInputActive.set(true)
    activeAnchorID.set(anchorID)
    callback.set(onCreate)
    overrideOptions.set(modifiers)
  }
}