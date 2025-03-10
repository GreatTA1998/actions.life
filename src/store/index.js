import { writable } from 'svelte/store'
export { templates, deleteTemplate, updateTemplate } from './templatesStore.js'
export { timestamps, getMinutesDiff, calEarliestHHMM, calLastHHMM, totalMinutes, calSnapInterval } from './calendarTimestamps.js'
export { defaultPhotoLayout, getIconForLayout, photoLayoutOptions, PhotoLayout } from './photoLayout.js'
export { user } from './userStore.js'
export { clickedTask, openDetailedCard, closeDetailedCard, isDetailedCardOpen } from './detailedCardStore.js'

export const todoTasks = writable(null)
export { calendarTasks, calendarMemoryTree, tasksScheduledOn } from './calendarStore.js'
export const loadingTasks = writable(false);

export const doodleIcons = writable([])

export const hasFetchedUser = writable(false)
export const hasLogoExited = writable(false)

export const mostRecentlyCompletedTaskID = writable('')
export const isSnackbarHidden = writable(false)
export const mostRecentlyCompletedTaskName = writable('')

// 200/24 is the week view value
export const appModePixelsPerHour = writable(200 / 24)

export const hasInitialScrolled = writable(false)

export const showSnackbar = writable(false)

export const userInfoFromAuthProvider = writable({}) // test if the page data method works. If not, fallback to this solution for creating a mirror doc

export const activeDragItem = writable(null)
export const grabOffset = writable(0)

export const inclusiveWeekTodo = writable([])
export const todoMemoryTree = writable(null)

export const uniqueEvents = writable(null)