import { writable } from 'svelte/store'
export { templates, deleteTemplate, updateTemplate } from './templatesStore.js'
export { timestamps, getMinutesDiff, calEarliestHHMM, calLastHHMM, totalMinutes } from './calendarTimestamps.js'
export { user } from './userStore.js'

export const todoTasks = writable(null)
export const calendarTasks = writable(null)
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

export const userInfoFromAuthProvider = writable({})

export const whatIsBeingDragged = writable("")
export const whatIsBeingDraggedID = writable("")
export const whatIsBeingDraggedFullObj = writable(null)

export const inclusiveWeekTodo = writable([])

export const longHorizonTasks = writable([])

export const tasksScheduledOn = writable(null)

export const yPosWithinBlock = writable(0)

export const todoMemoryTree = writable(null)
export const calendarMemoryTree = writable(null)
export const uniqueEvents = writable(null)

export const daysToRender = writable([])