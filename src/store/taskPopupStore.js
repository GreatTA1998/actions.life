import { writable } from 'svelte/store'

export const clickedTaskID = writable('')

export const isTaskPopupOpen = writable(false)

export function openTaskPopup (task) {
  clickedTaskID.set(task.id)
  isTaskPopupOpen.set(true)
}

export function closeTaskPopup() {
  isTaskPopupOpen.set(false)
  // we purposely don't reset `clickedTaskID` as there may still be a PENDING save request for task notes 
  // after the user closes the task popup, that still relies on the id
} 