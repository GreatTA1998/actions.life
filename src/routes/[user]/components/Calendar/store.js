import { writable } from 'svelte/store'
import { HEIGHTS } from '/src/lib/utils/constants.js'

export const calendarTasks = writable([]) // deprecate, but needs about 5 minutes of work
export const treesByID = writable({})
export const treesByDate = writable({})

export const headerExpanded = writable(true)

export const pixelsPerHour = writable(80)

export const headerHeight = writable(HEIGHTS.CORNER_LABEL)

export const isCompact = writable(false) 