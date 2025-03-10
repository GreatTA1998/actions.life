import { writable, derived } from 'svelte/store'
import { constructCalendarTrees, computeDateToTasksDict } from '/src/helpers/dataStructures.js'

export const calendarTasks = writable([])

// Store for tasks by date range (key: "startDate_endDate", value: array of tasks)
export const tasksByDateRange = writable({})

// Derived store for the calendar memory tree
export const calendarMemoryTree = derived(
  calendarTasks,
  $calendarTasks => constructCalendarTrees($calendarTasks)
)

export const tasksScheduledOn = writable({})

export function updateTasksForDateRange (newTasks, startDate, endDate) {
  // Skip if there are no tasks
  if (!newTasks || !Array.isArray(newTasks) || newTasks.length === 0) {
    return
  }
  
  // Convert flat array to tree structure
  const memoryTree = constructCalendarTrees(newTasks)

  const dateMapping = computeDateToTasksDict(memoryTree)
  
  // Update only the affected dates in the store
  tasksScheduledOn.update($tasksScheduledOn => {
    for (const [date, tasks] of Object.entries(dateMapping)) {
      $tasksScheduledOn[date] = tasks
    }
    
    return $tasksScheduledOn
  })
} 