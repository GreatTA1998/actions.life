import { writable, derived } from 'svelte/store'
import { WIDTHS, HEIGHTS } from '$lib/utils/constants.js'

export const headerExpanded = writable(true)
export const headerHeight = writable(HEIGHTS.CORNER_LABEL)

export const pixelsPerHour = writable(80)

export const isCompact = writable(false) 

export const timestampsColumnWidth = derived(isCompact, $isCompact =>
  $isCompact ? WIDTHS.MOBILE_TIME_AXIS : WIDTHS.DESKTOP_TIME_AXIS
)