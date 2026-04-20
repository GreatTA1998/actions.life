import './themes'
import { writable } from 'svelte/store'

export { calSnapInterval, timestamps } from '/src/routes/[user]/components/Calendar/timestamps.js'
export { defaultPhotoLayout, getIconForLayout, photoLayoutOptions, PhotoLayout } from './photoLayout.js'
export { user } from './userStore.js'
export { clickedTaskID, familyTree, openTaskPopup, closeTaskPopup } from './taskPopup.js'
export { tasksCache, updateCache, cleanupCache } from './tasksCache.js'

export const authUser = writable(null) // reactive version of firebaseAuth.currentUser (= to resultUser from onAuthStateChanged)
export const initialDataReady = writable(false)

export const allAccounts = writable([])
export const cals = writable({})
export const googleEventsByDate = writable({})

export const firebaseAuth = writable(null)
export const activeView = writable('CALENDAR')

export const doodleIcons = writable([])
export const authChecked = writable(false)
export const loggedIn = writable(false)
export const showSnackbar = writable(false)

// New snackbar store for undo operations
export const snackbarState = writable({
  isVisible: false,
  message: '',
  undoAction: null
})

// can't deprecate this until the undo snackbar is modernized with the Popover API
export const SNACKBAR_DURATION = 3000
let timeoutId = null

export function showUndoSnackbar(message, undoAction) {
  if (timeoutId) clearTimeout(timeoutId)
  
  snackbarState.set({
    isVisible: true,
    message,
    undoAction
  })

  timeoutId = setTimeout(() => {
    snackbarState.update(s => ({ ...s, isVisible: false }))
  }, SNACKBAR_DURATION)
}

export function hideSnackbar() {
  if (timeoutId) clearTimeout(timeoutId)
  snackbarState.update(s => ({ ...s, isVisible: false }))
}