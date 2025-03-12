import { writable } from 'svelte/store'

export const calendarTasks = writable([])

export const tasksScheduledOn = writable({}) 

export const headerExpanded = writable(true)