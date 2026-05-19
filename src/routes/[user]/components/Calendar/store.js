import { writable, derived, get } from 'svelte/store'
import { WIDTHS, HEIGHTS } from '$lib/utils/constants.js'
import { user } from '$lib/store'

export const headerHeight = writable(HEIGHTS.CORNER_LABEL)

export const pixelsPerHour = derived(user, $user => $user.pixelsPerHour || 80)
export const calColumnWidth = derived(user, $user => $user.calColumnWidth || 260)

export const isCompact = writable(false) 

export const timestampsColumnWidth = derived(isCompact, $isCompact =>
  $isCompact ? WIDTHS.MOBILE_TIME_AXIS : WIDTHS.DESKTOP_TIME_AXIS
)