import { db } from '/src/lib/db/init.js' // not initialize db first will cause permission errors

import './themes'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { user } from './userStore.js'
import { reconstructTreeInMemory } from '/src/routes/[user]/components/ListsArea/service.js'
import { writable, get } from 'svelte/store'

export { timestamps, getMinutesDiff, calEarliestHHMM, calLastHHMM, totalMinutes, calSnapInterval } from '/src/routes/[user]/components/Calendar/timestamps.js'
export { defaultPhotoLayout, getIconForLayout, photoLayoutOptions, PhotoLayout } from './photoLayout.js'
export { user } from './userStore.js'

export const currentMode = writable('Week')

export const tasksCache = writable({})

// NOTE: this must be called for every listener, otherwise unexpected code that relies on `tasksCache` will break
// latest bug was due to `updateCache` not being used for the itinerary listener. 
// in the future, implement a Sentry-like system to email these errors, and also redesign the cache such that
// it's coupled with listeners
export function updateCache (tasks) {
  tasksCache.update(cache => {
    for (const task of tasks) {
      cache[task.id] = task
    }
    return cache
  })
}

export const clickedTaskID = writable('')
export const isTaskPopupOpen = writable(false)
export const willOpenDatePicker = writable(false)
export const settingsOpen = writable(false)
export const ancestralTree = writable(null)

let unsubAncestralTree = null

clickedTaskID.subscribe(async (taskID) => {
  if (unsubAncestralTree) unsubAncestralTree()
  if (!taskID) return

  const task = get(tasksCache)[taskID]
  const tasksCollection = collection(db, `users/${get(user).uid}/tasks`)
  const q = query(tasksCollection, where('rootID', '==', task.rootID))
  
  unsubAncestralTree = onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    updateCache(tasks)
    const memoryTrees = reconstructTreeInMemory(tasks) // TO-DO: tree singular is misleading
    ancestralTree.set(memoryTrees[0])
  }, (error) => {
    console.error('Error in task tree subscription:', error)
  })
})

export function openSettings () {
  settingsOpen.set(true)
}

export function closeSettings () {
  settingsOpen.set(false)
}

export function openTaskPopup(task) {
  clickedTaskID.set(task.id)
  isTaskPopupOpen.set(true)
}

export function closeTaskPopup() {
  isTaskPopupOpen.set(false)
  clickedTaskID.set('')
  willOpenDatePicker.set(false)
}

export const todoTasks = writable(null)

export const loadingTasks = writable(true)

export const doodleIcons = writable([])

export const hasFetchedUser = writable(false)
export const hasLogoExited = writable(false)

export const mostRecentlyCompletedTaskID = writable('')
export const isSnackbarHidden = writable(false)
export const mostRecentlyCompletedTaskName = writable('')

// 200/24 is the week view value
export const appModePixelsPerHour = writable(200 / 24)

export const showSnackbar = writable(false)

export const userInfoFromAuthProvider = writable({}) // test if the page data method works. If not, fallback to this solution for creating a mirror doc

export const inclusiveWeekTodo = writable([])
export const todoMemoryTree = writable(null)

export const uniqueEvents = writable(null)

// New snackbar store for undo operations
export const snackbarState = writable({
  isVisible: false,
  message: '',
  undoAction: null
})

// can't deprecate this until the undo snackbar is modernized with the Popover API
export const SNACKBAR_DURATION = 5000
let timeoutId = null

export function showUndoSnackbar(message, undoAction) {
  // Clear any existing timeout
  if (timeoutId) clearTimeout(timeoutId)
  
  // Show new snackbar
  snackbarState.set({
    isVisible: true,
    message,
    undoAction
  })

  // Set new timeout
  timeoutId = setTimeout(() => {
    snackbarState.update(s => ({ ...s, isVisible: false }))
  }, SNACKBAR_DURATION)
}

export function hideSnackbar() {
  if (timeoutId) clearTimeout(timeoutId)
  snackbarState.update(s => ({ ...s, isVisible: false }))
}
