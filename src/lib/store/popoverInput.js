import { writable, get } from 'svelte/store'

export const isInputActive = writable(false)
export const popoverTeleporter = writable(null)
export const globalInput = writable(null)
export const callback = writable(() => {})
export const overrideOptions = writable({})

export function activateInput ({ anchorID, modifiers = {}, onCreate = () => {} }) {
  overrideOptions.set(modifiers)
  callback.set(onCreate)
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