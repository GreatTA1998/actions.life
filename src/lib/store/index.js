import { db } from '/src/lib/db/init.js' // not initialize db first will cause permission errors

import './themes'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { user } from './userStore.js'
import { reconstructTreeInMemory, findSubtree } from '/src/routes/[user]/components/ListsArea/service.js'
import { writable, get } from 'svelte/store'

export { calSnapInterval, timestamps } from '/src/routes/[user]/components/Calendar/timestamps.js'
export { defaultPhotoLayout, getIconForLayout, photoLayoutOptions, PhotoLayout } from './photoLayout.js'
export { user } from './userStore.js'

export const firebaseAuth = writable(null)
export const activeView = writable('CALENDAR')
export const tasksCache = writable({}) // id -> Task, '' -> undefined

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

export function cleanupCache (tasks) {
  tasksCache.update(cache => {
    for (const task of tasks) {
      delete cache[task.id]
    }
    return cache
  })
}

export const clickedTaskID = writable('')
export const willOpenDatePicker = writable(false)
export const settingsOpen = writable(false)
export const ancestralTree = writable(null)

let unsubAncestralTree = null

clickedTaskID.subscribe(async (taskID) => {
  if (unsubAncestralTree) unsubAncestralTree()
  if (!taskID) return

  // fetches all nodes belonging to the same rootID and constructs a single ancestral tree
  const task = get(tasksCache)[taskID]
  const tasksCollection = collection(db, `users/${get(user).uid}/tasks`)
  const q = query(tasksCollection, where('rootID', '==', task.rootID))
  
  unsubAncestralTree = onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    updateCache(tasks)

    const noImmediateSiblings = tasks.filter(t => (t.parentID === task.parentID && t.id === task.id) || t.parentID !== task.parentID)
    const memoryTrees = reconstructTreeInMemory(noImmediateSiblings) // TO-DO: rename to reconstructTrees (plural)
    ancestralTree.set(
      findSubtree({ 
        id: task.parentID || task.id, 
        tree: memoryTrees[0]
      })
    )
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

export function toggleSettings () {
  settingsOpen.set(!get(settingsOpen))
}

export function openTaskPopup (task) {
  const taskDialog = document.getElementById('task-dialog')
  taskDialog.showModal()

  clickedTaskID.set(task.id)
}

export function closeTaskPopup() {
  const taskDialog = document.getElementById('task-dialog')
  taskDialog.close()
  clickedTaskID.set('')
  willOpenDatePicker.set(false)
}

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
export const SNACKBAR_DURATION = 5000
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