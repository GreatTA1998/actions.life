import { writable } from 'svelte/store'
import { HEIGHTS } from '$lib/utils/constants.js'

export const headerExpanded = writable(true)
export const headerHeight = writable(HEIGHTS.CORNER_LABEL)

export const pixelsPerHour = writable(80)

export const isCompact = writable(false) 