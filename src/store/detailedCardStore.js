import { writable, derived } from 'svelte/store'

// Store for the currently clicked task that should be displayed in the DetailedCardPopup
export const clickedTask = writable({})

// Derived store to check if the popup is open (task has an id)
export const isDetailedCardOpen = derived(
  clickedTask,
  $clickedTask => $clickedTask && $clickedTask.id ? true : false
)

// Helper functions to open and close the popup
export function openDetailedCard(task) {
  clickedTask.set(task)
}

export function closeDetailedCard() {
  clickedTask.set({})
} 