import { writable, derived } from 'svelte/store'
import { constructCalendarTrees, computeDateToTasksDict } from '/src/helpers/dataStructures.js'

export const calendarTasks = writable([])
export const tasksScheduledOn = writable({})

export const calendarMemoryTree = derived(
  calendarTasks,
  $calendarTasks => constructCalendarTrees($calendarTasks)
)

export function updateTasksForDateRange (flatArray, startDate, endDate) {
  if (!flatArray || !Array.isArray(flatArray) || flatArray.length === 0) {
    return
  }
  const memoryTree = constructCalendarTrees(flatArray)
  const dateMapping = computeDateToTasksDict(memoryTree)
  
  tasksScheduledOn.update($tasksScheduledOn => {
    for (const [date, tasks] of Object.entries(dateMapping)) {
      $tasksScheduledOn[date] = tasks
    }
    return $tasksScheduledOn
  })
} 