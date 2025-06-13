import { writable } from 'svelte/store'

// Mock stores
export const activeDragItem = writable(null)

// Mock functions
export function openTaskPopup(task) {
  console.log('Demo: Would open task popup for:', task.name)
}

// Mock Task model
export const Task = {
  update: ({ id, keyValueChanges }) => {
    console.log('Demo: Would update task', id, 'with', keyValueChanges)
  },
  create: ({ id, newTaskObj }) => {
    console.log('Demo: Would create task', id, newTaskObj)
  }
}

// Mock utility functions
export function getRandomID() {
  return 'demo-' + Math.random().toString(36).substr(2, 9)
}

export function getRandomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16)
}

// Mock constants
export const WIDTHS = {
  SUBTASK_LEFT_MARGIN: 20,
  DROPZONE_LEFT_MARGIN: 10
} 