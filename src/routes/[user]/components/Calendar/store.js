import { writable, derived, get } from 'svelte/store'
import { WIDTHS, HEIGHTS, calendarDensity } from '$lib/utils/constants.js'
import { user } from '$lib/store'

export const headerHeight = writable(HEIGHTS.CORNER_LABEL)

export const pixelsPerHour = derived(user, $user => $user.pixelsPerHour || calendarDensity.wide.pixelsPerHour)
export const calColumnWidth = derived(user, $user => $user.calColumnWidth || calendarDensity.wide.calColumnWidth)

export const isCompact = writable(false) 

export const timestampsColumnWidth = derived(isCompact, $isCompact =>
  $isCompact ? WIDTHS.MOBILE_TIME_AXIS : WIDTHS.DESKTOP_TIME_AXIS
)

export function calBodyClip (scrollRect, timestampsW, headerH) {
  return {
    left: scrollRect.left + timestampsW,
    right: scrollRect.right,
    top: scrollRect.top + headerH,
    bottom: scrollRect.bottom
  }
}

export function calHeaderClip (scrollRect, timestampsW, headerH) {
  return {
    left: scrollRect.left + timestampsW,
    right: scrollRect.right,
    top: scrollRect.top,
    bottom: scrollRect.top + headerH
  }
}