import { writable } from 'svelte/store'

export const clickedTaskID = writable('')

export const isDetailedCardOpen = writable(false)

export function openDetailedCard (task) {
  clickedTaskID.set(task.id)
  isDetailedCardOpen.set(true)
}

export function closeDetailedCard() {
  isDetailedCardOpen.set(false)
  // we purposely don't reset `clickedTaskID` as there may still be a PENDING save request for task notes 
  // after the user closes the detailed card, that still relies on the id
} 